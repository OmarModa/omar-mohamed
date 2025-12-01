
import React, { useState } from 'react';
import type { ServiceRequest, User, Bid, Category } from '../types';
import { UserRole, RequestStatus } from '../types';
import { StarRating } from './StarRating';
import { StarIcon, VideoIcon, WalletIcon, MapPinIcon } from './icons';

interface RequestDetailsProps {
    request: ServiceRequest;
    currentUser: User | null;
    bids: Bid[];
    category?: Category;
    customer?: User;
    assignedProvider?: User;
    onPlaceBid: (requestId: number, price: number, message: string) => void;
    onAcceptBid: (bid: Bid) => void;
    onCompleteRequest: (requestId: number) => void;
    onRateService: (requestId: number, providerId: number, score: number) => void;
    onUploadAfterImage: (requestId: number, imageUrl: string) => void;
    getProviderAvgRating: (providerId: number) => number;
    isRated: boolean;
    users: User[];
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const AfterImageUpload: React.FC<{
    requestId: number;
    onUpload: (requestId: number, imageUrl: string) => void;
}> = ({ requestId, onUpload }) => {
    const [image, setImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setImage(base64);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (image) {
            setIsUploading(true);
            // Simulate upload delay
            setTimeout(() => {
                onUpload(requestId, image);
                setIsUploading(false);
            }, 1000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
             <h3 className="text-lg font-bold text-gray-800">إرفاق صورة "بعد" الخدمة</h3>
            <div>
                 <input
                    type="file"
                    id="after-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
            </div>
            {image && <img src={image} alt="After preview" className="rounded-lg max-h-48 mx-auto" />}
            <button type="submit" disabled={!image || isUploading} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                {isUploading ? 'جاري الرفع...' : 'رفع الصورة'}
            </button>
        </form>
    )
};


export const RequestDetails: React.FC<RequestDetailsProps> = (props) => {
    const { request, currentUser, bids, category, customer, assignedProvider, onPlaceBid, onAcceptBid, onCompleteRequest, onRateService, onUploadAfterImage, getProviderAvgRating, isRated, users } = props;

    const isCustomerOwner = currentUser?.id === request.customerId;
    const isProviderAssigned = currentUser?.id === request.assignedProviderId;
    const hasProviderBid = bids.some(b => b.providerId === currentUser?.id);

    const [price, setPrice] = useState('');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [viewingVideo, setViewingVideo] = useState<string | null>(null);

    const handleBidSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const priceValue = parseFloat(price);
        if (!isNaN(priceValue) && priceValue > 0) {
            onPlaceBid(request.id, priceValue, message);
            setPrice('');
            setMessage('');
        }
    };
    
    const handleRatingSubmit = () => {
        if(rating > 0 && request.assignedProviderId) {
            onRateService(request.id, request.assignedProviderId, rating);
        }
    }

    const renderStatusBadge = () => {
        switch (request.status) {
            case RequestStatus.Open:
                return <span className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded">مفتوح</span>;
            case RequestStatus.Assigned:
                return <span className="bg-yellow-100 text-yellow-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded">قيد التنفيذ</span>;
            case RequestStatus.Completed:
                return <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded">مكتمل</span>;
        }
    };

    const BidCard: React.FC<{bid: Bid}> = ({ bid }) => {
        const provider = users.find(u => u.id === bid.providerId);
        if (!provider) return null;

        const avgRating = getProviderAvgRating(provider.id);
        const isFixedBudget = request.suggestedBudget !== null;

        return (
            <div className="border bg-white p-4 rounded-lg flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{provider.name}</p>
                        {provider.verificationVideoUrl && (
                            <button
                                onClick={() => setViewingVideo(provider.verificationVideoUrl || null)}
                                className="flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full hover:bg-teal-200 transition-colors"
                                title="شاهد فيديو التوثيق لهذا المزود"
                            >
                                <VideoIcon className="w-3 h-3" />
                                <span>فيديو موثق</span>
                            </button>
                        )}
                    </div>
                    {avgRating > 0 && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <StarIcon className="w-4 h-4 text-yellow-400 me-1" />
                            <span>{avgRating} / 10</span>
                        </div>
                    )}
                    {bid.message && <p className="text-gray-600 mt-2 text-sm italic">"{bid.message}"</p>}
                </div>
                <div className="text-left flex flex-col items-end">
                    {isFixedBudget ? (
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold">
                            <span className="text-2xl">✓</span>
                            <span>موافق</span>
                        </div>
                    ) : (
                        <p className="text-xl font-bold text-teal-600">{bid.price} د.ك</p>
                    )}
                    {isCustomerOwner && request.status === RequestStatus.Open && (
                        <button
                            onClick={() => onAcceptBid(bid)}
                            className="mt-2 px-4 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 font-semibold"
                        >
                            {isFixedBudget ? 'اختيار هذا المزود' : 'قبول العرض'}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-4xl mx-auto">
            {/* Video Modal */}
            {viewingVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50" onClick={() => setViewingVideo(null)}>
                    <div className="bg-white p-4 rounded-lg max-w-2xl w-full m-4 relative" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setViewingVideo(null)}
                            className="absolute -top-10 left-0 text-white hover:text-gray-300 text-2xl"
                        >
                            إغلاق &times;
                        </button>
                        <h3 className="text-lg font-bold mb-2 text-gray-800">فيديو تعريف المزود</h3>
                        <div className="relative pt-[56.25%] bg-black rounded">
                             <video controls autoPlay className="absolute top-0 left-0 w-full h-full rounded">
                                <source src={viewingVideo} type="video/mp4" />
                                متصفحك لا يدعم تشغيل الفيديو.
                            </video>
                        </div>
                    </div>
                </div>
            )}

            {/* Header section */}
            <div className="border-b pb-4 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                         {category && (
                            <div className="flex items-center gap-2 text-sm text-teal-600 mb-2">
                                <category.icon className="w-5 h-5" />
                                <span className="font-semibold">{category.name}</span>
                            </div>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
                        <p className="text-gray-500 mt-1">
                            مقدم من <span className="font-medium">{customer?.name || 'غير معروف'}</span>
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                         {renderStatusBadge()}
                         {/* Budget Display in Details */}
                         {request.suggestedBudget ? (
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                                <WalletIcon className="w-4 h-4" />
                                <span>ميزانية: {request.suggestedBudget} د.ك</span>
                            </div>
                         ) : (
                            <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                                <WalletIcon className="w-4 h-4" />
                                <span>بانتظار العروض</span>
                            </div>
                         )}
                    </div>
                </div>
                <p className="text-gray-700 mt-4 whitespace-pre-wrap leading-relaxed">{request.description}</p>
            </div>
            
             {/* Before and After Images */}
            {request.beforeImageUrl && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                        {request.afterImageUrl ? 'النتائج: قبل وبعد' : 'صورة "قبل" الخدمة'}
                    </h2>
                    <div className={`grid gap-4 ${request.afterImageUrl ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                        <figure>
                           {request.afterImageUrl && <figcaption className="text-center font-semibold mb-2 text-gray-600">قبل</figcaption>}
                            <img src={request.beforeImageUrl} alt="Before service" className="rounded-lg shadow-md w-full object-cover" />
                        </figure>
                        {request.afterImageUrl && (
                           <figure>
                               <figcaption className="text-center font-semibold mb-2 text-gray-600">بعد</figcaption>
                               <img src={request.afterImageUrl} alt="After service" className="rounded-lg shadow-md w-full object-cover" />
                           </figure>
                        )}
                    </div>
                </div>
            )}


            {/* Main Content Area: Bids, Assigned Info, Rating */}
            <div className="space-y-6">
                {/* --- Customer View --- */}
                {isCustomerOwner && (
                    <>
                        {request.status === RequestStatus.Open && (
                             <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-3">
                                    {request.suggestedBudget ?
                                        `مزودو الخدمة الموافقون (${bids.length})` :
                                        `العروض المقدمة (${bids.length})`
                                    }
                                </h2>
                                {bids.length > 0 ? (
                                    <div className="space-y-4">
                                        {bids.map(bid => <BidCard key={bid.id} bid={bid} />)}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 bg-gray-50 p-4 rounded-md">
                                        {request.suggestedBudget ?
                                            'لم يوافق أي مزود خدمة بعد.' :
                                            'لم يتم تقديم أي عروض بعد.'
                                        }
                                    </p>
                                )}
                            </div>
                        )}
                        
                        {request.status === RequestStatus.Assigned && assignedProvider && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">الخدمة قيد التنفيذ</h2>
                                <p className="mb-2">تم إسناد الطلب إلى: <span className="font-bold">{assignedProvider.name}</span></p>
                                {assignedProvider.verificationVideoUrl && (
                                     <button 
                                        onClick={() => setViewingVideo(assignedProvider.verificationVideoUrl || null)}
                                        className="mb-3 flex items-center gap-2 text-sm bg-teal-600 text-white px-3 py-1.5 rounded-md hover:bg-teal-700 transition-colors"
                                    >
                                        <VideoIcon className="w-4 h-4" />
                                        شاهد فيديو المزود
                                    </button>
                                )}
                                <p>للتواصل: <span className="font-bold">{assignedProvider.contactInfo}</span></p>
                                <button onClick={() => onCompleteRequest(request.id)} className="mt-4 w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700">
                                    تأكيد إتمام الخدمة
                                </button>
                            </div>
                        )}

                        {request.status === RequestStatus.Completed && request.assignedProviderId && (
                            isRated ? (
                                 <div className="bg-green-50 text-center p-4 rounded-lg border border-green-200">
                                    <h3 className="text-lg font-bold text-green-800">شكراً لتقييمك!</h3>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">قيم الخدمة المقدمة من {assignedProvider?.name}</h2>
                                    <StarRating onRate={setRating} />
                                    <button onClick={handleRatingSubmit} disabled={rating === 0} className="mt-4 w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-md hover:bg-yellow-600 disabled:bg-gray-300">
                                        إرسال التقييم
                                    </button>
                                </div>
                            )
                        )}
                    </>
                )}

                {/* --- Assigned Provider View --- */}
                {isProviderAssigned && request.status === RequestStatus.Assigned && customer && (
                     <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">معلومات العميل</h2>
                        <div className="space-y-2">
                            <p>اسم العميل: <span className="font-bold">{customer.name}</span></p>
                            <p>للتواصل: <span className="font-bold">{customer.contactInfo}</span></p>
                            
                            {/* Address Display for Assigned Provider */}
                            <div className="mt-3 p-3 bg-white rounded border border-yellow-300">
                                <h3 className="font-bold text-gray-700 text-sm mb-1 flex items-center gap-1">
                                    <MapPinIcon className="w-4 h-4 text-gray-500" />
                                    عنوان العمل:
                                </h3>
                                <p className="text-gray-800 whitespace-pre-line leading-snug">
                                    {customer.address ? customer.address : 'لم يقم العميل بتحديد العنوان التفصيلي بعد.'}
                                </p>
                            </div>
                        </div>
                        
                        {!request.afterImageUrl && <AfterImageUpload requestId={request.id} onUpload={onUploadAfterImage} />}
                    </div>
                )}
                 
                 {/* --- Public/Other Provider View --- */}
                {!isCustomerOwner && request.status === RequestStatus.Assigned && assignedProvider && !isProviderAssigned && (
                     <div className="bg-gray-50 p-4 rounded-lg border">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">تم إسناد الطلب</h2>
                        <p>هذا الطلب قيد التنفيذ بواسطة <span className="font-bold">{assignedProvider.name}</span>.</p>
                    </div>
                )}

                {request.status === RequestStatus.Completed && !isCustomerOwner && (
                     <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h2 className="text-xl font-bold text-green-800 mb-2">الطلب مكتمل</h2>
                        <p>تم إنجاز هذه الخدمة بواسطة <span className="font-bold">{assignedProvider?.name || 'مزود خدمة'}</span>.</p>
                    </div>
                )}


                {/* Bid Form for Providers/Guests */}
                {(currentUser?.role === UserRole.Provider || !currentUser) && request.status === RequestStatus.Open && !hasProviderBid && (
                     <div className="bg-gray-50 p-6 rounded-lg border mt-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">قدم عرضك الآن</h2>
                        {request.suggestedBudget ? (
                            <div>
                                <div className="mb-6 bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-4 rounded-lg border-2 border-blue-200 text-center">
                                    <p className="text-sm text-gray-600 mb-2">الميزانية المحددة من العميل</p>
                                    <p className="text-4xl font-bold text-teal-700">{request.suggestedBudget} د.ك</p>
                                </div>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    onPlaceBid(request.id, 0, message || 'موافق على تنفيذ الطلب بالميزانية المحددة');
                                    setMessage('');
                                }} className="space-y-4">
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">رسالة إضافية (اختياري)</label>
                                        <textarea
                                            id="message"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={3}
                                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="يمكنني البدء فوراً بإذن الله..."
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 text-lg shadow-md">
                                        ✓ موافق على تنفيذ الطلب
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <form onSubmit={handleBidSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">السعر (د.ك)</label>
                                    <input
                                        type="number"
                                        id="price"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                        min="0.01"
                                        step="0.01"
                                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="20.00"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">رسالة إضافية (اختياري)</label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={3}
                                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="يمكنني البدء فوراً..."
                                    />
                                </div>
                                <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700">
                                    إرسال العرض
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
