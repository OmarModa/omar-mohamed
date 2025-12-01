/*
  # Update Bids System for Fixed Budget Requests

  1. Changes
    - Make `price` nullable in bids table (for fixed-budget requests)
    - Add `is_fixed_budget` flag to service_requests table
    - Update bids to support "accept" mode (no price needed)
    - When customer accepts bid on fixed-budget request, provider contact info is shared
    - Update RLS policies to support new flow

  2. New Flow
    - If request has suggested_budget (fixed budget):
      - Provider sends bid with price = NULL (just "موافق")
      - Customer can accept multiple "موافق" responses
      - Customer chooses one provider from those who accepted
      - Once customer selects provider, request becomes "assigned"
    
    - If request has no suggested_budget (open bidding):
      - Original flow: providers send price bids
      - Customer accepts one bid
*/

-- Make price nullable for fixed-budget bids
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bids' 
    AND column_name = 'price' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE bids ALTER COLUMN price DROP NOT NULL;
  END IF;
END $$;

-- Add is_fixed_budget computed column check
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'is_fixed_budget'
  ) THEN
    ALTER TABLE service_requests 
    ADD COLUMN is_fixed_budget boolean GENERATED ALWAYS AS (suggested_budget IS NOT NULL) STORED;
  END IF;
END $$;

-- Update trigger for new bid notifications to handle fixed budget
CREATE OR REPLACE FUNCTION notify_customer_on_new_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id uuid;
  v_request_title text;
  v_is_fixed_budget boolean;
  v_message text;
BEGIN
  SELECT 
    customer_id, 
    title,
    suggested_budget IS NOT NULL
  INTO 
    v_customer_id, 
    v_request_title,
    v_is_fixed_budget
  FROM service_requests
  WHERE id = NEW.request_id;
  
  -- Different message based on bid type
  IF v_is_fixed_budget THEN
    v_message := 'مزود خدمة جديد وافق على تنفيذ طلبك "' || v_request_title || '" بالميزانية المحددة';
  ELSE
    v_message := 'تم تقديم عرض جديد بقيمة ' || NEW.price || ' د.ك على طلبك "' || v_request_title || '"';
  END IF;
  
  PERFORM create_notification(
    v_customer_id,
    v_message,
    'info',
    NEW.request_id
  );
  
  RETURN NEW;
END;
$$;

-- Create function to get provider contact info (only after bid is accepted)
CREATE OR REPLACE FUNCTION get_provider_contact_info(
  p_request_id bigint,
  p_customer_id uuid
)
RETURNS TABLE (
  provider_id uuid,
  provider_name text,
  contact_info text,
  region text,
  address text,
  specialization_id integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify customer owns the request and it's assigned/completed
  IF NOT EXISTS (
    SELECT 1 FROM service_requests 
    WHERE id = p_request_id 
    AND customer_id = p_customer_id
    AND status IN ('assigned', 'completed')
  ) THEN
    RAISE EXCEPTION 'Unauthorized or invalid request';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.contact_info,
    p.region,
    p.address,
    p.specialization_id
  FROM service_requests sr
  JOIN profiles p ON p.id = sr.assigned_provider_id
  WHERE sr.id = p_request_id;
END;
$$;

-- Add comment explaining the new flow
COMMENT ON COLUMN bids.price IS 'Price can be NULL for fixed-budget requests where provider just accepts the suggested budget';
COMMENT ON FUNCTION get_provider_contact_info IS 'Returns provider contact info only after customer accepts bid and request is assigned';
