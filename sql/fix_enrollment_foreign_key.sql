-- Fix Course Enrollments Foreign Key Issue
-- The problem: course_enrollments.user_id references public.users, but we're using auth.users IDs

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.course_enrollments 
DROP CONSTRAINT IF EXISTS course_enrollments_user_id_fkey;

-- Step 2: Verify the user_id column type matches auth.users.id (should be TEXT or UUID)
-- Check current type
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'course_enrollments' 
AND column_name = 'user_id';

-- Step 3: Add correct foreign key constraint to auth.users
-- Note: This will fail if there are existing enrollments with invalid user_ids
-- If it fails, we'll need to clean up invalid data first

ALTER TABLE public.course_enrollments
ADD CONSTRAINT course_enrollments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Verify the constraint was added
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'course_enrollments'
AND kcu.column_name = 'user_id';

-- Test: Show what users can have enrollments
SELECT 
    'Valid auth users:' as info,
    COUNT(*) as count 
FROM auth.users;

-- If you see errors, run this to check for orphaned enrollments:
SELECT 
    ce.id,
    ce.user_id,
    'This enrollment has invalid user_id' as issue
FROM public.course_enrollments ce
LEFT JOIN auth.users au ON au.id::text = ce.user_id
WHERE au.id IS NULL;

