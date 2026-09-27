// js/teachers.js

// إدارة المعلمين مع إظهار أخطاء الاتصال وقاعدة البيانات بوضوح.
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('tbody');
    const addForm = document.getElementById('add-teacher-form');
    const nameInput = document.getElementById('teacher-name');
    const phoneInput = document.getElementById('teacher-phone');
    const submitButton = addForm?.querySelector('button[type="submit"]');

    function showTableMessage(message, isError = false) {
        if (!tableBody) return;
        tableBody.innerHTML = `<tr><td colspan="3"${isError ? ' style="color:red;"' : ''}>${message}</td></tr>`;
    }

    function getSupabaseClient() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            throw new Error('تعذر تهيئة الاتصال بقاعدة البيانات. تحقق من تحميل config.js ومفتاح Supabase.');
        }
        return supabaseClient;
    }

    // جلب وعرض قائمة المعلمين من قاعدة البيانات.
    async function fetchTeachers() {
        if (!tableBody) return;
        showTableMessage('جاري جلب البيانات...');

        try {
            const { data, error } = await getSupabaseClient()
                .from('teachers')
                .select('id, name, phone')
                .order('name', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                showTableMessage('لا توجد بيانات معلمين مسجلة حتى الآن.');
                return;
            }

            tableBody.innerHTML = '';
            data.forEach((teacher) => {
                const row = document.createElement('tr');
                const nameCell = document.createElement('td');
                const phoneCell = document.createElement('td');
                const actionCell = document.createElement('td');
                const deleteButton = document.createElement('button');

                nameCell.innerHTML = `<strong></strong>`;
                nameCell.querySelector('strong').textContent = teacher.name || '';
                phoneCell.textContent = teacher.phone || 'غير متوفر';
                deleteButton.type = 'button';
                deleteButton.textContent = 'حذف';
                deleteButton.style.cssText = 'background-color:#ef4444;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;';
                deleteButton.addEventListener('click', () => deleteTeacher(teacher.id));

                actionCell.appendChild(deleteButton);
                row.append(nameCell, phoneCell, actionCell);
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching teachers:', error);
            showTableMessage(`تعذر جلب المعلمين: ${error.message || 'تحقق من اتصال Supabase وصلاحيات جدول teachers.'}`, true);
        }
    }

    // إضافة معلم جديد.
    if (addForm) {
        addForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = nameInput?.value.trim() || '';
            const phone = phoneInput?.value.trim() || '';

            if (!name) {
                alert('الرجاء إدخال اسم المعلم!');
                nameInput?.focus();
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'جارٍ الإضافة...';
            }

            try {
                const { error } = await getSupabaseClient()
                    .from('teachers')
                    .insert([{ name, phone: phone || null }]);

                if (error) throw error;

                addForm.reset();
                await fetchTeachers();
            } catch (error) {
                console.error('Error adding teacher:', error);
                alert(`تعذر إضافة المعلم: ${error.message || 'تحقق من وجود جدول teachers وصلاحيات الإدخال.'}`);
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'إضافة المعلم';
                }
            }
        });
    }

    fetchTeachers();
});

// حذف معلم.
async function deleteTeacher(id) {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المعلم؟')) return;

    try {
        const { error } = await supabaseClient
            .from('teachers')
            .delete()
            .eq('id', id);

        if (error) throw error;
        location.reload();
    } catch (error) {
        alert(`تعذر حذف المعلم: ${error.message || 'تحقق من صلاحيات الحذف.'}`);
        console.error('Error deleting teacher:', error);
    }
}

window.deleteTeacher = deleteTeacher;
