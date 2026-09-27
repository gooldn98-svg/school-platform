// js/teachers.js

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('tbody');
    const addForm = document.getElementById('add-teacher-form');
    const nameInput = document.getElementById('teacher-name');
    const phoneInput = document.getElementById('teacher-phone');

    // 1. جلب وعرض قائمة المعلمين من قاعدة البيانات
    async function fetchTeachers() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="3">جاري جلب البيانات...</td></tr>';

        const { data, error } = await supabaseClient
            .from('teachers')
            .select('id, name, phone')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching teachers:', error);
            tableBody.innerHTML = '<tr><td colspan="3" style="color:red;">حدث خطأ أثناء جلب المعلمين.</td></tr>';
            return;
        }

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">لا توجد بيانات معلمين مسجلة حتى الآن.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        data.forEach(teacher => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${teacher.name}</strong></td>
                <td>${teacher.phone || 'غير متوفر'}</td>
                <td>
                    <button onclick="deleteTeacher('${teacher.id}')" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 2. إضافة معلم جديد
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();

            if (!name) {
                alert('الرجاء إدخال اسم المعلم!');
                return;
            }

            const { error } = await supabaseClient
                .from('teachers')
                .insert([{ name, phone }]);

            if (error) {
                alert('حدث خطأ أثناء إضافة المعلم!');
                console.error(error);
            } else {
                addForm.reset();
                fetchTeachers();
            }
        });
    }

    // تشغيل الدالة عند تحميل الصفحة
    fetchTeachers();
});

// دالة حذف المعلم
window.deleteTeacher = async function(id) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا المعلم؟')) {
        const { error } = await supabaseClient
            .from('teachers')
            .delete()
            .eq('id', id);

        if (error) {
            alert('حدث خطأ أثناء الحذف');
            console.error(error);
        } else {
            location.reload();
        }
    }
};
