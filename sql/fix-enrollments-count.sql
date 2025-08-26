-- Fix get_user_enrollments_count function
-- Run this in your Supabase SQL editor

-- Drop and recreate the function to fix the type mismatch issue
DROP FUNCTION IF EXISTS get_user_enrollments_count(UUID);

CREATE OR REPLACE FUNCTION get_user_enrollments_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  enrollment_count INTEGER := 0;
  user_text_id TEXT;
BEGIN
  -- First, get the user's TEXT ID from the users table
  SELECT u.id INTO user_text_id
  FROM public.users u
  WHERE u.auth_user_id = user_uuid;
  
  IF user_text_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Only query the enrollments table (which we know exists)
  -- This avoids the type mismatch issue
  SELECT COUNT(*) INTO enrollment_count
  FROM public.enrollments
  WHERE user_id = user_text_id AND status = 'ACTIVE';
  
  RETURN COALESCE(enrollment_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_enrollments_count(UUID) TO authenticated;

-- Test the function
SELECT get_user_enrollments_count('4a25b2a3-15ae-4c7e-832e-6e2444e33366'::UUID) as test_count;
