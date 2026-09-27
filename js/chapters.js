// js/chapters.js

document.addEventListener('DOMContentLoaded', () => {
    const gradeSubjectSelect = document.getElementById('grade-subject-select');
    const tableBody = document.querySelector('tbody');
    const addForm = document.getElementById('add-chapter-form');

    // 1. جلب ربط المواد بالصفوف للقائمة المنسدلة
    async function fetchGradeSubjectsDropdown() {
        if (!gradeSubjectSelect) return;
        
        const { data, error } = await supabaseClient
            .from('grade_subjects')
            .select(`
                id,
                grades ( id, name ),
                subjects ( id, name )
            `);

        if (error) {
            console.error('Error fetching grade_subjects:', error);
            gradeSubjectSelect.innerHTML = '<option value="">خطأ في تحميل البيانات</option>';
            return;
        }

        gradeSubjectSelect.innerHTML = '<option value="">-- اختر الصف والمادة --</option>';
        data.forEach(item => {
            if (item.grades && item.subjects) {
                const option = document.createElement('option');
                option.value = item.id; // نربط بالـ id الخاص بجدول الربط grade_subjects
                option.textContent = `${item.grades.name} - ${item.subjects.name}`;
                gradeSubjectSelect.appendChild(option);
            }
        });
    }

    // 2. جلب وعرض الوحدات الدراسية
    async function fetchChapters() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="5">جاري جلب البيانات...</td></tr>';

        const { data, error } = await supabaseClient
            .from('chapters')
            .select(`
                id,
                name,
                chapter_order,
                grade_subjects (
                    grades ( name ),
                    subjects ( name )
                )
            `)
            .order('chapter_order', { ascending: true });

        if (error) {
            console.error('Error fetching chapters:', error);
            tableBody.innerHTML = '<tr><td colspan="5" style="color:red;">حدث خطأ أثناء جلب الوحدات.</td></tr>';
            return;
        }

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">لا توجد وحدات دراسية مضافة حتى الآن.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        data.forEach(item => {
            const gradeName = item.grade_subjects && item.grade_subjects.grades ? item.grade_subjects.grades.name : 'غير محدد';
            const subjectName = item.grade_subjects && item.grade_subjects.subjects ? item.grade_subjects.subjects.name : 'غير محدد';
            const chapterName = item.name;
            const chapterOrder = item.chapter_order !== null ? item.chapter_order : '-';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${gradeName}</strong></td>
                <td>${subjectName}</td>
                <td>${chapterName}</td>
                <td>${chapterOrder}</td>
                <td>
                    <button onclick="deleteChapter('${item.id}')" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 3. إضافة وحدة جديدة
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const gradeSubjectId = gradeSubjectSelect.value;
            const name = document.getElementById('chapter-name').value.trim();
            const chapterOrder = document.getElementById('chapter-order').value;

            if (!gradeSubjectId || !name) {
                alert('الرجاء اختيار الصف مع المادة وإدخال اسم الوحدة!');
                return;
            }

            const { error } = await supabaseClient
                .from('chapters')
                .insert([{ 
                    grade_subject_id: gradeSubjectId, 
                    name: name, 
                    chapter_order: chapterOrder ? parseInt(chapterOrder) : null 
                }]);

            if (error) {
                alert('حدث خطأ أثناء حفظ الوحدة!');
                console.error(error);
            } else {
                addForm.reset();
                fetchChapters();
            }
        });
    }

    fetchGradeSubjectsDropdown();
    fetchChapters();
});

// دالة حذف الوحدة
window.deleteChapter = async function(id) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه الوحدة الدراسية؟')) {
        const { error } = await supabaseClient
            .from('chapters')
            .delete()
            .eq('id', id);

        if (error) {
            alert('حدث خطأ أثناء الحذف');
            console.error(error);
        } else {
            // تحديث الجدول مباشرة بعد الحذف
            location.reload();
        }
    }
};
