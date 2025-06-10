-- User Onboarding and Personalization Schema
CREATE TABLE IF NOT EXISTS user_onboarding (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name VARCHAR(255),
  job_title VARCHAR(255),
  company VARCHAR(255),
  industry VARCHAR(255),
  years_experience INTEGER,
  team_size INTEGER,
  
  -- Role and Responsibilities
  primary_role VARCHAR(100) CHECK (primary_role IN ('developer', 'product_manager', 'scrum_master', 'designer', 'qa_engineer', 'tech_lead', 'engineering_manager', 'cto', 'founder', 'consultant', 'other')),
  secondary_roles TEXT[], -- Array of additional roles
  management_level VARCHAR(50) CHECK (management_level IN ('individual_contributor', 'team_lead', 'manager', 'director', 'vp', 'c_level')),
  
  -- Current Challenges and Goals
  biggest_challenges TEXT[], -- Array of challenges they're facing
  primary_goals TEXT[], -- What they want to achieve
  pain_points TEXT[], -- Specific pain points
  success_metrics TEXT[], -- How they measure success
  
  -- Work Environment and Context
  company_size VARCHAR(50) CHECK (company_size IN ('startup_1_10', 'small_11_50', 'medium_51_200', 'large_201_1000', 'enterprise_1000+')),
  work_environment VARCHAR(50) CHECK (work_environment IN ('remote', 'hybrid', 'in_office')),
  team_structure VARCHAR(50) CHECK (team_structure IN ('agile_scrum', 'agile_kanban', 'waterfall', 'hybrid', 'no_structure', 'other')),
  technology_stack TEXT[], -- Technologies they work with
  
  -- Learning Preferences
  learning_style VARCHAR(50) CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading_writing', 'mixed')),
  preferred_content_types TEXT[], -- videos, articles, hands-on, case_studies, etc.
  time_availability VARCHAR(50) CHECK (time_availability IN ('15_min_daily', '30_min_daily', '1_hour_daily', 'weekends_only', 'flexible')),
  notification_preferences JSONB DEFAULT '{}',
  
  -- AI Coach Preferences
  coaching_style VARCHAR(50) CHECK (coaching_style IN ('direct', 'supportive', 'analytical', 'creative', 'balanced')),
  communication_tone VARCHAR(50) CHECK (communication_tone IN ('formal', 'casual', 'friendly', 'professional', 'adaptive')),
  feedback_frequency VARCHAR(50) CHECK (feedback_frequency IN ('immediate', 'daily', 'weekly', 'on_demand')),
  
  -- Specific Areas of Interest
  focus_areas TEXT[], -- leadership, technical_skills, communication, etc.
  skill_levels JSONB DEFAULT '{}', -- {"agile": "beginner", "leadership": "intermediate"}
  
  -- Personalization Data
  timezone VARCHAR(100),
  locale VARCHAR(10) DEFAULT 'en-US',
  avatar_url TEXT,
  
  -- Onboarding Progress
  completed_steps TEXT[] DEFAULT '{}', -- Track which onboarding steps are done
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- AI Learning Data
  interaction_patterns JSONB DEFAULT '{}', -- Track how user interacts with AI
  preferred_examples JSONB DEFAULT '{}', -- Types of examples that resonate
  conversation_history_summary JSONB DEFAULT '{}', -- Summary of past conversations for context
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Coaching Sessions Table
CREATE TABLE IF NOT EXISTS user_coaching_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type VARCHAR(50) CHECK (session_type IN ('pocket_coach', 'onboarding', 'goal_setting', 'problem_solving', 'skill_development')),
  
  -- Session Context
  context_data JSONB DEFAULT '{}', -- Current situation, mood, specific challenge
  session_goal TEXT,
  
  -- Conversation Data
  messages JSONB DEFAULT '[]', -- Array of conversation messages
  session_summary TEXT,
  key_insights TEXT[],
  action_items TEXT[],
  
  -- Outcomes
  user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
  session_rating INTEGER CHECK (session_rating BETWEEN 1 AND 5),
  follow_up_needed BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  
  -- Session Metadata
  duration_minutes INTEGER,
  session_status VARCHAR(50) DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'abandoned')),
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Learning Progress Table
CREATE TABLE IF NOT EXISTS user_learning_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Skill Tracking
  skill_area VARCHAR(100) NOT NULL,
  current_level VARCHAR(50) CHECK (current_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  target_level VARCHAR(50) CHECK (target_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  
  -- Progress Metrics
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  time_invested_minutes INTEGER DEFAULT 0,
  practice_sessions INTEGER DEFAULT 0,
  
  -- Learning Resources Used
  resources_completed TEXT[],
  preferred_resources TEXT[],
  
  -- Assessment Data
  last_assessment_score INTEGER,
  assessment_history JSONB DEFAULT '[]',
  
  -- Goals and Milestones
  personal_goals TEXT[],
  milestones_achieved TEXT[],
  next_milestone TEXT,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  target_completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id, skill_area)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_completed ON user_onboarding(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_user_coaching_sessions_user_id ON user_coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coaching_sessions_type ON user_coaching_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_user_coaching_sessions_status ON user_coaching_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user_id ON user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_skill ON user_learning_progress(skill_area);

-- RLS Policies
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can access their own onboarding data" ON user_onboarding
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own coaching sessions" ON user_coaching_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own learning progress" ON user_learning_progress
  FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON user_onboarding TO authenticated;
GRANT ALL ON user_coaching_sessions TO authenticated;
GRANT ALL ON user_learning_progress TO authenticated;

GRANT USAGE ON SEQUENCE user_onboarding_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE user_coaching_sessions_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE user_learning_progress_id_seq TO authenticated;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_onboarding_updated_at BEFORE UPDATE ON user_onboarding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_learning_progress_updated_at BEFORE UPDATE ON user_learning_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 