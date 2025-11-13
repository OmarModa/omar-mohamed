
import React from 'react';
import type { User, ServiceRequest, Bid } from '../types';
import { UserRole, RequestStatus } from '../types';

interface AdminPageProps {
    users: User[];
    requests: ServiceRequest[];
    bids: Bid[];
}

const StatCard: React.FC<{title: string; value: string | number;}> = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-sm font-semibold uppercase">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
);

export const AdminPage: React.FC<AdminPageProps> = ({ users, requests, bids }) => {
    
    const appUsers = users.filter(u => u.role !== UserRole.Admin);
    const completedRequests = requests.filter(r => r.status === RequestStatus.Completed);

    const totalRevenue = completedRequests.reduce((acc, req) => {
        const acceptedBid = bids.find(b => b.id === req.acceptedBidId);
        return acc + (acceptedBid?.price || 0);
    }, 0);

    const totalCommission = totalRevenue * 0.10; // 10% total commission

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-KW', { style: 'currency', currency: 'KWD' }).format(amount);
    };
    
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ar-KW', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    };

    const roleToText = (role: UserRole) => {
        if (role === UserRole.Customer) return "عميل";
        if (role === UserRole.Provider) return "مزود خدمة";
        return "مشرف";
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم المشرف</h1>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="إجمالي المستخدمين" value={appUsers.length} />
                <StatCard title="إجمالي الطلبات" value={requests.length} />
                <StatCard title="الطلبات المكتملة" value={completedRequests.length} />
                <StatCard title="إجمالي الأرباح" value={formatCurrency(totalCommission)} />
            </div>

            {/* Users Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-2xl font-bold text-gray-800 mb-4">إدارة المستخدمين</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">الاسم</th>
                                <th scope="col" className="px-6 py-3">الدور</th>
                                <th scope="col" className="px-6 py-3">رقم الهاتف</th>
                                <th scope="col" className="px-6 py-3">تاريخ التسجيل</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appUsers.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {user.name}
                                    </th>
                                    <td className="px-6 py-4">{roleToText(user.role)}</td>
                                    <td className="px-6 py-4">{user.contactInfo}</td>
                                    <td className="px-6 py-4">{formatDate(user.registeredAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
            
            {/* Financial Records Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-2xl font-bold text-gray-800 mb-4">السجل المالي (الطلبات المكتملة)</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">#الطلب</th>
                                <th scope="col" className="px-6 py-3">عنوان الطلب</th>
                                <th scope="col" className="px-6 py-3">سعر الخدمة</th>
                                <th scope="col" className="px-6 py-3">رسوم العميل (5%)</th>
                                <th scope="col" className="px-6 py-3">رسوم المزود (5%)</th>
                                <th scope="col" className="px-6 py-3">إجمالي العمولة (10%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedRequests.map(req => {
                                const acceptedBid = bids.find(b => b.id === req.acceptedBidId);
                                if (!acceptedBid) return null;
                                const price = acceptedBid.price;
                                const customerFee = price * 0.05;
                                const providerFee = price * 0.05;
                                const totalFee = customerFee + providerFee;

                                return (
                                <tr key={req.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{req.id}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {req.title}
                                    </th>
                                    <td className="px-6 py-4 font-semibold">{formatCurrency(price)}</td>
                                    <td className="px-6 py-4 text-red-600">{formatCurrency(customerFee)}</td>
                                    <td className="px-6 py-4 text-red-600">{formatCurrency(providerFee)}</td>
                                    <td className="px-6 py-4 text-green-600 font-bold">{formatCurrency(totalFee)}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};
