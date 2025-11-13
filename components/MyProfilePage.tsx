
import React from 'react';
import type { User, ServiceRequest, Bid, Rating, Category } from '../types';
import { UserRole, RequestStatus } from '../types';
import { StarIcon } from './icons';

interface MyProfilePageProps {
    currentUser: User;
    requests: ServiceRequest[];
    bids: Bid[];
    ratings: Rating[];
    users: User[];
    categories: Category[];
    onViewDetails: (id: number) => void;
    getProviderAvgRating: (providerId: number) => number;
}

const HistoryRequestCard: React.FC<{
    request: ServiceRequest;
    category?: Category;
    otherPartyName: string;
    onViewDetails: (id: number) => void;
}> = ({ request, category, otherPartyName, onViewDetails }) => {
    
     const renderStatusBadge = () => {
        switch (request.status) {
            case RequestStatus.Open:
                return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">مفتوح</span>;
            case RequestStatus.Assigned:
                return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">قيد التنفيذ</span>;
            case RequestStatus.Completed:
                return <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">مكتمل</span>;
        }
    };

    return (
        <div className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-grow">
                <div className="flex items-center gap-4 mb-2">
                     {renderStatusBadge()}
                     {category && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <category.icon className="w-4 h-4"/>
                            <span>{category.name}</span>
                        </div>
                     )}
                </div>
                <h3 className="font-bold text-lg text-gray-800">{request.title}</h3>
                <p className="text-sm text-gray-600">{otherPartyName}</p>
            </div>
            <button
                onClick={() => onViewDetails(request.id)}
                className="w-full sm:w-auto flex-shrink-0 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm font-semibold"
            >
                عرض التفاصيل
            </button>
        </div>
    );
};

export const MyProfilePage: React.FC<MyProfilePageProps> = ({ currentUser, requests, bids, ratings, users, categories, onViewDetails, getProviderAvgRating }) => {

    if (currentUser.role === UserRole.Customer) {
        const myRequests = requests.filter(r => r.customerId === currentUser.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return (
            <div>
                <h2 className="text-3xl font-bold mb-6">سجل طلباتي</h2>
                <div className="space-y-4">
                    {myRequests.length > 0 ? myRequests.map(req => {
                        const provider = users.find(u => u.id === req.assignedProviderId);
                        return (
                            <HistoryRequestCard
                                key={req.id}
                                request={req}
                                category={categories.find(c => c.id === req.categoryId)}
                                otherPartyName={req.status === 'open' ? 'بانتظار العروض' : `المنفذ: ${provider?.name || 'غير محدد'}`}
                                onViewDetails={onViewDetails}
                            />
                        );
                    }) : <p>لم تقم بتقديم أي طلبات بعد.</p>}
                </div>
            </div>
        );
    }
    
    // Provider View
    const avgRating = getProviderAvgRating(currentUser.id);
    const myJobs = requests.filter(r => r.assignedProviderId === currentUser.id).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex items-center justify-between">
                <h2 className="text-3xl font-bold">ملف أعمالي</h2>
                {avgRating > 0 && (
                     <div className="text-center">
                        <p className="text-gray-500">متوسط تقييمك</p>
                        <div className="flex items-center gap-2 text-2xl font-bold text-yellow-500">
                            <StarIcon className="w-7 h-7"/>
                            <span>{avgRating} <span className="text-base text-gray-600 font-normal">/ 10</span></span>
                        </div>
                    </div>
                )}
            </div>

            <h3 className="text-2xl font-bold mb-4">الأعمال المنجزة</h3>
             <div className="space-y-4">
                {myJobs.length > 0 ? myJobs.map(job => {
                    const customer = users.find(u => u.id === job.customerId);
                    return (
                        <HistoryRequestCard
                            key={job.id}
                            request={job}
                            category={categories.find(c => c.id === job.categoryId)}
                            otherPartyName={`العميل: ${customer?.name || 'غير معروف'}`}
                            onViewDetails={onViewDetails}
                        />
                    );
                }) : <p>لم يتم إسناد أي أعمال لك بعد.</p>}
            </div>
        </div>
    );
};
