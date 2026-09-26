// js/grades.js

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('tbody');
    const addForm = document.getElementById('add-grade-form');

    // جلب وعرض الصفوف الدراسية
    async function fetchGrades() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="2">جاري جلب الصفوف...</td></tr>';

        const { data, error } = await supabaseClient
            .from('grades')
            .select('id, name')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching grades:', error);
            tableBody.innerHTML = '<tr><td colspan="2" style="color:red;">حدث خطأ أثناء جلب الصفوف.</td></tr>';
            return;
        }

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="2">لا توجد صفوف دراسية مضافة حتى الآن.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        data.forEach(grade => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${grade.name}</strong></td>
                <td>
                    <button onclick="deleteGrade('${grade.id}')" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // إضافة صف دراسي جديد
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('grade-name').value.trim();

            if (!nameInput) {
                alert('الرجاء إدخال اسم الصف!');
                return;
            }

            const { error } = await supabaseClient
                .from('grades')
                .insert([{ name: nameInput }]);

            if (error) {
                alert('حدث خطأ أثناء إضافة الصف!');
                console.error(error);
            } else {
                addForm.reset();
                fetchGrades();
            }
        });
    }

    fetchGrades();
});

// دالة حذف الصف
window.deleteGrade = async function(id) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الصف؟')) {
        const { error } = await supabaseClient
            .from('grades')
            .delete()
            .eq('id', id);

        if (error) {
            alert('حدث خطأ أثناء الحذف');
            console.error(error);
        } else {
            // تحديث الجدول دون إعادة تحميل الصفحة بالكامل
            const tableBody = document.querySelector('tbody');
            if(tableBody) {
                tableBody.innerHTML = '<tr><td colspan="2">جاري التحديث...</td></tr>';
            }
            
            // إعادة استدعاء الدالة لجلب البيانات الجديدة
            const { data } = await supabaseClient.from('grades').select('*').order('created_at', { ascending: false });
            if(data) {
                location.reload(); // سيتم استبدالها بدالة جلب البيانات إذا تم هيكلتها كـ Module، استخدمنا reload للتبسيط وضمان التحديث
            }
        }
    }
}
