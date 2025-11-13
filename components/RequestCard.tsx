
import React from 'react';
import type { ServiceRequest, Category } from '../types';

interface RequestCardProps {
    request: ServiceRequest;
    category?: Category;
    customerName: string;
    onViewDetails: (id: number) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, category, customerName, onViewDetails }) => {
    
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

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 duration-300 flex flex-col">
            <div className="p-5 flex-grow">
                {category && (
                    <div className="flex items-center gap-2 text-sm text-teal-600 mb-2">
                        <category.icon className="w-5 h-5" />
                        <span className="font-semibold">{category.name}</span>
                    </div>
                )}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{request.title}</h3>
                <p className="text-gray-500 text-sm mb-4">
                    مقدم من: <span className="font-medium text-gray-700">{customerName}</span>
                </p>
                <p className="text-gray-400 text-xs">{timeAgo(request.createdAt)}</p>
            </div>
            <div className="p-4 bg-gray-50 border-t">
                 <button 
                    onClick={() => onViewDetails(request.id)}
                    className="w-full bg-teal-500 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-600 transition-colors"
                >
                    عرض التفاصيل وتقديم عرض
                </button>
            </div>
        </div>
    );
};
