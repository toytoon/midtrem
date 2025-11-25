-- ============================================================
-- 003_ENSURE_NATIONAL_ID.sql
-- Ensures national_id column exists and has correct constraints
-- ============================================================

-- 1. Add national_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'national_id') THEN
        ALTER TABLE public.students ADD COLUMN national_id VARCHAR(14);
    END IF;
END $$;

-- 2. Ensure it is VARCHAR(14) (Optional: You can skip this if you don't want to force type change)
-- ALTER TABLE public.students ALTER COLUMN national_id TYPE VARCHAR(14);

-- 3. Create unique index if it doesn't exist
-- This ensures no two students have the same National ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_national_id ON public.students(national_id);

-- 4. Add comment
COMMENT ON COLUMN public.students.national_id IS 'Egyptian National ID (14 digits)';
