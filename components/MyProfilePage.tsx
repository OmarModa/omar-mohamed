
import React, { useState, useMemo } from 'react';
import type { User, ServiceRequest, Bid, Rating, Category } from '../types';
import { UserRole, RequestStatus } from '../types';
import { StarIcon, VideoIcon, CheckCircleIcon, MapPinIcon, PhoneIcon } from './icons';

interface MyProfilePageProps {
    viewedUser: User;
    currentUser: User | null;
    requests: ServiceRequest[];
    bids: Bid[];
    ratings: Rating[];
    users: User[];
    categories: Category[];
    onViewDetails: (id: number) => void;
    getProviderAvgRating: (providerId: number) => number;
    onUpdateVideo: (videoUrl: string) => void;
    onUpdateAddress: (address: string) => void;
    onUpdateContact: (phone: string) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

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

export const MyProfilePage: React.FC<MyProfilePageProps> = ({ viewedUser, currentUser, requests, bids, ratings, users, categories, onViewDetails, getProviderAvgRating, onUpdateVideo, onUpdateAddress, onUpdateContact }) => {
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [addressInput, setAddressInput] = useState(viewedUser.address || '');
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phoneInput, setPhoneInput] = useState(viewedUser.contactInfo || '');

    const isOwnProfile = currentUser?.id === viewedUser.id;

    const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploadingVideo(true);
            try {
                const file = e.target.files[0];
                if (file.size > 10 * 1024 * 1024) {
                    alert("حجم الفيديو كبير جداً. يرجى اختيار فيديو أصغر من 10 ميجابايت.");
                    return;
                }
                const base64 = await fileToBase64(file);
                setTimeout(() => {
                    onUpdateVideo(base64);
                    setIsUploadingVideo(false);
                }, 1500);
            } catch (error) {
                console.error("Error uploading video", error);
                setIsUploadingVideo(false);
            }
        }
    };

    const handleSaveAddress = () => {
        onUpdateAddress(addressInput);
        setIsEditingAddress(false);
    };

    const handleSavePhone = () => {
        onUpdateContact(phoneInput);
        setIsEditingPhone(false);
    }

    // If Viewing a Customer Profile (currently simple history view for self)
    if (viewedUser.role === UserRole.Customer) {
        if (!isOwnProfile) {
            return (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl font-bold mx-auto mb-4">
                        {viewedUser.name[0]}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{viewedUser.name}</h2>
                    <p className="text-gray-500 mt-2">عميل</p>
                    <p className="text-gray-400 text-sm mt-1">تاريخ الانضمام: {new Date(viewedUser.registeredAt).toLocaleDateString('ar-KW')}</p>
                </div>
            );
        }

        const myRequests = requests.filter(r => r.customerId === viewedUser.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return (
            <div>
                 {/* Customer Info Card */}
                 <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl font-bold shrink-0">
                        {viewedUser.name[0]}
                    </div>
                    <div className="flex-grow w-full">
                         <h2 className="text-2xl font-bold text-gray-800">{viewedUser.name}</h2>
                         <p className="text-gray-500 mb-4">عميل</p>
                         
                         {/* Contact Info Editing Section (Only visible to self) */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Address Section */}
                             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                         <MapPinIcon className="w-4 h-4" />
                                         العنوان المحفوظ
                                     </h3>
                                     {!isEditingAddress && (
                                         <button onClick={() => { setAddressInput(viewedUser.address || ''); setIsEditingAddress(true); }} className="text-xs text-teal-600 hover:text-teal-800 font-semibold">
                                             تعديل
                                         </button>
                                     )}
                                 </div>
                                 
                                 {isEditingAddress ? (
                                     <div className="flex flex-col gap-2">
                                         <input 
                                            type="text" 
                                            value={addressInput} 
                                            onChange={e => setAddressInput(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                            placeholder="القطعة، الشارع، المنزل..."
                                         />
                                         <div className="flex gap-2">
                                            <button onClick={handleSaveAddress} className="bg-teal-600 text-white px-3 py-1 rounded text-sm font-bold">حفظ</button>
                                            <button onClick={() => setIsEditingAddress(false)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm">إلغاء</button>
                                         </div>
                                     </div>
                                 ) : (
                                     <p className="text-gray-700 text-sm leading-relaxed">
                                         {viewedUser.address || <span className="text-gray-400 italic">لم تقم بإضافة عنوان بعد.</span>}
                                     </p>
                                 )}
                                 <p className="text-xs text-gray-400 mt-2">ملاحظة: هذا العنوان يظهر فقط لمزود الخدمة الذي تقبل عرضه.</p>
                             </div>

                             {/* Phone Section */}
                             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                         <PhoneIcon className="w-4 h-4" />
                                         رقم الهاتف
                                     </h3>
                                     {!isEditingPhone && (
                                         <button onClick={() => { setPhoneInput(viewedUser.contactInfo || ''); setIsEditingPhone(true); }} className="text-xs text-teal-600 hover:text-teal-800 font-semibold">
                                             تعديل
                                         </button>
                                     )}
                                 </div>
                                 
                                 {isEditingPhone ? (
                                     <div className="flex flex-col gap-2">
                                         <input 
                                            type="tel" 
                                            value={phoneInput} 
                                            onChange={e => setPhoneInput(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                            placeholder="رقم الهاتف"
                                         />
                                         <div className="flex gap-2">
                                            <button onClick={handleSavePhone} className="bg-teal-600 text-white px-3 py-1 rounded text-sm font-bold">حفظ</button>
                                            <button onClick={() => setIsEditingPhone(false)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm">إلغاء</button>
                                         </div>
                                     </div>
                                 ) : (
                                     <p className="text-gray-700 text-sm leading-relaxed font-mono font-semibold">
                                         {viewedUser.contactInfo}
                                     </p>
                                 )}
                                 <p className="text-xs text-gray-400 mt-2">ملاحظة: هذا الرقم يظهر لمزود الخدمة للتواصل عند قبول العرض.</p>
                             </div>
                         </div>
                    </div>
                </div>

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
    
    // --- Provider Profile View (Both Public & Private) ---
    
    const avgRating = getProviderAvgRating(viewedUser.id);
    const completedJobsCount = useMemo(() => 
        requests.filter(r => r.assignedProviderId === viewedUser.id && r.status === RequestStatus.Completed).length
    , [requests, viewedUser.id]);

    const providerRatings = useMemo(() => 
        ratings.filter(r => r.providerId === viewedUser.id).sort((a,b) => b.id - a.id)
    , [ratings, viewedUser.id]);

    const activeProviderJobs = useMemo(() => 
        requests.filter(r => r.assignedProviderId === viewedUser.id && r.status !== RequestStatus.Completed)
        .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
    , [requests, viewedUser.id]);

    const completedProviderJobs = useMemo(() => 
        requests.filter(r => r.assignedProviderId === viewedUser.id && r.status === RequestStatus.Completed)
        .sort((a,b) => (b.completedAt?.getTime() || b.createdAt.getTime()) - (a.completedAt?.getTime() || a.createdAt.getTime()))
    , [requests, viewedUser.id]);

    const providerCategory = categories.find(c => c.id === viewedUser.specializationId);

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                    
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
                            {viewedUser.name[0]}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">{viewedUser.name}</h2>
                             {providerCategory ? (
                                <span className="inline-block bg-teal-100 text-teal-800 text-sm font-semibold px-2.5 py-0.5 rounded mt-1">
                                    {providerCategory.name}
                                </span>
                            ) : (
                                <span className="text-gray-500 mt-1 block">مزود خدمة</span>
                            )}
                            <p className="text-gray-400 text-sm mt-1">عضو منذ {new Date(viewedUser.registeredAt).toLocaleDateString('ar-KW')}</p>
                            
                            {/* Provider Contact Info (Visible to Public) */}
                            <div className="mt-4 space-y-1">
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <PhoneIcon className="w-4 h-4 text-teal-600" />
                                    <span dir="ltr" className="font-mono font-bold">{viewedUser.contactInfo}</span>
                                </div>
                                {viewedUser.region && (
                                     <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <MapPinIcon className="w-4 h-4 text-teal-600" />
                                        <span>{viewedUser.region}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-center border-l pl-6 border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">خدمات منجزة</p>
                            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-teal-600">
                                <CheckCircleIcon className="w-6 h-6"/>
                                <span>{completedJobsCount}</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">التقييم العام</p>
                            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-500">
                                <StarIcon className="w-6 h-6"/>
                                <span>{avgRating > 0 ? avgRating : '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Section */}
                <div className="mt-8 border-t pt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <VideoIcon className="w-6 h-6 text-teal-600" />
                        الفيديو التعريفي
                    </h3>
                    
                    {viewedUser.verificationVideoUrl ? (
                         <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-lg max-w-2xl mx-auto">
                             <video controls className="absolute top-0 left-0 w-full h-full">
                                <source src={viewedUser.verificationVideoUrl} type="video/mp4" />
                                متصفحك لا يدعم تشغيل الفيديو.
                            </video>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-center py-8 bg-gray-50 rounded-lg">
                            {isOwnProfile ? 'لم تقم برفع فيديو تعريفي بعد.' : 'لم يقم مزود الخدمة برفع فيديو تعريفي.'}
                        </p>
                    )}

                    {isOwnProfile && (
                        <div className="mt-4 max-w-md mx-auto">
                             <label className="block mb-2 text-sm font-medium text-gray-900">
                                {viewedUser.verificationVideoUrl ? 'تحديث الفيديو التعريفي' : 'رفع فيديو تعريفي'}
                             </label>
                             <input 
                                type="file" 
                                accept="video/*"
                                onChange={handleVideoChange}
                                disabled={isUploadingVideo}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                             />
                             {isUploadingVideo && <p className="text-blue-600 text-sm mt-2">جاري رفع الفيديو...</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Public Reviews Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                 <h3 className="text-2xl font-bold text-gray-800 mb-6">آراء العملاء ({providerRatings.length})</h3>
                 {providerRatings.length > 0 ? (
                     <div className="space-y-4">
                         {providerRatings.map(rating => {
                             const customerName = users.find(u => u.id === rating.customerId)?.name || 'عميل';
                             const relatedRequest = requests.find(r => r.id === rating.requestId);
                             return (
                                 <div key={rating.id} className="border-b pb-4 last:border-0 last:pb-0">
                                     <div className="flex justify-between items-start mb-2">
                                         <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                                                {customerName[0]}
                                            </div>
                                            <span className="font-bold text-gray-800">{customerName}</span>
                                         </div>
                                         <div className="flex items-center text-yellow-400">
                                             {[...Array(10)].map((_, i) => (
                                                 <StarIcon key={i} className={`w-3 h-3 ${i < rating.score ? 'fill-current' : 'text-gray-300'}`} />
                                             ))}
                                             <span className="text-gray-600 text-sm mr-2 font-semibold">{rating.score}/10</span>
                                         </div>
                                     </div>
                                     {relatedRequest && <p className="text-gray-500 text-sm mt-1">خدمة: {relatedRequest.title}</p>}
                                 </div>
                             );
                         })}
                     </div>
                 ) : (
                     <p className="text-gray-500 text-center py-4">لا توجد تقييمات بعد.</p>
                 )}
            </div>

            {/* Private Section: My Jobs (Only visible to owner) */}
            {isOwnProfile && (
                <>
                    {/* Active Jobs */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">المهام الجارية</h3>
                        <div className="space-y-4">
                            {activeProviderJobs.length > 0 ? activeProviderJobs.map(req => {
                                const customerName = users.find(u => u.id === req.customerId)?.name || 'غير معروف';
                                return (
                                    <HistoryRequestCard
                                        key={req.id}
                                        request={req}
                                        category={categories.find(c => c.id === req.categoryId)}
                                        otherPartyName={`العميل: ${customerName}`}
                                        onViewDetails={onViewDetails}
                                    />
                                );
                            }) : <p className="text-gray-500">لا توجد مهام قيد التنفيذ حالياً.</p>}
                        </div>
                    </div>

                    {/* Completed Services History Table */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            سجل الخدمات المكتملة
                        </h3>
                        {completedProviderJobs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-right">عنوان الخدمة</th>
                                            <th scope="col" className="px-6 py-3 text-right">العميل</th>
                                            <th scope="col" className="px-6 py-3 text-right">تاريخ الإنجاز</th>
                                            <th scope="col" className="px-6 py-3 text-right">التفاصيل</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedProviderJobs.map(req => {
                                            const customer = users.find(u => u.id === req.customerId);
                                            return (
                                                <tr key={req.id} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-900 text-right">
                                                        {req.title}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {customer?.name || 'غير معروف'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {req.completedAt ? new Date(req.completedAt).toLocaleDateString('ar-KW') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => onViewDetails(req.id)}
                                                            className="text-teal-600 hover:text-teal-900 font-bold"
                                                        >
                                                            عرض
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">لا توجد خدمات مكتملة في سجلك حتى الآن.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
