-- User Content Storage Schema for Synergize AI
-- This schema handles presentations and conversations for paid subscribers

-- User presentations table
CREATE TABLE IF NOT EXISTS public.user_presentations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Stores presentation slides, structure, etc.
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  presentation_type TEXT DEFAULT 'standard', -- standard, ai-generated, template
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User conversations table (AI chat history)
CREATE TABLE IF NOT EXISTS public.user_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  conversation_data JSONB NOT NULL, -- Stores messages, context, AI responses
  conversation_type TEXT DEFAULT 'general', -- general, course-related, presentation-help
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  is_archived BOOLEAN DEFAULT false,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User content access log (for analytics)
CREATE TABLE IF NOT EXISTS public.user_content_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'presentation', 'conversation'
  content_id UUID NOT NULL,
  access_type TEXT NOT NULL, -- 'view', 'edit', 'create', 'delete'
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_duration INTEGER, -- in seconds
  device_info JSONB
);

-- User content settings (preferences, limits)
CREATE TABLE IF NOT EXISTS public.user_content_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  max_presentations INTEGER DEFAULT 5, -- Based on subscription plan
  max_conversations INTEGER DEFAULT 10, -- Based on subscription plan
  auto_save_enabled BOOLEAN DEFAULT true,
  presentation_templates JSONB DEFAULT '[]'::jsonb,
  ai_assistant_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_presentations_user_id ON public.user_presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presentations_created_at ON public.user_presentations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_presentations_tags ON public.user_presentations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_presentations_type ON public.user_presentations(presentation_type);

CREATE INDEX IF NOT EXISTS idx_user_conversations_user_id ON public.user_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_conversations_created_at ON public.user_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_conversations_type ON public.user_conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_user_conversations_course_id ON public.user_conversations(course_id);
CREATE INDEX IF NOT EXISTS idx_user_conversations_archived ON public.user_conversations(is_archived);

CREATE INDEX IF NOT EXISTS idx_user_content_access_user_id ON public.user_content_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_access_content ON public.user_content_access(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_user_content_access_date ON public.user_content_access(accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_content_settings_user_id ON public.user_content_settings(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_presentations
CREATE POLICY "Users can view own presentations" 
  ON public.user_presentations FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage own presentations" 
  ON public.user_presentations FOR ALL 
  USING (auth.uid() = user_id);

-- RLS Policies for user_conversations
CREATE POLICY "Users can manage own conversations" 
  ON public.user_conversations FOR ALL 
  USING (auth.uid() = user_id);

-- RLS Policies for user_content_access
CREATE POLICY "Users can view own content access logs" 
  ON public.user_content_access FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own content access logs" 
  ON public.user_content_access FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_content_settings
CREATE POLICY "Users can manage own content settings" 
  ON public.user_content_settings FOR ALL 
  USING (auth.uid() = user_id);

-- Admin policies for all tables
CREATE POLICY "Admins can view all user presentations" 
  ON public.user_presentations FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can view all user conversations" 
  ON public.user_conversations FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can view all content access logs" 
  ON public.user_content_access FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can view all content settings" 
  ON public.user_content_settings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_user_presentations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_content_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER user_presentations_updated_at
  BEFORE UPDATE ON public.user_presentations
  FOR EACH ROW EXECUTE FUNCTION update_user_presentations_updated_at();

CREATE TRIGGER user_conversations_updated_at
  BEFORE UPDATE ON public.user_conversations
  FOR EACH ROW EXECUTE FUNCTION update_user_conversations_updated_at();

CREATE TRIGGER user_content_settings_updated_at
  BEFORE UPDATE ON public.user_content_settings
  FOR EACH ROW EXECUTE FUNCTION update_user_content_settings_updated_at();

-- Function to set user content limits based on subscription plan
CREATE OR REPLACE FUNCTION set_user_content_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Get user's current subscription plan
  DECLARE
    user_plan TEXT;
  BEGIN
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
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set limits
CREATE TRIGGER set_content_limits_on_insert
  BEFORE INSERT ON public.user_content_settings
  FOR EACH ROW EXECUTE FUNCTION set_user_content_limits();

-- Function to initialize user content settings when a user subscribes
CREATE OR REPLACE FUNCTION initialize_user_content_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_content_settings (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO UPDATE SET
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize settings when subscription is created
CREATE TRIGGER initialize_content_settings_on_subscription
  AFTER INSERT ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION initialize_user_content_settings(); 