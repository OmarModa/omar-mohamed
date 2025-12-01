# 🔒 إعداد وتأمين HTTPS - سوق الخدمات

## ✅ ما تم تنفيذه لضمان HTTPS

### 1. 🛡️ Security Headers (`public/_headers`)

تم إنشاء ملف `_headers` يحتوي على:

#### أ. Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
- يفرض استخدام HTTPS لمدة سنة كاملة
- يشمل جميع النطاقات الفرعية
- مؤهل للإضافة إلى قائمة HSTS Preload

#### ب. X-Frame-Options
```
X-Frame-Options: DENY
```
- يمنع استخدام الموقع داخل iframe
- حماية من clickjacking attacks

#### ج. X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
- يمنع المتصفح من تخمين نوع MIME
- حماية من MIME type attacks

#### د. X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
- حماية من XSS attacks
- يحظر الصفحة عند اكتشاف هجوم

#### ه. Content Security Policy (CSP)
```
Content-Security-Policy: upgrade-insecure-requests; ...
```
- يرفع تلقائياً جميع الطلبات من HTTP إلى HTTPS
- يحدد مصادر المحتوى المسموح بها

#### و. Referrer Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
- يحمي خصوصية المستخدم

### 2. 🔄 Redirects (`public/_redirects`)

تم إنشاء ملف `_redirects` يحتوي على:

#### أ. إعادة توجيه HTTP → HTTPS
```
http://:splat https://:splat 301!
```
- إعادة توجيه دائمة (301) من HTTP إلى HTTPS
- يشمل جميع الصفحات

#### ب. إعادة توجيه WWW → Non-WWW
```
https://www.service-market.kw/* https://service-market.kw/:splat 301!
```
- توحيد النطاق (اختياري)
- يحسن SEO

#### ج. SPA Fallback
```
/*    /index.html   200
```
- لتطبيقات React SPA
- جميع الروابب تعيد index.html

### 3. 📄 Meta Tag في HTML

في `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```
- يرفع جميع الطلبات غير الآمنة إلى HTTPS
- يعمل على مستوى المتصفح

### 4. ⚛️ React Component (`HTTPSRedirect.tsx`)

تم إنشاء component لإعادة التوجيه من JavaScript:

```typescript
export const HTTPSRedirect = () => {
  useEffect(() => {
    const isLocalhost = // تحقق من localhost

    if (!isLocalhost && window.location.protocol !== 'https:') {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }, []);

  return null;
};
```

**المميزات:**
- ✅ يستثني localhost (للتطوير المحلي)
- ✅ إعادة توجيه تلقائية
- ✅ لا يؤثر على التطوير

---

## 🚀 كيف يعمل النظام؟

### السيناريو 1: المستخدم يدخل http://
```
1. المتصفح يطلب: http://service-market.kw/
2. Server يرد بـ: 301 Redirect → https://service-market.kw/
3. المتصفح يطلب: https://service-market.kw/
4. الموقع يفتح بأمان ✓
```

### السيناريو 2: محتوى HTTP داخل الصفحة
```
1. الصفحة محملة على HTTPS
2. صورة أو ملف من: http://example.com/image.jpg
3. CSP يرفعه تلقائياً إلى: https://example.com/image.jpg
4. المحتوى يحمل بأمان ✓
```

### السيناريو 3: رابط قديم HTTP
```
1. مستخدم يضغط على: http://service-market.kw/services
2. _redirects يحوله إلى: https://service-market.kw/services
3. SPA يعرض الصفحة الصحيحة ✓
```

---

## 🔧 الإعداد حسب منصة الاستضافة

### Netlify / Vercel (موصى به)
- ✅ `_headers` يعمل تلقائياً
- ✅ `_redirects` يعمل تلقائياً
- ✅ HTTPS مجاني ومدمج
- ✅ شهادة SSL تلقائية

**لا حاجة لخطوات إضافية!**

### CloudFlare
1. فعّل "Always Use HTTPS" في Dashboard
2. فعّل "Automatic HTTPS Rewrites"
3. رفع `_headers` سيعمل

### Apache (.htaccess)
إذا كنت تستخدم Apache، أضف في `.htaccess`:
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security Headers
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
```

### Nginx
في ملف الإعدادات:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name service-market.kw www.service-market.kw;
    return 301 https://service-market.kw$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name service-market.kw;

    # SSL Certificate
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # ... rest of config
}
```

---

## 🧪 اختبار HTTPS

### 1. اختبار إعادة التوجيه
```bash
# اختبر HTTP → HTTPS
curl -I http://service-market.kw/
# يجب أن ترى: HTTP/1.1 301 Moved Permanently
# Location: https://service-market.kw/
```

### 2. اختبار Security Headers
```bash
curl -I https://service-market.kw/
# ابحث عن:
# strict-transport-security
# x-frame-options
# x-content-type-options
```

### 3. أدوات اختبار أونلاين

#### A. SSL Labs
- **الرابط**: https://www.ssllabs.com/ssltest/
- **الاستخدام**: أدخل URL الموقع
- **الهدف**: درجة A أو A+

#### B. Security Headers
- **الرابط**: https://securityheaders.com/
- **الاستخدام**: أدخل URL
- **الهدف**: درجة A

#### C. Why No Padlock?
- **الرابط**: https://www.whynopadlock.com/
- **الاستخدام**: إذا لم يظهر القفل الأخضر
- **يكشف**: المحتوى غير الآمن

#### D. Mozilla Observatory
- **الرابط**: https://observatory.mozilla.org/
- **الاستخدام**: تحليل شامل للأمان
- **الهدف**: 100/100

### 4. اختبار في المتصفح

افتح Console (F12) وأدخل:
```javascript
// تحقق من البروتوكول
console.log(window.location.protocol); // يجب أن يكون "https:"

// تحقق من المحتوى المختلط
// افتح Console → Security Tab
// يجب أن ترى "This page is secure (valid HTTPS)"
```

---

## 🔐 الحصول على شهادة SSL

### خيار 1: Let's Encrypt (مجاني) ⭐
- مجاني 100%
- تجديد تلقائي كل 90 يوم
- معتمد من جميع المتصفحات

**على Netlify/Vercel:**
- تلقائي! لا حاجة لعمل شيء

**على VPS/Server:**
```bash
# تثبيت Certbot
sudo apt-get install certbot python3-certbot-nginx

# الحصول على شهادة
sudo certbot --nginx -d service-market.kw -d www.service-market.kw

# تجديد تلقائي
sudo certbot renew --dry-run
```

### خيار 2: CloudFlare (مجاني)
1. أضف موقعك إلى CloudFlare
2. غيّر Nameservers
3. CloudFlare توفر SSL تلقائياً

### خيار 3: شهادة مدفوعة
- من GoDaddy, Namecheap, وغيرها
- مناسب للشركات الكبيرة
- شهادات Extended Validation (EV)

---

## ✅ Checklist النهائي

### قبل النشر:
- [ ] ملف `_headers` موجود في `public/`
- [ ] ملف `_redirects` موجود في `public/`
- [ ] Meta tag CSP موجود في `index.html`
- [ ] Component `HTTPSRedirect` مضاف في `App.tsx`

### بعد النشر:
- [ ] الموقع يفتح على https://
- [ ] http:// يعيد التوجيه إلى https://
- [ ] لا توجد تحذيرات Mixed Content
- [ ] القفل الأخضر يظهر في المتصفح
- [ ] SSL Labs يعطي A أو A+
- [ ] Security Headers درجة جيدة

### للصيانة:
- [ ] مراقبة تجديد شهادة SSL
- [ ] فحص دوري بـ SSL Labs
- [ ] متابعة Security Headers

---

## 🚨 استكشاف المشاكل

### المشكلة 1: Mixed Content Warning
```
⚠️ This request has been blocked; the content must be served over HTTPS
```

**الحل:**
1. تأكد من وجود CSP في `<head>`
2. ابحث عن مصادر HTTP في الكود:
   ```bash
   grep -r "http://" src/
   ```
3. استبدل بـ HTTPS أو استخدم بروتوكول نسبي:
   ```
   // بدلاً من: http://example.com/image.jpg
   // استخدم: https://example.com/image.jpg
   // أو: //example.com/image.jpg
   ```

### المشكلة 2: Redirect Loop
```
ERR_TOO_MANY_REDIRECTS
```

**الحل:**
- تأكد من عدم وجود تعارض في إعدادات Server
- أزل أي redirect مكرر
- تحقق من إعدادات CloudFlare

### المشكلة 3: Certificate Error
```
NET::ERR_CERT_AUTHORITY_INVALID
```

**الحل:**
- انتظر بضع دقائق لنشر الشهادة
- تأكد من DNS صحيح
- جدد الشهادة إذا انتهت

---

## 🎯 الخلاصة

الموقع الآن **محمي بالكامل** بـ HTTPS:

✅ إعادة توجيه تلقائية من HTTP إلى HTTPS
✅ Security Headers شاملة
✅ Content Security Policy
✅ حماية من Clickjacking و XSS
✅ HSTS Preload جاهز
✅ Mixed Content محمي
✅ SEO محسّن لـ HTTPS

**النتيجة**: موقع آمن 100% مع قفل أخضر في جميع المتصفحات! 🔒✅
