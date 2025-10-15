-- Diagnose Enrollment Issues
-- Run this to understand what's in the database

-- 1. Check total enrollments in database
SELECT 
    COUNT(*) as total_enrollments,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_enrollments,
    COUNT(CASE WHEN payment_status = 'PAID' THEN 1 END) as paid_enrollments,
    COUNT(CASE WHEN payment_status = 'PENDING' THEN 1 END) as pending_enrollments
FROM public.course_enrollments;

-- 2. Show ALL enrollments with user and course info
SELECT 
    ce.id,
    ce.user_id,
    ce.course_id,
    ce.status,
    ce.payment_status,
    ce.payment_amount,
    ce.enrolled_at,
    u.email as user_email,
    u.name as user_name,
    c.title as course_title
FROM public.course_enrollments ce
LEFT JOIN public.users u ON u.auth_user_id::text = ce.user_id
LEFT JOIN public.courses c ON c.id = ce.course_id
ORDER BY ce.enrolled_at DESC
LIMIT 20;

-- 3. Check if YOUR user has any enrollments
-- First, find your user ID from the auth.users table:
SELECT 
    'Your Auth User ID:' as info,
    id as auth_user_id,
    email
FROM auth.users
WHERE email = 'YOUR_EMAIL@example.com'  -- REPLACE WITH YOUR EMAIL
LIMIT 1;

-- 4. Check enrollments for YOUR specific user (replace the UUID below)
SELECT 
    ce.*,
    c.title as course_title
FROM public.course_enrollments ce
LEFT JOIN public.courses c ON c.id = ce.course_id
WHERE ce.user_id = 'YOUR_AUTH_USER_ID'  -- REPLACE WITH YOUR AUTH USER ID FROM STEP 3
ORDER BY ce.enrolled_at DESC;

-- 5. Check Stripe webhook recent activity (if you have any payments)
-- This helps identify if webhooks are creating enrollments
SELECT 
    ce.id,
    ce.enrolled_at,
    ce.payment_status,
    ce.payment_id,
    ce.payment_amount,
    c.title
FROM public.course_enrollments ce
LEFT JOIN public.courses c ON c.id = ce.course_id
WHERE ce.enrolled_at > NOW() - INTERVAL '7 days'
ORDER BY ce.enrolled_at DESC;

-- 6. Check if there are courses available
SELECT 
    COUNT(*) as total_courses,
    COUNT(CASE WHEN status = 'PUBLISHED' THEN 1 END) as published_courses,
    COUNT(CASE WHEN price = 0 OR price IS NULL THEN 1 END) as free_courses
FROM public.courses;

-- 7. List available courses you could enroll in
SELECT 
    id,
    title,
    price,
    status,
    category
FROM public.courses
WHERE status = 'PUBLISHED'
ORDER BY created_at DESC
LIMIT 10;

