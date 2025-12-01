import React from 'react';
import { CheckCircleIcon, UserIcon, WalletIcon } from './icons';

interface LandingPageProps {
  onShowLogin: () => void;
  onShowRegister: () => void;
  onViewServices: () => void;
  onViewMarket: () => void;
  onViewTerms?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onShowLogin,
  onShowRegister,
  onViewServices,
  onViewMarket,
  onViewTerms
}) => {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-teal-500 to-teal-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-yellow-400 text-gray-800 px-6 py-2 rounded-full font-bold text-sm mb-4 animate-pulse">
            🎉 المنصة مجانية 100% - بدون عمولات!
          </div>
          <h1 className="text-5xl font-bold mb-6">مرحباً بك في سوق الخدمات</h1>
          <p className="text-2xl mb-8 opacity-90">
            منصتك الموثوقة لطلب وتقديم الخدمات في الكويت - مجاناً بالكامل
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onShowRegister}
              className="bg-white text-teal-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              ابدأ الآن - مجاناً
            </button>
            <button
              onClick={onShowLogin}
              className="bg-teal-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-teal-900 transition border-2 border-white"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">كيف تعمل المنصة؟</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-teal-600">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">اطلب الخدمة</h3>
              <p className="text-gray-600">حدد نوع الخدمة التي تحتاجها ووصف تفصيلي لطلبك</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-teal-600">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">استلم العروض</h3>
              <p className="text-gray-600">مزودو الخدمة المعتمدون يقدمون عروضهم وأسعارهم</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-teal-600">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">اختر الأفضل</h3>
              <p className="text-gray-600">قارن العروض واختر مزود الخدمة المناسب لك</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">خياران لك</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-teal-200">
              <h3 className="text-2xl font-bold mb-4 text-teal-600">طلبات مخصصة</h3>
              <p className="text-gray-600 mb-6">اطلب خدمة حسب احتياجك واستلم عروض من مزودي الخدمة المختلفين</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">مقارنة العروض والأسعار</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">تفاوض مباشر مع المزودين</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">مرونة في الميزانية والتوقيت</span>
                </li>
              </ul>
              <button
                onClick={onViewServices}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition"
              >
                تصفح الخدمات
              </button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-blue-200">
              <h3 className="text-2xl font-bold mb-4 text-blue-600">متجر الخدمات</h3>
              <p className="text-gray-600 mb-6">اشترِ خدمات جاهزة بأسعار محددة مسبقاً من مزودي الخدمة</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">أسعار واضحة ومحددة</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">حجز فوري وسريع</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">خدمات معروضة من مزودين موثوقين</span>
                </li>
              </ul>
              <button
                onClick={onViewMarket}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                تصفح المتجر
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">مميزات المنصة</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">مزودون معتمدون</h3>
              <p className="text-gray-600">جميع مزودي الخدمة معتمدون ومراجعون من قبل الإدارة</p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">مجانية 100%</h3>
              <p className="text-gray-600">بدون عمولات أو رسوم مخفية - تواصل مباشر بين العميل والمزود</p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">ضمان الجودة</h3>
              <p className="text-gray-600">نظام تقييم شفاف لضمان جودة الخدمات المقدمة</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-teal-600 to-teal-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">هل أنت مزود خدمة؟</h2>
          <p className="text-xl mb-8 opacity-90">
            انضم إلى منصتنا واعرض خدماتك لآلاف العملاء
          </p>
          <button
            onClick={onShowRegister}
            className="bg-white text-teal-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            سجل كمزود خدمة
          </button>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">سوق الخدمات</h3>
            <p className="text-gray-400">منصة موثوقة لربط العملاء بمزودي الخدمات في الكويت</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-gray-700">
            {onViewTerms && (
              <button
                onClick={onViewTerms}
                className="text-gray-300 hover:text-white transition underline"
              >
                الشروط والأحكام
              </button>
            )}
            <span className="text-gray-500">|</span>
            <span className="text-gray-300">
              جميع الحقوق محفوظة © {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
