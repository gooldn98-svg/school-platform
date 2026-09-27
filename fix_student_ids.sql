-- توحيد نوع مفاتيح الطلاب مع الجداول الحالية.
-- نتائج Supabase توضح أن grades.id و guardians.id من نوع bigint،
-- لذلك يجب أن يكون students.grade_id و students.guardian_id من نوع bigint أيضاً.

ALTER TABLE students DROP CONSTRAINT IF EXISTS students_grade_id_fkey;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_guardian_id_fkey;

ALTER TABLE students
  ALTER COLUMN grade_id TYPE bigint USING NULLIF(grade_id::text, '')::bigint,
  ALTER COLUMN guardian_id TYPE bigint USING NULLIF(guardian_id::text, '')::bigint;

ALTER TABLE students
  ADD CONSTRAINT students_grade_id_fkey
  FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE;

ALTER TABLE students
  ADD CONSTRAINT students_guardian_id_fkey
  FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';
