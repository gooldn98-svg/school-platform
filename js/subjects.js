// js/subjects.js

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#subjects-table tbody');
    const addForm = document.getElementById('add-subject-form');

    // 1. جلب وعرض المواد الدراسية من قاعدة البيانات
    async function fetchSubjects() {
        tableBody.innerHTML = '<tr><td colspan="3">جاري جلب المواد الدراسية...</td></tr>';

        const { data, error } = await supabaseClient
            .from('subjects')
            .select('id, name, code')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching subjects:', error);
            tableBody.innerHTML = '<tr><td colspan="3" style="color:red;">حدث خطأ أثناء جلب المواد الدراسية.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">لا توجد مواد دراسية مضافة حتى الآن.</td></tr>';
            return;
        }

        data.forEach(subject => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${subject.name}</strong></td>
                <td>${subject.code || 'لا يوجد رمز'}</td>
                <td>
                    <button onclick="deleteSubject('${subject.id}')">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 2. إضافة مادة دراسية جديدة عند إرسال النموذج
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('subject-name').value;
        const code = document.getElementById('subject-code').value;

        const { error } = await supabaseClient
            .from('subjects')
            .insert([
                { 
                    name: name, 
                    code: code 
                }
            ]);

        if (error) {
            alert('حدث خطأ أثناء إضافة المادة الدراسية!');
            console.error(error);
        } else {
            alert('تمت إضافة المادة الدراسية بنجاح!');
            addForm.reset();
            fetchSubjects();
        }
    });

    // تنفيذ دالة الجلب عند تحميل الصفحة
    fetchSubjects();
});

// 3. دالة لحذف مادة دراسية
window.deleteSubject = async function(id) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه المادة الدراسية؟')) {
        const { error } = await supabaseClient
            .from('subjects')
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
