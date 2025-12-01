# 🌐 إعداد DNS لـ servikw.com على GoDaddy

## ✅ الإعدادات الصحيحة

### الخيار 1 (الموصى به): استخدام CNAME

في GoDaddy DNS Management:

```
Type: CNAME
Name: www
Value: site-dns.bolt.host
TTL: 1 Hour
```

**ثم أضف Domain Forwarding:**
- من: `servikw.com` (أو @)
- إلى: `https://www.servikw.com`
- Type: 301 Permanent
- Forward Settings: Forward only

---

### الخيار 2: استخدام A Record

**الخطوة 1:** اكتشف IP address:

```bash
# في Terminal أو Command Prompt
nslookup site-dns.bolt.host

# أو
ping site-dns.bolt.host
```

ستحصل على IP مثل: `123.45.67.89`

**الخطوة 2:** في GoDaddy DNS:

```
1. Type: A
   Name: @
   Value: [IP من الخطوة 1]
   TTL: 1 Hour

2. Type: CNAME
   Name: www
   Value: site-dns.bolt.host
   TTL: 1 Hour
```

---

## ❌ المشكلة الحالية

في الصورة التي أرسلتها، عندك:
```
A Record: @ → 75.2.60.5
CNAME: www → site-dns.bolt.host
```

**المشكلة:** A Record يشير لـ IP خاطئ أو قديم!

**الحل:**
1. احذف A Record القديم (اضغط 🗑️)
2. اكتشف IP الصحيح من `site-dns.bolt.host`
3. أضف A Record جديد بالـ IP الصحيح

---

## 🔧 الخطوات التفصيلية

### 1. سجّل دخول GoDaddy
- اذهب إلى: https://dcc.godaddy.com/
- My Products → Domains
- اختر `servikw.com`
- اضغط DNS

### 2. احذف السجلات القديمة
- اضغط 🗑️ بجانب A Record القديم
- احذف أي CNAME على @ (إن وجد)

### 3. أضف السجلات الصحيحة

#### إذا كان Bolt.new يستخدم IP ثابت:
```
Type: A
Name: @
Value: [IP الصحيح]
TTL: 1 Hour

Type: CNAME
Name: www
Value: site-dns.bolt.host
TTL: 1 Hour
```

#### إذا كان Bolt.new يستخدم CNAME فقط:
```
Type: CNAME
Name: www
Value: site-dns.bolt.host
TTL: 1 Hour
```

+ أضف Domain Forwarding في GoDaddy:
- Forwarding → Domain
- Forward: `servikw.com` to `https://www.servikw.com`
- Type: 301

### 4. انتظر انتشار DNS
- الوقت: 10-60 دقيقة
- في بعض الأحيان: حتى 24 ساعة

---

## 🧪 اختبار DNS

### أثناء الانتظار:
```bash
# تحقق من DNS
nslookup servikw.com

# تحقق من www
nslookup www.servikw.com
```

### أدوات أونلاين:
- https://dnschecker.org/
- أدخل: `servikw.com`
- شاهد النتائج من مختلف الدول

---

## ✅ النتيجة المتوقعة

بعد انتشار DNS:

```bash
# servikw.com
nslookup servikw.com
# النتيجة: IP صحيح

# www.servikw.com
nslookup www.servikw.com
# النتيجة: site-dns.bolt.host → IP صحيح
```

**في المتصفح:**
- `http://servikw.com` → يعيد التوجيه إلى `https://servikw.com`
- `http://www.servikw.com` → يعيد التوجيه إلى `https://servikw.com`
- `https://servikw.com` → يفتح الموقع ✓
- `https://www.servikw.com` → يفتح الموقع ✓

---

## 🚨 استكشاف الأخطاء

### المشكلة: "This site can't be reached"
**السبب:** DNS لم ينتشر بعد
**الحل:** انتظر 30 دقيقة أخرى

### المشكلة: "DNS_PROBE_FINISHED_NXDOMAIN"
**السبب:** سجلات DNS خاطئة
**الحل:** راجع السجلات في GoDaddy

### المشكلة: الموقع يفتح بدون HTTPS
**السبب:** Bolt.new لم يفعّل SSL بعد
**الحل:**
1. انتظر قليلاً (SSL يحتاج وقت)
2. تأكد من إعدادات Bolt.new

### المشكلة: يفتح صفحة بيضاء
**السبب:** مشكلة في البناء أو Deploy
**الحل:**
1. تأكد من نشر آخر build
2. افتح Console (F12) وشاهد الأخطاء

---

## 📞 الدعم

إذا لم تحل المشكلة بعد 24 ساعة:
1. تواصل مع دعم GoDaddy
2. تواصل مع دعم Bolt.new
3. تأكد من صلاحية Domain

---

## 🎯 الملخص

**احذف:** A Record القديم (75.2.60.5)
**أضف:** A Record جديد بـ IP الصحيح من `site-dns.bolt.host`
**احتفظ:** CNAME (www → site-dns.bolt.host)
**انتظر:** 10-60 دقيقة
**اختبر:** https://servikw.com

**بالتوفيق! 🚀**
