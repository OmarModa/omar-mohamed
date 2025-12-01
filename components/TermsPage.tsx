import React from 'react';
import { CheckCircleIcon } from './icons';

export const TermsPage: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('ar-KW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">الشروط والأحكام</h1>
          <p className="text-gray-600">
            آخر تحديث: {currentDate}
          </p>
          <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold text-sm mt-4">
            ✓ المنصة مجانية لمدة سنة كاملة من تاريخ التسجيل
          </div>
        </div>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              مقدمة وموافقة على الشروط
            </h2>
            <div className="mr-10 space-y-3">
              <p>
                مرحباً بك في منصة "سوق الخدمات". باستخدامك لهذه المنصة، فإنك توافق على الالتزام بالشروط والأحكام التالية.
                إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.
              </p>
              <p className="font-semibold text-teal-700">
                المنصة عبارة عن وسيط إلكتروني يربط بين العملاء ومزودي الخدمات، ولا تتحمل إدارة المنصة أي مسؤولية عن جودة الخدمات
                أو التعاملات التي تتم بين الأطراف.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              الاستخدام المجاني للمنصة
            </h2>
            <div className="mr-10 space-y-3 bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <p className="font-bold text-green-800">
                  المنصة مجانية تماماً لجميع المستخدمين (عملاء ومزودي خدمات) لمدة سنة واحدة (12 شهراً) من تاريخ التسجيل.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <p>
                  لا توجد أي رسوم أو عمولات على المعاملات خلال فترة التجربة المجانية.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <p>
                  تحتفظ إدارة المنصة بالحق في تعديل سياسة التسعير بعد انتهاء فترة الاستخدام المجاني، مع إشعار مسبق لجميع المستخدمين.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              طبيعة المنصة ونطاق المسؤولية
            </h2>
            <div className="mr-10 space-y-3 bg-red-50 p-4 rounded-lg border-2 border-red-200">
              <p className="font-bold text-red-800 text-lg">
                ⚠️ إخلاء مسؤولية مهم:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  المنصة هي <strong>وسيط إلكتروني فقط</strong> تقوم بربط العملاء بمزودي الخدمات ولا تقدم الخدمات بنفسها.
                </li>
                <li>
                  <strong>لا تتحمل إدارة المنصة أي مسؤولية</strong> عن جودة الخدمات المقدمة أو أي أضرار مادية أو معنوية قد تنتج عن التعامل بين الأطراف.
                </li>
                <li>
                  <strong>المنصة غير مسؤولة</strong> عن أي خلافات، نزاعات، أو مطالبات مالية تنشأ بين العميل ومزود الخدمة.
                </li>
                <li>
                  <strong>التعامل المالي والتنفيذ الفعلي للخدمة</strong> يتم مباشرة بين العميل ومزود الخدمة دون تدخل من المنصة.
                </li>
                <li>
                  المنصة غير مسؤولة عن صحة أو دقة المعلومات التي يدخلها المستخدمون.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
              التزامات المستخدمين
            </h2>
            <div className="mr-10 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2">أ. التزامات جميع المستخدمين:</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  <li>الالتزام بقوانين دولة الكويت وجميع الأنظمة والقوانين المعمول بها.</li>
                  <li>عدم استخدام المنصة لأي أغراض غير قانونية أو محظورة.</li>
                  <li>احترام حقوق الآخرين والتعامل بأمانة ومصداقية.</li>
                  <li>تقديم معلومات صحيحة ودقيقة عند التسجيل واستخدام المنصة.</li>
                  <li>عدم نشر محتوى مسيء، تشهيري، أو يحرض على الكراهية.</li>
                  <li>الحفاظ على سرية بيانات الدخول الخاصة بك.</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-900 mb-2">ب. التزامات العملاء:</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  <li>تقديم وصف دقيق وواضح للخدمة المطلوبة.</li>
                  <li>الالتزام بالدفع المتفق عليه مع مزود الخدمة.</li>
                  <li>التأكد من مصداقية مزود الخدمة قبل الموافقة على العرض.</li>
                  <li>تقديم تقييم عادل ونزيه للخدمة المقدمة.</li>
                </ul>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-bold text-teal-900 mb-2">ج. التزامات مزودي الخدمات:</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  <li>تقديم خدمات ذات جودة عالية وفقاً للمعايير المتفق عليها.</li>
                  <li>الالتزام بالمواعيد والأسعار المعلنة في العروض.</li>
                  <li>امتلاك التراخيص والموافقات القانونية اللازمة لتقديم الخدمة.</li>
                  <li>الامتثال لجميع قوانين العمل والسلامة المهنية في الكويت.</li>
                  <li>التعامل بمهنية واحترافية مع جميع العملاء.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
              الخصوصية وحماية البيانات
            </h2>
            <div className="mr-10 space-y-3">
              <p>
                نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. يتم استخدام البيانات المقدمة فقط لأغراض تشغيل المنصة وتحسين الخدمات.
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>لن نشارك بياناتك الشخصية مع أطراف ثالثة دون موافقتك.</li>
                <li>نستخدم تقنيات أمان متقدمة لحماية معلوماتك.</li>
                <li>لك الحق في طلب حذف أو تعديل بياناتك في أي وقت.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
              حل النزاعات والقانون الواجب التطبيق
            </h2>
            <div className="mr-10 space-y-3 bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
              <p className="font-bold text-gray-800">
                في حالة نشوء أي نزاع بين الأطراف:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong>القانون الواجب التطبيق:</strong> تخضع هذه الشروط والأحكام لقوانين دولة الكويت.
                </li>
                <li>
                  <strong>الاختصاص القضائي:</strong> تكون المحاكم الكويتية هي المختصة بنظر أي نزاع ينشأ عن استخدام المنصة.
                </li>
                <li>
                  <strong>حل ودي:</strong> يُنصح بمحاولة حل النزاعات بين العميل ومزود الخدمة بطريقة ودية أولاً.
                </li>
                <li>
                  المنصة توفر نظام تقييمات وتعليقات لمساعدة المستخدمين في اتخاذ قرارات مستنيرة، ولكنها ليست طرفاً في النزاع.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">7</span>
              إنهاء الحساب والحظر
            </h2>
            <div className="mr-10 space-y-3">
              <p>
                تحتفظ إدارة المنصة بالحق في تعليق أو إنهاء حساب أي مستخدم في الحالات التالية:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>انتهاك أي من شروط وأحكام الاستخدام.</li>
                <li>تقديم معلومات كاذبة أو مضللة.</li>
                <li>سلوك غير لائق أو إساءة للآخرين.</li>
                <li>محاولة اختراق أو إلحاق الضرر بالمنصة.</li>
                <li>استخدام المنصة لأغراض احتيالية.</li>
              </ul>
              <p className="font-semibold text-red-700">
                قرار الحظر أو الإنهاء يكون نهائياً وغير قابل للاستئناف.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">8</span>
              التعديلات على الشروط والأحكام
            </h2>
            <div className="mr-10 space-y-3">
              <p>
                تحتفظ إدارة المنصة بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية عبر البريد الإلكتروني
                أو من خلال إشعار على المنصة.
              </p>
              <p className="font-semibold">
                استمرارك في استخدام المنصة بعد نشر التعديلات يعني موافقتك على الشروط المعدلة.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">9</span>
              الاتصال بنا
            </h2>
            <div className="mr-10 space-y-3 bg-gray-50 p-4 rounded-lg">
              <p>
                إذا كان لديك أي استفسارات حول هذه الشروط والأحكام، يرجى التواصل معنا عبر:
              </p>
              <div className="space-y-1">
                <p><strong>البريد الإلكتروني:</strong> support@service-market.kw</p>
                <p><strong>الهاتف:</strong> +965 XXXX XXXX</p>
              </div>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <div className="bg-teal-50 p-6 rounded-lg border-2 border-teal-300">
              <p className="text-center font-bold text-teal-900 text-lg mb-3">
                ✓ بموافقتك على هذه الشروط والأحكام، فإنك تقر بأنك قرأتها وفهمتها بالكامل
              </p>
              <p className="text-center text-gray-700">
                نشكرك على استخدام منصة سوق الخدمات ونتمنى لك تجربة ممتعة ومفيدة
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
