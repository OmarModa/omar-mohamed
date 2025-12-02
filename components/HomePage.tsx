
import React, { useState, useMemo, useEffect } from 'react';
import type { User, ServiceRequest, Category } from '../types';
import { UserRole } from '../types';
import { RequestCard } from './RequestCard';
import { REGIONS } from '../constants';
import { MapPinIcon } from './icons';

interface NewRequestFormProps {
    categories: Category[];
    onCreateRequest: (title: string, description: string, categoryId: number, beforeImageUrl: string | null, suggestedBudget?: number, region?: string) => void;
    initialCategoryId?: number;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};


const NewRequestForm: React.FC<NewRequestFormProps> = ({ categories, onCreateRequest, initialCategoryId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 0);
    const [region, setRegion] = useState<string>(REGIONS[0]);
    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [budgetType, setBudgetType] = useState<'open' | 'fixed'>('open');
    const [budgetAmount, setBudgetAmount] = useState<string>('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialCategoryId) {
            setCategoryId(initialCategoryId);
        }
    }, [initialCategoryId]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setBeforeImage(base64);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !categoryId || !region) {
            setError('الرجاء تعبئة جميع الحقول.');
            return;
        }

        if (budgetType === 'fixed' && (!budgetAmount || parseFloat(budgetAmount) <= 0)) {
            setError('الرجاء إدخال مبلغ صحيح للميزانية.');
            return;
        }

        const suggestedBudget = budgetType === 'fixed' ? parseFloat(budgetAmount) : undefined;

        onCreateRequest(title, description, categoryId, beforeImage, suggestedBudget, region);
        setTitle('');
        setDescription('');
        // We keep the selected category or reset to default, choice is optional. keeping selected is better UX for multiple requests.
        setBeforeImage(null);
        setBudgetType('open');
        setBudgetAmount('');
        setError('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8" id="new-request-form">
            <h2 className="text-2xl font-bold mb-4 text-teal-700">اطلب خدمة جديدة</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">عنوان الطلب</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="مثال: إصلاح تسريب في المطبخ"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                        <select
                            id="category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:ring-teal-500 focus:border-teal-500"
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                         <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
                         <select
                            id="region"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:ring-teal-500 focus:border-teal-500"
                         >
                            {REGIONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                         </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">وصف تفصيلي للخدمة</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="يرجى توضيح كل التفاصيل اللازمة لمزود الخدمة"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>
                

                {/* Budget Selection Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تحديد الميزانية</label>
                    <div className="flex flex-col sm:flex-row gap-4 mb-2">
                        <label className={`flex items-center gap-2 border p-3 rounded-lg cursor-pointer transition-colors ${budgetType === 'open' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                            <input 
                                type="radio" 
                                name="budgetType" 
                                value="open" 
                                checked={budgetType === 'open'} 
                                onChange={() => setBudgetType('open')}
                                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="font-semibold">انتظار عروض الأسعار</span>
                            <span className="text-xs text-gray-500 block sm:hidden md:block">(مقدمو الخدمة يحددون السعر)</span>
                        </label>
                        <label className={`flex items-center gap-2 border p-3 rounded-lg cursor-pointer transition-colors ${budgetType === 'fixed' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                            <input 
                                type="radio" 
                                name="budgetType" 
                                value="fixed" 
                                checked={budgetType === 'fixed'} 
                                onChange={() => setBudgetType('fixed')}
                                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="font-semibold">لدي ميزانية محددة</span>
                        </label>
                    </div>

                    {budgetType === 'fixed' && (
                        <div className="animate-fade-in-down mt-2">
                             <label htmlFor="budgetAmount" className="block text-sm font-medium text-gray-700 mb-1">المبلغ المقترح (د.ك)</label>
                             <input
                                type="number"
                                id="budgetAmount"
                                value={budgetAmount}
                                onChange={(e) => setBudgetAmount(e.target.value)}
                                min="1"
                                placeholder="مثال: 20"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    )}
                </div>


                <div>
                    <label htmlFor="before-image" className="block text-sm font-medium text-gray-700 mb-1">
                        إضافة صورة (اختياري)
                    </label>
                    <input
                        type="file"
                        id="before-image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    />
                     {beforeImage && <img src={beforeImage} alt="Preview" className="mt-2 rounded-lg max-h-40" />}
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 transition-colors">
                    إرسال الطلب
                </button>
            </form>
        </div>
    );
};


interface HomePageProps {
    currentUser: User | null;
    requests: ServiceRequest[];
    categories: Category[];
    users: User[];
    onCreateRequest: (title: string, description: string, categoryId: number, beforeImageUrl: string | null, suggestedBudget?: number, region?: string) => void;
    onViewDetails: (id: number) => void;
    onDeleteRequest?: (id: number) => void;
    initialCategoryId?: number;
}

export const HomePage: React.FC<HomePageProps> = ({ currentUser, requests, categories, users, onCreateRequest, onViewDetails, onDeleteRequest, initialCategoryId }) => {
    const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
    const [activeRegion, setActiveRegion] = useState<string>('all');

    // If initialCategoryId is passed, we might want to filter by it too, but mainly it's for the form.
    // For now, let's keep the filter independent or we can sync it.
    useEffect(() => {
        if (initialCategoryId) {
            setActiveCategory(initialCategoryId);
        }
    }, [initialCategoryId]);

    const filteredRequests = useMemo(() => {
        return requests.filter(r => {
            const matchesCategory = activeCategory === 'all' || r.categoryId === activeCategory;
            const matchesRegion = activeRegion === 'all' || r.region === activeRegion;
            return matchesCategory && matchesRegion;
        });
    }, [requests, activeCategory, activeRegion]);

    const categoryCounts = useMemo(() => {
        const counts: Record<number, number> = {};
        requests.forEach(r => {
            if (activeRegion === 'all' || r.region === activeRegion) {
                counts[r.categoryId] = (counts[r.categoryId] || 0) + 1;
            }
        });
        return counts;
    }, [requests, activeRegion]);

    const userStats = useMemo(() => {
        if (!currentUser) return null;

        if (currentUser.role === UserRole.Customer) {
            const myRequests = requests.filter(r => r.customerId === currentUser.id);
            return {
                total: myRequests.length,
                label: 'طلباتي المفتوحة'
            };
        } else if (currentUser.role === UserRole.Provider) {
            return {
                total: requests.length,
                label: 'طلبات متاحة للعروض'
            };
        }
        return null;
    }, [currentUser, requests]);

    return (
        <div>
            {currentUser && userStats && (
                <div className="mb-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">مرحباً، {currentUser.name}</h2>
                            <p className="opacity-90">
                                {currentUser.role === UserRole.Customer
                                    ? 'يمكنك تصفح الطلبات أو إنشاء طلب جديد'
                                    : 'تصفح الطلبات وقدم عروضك'
                                }
                            </p>
                        </div>
                        <div className="text-center bg-white bg-opacity-20 rounded-lg px-6 py-4">
                            <div className="text-4xl font-bold">{userStats.total}</div>
                            <div className="text-sm opacity-90 mt-1">{userStats.label}</div>
                        </div>
                    </div>
                </div>
            )}

            {currentUser?.role !== UserRole.Provider && (
                <NewRequestForm
                    categories={categories}
                    onCreateRequest={onCreateRequest}
                    initialCategoryId={initialCategoryId}
                />
            )}
             <div className="flex flex-col gap-4 border-b-2 border-gray-200 pb-4 mb-6">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">الطلبات المفتوحة</h2>
                    
                    {/* Region Filter Dropdown */}
                    <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                        <MapPinIcon className="w-5 h-5 text-gray-500 ml-2" />
                        <select 
                            value={activeRegion} 
                            onChange={(e) => setActiveRegion(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700 cursor-pointer outline-none"
                        >
                            <option value="all">جميع المناطق</option>
                            {REGIONS.map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>
                 </div>
                 
                 {/* Category Filter */}
                 <div className="w-full overflow-x-auto pb-2">
                     <div className="flex gap-2">
                         <button
                             onClick={() => setActiveCategory('all')}
                             className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                                 activeCategory === 'all'
                                     ? 'bg-teal-600 text-white'
                                     : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                             }`}
                         >
                             الكل
                             <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === 'all' ? 'bg-white text-teal-600' : 'bg-gray-300 text-gray-700'}`}>
                                 {requests.filter(r => activeRegion === 'all' || r.region === activeRegion).length}
                             </span>
                         </button>
                         {categories.map(cat => (
                             <button
                                 key={cat.id}
                                 onClick={() => setActiveCategory(cat.id)}
                                 className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                                     activeCategory === cat.id
                                         ? 'bg-teal-600 text-white'
                                         : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                 }`}
                             >
                                 <cat.icon className="w-4 h-4" />
                                 {cat.name}
                                 {categoryCounts[cat.id] ? (
                                     <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white text-teal-600' : 'bg-white/50 text-gray-700'}`}>
                                         {categoryCounts[cat.id]}
                                     </span>
                                 ) : null}
                             </button>
                         ))}
                     </div>
                 </div>
             </div>

            {filteredRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map(request => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            category={categories.find(c => c.id === request.categoryId)}
                            customerName={users.find(u => u.id === request.customerId)?.name || 'غير معروف'}
                            onViewDetails={onViewDetails}
                            onDelete={onDeleteRequest}
                            showDelete={currentUser?.id === request.customerId}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500 text-lg">لا توجد طلبات مطابقة لخيارات البحث الحالية.</p>
                </div>
            )}
        </div>
    );
};