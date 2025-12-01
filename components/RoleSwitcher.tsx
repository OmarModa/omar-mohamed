import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { UserIcon, CheckCircleIcon } from './icons';

interface RoleSwitcherProps {
  currentRole: UserRole;
  currentUserUuid: string;
  onRoleChanged: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  currentUserUuid,
  onRoleChanged
}) => {
  const [availableRoles, setAvailableRoles] = useState<string[]>([currentRole]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddRole, setShowAddRole] = useState(false);

  useEffect(() => {
    loadAvailableRoles();
  }, [currentUserUuid]);

  const loadAvailableRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('available_roles')
        .eq('id', currentUserUuid)
        .single();

      if (error) throw error;
      if (data?.available_roles) {
        setAvailableRoles(data.available_roles);
      }
    } catch (err: any) {
      console.error('Error loading roles:', err);
    }
  };

  const handleAddRole = async (newRole: 'customer' | 'provider') => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.rpc('add_user_role', {
        new_role: newRole
      });

      if (error) throw error;

      setSuccess(`تم إضافة دور ${newRole === 'provider' ? 'مزود خدمة' : 'عميل'} بنجاح!`);
      await loadAvailableRoles();
      setShowAddRole(false);

      setTimeout(() => {
        onRoleChanged();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'فشل إضافة الدور');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = async (targetRole: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.rpc('switch_user_role', {
        target_role: targetRole
      });

      if (error) throw error;

      setSuccess('تم تبديل الدور بنجاح!');
      setTimeout(() => {
        onRoleChanged();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'فشل تبديل الدور');
    } finally {
      setLoading(false);
    }
  };

  const canAddProvider = !availableRoles.includes('provider');
  const canAddCustomer = !availableRoles.includes('customer');
  const hasMultipleRoles = availableRoles.length > 1;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-lg border-2 border-teal-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-teal-600" />
          <h3 className="text-lg font-bold text-gray-800">إدارة الأدوار</h3>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-4 flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-3">
          الدور الحالي: <span className="font-bold text-teal-600">
            {currentRole === 'customer' ? 'عميل' : currentRole === 'provider' ? 'مزود خدمة' : 'مسؤول'}
          </span>
        </p>

        {hasMultipleRoles && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-2">التبديل إلى:</p>
            {availableRoles
              .filter(role => role !== currentRole && role !== 'admin')
              .map(role => (
                <button
                  key={role}
                  onClick={() => handleSwitchRole(role)}
                  disabled={loading}
                  className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري التبديل...' : `التبديل إلى ${role === 'provider' ? 'مزود خدمة' : 'عميل'}`}
                </button>
              ))}
          </div>
        )}
      </div>

      {(canAddCustomer || canAddProvider) && (
        <div className="pt-4 border-t border-teal-200">
          {!showAddRole ? (
            <button
              onClick={() => setShowAddRole(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + إضافة دور جديد
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-2">اختر الدور لإضافته:</p>
              {canAddProvider && (
                <button
                  onClick={() => handleAddRole('provider')}
                  disabled={loading}
                  className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة دور مزود خدمة'}
                </button>
              )}
              {canAddCustomer && (
                <button
                  onClick={() => handleAddRole('customer')}
                  disabled={loading}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة دور عميل'}
                </button>
              )}
              <button
                onClick={() => setShowAddRole(false)}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-white rounded-lg">
        <p className="text-xs text-gray-500">
          💡 <strong>ملاحظة:</strong> يمكنك التبديل بين أدوار العميل ومزود الخدمة في أي وقت.
          هذا يتيح لك طلب خدمات كعميل وتقديم خدمات كمزود في نفس الحساب!
        </p>
      </div>
    </div>
  );
};
