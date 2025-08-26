-- Fix public access to courses for GET requests
-- Run this in your Supabase SQL editor

-- Drop existing policies that might be blocking access
DROP POLICY IF EXISTS "Courses are publicly readable" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage all courses" ON public.courses;

-- Create a policy that allows public read access to published courses
CREATE POLICY "Courses are publicly readable" ON public.courses 
  FOR SELECT USING (status = 'PUBLISHED');

-- Create a policy that allows admins to manage all courses
CREATE POLICY "Admins can manage all courses" ON public.courses 
  FOR ALL USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'courses';

-- Test if we can access published courses
SELECT COUNT(*) as published_courses_count FROM public.courses WHERE status = 'PUBLISHED';

-- Show some sample courses
SELECT id, title, category, level, status, featured FROM public.courses WHERE status = 'PUBLISHED' LIMIT 5;
