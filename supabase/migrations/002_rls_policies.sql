-- ============================================================
-- 002_RLS_POLICIES.sql
-- Row Level Security policies for CRUD operations
-- ============================================================

-- ============================================================
-- STUDENTS TABLE - RLS POLICIES
-- ============================================================

-- SELECT - Allow all to read
DROP POLICY IF EXISTS "students_select_all" ON public.students;
CREATE POLICY "students_select_all"
  ON public.students FOR SELECT
  USING (true);

-- INSERT - Allow all from app (app validates admin)
DROP POLICY IF EXISTS "students_insert_all" ON public.students;
CREATE POLICY "students_insert_all"
  ON public.students FOR INSERT
  WITH CHECK (true);

-- UPDATE - Allow all from app (app validates admin)
DROP POLICY IF EXISTS "students_update_all" ON public.students;
CREATE POLICY "students_update_all"
  ON public.students FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE - Allow all from app (app validates admin)
DROP POLICY IF EXISTS "students_delete_all" ON public.students;
CREATE POLICY "students_delete_all"
  ON public.students FOR DELETE
  USING (true);

-- ============================================================
-- COURSES TABLE - RLS POLICIES
-- ============================================================

-- SELECT - Allow all to read
DROP POLICY IF EXISTS "courses_select_all" ON public.courses;
CREATE POLICY "courses_select_all"
  ON public.courses FOR SELECT
  USING (true);

-- INSERT - Allow all from app
DROP POLICY IF EXISTS "courses_insert_all" ON public.courses;
CREATE POLICY "courses_insert_all"
  ON public.courses FOR INSERT
  WITH CHECK (true);

-- UPDATE - Allow all from app
DROP POLICY IF EXISTS "courses_update_all" ON public.courses;
CREATE POLICY "courses_update_all"
  ON public.courses FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE - Allow all from app
DROP POLICY IF EXISTS "courses_delete_all" ON public.courses;
CREATE POLICY "courses_delete_all"
  ON public.courses FOR DELETE
  USING (true);

-- ============================================================
-- GRADES TABLE - RLS POLICIES
-- ============================================================

-- SELECT - Allow all to read
DROP POLICY IF EXISTS "grades_select_all" ON public.grades;
CREATE POLICY "grades_select_all"
  ON public.grades FOR SELECT
  USING (true);

-- INSERT - Allow all from app
DROP POLICY IF EXISTS "grades_insert_all" ON public.grades;
CREATE POLICY "grades_insert_all"
  ON public.grades FOR INSERT
  WITH CHECK (true);

-- UPDATE - Allow all from app
DROP POLICY IF EXISTS "grades_update_all" ON public.grades;
CREATE POLICY "grades_update_all"
  ON public.grades FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE - Allow all from app
DROP POLICY IF EXISTS "grades_delete_all" ON public.grades;
CREATE POLICY "grades_delete_all"
  ON public.grades FOR DELETE
  USING (true);

-- ============================================================
-- ADMINS TABLE - RLS POLICIES
-- ============================================================

-- SELECT - Allow all to read (needed for login)
DROP POLICY IF EXISTS "admins_select_all" ON public.admins;
CREATE POLICY "admins_select_all"
  ON public.admins FOR SELECT
  USING (true);

-- INSERT - Block (only via migrations)
DROP POLICY IF EXISTS "admins_insert_blocked" ON public.admins;
CREATE POLICY "admins_insert_blocked"
  ON public.admins FOR INSERT
  WITH CHECK (false);

-- UPDATE - Block (only via migrations)
DROP POLICY IF EXISTS "admins_update_blocked" ON public.admins;
CREATE POLICY "admins_update_blocked"
  ON public.admins FOR UPDATE
  USING (false);

-- DELETE - Block (only via migrations)
DROP POLICY IF EXISTS "admins_delete_blocked" ON public.admins;
CREATE POLICY "admins_delete_blocked"
  ON public.admins FOR DELETE
  USING (false);

-- ============================================================
-- AUDIT LOGS TABLE - RLS POLICIES
-- ============================================================

-- SELECT - Allow all to read
DROP POLICY IF EXISTS "audit_logs_select_all" ON public.audit_logs;
CREATE POLICY "audit_logs_select_all"
  ON public.audit_logs FOR SELECT
  USING (true);

-- INSERT - Allow all from app
DROP POLICY IF EXISTS "audit_logs_insert_all" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_all"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- UPDATE - Block
DROP POLICY IF EXISTS "audit_logs_update_blocked" ON public.audit_logs;
CREATE POLICY "audit_logs_update_blocked"
  ON public.audit_logs FOR UPDATE
  USING (false);

-- DELETE - Block
DROP POLICY IF EXISTS "audit_logs_delete_blocked" ON public.audit_logs;
CREATE POLICY "audit_logs_delete_blocked"
  ON public.audit_logs FOR DELETE
  USING (false);

-- ============================================================
-- ADMIN SESSIONS TABLE - RLS POLICIES
-- ============================================================

-- SELECT - Allow all
DROP POLICY IF EXISTS "sessions_select_all" ON public.admin_sessions;
CREATE POLICY "sessions_select_all"
  ON public.admin_sessions FOR SELECT
  USING (true);

-- INSERT - Allow all
DROP POLICY IF EXISTS "sessions_insert_all" ON public.admin_sessions;
CREATE POLICY "sessions_insert_all"
  ON public.admin_sessions FOR INSERT
  WITH CHECK (true);

-- UPDATE - Allow all
DROP POLICY IF EXISTS "sessions_update_all" ON public.admin_sessions;
CREATE POLICY "sessions_update_all"
  ON public.admin_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE - Allow all
DROP POLICY IF EXISTS "sessions_delete_all" ON public.admin_sessions;
CREATE POLICY "sessions_delete_all"
  ON public.admin_sessions FOR DELETE
  USING (true);

-- ============================================================
-- DONE - All RLS policies configured
-- Students, Courses, Grades: Full CRUD enabled
-- Admins: READ-ONLY (managed via migrations)
-- ============================================================
