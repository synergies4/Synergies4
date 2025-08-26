-- Course Functions for Synergies4AI
-- This file contains all course-related database functions, triggers, and business logic

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_course_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = current_epoch();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update ranking_date_only when ranking_date changes
CREATE OR REPLACE FUNCTION update_ranking_date_only()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ranking_date_only = NEW.ranking_date::DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COURSE MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to create a new course
CREATE OR REPLACE FUNCTION create_course(
    p_title TEXT,
    p_description TEXT,
    p_category TEXT,
    p_short_desc TEXT DEFAULT NULL,
    p_image TEXT DEFAULT NULL,
    p_price DECIMAL(10,2) DEFAULT 0,
    p_level course_level DEFAULT 'BEGINNER',
    p_duration TEXT DEFAULT '4 weeks',
    p_instructor_id TEXT DEFAULT NULL,
    p_prerequisites TEXT[] DEFAULT NULL,
    p_learning_objectives TEXT[] DEFAULT NULL,
    p_target_audience TEXT[] DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_course_id TEXT;
BEGIN
    INSERT INTO public.courses (
        title, description, short_desc, image, price, category, level, duration,
        instructor_id, prerequisites, learning_objectives, target_audience, tags
    ) VALUES (
        p_title, p_description, p_short_desc, p_image, p_price, p_category, p_level, p_duration,
        p_instructor_id, p_prerequisites, p_learning_objectives, p_target_audience, p_tags
    ) RETURNING id INTO v_course_id;
    
    RETURN v_course_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update course enrollment count
CREATE OR REPLACE FUNCTION update_course_enrollment_count(p_course_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.courses 
    SET enrollment_count = (
        SELECT COUNT(*) 
        FROM public.enrollments 
        WHERE course_id = p_course_id AND status = 'ACTIVE'
    )
    WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update course completion rate
CREATE OR REPLACE FUNCTION update_course_completion_rate(p_course_id TEXT)
RETURNS VOID AS $$
DECLARE
    v_total_enrollments INTEGER;
    v_completed_enrollments INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_enrollments
    FROM public.enrollments 
    WHERE course_id = p_course_id AND status = 'ACTIVE';
    
    SELECT COUNT(*) INTO v_completed_enrollments
    FROM public.enrollments 
    WHERE course_id = p_course_id AND status = 'COMPLETED';
    
    UPDATE public.courses 
    SET completion_rate = CASE 
        WHEN v_total_enrollments > 0 THEN (v_completed_enrollments::DECIMAL / v_total_enrollments) * 100
        ELSE 0
    END
    WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update course average rating
CREATE OR REPLACE FUNCTION update_course_rating(p_course_id TEXT)
RETURNS VOID AS $$
DECLARE
    v_avg_rating DECIMAL(3,2);
    v_rating_count INTEGER;
BEGIN
    -- This would need to be updated when you add a course_reviews table
    -- For now, this is a placeholder
    SELECT 0, 0 INTO v_avg_rating, v_rating_count;
    
    UPDATE public.courses 
    SET average_rating = v_avg_rating,
        rating_count = v_rating_count
    WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ENROLLMENT MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to enroll a user in a course
CREATE OR REPLACE FUNCTION enroll_user_in_course(
    p_user_id TEXT,
    p_course_id TEXT,
    p_payment_status payment_status DEFAULT 'PENDING',
    p_payment_amount DECIMAL(10,2) DEFAULT NULL,
    p_payment_id TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_enrollment_id TEXT;
    v_course_exists BOOLEAN;
BEGIN
    -- Check if course exists
    SELECT EXISTS(SELECT 1 FROM public.courses WHERE id = p_course_id) INTO v_course_exists;
    IF NOT v_course_exists THEN
        RAISE EXCEPTION 'Course not found';
    END IF;
    
    -- Check if user is already enrolled
    IF EXISTS(SELECT 1 FROM public.course_enrollments WHERE user_id = p_user_id AND course_id = p_course_id) THEN
        RAISE EXCEPTION 'User is already enrolled in this course';
    END IF;
    
    -- Create enrollment
    INSERT INTO public.course_enrollments (
        user_id, course_id, payment_status, payment_amount, payment_id
    ) VALUES (
        p_user_id, p_course_id, p_payment_status, p_payment_amount, p_payment_id
    ) RETURNING id INTO v_enrollment_id;
    
    -- Also create entry in simplified enrollments table
    INSERT INTO public.enrollments (
        user_id, course_id, status
    ) VALUES (
        p_user_id, p_course_id, 'ACTIVE'
    );
    
    -- Update course enrollment count
    PERFORM update_course_enrollment_count(p_course_id);
    
    RETURN v_enrollment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to complete a course enrollment
CREATE OR REPLACE FUNCTION complete_course_enrollment(
    p_user_id TEXT,
    p_course_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_enrollment_id TEXT;
    v_certificate_number TEXT;
BEGIN
    -- Get enrollment
    SELECT id INTO v_enrollment_id
    FROM public.course_enrollments 
    WHERE user_id = p_user_id AND course_id = p_course_id AND status = 'ACTIVE';
    
    IF v_enrollment_id IS NULL THEN
        RAISE EXCEPTION 'Active enrollment not found';
    END IF;
    
    -- Update enrollment status
    UPDATE public.course_enrollments 
    SET status = 'COMPLETED', 
        completed_at = NOW(),
        progress_percentage = 100
    WHERE id = v_enrollment_id;
    
    -- Update simplified enrollment
    UPDATE public.enrollments 
    SET status = 'COMPLETED', 
        completed_at = NOW(),
        progress = 100
    WHERE user_id = p_user_id AND course_id = p_course_id;
    
    -- Generate certificate
    v_certificate_number := 'CERT-' || p_course_id || '-' || p_user_id || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    
    INSERT INTO public.course_certificates (
        user_id, course_id, enrollment_id, certificate_number
    ) VALUES (
        p_user_id, p_course_id, v_enrollment_id, v_certificate_number
    );
    
    -- Update course completion rate
    PERFORM update_course_completion_rate(p_course_id);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to update lesson progress
CREATE OR REPLACE FUNCTION update_lesson_progress(
    p_user_id TEXT,
    p_lesson_id TEXT,
    p_status lesson_status,
    p_time_spent_minutes INTEGER DEFAULT 0,
    p_progress_percentage INTEGER DEFAULT 0
)
RETURNS TEXT AS $$
DECLARE
    v_enrollment_id TEXT;
    v_progress_id TEXT;
BEGIN
    -- Get the user's enrollment for this lesson's course
    SELECT ce.id INTO v_enrollment_id
    FROM public.course_enrollments ce
    JOIN public.lessons l ON l.module_id IN (
        SELECT cm.id FROM public.course_modules cm WHERE cm.course_id = ce.course_id
    )
    WHERE ce.user_id = p_user_id AND l.id = p_lesson_id AND ce.status = 'ACTIVE';
    
    IF v_enrollment_id IS NULL THEN
        RAISE EXCEPTION 'Active enrollment not found for this lesson';
    END IF;
    
    -- Insert or update lesson progress
    INSERT INTO public.lesson_progress (
        user_id, lesson_id, enrollment_id, status, time_spent_minutes, progress_percentage,
        started_at, completed_at
    ) VALUES (
        p_user_id, p_lesson_id, v_enrollment_id, p_status, p_time_spent_minutes, p_progress_percentage,
        CASE WHEN p_status != 'NOT_STARTED' THEN NOW() ELSE NULL END,
        CASE WHEN p_status = 'COMPLETED' THEN NOW() ELSE NULL END
    )
    ON CONFLICT (user_id, lesson_id) 
    DO UPDATE SET
        status = EXCLUDED.status,
        time_spent_minutes = lesson_progress.time_spent_minutes + EXCLUDED.time_spent_minutes,
        progress_percentage = EXCLUDED.progress_percentage,
        started_at = CASE WHEN lesson_progress.started_at IS NULL AND EXCLUDED.status != 'NOT_STARTED' 
                          THEN NOW() ELSE lesson_progress.started_at END,
        completed_at = CASE WHEN EXCLUDED.status = 'COMPLETED' THEN NOW() ELSE lesson_progress.completed_at END,
        updated_at = current_epoch()
    RETURNING id INTO v_progress_id;
    
    -- Update overall course progress
    PERFORM update_course_progress(p_user_id, v_enrollment_id);
    
    RETURN v_progress_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update overall course progress
CREATE OR REPLACE FUNCTION update_course_progress(
    p_user_id TEXT,
    p_enrollment_id TEXT
)
RETURNS VOID AS $$
DECLARE
    v_course_id TEXT;
    v_total_lessons INTEGER;
    v_completed_lessons INTEGER;
    v_progress_percentage INTEGER;
BEGIN
    -- Get course ID
    SELECT course_id INTO v_course_id
    FROM public.course_enrollments 
    WHERE id = p_enrollment_id;
    
    -- Count total lessons in course
    SELECT COUNT(*) INTO v_total_lessons
    FROM public.lessons l
    JOIN public.course_modules cm ON l.module_id = cm.id
    WHERE cm.course_id = v_course_id;
    
    -- Count completed lessons
    SELECT COUNT(*) INTO v_completed_lessons
    FROM public.lesson_progress lp
    JOIN public.lessons l ON lp.lesson_id = l.id
    JOIN public.course_modules cm ON l.module_id = cm.id
    WHERE lp.user_id = p_user_id 
      AND cm.course_id = v_course_id 
      AND lp.status = 'COMPLETED';
    
    -- Calculate progress percentage
    v_progress_percentage := CASE 
        WHEN v_total_lessons > 0 THEN (v_completed_lessons * 100) / v_total_lessons
        ELSE 0
    END;
    
    -- Update enrollment progress
    UPDATE public.course_enrollments 
    SET progress_percentage = v_progress_percentage,
        updated_at = current_epoch()
    WHERE id = p_enrollment_id;
    
    -- Update simplified enrollment
    UPDATE public.enrollments 
    SET progress = v_progress_percentage,
        updated_at = current_epoch()
    WHERE user_id = p_user_id AND course_id = v_course_id;
    
    -- Auto-complete course if all lessons are done
    IF v_progress_percentage = 100 THEN
        PERFORM complete_course_enrollment(p_user_id, v_course_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- QUIZ MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to start a quiz attempt
CREATE OR REPLACE FUNCTION start_quiz_attempt(
    p_user_id TEXT,
    p_course_id TEXT,
    p_quiz_id TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_enrollment_id TEXT;
    v_attempt_id TEXT;
    v_total_points INTEGER;
BEGIN
    -- Get active enrollment
    SELECT id INTO v_enrollment_id
    FROM public.course_enrollments 
    WHERE user_id = p_user_id AND course_id = p_course_id AND status = 'ACTIVE';
    
    IF v_enrollment_id IS NULL THEN
        RAISE EXCEPTION 'Active enrollment not found';
    END IF;
    
    -- Calculate total points for the quiz
    SELECT COALESCE(SUM(points), 0) INTO v_total_points
    FROM public.quiz_questions 
    WHERE course_id = p_course_id;
    
    -- Create quiz attempt
    INSERT INTO public.quiz_attempts (
        user_id, course_id, enrollment_id, quiz_id, total_points, status
    ) VALUES (
        p_user_id, p_course_id, v_enrollment_id, p_quiz_id, v_total_points, 'IN_PROGRESS'
    ) RETURNING id INTO v_attempt_id;
    
    RETURN v_attempt_id;
END;
$$ LANGUAGE plpgsql;

-- Function to submit a quiz answer
CREATE OR REPLACE FUNCTION submit_quiz_answer(
    p_attempt_id TEXT,
    p_question_id TEXT,
    p_user_answer TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_correct_answer TEXT;
    v_points INTEGER;
    v_is_correct BOOLEAN;
BEGIN
    -- Get correct answer and points
    SELECT correct_answer, points INTO v_correct_answer, v_points
    FROM public.quiz_questions 
    WHERE id = p_question_id;
    
    -- Check if answer is correct
    v_is_correct := (p_user_answer = v_correct_answer);
    
    -- Insert or update answer
    INSERT INTO public.quiz_answers (
        attempt_id, question_id, user_answer, is_correct, points_earned
    ) VALUES (
        p_attempt_id, p_question_id, p_user_answer, v_is_correct, 
        CASE WHEN v_is_correct THEN v_points ELSE 0 END
    )
    ON CONFLICT (attempt_id, question_id) 
    DO UPDATE SET
        user_answer = EXCLUDED.user_answer,
        is_correct = EXCLUDED.is_correct,
        points_earned = EXCLUDED.points_earned,
        answered_at = NOW();
    
    RETURN v_is_correct;
END;
$$ LANGUAGE plpgsql;

-- Function to complete a quiz attempt
CREATE OR REPLACE FUNCTION complete_quiz_attempt(p_attempt_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_score INTEGER;
    v_total_points INTEGER;
    v_percentage DECIMAL(5,2);
    v_passed BOOLEAN;
    v_result JSONB;
BEGIN
    -- Calculate score
    SELECT 
        COALESCE(SUM(qa.points_earned), 0),
        qa.total_points
    INTO v_score, v_total_points
    FROM public.quiz_attempts qa
    LEFT JOIN public.quiz_answers qans ON qa.id = qans.attempt_id
    WHERE qa.id = p_attempt_id
    GROUP BY qa.id, qa.total_points;
    
    -- Calculate percentage
    v_percentage := CASE 
        WHEN v_total_points > 0 THEN (v_score::DECIMAL / v_total_points) * 100
        ELSE 0
    END;
    
    -- Determine if passed (assuming 70% is passing)
    v_passed := (v_percentage >= 70);
    
    -- Update attempt
    UPDATE public.quiz_attempts 
    SET score = v_score,
        percentage = v_percentage,
        status = CASE WHEN v_passed THEN 'COMPLETED' ELSE 'FAILED' END,
        completed_at = NOW()
    WHERE id = p_attempt_id;
    
    -- Return result
    v_result := jsonb_build_object(
        'score', v_score,
        'total_points', v_total_points,
        'percentage', v_percentage,
        'passed', v_passed,
        'status', CASE WHEN v_passed THEN 'COMPLETED' ELSE 'FAILED' END
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROI CALCULATION FUNCTIONS
-- ============================================================================

-- Function to calculate course ROI for a user
CREATE OR REPLACE FUNCTION calculate_course_roi(
    p_user_id TEXT,
    p_course_id TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_profile JSONB;
    v_course_data JSONB;
    v_roi_result JSONB;
    v_calculation_id TEXT;
BEGIN
    -- Get user profile data
    SELECT to_jsonb(up.*) INTO v_user_profile
    FROM public.user_profiles up
    WHERE up.user_id = p_user_id;
    
    -- Get course data
    SELECT to_jsonb(c.*) INTO v_course_data
    FROM public.courses c
    WHERE c.id = p_course_id;
    
    -- This is a simplified ROI calculation
    -- In a real implementation, you would use AI/ML models here
    v_roi_result := jsonb_build_object(
        'fit_score', 85, -- Placeholder
        'confidence_score', 78, -- Placeholder
        'salary_increase_year_1', 500000, -- $5,000 in cents
        'salary_increase_year_3', 1500000, -- $15,000 in cents
        'salary_increase_year_5', 3000000, -- $30,000 in cents
        'roi_percentage_year_1', 250, -- 250% ROI
        'roi_percentage_year_3', 750, -- 750% ROI
        'roi_percentage_year_5', 1500, -- 1500% ROI
        'timeline_to_impact', '3-6 months',
        'personalized_benefits', ARRAY['Career advancement', 'Skill development', 'Higher salary'],
        'key_skills_gained', ARRAY['Leadership', 'Communication', 'Strategic thinking'],
        'career_paths_enabled', ARRAY['Management', 'Consulting', 'Entrepreneurship']
    );
    
    -- Store calculation
    INSERT INTO public.course_roi_calculations (
        user_id, course_id, fit_score, confidence_score,
        salary_increase_year_1, salary_increase_year_3, salary_increase_year_5,
        roi_percentage_year_1, roi_percentage_year_3, roi_percentage_year_5,
        timeline_to_impact, personalized_benefits, key_skills_gained, career_paths_enabled
    ) VALUES (
        p_user_id, p_course_id,
        (v_roi_result->>'fit_score')::INTEGER,
        (v_roi_result->>'confidence_score')::INTEGER,
        (v_roi_result->>'salary_increase_year_1')::INTEGER,
        (v_roi_result->>'salary_increase_year_3')::INTEGER,
        (v_roi_result->>'salary_increase_year_5')::INTEGER,
        (v_roi_result->>'roi_percentage_year_1')::INTEGER,
        (v_roi_result->>'roi_percentage_year_3')::INTEGER,
        (v_roi_result->>'roi_percentage_year_5')::INTEGER,
        v_roi_result->>'timeline_to_impact',
        ARRAY(SELECT jsonb_array_elements_text(v_roi_result->'personalized_benefits')),
        ARRAY(SELECT jsonb_array_elements_text(v_roi_result->'key_skills_gained')),
        ARRAY(SELECT jsonb_array_elements_text(v_roi_result->'career_paths_enabled'))
    ) RETURNING id INTO v_calculation_id;
    
    -- Add calculation ID to result
    v_roi_result := v_roi_result || jsonb_build_object('calculation_id', v_calculation_id);
    
    RETURN v_roi_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ANALYTICS AND REPORTING FUNCTIONS
-- ============================================================================

-- Function to get course analytics
CREATE OR REPLACE FUNCTION get_course_analytics(p_course_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT jsonb_build_object(
        'course_id', p_course_id,
        'total_enrollments', (
            SELECT COUNT(*) FROM public.enrollments WHERE course_id = p_course_id
        ),
        'active_enrollments', (
            SELECT COUNT(*) FROM public.enrollments WHERE course_id = p_course_id AND status = 'ACTIVE'
        ),
        'completed_enrollments', (
            SELECT COUNT(*) FROM public.enrollments WHERE course_id = p_course_id AND status = 'COMPLETED'
        ),
        'completion_rate', (
            SELECT completion_rate FROM public.courses WHERE id = p_course_id
        ),
        'average_progress', (
            SELECT AVG(progress) FROM public.enrollments WHERE course_id = p_course_id AND status = 'ACTIVE'
        ),
        'average_rating', (
            SELECT average_rating FROM public.courses WHERE id = p_course_id
        ),
        'total_lessons', (
            SELECT COUNT(*) FROM public.lessons l
            JOIN public.course_modules cm ON l.module_id = cm.id
            WHERE cm.course_id = p_course_id
        ),
        'total_modules', (
            SELECT COUNT(*) FROM public.course_modules WHERE course_id = p_course_id
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql;

-- Function to get user learning analytics
CREATE OR REPLACE FUNCTION get_user_learning_analytics(p_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT jsonb_build_object(
        'user_id', p_user_id,
        'total_enrollments', (
            SELECT COUNT(*) FROM public.enrollments WHERE user_id = p_user_id
        ),
        'active_enrollments', (
            SELECT COUNT(*) FROM public.enrollments WHERE user_id = p_user_id AND status = 'ACTIVE'
        ),
        'completed_courses', (
            SELECT COUNT(*) FROM public.enrollments WHERE user_id = p_user_id AND status = 'COMPLETED'
        ),
        'average_progress', (
            SELECT AVG(progress) FROM public.enrollments WHERE user_id = p_user_id AND status = 'ACTIVE'
        ),
        'total_time_spent', (
            SELECT COALESCE(SUM(time_spent_minutes), 0) FROM public.lesson_progress WHERE user_id = p_user_id
        ),
        'certificates_earned', (
            SELECT COUNT(*) FROM public.course_certificates WHERE user_id = p_user_id
        ),
        'quiz_attempts', (
            SELECT COUNT(*) FROM public.quiz_attempts WHERE user_id = p_user_id
        ),
        'average_quiz_score', (
            SELECT AVG(percentage) FROM public.quiz_attempts WHERE user_id = p_user_id AND status = 'COMPLETED'
        )
    ) INTO v_analytics;
    
    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Create triggers for updated_at columns
CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON public.courses 
    FOR EACH ROW EXECUTE FUNCTION update_course_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at 
    BEFORE UPDATE ON public.course_modules 
    FOR EACH ROW EXECUTE FUNCTION update_course_updated_at_column();

CREATE TRIGGER update_lessons_updated_at 
    BEFORE UPDATE ON public.lessons 
    FOR EACH ROW EXECUTE FUNCTION update_course_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at 
    BEFORE UPDATE ON public.enrollments 
    FOR EACH ROW EXECUTE FUNCTION update_course_updated_at_column();

CREATE TRIGGER update_course_enrollments_updated_at 
    BEFORE UPDATE ON public.course_enrollments 
    FOR EACH ROW EXECUTE FUNCTION update_course_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at 
    BEFORE UPDATE ON public.lesson_progress 
    FOR EACH ROW EXECUTE FUNCTION update_course_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at 
    BEFORE UPDATE ON public.quiz_questions 
    FOR EACH ROW EXECUTE FUNCTION update_course_updated_at_column();

CREATE TRIGGER update_quiz_attempts_updated_at 
    BEFORE UPDATE ON public.quiz_attempts 
    FOR EACH ROW EXECUTE FUNCTION update_course_updated_at_column();

CREATE TRIGGER update_course_roi_calculations_updated_at 
    BEFORE UPDATE ON public.course_roi_calculations 
    FOR EACH ROW EXECUTE FUNCTION update_course_updated_at_column();

CREATE TRIGGER update_enhanced_course_metadata_updated_at 
    BEFORE UPDATE ON public.enhanced_course_metadata 
    FOR EACH ROW EXECUTE FUNCTION update_course_updated_at_column();

-- Trigger to update ranking_date_only when ranking_date changes
CREATE TRIGGER update_ranking_date_only_trigger
    BEFORE INSERT OR UPDATE ON public.user_course_rankings
    FOR EACH ROW EXECUTE FUNCTION update_ranking_date_only();

-- ============================================================================
-- RLS POLICIES AND PERMISSIONS
-- ============================================================================

-- Enable Row Level Security on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Courses are publicly readable" ON public.courses;
DROP POLICY IF EXISTS "Admins can create courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can view all courses" ON public.courses;

-- Create a simple policy that allows reading published courses
CREATE POLICY "Courses are publicly readable" ON public.courses 
  FOR SELECT USING (status = 'PUBLISHED');

-- Create policy for admins to manage all courses
CREATE POLICY "Admins can manage all courses" ON public.courses 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Grant permissions
GRANT ALL ON public.courses TO authenticated;

-- ============================================================================
-- SAMPLE DATA CREATION
-- ============================================================================

-- Insert sample courses for testing
INSERT INTO public.courses (
  id,
  title,
  description,
  short_desc,
  image,
  price,
  category,
  level,
  duration,
  status,
  featured,
  created_at,
  updated_at
) VALUES 
(
  'course_leadership_101',
  'Leadership Fundamentals',
  'Master the essential skills needed to become an effective leader. This comprehensive course covers communication, decision-making, team building, and strategic thinking.',
  'Essential leadership skills for modern professionals',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop&auto=format',
  99.99,
  'leadership',
  'BEGINNER',
  '6 weeks',
  'PUBLISHED',
  true,
  current_epoch(),
  current_epoch()
),
(
  'course_agile_mastery',
  'Agile Project Management',
  'Learn the principles and practices of Agile methodology. From Scrum to Kanban, master the frameworks that drive successful project delivery.',
  'Master Agile methodologies and frameworks',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&auto=format',
  149.99,
  'agile',
  'INTERMEDIATE',
  '8 weeks',
  'PUBLISHED',
  true,
  current_epoch(),
  current_epoch()
),
(
  'course_product_strategy',
  'Product Strategy & Development',
  'Develop winning product strategies and learn the complete product development lifecycle from ideation to launch.',
  'Strategic product development and management',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&auto=format',
  199.99,
  'product',
  'ADVANCED',
  '10 weeks',
  'PUBLISHED',
  false,
  current_epoch(),
  current_epoch()
),
(
  'course_tech_leadership',
  'Technical Leadership',
  'Bridge the gap between technical expertise and leadership skills. Learn to lead technical teams and drive innovation.',
  'Lead technical teams and drive innovation',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop&auto=format',
  179.99,
  'technology',
  'INTERMEDIATE',
  '7 weeks',
  'PUBLISHED',
  true,
  current_epoch(),
  current_epoch()
),
(
  'course_wellness_workplace',
  'Workplace Wellness & Productivity',
  'Create a healthy, productive work environment. Learn strategies for stress management, work-life balance, and team well-being.',
  'Build healthy and productive work environments',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&auto=format',
  79.99,
  'wellness',
  'BEGINNER',
  '4 weeks',
  'PUBLISHED',
  false,
  current_epoch(),
  current_epoch()
),
(
  'course_communication_skills',
  'Advanced Communication Skills',
  'Master the art of effective communication in professional settings. From presentations to difficult conversations.',
  'Master professional communication techniques',
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop&auto=format',
  89.99,
  'leadership',
  'INTERMEDIATE',
  '5 weeks',
  'DRAFT',
  false,
  current_epoch(),
  current_epoch()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  short_desc = EXCLUDED.short_desc,
  image = EXCLUDED.image,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  duration = EXCLUDED.duration,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  updated_at = current_epoch();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to update all course instructor IDs to a specific user
CREATE OR REPLACE FUNCTION update_all_course_instructors(p_instructor_id TEXT DEFAULT 'acct_34bc473baed09048c7138454')
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    -- Update all courses to use the specified instructor
    UPDATE public.courses 
    SET instructor_id = p_instructor_id,
        updated_at = current_epoch()
    WHERE instructor_id IS NULL OR instructor_id != p_instructor_id;
    
    -- Get the count of updated rows
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    -- Log the update
    RAISE NOTICE 'Updated % courses with instructor ID: %', v_updated_count, p_instructor_id;
    
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to verify instructor assignments
CREATE OR REPLACE FUNCTION verify_course_instructors(p_instructor_id TEXT DEFAULT 'acct_34bc473baed09048c7138454')
RETURNS TABLE(
    course_id TEXT,
    course_title TEXT,
    instructor_id TEXT,
    instructor_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as course_id,
        c.title as course_title,
        c.instructor_id,
        u.name as instructor_name
    FROM public.courses c
    LEFT JOIN public.users u ON c.instructor_id = u.id
    WHERE c.instructor_id = p_instructor_id
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'courses';

-- Check if there are any published courses
SELECT COUNT(*) as published_courses_count FROM public.courses WHERE status = 'PUBLISHED';

-- Verify the courses were created
SELECT 
  id,
  title,
  category,
  level,
  status,
  featured,
  price
FROM public.courses 
ORDER BY created_at DESC;

-- Count published courses
SELECT 
  COUNT(*) as total_courses,
  COUNT(CASE WHEN status = 'PUBLISHED' THEN 1 END) as published_courses,
  COUNT(CASE WHEN featured = true THEN 1 END) as featured_courses
FROM public.courses;
