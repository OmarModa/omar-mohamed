
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { USERS, CATEGORIES, SERVICE_REQUESTS, BIDS, RATINGS, REGIONS, NOTIFICATIONS } from './constants';
import type { User, ServiceRequest, Bid, Rating, Category, AppNotification } from './types';
import { UserRole, RequestStatus, BidStatus } from './types';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { RequestDetails } from './components/RequestDetails';
import { MyProfilePage } from './components/MyProfilePage';
import { AdminPage } from './components/AdminPage';
import { ProvidersPage } from './components/ProvidersPage';
import { ServicesPage } from './components/ServicesPage';
import { UserIcon } from './components/icons';
import { api } from './lib/api';


type View = 'home' | 'details' | 'profile' | 'admin' | 'providers' | 'user-profile' | 'services';

interface PendingRequest {
    title: string;
    description: string;
    categoryId: number;
    beforeImageUrl: string | null;
    suggestedBudget?: number;
    region: string;
}


const LoginModal: React.FC<{
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onShowRegister: () => void;
}> = ({ onClose, onLogin, onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. تحقق من بيانات الاعتماد.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">تسجيل الدخول</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-gray-600 mb-3">ليس لديك حساب؟</p>
          <button
            onClick={onShowRegister}
            className="text-teal-600 hover:text-teal-800 font-bold underline"
          >
            إنشاء حساب جديد
          </button>
        </div>
      </div>
    </div>
  );
};

const SignupModal: React.FC<{
  onClose: () => void;
  onSignup: (email: string, password: string, name: string, phone: string, role: UserRole, region: string, address?: string) => Promise<void>;
  onShowLogin: () => void;
}> = ({ onClose, onSignup, onShowLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Customer);
  const [region, setRegion] = useState(REGIONS[0]);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onSignup(email, password, name, phone, role, region, role === UserRole.Customer ? address : undefined);
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">إنشاء حساب جديد</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">نوع الحساب</label>
            <select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value={UserRole.Customer}>عميل</option>
              <option value={UserRole.Provider}>مزود خدمة</option>
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="أحمد العلي"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-500 mt-1">ستصلك كلمة المرور على بريدك الإلكتروني</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="99xxxxxx"
            />
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
            <select
              id="region"
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {role === UserRole.Customer && (
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">العنوان التفصيلي</label>
              <textarea
                id="address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="القطعة، الشارع، المنزل، رقم الشقة..."
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-gray-600 mb-3">لديك حساب بالفعل؟</p>
          <button
            onClick={onShowLogin}
            className="text-teal-600 hover:text-teal-800 font-bold underline"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [view, setView] = useState<View>('home');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [initialHomeCategory, setInitialHomeCategory] = useState<number | undefined>(undefined);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);

  const loadData = async () => {
    try {
      const [requestsData, bidsData, ratingsData] = await Promise.all([
        api.requests.getAll(),
        api.bids.getAll(),
        api.ratings.getAll()
      ]);

      setRequests(requestsData.map(r => ({
        id: parseInt(r.id.toString()),
        customerId: parseInt(r.customer_id.substring(0, 8), 16),
        customerUuid: r.customer_id,
        title: r.title,
        description: r.description,
        categoryId: r.category_id,
        region: r.region,
        status: r.status as RequestStatus,
        createdAt: new Date(r.created_at),
        assignedProviderId: r.assigned_provider_id ? parseInt(r.assigned_provider_id.substring(0, 8), 16) : undefined,
        acceptedBidId: r.accepted_bid_id ? parseInt(r.accepted_bid_id.toString()) : undefined,
        beforeImageUrl: r.before_image_url || undefined,
        afterImageUrl: r.after_image_url || undefined,
        completedAt: r.completed_at ? new Date(r.completed_at) : undefined,
        suggestedBudget: r.suggested_budget || undefined
      })));

      setBids(bidsData.map(b => ({
        id: parseInt(b.id.toString()),
        requestId: parseInt(b.request_id.toString()),
        providerId: parseInt(b.provider_id.substring(0, 8), 16),
        price: b.price,
        message: b.message || undefined,
        status: b.status as BidStatus
      })));

      setRatings(ratingsData.map(r => ({
        id: parseInt(r.id.toString()),
        requestId: parseInt(r.request_id.toString()),
        providerId: parseInt(r.provider_id.substring(0, 8), 16),
        customerId: parseInt(r.customer_id.substring(0, 8), 16),
        score: r.score
      })));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authUser = await api.auth.getCurrentUser();
        if (authUser) {
          const profile = await api.profiles.getById(authUser.id);
          if (profile) {
            const user: User = {
              id: parseInt(authUser.id.substring(0, 8), 16),
              uuid: authUser.id,
              name: profile.name,
              contactInfo: profile.contact_info,
              role: profile.role as UserRole,
              region: profile.region,
              address: profile.address || undefined,
              registeredAt: new Date(profile.created_at),
              verificationVideoUrl: profile.verification_video_url || undefined,
              specializationId: profile.specialization_id || undefined
            };
            setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    loadData();

    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSwitchUser = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      await api.auth.signIn(email, password);
      const authUser = await api.auth.getCurrentUser();
      if (!authUser) throw new Error('فشل تسجيل الدخول');

      const profile = await api.profiles.getById(authUser.id);
      if (!profile) throw new Error('الملف الشخصي غير موجود');

      const user: User = {
        id: parseInt(authUser.id.substring(0, 8), 16),
        uuid: authUser.id,
        name: profile.name,
        contactInfo: profile.contact_info,
        role: profile.role as UserRole,
        region: profile.region,
        address: profile.address || undefined,
        registeredAt: new Date(profile.created_at),
        verificationVideoUrl: profile.verification_video_url || undefined,
        specializationId: profile.specialization_id || undefined
      };

      setCurrentUser(user);
      setShowLoginModal(false);
      setView('home');
    } catch (error: any) {
      throw new Error(error.message || 'فشل تسجيل الدخول');
    }
  };

  const handleSignup = async (email: string, password: string, name: string, phone: string, role: UserRole, region: string, address?: string) => {
    try {
      await api.auth.signUp(email, password, {
        name,
        role,
        contact_info: phone,
        region,
        address: role === UserRole.Customer ? address : undefined,
        specialization_id: undefined
      });

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        await fetch(`${supabaseUrl}/functions/v1/send-password-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({ email, password, name })
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }

      alert(`تم إنشاء الحساب بنجاح!\nتم إرسال كلمة المرور على البريد الإلكتروني: ${email}\n\nللتجربة، استخدم:\nالبريد: ${email}\nكلمة المرور: ${password}`);

      await handleLogin(email, password);

      if (pendingRequest && role === UserRole.Customer) {
        const authUser = await api.auth.getCurrentUser();
        if (authUser) {
          await api.requests.create({
            customer_id: authUser.id,
            title: pendingRequest.title,
            description: pendingRequest.description,
            category_id: pendingRequest.categoryId,
            region: pendingRequest.region,
            before_image_url: pendingRequest.beforeImageUrl || undefined,
            suggested_budget: pendingRequest.suggestedBudget
          });
          setPendingRequest(null);
        }
      }

      setShowSignupModal(false);
    } catch (error: any) {
      throw new Error(error.message || 'فشل إنشاء الحساب');
    }
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setView('home');
      setSelectedRequestId(null);
      setSelectedProfileId(null);
  };


  const addNotification = (userId: number, message: string, type: 'info' | 'success' | 'alert', requestId?: number) => {
      const newNotification: AppNotification = {
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          userId,
          message,
          type,
          relatedRequestId: requestId,
          isRead: false,
          createdAt: new Date()
      };
      setNotifications(prev => [newNotification, ...prev]);
  };
  
  const _createRequest = async (customerUuid: string, {title, description, categoryId, beforeImageUrl, suggestedBudget, region}: {title: string, description: string, categoryId: number, beforeImageUrl?: string, suggestedBudget?: number, region: string}) => {
      try {
        await api.requests.create({
          customer_id: customerUuid,
          title,
          description,
          category_id: categoryId,
          region,
          before_image_url: beforeImageUrl,
          suggested_budget: suggestedBudget
        });
        await loadData();
      } catch (error) {
        console.error('Error creating request:', error);
        alert('حدث خطأ أثناء إنشاء الطلب');
      }
  };
  
  const handleCreateRequest = useCallback(async (title: string, description: string, categoryId: number, beforeImageUrl: string | null, suggestedBudget?: number, region: string = 'العاصمة') => {
      if (!currentUser || !currentUser.uuid) {
          setPendingRequest({ title, description, categoryId, beforeImageUrl, suggestedBudget, region });
          setShowSignupModal(true);
          return;
      }
      await _createRequest(currentUser.uuid, { title, description, categoryId, beforeImageUrl: beforeImageUrl || undefined, suggestedBudget, region });
  }, [currentUser]);
  
  const _placeBid = async (providerUuid: string, providerName: string, {requestId, price, message}: {requestId: number, price: number, message: string}) => {
      try {
        await api.bids.create({
          request_id: requestId,
          provider_id: providerUuid,
          price,
          message
        });

        const request = requests.find(r => r.id === requestId);
        if (request && request.customerUuid) {
          const customerProfile = await api.profiles.getByIdSilent(request.customerUuid);

          if (customerProfile) {
            const authUser = await api.auth.getUserById(customerProfile.id);

            if (authUser?.email) {
              try {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

                await fetch(`${supabaseUrl}/functions/v1/notify-bid-received`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseAnonKey}`
                  },
                  body: JSON.stringify({
                    request_id: requestId,
                    provider_name: providerName,
                    bid_price: price,
                    request_title: request.title,
                    customer_email: authUser.email,
                    customer_name: customerProfile.name
                  })
                });
              } catch (emailError) {
                console.error('Failed to send email notification:', emailError);
              }
            }
          }
        }

        await loadData();
      } catch (error) {
        console.error('Error placing bid:', error);
        alert('حدث خطأ أثناء تقديم العرض');
      }
  };

  const handlePlaceBid = useCallback(async (requestId: number, price: number, message: string) => {
      if (!currentUser || !currentUser.uuid) {
          setShowLoginModal(true);
          return;
      }
      await _placeBid(currentUser.uuid, currentUser.name, { requestId, price, message });
  }, [currentUser, requests]);


  const handleAcceptBid = useCallback((bidToAccept: Bid) => {
    setRequests(prev => prev.map(r => 
        r.id === bidToAccept.requestId 
        ? { ...r, status: RequestStatus.Assigned, assignedProviderId: bidToAccept.providerId, acceptedBidId: bidToAccept.id }
        : r
    ));
    setBids(prev => prev.map(b => {
        if (b.requestId !== bidToAccept.requestId) return b;
        return b.id === bidToAccept.id 
            ? { ...b, status: BidStatus.Accepted }
            : { ...b, status: BidStatus.Rejected };
    }));

    // Notify Provider
    const request = requests.find(r => r.id === bidToAccept.requestId);
    if (request) {
        addNotification(
            bidToAccept.providerId,
            `مبروك! تم قبول عرضك على الطلب "${request.title}". يمكنك البدء بالتنفيذ الآن.`,
            'success',
            request.id
        );
    }

  }, [requests]);
  
  const handleCompleteRequest = useCallback((requestId: number) => {
      setRequests(prev => prev.map(r => 
          r.id === requestId
          ? { ...r, status: RequestStatus.Completed, completedAt: new Date() }
          : r
      ));

      // Optional: Notify Customer that provider marked it complete (or vice versa depending on who triggers it)
      // Assuming Provider triggers "Complete", we notify Customer
      const request = requests.find(r => r.id === requestId);
      if (request && currentUser?.role === UserRole.Provider) {
          addNotification(
              request.customerId,
              `قام مزود الخدمة بإنهاء العمل على طلبك "${request.title}". يرجى التقييم.`,
              'success',
              request.id
          );
      }

  }, [requests, currentUser]);

  const handleUploadAfterImage = useCallback((requestId: number, imageUrl: string) => {
      setRequests(prev => prev.map(r => 
          r.id === requestId
          ? { ...r, afterImageUrl: imageUrl }
          : r
      ));
  }, []);

  const handleRateService = useCallback((requestId: number, ratedUserId: number, score: number) => {
      if (!currentUser) return;
      const newRating: Rating = {
          id: Math.max(...ratings.map(r => r.id), 0) + 1,
          requestId,
          providerId: currentUser.role === UserRole.Provider ? currentUser.id : ratedUserId, 
          customerId: currentUser.role === UserRole.Customer ? currentUser.id : ratedUserId, 
          score
      };
      setRatings(prev => [...prev, newRating]);
  }, [currentUser, ratings]);

  const handleUpdateUserVideo = useCallback((userId: number, videoUrl: string) => {
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, verificationVideoUrl: videoUrl } : u));
      if (currentUser?.id === userId) {
          setCurrentUser(prev => prev ? { ...prev, verificationVideoUrl: videoUrl } : null);
      }
  }, [currentUser]);

  const handleUpdateUserAddress = useCallback((userId: number, address: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, address: address } : u));
    if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, address: address } : null);
    }
  }, [currentUser]);

  const handleUpdateUserContact = useCallback((userId: number, phone: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, contactInfo: phone } : u));
    if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, contactInfo: phone } : null);
    }
  }, [currentUser]);

  const handleMarkNotificationRead = useCallback((notificationId: number) => {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  }, []);

  const navigateTo = (newView: View, id: number | null = null) => {
      if ((newView === 'profile' || newView === 'admin') && !currentUser) return;
      if (newView === 'admin' && currentUser?.role !== UserRole.Admin) return;
      
      setView(newView);
      if (newView === 'details') setSelectedRequestId(id);
      if (newView === 'user-profile') setSelectedProfileId(id);
      
      // Clear initial category if navigating away from home, unless we are setting it via special handler
      if (newView !== 'home') setInitialHomeCategory(undefined);
  }

  // Interaction from Services Page
  const handleRequestServiceFromCategory = (categoryId: number) => {
      setInitialHomeCategory(categoryId);
      setView('home');
      // Optional: scroll to form
      setTimeout(() => {
          const form = document.getElementById('new-request-form');
          if (form) form.scrollIntoView({ behavior: 'smooth' });
      }, 100);
  };

  const selectedRequest = useMemo(() => {
    if (view === 'details' && selectedRequestId) {
      return requests.find(r => r.id === selectedRequestId);
    }
    return undefined;
  }, [view, selectedRequestId, requests]);

  const getProviderAvgRating = useCallback((providerId: number) => {
    const providerRatings = ratings.filter(r => r.providerId === providerId);
    if (providerRatings.length === 0) return 0;
    const totalScore = providerRatings.reduce((acc, r) => acc + r.score, 0);
    return parseFloat((totalScore / providerRatings.length).toFixed(1));
  }, [ratings]);


  const renderContent = () => {
    switch(view) {
        case 'home':
            return <HomePage 
                        currentUser={currentUser}
                        requests={requests.filter(r => r.status === RequestStatus.Open)}
                        categories={CATEGORIES}
                        users={allUsers}
                        onCreateRequest={handleCreateRequest}
                        onViewDetails={(id) => navigateTo('details', id)}
                        initialCategoryId={initialHomeCategory}
                    />;
        case 'services':
            return <ServicesPage 
                        categories={CATEGORIES}
                        requests={requests.filter(r => r.status === RequestStatus.Open)}
                        users={allUsers}
                        onRequestService={handleRequestServiceFromCategory}
                        onViewDetails={(id) => navigateTo('details', id)}
                    />;
        case 'providers':
            return <ProvidersPage 
                      users={allUsers}
                      categories={CATEGORIES}
                      ratings={ratings}
                      onViewProfile={(id) => navigateTo('user-profile', id)}
                   />;
        case 'details':
            return selectedRequest && (
                <RequestDetails
                    request={selectedRequest}
                    currentUser={currentUser}
                    bids={bids.filter(b => b.requestId === selectedRequest.id)}
                    category={CATEGORIES.find(c => c.id === selectedRequest.categoryId)}
                    customer={allUsers.find(u => u.id === selectedRequest.customerId)}
                    assignedProvider={allUsers.find(u => u.id === selectedRequest.assignedProviderId)}
                    onPlaceBid={handlePlaceBid}
                    onAcceptBid={handleAcceptBid}
                    onCompleteRequest={handleCompleteRequest}
                    onRateService={handleRateService}
                    onUploadAfterImage={handleUploadAfterImage}
                    getProviderAvgRating={getProviderAvgRating}
                    isRated={ratings.some(r => r.requestId === selectedRequest.id)}
                    users={allUsers}
                />
            );
        case 'profile':
            return currentUser && (
                <MyProfilePage
                    viewedUser={currentUser}
                    currentUser={currentUser}
                    requests={requests}
                    bids={bids}
                    ratings={ratings}
                    users={allUsers}
                    categories={CATEGORIES}
                    onViewDetails={(id) => navigateTo('details', id)}
                    getProviderAvgRating={getProviderAvgRating}
                    onUpdateVideo={(videoUrl) => handleUpdateUserVideo(currentUser.id, videoUrl)}
                    onUpdateAddress={(address) => handleUpdateUserAddress(currentUser.id, address)}
                    onUpdateContact={(phone) => handleUpdateUserContact(currentUser.id, phone)}
                />
            );
        case 'user-profile':
            const viewedUser = allUsers.find(u => u.id === selectedProfileId);
            return viewedUser ? (
                 <MyProfilePage
                    viewedUser={viewedUser}
                    currentUser={currentUser}
                    requests={requests}
                    bids={bids}
                    ratings={ratings}
                    users={allUsers}
                    categories={CATEGORIES}
                    onViewDetails={(id) => navigateTo('details', id)}
                    getProviderAvgRating={getProviderAvgRating}
                    onUpdateVideo={(videoUrl) => handleUpdateUserVideo(viewedUser.id, videoUrl)}
                    onUpdateAddress={(address) => handleUpdateUserAddress(viewedUser.id, address)}
                    onUpdateContact={(phone) => handleUpdateUserContact(viewedUser.id, phone)}
                />
            ) : null;
        case 'admin':
            return currentUser?.role === UserRole.Admin && (
                <AdminPage
                    users={allUsers}
                    requests={requests}
                    bids={bids}
                />
            );
        default:
            return null;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onLogin={handleLogin}
            onShowRegister={() => {
              setShowLoginModal(false);
              setShowSignupModal(true);
            }}
          />
      )}
      {showSignupModal && (
          <SignupModal
            onClose={() => setShowSignupModal(false)}
            onSignup={handleSignup}
            onShowLogin={() => {
              setShowSignupModal(false);
              setShowLoginModal(true);
            }}
          />
      )}
      <Header 
        currentUser={currentUser} 
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onNavigate={(view) => navigateTo(view)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onViewRequest={(id) => navigateTo('details', id)}
      />
      <main className="container mx-auto p-4 md:p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
