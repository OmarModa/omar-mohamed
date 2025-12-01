/*
  # إضافة نظام الضمان ومعرض الصور للخدمات

  ## التغييرات الجديدة
  
  ### 1. جدول خيارات الضمان (warranty_options)
  يحتوي على الخيارات المتاحة للضمان التي يمكن للمزود اختيارها:
    - `id` (uuid, primary key)
    - `label_ar` (نص بالعربي مثل "ضمان 3 أيام")
    - `label_en` (نص بالإنجليزية)
    - `days` (عدد الأيام - null للخيارات الخاصة)
    - `type` (نوع الضمان: days_warranty, money_back, lifetime, no_warranty)
    - `description_ar` (وصف تفصيلي بالعربي)
    - `icon` (أيقونة اختيارية)
    - `is_active` (فعال أم لا)
    - `created_at` (تاريخ الإنشاء)

  ### 2. إضافة حقل الضمان لجدول provider_services
    - `warranty_option_id` (معرف خيار الضمان المختار)
    - علاقة مع جدول warranty_options

  ### 3. جدول معرض صور المزودين (provider_portfolio)
  يحتوي على صور قبل/بعد التي يرفعها المزود:
    - `id` (uuid, primary key)
    - `provider_id` (معرف المزود)
    - `title` (عنوان العمل)
    - `description` (وصف العمل)
    - `before_image_url` (رابط صورة قبل)
    - `after_image_url` (رابط صورة بعد)
    - `service_category` (فئة الخدمة)
    - `work_date` (تاريخ العمل)
    - `is_featured` (مميزة - تظهر في البداية)
    - `created_at` (تاريخ الإضافة)

  ## الأمان
    - تفعيل RLS على جميع الجداول الجديدة
    - المزودون يمكنهم فقط إدارة محتوياتهم الخاصة
    - الجميع يمكنهم مشاهدة المحتوى العام
*/

-- ============================================
-- 1. جدول خيارات الضمان
-- ============================================

CREATE TABLE IF NOT EXISTS warranty_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_ar text NOT NULL,
  label_en text NOT NULL,
  days integer,
  type text NOT NULL CHECK (type IN ('days_warranty', 'money_back', 'lifetime', 'no_warranty')),
  description_ar text,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE warranty_options ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم القراءة
CREATE POLICY "Anyone can view active warranty options"
  ON warranty_options FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- فقط المدراء يمكنهم الإضافة/التعديل
CREATE POLICY "Admins can manage warranty options"
  ON warranty_options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- إدراج الخيارات الافتراضية
INSERT INTO warranty_options (label_ar, label_en, days, type, description_ar, icon) VALUES
  ('بدون ضمان', 'No Warranty', NULL, 'no_warranty', 'لا يوجد ضمان على هذه الخدمة', '❌'),
  ('ضمان 3 أيام', '3 Days Warranty', 3, 'days_warranty', 'إذا حدثت أي مشكلة خلال 3 أيام، الإصلاح مجاني', '✅'),
  ('ضمان أسبوع', '7 Days Warranty', 7, 'days_warranty', 'إذا حدثت أي مشكلة خلال أسبوع، الإصلاح مجاني', '✅'),
  ('ضمان أسبوعين', '14 Days Warranty', 14, 'days_warranty', 'إذا حدثت أي مشكلة خلال أسبوعين، الإصلاح مجاني', '✅'),
  ('ضمان شهر', '30 Days Warranty', 30, 'days_warranty', 'إذا حدثت أي مشكلة خلال شهر، الإصلاح مجاني', '⭐'),
  ('ضمان 3 أشهر', '90 Days Warranty', 90, 'days_warranty', 'إذا حدثت أي مشكلة خلال 3 أشهر، الإصلاح مجاني', '⭐'),
  ('ضمان 6 أشهر', '6 Months Warranty', 180, 'days_warranty', 'إذا حدثت أي مشكلة خلال 6 أشهر، الإصلاح مجاني', '⭐⭐'),
  ('ضمان سنة', '1 Year Warranty', 365, 'days_warranty', 'إذا حدثت أي مشكلة خلال سنة كاملة، الإصلاح مجاني', '⭐⭐⭐'),
  ('ضمان استرجاع المال', 'Money Back Guarantee', NULL, 'money_back', 'إذا لم تكن راضياً عن الخدمة، نسترجع لك مالك بالكامل', '💰'),
  ('ضمان مدى الحياة', 'Lifetime Warranty', NULL, 'lifetime', 'ضمان مدى الحياة على هذه الخدمة', '♾️')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. إضافة حقل الضمان لجدول provider_services
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'provider_services' AND column_name = 'warranty_option_id'
  ) THEN
    ALTER TABLE provider_services 
    ADD COLUMN warranty_option_id uuid REFERENCES warranty_options(id);
  END IF;
END $$;

-- إنشاء فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_provider_services_warranty 
  ON provider_services(warranty_option_id);

-- ============================================
-- 3. جدول معرض صور المزودين (Before/After)
-- ============================================

CREATE TABLE IF NOT EXISTS provider_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  before_image_url text NOT NULL,
  after_image_url text NOT NULL,
  service_category text,
  work_date date DEFAULT CURRENT_DATE,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE provider_portfolio ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم مشاهدة المعرض
CREATE POLICY "Anyone can view portfolio"
  ON provider_portfolio FOR SELECT
  TO authenticated, anon
  USING (true);

-- المزودون يمكنهم إضافة صور لمعرضهم الخاص
CREATE POLICY "Providers can insert their own portfolio"
  ON provider_portfolio FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = provider_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'provider' = ANY(profiles.available_roles)
    )
  );

-- المزودون يمكنهم تعديل وحذف صورهم الخاصة
CREATE POLICY "Providers can update their own portfolio"
  ON provider_portfolio FOR UPDATE
  TO authenticated
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can delete their own portfolio"
  ON provider_portfolio FOR DELETE
  TO authenticated
  USING (auth.uid() = provider_id);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_portfolio_provider 
  ON provider_portfolio(provider_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_category 
  ON provider_portfolio(service_category);

CREATE INDEX IF NOT EXISTS idx_portfolio_featured 
  ON provider_portfolio(is_featured, created_at DESC);

-- ============================================
-- 4. تحديث أنواع قاعدة البيانات (للـ TypeScript)
-- ============================================

COMMENT ON TABLE warranty_options IS 'خيارات الضمان المتاحة للخدمات';
COMMENT ON TABLE provider_portfolio IS 'معرض صور قبل/بعد للمزودين';
COMMENT ON COLUMN provider_services.warranty_option_id IS 'خيار الضمان المختار للخدمة';
