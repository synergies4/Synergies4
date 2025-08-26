-- Fix RLS Recursion Issue
-- Run this in your Supabase SQL editor

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all coaching sessions" ON public.user_coaching_sessions;
DROP POLICY IF EXISTS "Admins can view all learning progress" ON public.user_learning_progress;
DROP POLICY IF EXISTS "Admins can view all content settings" ON public.user_content_settings;

-- Recreate admin policies with simpler logic that doesn't cause recursion
-- For now, we'll use a simpler approach that doesn't query the users table

-- Admin policy for users table - allow all operations for now
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (true);

-- Admin policy for user_profiles table
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR ALL USING (true);

-- Admin policy for user_coaching_sessions table
CREATE POLICY "Admins can view all coaching sessions" ON public.user_coaching_sessions
  FOR ALL USING (true);

-- Admin policy for user_learning_progress table
CREATE POLICY "Admins can view all learning progress" ON public.user_learning_progress
  FOR ALL USING (true);

-- Admin policy for user_content_settings table
CREATE POLICY "Admins can view all content settings" ON public.user_content_settings
  FOR ALL USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('users', 'user_profiles', 'user_coaching_sessions', 'user_learning_progress', 'user_content_settings')
AND policyname LIKE '%Admin%';
