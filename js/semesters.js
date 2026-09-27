// js/semesters.js

document.addEventListener('DOMContentLoaded', () => {
    const academicYearSelect = document.getElementById('academic-year-select');
    const tableBody = document.querySelector('tbody');
    const addForm = document.getElementById('add-semester-form');

    // 1. جلب السنوات الدراسية للقائمة المنسدلة
    async function fetchAcademicYearsDropdown() {
        if (!academicYearSelect) return;
        
        const { data, error } = await supabaseClient
            .from('academic_years')
            .select('id, name')
            .order('name', { ascending: false });

        if (error) {
            console.error('Error fetching academic years:', error);
            academicYearSelect.innerHTML = '<option value="">خطأ في تحميل السنوات</option>';
            return;
        }

        academicYearSelect.innerHTML = '<option value="">-- اختر السنة الدراسية --</option>';
        if (data && data.length > 0) {
            data.forEach(year => {
                const option = document.createElement('option');
                option.value = year.id;
                option.textContent = year.name;
                academicYearSelect.appendChild(option);
            });
        }
    }

    // 2. جلب وعرض الفصول الدراسية في الجدول (مع تحديد اسم مفتاح الربط بدقة)
    async function fetchSemesters() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="3">جاري جلب البيانات...</td></tr>';

        const { data, error } = await supabaseClient
            .from('semesters')
            .select(`
                id,
                name,
                academic_years!academic_year_id ( name )
            `)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching semesters:', error);
            tableBody.innerHTML = '<tr><td colspan="3" style="color:red;">حدث خطأ أثناء جلب الفصول.</td></tr>';
            return;
        }

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">لا توجد فصول دراسية مضافة حتى الآن.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        data.forEach(item => {
            const semesterName = item.name;
            // التحقق من البيانات المسترجعة للعام الدراسي
            let yearName = 'غير محددة';
            if (item.academic_years) {
                if (Array.isArray(item.academic_years)) {
                    yearName = item.academic_years.length > 0 ? item.academic_years[0].name : 'غير محددة';
                } else {
                    yearName = item.academic_years.name || 'غير محددة';
                }
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${semesterName}</strong></td>
                <td>${yearName}</td>
                <td>
                    <button onclick="deleteSemester('${item.id}')" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 3. إضافة فصل دراسي جديد
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('semester-name').value.trim();
            const academicYearId = academicYearSelect.value;

            if (!name || !academicYearId) {
                alert('الرجاء إدخال اسم الفصل واختيار السنة الدراسية!');
                return;
            }

            const { error } = await supabaseClient
                .from('semesters')
                .insert([{ 
                    name: name, 
                    academic_year_id: academicYearId 
                }]);

            if (error) {
                alert('حدث خطأ أثناء حفظ الفصل الدراسي!');
                console.error(error);
            } else {
                addForm.reset();
                fetchSemesters();
            }
        });
    }

    fetchAcademicYearsDropdown();
    fetchSemesters();
});

// دالة حذف الفصل الدراسي
window.deleteSemester = async function(id) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الفصل الدراسي؟')) {
        const { error } = await supabaseClient
            .from('semesters')
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
