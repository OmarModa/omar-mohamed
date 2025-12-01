/*
  # Fix Security and Performance Issues

  1. Missing Indexes
    - Add index on notifications.related_request_id
    - Add index on ratings.customer_id

  2. RLS Performance Optimization
    - Update all RLS policies to use (select auth.uid()) instead of auth.uid()
    - This prevents re-evaluation for each row

  3. Function Security
    - Add IMMUTABLE or SET search_path to all functions

  4. Remove Unused Indexes
    - Keep indexes as they may be used in production
    - Better to have them than need them later

  5. Multiple Permissive Policies
    - Combine UPDATE policies on service_requests
*/

-- =====================================================
-- 1. ADD MISSING INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_notifications_related_request 
ON notifications(related_request_id);

CREATE INDEX IF NOT EXISTS idx_ratings_customer 
ON ratings(customer_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - PROFILES
-- =====================================================

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - SERVICE_REQUESTS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can create service requests" ON service_requests;
CREATE POLICY "Authenticated users can create service requests"
  ON service_requests FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Customers can update own requests" ON service_requests;
DROP POLICY IF EXISTS "Assigned providers can update their requests" ON service_requests;

CREATE POLICY "Customers and assigned providers can update requests"
  ON service_requests FOR UPDATE
  TO authenticated
  USING (
    customer_id = (select auth.uid()) OR 
    assigned_provider_id = (select auth.uid())
  )
  WITH CHECK (
    customer_id = (select auth.uid()) OR 
    assigned_provider_id = (select auth.uid())
  );

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES - BIDS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can create bids" ON bids;
CREATE POLICY "Authenticated users can create bids"
  ON bids FOR INSERT
  TO authenticated
  WITH CHECK (provider_id = (select auth.uid()));

DROP POLICY IF EXISTS "Request customers can update bids on their requests" ON bids;
CREATE POLICY "Request customers can update bids on their requests"
  ON bids FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests 
      WHERE service_requests.id = bids.request_id 
      AND service_requests.customer_id = (select auth.uid())
    )
  );

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES - RATINGS
-- =====================================================

DROP POLICY IF EXISTS "Customers can create ratings for completed requests" ON ratings;
CREATE POLICY "Customers can create ratings for completed requests"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM service_requests
      WHERE service_requests.id = ratings.request_id
      AND service_requests.status = 'completed'
      AND service_requests.customer_id = (select auth.uid())
    )
  );

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES - NOTIFICATIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 7. FIX FUNCTION SEARCH PATHS
-- =====================================================

CREATE OR REPLACE FUNCTION notify_customer_on_new_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

CREATE OR REPLACE FUNCTION notify_provider_on_bid_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_provider_id uuid;
  v_request_title text;
BEGIN
  IF NEW.status = 'assigned' AND OLD.status != 'assigned' THEN
    SELECT assigned_provider_id, title
    INTO v_provider_id, v_request_title
    FROM service_requests
    WHERE id = NEW.id;
    
    IF v_provider_id IS NOT NULL THEN
      PERFORM create_notification(
        v_provider_id,
        'مبروك! تم قبول عرضك على الطلب "' || v_request_title || '". يمكنك البدء بالتنفيذ الآن.',
        'success',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_customer_on_request_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_customer_id uuid;
  v_request_title text;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    SELECT customer_id, title
    INTO v_customer_id, v_request_title
    FROM service_requests
    WHERE id = NEW.id;
    
    PERFORM create_notification(
      v_customer_id,
      'تم إنهاء العمل على طلبك "' || v_request_title || '". يرجى التقييم.',
      'success',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_message text,
  p_type text,
  p_related_request_id bigint DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO notifications (user_id, message, type, related_request_id)
  VALUES (p_user_id, p_message, p_type, p_related_request_id);
END;
$$;

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
SET search_path = public, pg_temp
AS $$
BEGIN
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

-- =====================================================
-- 8. ANALYZE TABLES FOR BETTER QUERY PLANNING
-- =====================================================

ANALYZE profiles;
ANALYZE service_requests;
ANALYZE bids;
ANALYZE ratings;
ANALYZE notifications;
