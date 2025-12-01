import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../constants';

interface PortfolioItem {
  id: string;
  provider_id: string;
  title: string;
  description: string | null;
  before_image_url: string;
  after_image_url: string;
  service_category: string | null;
  work_date: string;
  is_featured: boolean;
  created_at: string;
}

interface PortfolioManagerProps {
  providerId: string;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({ providerId }) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    beforeImageUrl: '',
    afterImageUrl: '',
    serviceCategory: '',
    workDate: new Date().toISOString().split('T')[0],
    isFeatured: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPortfolio();
  }, [providerId]);

  const loadPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_portfolio')
        .select('*')
        .eq('provider_id', providerId)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolio(data || []);
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

    try {
      const { error: insertError } = await supabase
        .from('provider_portfolio')
        .insert({
          provider_id: providerId,
          title: formData.title,
          description: formData.description || null,
          before_image_url: formData.beforeImageUrl,
          after_image_url: formData.afterImageUrl,
          service_category: formData.serviceCategory || null,
          work_date: formData.workDate,
          is_featured: formData.isFeatured
        });

      if (insertError) throw insertError;

      setSuccess('تم إضافة العمل بنجاح!');
      setFormData({
        title: '',
        description: '',
        beforeImageUrl: '',
        afterImageUrl: '',
        serviceCategory: '',
        workDate: new Date().toISOString().split('T')[0],
        isFeatured: false
      });
      setShowAddForm(false);
      loadPortfolio();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العمل؟')) return;

    try {
      const { error } = await supabase
        .from('provider_portfolio')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setSuccess('تم حذف العمل');
      loadPortfolio();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleFeatured = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('provider_portfolio')
        .update({ is_featured: !currentStatus })
        .eq('id', itemId);

      if (error) throw error;

      setSuccess('تم تحديث الحالة');
      loadPortfolio();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">جاري التحميل...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">معرض أعمالي (قبل/بعد)</h2>
          <p className="text-gray-600 mt-1">اعرض صور أعمالك السابقة لزيادة ثقة العملاء</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition"
        >
          إضافة عمل جديد
        </button>
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
            <h3 className="text-2xl font-bold mb-4">إضافة عمل جديد</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان العمل
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="مثال: إصلاح حنفية المطبخ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف (اختياري)
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20"
                  placeholder="وصف تفصيلي للعمل..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة (اختياري)
                </label>
                <select
                  value={formData.serviceCategory}
                  onChange={e => setFormData({ ...formData, serviceCategory: e.target.value })}
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
                  رابط صورة "قبل"
                </label>
                <input
                  type="url"
                  required
                  value={formData.beforeImageUrl}
                  onChange={e => setFormData({ ...formData, beforeImageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com/before.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط صورة "بعد"
                </label>
                <input
                  type="url"
                  required
                  value={formData.afterImageUrl}
                  onChange={e => setFormData({ ...formData, afterImageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com/after.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ العمل
                </label>
                <input
                  type="date"
                  value={formData.workDate}
                  onChange={e => setFormData({ ...formData, workDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm text-gray-700">
                  عمل مميز (يظهر في البداية)
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition"
                >
                  إضافة العمل
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

      {portfolio.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          لم تقم بإضافة أي أعمال بعد. ابدأ بإضافة صور قبل/بعد لأعمالك!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolio.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
              {item.is_featured && (
                <div className="bg-yellow-400 text-gray-800 text-sm font-bold px-4 py-1 text-center">
                  ⭐ عمل مميز
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2 text-center">قبل</p>
                  <img
                    src={item.before_image_url}
                    alt="قبل"
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2 text-center">بعد</p>
                  <img
                    src={item.after_image_url}
                    alt="بعد"
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              </div>
              <div className="p-4 border-t">
                <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-600 text-sm mt-2">{item.description}</p>
                )}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    {new Date(item.work_date).toLocaleDateString('ar-KW')}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFeatured(item.id, item.is_featured)}
                      className="text-sm px-3 py-1 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                      title={item.is_featured ? 'إلغاء التمييز' : 'جعله مميزاً'}
                    >
                      {item.is_featured ? '★' : '☆'}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
