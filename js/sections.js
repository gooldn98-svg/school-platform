// js/sections.js

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('tbody');
    const addForm = document.getElementById('add-section-form');
    const nameInput = document.getElementById('section-name');
    const gradeSelect = document.getElementById('section-grade');

    // 1. جلب الصفوف الدراسية لتعبئة القائمة المنسدلة
    async function fetchGradesForSelect() {
        const { data, error } = await supabaseClient
            .from('grades')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching grades:', error);
            return;
        }

        gradeSelect.innerHTML = '<option value="">-- اختر الصف الدراسي --</option>';
        if (data) {
            data.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade.id;
                option.textContent = grade.name;
                gradeSelect.appendChild(option);
            });
        }
    }

    // 2. جلب وعرض قائمة الشعب مع صفوفها من قاعدة البيانات
    async function fetchSections() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="3">جاري جلب البيانات...</td></tr>';

        const { data, error } = await supabaseClient
            .from('sections')
            .select(`
                id,
                name,
                grades ( name )
            `)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching sections:', error);
            tableBody.innerHTML = '<tr><td colspan="3" style="color:red;">حدث خطأ أثناء جلب الشعب.</td></tr>';
            return;
        }

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">لا توجد شعب مسجلة حتى الآن.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        data.forEach(section => {
            const gradeName = section.grades ? section.grades.name : 'غير محدد';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${section.name}</strong></td>
                <td>${gradeName}</td>
                <td>
                    <button onclick="deleteSection('${section.id}')" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 3. إضافة شعبة جديدة
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const grade_id = gradeSelect.value;

            if (!name || !grade_id) {
                alert('الرجاء إدخال اسم الشعبة واختيار الصف الدراسي!');
                return;
            }

            const { error } = await supabaseClient
                .from('sections')
                .insert([{ name, grade_id }]);

            if (error) {
                alert('حدث خطأ أثناء إضافة الشعبة!');
                console.error(error);
            } else {
                addForm.reset();
                fetchSections();
            }
        });
    }

    // تشغيل الدوال عند تحميل الصفحة
    fetchGradesForSelect();
    fetchSections();
});

// دالة حذف الشعبة
window.deleteSection = async function(id) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه الشعبة؟')) {
        const { error } = await supabaseClient
            .from('sections')
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
