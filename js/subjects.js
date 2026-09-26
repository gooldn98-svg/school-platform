// js/subjects.js

document.addEventListener('DOMContentLoaded', async () => {
    const subjectForm = document.getElementById('subject-form') || document.querySelector('form');
    const subjectsTableBody = document.querySelector('tbody') || document.getElementById('subjects-list');

    // جلب وحمل المواد عند فتح الصفحة
    await fetchSubjects();

    // إضافة مادة جديدة عند إرسال النموذج
    if (subjectForm) {
        subjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.querySelector('input[type="text"]:not([placeholder*="MATH"])') || document.querySelectorAll('input[type="text"]')[0];
            const codeInput = document.querySelector('input[placeholder*="MATH"]') || document.querySelectorAll('input[type="text"]')[1];

            const name = nameInput.value.trim();
            const code = codeInput ? codeInput.value.trim() : '';

            if (!name) {
                alert('يرجى إدخال اسم المادة الدراسية');
                return;
            }

            // إدراج المادة في Supabase
            const { data, error } = await supabaseClient
                .from('subjects')
                .insert([{ name: name, code: code }]);

            if (error) {
                console.error('خطأ في إضافة المادة:', error);
                alert('حدث خطأ أثناء إضافة المادة: ' + error.message);
            } else {
                nameInput.value = '';
                if (codeInput) codeInput.value = '';
                await fetchSubjects(); // تحديث القائمة
            }
        });
    }

    // دالة جلب المواد الدراسية من قاعدة البيانات
    async function fetchSubjects() {
        const { data: subjects, error } = await supabaseClient
            .from('subjects')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error('خطأ في جلب البيانات:', error);
            return;
        }

        renderSubjects(subjects);
    }

    // دالة عرض المواد في الجدول
    function renderSubjects(subjects) {
        if (!subjectsTableBody) return;

        if (subjects.length === 0) {
            subjectsTableBody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #666;">لا توجد مواد دراسية مضافة حتى الآن.</td>
                </tr>`;
            return;
        }

        subjectsTableBody.innerHTML = subjects.map(subject => `
            <tr>
                <td>${subject.name}</td>
                <td>${subject.code || '-'}</td>
                <td>
                    <button onclick="deleteSubject(${subject.id})" style="background-color: #ef4444; padding: 5px 10px; font-size: 12px;">حذف</button>
                </td>
            </tr>
        `).join('');
    }

    // جعل دالة الحذف متاحة عالمياً
    window.deleteSubject = async (id) => {
        if (confirm('هل أنت تأكد من رغبتك في حذف هذه المادة؟')) {
            const { error } = await supabaseClient
                .from('subjects')
                .delete()
                .eq('id', id);

            if (error) {
                alert('خطأ في الحذف: ' + error.message);
            } else {
                await fetchSubjects();
            }
        }
    };
});
