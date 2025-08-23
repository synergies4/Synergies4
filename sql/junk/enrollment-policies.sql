-- Row Level Security Policies for Enrollment System

-- Course Enrollments Policies
CREATE POLICY "Users can view their own enrollments" ON public.course_enrollments FOR SELECT USING (
    auth.uid() = user_id
);

CREATE POLICY "Users can create their own enrollments" ON public.course_enrollments FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Users can update their own enrollments" ON public.course_enrollments FOR UPDATE USING (
    auth.uid() = user_id
);

CREATE POLICY "Admins can view all enrollments" ON public.course_enrollments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'ADMIN'
    )
);

CREATE POLICY "Admins can update all enrollments" ON public.course_enrollments FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'ADMIN'
    )
);

-- Lesson Progress Policies
CREATE POLICY "Users can view their own lesson progress" ON public.lesson_progress FOR SELECT USING (
    auth.uid() = user_id
);

CREATE POLICY "Users can create their own lesson progress" ON public.lesson_progress FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Users can update their own lesson progress" ON public.lesson_progress FOR UPDATE USING (
    auth.uid() = user_id
);

CREATE POLICY "Admins can view all lesson progress" ON public.lesson_progress FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'ADMIN'
    )
);

-- Quiz Questions Policies
CREATE POLICY "Users can view quiz questions for enrolled courses" ON public.quiz_questions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.course_enrollments 
        WHERE course_enrollments.course_id = quiz_questions.course_id 
        AND course_enrollments.user_id = auth.uid()
        AND course_enrollments.status = 'ACTIVE'
    )
);

CREATE POLICY "Admins can manage all quiz questions" ON public.quiz_questions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'ADMIN'
    )
);

-- Quiz Attempts Policies
CREATE POLICY "Users can view their own quiz attempts" ON public.quiz_attempts FOR SELECT USING (
    auth.uid() = user_id
);

CREATE POLICY "Users can create their own quiz attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Users can update their own quiz attempts" ON public.quiz_attempts FOR UPDATE USING (
    auth.uid() = user_id
);

CREATE POLICY "Admins can view all quiz attempts" ON public.quiz_attempts FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'ADMIN'
    )
);

-- Quiz Answers Policies
CREATE POLICY "Users can view their own quiz answers" ON public.quiz_answers FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.quiz_attempts 
        WHERE quiz_attempts.id = quiz_answers.attempt_id 
        AND quiz_attempts.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create their own quiz answers" ON public.quiz_answers FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.quiz_attempts 
        WHERE quiz_attempts.id = quiz_answers.attempt_id 
        AND quiz_attempts.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all quiz answers" ON public.quiz_answers FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'ADMIN'
    )
);

-- Course Certificates Policies
CREATE POLICY "Users can view their own certificates" ON public.course_certificates FOR SELECT USING (
    auth.uid() = user_id
);

CREATE POLICY "Admins can manage all certificates" ON public.course_certificates FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'ADMIN'
    )
);

-- Public can view certificates by certificate number (for verification)
CREATE POLICY "Public can view certificates by number" ON public.course_certificates FOR SELECT USING (
    certificate_number IS NOT NULL
); 