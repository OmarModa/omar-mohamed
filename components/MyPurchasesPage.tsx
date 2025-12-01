import React, { useState, useEffect } from 'react';
import type { ServicePurchase } from '../types';
import { supabase } from '../lib/supabase';
import { CheckCircleIcon, PhoneIcon } from './icons';

interface MyPurchasesPageProps {
  currentUserUuid: string;
  currentUserRole: string;
}

interface PurchaseWithDetails extends ServicePurchase {
  serviceTitle: string;
  serviceDescription: string;
  providerName?: string;
  providerContact?: string;
  customerName?: string;
  customerContact?: string;
}

export const MyPurchasesPage: React.FC<MyPurchasesPageProps> = ({ currentUserUuid, currentUserRole }) => {
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPurchases();
  }, [currentUserUuid]);

  const loadPurchases = async () => {
    try {
      let query = supabase
        .from('service_purchases')
        .select(`
          *,
          provider_services!service_purchases_service_id_fkey (
            title,
            description
          ),
          provider:profiles!service_purchases_provider_id_fkey (
            name,
            contact_info
          ),
          customer:profiles!service_purchases_customer_id_fkey (
            name,
            contact_info
          )
        `);

      if (currentUserRole === 'customer') {
        query = query.eq('customer_id', currentUserUuid);
      } else if (currentUserRole === 'provider') {
        query = query.eq('provider_id', currentUserUuid);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setPurchases((data || []).map(p => ({
        id: p.id,
        serviceId: p.service_id,
        customerId: p.customer_id,
        providerId: p.provider_id,
        status: p.status,
        totalPrice: parseFloat(p.total_price),
        notes: p.notes,
        scheduledDate: p.scheduled_date,
        createdAt: new Date(p.created_at),
        completedAt: p.completed_at ? new Date(p.completed_at) : undefined,
        serviceTitle: p.provider_services?.title || '',
        serviceDescription: p.provider_services?.description || '',
        providerName: p.provider?.name,
        providerContact: p.provider?.contact_info,
        customerName: p.customer?.name,
        customerContact: p.customer?.contact_info
      })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePurchaseStatus = async (purchaseId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_purchases')
        .update(updates)
        .eq('id', purchaseId);

      if (error) throw error;

      setSuccess('تم تحديث حالة الطلب');
      loadPurchases();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };

    const labels: Record<string, string> = {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {currentUserRole === 'customer' ? 'حجوزاتي' : 'طلبات العملاء'}
        </h1>
        <p className="text-gray-600 mb-6">
          {currentUserRole === 'customer'
            ? 'إدارة حجوزاتك من الخدمات المباشرة'
            : 'إدارة طلبات الحجز من العملاء'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {purchases.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">
              {currentUserRole === 'customer'
                ? 'لا توجد حجوزات بعد'
                : 'لا توجد طلبات حجز بعد'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map(purchase => (
              <div key={purchase.id} className="border rounded-lg p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{purchase.serviceTitle}</h3>
                    <p className="text-gray-600 mt-1">{purchase.serviceDescription}</p>
                  </div>
                  {getStatusBadge(purchase.status)}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {currentUserRole === 'provider' && (
                    <div>
                      <p className="text-sm text-gray-500">العميل</p>
                      <p className="font-medium">{purchase.customerName}</p>
                      {purchase.customerContact && (
                        <div className="flex items-center gap-2 text-sm text-teal-600 mt-1">
                          <PhoneIcon className="w-4 h-4" />
                          <a href={`tel:${purchase.customerContact}`}>{purchase.customerContact}</a>
                        </div>
                      )}
                    </div>
                  )}

                  {currentUserRole === 'customer' && (
                    <div>
                      <p className="text-sm text-gray-500">مزود الخدمة</p>
                      <p className="font-medium">{purchase.providerName}</p>
                      {purchase.providerContact && (
                        <div className="flex items-center gap-2 text-sm text-teal-600 mt-1">
                          <PhoneIcon className="w-4 h-4" />
                          <a href={`tel:${purchase.providerContact}`}>{purchase.providerContact}</a>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500">المبلغ الإجمالي</p>
                    <p className="text-2xl font-bold text-teal-600">{purchase.totalPrice.toFixed(3)} د.ك</p>
                  </div>

                  {purchase.scheduledDate && (
                    <div>
                      <p className="text-sm text-gray-500">تاريخ الحجز المفضل</p>
                      <p className="font-medium">{new Date(purchase.scheduledDate).toLocaleDateString('ar-KW')}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500">تاريخ الطلب</p>
                    <p className="font-medium">{purchase.createdAt.toLocaleDateString('ar-KW')}</p>
                  </div>
                </div>

                {purchase.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-500 mb-1">ملاحظات العميل</p>
                    <p className="text-gray-700">{purchase.notes}</p>
                  </div>
                )}

                {currentUserRole === 'provider' && purchase.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => updatePurchaseStatus(purchase.id, 'confirmed')}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      تأكيد الحجز
                    </button>
                    <button
                      onClick={() => updatePurchaseStatus(purchase.id, 'cancelled')}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      رفض الحجز
                    </button>
                  </div>
                )}

                {currentUserRole === 'provider' && purchase.status === 'confirmed' && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={() => updatePurchaseStatus(purchase.id, 'completed')}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      تم إتمام الخدمة
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
