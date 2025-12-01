import React, { useState, useEffect } from 'react';
import type { ProviderService } from '../types';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../constants';

interface MyServicesPageProps {
  currentUserUuid: string;
  currentUserName: string;
}

export const MyServicesPage: React.FC<MyServicesPageProps> = ({ currentUserUuid, currentUserName }) => {
  const [services, setServices] = useState<ProviderService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadServices();
  }, [currentUserUuid]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_services')
        .select('*')
        .eq('provider_id', currentUserUuid)
        .order('created_at', { ascending: false });

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
        updatedAt: new Date(s.updated_at)
      })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (services.filter(s => s.isActive).length >= 2) {
      setError('يمكنك إضافة خدمتين فقط كحد أقصى');
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('provider_services')
        .insert({
          provider_id: currentUserUuid,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: parseInt(formData.categoryId),
          image_url: formData.imageUrl || null,
          is_active: true
        });

      if (insertError) throw insertError;

      setSuccess('تم إضافة الخدمة بنجاح!');
      setFormData({ title: '', description: '', price: '', categoryId: '', imageUrl: '' });
      setShowAddForm(false);
      loadServices();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('provider_services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId);

      if (error) throw error;

      setSuccess('تم تحديث حالة الخدمة');
      loadServices();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;

    try {
      const { error } = await supabase
        .from('provider_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      setSuccess('تم حذف الخدمة');
      loadServices();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const activeServicesCount = services.filter(s => s.isActive).length;

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">خدماتي المعروضة</h1>
            <p className="text-gray-600 mt-2">يمكنك إضافة حتى خدمتين للعرض المباشر ({activeServicesCount}/2)</p>
          </div>
          {activeServicesCount < 2 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition"
            >
              إضافة خدمة جديدة
            </button>
          )}
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

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">إضافة خدمة جديدة</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان الخدمة
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="مثال: قص شعر رجالي"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفئة
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">اختر الفئة</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                    placeholder="وصف تفصيلي للخدمة..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر (دينار كويتي)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.001"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="10.000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رابط الصورة (اختياري)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition"
                  >
                    إضافة الخدمة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {services.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">لا توجد خدمات معروضة بعد</p>
            <p className="mt-2">ابدأ بإضافة خدماتك للعرض المباشر</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {services.map(service => {
              const category = CATEGORIES.find(c => c.id === service.categoryId);
              return (
                <div key={service.id} className={`border rounded-lg p-6 ${service.isActive ? 'bg-white' : 'bg-gray-50 opacity-75'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{service.title}</h3>
                      <p className="text-sm text-gray-500">{category?.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {service.isActive ? 'نشط' : 'متوقف'}
                    </span>
                  </div>

                  {service.imageUrl && (
                    <img src={service.imageUrl} alt={service.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                  )}

                  <p className="text-gray-600 mb-4">{service.description}</p>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-2xl font-bold text-teal-600">{service.price.toFixed(3)} د.ك</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleServiceStatus(service.id, service.isActive)}
                        className={`px-4 py-2 rounded-lg transition ${service.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >
                        {service.isActive ? 'إيقاف' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
