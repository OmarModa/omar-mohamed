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

interface ProviderPortfolioProps {
  providerId: string;
}

export const ProviderPortfolio: React.FC<ProviderPortfolioProps> = ({ providerId }) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

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
    } catch (err) {
      console.error('خطأ في تحميل معرض الأعمال:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = CATEGORIES.find(c => c.id === parseInt(categoryId));
    return category?.name;
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">جاري التحميل...</div>;
  }

  if (portfolio.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">معرض الأعمال السابقة</h2>
      <p className="text-gray-600 mb-6">صور قبل وبعد من أعمال سابقة</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolio.map((item) => (
          <div key={item.id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
            {item.is_featured && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold px-4 py-1 text-center">
                ⭐ عمل مميز
              </div>
            )}

            <div className="relative">
              <div className="grid grid-cols-2 gap-1">
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedImage({ url: item.before_image_url, title: `${item.title} - قبل` })}
                >
                  <img
                    src={item.before_image_url}
                    alt={`${item.title} - قبل`}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                    <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition">🔍</span>
                  </div>
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    قبل
                  </div>
                </div>
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedImage({ url: item.after_image_url, title: `${item.title} - بعد` })}
                >
                  <img
                    src={item.after_image_url}
                    alt={`${item.title} - بعد`}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                    <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition">🔍</span>
                  </div>
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    بعد
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
              {item.description && (
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{item.description}</p>
              )}
              <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                {item.service_category && (
                  <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded">
                    {getCategoryName(item.service_category)}
                  </span>
                )}
                <span>{new Date(item.work_date).toLocaleDateString('ar-KW')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-bold">{selectedImage.title}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-white text-3xl hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};
