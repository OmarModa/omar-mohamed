/*
  # إضافة جدول الخدمات المباشرة لمزودي الخدمة

  1. جدول جديد
    - `provider_services`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, foreign key to profiles)
      - `title` (text) - اسم الخدمة
      - `description` (text) - وصف الخدمة
      - `price` (numeric) - السعر بالدينار الكويتي
      - `category_id` (integer, foreign key to categories)
      - `image_url` (text, optional) - صورة الخدمة
      - `is_active` (boolean) - هل الخدمة متاحة
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. جدول طلبات الشراء المباشر
    - `service_purchases`
      - `id` (uuid, primary key)
      - `service_id` (uuid, foreign key to provider_services)
      - `customer_id` (uuid, foreign key to profiles)
      - `provider_id` (uuid, foreign key to profiles)
      - `status` (text) - pending, confirmed, completed, cancelled
      - `total_price` (numeric)
      - `notes` (text, optional) - ملاحظات العميل
      - `scheduled_date` (date, optional) - تاريخ الحجز
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz, optional)

  3. الأمان
    - تفعيل RLS على الجداول الجديدة
    - سياسات للقراءة والكتابة حسب الدور

  4. ملاحظات مهمة
    - يمكن لمزود الخدمة إضافة حتى خدمتين فقط
    - الأسعار محددة مسبقاً من المزود
    - العملاء يمكنهم الشراء/الحجز مباشرة
*/

-- Create provider_services table
CREATE TABLE IF NOT EXISTS provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10,3) NOT NULL CHECK (price > 0),
  category_id integer NOT NULL REFERENCES categories(id),
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraint to limit services per provider to 2
CREATE UNIQUE INDEX IF NOT EXISTS provider_services_limit 
ON provider_services (provider_id, id);

-- Create function to check service limit
CREATE OR REPLACE FUNCTION check_provider_service_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM provider_services WHERE provider_id = NEW.provider_id AND is_active = true) >= 2 THEN
    RAISE EXCEPTION 'يمكن لمزود الخدمة إضافة خدمتين فقط';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce limit
DROP TRIGGER IF EXISTS enforce_service_limit ON provider_services;
CREATE TRIGGER enforce_service_limit
  BEFORE INSERT ON provider_services
  FOR EACH ROW
  EXECUTE FUNCTION check_provider_service_limit();

-- Create service_purchases table
CREATE TABLE IF NOT EXISTS service_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES provider_services(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  total_price numeric(10,3) NOT NULL,
  notes text,
  scheduled_date date,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_services

-- Everyone can view active services
CREATE POLICY "Anyone can view active provider services"
  ON provider_services FOR SELECT
  USING (is_active = true);

-- Providers can view their own services (even inactive)
CREATE POLICY "Providers can view own services"
  ON provider_services FOR SELECT
  TO authenticated
  USING (auth.uid() = provider_id);

-- Providers can insert their own services
CREATE POLICY "Providers can insert own services"
  ON provider_services FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = provider_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'provider'
    )
  );

-- Providers can update their own services
CREATE POLICY "Providers can update own services"
  ON provider_services FOR UPDATE
  TO authenticated
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

-- Providers can delete their own services
CREATE POLICY "Providers can delete own services"
  ON provider_services FOR DELETE
  TO authenticated
  USING (auth.uid() = provider_id);

-- RLS Policies for service_purchases

-- Customers can view their own purchases
CREATE POLICY "Customers can view own purchases"
  ON service_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

-- Providers can view purchases for their services
CREATE POLICY "Providers can view purchases for their services"
  ON service_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = provider_id);

-- Customers can create purchases
CREATE POLICY "Customers can create purchases"
  ON service_purchases FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'customer'
    )
  );

-- Providers can update purchase status
CREATE POLICY "Providers can update purchase status"
  ON service_purchases FOR UPDATE
  TO authenticated
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

-- Customers can update their purchase notes
CREATE POLICY "Customers can update purchase notes"
  ON service_purchases FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- Admins can view all
CREATE POLICY "Admins can view all services"
  ON provider_services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all purchases"
  ON service_purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_category ON provider_services(category_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_active ON provider_services(is_active);
CREATE INDEX IF NOT EXISTS idx_service_purchases_customer ON service_purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_purchases_provider ON service_purchases(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_purchases_service ON service_purchases(service_id);
CREATE INDEX IF NOT EXISTS idx_service_purchases_status ON service_purchases(status);
