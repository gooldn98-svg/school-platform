// ملف للتشخيص - افتح console المتصفح واشوف الأخطاء

console.log('=== تشخيص الاتصال بـ Supabase ===');
console.log('URL:', typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : 'غير معرّف');
console.log('ANON_KEY exists:', typeof SUPABASE_ANON_KEY !== 'undefined');
console.log('supabaseClient exists:', typeof supabaseClient !== 'undefined');

if (typeof supabaseClient !== 'undefined') {
    console.log('محاولة اختبار الاتصال بجدول teachers...');
    
    supabaseClient
        .from('teachers')
        .select('*')
        .limit(1)
        .then(({ data, error }) => {
            if (error) {
                console.error('❌ خطأ الاتصال:', error);
                console.error('- الرسالة:', error.message);
                console.error('- الحالة:', error.status);
            } else {
                console.log('✅ نجح الاتصال! البيانات:', data);
            }
        })
        .catch(err => {
            console.error('❌ خطأ غير متوقع:', err);
        });
} else {
    console.error('❌ supabaseClient غير معرّف - تحقق من تحميل config.js قبل teachers.js');
}
