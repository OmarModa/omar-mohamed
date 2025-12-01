import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface WarrantyOption {
  id: string;
  label_ar: string;
  label_en: string;
  days: number | null;
  type: 'days_warranty' | 'money_back' | 'lifetime' | 'no_warranty';
  description_ar: string | null;
  icon: string | null;
}

interface WarrantySelectorProps {
  value: string | null;
  onChange: (warrantyId: string | null) => void;
}

export const WarrantySelector: React.FC<WarrantySelectorProps> = ({ value, onChange }) => {
  const [warranties, setWarranties] = useState<WarrantyOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarranties();
  }, []);

  const loadWarranties = async () => {
    try {
      const { data, error } = await supabase
        .from('warranty_options')
        .select('*')
        .eq('is_active', true)
        .order('days', { ascending: true, nullsFirst: true });

      if (error) throw error;
      setWarranties(data || []);
    } catch (err) {
      console.error('خطأ في تحميل خيارات الضمان:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">جاري تحميل خيارات الضمان...</div>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        نوع الضمان
      </label>
      <div className="space-y-2">
        {warranties.map((warranty) => (
          <label
            key={warranty.id}
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
              value === warranty.id
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-teal-300'
            }`}
          >
            <input
              type="radio"
              name="warranty"
              value={warranty.id}
              checked={value === warranty.id}
              onChange={() => onChange(warranty.id)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {warranty.icon && <span className="text-xl">{warranty.icon}</span>}
                <span className="font-semibold text-gray-800">{warranty.label_ar}</span>
              </div>
              {warranty.description_ar && (
                <p className="text-sm text-gray-600 mt-1">{warranty.description_ar}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export const WarrantyBadge: React.FC<{ warrantyId: string | null }> = ({ warrantyId }) => {
  const [warranty, setWarranty] = useState<WarrantyOption | null>(null);

  useEffect(() => {
    if (!warrantyId) return;

    const loadWarranty = async () => {
      const { data } = await supabase
        .from('warranty_options')
        .select('*')
        .eq('id', warrantyId)
        .single();

      if (data) setWarranty(data);
    };

    loadWarranty();
  }, [warrantyId]);

  if (!warranty) return null;

  const getBadgeColor = () => {
    switch (warranty.type) {
      case 'lifetime':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'money_back':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'days_warranty':
        if (warranty.days && warranty.days >= 90) {
          return 'bg-blue-100 text-blue-800 border-blue-300';
        }
        return 'bg-teal-100 text-teal-800 border-teal-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm font-medium ${getBadgeColor()}`}>
      {warranty.icon && <span>{warranty.icon}</span>}
      <span>{warranty.label_ar}</span>
    </div>
  );
};
