
import React, { useState, useCallback, useMemo } from 'react';
import { USERS, CATEGORIES, SERVICE_REQUESTS, BIDS, RATINGS } from './constants';
import type { User, ServiceRequest, Bid, Rating, Category } from './types';
import { UserRole, RequestStatus, BidStatus } from './types';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { RequestDetails } from './components/RequestDetails';
import { MyProfilePage } from './components/MyProfilePage';
import { AdminPage } from './components/AdminPage';


type View = 'home' | 'details' | 'profile' | 'admin';

interface PendingAction {
    type: 'create-request' | 'place-bid';
    payload: any;
}

const RegistrationModal: React.FC<{
  userRole: UserRole;
  onClose: () => void;
  onRegister: (name: string, phone: string) => void;
}> = ({ userRole, onClose, onRegister }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      onRegister(name, phone);
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
          <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 transition-colors">
            متابعة
          </button>
        </form>
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

  const [view, setView] = useState<View>('home');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const handleSwitchUser = useCallback(() => {
    const availableUsers = [null, ...allUsers]; // Include guest
    const currentIndex = availableUsers.findIndex(u => u?.id === currentUser?.id);
    const nextIndex = (currentIndex + 1) % availableUsers.length;
    setCurrentUser(availableUsers[nextIndex]);
    setView('home');
    setSelectedRequestId(null);
  }, [currentUser?.id, allUsers]);

  const handleLogout = () => {
      setCurrentUser(null);
      setView('home');
      setSelectedRequestId(null);
  };

  const handleRegisterAndProceed = (name: string, phone: string) => {
      if (!pendingAction) return;

      const newUser: User = {
          id: Math.max(...allUsers.map(u => u.id), 0) + 1,
          name,
          contactInfo: phone,
          role: pendingAction.type === 'create-request' ? UserRole.Customer : UserRole.Provider,
          registeredAt: new Date(),
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
  
  const _createRequest = (customerId: number, {title, description, categoryId, beforeImageUrl}: {title: string, description: string, categoryId: number, beforeImageUrl?: string}) => {
      const newRequest: ServiceRequest = {
        id: Math.max(...requests.map(r => r.id), 0) + 1,
        customerId,
        title,
        description,
        categoryId,
        status: RequestStatus.Open,
        createdAt: new Date(),
        beforeImageUrl: beforeImageUrl || undefined,
      };
      setRequests(prev => [newRequest, ...prev]);
  };
  
  const handleCreateRequest = useCallback((title: string, description: string, categoryId: number, beforeImageUrl: string | null) => {
      if (!currentUser) {
          setPendingAction({ type: 'create-request', payload: { title, description, categoryId, beforeImageUrl } });
          setShowRegistrationModal(true);
      } else {
          _createRequest(currentUser.id, { title, description, categoryId, beforeImageUrl: beforeImageUrl || undefined });
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
  };

  const handlePlaceBid = useCallback((requestId: number, price: number, message: string) => {
      if (!currentUser) {
          setPendingAction({ type: 'place-bid', payload: { requestId, price, message } });
          setShowRegistrationModal(true);
      } else {
         _placeBid(currentUser.id, { requestId, price, message });
      }
  }, [currentUser, bids]);


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
  }, []);
  
  const handleCompleteRequest = useCallback((requestId: number) => {
      setRequests(prev => prev.map(r => 
          r.id === requestId
          ? { ...r, status: RequestStatus.Completed }
          : r
      ));
  }, []);

  const handleUploadAfterImage = useCallback((requestId: number, imageUrl: string) => {
      setRequests(prev => prev.map(r => 
          r.id === requestId
          ? { ...r, afterImageUrl: imageUrl }
          : r
      ));
  }, []);

  const handleRateService = useCallback((requestId: number, providerId: number, score: number) => {
      if (!currentUser) return;
      const newRating: Rating = {
          id: Math.max(...ratings.map(r => r.id), 0) + 1,
          requestId,
          providerId,
          customerId: currentUser.id,
          score
      };
      setRatings(prev => [...prev, newRating]);
  }, [currentUser, ratings]);

  const navigateTo = (newView: View, requestId: number | null = null) => {
      if ((newView === 'profile' || newView === 'admin') && !currentUser) return;
      if (newView === 'admin' && currentUser?.role !== UserRole.Admin) return;
      
      setView(newView);
      setSelectedRequestId(requestId);
  }

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
                    currentUser={currentUser}
                    requests={requests}
                    bids={bids}
                    ratings={ratings}
                    users={allUsers}
                    categories={CATEGORIES}
                    onViewDetails={(id) => navigateTo('details', id)}
                    getProviderAvgRating={getProviderAvgRating}
                />
            );
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
      <Header 
        currentUser={currentUser} 
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onNavigate={navigateTo}
      />
      <main className="container mx-auto p-4 md:p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;