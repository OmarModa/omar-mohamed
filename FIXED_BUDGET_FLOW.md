# نظام الميزانية الثابتة - شرح مفصل

## نظرة عامة

عند إضافة طلب خدمة، العميل لديه خيارين:

1. **ميزانية ثابتة (Fixed Budget)**: تحديد سعر ثابت
2. **مزايدة مفتوحة (Open Bidding)**: ترك المجال لمزودي الخدمة لتحديد السعر

## الميزانية الثابتة - كيف يعمل النظام؟

### من جانب العميل:

1. **إنشاء الطلب**
```typescript
const request = await api.requests.create({
  customer_id: userId,
  title: 'تصليح مكيف',
  description: 'محتاج تصليح المكيف بالصاله',
  category_id: 2, // تكييف
  region: 'السالمية',
  suggested_budget: 50 // الميزانية الثابتة
});
```

2. **استقبال موافقات مزودي الخدمة**
- سيصل إشعار لكل موافقة جديدة: "مزود خدمة جديد وافق على تنفيذ طلبك..."
- يمكن أن يوافق عدة مزودي خدمة

3. **مراجعة المزودين المتاحين**
```typescript
const bids = await api.bids.getByRequestId(requestId);
// bids will contain entries where price = null (acceptance bids)

// Get provider profiles to review their ratings and info
const providers = await Promise.all(
  bids.map(bid => api.profiles.getById(bid.provider_id))
);

// Get provider ratings
const ratingsData = await Promise.all(
  bids.map(bid => api.ratings.getByProviderId(bid.provider_id))
);
```

4. **اختيار مزود الخدمة**
```typescript
// العميل يختار مزود خدمة معين
await api.requests.acceptBid(requestId, bidId, providerId);

// الآن يمكن الحصول على بيانات التواصل
const providerContact = await api.requests.getProviderContactInfo(requestId, customerId);
// Returns: { provider_name, contact_info, address, region, etc. }
```

5. **حالة الطلب تتحول تلقائياً**
- من `open` إلى `assigned`
- الموافقات الأخرى تُرفض تلقائياً
- مزود الخدمة المختار يستلم إشعار: "مبروك! تم قبول عرضك..."

### من جانب مزود الخدمة:

1. **البحث عن طلبات بميزانية ثابتة**
```typescript
const openRequests = await api.requests.getAll({ status: 'open' });

// فلترة الطلبات بميزانية ثابتة
const fixedBudgetRequests = openRequests.filter(
  req => req.suggested_budget !== null
);
```

2. **إرسال موافقة**
```typescript
await api.bids.createAcceptance(
  requestId,
  providerId,
  'موافق على تنفيذ الطلب بالميزانية المحددة'
);
```

3. **انتظار اختيار العميل**
- مزود الخدمة ينتظر قرار العميل
- إذا تم اختياره: يصله إشعار + بيانات التواصل
- إذا اختار العميل مزود آخر: يُرفض عرضه تلقائياً

4. **بعد القبول - بدء التنفيذ**
```typescript
// بيانات التواصل الخاصة بالعميل متاحة الآن
const request = await api.requests.getById(requestId);
const customerProfile = await api.profiles.getById(request.customer_id);
// الآن لديه contact_info للعميل
```

5. **إنهاء العمل**
```typescript
await api.requests.complete(requestId);
// تحديث before_image_url و after_image_url إذا لزم الأمر
await api.requests.update(requestId, {
  after_image_url: 'https://...'
});
```

## المزايدة المفتوحة - النظام التقليدي

### من جانب العميل:

1. **إنشاء الطلب بدون ميزانية**
```typescript
const request = await api.requests.create({
  customer_id: userId,
  title: 'تصليح مكيف',
  description: 'محتاج تصليح المكيف بالصاله',
  category_id: 2,
  region: 'السالمية',
  suggested_budget: null // أو ببساطة لا تضيف هذا الحقل
});
```

2. **استقبال العروض**
- كل عرض يحتوي على سعر محدد
- إشعار: "تم تقديم عرض جديد بقيمة X د.ك على طلبك..."

3. **مقارنة العروض واختيار الأفضل**
```typescript
const bids = await api.bids.getByRequestId(requestId);
// bids contain price values

// فرز حسب السعر
const sortedByPrice = bids.sort((a, b) => a.price - b.price);

// اختيار عرض
await api.requests.acceptBid(requestId, bestBidId, providerId);
```

### من جانب مزود الخدمة:

1. **تقديم عرض سعر**
```typescript
await api.bids.create({
  request_id: requestId,
  provider_id: providerId,
  price: 35.500, // السعر المقترح
  message: 'يمكنني إنهاء العمل خلال ساعتين'
});
```

## الفروقات الأساسية

| الميزة | ميزانية ثابتة | مزايدة مفتوحة |
|--------|---------------|----------------|
| **تحديد السعر** | العميل يحدد | مزود الخدمة يحدد |
| **حقل price في bid** | `null` | رقم محدد |
| **عدد الموافقات** | متعدد | متعدد |
| **معيار الاختيار** | التقييم والثقة | السعر والتقييم |
| **الإشعارات** | "وافق على تنفيذ" | "عرض بقيمة X" |
| **بيانات التواصل** | بعد القبول فقط | بعد القبول فقط |

## الأمان والخصوصية

### حماية بيانات التواصل

```sql
-- دالة get_provider_contact_info تتحقق من:
-- 1. هل العميل يملك الطلب فعلاً؟
-- 2. هل الطلب في حالة assigned أو completed؟
-- 3. إذا لم يتحقق الشرطان: خطأ "Unauthorized"

CREATE OR REPLACE FUNCTION get_provider_contact_info(
  p_request_id bigint,
  p_customer_id uuid
)
```

### Row Level Security (RLS)

- **العروض (bids)**: مرئية للجميع لكن فقط معلومات محدودة
- **ملفات التعريف (profiles)**: البيانات الأساسية مرئية، بيانات التواصل تُشارك حسب السياق
- **الطلبات**: مفتوحة للقراءة، التعديل للمالك فقط

## أمثلة عملية

### مثال 1: عميل يطلب تصليح سيارة بميزانية 25 د.ك

```typescript
// 1. العميل ينشئ الطلب
const request = await api.requests.create({
  customer_id: customerId,
  title: 'غسيل وتلميع سيارة',
  description: 'سيارة جيب، محتاج غسيل كامل وتلميع',
  category_id: 1,
  region: 'حولي',
  suggested_budget: 25
});

// 2. ثلاثة مزودي خدمة يوافقون
await api.bids.createAcceptance(request.id, provider1Id);
await api.bids.createAcceptance(request.id, provider2Id);
await api.bids.createAcceptance(request.id, provider3Id);

// 3. العميل يراجع تقييمات المزودين
const provider1Ratings = await api.ratings.getByProviderId(provider1Id);
const avgRating1 = provider1Ratings.reduce((sum, r) => sum + r.score, 0) / provider1Ratings.length;

// 4. العميل يختار مزود الخدمة الأعلى تقييماً
const bids = await api.bids.getByRequestId(request.id);
const bestProviderBid = bids.find(b => b.provider_id === provider1Id);
await api.requests.acceptBid(request.id, bestProviderBid.id, provider1Id);

// 5. الحصول على بيانات التواصل
const contact = await api.requests.getProviderContactInfo(request.id, customerId);
console.log(`تواصل مع ${contact.provider_name} على ${contact.contact_info}`);
```

### مثال 2: مزود خدمة يقدم عرض سعر على طلب مفتوح

```typescript
// 1. طلب بدون ميزانية محددة
const request = await api.requests.create({
  customer_id: customerId,
  title: 'صيانة مكيف مركزي',
  description: 'المكيف لا يبرد بشكل جيد',
  category_id: 2,
  region: 'الجابرية'
  // لا توجد suggested_budget
});

// 2. مزودو الخدمة يتنافسون بالسعر
await api.bids.create({
  request_id: request.id,
  provider_id: provider1Id,
  price: 45,
  message: 'معاينة مجانية، ضمان 6 أشهر'
});

await api.bids.create({
  request_id: request.id,
  provider_id: provider2Id,
  price: 40,
  message: 'خبرة 10 سنوات، جاهز فوراً'
});

// 3. العميل يختار العرض الأنسب
const bids = await api.bids.getByRequestId(request.id);
// مقارنة السعر والتقييم والرسائل
```

## نصائح للتطوير

### للعملاء (Frontend)

```typescript
// دائماً تحقق من نوع الطلب
function isFIxedBudgetRequest(request) {
  return request.suggested_budget !== null;
}

// عرض واجهة مناسبة
if (isFIxedBudgetRequest(request)) {
  // عرض قائمة المزودين الموافقين + تقييماتهم
} else {
  // عرض قائمة العروض + أسعارها
}
```

### لمزودي الخدمة (Frontend)

```typescript
// تصفية الطلبات حسب نوع المزايدة
const requests = await api.requests.getAll({ status: 'open' });

const fixedBudgetRequests = requests.filter(r => r.suggested_budget !== null);
const openBiddingRequests = requests.filter(r => r.suggested_budget === null);

// عرض UI مختلف لكل نوع
```

### Validation

```typescript
// تحقق من صحة البيانات قبل الإرسال
async function submitBid(request, providerId, price?) {
  if (request.suggested_budget !== null) {
    // ميزانية ثابتة - استخدم createAcceptance
    if (price !== undefined) {
      throw new Error('لا يمكن تحديد سعر على طلب بميزانية ثابتة');
    }
    return api.bids.createAcceptance(request.id, providerId);
  } else {
    // مزايدة مفتوحة - يجب تحديد سعر
    if (!price || price <= 0) {
      throw new Error('يجب تحديد سعر صحيح');
    }
    return api.bids.create({
      request_id: request.id,
      provider_id: providerId,
      price
    });
  }
}
```

## استكشاف الأخطاء

### خطأ: "Cannot get provider contact info"

**السبب**: محاولة الحصول على بيانات التواصل قبل قبول العرض

**الحل**: تأكد من أن:
1. الطلب في حالة `assigned` أو `completed`
2. المستخدم الحالي هو صاحب الطلب

### خطأ: "Price is required"

**السبب**: محاولة إنشاء bid بدون سعر على طلب مفتوح

**الحل**: استخدم `api.bids.create()` مع تحديد price للطلبات المفتوحة

### خطأ: "Cannot set price on fixed budget request"

**السبب**: محاولة إضافة سعر على طلب بميزانية ثابتة

**الحل**: استخدم `api.bids.createAcceptance()` للطلبات بميزانية ثابتة
