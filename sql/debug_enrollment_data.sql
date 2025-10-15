-- Debug Enrollment Display Issue
-- Check if user_id in enrollments matches auth.users

-- 1. Show all enrollments with user details
SELECT 
    ce.id as enrollment_id,
    ce.user_id as enrollment_user_id,
    ce.course_id,
    ce.status,
    ce.payment_status,
    ce.enrolled_at,
    au.id as auth_user_id,
    au.email as auth_email,
    c.title as course_title
FROM public.course_enrollments ce
LEFT JOIN auth.users au ON au.id = ce.user_id
LEFT JOIN public.courses c ON c.id = ce.course_id
ORDER BY ce.enrolled_at DESC
LIMIT 10;

-- 2. Check if there are enrollments with non-matching user_ids
SELECT 
    'Orphaned enrollments (user_id not in auth.users):' as issue,
    COUNT(*) as count
FROM public.course_enrollments ce
LEFT JOIN auth.users au ON au.id = ce.user_id
WHERE au.id IS NULL;

-- 3. Show your auth user ID (replace with your email)
SELECT 
    'Your auth user ID:' as info,
    id as user_id,
    email
FROM auth.users
WHERE email LIKE '%@%'  -- Replace with your actual email pattern
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check if course relation works
SELECT 
    ce.id,
    ce.course_id,
    c.id as actual_course_id,
    c.title,
    CASE 
        WHEN c.id IS NULL THEN 'Course not found!'
        ELSE 'Course OK'
    END as course_status
FROM public.course_enrollments ce
LEFT JOIN public.courses c ON c.id = ce.course_id
ORDER BY ce.enrolled_at DESC
LIMIT 10;

-- 5. Check for any RLS blocking reads
-- If this returns data but the API doesn't, RLS might be blocking
SELECT 
    'Checking RLS status:' as info,
    relrowsecurity as rls_enabled
FROM pg_class
WHERE relname = 'course_enrollments';

