-- Fixed Database Setup for Synergies4AI
-- This avoids sequence permission issues

-- Create meeting_transcripts table first (referenced by meeting_bots)
CREATE TABLE IF NOT EXISTS meeting_transcripts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,
  summary TEXT,
  key_points TEXT[],
  action_items TEXT[],
  participants TEXT[],
  duration INTEGER, -- in minutes
  meeting_date TIMESTAMP WITH TIME ZONE,
  platform VARCHAR(50),
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for transcripts
CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_user_id ON meeting_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_created_at ON meeting_transcripts(created_at DESC);

-- RLS for transcripts
ALTER TABLE meeting_transcripts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own transcripts" ON meeting_transcripts;
CREATE POLICY "Users can access their own transcripts" ON meeting_transcripts
  FOR ALL USING (auth.uid() = user_id);
GRANT ALL ON meeting_transcripts TO authenticated;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);

-- RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own subscriptions" ON subscriptions;
CREATE POLICY "Users can access their own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);
GRANT ALL ON subscriptions TO authenticated;

-- Create user_content_settings table
CREATE TABLE IF NOT EXISTS user_content_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_conversations INTEGER DEFAULT 10,
  current_conversations INTEGER DEFAULT 0,
  max_documents INTEGER DEFAULT 5,
  current_documents INTEGER DEFAULT 0,
  max_projects INTEGER DEFAULT 3,
  current_projects INTEGER DEFAULT 0,
  ai_calls_per_day INTEGER DEFAULT 50,
  ai_calls_today INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for user content settings
CREATE INDEX IF NOT EXISTS idx_user_content_settings_user_id ON user_content_settings(user_id);

-- RLS for user content settings
ALTER TABLE user_content_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own content settings" ON user_content_settings;
CREATE POLICY "Users can access their own content settings" ON user_content_settings
  FOR ALL USING (auth.uid() = user_id);
GRANT ALL ON user_content_settings TO authenticated;

-- Create user_onboarding table
CREATE TABLE IF NOT EXISTS user_onboarding (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  job_title VARCHAR(255),
  company VARCHAR(255),
  industry VARCHAR(255),
  years_experience INTEGER,
  team_size INTEGER,
  primary_role VARCHAR(255),
  secondary_roles TEXT[],
  management_level VARCHAR(100),
  biggest_challenges TEXT[],
  primary_goals TEXT[],
  pain_points TEXT[],
  success_metrics TEXT[],
  company_size VARCHAR(100),
  work_environment VARCHAR(100),
  team_structure VARCHAR(100),
  technology_stack TEXT[],
  learning_style VARCHAR(100),
  preferred_content_types TEXT[],
  time_availability VARCHAR(100),
  coaching_style VARCHAR(100),
  communication_tone VARCHAR(100),
  feedback_frequency VARCHAR(100),
  focus_areas TEXT[],
  skill_levels JSONB DEFAULT '{}',
  completed_steps TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for onboarding
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_completed ON user_onboarding(onboarding_completed);

-- RLS for onboarding
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own onboarding" ON user_onboarding;
CREATE POLICY "Users can access their own onboarding" ON user_onboarding
  FOR ALL USING (auth.uid() = user_id);
GRANT ALL ON user_onboarding TO authenticated;

-- Create user_coaching_sessions table
CREATE TABLE IF NOT EXISTS user_coaching_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type VARCHAR(100) NOT NULL,
  topic VARCHAR(255),
  messages JSONB NOT NULL DEFAULT '[]',
  insights TEXT[],
  action_items TEXT[],
  follow_up_date TIMESTAMP WITH TIME ZONE,
  session_rating INTEGER CHECK (session_rating BETWEEN 1 AND 5),
  feedback TEXT,
  duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for coaching sessions
CREATE INDEX IF NOT EXISTS idx_user_coaching_sessions_user_id ON user_coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coaching_sessions_type ON user_coaching_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_user_coaching_sessions_created_at ON user_coaching_sessions(created_at DESC);

-- RLS for coaching sessions
ALTER TABLE user_coaching_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own coaching sessions" ON user_coaching_sessions;
CREATE POLICY "Users can access their own coaching sessions" ON user_coaching_sessions
  FOR ALL USING (auth.uid() = user_id);
GRANT ALL ON user_coaching_sessions TO authenticated;

-- Create user_learning_progress table
CREATE TABLE IF NOT EXISTS user_learning_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_area VARCHAR(255) NOT NULL,
  current_level VARCHAR(50),
  target_level VARCHAR(50),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  strengths TEXT[],
  improvement_areas TEXT[],
  milestones JSONB DEFAULT '[]',
  last_assessment_date TIMESTAMP WITH TIME ZONE,
  next_review_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_area)
);

-- Create indexes for learning progress
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user_id ON user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_skill ON user_learning_progress(skill_area);

-- RLS for learning progress
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own learning progress" ON user_learning_progress;
CREATE POLICY "Users can access their own learning progress" ON user_learning_progress
  FOR ALL USING (auth.uid() = user_id);
GRANT ALL ON user_learning_progress TO authenticated;

-- Meeting Bots Table for tracking recording sessions
CREATE TABLE IF NOT EXISTS meeting_bots (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_id VARCHAR(255) UNIQUE NOT NULL, -- Recall.ai bot ID
  meeting_url TEXT NOT NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('zoom', 'google-meet', 'teams', 'unknown')),
  bot_name VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'joining', 'recording', 'stopping', 'completed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  recording_started_at TIMESTAMP WITH TIME ZONE,
  stopped_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Recording data
  transcript_url TEXT,
  transcript_text TEXT,
  transcript_ready BOOLEAN DEFAULT FALSE,
  recording_url TEXT,
  recording_ready BOOLEAN DEFAULT FALSE,
  
  -- References
  transcript_id INTEGER REFERENCES meeting_transcripts(id),
  
  -- Metadata
  recall_data JSONB, -- Raw data from Recall.ai
  error_message TEXT,
  
  -- Indexes
  CONSTRAINT unique_user_bot UNIQUE (user_id, bot_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meeting_bots_user_id ON meeting_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_bots_bot_id ON meeting_bots(bot_id);
CREATE INDEX IF NOT EXISTS idx_meeting_bots_status ON meeting_bots(status);
CREATE INDEX IF NOT EXISTS idx_meeting_bots_platform ON meeting_bots(platform);
CREATE INDEX IF NOT EXISTS idx_meeting_bots_created_at ON meeting_bots(created_at DESC);

-- RLS Policies
ALTER TABLE meeting_bots ENABLE ROW LEVEL SECURITY;

-- Users can only access their own meeting bots
DROP POLICY IF EXISTS "Users can access their own meeting bots" ON meeting_bots;
CREATE POLICY "Users can access their own meeting bots" ON meeting_bots
  FOR ALL USING (auth.uid() = user_id);

-- Users can insert their own meeting bots
DROP POLICY IF EXISTS "Users can create meeting bots" ON meeting_bots;
CREATE POLICY "Users can create meeting bots" ON meeting_bots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON meeting_bots TO authenticated;

-- Function to automatically create user settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_content_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at timestamps automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns (safe approach)
DO $$
BEGIN
  -- Drop triggers if they exist, then create them
  DROP TRIGGER IF EXISTS update_meeting_transcripts_updated_at ON meeting_transcripts;
  CREATE TRIGGER update_meeting_transcripts_updated_at
    BEFORE UPDATE ON meeting_transcripts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
  CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_user_content_settings_updated_at ON user_content_settings;
  CREATE TRIGGER update_user_content_settings_updated_at
    BEFORE UPDATE ON user_content_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_user_onboarding_updated_at ON user_onboarding;
  CREATE TRIGGER update_user_onboarding_updated_at
    BEFORE UPDATE ON user_onboarding
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_user_coaching_sessions_updated_at ON user_coaching_sessions;
  CREATE TRIGGER update_user_coaching_sessions_updated_at
    BEFORE UPDATE ON user_coaching_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_user_learning_progress_updated_at ON user_learning_progress;
  CREATE TRIGGER update_user_learning_progress_updated_at
    BEFORE UPDATE ON user_learning_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  -- Create user signup trigger (safe approach)
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END $$; 