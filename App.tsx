
import React, { useState, useCallback, useMemo } from 'react';
import { USERS, CATEGORIES, SERVICE_REQUESTS, BIDS, RATINGS, REGIONS, NOTIFICATIONS } from './constants';
import type { User, ServiceRequest, Bid, Rating, Category, AppNotification } from './types';
import { UserRole, RequestStatus, BidStatus } from './types';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { RequestDetails } from './components/RequestDetails';
import { MyProfilePage } from './components/MyProfilePage';
import { AdminPage } from './components/AdminPage';
import { ProvidersPage } from './components/ProvidersPage';
import { ServicesPage } from './components/ServicesPage'; // Import ServicesPage
import { UserIcon } from './components/icons';


type View = 'home' | 'details' | 'profile' | 'admin' | 'providers' | 'user-profile' | 'services';

interface PendingAction {
    type: 'create-request' | 'place-bid';
    payload: any;
}

const RegistrationModal: React.FC<{
  userRole: UserRole;
  onClose: () => void;
  onRegister: (name: string, phone: string, region: string, address: string) => void;
}> = ({ userRole, onClose, onRegister }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState(REGIONS[0]);
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      onRegister(name, phone, region, address);
    }
  };

  const roleText = userRole === UserRole.Customer ? 'عميل جديد' : 'مزود خدمة جديد';
  const actionText = userRole === UserRole.Customer ? 'لإضافة طلبك' : 'لإضافة عرضك';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">تسجيل {roleText}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
        </div>
        <p className="mb-6 text-gray-600">يرجى إدخال بياناتك للمتابعة. {actionText}, سيتم إنشاء حساب لك تلقائياً.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">الاسم</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="مثال: أحمد العلي"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="مثال: 99xxxxxx"
            />
          </div>
          <div>
             <label htmlFor="region" className="block text-sm font-medium text-gray-700">المنطقة</label>
             <select
                id="region"
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
             >
                {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
             </select>
          </div>
          {userRole === UserRole.Customer && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">العنوان التفصيلي</label>
                <textarea
                  id="address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={2}
                  required
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="القطعة، الشارع، المنزل، رقم الشقة..."
                />
                <p className="text-xs text-gray-500 mt-1">سيظهر العنوان فقط لمزود الخدمة الذي تختار عرضه.</p>
              </div>
          )}
          <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 transition-colors">
            متابعة
          </button>
        </form>
      </div>
    </div>
  );
};

const UserSelectionModal: React.FC<{
  users: User[];
  onSelect: (user: User | null) => void;
  onClose: () => void;
}> = ({ users, onSelect, onClose }) => {
  // Group users by role
  const admins = users.filter(u => u.role === UserRole.Admin);
  const customers = users.filter(u => u.role === UserRole.Customer);
  const providers = users.filter(u => u.role === UserRole.Provider);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-800">تسجيل الدخول / تبديل الحساب</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Admins */}
            <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-100">
                <h3 className="font-bold text-purple-800 mb-3 border-b border-purple-200 pb-1 flex items-center gap-2">
                    <span>🛡️</span> الإدارة (المشرفين)
                </h3>
                 {admins.map(u => (
                    <button key={u.id} onClick={() => onSelect(u)} className="w-full text-right p-3 mb-2 rounded bg-white hover:bg-purple-100 border border-purple-200 shadow-sm transition-colors flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-purple-100 group-hover:bg-white rounded-full flex items-center justify-center text-purple-600 font-bold transition-colors">
                            {u.name[0]}
                        </div>
                        <div>
                            <div className="font-bold text-sm text-gray-800">{u.name}</div>
                            <div className="text-xs text-purple-600 font-semibold">الدخول للوحة التحكم ومتابعة الطلبات</div>
                        </div>
                    </button>
                 ))}
            </div>

             {/* Providers */}
            <div className="bg-blue-50 rounded-lg p-3">
                <h3 className="font-bold text-blue-800 mb-3 border-b border-blue-200 pb-1 flex items-center gap-2">
                    <span>🛠️</span> مقدمي الخدمات
                </h3>
                 {providers.map(u => (
                    <button key={u.id} onClick={() => onSelect(u)} className="w-full text-right p-3 mb-2 rounded bg-white hover:bg-blue-100 border border-gray-200 shadow-sm transition-colors flex items-center gap-2 group">
                         <div className="w-8 h-8 bg-blue-100 group-hover:bg-white rounded-full flex items-center justify-center text-blue-600 font-bold transition-colors">
                            {u.name[0]}
                        </div>
                        <div>
                            <div className="font-bold text-sm text-gray-800">{u.name}</div>
                            <div className="text-xs text-gray-500">استعراض الطلبات وتقديم عروض</div>
                        </div>
                    </button>
                 ))}
            </div>

             {/* Customers */}
            <div className="bg-green-50 rounded-lg p-3">
                <h3 className="font-bold text-green-800 mb-3 border-b border-green-200 pb-1 flex items-center gap-2">
                    <span>👤</span> العملاء
                </h3>
                 {customers.map(u => (
                    <button key={u.id} onClick={() => onSelect(u)} className="w-full text-right p-3 mb-2 rounded bg-white hover:bg-green-100 border border-gray-200 shadow-sm transition-colors flex items-center gap-2 group">
                         <div className="w-8 h-8 bg-green-100 group-hover:bg-white rounded-full flex items-center justify-center text-green-600 font-bold transition-colors">
                            {u.name[0]}
                        </div>
                        <div>
                            <div className="font-bold text-sm text-gray-800">{u.name}</div>
                            <div className="text-xs text-gray-500">طلب خدمة جديدة</div>
                        </div>
                    </button>
                 ))}
            </div>
        </div>

        <div className="mt-6 pt-4 border-t flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
                 <p className="text-sm text-gray-600">أو يمكنك التصفح بدون تسجيل:</p>
                <button onClick={() => onSelect(null)} className="text-teal-600 hover:text-teal-800 font-bold px-4 py-2 rounded hover:bg-teal-50 border border-teal-200 bg-white shadow-sm">
                    الدخول كزائر (Guest)
                </button>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm underline">
                إلغاء
            </button>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>(USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>(SERVICE_REQUESTS);
  const [bids, setBids] = useState<Bid[]>(BIDS);
  const [ratings, setRatings] = useState<Rating[]>(RATINGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS);

  const [view, setView] = useState<View>('home');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  // State to hold a pre-selected category when navigating from Services page to Home
  const [initialHomeCategory, setInitialHomeCategory] = useState<number | undefined>(undefined);

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const handleSwitchUser = useCallback(() => {
    setShowUserSelectionModal(true);
  }, []);

  const handleUserSelect = (user: User | null) => {
      setCurrentUser(user);
      setShowUserSelectionModal(false);
      setView('home');
      setSelectedRequestId(null);
      setSelectedProfileId(null);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setView('home');
      setSelectedRequestId(null);
      setSelectedProfileId(null);
  };

  const handleRegisterAndProceed = (name: string, phone: string, region: string, address: string) => {
      if (!pendingAction) return;

      const newUser: User = {
          id: Math.max(...allUsers.map(u => u.id), 0) + 1,
          name,
          contactInfo: phone,
          role: pendingAction.type === 'create-request' ? UserRole.Customer : UserRole.Provider,
          registeredAt: new Date(),
          region: region,
          address: pendingAction.type === 'create-request' ? address : undefined
      };

      setAllUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);

      if (pendingAction.type === 'create-request') {
          _createRequest(newUser.id, pendingAction.payload);
      } else if (pendingAction.type === 'place-bid') {
          _placeBid(newUser.id, pendingAction.payload);
      }

      setShowRegistrationModal(false);
      setPendingAction(null);
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
  
  const _createRequest = (customerId: number, {title, description, categoryId, beforeImageUrl, suggestedBudget, region}: {title: string, description: string, categoryId: number, beforeImageUrl?: string, suggestedBudget?: number, region: string}) => {
      const newRequest: ServiceRequest = {
        id: Math.max(...requests.map(r => r.id), 0) + 1,
        customerId,
        title,
        description,
        categoryId,
        region,
        status: RequestStatus.Open,
        createdAt: new Date(),
        beforeImageUrl: beforeImageUrl || undefined,
        suggestedBudget: suggestedBudget,
      };
      setRequests(prev => [newRequest, ...prev]);
  };
  
  const handleCreateRequest = useCallback((title: string, description: string, categoryId: number, beforeImageUrl: string | null, suggestedBudget?: number, region: string = 'العاصمة') => {
      if (!currentUser) {
          setPendingAction({ type: 'create-request', payload: { title, description, categoryId, beforeImageUrl, suggestedBudget, region } });
          setShowRegistrationModal(true);
      } else {
          _createRequest(currentUser.id, { title, description, categoryId, beforeImageUrl: beforeImageUrl || undefined, suggestedBudget, region });
      }
  }, [currentUser, requests]);
  
  const _placeBid = (providerId: number, {requestId, price, message}: {requestId: number, price: number, message: string}) => {
      const newBid: Bid = {
          id: Math.max(...bids.map(b => b.id), 0) + 1,
          requestId,
          providerId,
          price,
          message,
          status: BidStatus.Pending,
      };
      setBids(prev => [...prev, newBid]);

      // Notify Customer
      const request = requests.find(r => r.id === requestId);
      if (request) {
          addNotification(
              request.customerId,
              `تم تقديم عرض جديد بقيمة ${price} د.ك على طلبك "${request.title}"`,
              'info',
              request.id
          );
      }
  };

  const handlePlaceBid = useCallback((requestId: number, price: number, message: string) => {
      if (!currentUser) {
          setPendingAction({ type: 'place-bid', payload: { requestId, price, message } });
          setShowRegistrationModal(true);
      } else {
         _placeBid(currentUser.id, { requestId, price, message });
      }
  }, [currentUser, bids, requests]);


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
      {showRegistrationModal && pendingAction && (
          <RegistrationModal 
            userRole={pendingAction.type === 'create-request' ? UserRole.Customer : UserRole.Provider}
            onClose={() => setShowRegistrationModal(false)}
            onRegister={handleRegisterAndProceed}
          />
      )}
      {showUserSelectionModal && (
          <UserSelectionModal 
            users={allUsers}
            onSelect={handleUserSelect}
            onClose={() => setShowUserSelectionModal(false)}
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
