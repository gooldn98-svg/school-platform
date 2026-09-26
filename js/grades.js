// js/grades.js

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#grades-table tbody');
    const addForm = document.getElementById('add-grade-form');

    // 1. جلب وعرض الصفوف الدراسية من قاعدة البيانات
    async function fetchGrades() {
        tableBody.innerHTML = '<tr><td colspan="3">جاري جلب الصفوف الدراسية...</td></tr>';

        const { data, error } = await supabaseClient
            .from('grades')
            .select('id, name, description')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching grades:', error);
            tableBody.innerHTML = '<tr><td colspan="3" style="color:red;">حدث خطأ أثناء جلب الصفوف الدراسية.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">لا توجد صفوف دراسية مضافة حتى الآن.</td></tr>';
            return;
        }

        data.forEach(grade => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${grade.name}</strong></td>
                <td>${grade.description || 'لا توجد ملاحظات'}</td>
                <td>
                    <button onclick="deleteGrade('${grade.id}')">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 2. إضافة صف دراسي جديد عند إرسال النموذج
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('grade-name').value;
        const description = document.getElementById('grade-description').value;

        const { error } = await supabaseClient
            .from('grades')
            .insert([
                { 
                    name: name, 
                    description: description 
                }
            ]);

        if (error) {
            alert('حدث خطأ أثناء إضافة الصف الدراسي!');
            console.error(error);
        } else {
            alert('تمت إضافة الصف الدراسي بنجاح!');
            addForm.reset();
            fetchGrades();
        }
    });

    // تنفيذ دالة الجلب عند تحميل الصفحة
    fetchGrades();
});

// 3. دالة لحذف صف دراسي
window.deleteGrade = async function(id) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الصف الدراسي؟')) {
        const { error } = await supabaseClient
            .from('grades')
            .delete()
            .eq('id', id);

        if (error) {
            alert('حدث خطأ أثناء الحذف');
            console.error(error);
        } else {
            location.reload();
        }
    }
}
