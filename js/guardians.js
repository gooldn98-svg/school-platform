// js/guardians.js

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('tbody');
    const addForm = document.getElementById('add-guardian-form');
    const nameInput = document.getElementById('guardian-name');
    const phoneInput = document.getElementById('guardian-phone');

    // 1. جلب وعرض قائمة أولياء الأمور من قاعدة البيانات
    async function fetchGuardians() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="3">جاري جلب البيانات...</td></tr>';

        const { data, error } = await supabaseClient
            .from('guardians')
            .select('id, name, phone')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching guardians:', error);
            tableBody.innerHTML = '<tr><td colspan="3" style="color:red;">حدث خطأ أثناء جلب أولياء الأمور.</td></tr>';
            return;
        }

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">لا توجد بيانات لأولياء الأمور حتى الآن.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        data.forEach(guardian => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${guardian.name}</strong></td>
                <td>${guardian.phone || 'غير متوفر'}</td>
                <td>
                    <button onclick="deleteGuardian('${guardian.id}')" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 2. إضافة ولي أمر جديد
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();

            if (!name) {
                alert('الرجاء إدخال اسم ولي الأمر!');
                return;
            }

            const { error } = await supabaseClient
                .from('guardians')
                .insert([{ name, phone }]);

            if (error) {
                alert('حدث خطأ أثناء إضافة ولي الأمر!');
                console.error(error);
            } else {
                addForm.reset();
                fetchGuardians();
            }
        });
    }

    // تشغيل الدالة عند تحميل الصفحة
    fetchGuardians();
});

// دالة حذف ولي الأمر
window.deleteGuardian = async function(id) {
    if (confirm('هل أنت متأكد من رغبتك في حذف ولي الأمر هذا؟')) {
        const { error } = await supabaseClient
            .from('guardians')
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
