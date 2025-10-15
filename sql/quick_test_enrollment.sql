-- Quick Test: Create an enrollment for testing
-- This simulates what happens when a user enrolls in a free course

-- STEP 1: Get your auth user ID and a course ID
-- Run these queries first:

-- Find your user ID:
SELECT id as auth_user_id, email FROM auth.users WHERE email LIKE '%YOUR_EMAIL%' LIMIT 5;

-- Find a course to enroll in:
SELECT id as course_id, title, price FROM public.courses WHERE status = 'PUBLISHED' LIMIT 5;

-- STEP 2: After getting the IDs above, replace them below and run this:

-- Create test enrollment
INSERT INTO public.course_enrollments (
    user_id,
    course_id,
    status,
    payment_status,
    payment_amount,
    enrolled_at,
    progress_percentage,
    updated_at
)
VALUES (
    'PASTE_YOUR_AUTH_USER_ID_HERE',  -- From step 1
    'PASTE_COURSE_ID_HERE',           -- From step 1
    'ACTIVE',
    'PAID',
    0,
    NOW(),
    0,
    NOW()
)
RETURNING 
    id,
    user_id,
    course_id,
    status,
    payment_status;

-- STEP 3: Verify it was created
SELECT 
    ce.id,
    ce.status,
    ce.payment_status,
    u.email,
    c.title as course_title
FROM public.course_enrollments ce
LEFT JOIN public.users u ON u.auth_user_id::text = ce.user_id
LEFT JOIN public.courses c ON c.id = ce.course_id
WHERE ce.user_id = 'PASTE_YOUR_AUTH_USER_ID_HERE'
ORDER BY ce.enrolled_at DESC;

-- STEP 4: Now refresh /courses/my in your browser - you should see the enrollment!

