// js/students.js

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('tbody');
    const addForm = document.getElementById('add-student-form');
    const nameInput = document.getElementById('student-name');
    const gradeSelect = document.getElementById('student-grade');
    const guardianSelect = document.getElementById('student-guardian');
    const submitButton = addForm?.querySelector('button[type="submit"]');

    // أزرار أداة الإكسل
    const downloadTemplateBtn = document.getElementById('download-template-btn');
    const excelFileInput = document.getElementById('excel-file-input');
    const exportStudentsBtn = document.getElementById('export-students-btn');

    function showTableMessage(message, isError = false) {
        if (!tableBody) return;
        tableBody.innerHTML = `<tr><td colspan="4"${isError ? ' style="color:red;"' : ''}>${message}</td></tr>`;
    }

    // 1. جلب الصفوف الدراسية لتعبئة القائمة المنسدلة
    async function fetchGradesForSelect() {
        try {
            const { data, error } = await supabaseClient
                .from('grades')
                .select('id, name')
                .order('name', { ascending: true });

            if (error) throw error;

            gradeSelect.innerHTML = '<option value="">-- اختر الصف الدراسي --</option>';
            if (data && data.length > 0) {
                data.forEach(grade => {
                    const option = document.createElement('option');
                    option.value = grade.id;
                    option.textContent = grade.name;
                    gradeSelect.appendChild(option);
                });
            } else {
                gradeSelect.innerHTML += '<option disabled>لا توجد صفوف. أنشئ صفاً أولاً</option>';
            }
        } catch (error) {
            console.error('Error fetching grades:', error);
            gradeSelect.innerHTML = '<option disabled>خطأ في جلب الصفوف</option>';
        }
    }

    // 2. جلب أولياء الأمور لتعبئة القائمة المنسدلة
    async function fetchGuardiansForSelect() {
        try {
            const { data, error } = await supabaseClient
                .from('guardians')
                .select('id, name')
                .order('name', { ascending: true });

            if (error) throw error;

            guardianSelect.innerHTML = '<option value="">-- اختر ولي الأمر (اختياري) --</option>';
            if (data && data.length > 0) {
                data.forEach(guardian => {
                    const option = document.createElement('option');
                    option.value = guardian.id;
                    option.textContent = guardian.name;
                    guardianSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error fetching guardians:', error);
        }
    }

    // 3. جلب وعرض قائمة الطلاب
    async function fetchStudents() {
        if (!tableBody) return;
        showTableMessage('جاري جلب البيانات...');

        try {
            const { data, error } = await supabaseClient
                .from('students')
                .select(`
                    id,
                    name,
                    grade_id,
                    guardian_id,
                    grades:grade_id(id, name),
                    guardians:guardian_id(id, name)
                `)
                .order('name', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                showTableMessage('لا توجد بيانات طلاب مسجلة حتى الآن.');
                return;
            }

            tableBody.innerHTML = '';
            data.forEach(student => {
                const gradeName = student.grades ? student.grades.name : 'غير محدد';
                const guardianName = student.guardians ? student.guardians.name : 'غير متوفر';
                const row = document.createElement('tr');
                
                const nameCell = document.createElement('td');
                const gradeCell = document.createElement('td');
                const guardianCell = document.createElement('td');
                const actionCell = document.createElement('td');
                const deleteButton = document.createElement('button');

                nameCell.innerHTML = `<strong></strong>`;
                nameCell.querySelector('strong').textContent = student.name || '';
                gradeCell.textContent = gradeName;
                guardianCell.textContent = guardianName;
                deleteButton.type = 'button';
                deleteButton.textContent = 'حذف';
                deleteButton.style.cssText = 'background-color:#ef4444;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;';
                deleteButton.addEventListener('click', () => deleteStudent(student.id));

                actionCell.appendChild(deleteButton);
                row.append(nameCell, gradeCell, guardianCell, actionCell);
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching students:', error);
            showTableMessage(`خطأ: ${error.message}`, true);
        }
    }

    // 4. إضافة طالب جديد
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput?.value.trim() || '';
            const grade_id = gradeSelect?.value || '';
            const guardian_id = guardianSelect?.value ? guardianSelect.value : null;

            if (!name || !grade_id) {
                alert('الرجاء إدخال اسم الطالب واختيار الصف الدراسي!');
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'جارٍ الإضافة...';
            }

            try {
                const studentData = { name, grade_id };
                if (guardian_id) {
                    studentData.guardian_id = guardian_id;
                }

                const { error } = await supabaseClient
                    .from('students')
                    .insert([studentData]);

                if (error) throw error;

                addForm.reset();
                await fetchStudents();
            } catch (error) {
                console.error('Error adding student:', error);
                alert(`خطأ: ${error.message}`);
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'إضافة الطالب';
                }
            }
        });
    }

    // 5. تحميل نموذج إكسل فارغ
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', () => {
            const templateData = [
                { "اسم الطالب": "محمد أحمد علي", "الصف الدراسي": "الأول الثانوي" }
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
                try {
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
                    await fetchStudents();
                    excelFileInput.value = '';
                } catch (error) {
                    console.error('Error importing from Excel:', error);
                    alert(`خطأ في الاستيراد: ${error.message}`);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // 7. تصدير قائمة الطلاب إلى إكسل
    if (exportStudentsBtn) {
        exportStudentsBtn.addEventListener('click', async () => {
            try {
                const { data, error } = await supabaseClient
                    .from('students')
                    .select(`
                        name,
                        grades:grade_id(id, name),
                        guardians:guardian_id(id, name)
                    `);

                if (error) throw error;
                if (!data || data.length === 0) {
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
            } catch (error) {
                console.error('Error exporting students:', error);
                alert(`خطأ في التصدير: ${error.message}`);
            }
        });
    }

    // تشغيل الدوال عند تحميل الصفحة
    fetchGradesForSelect();
    fetchGuardiansForSelect();
    fetchStudents();
});

// دالة حذف الطالب
async function deleteStudent(id) {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الطالب؟')) return;

    try {
        const { error } = await supabaseClient
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;
        location.reload();
    } catch (error) {
        alert(`خطأ في الحذف: ${error.message}`);
        console.error('Error deleting student:', error);
    }
}

window.deleteStudent = deleteStudent;
