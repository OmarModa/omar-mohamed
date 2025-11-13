
import React from 'react';
import type { User } from '../types';
import { UserIcon, DashboardIcon } from './icons';
import { UserRole } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onSwitchUser: () => void;
  onLogout: () => void;
  onNavigate: (view: 'home' | 'profile' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onSwitchUser, onLogout, onNavigate }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        <h1 
            className="text-2xl font-bold text-teal-600 cursor-pointer"
            onClick={() => onNavigate('home')}
        >
            سوق الخدمات
        </h1>
        <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4">
                 <button onClick={() => onNavigate('home')} className="text-gray-600 hover:text-teal-600 font-semibold">
                    الرئيسية
                </button>
                {currentUser && currentUser.role !== UserRole.Admin && (
                    <button onClick={() => onNavigate('profile')} className="text-gray-600 hover:text-teal-600 font-semibold">
                        {currentUser.role === UserRole.Customer ? 'طلباتي' : 'أعمالي'}
                    </button>
                )}
                {currentUser?.role === UserRole.Admin && (
                     <button onClick={() => onNavigate('admin')} className="text-gray-600 hover:text-teal-600 font-semibold flex items-center gap-1">
                        <DashboardIcon className="w-5 h-5" />
                        لوحة التحكم
                    </button>
                )}
            </nav>
            <div className="flex items-center gap-2">
                {currentUser ? (
                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <UserIcon className="w-6 h-6 text-gray-500" />
                        <div className="text-sm">
                            <span className="font-semibold">{currentUser.name}</span>
                            <span className={`text-xs block ${
                                currentUser.role === UserRole.Provider ? 'text-blue-600' :
                                currentUser.role === UserRole.Customer ? 'text-green-600' : 'text-purple-600'
                            }`}>
                                {
                                 currentUser.role === UserRole.Provider ? 'مزود خدمة' :
                                 currentUser.role === UserRole.Customer ? 'عميل' : 'مشرف'
                                }
                            </span>
                        </div>
                        <button onClick={onSwitchUser} className="ms-2 px-3 py-1 bg-gray-500 text-white rounded-md text-xs hover:bg-gray-600 transition-colors">
                            تبديل الحساب
                        </button>
                         <button onClick={onLogout} className="px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition-colors">
                            خروج
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <UserIcon className="w-6 h-6 text-gray-400" />
                        <span className="font-semibold text-gray-600">زائر</span>
                        <button onClick={onSwitchUser} className="ms-2 px-3 py-1 bg-teal-500 text-white rounded-md text-xs hover:bg-teal-600 transition-colors">
                           تسجيل الدخول
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};