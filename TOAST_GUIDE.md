# دليل استخدام الإشعارات الموحدة (Toast Notifications)

## نظرة عامة
يستخدم هذا المشروع مكتبة `react-hot-toast` لعرض جميع الإشعارات بشكل موحد في جميع الصفحات.

## الإعدادات المركزية
تم تكوين `Toaster` في ملف `App.jsx` بالإعدادات التالية:
- **الموضع**: أعلى الشاشة في المنتصف (`top-center`)
- **المدة الافتراضية**: 4 ثوانٍ
- **التصميم**: تصميم عصري مع gradients وظلال جميلة

## أنواع الإشعارات

### 1. إشعار النجاح (Success)
```javascript
import toast from "react-hot-toast";

toast.success("تم الحفظ بنجاح!");
```
- **اللون**: أخضر فاتح مع gradient
- **المدة**: 4 ثوانٍ
- **الاستخدام**: عند نجاح العمليات (حفظ، تحديث، حذف)

### 2. إشعار الخطأ (Error)
```javascript
import toast from "react-hot-toast";

toast.error("حدث خطأ أثناء الحفظ!");
```
- **اللون**: أحمر فاتح مع gradient
- **المدة**: 5 ثوانٍ (أطول لإعطاء المستخدم وقت لقراءة الخطأ)
- **الاستخدام**: عند فشل العمليات أو حدوث أخطاء

### 3. إشعار التحميل (Loading)
```javascript
import toast from "react-hot-toast";

// بدء التحميل
const loadingToast = toast.loading("جاري التحميل...");

// عند الانتهاء
toast.dismiss(loadingToast);
// أو
toast.success("تم التحميل!", { id: loadingToast });
```
- **اللون**: أزرق فاتح مع gradient
- **الاستخدام**: أثناء العمليات الطويلة

### 4. إشعار عادي (Default)
```javascript
import toast from "react-hot-toast";

toast("رسالة عامة");
```

## أمثلة من المشروع

### مثال 1: تسجيل الدخول (Login.jsx)
```javascript
// نجاح تسجيل الدخول
toast.success("تم تسجيل الدخول بنجاح!");

// حساب معطل
toast.error("حسابك معطل. يرجى التواصل مع المسؤول.");

// خطأ في الاتصال
toast.error("تعذر الاتصال بالخادم. حاول مرة أخرى لاحقاً.");
```

### مثال 2: إدارة المستخدمين (UserList.jsx)
```javascript
// تحديث حالة المستخدم
toast.success(`تم تحديث حالة المستخدم إلى ${newStatus}`);

// حذف مستخدم
toast.success("تم حذف المستخدم بنجاح");

// فشل العملية
toast.error("فشل التحديث. جاري التراجع...");
```

### مثال 3: إضافة مستخدم جديد (NewUser.jsx)
```javascript
// التحقق من البيانات
if (password.length < 8) {
  toast.error("يجب أن تكون كلمة المرور 8 أحرف على الأقل.");
  return;
}

// نجاح الإضافة
toast.success(isEdit ? "تم تحديث المستخدم بنجاح!" : "تم تسجيل المستخدم بنجاح!");

// انتهاء الجلسة
toast.error("انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.");
```

## خيارات متقدمة

### تخصيص مدة الإشعار
```javascript
toast.success("رسالة سريعة", { duration: 2000 }); // ثانيتان
toast.error("رسالة مهمة", { duration: 10000 }); // 10 ثوانٍ
```

### إشعار مع أيقونة مخصصة
```javascript
toast.success("تم الحفظ", {
  icon: '✅',
});
```

### إغلاق إشعار معين
```javascript
const toastId = toast.loading("جاري المعالجة...");

// بعد الانتهاء
toast.dismiss(toastId);
```

### إغلاق جميع الإشعارات
```javascript
toast.dismiss();
```

## ملاحظات مهمة

1. **لا تستخدم `alert()` أو `window.alert()`** - استخدم `toast()` دائماً
2. **استورد المكتبة في كل ملف تحتاجها**: `import toast from "react-hot-toast";`
3. **لا حاجة لإضافة `<Toaster />`** في كل صفحة - موجود مرة واحدة في `App.jsx`
4. **الإشعارات تظهر دائماً في الأعلى** بغض النظر عن الصفحة
5. **التصميم موحد تلقائياً** - لا حاجة لتخصيص الألوان في كل مرة

## الصفحات التي تستخدم Toast حالياً
- ✅ Login.jsx
- ✅ UserList.jsx
- ✅ NewUser.jsx
- ✅ SubcategoryList.jsx
- ✅ SubcategoryContext.jsx
- ✅ AddNewSubcategory.jsx
- ✅ AdminSidebar.jsx

## روابط مفيدة
- [React Hot Toast Documentation](https://react-hot-toast.com/)
- [React Hot Toast Examples](https://react-hot-toast.com/docs)
