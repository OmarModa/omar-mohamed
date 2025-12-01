import React, { useState, useEffect } from 'react';
import type { ProviderService, ServicePurchase, PurchaseStatus } from '../types';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../constants';
import { WalletIcon, MapPinIcon } from './icons';

interface ServiceMarketPageProps {
  currentUserUuid: string;
  currentUserRole: string;
}

export const ServiceMarketPage: React.FC<ServiceMarketPageProps> = ({ currentUserUuid, currentUserRole }) => {
  const [services, setServices] = useState<(ProviderService & { providerName: string; providerRegion: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedService, setSelectedService] = useState<(ProviderService & { providerName: string }) | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({
    notes: '',
    scheduledDate: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadServices();
  }, [selectedCategory]);

  const loadServices = async () => {
    try {
      let query = supabase
        .from('provider_services')
        .select(`
          *,
          profiles!provider_services_provider_id_fkey (
            name,
            region
          )
        `)
        .eq('is_active', true);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setServices((data || []).map(s => ({
        id: s.id,
        providerId: s.provider_id,
        title: s.title,
        description: s.description,
        price: parseFloat(s.price),
        categoryId: s.category_id,
        imageUrl: s.image_url,
        isActive: s.is_active,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
        providerName: s.profiles?.name || 'مزود خدمة',
        providerRegion: s.profiles?.region || ''
      })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setError('');
    setSuccess('');

    try {
      const { error: insertError } = await supabase
        .from('service_purchases')
        .insert({
          service_id: selectedService.id,
          customer_id: currentUserUuid,
          provider_id: selectedService.providerId,
          status: 'pending',
          total_price: selectedService.price,
          notes: purchaseForm.notes || null,
          scheduled_date: purchaseForm.scheduledDate || null
        });

      if (insertError) throw insertError;

      setSuccess('تم إرسال طلب الحجز بنجاح! سيتواصل معك مزود الخدمة قريباً');
      setPurchaseForm({ notes: '', scheduledDate: '' });
      setShowPurchaseModal(false);
      setSelectedService(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openPurchaseModal = (service: ProviderService & { providerName: string }) => {
    setSelectedService(service);
    setShowPurchaseModal(true);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">متجر الخدمات المباشرة</h1>
        <p className="text-gray-600">تصفح واشتر الخدمات المعروضة من مزودي الخدمة مباشرة</p>
      </div>

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

      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg transition ${!selectedCategory ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          الكل
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg transition ${selectedCategory === cat.id ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-500">لا توجد خدمات متاحة حالياً في هذه الفئة</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => {
            const category = CATEGORIES.find(c => c.id === service.categoryId);
            const CategoryIcon = category?.icon;

            return (
              <div key={service.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                {service.imageUrl ? (
                  <img src={service.imageUrl} alt={service.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                    {CategoryIcon && <CategoryIcon className="w-20 h-20 text-white opacity-50" />}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{service.title}</h3>
                      <p className="text-sm text-gray-500">{category?.name}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{service.providerRegion}</span>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    مقدم من: <span className="font-medium">{service.providerName}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <WalletIcon className="w-5 h-5 text-teal-600" />
                      <span className="text-2xl font-bold text-teal-600">{service.price.toFixed(3)} د.ك</span>
                    </div>
                    {currentUserRole === 'customer' && (
                      <button
                        onClick={() => openPurchaseModal(service)}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
                      >
                        احجز الآن
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showPurchaseModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">تأكيد الحجز</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-lg mb-2">{selectedService.title}</h3>
              <p className="text-gray-600 mb-2">{selectedService.description}</p>
              <p className="text-sm text-gray-600">المزود: {selectedService.providerName}</p>
              <p className="text-2xl font-bold text-teal-600 mt-3">{selectedService.price.toFixed(3)} د.ك</p>
            </div>

            <form onSubmit={handlePurchase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الحجز المفضل (اختياري)
                </label>
                <input
                  type="date"
                  value={purchaseForm.scheduledDate}
                  onChange={e => setPurchaseForm({ ...purchaseForm, scheduledDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={purchaseForm.notes}
                  onChange={e => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                  placeholder="أي تفاصيل إضافية تود مشاركتها..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition"
                >
                  تأكيد الحجز
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setSelectedService(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
