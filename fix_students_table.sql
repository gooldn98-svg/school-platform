-- إصلاح جدول students مع العلاقات الصحيحة

-- 1. حذف الجدول القديم إن وجد (احذر: سيحذف جميع البيانات)
DROP TABLE IF EXISTS students CASCADE;

-- 2. إنشاء جدول students بالشكل الصحيح
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. تفعيل Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 4. إضافة السياسات (Policies)
-- سياسة SELECT - السماح لجميع المستخدمين بقراءة البيانات
CREATE POLICY "Allow all select on students"
ON students FOR SELECT
USING (true);

-- سياسة INSERT - السماح لجميع المستخدمين بإضافة طلاب
CREATE POLICY "Allow all insert on students"
ON students FOR INSERT
WITH CHECK (true);

-- سياسة UPDATE - السماح لجميع المستخدمين بتعديل البيانات
CREATE POLICY "Allow all update on students"
ON students FOR UPDATE
USING (true);

-- سياسة DELETE - السماح لجميع المستخدمين بحذف الطلاب
CREATE POLICY "Allow all delete on students"
ON students FOR DELETE
USING (true);

-- تم إنشاء جدول students بالشكل الصحيح!
