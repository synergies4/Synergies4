-- User Functions and Helper Logic for Synergies4AI
-- This file contains ALL user-related database setup including:
-- - RLS policies (with conflict resolution)
-- - RPC functions (for API access)
-- - Triggers and automation
-- - Utility functions
-- - Permissions and security
--
-- Run this file once to set up the complete user system.
-- It handles existing policies gracefully and creates all necessary functions.

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ============================================================================

-- Enable Row Level Security on all user tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Drop existing policies that might cause conflicts (for clean setup)
DROP POLICY IF EXISTS "Users can view own user data" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Users table policies
CREATE POLICY "Users can view own user data" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- User profiles policies
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

-- User coaching sessions policies
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

-- User learning progress policies
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

-- User content settings policies
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
-- RPC FUNCTIONS (Bypass RLS for API calls)
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

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_coaching_sessions TO authenticated;
GRANT ALL ON public.user_learning_progress TO authenticated;
GRANT ALL ON public.user_content_settings TO authenticated;

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp with epoch
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = current_epoch();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Test function to verify all dependencies are working
CREATE OR REPLACE FUNCTION test_user_functions()
RETURNS TEXT AS $$
DECLARE
  test_short_id TEXT;
  test_epoch BIGINT;
  result TEXT;
BEGIN
  -- Test generate_short_id
  BEGIN
    test_short_id := generate_short_id('users');
    result := 'generate_short_id: OK - ' || test_short_id;
  EXCEPTION
    WHEN OTHERS THEN
      result := 'generate_short_id: FAILED - ' || SQLERRM;
  END;
  
  -- Test current_epoch
  BEGIN
    test_epoch := current_epoch();
    result := result || ' | current_epoch: OK - ' || test_epoch;
  EXCEPTION
    WHEN OTHERS THEN
      result := result || ' | current_epoch: FAILED - ' || SQLERRM;
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_short_id TEXT;
  step_name TEXT;
BEGIN
  step_name := 'Starting function';
  RAISE LOG 'handle_new_user: % - User ID: %, Email: %', step_name, NEW.id, NEW.email;
  
  -- Generate short ID for the user (with fallback)
  step_name := 'Generating short ID';
  BEGIN
    user_short_id := generate_short_id('users');
  EXCEPTION
    WHEN OTHERS THEN
      -- Fallback: use a simple ID format if generate_short_id fails
      user_short_id := 'acct_' || SUBSTRING(NEW.id::text FROM 1 FOR 8) || '_' || EXTRACT(EPOCH FROM NOW())::bigint;
      RAISE LOG 'handle_new_user: generate_short_id failed, using fallback: %', user_short_id;
  END;
  RAISE LOG 'handle_new_user: % - Generated short ID: %', step_name, user_short_id;
  
  -- Insert into users table with the short ID
  step_name := 'Inserting into users table';
  INSERT INTO public.users (id, auth_user_id, email, name)
  VALUES (user_short_id, NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (auth_user_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = current_epoch();
  RAISE LOG 'handle_new_user: % - Success', step_name;
  
  -- Insert into user_profiles table using the short ID
  step_name := 'Inserting into user_profiles table';
  INSERT INTO public.user_profiles (user_id, full_name, email)
  VALUES (user_short_id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RAISE LOG 'handle_new_user: % - Success', step_name;
  
  -- Insert into user_content_settings table using the short ID
  step_name := 'Inserting into user_content_settings table';
  INSERT INTO public.user_content_settings (user_id)
  VALUES (user_short_id)
  ON CONFLICT (user_id) DO NOTHING;
  RAISE LOG 'handle_new_user: % - Success', step_name;
  
  RAISE LOG 'handle_new_user: All steps completed successfully';
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE LOG 'Error in handle_new_user at step "%": %', step_name, SQLERRM;
    RAISE LOG 'User data: id=%, email=%, name=%', NEW.id, NEW.email, NEW.raw_user_meta_data->>'name';
    RAISE LOG 'Generated short_id: %', user_short_id;
    RAISE LOG 'SQL State: %, Error Code: %', SQLSTATE, SQLERRM;
    -- Re-raise the error
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set user content limits based on subscription plan
CREATE OR REPLACE FUNCTION set_user_content_limits()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
BEGIN
  -- Get user's current subscription plan
  SELECT plan_id INTO user_plan
  FROM public.subscriptions
  WHERE user_id = NEW.user_id AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Set limits based on plan
  IF user_plan = 'enterprise' THEN
    NEW.max_presentations := 100;
    NEW.max_conversations := 500;
  ELSIF user_plan = 'professional' THEN
    NEW.max_presentations := 50;
    NEW.max_conversations := 200;
  ELSIF user_plan = 'starter' THEN
    NEW.max_presentations := 20;
    NEW.max_conversations := 50;
  ELSE
    -- Free tier or no subscription
    NEW.max_presentations := 5;
    NEW.max_conversations := 10;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Triggers for updated_at timestamps
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_learning_progress_updated_at 
  BEFORE UPDATE ON public.user_learning_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_content_settings_updated_at 
  BEFORE UPDATE ON public.user_content_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add a comment to help with debugging
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Automatically creates user records in public schema when a new user signs up';

-- Trigger to automatically set content limits
CREATE TRIGGER set_content_limits_on_insert
  BEFORE INSERT ON public.user_content_settings
  FOR EACH ROW EXECUTE FUNCTION set_user_content_limits();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get user's full profile with all related data
CREATE OR REPLACE FUNCTION get_user_full_profile(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user', u,
    'profile', up,
    'content_settings', ucs,
    'learning_progress', (
      SELECT jsonb_agg(ulp)
      FROM public.user_learning_progress ulp
      WHERE ulp.user_id = u.id
    ),
    'coaching_sessions', (
      SELECT jsonb_agg(ucs)
      FROM public.user_coaching_sessions ucs
      WHERE ucs.user_id = u.id
      ORDER BY ucs.created_at DESC
      LIMIT 10
    )
  ) INTO result
  FROM public.users u
  LEFT JOIN public.user_profiles up ON u.id = up.user_id
  LEFT JOIN public.user_content_settings ucs ON u.id = ucs.user_id
  WHERE u.auth_user_id = user_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has admin privileges
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = user_uuid AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's subscription limits
CREATE OR REPLACE FUNCTION get_user_content_limits(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(max_presentations INTEGER, max_conversations INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT ucs.max_presentations, ucs.max_conversations
  FROM public.user_content_settings ucs
  JOIN public.users u ON u.id = ucs.user_id
  WHERE u.auth_user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


