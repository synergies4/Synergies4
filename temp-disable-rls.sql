-- Temporary: Disable RLS for testing (NOT for production)
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;

-- Also add the missing user insert policy
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id); 