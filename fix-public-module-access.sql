-- Add public read access for course modules and lessons
-- This allows the public course pages to display curriculum information

-- Public read access for course modules (for published courses only)
CREATE POLICY "Public can view course modules for published courses" ON public.course_modules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_modules.course_id 
    AND courses.status = 'PUBLISHED'
  )
);

-- Public read access for lessons (for modules of published courses only)
CREATE POLICY "Public can view lessons for published courses" ON public.lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.course_modules 
    JOIN public.courses ON courses.id = course_modules.course_id
    WHERE course_modules.id = lessons.module_id 
    AND courses.status = 'PUBLISHED'
  )
);

-- Note: Admin policies from fix-module-policies.sql should also be applied for full functionality 