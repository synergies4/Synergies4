-- Course Schema for Synergies4AI
-- This file contains all course-related table definitions, enums, and indexes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums for course data (with IF NOT EXISTS checks)
DO $$ 
BEGIN
    -- Create course_level enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_level') THEN
        CREATE TYPE course_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
    END IF;
    
    -- Create course_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
        CREATE TYPE course_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
    END IF;
    
    -- Create enrollment_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
        CREATE TYPE enrollment_status AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
    END IF;
    
    -- Create lesson_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_status') THEN
        CREATE TYPE lesson_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
    END IF;
    
    -- Create quiz_question_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_question_type') THEN
        CREATE TYPE quiz_question_type AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');
    END IF;
    
    -- Create quiz_attempt_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_attempt_status') THEN
        CREATE TYPE quiz_attempt_status AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');
    END IF;
    
    -- Create payment_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
    END IF;
END $$;

-- ============================================================================
-- MAIN COURSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT DEFAULT generate_short_id('courses') PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_desc TEXT,
  image TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  category TEXT NOT NULL,
  level course_level DEFAULT 'BEGINNER',
  duration TEXT DEFAULT '4 weeks',
  status course_status DEFAULT 'DRAFT',
  featured BOOLEAN DEFAULT FALSE,
  instructor_id TEXT REFERENCES public.users(id),
  prerequisites TEXT[],
  learning_objectives TEXT[],
  target_audience TEXT[],
  tags TEXT[],
  difficulty_rating DECIMAL(3,2) CHECK (difficulty_rating >= 0 AND difficulty_rating <= 5),
  rating_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  enrollment_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch()
);

-- ============================================================================
-- COURSE MODULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_modules (
  id TEXT DEFAULT generate_short_id('course_modules') PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_num INTEGER NOT NULL,
  duration TEXT,
  video_url TEXT,
  content TEXT,
  resources TEXT[],
  learning_objectives TEXT[],
  is_required BOOLEAN DEFAULT TRUE,
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch(),
  
  UNIQUE(course_id, order_num)
);

-- ============================================================================
-- LESSONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT DEFAULT generate_short_id('lessons') PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  order_num INTEGER NOT NULL,
  duration TEXT,
  lesson_type VARCHAR(50) DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment', 'discussion')),
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  points INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT TRUE,
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch(),
  
  UNIQUE(module_id, order_num)
);

-- ============================================================================
-- ENROLLMENTS TABLE (Simplified version)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id TEXT DEFAULT generate_short_id('enrollments') PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status enrollment_status DEFAULT 'ACTIVE',
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

-- ============================================================================
-- COURSE ENROLLMENTS TABLE (Detailed version with payment info)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id TEXT DEFAULT generate_short_id('course_enrollments') PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status enrollment_status DEFAULT 'ACTIVE',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_issued BOOLEAN DEFAULT FALSE,
  payment_status payment_status DEFAULT 'PENDING',
  payment_amount DECIMAL(10,2),
  payment_id TEXT, -- Stripe payment intent ID
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch(),
  
  UNIQUE(user_id, course_id)
);

-- ============================================================================
-- LESSON PROGRESS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id TEXT DEFAULT generate_short_id('lesson_progress') PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  enrollment_id TEXT NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  status lesson_status DEFAULT 'NOT_STARTED',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch(),
  
  UNIQUE(user_id, lesson_id)
);

-- ============================================================================
-- QUIZ QUESTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id TEXT DEFAULT generate_short_id('quiz_questions') PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type quiz_question_type DEFAULT 'MULTIPLE_CHOICE',
  options JSONB, -- Array of options for multiple choice
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_num INTEGER DEFAULT 1,
  points INTEGER DEFAULT 1,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  tags TEXT[],
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch()
);

-- ============================================================================
-- QUIZ ATTEMPTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id TEXT DEFAULT generate_short_id('quiz_attempts') PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id TEXT NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  quiz_id TEXT, -- Reference to a specific quiz if applicable
  score INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  status quiz_attempt_status DEFAULT 'IN_PROGRESS',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken_minutes INTEGER DEFAULT 0,
  answers JSONB, -- Store user answers
  feedback TEXT,
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch()
);

-- ============================================================================
-- QUIZ ANSWERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id TEXT DEFAULT generate_short_id('quiz_answers') PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  points_earned INTEGER DEFAULT 0,
  time_taken_seconds INTEGER DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(attempt_id, question_id)
);

-- ============================================================================
-- COURSE CERTIFICATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_certificates (
  id TEXT DEFAULT generate_short_id('course_certificates') PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id TEXT NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certificate_url TEXT, -- URL to generated certificate PDF
  certificate_data JSONB, -- Store certificate details
  expires_at TIMESTAMP WITH TIME ZONE,
  is_valid BOOLEAN DEFAULT TRUE,
  created_at BIGINT DEFAULT current_epoch(),
  
  UNIQUE(user_id, course_id)
);

-- ============================================================================
-- COURSE ROI CALCULATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_roi_calculations (
  id TEXT DEFAULT generate_short_id('course_roi_calculations') PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  
  -- ROI Metrics
  fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Salary Projections (in cents to avoid decimal issues)
  salary_increase_year_1 INTEGER,
  salary_increase_year_3 INTEGER,
  salary_increase_year_5 INTEGER,
  salary_increase_lifetime INTEGER,
  
  -- ROI Percentages (as integers, divide by 100 for actual percentage)
  roi_percentage_year_1 INTEGER,
  roi_percentage_year_3 INTEGER,
  roi_percentage_year_5 INTEGER,
  roi_percentage_lifetime INTEGER,
  
  -- Timeline and Benefits
  timeline_to_impact VARCHAR(50),
  personalized_benefits TEXT[],
  key_skills_gained TEXT[],
  career_paths_enabled TEXT[],
  
  -- Calculation Metadata
  calculation_method VARCHAR(50) DEFAULT 'ai_ml_model',
  model_version VARCHAR(20) DEFAULT 'v1.0',
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Cache Management
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch(),
  
  UNIQUE(user_id, course_id)
);

-- ============================================================================
-- USER COURSE RANKINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_course_rankings (
  id TEXT DEFAULT generate_short_id('user_course_rankings') PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Ranking Data
  ranking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ranking_date_only DATE DEFAULT CURRENT_DATE,
  top_courses JSONB, -- Array of course IDs with scores
  ranking_methodology VARCHAR(50) DEFAULT 'roi_fit_score',
  
  -- Filters Applied
  filters_applied JSONB, -- Store filters used for this ranking
  budget_max INTEGER,
  time_constraint VARCHAR(20),
  skill_focus TEXT[],
  
  -- Metadata
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 days'),
  created_at BIGINT DEFAULT current_epoch(),
  
  UNIQUE(user_id, ranking_date_only)
);

-- ============================================================================
-- ENHANCED COURSE METADATA TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.enhanced_course_metadata (
  id TEXT DEFAULT generate_short_id('enhanced_course_metadata') PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE UNIQUE,
  
  -- AI-Generated Metadata
  ai_summary TEXT,
  key_concepts TEXT[],
  difficulty_analysis JSONB,
  prerequisites_analysis JSONB,
  target_audience_analysis JSONB,
  
  -- Market Data
  market_demand_score INTEGER CHECK (market_demand_score >= 0 AND market_demand_score <= 100),
  salary_impact_data JSONB,
  industry_relevance JSONB,
  
  -- Learning Analytics
  average_completion_time INTEGER, -- in days
  dropout_rate DECIMAL(5,2),
  satisfaction_score DECIMAL(3,2),
  
  -- SEO and Discovery
  search_keywords TEXT[],
  related_courses TEXT[],
  trending_score INTEGER DEFAULT 0,
  
  -- Content Quality Metrics
  content_quality_score INTEGER CHECK (content_quality_score >= 0 AND content_quality_score <= 100),
  video_quality_score INTEGER CHECK (video_quality_score >= 0 AND video_quality_score <= 100),
  engagement_metrics JSONB,
  
  created_at BIGINT DEFAULT current_epoch(),
  updated_at BIGINT DEFAULT current_epoch()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Courses table indexes
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON public.courses(featured);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON public.courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON public.courses(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_courses_enrollment_count ON public.courses(enrollment_count DESC);

-- Course modules indexes
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON public.course_modules(course_id, order_num);

-- Lessons indexes
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(module_id, order_num);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON public.lessons(lesson_type);

-- Enrollments indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON public.enrollments(enrolled_at DESC);

-- Course enrollments indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON public.course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_payment_status ON public.course_enrollments(payment_status);

-- Lesson progress indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment_id ON public.lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON public.lesson_progress(status);

-- Quiz questions indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_course_id ON public.quiz_questions(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson_id ON public.quiz_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type ON public.quiz_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON public.quiz_questions(course_id, order_num);

-- Quiz attempts indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_id ON public.quiz_attempts(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_enrollment_id ON public.quiz_attempts(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON public.quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON public.quiz_attempts(created_at DESC);

-- Quiz answers indexes
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON public.quiz_answers(attempt_id);

-- User course rankings indexes
CREATE INDEX IF NOT EXISTS idx_user_course_rankings_user_id ON public.user_course_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_rankings_ranking_date ON public.user_course_rankings(ranking_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_course_rankings_ranking_date_only ON public.user_course_rankings(ranking_date_only DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON public.quiz_answers(question_id);

-- Course certificates indexes
CREATE INDEX IF NOT EXISTS idx_course_certificates_user_id ON public.course_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_course_certificates_course_id ON public.course_certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_course_certificates_number ON public.course_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_course_certificates_issued_at ON public.course_certificates(issued_at DESC);

-- Course ROI calculations indexes
CREATE INDEX IF NOT EXISTS idx_course_roi_calculations_user_id ON public.course_roi_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_course_roi_calculations_course_id ON public.course_roi_calculations(course_id);
CREATE INDEX IF NOT EXISTS idx_course_roi_calculations_fit_score ON public.course_roi_calculations(fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_course_roi_calculations_expires_at ON public.course_roi_calculations(expires_at);

-- User course rankings indexes
CREATE INDEX IF NOT EXISTS idx_user_course_rankings_user_id ON public.user_course_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_rankings_ranking_date ON public.user_course_rankings(ranking_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_course_rankings_expires_at ON public.user_course_rankings(expires_at);

-- Enhanced course metadata indexes
CREATE INDEX IF NOT EXISTS idx_enhanced_course_metadata_course_id ON public.enhanced_course_metadata(course_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_course_metadata_market_demand ON public.enhanced_course_metadata(market_demand_score DESC);
CREATE INDEX IF NOT EXISTS idx_enhanced_course_metadata_trending ON public.enhanced_course_metadata(trending_score DESC);
