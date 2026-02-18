# دليل استخدام Subcategory API

## 📍 API Endpoint
```
https://eeriest-asymptotically-sherie.ngrok-free.dev/api/subcategory
```

## ✅ تم التحديث!
تم تحديث المشروع ليستخدم ngrok API بدلاً من localhost.

---

## 📝 كيفية إضافة Subcategory

### 1. من خلال الواجهة (UI)
1. افتح التطبيق على `http://localhost:5173`
2. سجل دخول
3. اذهب إلى **Sub Category List** من القائمة الجانبية
4. اضغط على **Add New Subcategory**
5. املأ البيانات:
   - **Subcategory Name** (مطلوب)
   - **Parent Category** (مطلوب)
   - **Status** (Active/Inactive)
   - **Description** (اختياري)
   - **Image** (مطلوب)
6. اضغط **Save Subcategory**

### 2. من خلال API مباشرة (Postman/Thunder Client)

#### Request Details:
```
Method: POST
URL: https://eeriest-asymptotically-sherie.ngrok-free.dev/api/subcategory
Content-Type: multipart/form-data
```

#### Headers:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE",
  "Accept": "application/json",
  "ngrok-skip-browser-warning": "true"
}
```

#### Body (form-data):
```
name: "اسم الفئة الفرعية"
categoryId: "1"  // ID الفئة الرئيسية
status: "active"  // أو "inactive"
description: "وصف الفئة الفرعية"
image: [اختر ملف صورة]
```

#### مثال باستخدام cURL:
```bash
curl -X POST \
  'https://eeriest-asymptotically-sherie.ngrok-free.dev/api/subcategory' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Accept: application/json' \
  -H 'ngrok-skip-browser-warning: true' \
  -F 'name=اسم الفئة الفرعية' \
  -F 'categoryId=1' \
  -F 'status=active' \
  -F 'description=وصف الفئة الفرعية' \
  -F 'image=@/path/to/image.jpg'
```

#### مثال باستخدام JavaScript (Fetch):
```javascript
const formData = new FormData();
formData.append("name", "اسم الفئة الفرعية");
formData.append("categoryId", "1");
formData.append("status", "active");
formData.append("description", "وصف الفئة الفرعية");
formData.append("image", imageFile); // File object

const token = localStorage.getItem("adminToken");

const response = await fetch(
  "https://eeriest-asymptotically-sherie.ngrok-free.dev/api/subcategory",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "ngrok-skip-browser-warning": "true"
    },
    body: formData
  }
);

const data = await response.json();
console.log(data);
```

---

## 📋 الحقول المطلوبة

| الحقل | النوع | مطلوب؟ | الوصف |
|------|------|--------|-------|
| `name` | string | ✅ نعم | اسم الفئة الفرعية |
| `categoryId` | number/string | ✅ نعم | ID الفئة الرئيسية |
| `status` | string | ❌ لا | الحالة (active/inactive) - افتراضي: active |
| `description` | string | ❌ لا | وصف الفئة الفرعية |
| `image` | file | ✅ نعم | صورة الفئة الفرعية |

---

## 📤 Response Examples

### نجاح (Success - 200/201):
```json
{
  "id": 123,
  "name": "اسم الفئة الفرعية",
  "categoryId": 1,
  "status": "active",
  "description": "وصف الفئة الفرعية",
  "image": "subcategory_123.jpg",
  "created_at": "2026-02-16T12:00:00Z"
}
```

### خطأ - Unauthorized (401):
```json
{
  "message": "Unauthenticated."
}
```

### خطأ - Validation Error (422):
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."],
    "categoryId": ["The category id field is required."],
    "image": ["The image field is required."]
  }
}
```

---

## 🔍 عمليات أخرى

### 1. الحصول على جميع Subcategories
```
GET https://eeriest-asymptotically-sherie.ngrok-free.dev/api/subcategory
```

### 2. الحصول على Subcategory محدد
```
GET https://eeriest-asymptotically-sherie.ngrok-free.dev/api/subcategory/{id}
```

### 3. تحديث Subcategory
```
PUT https://eeriest-asymptotically-sherie.ngrok-free.dev/api/subcategory/{id}
أو
POST https://eeriest-asymptotically-sherie.ngrok-free.dev/api/subcategory/{id}
مع _method=PUT في FormData
```

### 4. حذف Subcategory
```
DELETE https://eeriest-asymptotically-sherie.ngrok-free.dev/api/subcategory/{id}
```

---

## 🔐 الحصول على Token

للحصول على token للـ Authorization:

```javascript
// بعد تسجيل الدخول بنجاح
const token = localStorage.getItem("adminToken");
```

أو من خلال API:
```
POST https://eeriest-asymptotically-sherie.ngrok-free.dev/api/adminlogin

Body:
{
  "email": "admin@example.com",
  "password": "password123"
}

Response:
{
  "token": "YOUR_TOKEN_HERE",
  "user": { ... }
}
```

---

## ⚠️ ملاحظات مهمة

1. **ngrok header**: يجب إضافة `"ngrok-skip-browser-warning": "true"` في headers لتجنب مشاكل ngrok
2. **Authorization**: يجب إرسال token في header: `Authorization: Bearer YOUR_TOKEN`
3. **Content-Type**: لا تضع `Content-Type` في headers عند إرسال FormData - المتصفح يضيفه تلقائياً
4. **Image**: يجب أن تكون الصورة ملف فعلي (File object) وليس base64
5. **categoryId**: تأكد من أن الـ category موجود قبل إضافة subcategory له

---

## 🧪 اختبار API

### باستخدام Postman:
1. افتح Postman
2. اختر POST
3. ضع URL: `https://eeriest-asymptotically-sherie.ngrok-free.dev/api/subcategory`
4. اذهب إلى Headers:
   - `Authorization`: `Bearer YOUR_TOKEN`
   - `Accept`: `application/json`
   - `ngrok-skip-browser-warning`: `true`
5. اذهب إلى Body → form-data
6. أضف الحقول المطلوبة
7. اضغط Send

### باستخدام Thunder Client (VS Code):
1. افتح Thunder Client
2. New Request
3. اختر POST
4. ضع URL
5. أضف Headers
6. اذهب إلى Body → Form
7. أضف الحقول
8. Send

---

## 📂 الملفات المُحدّثة في المشروع

1. ✅ `src/pages/SubcategoryContext.jsx` - تم تحديث API_BASE_URL
2. ✅ `src/pages/AddNewSubcategory.jsx` - تم تحديث category API
3. ✅ `src/pages/SubcategoryList.jsx` - تم تحديث category API

جميع الملفات الآن تستخدم:
```javascript
const API_BASE_URL = "https://eeriest-asymptotically-sherie.ngrok-free.dev/api";
```

---

**تاريخ التحديث**: 16 فبراير 2026  
**الحالة**: ✅ جاهز للاستخدام
