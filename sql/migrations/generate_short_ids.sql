
-- Create the short ID generator function with STABLE volatility
CREATE OR REPLACE FUNCTION generate_short_id(table_name text)
RETURNS text AS $$
/*
Returns a short ID with table-specific prefix.
Example: acct_123abc for users table
*/
DECLARE
  prefix text;
  uuid_val uuid := gen_random_uuid(); -- VOLATILE function
  short_suffix text;
BEGIN
  -- Define table prefixes
  CASE table_name
    -- Users and Authentication
    WHEN 'users' THEN prefix := 'acct_';
    WHEN 'user_profiles' THEN prefix := 'prof_';
    WHEN 'user_coaching_sessions' THEN prefix := 'sess_';
    WHEN 'user_learning_progress' THEN prefix := 'prog_';
    WHEN 'user_content_settings' THEN prefix := 'sett_';
    WHEN 'user_presentations' THEN prefix := 'pres_';
    WHEN 'user_conversations' THEN prefix := 'conv_';
    WHEN 'user_content_access' THEN prefix := 'acc_';
    WHEN 'user_onboarding' THEN prefix := 'onbrd_';
    
    -- Courses and Learning
    WHEN 'courses' THEN prefix := 'crs_';
    WHEN 'course_modules' THEN prefix := 'mod_';
    WHEN 'lessons' THEN prefix := 'lesn_';
    WHEN 'enrollments' THEN prefix := 'enrl_';
    WHEN 'course_enrollments' THEN prefix := 'enrl_';
    
    -- Blog and Content
    WHEN 'blog_posts' THEN prefix := 'blog_';
    WHEN 'blog_categories' THEN prefix := 'cat_';
    
    -- Subscriptions and Payments
    WHEN 'subscriptions' THEN prefix := 'sub_';
    WHEN 'stripe_customers' THEN prefix := 'stripe_cust_';
    WHEN 'stripe_subscriptions' THEN prefix := 'stripe_sub_';
    
    -- Meetings and Transcripts
    WHEN 'meeting_transcripts' THEN prefix := 'trans_';
    WHEN 'meeting_bots' THEN prefix := 'bot_';
    
    -- Resume and Customization
    WHEN 'resume_customizer' THEN prefix := 'resume_';
    WHEN 'resume_storage' THEN prefix := 'resume_stor_';
    
    -- ROI Engine
    WHEN 'roi_calculations' THEN prefix := 'roi_';
    WHEN 'roi_projects' THEN prefix := 'roi_proj_';
    
    -- Default case
    ELSE prefix := SUBSTRING(table_name FROM 1 FOR 4) || '_';
  END CASE;
  
  -- Extract last 25 characters of the UUID (removing hyphens)
  short_suffix := REPLACE(SUBSTRING(uuid_val::text FROM 10), '-', '');
  RETURN prefix || short_suffix;
END;
$$ LANGUAGE plpgsql VOLATILE; -- ✅ Correct volatility
