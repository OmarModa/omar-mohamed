
import React, { useState } from 'react';
import type { ServiceRequest, Category } from '../types';
import { RequestStatus } from '../types';
import { ShareIcon, WalletIcon, MapPinIcon } from './icons';

interface RequestCardProps {
    request: ServiceRequest;
    category?: Category;
    customerName: string;
    onViewDetails: (id: number) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, category, customerName, onViewDetails }) => {
    const [copied, setCopied] = useState(false);
    
    const timeAgo = (date: Date): string => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `منذ ${Math.floor(interval)} سنوات`;
        interval = seconds / 2592000;
        if (interval > 1) return `منذ ${Math.floor(interval)} أشهر`;
        interval = seconds / 86400;
        if (interval > 1) return `منذ ${Math.floor(interval)} أيام`;
        interval = seconds / 3600;
        if (interval > 1) return `منذ ${Math.floor(interval)} ساعات`;
        interval = seconds / 60;
        if (interval > 1) return `منذ ${Math.floor(interval)} دقائق`;
        return `منذ ${Math.floor(seconds)} ثوان`;
    };

    const renderBadge = () => {
        if (request.status === RequestStatus.Completed) {
            return (
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    مكتمل ✅
                </span>
            );
        }

        const oneDayInMs = 24 * 60 * 60 * 1000;
        const isNew = (new Date().getTime() - request.createdAt.getTime()) < oneDayInMs;

        if (isNew) {
            return (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 animate-pulse">
                    جديد 🔥
                </span>
            );
        }

        return (
            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                {timeAgo(request.createdAt)}
            </span>
        );
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}?requestId=${request.id}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 duration-300 flex flex-col relative border border-gray-100">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                    {category ? (
                        <div className="flex items-center gap-2 text-sm text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                            <category.icon className="w-4 h-4" />
                            <span className="font-semibold">{category.name}</span>
                        </div>
                    ) : <div></div>}
                    
                    {renderBadge()}
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2 leading-snug">{request.title}</h3>
                <p className="text-gray-500 text-sm mb-3">
                    مقدم من: <span className="font-medium text-gray-700">{customerName}</span>
                </p>

                {/* Region Badge */}
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-3 font-medium bg-gray-50 w-fit px-2 py-1 rounded">
                    <MapPinIcon className="w-3 h-3" />
                    <span>{request.region}</span>
                </div>
                
                {/* Budget Display */}
                <div className="mt-4 flex items-center gap-2">
                    {request.suggestedBudget ? (
                         <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold text-sm w-fit">
                            <WalletIcon className="w-4 h-4" />
                            <span>الميزانية: {request.suggestedBudget} د.ك</span>
                        </div>
                    ) : (
                        <div className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg flex items-center gap-2 font-semibold text-sm w-fit">
                            <WalletIcon className="w-4 h-4" />
                            <span>بانتظار العروض</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex gap-2">
                 <button 
                    onClick={() => onViewDetails(request.id)}
                    className="flex-grow bg-teal-500 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-600 transition-colors"
                >
                    عرض التفاصيل
                </button>
                <button 
                    onClick={handleShare}
                    className="bg-white text-gray-600 border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center min-w-[44px]"
                    title="نسخ رابط الطلب"
                >
                    {copied ? (
                        <span className="text-green-600 font-bold text-xs">تم!</span>
                    ) : (
                        <ShareIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
};