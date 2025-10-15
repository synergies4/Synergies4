-- Fix Course Enrollments user_id Type Mismatch
-- Problem: user_id is TEXT but auth.users.id is UUID

-- Step 1: Drop existing foreign key constraint if it exists
ALTER TABLE public.course_enrollments 
DROP CONSTRAINT IF EXISTS course_enrollments_user_id_fkey;

-- Step 2: Check if there's any data in the table
SELECT COUNT(*) as enrollment_count FROM public.course_enrollments;

-- Step 3: Delete any invalid data (if table has data with non-UUID values)
-- Skip this if table is empty
DELETE FROM public.course_enrollments 
WHERE user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 4: Convert user_id column from TEXT to UUID
ALTER TABLE public.course_enrollments 
ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

-- Step 5: Add the correct foreign key constraint
ALTER TABLE public.course_enrollments
ADD CONSTRAINT course_enrollments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Step 6: Verify the change
SELECT 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'course_enrollments' 
AND column_name = 'user_id';

-- Step 7: Verify foreign key constraint
SELECT 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'course_enrollments'
AND kcu.column_name = 'user_id';

-- Success! Now the webhook should work
SELECT 'Foreign key constraint fixed! user_id is now UUID type.' as status;

