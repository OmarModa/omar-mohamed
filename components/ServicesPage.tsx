
import React, { useState, useMemo } from 'react';
import type { Category, ServiceRequest, User } from '../types';
import { RequestCard } from './RequestCard';
import { REGIONS } from '../constants';
import { MapPinIcon } from './icons';

interface ServicesPageProps {
    categories: Category[];
    requests: ServiceRequest[];
    users: User[];
    onRequestService: (categoryId: number) => void;
    onViewDetails: (id: number) => void;
}

const SERVICE_DESCRIPTIONS: Record<number, string> = {
    1: 'غسيل، تلميع، صيانة دورية، وإصلاح الأعطال الميكانيكية والكهربائية للسيارات.',
    2: 'صيانة وتركيب وحدات التكييف المركزية والوحدات المنفصلة وتنظيف الفلاتر.',
    3: 'تأسيس شبكات الكهرباء، تركيب الإضاءة، وإصلاح الأعطال الكهربائية المنزلية.',
    11: 'كشف التسريبات، تأسيس السباكة، تركيب الأدوات الصحية وصيانة المضخات.',
    4: 'تنظيف شامل للمنازل، الشقق، الفلل، غسيل السجاد والكنب والواجهات.',
    5: 'استشارات قانونية، صياغة عقود، وتمثيل قانوني في مختلف القضايا.',
    6: 'صيانة الغسالات، الثلاجات، الأفران، وجميع الأجهزة المنزلية الكبيرة والصغيرة.',
    7: 'دروس تقوية لجميع المراحل الدراسية، تعليم لغات، ودورات تدريبية متخصصة.',
    8: 'تنسيق الحدائق، زراعة الورود والأشجار، تركيب شبكات الري والعشب الصناعي.',
    9: 'تصميم جرافيك، برمجة مواقع وتطبيقات، وتسويق إلكتروني.',
    10: 'نقل عفش، فك وتركيب الأثاث، تغليف احترافي ونقل آمن.',
    22: 'خدمات تطوعية ومجانية - ساعد مجتمعك! تنظيف المساجد، مساعدة كبار السن، وغيرها من الأعمال الخيرية.',
};

export const ServicesPage: React.FC<ServicesPageProps> = ({ categories, requests, users, onRequestService, onViewDetails }) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [activeRegion, setActiveRegion] = useState<string>('all');

    // Calculate request counts per category
    const categoryCounts = useMemo(() => {
        const counts: Record<number, number> = {};
        requests.forEach(r => {
            // Include in count only if it matches current region filter (or if filter is 'all')
            if (activeRegion === 'all' || r.region === activeRegion) {
                 counts[r.categoryId] = (counts[r.categoryId] || 0) + 1;
            }
        });
        return counts;
    }, [requests, activeRegion]);

    // Filter requests for the selected category and region
    const selectedCategoryRequests = useMemo(() => {
        if (!selectedCategoryId) return [];
        return requests.filter(r => {
            const matchesCategory = r.categoryId === selectedCategoryId;
            const matchesRegion = activeRegion === 'all' || r.region === activeRegion;
            return matchesCategory && matchesRegion;
        });
    }, [requests, selectedCategoryId, activeRegion]);

    const selectedCategory = categories.find(c => c.id === selectedCategoryId);

    // Render category list view
    if (!selectedCategoryId) {
        return (
            <div className="space-y-8">
                <div className="text-center max-w-2xl mx-auto mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">خدماتنا</h1>
                    <p className="text-gray-600 text-lg">
                        تصفح الأقسام لرؤية الطلبات المتاحة أو اختر قسماً لطلب خدمة جديدة.
                    </p>
                </div>
                
                 {/* Region Filter - Global for Services Page */}
                 <div className="flex justify-center mb-8">
                    <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm">
                        <span className="text-gray-600 font-semibold ml-2 text-sm">تصفح الطلبات في:</span>
                        <MapPinIcon className="w-5 h-5 text-teal-600 ml-1" />
                        <select 
                            value={activeRegion} 
                            onChange={(e) => setActiveRegion(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-gray-800 font-bold cursor-pointer outline-none"
                        >
                            <option value="all">كل الكويت</option>
                            {REGIONS.map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => {
                        const count = categoryCounts[category.id] || 0;
                        return (
                            <div 
                                key={category.id} 
                                onClick={() => setSelectedCategoryId(category.id)}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer relative"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                                            <category.icon className="w-7 h-7" />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${count > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {count} طلبات متاحة
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                                    <p className="text-gray-500 mb-6 text-sm leading-relaxed min-h-[60px]">
                                        {SERVICE_DESCRIPTIONS[category.id] || 'خدمات احترافية ومميزة بأعلى معايير الجودة.'}
                                    </p>
                                    <button
                                        className="w-full py-2.5 px-4 bg-white border-2 border-teal-600 text-teal-600 font-bold rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors"
                                    >
                                        تصفح الطلبات
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-8 text-center text-white mt-12 shadow-lg">
                    <h2 className="text-2xl font-bold mb-3">لم تجد ما تبحث عنه؟</h2>
                    <p className="mb-6 opacity-90">يمكنك تقديم طلب خدمة عام وسيقوم المختصون بالتواصل معك.</p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRequestService(categories[0].id); }}
                        className="bg-white text-teal-700 font-bold py-3 px-8 rounded-full shadow-md hover:bg-gray-100 transition-transform hover:scale-105"
                    >
                        إنشاء طلب مخصص
                    </button>
                </div>
            </div>
        );
    }

    // Render Requests within a specific category
    if (selectedCategory) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-lg shadow-sm gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => setSelectedCategoryId(null)}
                            className="text-gray-500 hover:text-gray-800 text-sm font-bold flex items-center gap-1"
                        >
                            <span className="text-xl">→</span> رجوع
                        </button>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <selectedCategory.icon className="w-6 h-6 text-teal-600" />
                            طلبات {selectedCategory.name}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center bg-gray-100 rounded-md px-2 py-1">
                            <MapPinIcon className="w-4 h-4 text-gray-500 ml-1" />
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

                        <button
                            onClick={() => onRequestService(selectedCategory.id)}
                            className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 transition-colors text-sm whitespace-nowrap"
                        >
                            طلب جديد
                        </button>
                    </div>
                </div>

                {selectedCategoryRequests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {selectedCategoryRequests.map(request => (
                            <RequestCard 
                                key={request.id}
                                request={request}
                                category={selectedCategory}
                                customerName={users.find(u => u.id === request.customerId)?.name || 'غير معروف'}
                                onViewDetails={onViewDetails}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 text-lg mb-4">
                            {activeRegion === 'all' 
                                ? `لا توجد طلبات مفتوحة في قسم ${selectedCategory.name} حالياً.` 
                                : `لا توجد طلبات مفتوحة في قسم ${selectedCategory.name} في منطقة ${activeRegion}.`
                            }
                        </p>
                        <button 
                            onClick={() => onRequestService(selectedCategory.id)}
                            className="text-teal-600 font-bold hover:underline"
                        >
                            كن أول من يطلب خدمة هنا!
                        </button>
                    </div>
                )}
            </div>
        );
    }
    
    return null;
};