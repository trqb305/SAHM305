# دليل النشر — Sahm305

دليل سريع لرفع المشروع على GitHub ونشره على Vercel.

---

## 🐙 الجزء الأول: رفع المشروع على GitHub

### 1. أنشئ مستودعاً جديداً على GitHub
- اذهب إلى [github.com/new](https://github.com/new)
- اسم المستودع: `sahm305` (أو أي اسم تختاره)
- اختر **Private** (للمشاريع التجارية) أو **Public** حسب رغبتك
- لا تختر "Initialize with README" — لأن لدينا واحد بالفعل

### 2. ادفع الكود من جهازك

افتح Terminal داخل مجلد المشروع وشغّل:

```bash
git init
git add .
git commit -m "Initial commit: Sahm305 platform v1.0"
git branch -M main
git remote add origin https://github.com/USERNAME/sahm305.git
git push -u origin main
```

(استبدل `USERNAME` باسم حسابك على GitHub)

---

## ▲ الجزء الثاني: النشر على Vercel

### الطريقة 1: من واجهة Vercel (موصى بها)

1. اذهب إلى [vercel.com/new](https://vercel.com/new)
2. اضغط **Import Git Repository**
3. اختر المستودع `sahm305`
4. Vercel سيكتشف Next.js تلقائياً
5. (اختياري) أضف متغيرات البيئة من `.env.example`
6. اضغط **Deploy**

سيتم نشر الموقع خلال 2-3 دقائق على رابط مثل:
`https://sahm305.vercel.app`

### الطريقة 2: من Terminal (CLI)

```bash
npm install -g vercel
vercel login
vercel
```

ثم اتبع التعليمات التفاعلية.

---

## 🌐 ربط دومين مخصص (Custom Domain)

1. في لوحة Vercel، اذهب إلى مشروعك → **Settings** → **Domains**
2. أضف الدومين (مثل `sahm305.sa`)
3. عدّل سجلات DNS حسب التعليمات (عادة A record أو CNAME)
4. انتظر بضع دقائق للتحقق

---

## 🔐 متغيرات البيئة في الإنتاج

في Vercel: **Settings** → **Environment Variables**

أضف القيم الآتية (نسخها من `.env.example`):

```
NEXT_PUBLIC_APP_URL=https://your-domain.com
ADMIN_EMAIL=nif305@gmail.com
ADMIN_PASSWORD=Zx.321321
```

⚠️ **تنبيه:** في الإنتاج، يجب استبدال `ADMIN_PASSWORD` بنظام مصادقة آمن (Supabase Auth) — هذا للمنتج التجريبي فقط.

---

## 🔄 التحديثات اللاحقة

كلما عدّلت الكود محلياً:

```bash
git add .
git commit -m "وصف التغيير"
git push
```

Vercel سينشر التحديث تلقائياً خلال دقيقتين.

---

## 🆘 إن واجهت مشاكل

| المشكلة | الحل |
|---|---|
| `npm install` فشل | تحقق من إصدار Node.js: `node -v` (يجب 18.17+) |
| الخطوط لا تظهر | تأكد من اتصال الإنترنت (الخطوط من Google Fonts) |
| الصور لا تظهر | تحقق من وجود ملفات `public/images/` |
| TypeScript errors | شغّل `npm run type-check` لرؤية التفاصيل |
