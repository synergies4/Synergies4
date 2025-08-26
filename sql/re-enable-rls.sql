-- Re-enable RLS on users table after testing
-- Run this after you're done testing to restore security

-- Re-enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on user_coaching_sessions table
ALTER TABLE public.user_coaching_sessions ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on user_learning_progress table
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on user_content_settings table
ALTER TABLE public.user_content_settings ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_profiles', 'user_coaching_sessions', 'user_learning_progress', 'user_content_settings');
