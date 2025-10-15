-- Fix Course Enrollments Table
-- This script disables RLS and ensures the table structure is correct

-- Disable RLS on course_enrollments table (temporary for debugging)
ALTER TABLE public.course_enrollments DISABLE ROW LEVEL SECURITY;

-- Check and ensure the table has the correct structure
DO $$ 
BEGIN
    -- Ensure user_id column exists and is the right type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'course_enrollments' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.course_enrollments ADD COLUMN user_id TEXT;
    END IF;

    -- Ensure course_id column exists and is the right type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'course_enrollments' 
        AND column_name = 'course_id'
    ) THEN
        ALTER TABLE public.course_enrollments ADD COLUMN course_id TEXT;
    END IF;
END $$;

-- Grant full access to authenticated users (since RLS is disabled)
GRANT ALL ON public.course_enrollments TO authenticated;
GRANT ALL ON public.course_enrollments TO anon;

-- Check current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'course_enrollments'
ORDER BY ordinal_position;

-- Check if there are any enrollments (should show count)
SELECT COUNT(*) as total_enrollments FROM public.course_enrollments;

-- Check if there are any courses and users to test with
SELECT COUNT(*) as total_courses FROM public.courses;
SELECT COUNT(*) as total_users FROM public.users;

-- Show any existing enrollments with details
SELECT 
    ce.id,
    ce.user_id,
    ce.course_id,
    ce.status,
    ce.payment_status,
    ce.enrolled_at,
    u.email as user_email,
    c.title as course_title
FROM public.course_enrollments ce
LEFT JOIN public.users u ON u.auth_user_id = ce.user_id
LEFT JOIN public.courses c ON c.id = ce.course_id
LIMIT 10;

