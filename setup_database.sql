-- ملف إنشاء جميع الجداول المطلوبة للمنصة
-- انسخ هذا الكود وشغّله في SQL Editor في Supabase

-- 1. جدول السنوات الدراسية
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. جدول الفصول الدراسية
CREATE TABLE IF NOT EXISTS semesters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. جدول الصفوف الدراسية
CREATE TABLE IF NOT EXISTS grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- 4. جدول المواد الدراسية
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50),
  created_at TIMESTAMP DEFAULT now()
);

-- 5. جدول ربط الصفوف بالمواد
CREATE TABLE IF NOT EXISTS grade_subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(grade_id, subject_id)
);

-- 6. جدول المعلمين
CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT now()
);

-- 7. جدول أولياء الأمور
CREATE TABLE IF NOT EXISTS guardians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT now()
);

-- 8. جدول الشعب والفصول
CREATE TABLE IF NOT EXISTS sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- 9. جدول الطلاب
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- تفعيل Row Level Security (RLS) وإضافة السياسات
-- ============================================

-- تفعيل RLS لجميع الجداول
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- السياسات للسماح بالقراءة والكتابة لجميع المستخدمين (يمكنك تقييدها لاحقاً)
CREATE POLICY "Allow all select" ON academic_years FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON academic_years FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON academic_years FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON academic_years FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON semesters FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON semesters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON semesters FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON semesters FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON grades FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON grades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON grades FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON grades FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON subjects FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON subjects FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON grade_subjects FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON grade_subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON grade_subjects FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON grade_subjects FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON teachers FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON teachers FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON teachers FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON guardians FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON guardians FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON guardians FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON guardians FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON sections FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON sections FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON sections FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON students FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON students FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON students FOR DELETE USING (true);

-- تم إنشاء الجداول والسياسات بنجاح!
