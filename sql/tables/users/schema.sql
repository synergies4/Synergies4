-- User Schema for Synergies4AI
-- This file contains only table definitions, enums, and indexes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums for user data (with IF NOT EXISTS checks)
DO $$ 
BEGIN
    -- Create user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'INSTRUCTOR');
    END IF;
    
    -- Create management_level enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'management_level') THEN
        CREATE TYPE management_level AS ENUM ('individual_contributor', 'team_lead', 'manager', 'director', 'vp', 'c_level');
    END IF;
    
    -- Create company_size enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_size') THEN
        CREATE TYPE company_size AS ENUM ('startup_1_10', 'small_11_50', 'medium_51_200', 'large_201_1000', 'enterprise_1000+');
    END IF;
    
    -- Create work_environment enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_environment') THEN
        CREATE TYPE work_environment AS ENUM ('remote', 'hybrid', 'in_office');
    END IF;
    
    -- Create team_structure enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_structure') THEN
        CREATE TYPE team_structure AS ENUM ('agile_scrum', 'agile_kanban', 'waterfall', 'hybrid', 'no_structure', 'other');
    END IF;
    
    -- Create learning_style enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_style') THEN
        CREATE TYPE learning_style AS ENUM ('visual', 'auditory', 'kinesthetic', 'reading_writing', 'mixed');
    END IF;
    
    -- Create time_availability enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'time_availability') THEN
        CREATE TYPE time_availability AS ENUM ('15_min_daily', '30_min_daily', '1_hour_daily', 'weekends_only', 'flexible');
    END IF;
    
    -- Create coaching_style enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coaching_style') THEN
        CREATE TYPE coaching_style AS ENUM ('direct', 'supportive', 'analytical', 'creative', 'balanced');
    END IF;
    
    -- Create communication_tone enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'communication_tone') THEN
        CREATE TYPE communication_tone AS ENUM ('formal', 'casual', 'friendly', 'professional', 'adaptive');
    END IF;
    
    -- Create feedback_frequency enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_frequency') THEN
        CREATE TYPE feedback_frequency AS ENUM ('immediate', 'daily', 'weekly', 'on_demand');
    END IF;
    
    -- Create skill_level enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_level') THEN
        CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
    END IF;
END $$;

-- ============================================================================
-- MAIN USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT DEFAULT generate_short_id('users') PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role user_role DEFAULT 'USER',
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch()
);

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT DEFAULT generate_short_id('user_profiles') PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Basic Information
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  
  -- Professional Information
  job_title TEXT,
  company TEXT,
  industry TEXT,
  years_experience INTEGER,
  team_size INTEGER,
  
  -- Resume Storage
  resume_filename VARCHAR(500),
  resume_content TEXT, -- Extracted text content from resume
  resume_file_url TEXT, -- URL to stored resume file
  resume_uploaded_at TIMESTAMP WITH TIME ZONE,
  resume_file_size INTEGER,
  resume_file_type VARCHAR(50),
  
  -- Role and Responsibilities
  primary_role VARCHAR(100) CHECK (primary_role IN (
    'developer', 'product_manager', 'scrum_master', 'designer', 'qa_engineer', 
    'tech_lead', 'engineering_manager', 'cto', 'founder', 'consultant', 'other'
  )),
  secondary_roles TEXT[], -- Array of additional roles
  management_level management_level,
  
  -- Current Challenges and Goals
  biggest_challenges TEXT[], -- Array of challenges they're facing
  primary_goals TEXT[], -- What they want to achieve
  pain_points TEXT[], -- Specific pain points
  success_metrics TEXT[], -- How they measure success
  
  -- Work Environment and Context
  company_size company_size,
  work_environment work_environment,
  team_structure team_structure,
  technology_stack TEXT[], -- Technologies they work with
  
  -- Learning Preferences
  learning_style learning_style,
  preferred_content_types TEXT[], -- videos, articles, hands-on, case_studies, etc.
  time_availability time_availability,
  notification_preferences JSONB DEFAULT '{}',
  
  -- AI Coach Preferences
  coaching_style coaching_style,
  communication_tone communication_tone,
  feedback_frequency feedback_frequency,
  
  -- Specific Areas of Interest
  focus_areas TEXT[], -- leadership, technical_skills, communication, etc.
  skill_levels JSONB DEFAULT '{}', -- {"agile": "beginner", "leadership": "intermediate"}
  
  -- Personalization Data
  timezone VARCHAR(100),
  locale VARCHAR(10) DEFAULT 'en-US',
  
  -- Social Links
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  
  -- Onboarding Progress
  completed_steps TEXT[] DEFAULT '{}', -- Track which onboarding steps are done
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- AI Learning Data
  interaction_patterns JSONB DEFAULT '{}', -- Track how user interacts with AI
  preferred_examples JSONB DEFAULT '{}', -- Types of examples that resonate
  conversation_history_summary JSONB DEFAULT '{}', -- Summary of past conversations for context
  
  -- Timestamps
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch()
);

-- ============================================================================
-- USER COACHING SESSIONS TABLE | ONE TO MANY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_coaching_sessions (
  id TEXT DEFAULT generate_short_id('user_coaching_sessions') PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_type VARCHAR(50) CHECK (session_type IN (
    'pocket_coach', 'onboarding', 'goal_setting', 'problem_solving', 'skill_development'
  )),
  
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
  created_at BIGINT DEFAULT current_epoch()
);

-- ============================================================================
-- USER LEARNING PROGRESS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_learning_progress (
  id TEXT DEFAULT generate_short_id('user_learning_progress') PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Skill Tracking
  skill_area VARCHAR(100) NOT NULL,
  current_level skill_level,
  target_level skill_level,
  
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
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch(),
  
  -- Unique constraint
  UNIQUE(user_id, skill_area)
);

-- ============================================================================
-- USER CONTENT SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_content_settings (
  id TEXT DEFAULT generate_short_id('user_content_settings') PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  max_presentations INTEGER DEFAULT 5, -- Based on subscription plan
  max_conversations INTEGER DEFAULT 10, -- Based on subscription plan
  auto_save_enabled BOOLEAN DEFAULT true,
  presentation_templates JSONB DEFAULT '[]'::jsonb,
  ai_assistant_preferences JSONB DEFAULT '{}'::jsonb,
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed ON public.user_profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company ON public.user_profiles(company);
CREATE INDEX IF NOT EXISTS idx_user_profiles_industry ON public.user_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_user_profiles_primary_role ON public.user_profiles(primary_role);

-- User coaching sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_coaching_sessions_user_id ON public.user_coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coaching_sessions_type ON public.user_coaching_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_user_coaching_sessions_status ON public.user_coaching_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_user_coaching_sessions_created_at ON public.user_coaching_sessions(created_at DESC);

-- User learning progress indexes
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user_id ON public.user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_skill ON public.user_learning_progress(skill_area);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_level ON public.user_learning_progress(current_level);

-- User content settings indexes
CREATE INDEX IF NOT EXISTS idx_user_content_settings_user_id ON public.user_content_settings(user_id);

