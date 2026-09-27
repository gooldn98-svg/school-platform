-- إصلاح جداول guardians و students

-- 1. حذف الجداول القديمة
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS guardians CASCADE;

-- 2. إنشاء جدول guardians بشكل صحيح
CREATE TABLE guardians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT now()
);

-- 3. إنشاء جدول students بشكل صحيح
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 4. تفعيل Row Level Security
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 5. سياسات guardians
CREATE POLICY "Allow all select on guardians" ON guardians FOR SELECT USING (true);
CREATE POLICY "Allow all insert on guardians" ON guardians FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on guardians" ON guardians FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on guardians" ON guardians FOR DELETE USING (true);

-- 6. سياسات students
CREATE POLICY "Allow all select on students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow all insert on students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on students" ON students FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on students" ON students FOR DELETE USING (true);

-- تم الإصلاح بنجاح!
