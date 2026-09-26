// js/semesters.js

document.addEventListener('DOMContentLoaded', () => {
    const yearSelect = document.getElementById('academic-year-select');
    const tableBody = document.querySelector('tbody'); 
    const addForm = document.getElementById('add-semester-form');

    // 1. جلب السنوات الدراسية لملء القائمة المنسدلة
    async function fetchAcademicYearsDropdown() {
        if (!yearSelect) return;
        
        const { data, error } = await supabaseClient
            .from('academic_years')
            .select('id, name')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching academic years:', error);
            yearSelect.innerHTML = '<option value="">خطأ في تحميل السنوات الدراسية</option>';
            return;
        }

        yearSelect.innerHTML = '<option value="">-- اختر السنة الدراسية --</option>';
        data.forEach(year => {
            const option = document.createElement('option');
            option.value = year.id;
            option.textContent = year.name;
            yearSelect.appendChild(option);
        });
    }

    // 2. جلب وعرض الفصول الدراسية
    async function fetchSemesters() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="5">جاري جلب الفصول الدراسية...</td></tr>';

        const { data, error } = await supabaseClient
            .from('semesters')
            .select(`
                id,
                name,
                start_date,
                end_date,
                academic_years ( name )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching semesters:', error);
            tableBody.innerHTML = '<tr><td colspan="5" style="color:red;">حدث خطأ أثناء جلب الفصول الدراسية.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">لا توجد فصول دراسية مضافة حتى الآن.</td></tr>';
            return;
        }

        data.forEach(semester => {
            const yearName = semester.academic_years ? semester.academic_years.name : 'غير محددة';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${semester.name}</strong></td>
                <td>${yearName}</td>
                <td>${semester.start_date || 'غير محدد'}</td>
                <td>${semester.end_date || 'غير محدد'}</td>
                <td>
                    <button onclick="deleteSemester('${semester.id}')" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 3. إضافة فصل دراسي جديد
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const academicYearId = yearSelect.value;
            const name = document.getElementById('semester-name').value.trim();
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;

            if (!academicYearId || !name) {
                alert('الرجاء اختيار السنة الدراسية وإدخال اسم الفصل!');
                return;
            }

            const { error } = await supabaseClient
                .from('semesters')
                .insert([
                    { 
                        academic_year_id: academicYearId, 
                        name: name, 
                        start_date: startDate || null, 
                        end_date: endDate || null 
                    }
                ]);

            if (error) {
                alert('حدث خطأ أثناء إضافة الفصل الدراسي!');
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

// 4. دالة لحذف فصل دراسي
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
