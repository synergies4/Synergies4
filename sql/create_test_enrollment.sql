-- Create Test Enrollment
-- This script helps you create a test enrollment to verify the system works

-- Instructions:
-- 1. Replace 'YOUR_USER_AUTH_ID' with your actual auth user ID from auth.users
-- 2. Replace 'YOUR_COURSE_ID' with an actual course ID from courses table
-- 3. Run this script to create a test enrollment

-- To find your user auth ID, run:
-- SELECT id, email FROM auth.users LIMIT 5;

-- To find a course ID, run:
-- SELECT id, title, price FROM public.courses LIMIT 5;

-- Example: Create a test enrollment
INSERT INTO public.course_enrollments (
    user_id,
    course_id,
    status,
    payment_status,
    payment_amount,
    enrolled_at,
    progress_percentage
)
VALUES (
    'YOUR_USER_AUTH_ID',  -- Replace with actual auth user ID
    'YOUR_COURSE_ID',     -- Replace with actual course ID
    'ACTIVE',
    'PAID',
    0,  -- Set to actual price or 0 for free
    NOW(),
    0
)
RETURNING *;

-- After creating, verify it appears:
SELECT 
    ce.*,
    u.email,
    c.title as course_title
FROM public.course_enrollments ce
LEFT JOIN public.users u ON u.auth_user_id = ce.user_id
LEFT JOIN public.courses c ON c.id = ce.course_id
WHERE ce.user_id = 'YOUR_USER_AUTH_ID';

