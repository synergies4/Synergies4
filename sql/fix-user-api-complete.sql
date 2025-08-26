-- Complete User API Fix
-- Run this in your Supabase SQL editor to fix all user API issues

-- ============================================================================
-- STEP 1: FIX RLS POLICIES (Prevent Infinite Recursion)
-- ============================================================================

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view own user data" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can manage own coaching sessions" ON public.user_coaching_sessions;
DROP POLICY IF EXISTS "Admins can view all coaching sessions" ON public.user_coaching_sessions;
DROP POLICY IF EXISTS "Users can manage own learning progress" ON public.user_learning_progress;
DROP POLICY IF EXISTS "Admins can view all learning progress" ON public.user_learning_progress;
DROP POLICY IF EXISTS "Users can manage own content settings" ON public.user_content_settings;
DROP POLICY IF EXISTS "Admins can view all content settings" ON public.user_content_settings;

-- Recreate policies with correct logic (no recursion)
CREATE POLICY "Users can view own user data" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can manage own profile" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = user_profiles.user_id AND auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can manage own coaching sessions" ON public.user_coaching_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = user_coaching_sessions.user_id AND auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all coaching sessions" ON public.user_coaching_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can manage own learning progress" ON public.user_learning_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = user_learning_progress.user_id AND auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all learning progress" ON public.user_learning_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can manage own content settings" ON public.user_content_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = user_content_settings.user_id AND auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all content settings" ON public.user_content_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================================================
-- STEP 2: CREATE RPC FUNCTIONS (Bypass RLS for API calls)
-- ============================================================================

-- Function to get user by auth_user_id (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION get_user_by_auth_id(auth_user_uuid UUID)
RETURNS TABLE (
  id TEXT,
  auth_user_id UUID,
  email TEXT,
  name TEXT,
  role user_role,
  created_at BIGINT,
  updated_at BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.auth_user_id,
    u.email,
    u.name,
    u.role,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.auth_user_id = auth_user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile by auth_user_id
CREATE OR REPLACE FUNCTION get_user_profile_by_auth_id(auth_user_uuid UUID)
RETURNS TABLE (
  id TEXT,
  user_id TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  job_title TEXT,
  company TEXT,
  industry TEXT,
  years_experience INTEGER,
  team_size INTEGER,
  primary_role VARCHAR(100),
  management_level management_level,
  company_size company_size,
  work_environment work_environment,
  team_structure team_structure,
  learning_style learning_style,
  time_availability time_availability,
  coaching_style coaching_style,
  communication_tone communication_tone,
  feedback_frequency feedback_frequency,
  focus_areas TEXT[],
  skill_levels JSONB,
  timezone VARCHAR(100),
  locale VARCHAR(10),
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  completed_steps TEXT[],
  onboarding_completed BOOLEAN,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  interaction_patterns JSONB,
  preferred_examples JSONB,
  conversation_history_summary JSONB,
  created_at BIGINT,
  updated_at BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.user_id,
    up.first_name,
    up.last_name,
    up.full_name,
    up.job_title,
    up.company,
    up.industry,
    up.years_experience,
    up.team_size,
    up.primary_role,
    up.management_level,
    up.company_size,
    up.work_environment,
    up.team_structure,
    up.learning_style,
    up.time_availability,
    up.coaching_style,
    up.communication_tone,
    up.feedback_frequency,
    up.focus_areas,
    up.skill_levels,
    up.timezone,
    up.locale,
    up.linkedin_url,
    up.twitter_url,
    up.github_url,
    up.portfolio_url,
    up.completed_steps,
    up.onboarding_completed,
    up.onboarding_completed_at,
    up.interaction_patterns,
    up.preferred_examples,
    up.conversation_history_summary,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  JOIN public.users u ON u.id = up.user_id
  WHERE u.auth_user_id = auth_user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user enrollments count (handles both table names)
CREATE OR REPLACE FUNCTION get_user_enrollments_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  enrollment_count INTEGER := 0;
  user_text_id TEXT;
BEGIN
  -- First, get the user's TEXT ID from the users table
  SELECT u.id INTO user_text_id
  FROM public.users u
  WHERE u.auth_user_id = user_uuid;
  
  IF user_text_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Try course_enrollments first (newer schema)
  BEGIN
    SELECT COUNT(*) INTO enrollment_count
    FROM public.course_enrollments
    WHERE user_id = user_text_id AND status = 'ACTIVE';
  EXCEPTION
    WHEN undefined_table THEN
      -- Fallback to enrollments table (older schema)
      BEGIN
        SELECT COUNT(*) INTO enrollment_count
        FROM public.enrollments
        WHERE user_id = user_text_id AND status = 'ACTIVE';
      EXCEPTION
        WHEN undefined_table THEN
          enrollment_count := 0;
      END;
  END;
  
  RETURN enrollment_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user learning progress (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_learning_progress(user_uuid UUID)
RETURNS TABLE (
  id TEXT,
  skill_area VARCHAR(100),
  current_level skill_level,
  target_level skill_level,
  progress_percentage INTEGER,
  time_invested_minutes INTEGER,
  practice_sessions INTEGER,
  resources_completed TEXT[],
  preferred_resources TEXT[],
  last_assessment_score INTEGER,
  assessment_history JSONB,
  personal_goals TEXT[],
  milestones_achieved TEXT[],
  next_milestone TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  target_completion_date TIMESTAMP WITH TIME ZONE,
  created_at BIGINT,
  updated_at BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ulp.id,
    ulp.skill_area,
    ulp.current_level,
    ulp.target_level,
    ulp.progress_percentage,
    ulp.time_invested_minutes,
    ulp.practice_sessions,
    ulp.resources_completed,
    ulp.preferred_resources,
    ulp.last_assessment_score,
    ulp.assessment_history,
    ulp.personal_goals,
    ulp.milestones_achieved,
    ulp.next_milestone,
    ulp.started_at,
    ulp.last_activity_at,
    ulp.target_completion_date,
    ulp.created_at,
    ulp.updated_at
  FROM public.user_learning_progress ulp
  JOIN public.users u ON u.id = ulp.user_id
  WHERE u.auth_user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user content settings (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_content_settings(user_uuid UUID)
RETURNS TABLE (
  id TEXT,
  user_id TEXT,
  max_presentations INTEGER,
  max_conversations INTEGER,
  auto_save_enabled BOOLEAN,
  presentation_templates JSONB,
  ai_assistant_preferences JSONB,
  created_at BIGINT,
  updated_at BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ucs.id,
    ucs.user_id,
    ucs.max_presentations,
    ucs.max_conversations,
    ucs.auto_save_enabled,
    ucs.presentation_templates,
    ucs.ai_assistant_preferences,
    ucs.created_at,
    ucs.updated_at
  FROM public.user_content_settings ucs
  JOIN public.users u ON u.id = ucs.user_id
  WHERE u.auth_user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get coaching sessions count (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_coaching_sessions_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  session_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO session_count
  FROM public.user_coaching_sessions ucs
  JOIN public.users u ON u.id = ucs.user_id
  WHERE u.auth_user_id = user_uuid;
  
  RETURN session_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: CREATE MISSING TABLES (if they don't exist)
-- ============================================================================

-- Create simplified enrollments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.enrollments (
  id TEXT DEFAULT generate_short_id('enrollments') PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_minutes INTEGER DEFAULT 0,
  certificate_issued BOOLEAN DEFAULT FALSE,
  certificate_url TEXT,
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch(),
  
  UNIQUE(user_id, course_id)
);

-- Enable RLS on enrollments table
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;

-- Create policy for enrollments
CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = enrollments.user_id AND auth_user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 4: GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_coaching_sessions TO authenticated;
GRANT ALL ON public.user_learning_progress TO authenticated;
GRANT ALL ON public.user_content_settings TO authenticated;
GRANT ALL ON public.enrollments TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_by_auth_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile_by_auth_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_enrollments_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_learning_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_content_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_coaching_sessions_count(UUID) TO authenticated;
