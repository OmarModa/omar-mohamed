
import React, { useState } from 'react';
import type { User, ServiceRequest, Category } from '../types';
import { UserRole } from '../types';
import { RequestCard } from './RequestCard';

interface NewRequestFormProps {
    categories: Category[];
    onCreateRequest: (title: string, description: string, categoryId: number, beforeImageUrl: string | null) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};


const NewRequestForm: React.FC<NewRequestFormProps> = ({ categories, onCreateRequest }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 0);
    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setBeforeImage(base64);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !categoryId) {
            setError('الرجاء تعبئة جميع الحقول.');
            return;
        }
        onCreateRequest(title, description, categoryId, beforeImage);
        setTitle('');
        setDescription('');
        setCategoryId(categories[0]?.id || 0);
        setBeforeImage(null);
        setError('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4 text-teal-700">اطلب خدمة جديدة</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
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
    onCreateRequest: (title: string, description: string, categoryId: number, beforeImageUrl: string | null) => void;
    onViewDetails: (id: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ currentUser, requests, categories, users, onCreateRequest, onViewDetails }) => {
    return (
        <div>
            {currentUser?.role !== UserRole.Provider && (
                <NewRequestForm categories={categories} onCreateRequest={onCreateRequest} />
            )}
             <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-teal-500 pb-2">الطلبات المفتوحة حالياً</h2>
            {requests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map(request => (
                        <RequestCard 
                            key={request.id}
                            request={request}
                            category={categories.find(c => c.id === request.categoryId)}
                            customerName={users.find(u => u.id === request.customerId)?.name || 'غير معروف'}
                            onViewDetails={onViewDetails}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500 text-lg">لا توجد طلبات مفتوحة حالياً.</p>
                </div>
            )}
        </div>
    );
};