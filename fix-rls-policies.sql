-- Fix RLS policies for course creation and management

-- Add missing policies for users table
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Add missing policies for courses table
CREATE POLICY "Admins can create courses" ON public.courses FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can update courses" ON public.courses FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can view all courses" ON public.courses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

-- Add missing policies for course_modules table
CREATE POLICY "Admins can create course modules" ON public.course_modules FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can update course modules" ON public.course_modules FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can view all course modules" ON public.course_modules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

-- Add missing policies for lessons table
CREATE POLICY "Admins can create lessons" ON public.lessons FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can update lessons" ON public.lessons FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can view all lessons" ON public.lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
); 