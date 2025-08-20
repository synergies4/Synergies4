-- Add missing RLS policies for course_modules and lessons

-- Course modules policies
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

-- Lessons policies
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