-- Fix for enrollment policy conflict
-- Run this in your Supabase SQL Editor

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;

-- Recreate the policy
CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = enrollments.user_id AND auth_user_id = auth.uid()
    )
  );

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'enrollments' AND policyname = 'Users can view own enrollments';
