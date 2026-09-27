// js/students.js

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('tbody');
    const addForm = document.getElementById('add-student-form');
    const nameInput = document.getElementById('student-name');
    const gradeSelect = document.getElementById('student-grade');

    // عناصر أزرار الإكسل
    const downloadTemplateBtn = document.getElementById('download-template-btn');
    const excelFileInput = document.getElementById('excel-file-input');
    const exportStudentsBtn = document.getElementById('export-students-btn');

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

    // 2. جلب وعرض قائمة الطلاب مع صفوفهم من قاعدة البيانات
    async function fetchStudents() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="3">جاري جلب البيانات...</td></tr>';

        // جلب الطلاب مع ربطهم بجدول الصفوف لجلب اسم الصف مباشرة
        const { data, error } = await supabaseClient
            .from('students')
            .select(`
                id,
                name,
                grades ( name )
            `)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching students:', error);
            tableBody.innerHTML = '<tr><td colspan="3" style="color:red;">حدث خطأ أثناء جلب الطلاب.</td></tr>';
            return;
        }

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">لا توجد بيانات طلاب مسجلة حتى الآن.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        data.forEach(student => {
            const gradeName = student.grades ? student.grades.name : 'غير محدد';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${student.name}</strong></td>
                <td>${gradeName}</td>
                <td>
                    <button onclick="deleteStudent('${student.id}')" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 3. إضافة طالب جديد
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const grade_id = gradeSelect.value;

            if (!name || !grade_id) {
                alert('الرجاء إدخال اسم الطالب واختيار الصف الدراسي!');
                return;
            }

            const { error } = await supabaseClient
                .from('students')
                .insert([{ name, grade_id }]);

            if (error) {
                alert('حدث خطأ أثناء إضافة الطالب!');
                console.error(error);
            } else {
                addForm.reset();
                fetchStudents();
            }
        });
    }

    // 4. تحميل نموذج إكسل فارغ جاهز للتعبئة
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', () => {
            const templateData = [
                { "اسم الطالب": "محمد أحمد علي", "معرف الصف": "اكتب اسم أو معرف الصف هنا" }
            ];
            const worksheet = XLSX.utils.json_to_sheet(templateData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "الطلاب");
            XLSX.writeFile(workbook, "students_template.xlsx");
        });
    }

    // 5. استيراد الطلاب من ملف إكسل مرفوع
    if (excelFileInput) {
        excelFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonRows = XLSX.utils.sheet_to_json(worksheet);

                if (jsonRows.length === 0) {
                    alert('ملف الإكسل فارغ!');
                    return;
                }

                // جلب الصفوف المتاحة لمطابقتها إذا لزم الأمر
                let successCount = 0;
                for (let row of jsonRows) {
                    const studentName = row["اسم الطالب"];
                    if (studentName) {
                        const { error } = await supabaseClient
                            .from('students')
                            .insert([{ name: studentName }]);
                        
                        if (!error) successCount++;
                    }
                }

                alert(`تم استيراد ${successCount} طالب بنجاح!`);
                fetchStudents();
                excelFileInput.value = '';
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // 6. تصدير قائمة الطلاب الحاليين إلى ملف إكسل
    if (exportStudentsBtn) {
        exportStudentsBtn.addEventListener('click', async () => {
            const { data, error } = await supabaseClient
                .from('students')
                .select(`
                    name,
                    grades ( name )
                `);

            if (error || !data || data.length === 0) {
                alert('لا توجد بيانات طلاب للتصدير!');
                return;
            }

            const exportData = data.map(s => ({
                "اسم الطالب": s.name,
                "الصف الدراسي": s.grades ? s.grades.name : 'غير محدد'
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "الطلاب");
            XLSX.writeFile(workbook, "all_students.xlsx");
        });
    }

    // تشغيل الدوال عند تحميل الصفحة
    fetchGradesForSelect();
    fetchStudents();
});

// دالة حذف الطالب
window.deleteStudent = async function(id) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الطالب؟')) {
        const { error } = await supabaseClient
            .from('students')
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
