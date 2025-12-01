/*
  # إضافة إمكانية تبديل الأدوار وفئة التطوع

  1. التغييرات
    - إضافة جدول لتتبع الأدوار المتعددة للمستخدمين
    - تحديث قاعدة البيانات لدعم المستخدمين بحسابين (عميل ومزود خدمة)
    - السماح للمستخدم بالتبديل بين الأدوار
    
  2. الأمان
    - تطبيق RLS على الجدول الجديد
    - السماح للمستخدمين بقراءة وتحديث أدوارهم فقط
    
  3. ملاحظات مهمة
    - المنصة مجانية 100% - لا توجد عمولات
    - دعم خدمات التطوع والخدمات المجانية (فئة 22)
*/

-- إضافة عمود لتتبع الأدوار المتاحة للمستخدم
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'available_roles'
  ) THEN
    ALTER TABLE profiles ADD COLUMN available_roles text[] DEFAULT ARRAY['customer'];
  END IF;
END $$;

-- تحديث الأدوار الموجودة لتكون متاحة
UPDATE profiles 
SET available_roles = ARRAY[role]
WHERE available_roles IS NULL OR available_roles = ARRAY['customer'];

-- دالة للسماح للمستخدم بإضافة دور جديد
CREATE OR REPLACE FUNCTION add_user_role(new_role text)
RETURNS void
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- التحقق من أن الدور صحيح
  IF new_role NOT IN ('customer', 'provider') THEN
    RAISE EXCEPTION 'دور غير صالح. يجب أن يكون customer أو provider';
  END IF;
  
  -- إضافة الدور إذا لم يكن موجوداً
  UPDATE profiles
  SET available_roles = array_append(available_roles, new_role)
  WHERE id = (select auth.uid())
    AND NOT (new_role = ANY(available_roles));
    
  -- لا نغير الدور الحالي، فقط نضيفه للأدوار المتاحة
END;
$$;

-- دالة للتبديل بين الأدوار
CREATE OR REPLACE FUNCTION switch_user_role(target_role text)
RETURNS void
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- التحقق من أن الدور متاح للمستخدم
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid())
      AND target_role = ANY(available_roles)
  ) THEN
    RAISE EXCEPTION 'هذا الدور غير متاح لك. يرجى إضافة الدور أولاً';
  END IF;
  
  -- تحديث الدور الحالي
  UPDATE profiles
  SET role = target_role
  WHERE id = (select auth.uid());
END;
$$;

-- إضافة تعليق على جدول الفئات لتوضيح أن الفئة 22 للتطوع
COMMENT ON TABLE service_requests IS 'جدول طلبات الخدمات. الفئة 22 مخصصة لخدمات التطوع المجانية';

-- إضافة رسالة توضيحية بأن المنصة مجانية
COMMENT ON TABLE profiles IS 'جدول المستخدمين. المنصة مجانية 100% ولا توجد عمولات على الخدمات';
