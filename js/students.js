// js/students.js

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('tbody');
    const addForm = document.getElementById('add-student-form');
    const nameInput = document.getElementById('student-name');
    const gradeSelect = document.getElementById('student-grade');
    const guardianSelect = document.getElementById('student-guardian');

    // أزرار أداة الإكسل
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

    // 2. جلب أولياء الأمور لتعبئة القائمة المنسدلة
    async function fetchGuardiansForSelect() {
        const { data, error } = await supabaseClient
            .from('guardians')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching guardians:', error);
            return;
        }

        guardianSelect.innerHTML = '<option value="">-- اختر ولي الأمر (اختياري) --</option>';
        if (data) {
            data.forEach(guardian => {
                const option = document.createElement('option');
                option.value = guardian.id;
                option.textContent = guardian.name;
                guardianSelect.appendChild(option);
            });
        }
    }

    // 3. جلب وعرض قائمة الطلاب مع صفوفهم وأولياء أمورهم من قاعدة البيانات
    async function fetchStudents() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="4">جاري جلب البيانات...</td></tr>';

        const { data, error } = await supabaseClient
            .from('students')
            .select(`
                id,
                name,
                grades ( name ),
                guardians ( name )
            `)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching students:', error);
            tableBody.innerHTML = '<tr><td colspan="4" style="color:red;">حدث خطأ أثناء جلب الطلاب.</td></tr>';
            return;
        }

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">لا توجد بيانات طلاب مسجلة حتى الآن.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        data.forEach(student => {
            const gradeName = student.grades ? student.grades.name : 'غير محدد';
            const guardianName = student.guardians ? student.guardians.name : 'غير متوفر';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${student.name}</strong></td>
                <td>${gradeName}</td>
                <td>${guardianName}</td>
                <td>
                    <button onclick="deleteStudent('${student.id}')" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 4. إضافة طالب جديد مع ولي أمره
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const grade_id = gradeSelect.value;
            const guardian_id = guardianSelect.value ? guardianSelect.value : null;

            if (!name || !grade_id) {
                alert('الرجاء إدخال اسم الطالب واختيار الصف الدراسي!');
                return;
            }

            const studentData = { name, grade_id };
            if (guardian_id) {
                studentData.guardian_id = guardian_id;
            }

            const { error } = await supabaseClient
                .from('students')
                .insert([studentData]);

            if (error) {
                alert('حدث خطأ أثناء إضافة الطالب!');
                console.error(error);
            } else {
                addForm.reset();
                fetchStudents();
            }
        });
    }

    // 5. تحميل نموذج إكسل فارغ
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', () => {
            const templateData = [
                { "اسم الطالب": "محمد أحمد علي", "معرف الصف": "اكتب الصف هنا" }
            ];
            const worksheet = XLSX.utils.json_to_sheet(templateData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "الطلاب");
            XLSX.writeFile(workbook, "students_template.xlsx");
        });
    }

    // 6. استيراد الطلاب من ملف إكسل
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

    // 7. تصدير قائمة الطلاب إلى إكسل
    if (exportStudentsBtn) {
        exportStudentsBtn.addEventListener('click', async () => {
            const { data, error } = await supabaseClient
                .from('students')
                .select(`
                    name,
                    grades ( name ),
                    guardians ( name )
                `);

            if (error || !data || data.length === 0) {
                alert('لا توجد بيانات طلاب للتصدير!');
                return;
            }

            const exportData = data.map(s => ({
                "اسم الطالب": s.name,
                "الصف الدراسي": s.grades ? s.grades.name : 'غير محدد',
                "ولي الأمر": s.guardians ? s.guardians.name : 'غير متوفر'
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "الطلاب");
            XLSX.writeFile(workbook, "all_students.xlsx");
        });
    }

    // تشغيل الدوال عند تحميل الصفحة
    fetchGradesForSelect();
    fetchGuardiansForSelect();
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
