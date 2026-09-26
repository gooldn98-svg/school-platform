// js/academic-years.js

document.addEventListener('DOMContentLoaded', async () => {
    const yearForm = document.getElementById('add-year-form') || document.querySelector('form');
    const yearsTableBody = document.querySelector('tbody') || document.getElementById('years-list');

    // جلب السنوات الدراسية عند تحميل الصفحة
    await fetchAcademicYears();

    // إضافة سنة دراسية جديدة
    if (yearForm) {
        yearForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('year-name') || document.querySelector('input[type="text"]');
            const startDateInput = document.getElementById('start-date');
            const endDateInput = document.getElementById('end-date');

            const name = nameInput ? nameInput.value.trim() : '';
            const startDate = startDateInput ? startDateInput.value : null;
            const endDate = endDateInput ? endDateInput.value : null;

            if (!name) {
                alert('يرجى إدخال اسم/عنوان السنة الدراسية (مثال: 2025-2026)');
                return;
            }

            const { data, error } = await supabaseClient
                .from('academic_years')
                .insert([{ 
                    name: name, 
                    start_date: startDate || null, 
                    end_date: endDate || null 
                }]);

            if (error) {
                console.error('خطأ في إضافة السنة الدراسية:', error);
                alert('حدث خطأ أثناء الإضافة: ' + error.message);
            } else {
                if (nameInput) nameInput.value = '';
                if (startDateInput) startDateInput.value = '';
                if (endDateInput) endDateInput.value = '';
                await fetchAcademicYears();
            }
        });
    }

    // دالة جلب السنوات الدراسية من Supabase
    async function fetchAcademicYears() {
        const { data: years, error } = await supabaseClient
            .from('academic_years')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error('خطأ في جلب البيانات:', error);
            return;
        }

        renderAcademicYears(years);
    }

    // عرض البيانات في الجدول
    function renderAcademicYears(years) {
        if (!yearsTableBody) return;

        if (!years || years.length === 0) {
            yearsTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #666;">لا توجد سنوات دراسية مضافة حتى الآن.</td>
                </tr>`;
            return;
        }

        yearsTableBody.innerHTML = years.map(year => `
            <tr>
                <td>${year.name}</td>
                <td>${year.start_date || '-'}</td>
                <td>${year.end_date || '-'}</td>
                <td>
                    <button onclick="deleteAcademicYear(${year.id})" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            </tr>
        `).join('');
    }

    // دالة حذف سنة دراسية
    window.deleteAcademicYear = async (id) => {
        if (confirm('هل أنت تأكد من رغبتك في حذف هذه السنة الدراسية؟')) {
            const { error } = await supabaseClient
                .from('academic_years')
                .delete()
                .eq('id', id);

            if (error) {
                alert('خطأ في الحذف: ' + error.message);
            } else {
                await fetchAcademicYears();
            }
        }
    };
});
