
import React, { useState, useMemo } from 'react';
import type { User, AppNotification } from '../types';
import { UserIcon, DashboardIcon, BellIcon } from './icons';
import { UserRole } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onSwitchUser: () => void;
  onLogout: () => void;
  onNavigate: (view: 'home' | 'profile' | 'admin' | 'providers' | 'services') => void;
  notifications?: AppNotification[];
  onMarkNotificationRead?: (id: number) => void;
  onViewRequest?: (id: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onSwitchUser, onLogout, onNavigate, notifications = [], onMarkNotificationRead, onViewRequest }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const userNotifications = useMemo(() => {
      if (!currentUser) return [];
      return notifications.filter(n => n.userId === currentUser.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [notifications, currentUser]);

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: AppNotification) => {
      if (!notification.isRead && onMarkNotificationRead) {
          onMarkNotificationRead(notification.id);
      }
      setShowNotifications(false);
      if (notification.relatedRequestId && onViewRequest) {
          onViewRequest(notification.relatedRequestId);
      }
  };

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
                <button onClick={() => onNavigate('services')} className="text-gray-600 hover:text-teal-600 font-semibold">
                    الخدمات
                </button>
                <button onClick={() => onNavigate('providers')} className="text-gray-600 hover:text-teal-600 font-semibold">
                    مقدمي الخدمات
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
                {/* Notifications Bell */}
                {currentUser && (
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors"
                        >
                            <BellIcon className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setShowNotifications(false)}
                                ></div>
                                <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden">
                                    <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-700">الإشعارات</h3>
                                        <span className="text-xs text-gray-500">{userNotifications.length} إشعار</span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {userNotifications.length > 0 ? (
                                            userNotifications.map(notification => (
                                                <div 
                                                    key={notification.id}
                                                    onClick={() => handleNotificationClick(notification)}
                                                    className={`p-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                                >
                                                    <p className={`text-sm mb-1 ${!notification.isRead ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(notification.createdAt).toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                لا توجد إشعارات حالياً.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}


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
                            تبديل
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
