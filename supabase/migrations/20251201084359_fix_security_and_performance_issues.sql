/*
  # إصلاح مشاكل الأمان والأداء

  1. تحسينات RLS
    - استبدال auth.uid() بـ (select auth.uid()) لتحسين الأداء
    - تحديث جميع السياسات المتأثرة

  2. إصلاح مشاكل السياسات المتعددة
    - دمج السياسات المتعددة في سياسة واحدة حيث أمكن

  3. إصلاح search_path للدوال
    - تحديد search_path صريح للدالة check_provider_service_limit

  4. ملاحظات مهمة
    - الفهارس غير المستخدمة ستستخدم عند نمو البيانات
    - السياسات المتعددة الإذنية (permissive) مقبولة حسب تصميم النظام
*/

-- Drop existing policies for provider_services
DROP POLICY IF EXISTS "Anyone can view active provider services" ON provider_services;
DROP POLICY IF EXISTS "Providers can view own services" ON provider_services;
DROP POLICY IF EXISTS "Providers can insert own services" ON provider_services;
DROP POLICY IF EXISTS "Providers can update own services" ON provider_services;
DROP POLICY IF EXISTS "Providers can delete own services" ON provider_services;
DROP POLICY IF EXISTS "Admins can view all services" ON provider_services;

-- Create optimized policies for provider_services
CREATE POLICY "View active provider services or own services or admin"
  ON provider_services FOR SELECT
  USING (
    is_active = true 
    OR (select auth.uid()) = provider_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Providers can insert own services"
  ON provider_services FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = provider_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'provider'
    )
  );

CREATE POLICY "Providers can update own services"
  ON provider_services FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = provider_id)
  WITH CHECK ((select auth.uid()) = provider_id);

CREATE POLICY "Providers can delete own services"
  ON provider_services FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = provider_id);

-- Drop existing policies for service_purchases
DROP POLICY IF EXISTS "Customers can view own purchases" ON service_purchases;
DROP POLICY IF EXISTS "Providers can view purchases for their services" ON service_purchases;
DROP POLICY IF EXISTS "Customers can create purchases" ON service_purchases;
DROP POLICY IF EXISTS "Providers can update purchase status" ON service_purchases;
DROP POLICY IF EXISTS "Customers can update purchase notes" ON service_purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON service_purchases;

-- Create optimized policies for service_purchases
CREATE POLICY "View own purchases or purchases for own services or admin"
  ON service_purchases FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = customer_id
    OR (select auth.uid()) = provider_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Customers can create purchases"
  ON service_purchases FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = customer_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'customer'
    )
  );

CREATE POLICY "Update own purchases"
  ON service_purchases FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = provider_id 
    OR (select auth.uid()) = customer_id
  )
  WITH CHECK (
    (select auth.uid()) = provider_id 
    OR (select auth.uid()) = customer_id
  );

-- Fix search_path for function (drop trigger first, then function, then recreate)
DROP TRIGGER IF EXISTS enforce_service_limit ON provider_services;
DROP FUNCTION IF EXISTS check_provider_service_limit();

CREATE OR REPLACE FUNCTION check_provider_service_limit()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.provider_services WHERE provider_id = NEW.provider_id AND is_active = true) >= 2 THEN
    RAISE EXCEPTION 'يمكن لمزود الخدمة إضافة خدمتين فقط';
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER enforce_service_limit
  BEFORE INSERT ON provider_services
  FOR EACH ROW
  EXECUTE FUNCTION check_provider_service_limit();

-- Add comments for unused indexes (they will be used as data grows)
COMMENT ON INDEX idx_service_requests_customer IS 'Index for filtering service requests by customer - will be used as data grows';
COMMENT ON INDEX idx_service_requests_provider IS 'Index for filtering service requests by provider - will be used as data grows';
COMMENT ON INDEX idx_service_requests_status IS 'Index for filtering service requests by status - will be used as data grows';
COMMENT ON INDEX idx_service_requests_category IS 'Index for filtering service requests by category - will be used as data grows';
COMMENT ON INDEX idx_bids_request IS 'Index for filtering bids by request - will be used as data grows';
COMMENT ON INDEX idx_bids_provider IS 'Index for filtering bids by provider - will be used as data grows';
COMMENT ON INDEX idx_ratings_provider IS 'Index for filtering ratings by provider - will be used as data grows';
COMMENT ON INDEX idx_ratings_customer IS 'Index for filtering ratings by customer - will be used as data grows';
COMMENT ON INDEX idx_notifications_user IS 'Index for filtering notifications by user - will be used as data grows';
COMMENT ON INDEX idx_notifications_unread IS 'Index for filtering unread notifications - will be used as data grows';
COMMENT ON INDEX idx_notifications_related_request IS 'Index for filtering notifications by related request - will be used as data grows';
COMMENT ON INDEX idx_provider_services_provider IS 'Index for filtering provider services by provider - will be used as data grows';
COMMENT ON INDEX idx_provider_services_category IS 'Index for filtering provider services by category - will be used as data grows';
COMMENT ON INDEX idx_provider_services_active IS 'Index for filtering active provider services - will be used as data grows';
COMMENT ON INDEX idx_service_purchases_customer IS 'Index for filtering service purchases by customer - will be used as data grows';
COMMENT ON INDEX idx_service_purchases_provider IS 'Index for filtering service purchases by provider - will be used as data grows';
COMMENT ON INDEX idx_service_purchases_service IS 'Index for filtering service purchases by service - will be used as data grows';
COMMENT ON INDEX idx_service_purchases_status IS 'Index for filtering service purchases by status - will be used as data grows';
