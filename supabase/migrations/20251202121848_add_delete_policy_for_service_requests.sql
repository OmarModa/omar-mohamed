/*
  # إضافة سياسة حذف لطلبات الخدمة

  ## التعديلات
  - إضافة سياسة RLS للسماح للعميل بحذف طلباته الخاصة
  - الحذف متاح فقط للطلبات المفتوحة (status = 'open')
  - يجب أن يكون المستخدم هو صاحب الطلب (customer_id = auth.uid())

  ## الأمان
  - يمنع حذف طلبات الآخرين
  - يمنع حذف الطلبات المعينة أو المكتملة
*/

-- إضافة سياسة حذف للطلبات
CREATE POLICY "Users can delete their own open requests"
  ON service_requests
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = customer_id 
    AND status = 'open'
  );
