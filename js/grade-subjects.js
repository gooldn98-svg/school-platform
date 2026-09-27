// js/grade-subjects.js

document.addEventListener('DOMContentLoaded', () => {
    const gradeSelect = document.getElementById('grade-select');
    const subjectSelect = document.getElementById('subject-select');
    const tableBody = document.querySelector('tbody');
    const addForm = document.getElementById('add-grade-subject-form');

    // 1. جلب الصفوف الدراسية للقائمة المنسدلة
    async function fetchGradesDropdown() {
        if (!gradeSelect) return;
        
        const { data, error } = await supabaseClient
            .from('grades')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching grades:', error);
            gradeSelect.innerHTML = '<option value="">خطأ في تحميل الصفوف</option>';
            return;
        }

        gradeSelect.innerHTML = '<option value="">-- اختر الصف الدراسي --</option>';
        if (data && data.length > 0) {
            data.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade.id;
                option.textContent = grade.name;
                gradeSelect.appendChild(option);
            });
        }
    }

    // 2. جلب المواد الدراسية للقائمة المنسدلة
    async function fetchSubjectsDropdown() {
        if (!subjectSelect) return;
        
        const { data, error } = await supabaseClient
            .from('subjects')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching subjects:', error);
            subjectSelect.innerHTML = '<option value="">خطأ في تحميل المواد</option>';
            return;
        }

        subjectSelect.innerHTML = '<option value="">-- اختر المادة الدراسية --</option>';
        if (data && data.length > 0) {
            data.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                subjectSelect.appendChild(option);
            });
        }
    }

    // 3. جلب وعرض روابط المواد بالصفوف في الجدول
    async function fetchGradeSubjects() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="3">جاري جلب البيانات...</td></tr>';

        const { data, error } = await supabaseClient
            .from('grade_subjects')
            .select(`
                id,
                grades ( name ),
                subjects ( name )
            `)
            .order('id', { ascending: false });

        if (error) {
            console.error('Error fetching grade_subjects:', error);
            tableBody.innerHTML = '<tr><td colspan="3" style="color:red;">حدث خطأ أثناء جلب البيانات.</td></tr>';
            return;
        }

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">لا توجد مواد مرتبطة بالصفوف حتى الآن.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        data.forEach(item => {
            const gradeName = item.grades && item.grades.name ? item.grades.name : 'غير محدد';
            const subjectName = item.subjects && item.subjects.name ? item.subjects.name : 'غير محدد';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${gradeName}</strong></td>
                <td>${subjectName}</td>
                <td>
                    <button onclick="deleteGradeSubject('${item.id}')" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 4. إضافة ربط جديد بين صف ومادة
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const gradeId = gradeSelect.value;
            const subjectId = subjectSelect.value;

            if (!gradeId || !subjectId) {
                alert('الرجاء اختيار الصف الدراسي والمادة الدراسية معاً!');
                return;
            }

            const { error } = await supabaseClient
                .from('grade_subjects')
                .insert([{ 
                    grade_id: gradeId, 
                    subject_id: subjectId 
                }]);

            if (error) {
                if (error.code === '23505') {
                    alert('هذه المادة مرتبطة بهذا الصف مسبقاً!');
                } else {
                    alert('حدث خطأ أثناء إتمام عملية الربط!');
                    console.error(error);
                }
            } else {
                addForm.reset();
                fetchGradeSubjects();
            }
        });
    }

    // تشغيل الدوال عند تحميل الصفحة
    fetchGradesDropdown();
    fetchSubjectsDropdown();
    fetchGradeSubjects();
});

// دالة حذف عملية الربط
window.deleteGradeSubject = async function(id) {
    if (confirm('هل أنت متأكد من رغبتك في إلغاء هذا الربط؟')) {
        const { error } = await supabaseClient
            .from('grade_subjects')
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
