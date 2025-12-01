
import React, { useState, useMemo } from 'react';
import type { User, Category, Rating } from '../types';
import { UserRole } from '../types';
import { StarIcon, VideoIcon, MapPinIcon, PhoneIcon } from './icons';
import { REGIONS } from '../constants';

interface ProvidersPageProps {
    users: User[];
    categories: Category[];
    ratings: Rating[];
    onViewProfile: (userId: number) => void;
}

export const ProvidersPage: React.FC<ProvidersPageProps> = ({ users, categories, ratings, onViewProfile }) => {
    const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
    const [activeRegion, setActiveRegion] = useState<string>('all');

    const getProviderAvgRating = (providerId: number) => {
        const providerRatings = ratings.filter(r => r.providerId === providerId);
        if (providerRatings.length === 0) return 0;
        const totalScore = providerRatings.reduce((acc, r) => acc + r.score, 0);
        return parseFloat((totalScore / providerRatings.length).toFixed(1));
    };

    const providers = useMemo(() => {
        return users.filter(u => u.role === UserRole.Provider);
    }, [users]);

    const filteredProviders = useMemo(() => {
        return providers.filter(p => {
            const matchesCategory = activeCategory === 'all' || p.specializationId === activeCategory;
            const matchesRegion = activeRegion === 'all' || p.region === activeRegion;
            return matchesCategory && matchesRegion;
        });
    }, [providers, activeCategory, activeRegion]);

    // Count providers per category (filtered by region if selected)
    const categoryCounts = useMemo(() => {
        const counts: Record<number, number> = {};
        providers.forEach(p => {
            if (p.specializationId && (activeRegion === 'all' || p.region === activeRegion)) {
                counts[p.specializationId] = (counts[p.specializationId] || 0) + 1;
            }
        });
        return counts;
    }, [providers, activeRegion]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">دليل مقدمي الخدمات</h1>
            
            {/* Filters Section */}
            <div className="flex flex-col gap-4 border-b border-gray-200 pb-4">
                 <div className="flex items-center gap-2">
                     <span className="font-semibold text-gray-700">تصفية حسب المنطقة:</span>
                     <div className="flex items-center bg-white border border-gray-300 rounded-md px-2 py-1">
                        <MapPinIcon className="w-4 h-4 text-gray-500 ml-2" />
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
                <div className="overflow-x-auto pb-2">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                                activeCategory === 'all'
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            الكل
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === 'all' ? 'bg-white text-teal-600' : 'bg-gray-100 text-gray-700'}`}>
                                {providers.filter(p => activeRegion === 'all' || p.region === activeRegion).length}
                            </span>
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                                    activeCategory === cat.id
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <cat.icon className="w-4 h-4" />
                                {cat.name}
                                {categoryCounts[cat.id] ? (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white text-teal-600' : 'bg-gray-100 text-gray-700'}`}>
                                        {categoryCounts[cat.id]}
                                    </span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Providers Grid */}
            {filteredProviders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProviders.map(provider => {
                        const avgRating = getProviderAvgRating(provider.id);
                        const category = categories.find(c => c.id === provider.specializationId);
                        
                        return (
                            <div key={provider.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 flex flex-col">
                                <div className="p-6 flex-grow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
                                                {provider.name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800">{provider.name}</h3>
                                                {category ? (
                                                    <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-md font-medium mt-1 inline-block">
                                                        {category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 mt-1 inline-block">عام</span>
                                                )}
                                            </div>
                                        </div>
                                        {provider.verificationVideoUrl && (
                                            <div className="text-teal-500" title="موثق بفيديو">
                                                <VideoIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                            <StarIcon className="w-5 h-5 text-yellow-400" />
                                            <span className="font-bold text-gray-800">{avgRating > 0 ? avgRating : 'جديد'}</span>
                                        </div>
                                        {provider.region && (
                                            <div className="flex items-center gap-1 text-gray-500 text-sm font-medium bg-gray-50 px-2 py-1 rounded">
                                                <MapPinIcon className="w-4 h-4 text-teal-600" />
                                                <span>{provider.region}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone Display for Provider Card */}
                                    <div className="mb-4 bg-teal-50 border border-teal-100 rounded-lg p-2 flex items-center gap-3">
                                        <div className="bg-white p-1.5 rounded-full text-teal-600">
                                            <PhoneIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-teal-800 font-semibold">للتواصل</span>
                                            <span className="text-sm font-bold text-gray-800 font-mono" dir="ltr">{provider.contactInfo}</span>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-500 mb-4">
                                        <p className="flex items-center gap-2">
                                            <span className="font-semibold">تاريخ الانضمام:</span>
                                            {new Date(provider.registeredAt).toLocaleDateString('ar-KW')}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 border-t bg-gray-50">
                                    <button 
                                        onClick={() => onViewProfile(provider.id)}
                                        className="w-full bg-gray-800 text-white py-2 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
                                    >
                                        عرض الملف الشخصي
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg">لا يوجد مزودي خدمات مطابقين لخيارات البحث حالياً.</p>
                </div>
            )}
        </div>
    );
};
