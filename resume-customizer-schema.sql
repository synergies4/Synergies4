-- Resume Customizer Schema
-- Tables for job application preparation and resume customization

-- Job Applications Table - Store job postings user is applying to
CREATE TABLE IF NOT EXISTS job_applications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Job Details
  job_title VARCHAR(500) NOT NULL,
  company_name VARCHAR(500) NOT NULL,
  job_description TEXT NOT NULL,
  job_url TEXT,
  job_location VARCHAR(500),
  employment_type VARCHAR(100), -- full-time, part-time, contract, etc.
  salary_range VARCHAR(200),
  
  -- Application Status
  application_status VARCHAR(50) DEFAULT 'preparing' CHECK (application_status IN ('preparing', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn')),
  application_date TIMESTAMP WITH TIME ZONE,
  
  -- Company Intelligence Data
  company_info JSONB DEFAULT '{}', -- Company background, culture, recent news
  company_size VARCHAR(100),
  company_industry VARCHAR(200),
  
  -- Fit Analysis Results
  overall_fit_score INTEGER CHECK (overall_fit_score BETWEEN 0 AND 100),
  skill_matches TEXT[],
  skill_gaps TEXT[],
  experience_alignment TEXT,
  keyword_matches TEXT[],
  
  -- AI Analysis
  ai_analysis JSONB DEFAULT '{}', -- Detailed AI analysis of job fit
  recommended_focus_areas TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tailored Resumes Table - Store customized resumes for each job application
CREATE TABLE IF NOT EXISTS tailored_resumes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_application_id INTEGER REFERENCES job_applications(id) ON DELETE CASCADE,
  
  -- Resume Data
  original_resume_id INTEGER, -- Reference to original resume if stored separately
  tailored_content TEXT NOT NULL, -- HTML/Markdown formatted resume
  tailored_content_plain TEXT, -- Plain text version
  
  -- Customization Details
  modifications_made TEXT[], -- List of modifications applied
  keywords_emphasized TEXT[], -- Keywords that were highlighted/emphasized
  sections_reordered JSONB DEFAULT '{}', -- Track section reordering
  content_additions TEXT[], -- New content added for this job
  
  -- Version Control
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Export Formats
  pdf_url TEXT, -- URL to generated PDF
  docx_url TEXT, -- URL to generated DOCX
  
  -- Performance Tracking
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cover Letters Table - Store tailored cover letters
CREATE TABLE IF NOT EXISTS tailored_cover_letters (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_application_id INTEGER REFERENCES job_applications(id) ON DELETE CASCADE,
  
  -- Cover Letter Content
  content TEXT NOT NULL, -- HTML/Markdown formatted cover letter
  content_plain TEXT, -- Plain text version
  
  -- Customization Details
  personalization_elements JSONB DEFAULT '{}', -- Company-specific personalizations
  key_achievements_highlighted TEXT[],
  call_to_action TEXT,
  
  -- Export Formats
  pdf_url TEXT,
  docx_url TEXT,
  
  -- Version Control
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview Preparation Table - Store interview questions and practice sessions
CREATE TABLE IF NOT EXISTS interview_preparation (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_application_id INTEGER REFERENCES job_applications(id) ON DELETE CASCADE,
  
  -- Generated Questions
  technical_questions JSONB DEFAULT '[]', -- Array of technical interview questions
  behavioral_questions JSONB DEFAULT '[]', -- Array of behavioral questions
  company_specific_questions JSONB DEFAULT '[]', -- Questions specific to the company
  role_specific_questions JSONB DEFAULT '[]', -- Questions specific to the role
  
  -- Question Metadata
  question_sources TEXT[], -- Where questions were derived from
  difficulty_levels JSONB DEFAULT '{}', -- Difficulty assessment for each question type
  
  -- Practice Sessions
  practice_sessions JSONB DEFAULT '[]', -- Record of practice sessions
  total_practice_time INTEGER DEFAULT 0, -- Total minutes practiced
  
  -- Company Intelligence for Interview
  company_culture_notes TEXT,
  recent_company_news TEXT[],
  interviewer_insights JSONB DEFAULT '{}',
  
  -- Preparation Status
  preparation_completeness INTEGER DEFAULT 0 CHECK (preparation_completeness BETWEEN 0 AND 100),
  ready_for_interview BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career Goals Survey Table - Store career goals and preferences
CREATE TABLE IF NOT EXISTS career_goals_survey (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Career Aspirations
  short_term_goals TEXT[], -- 1-2 year goals
  long_term_goals TEXT[], -- 5+ year goals
  preferred_industries TEXT[],
  preferred_roles TEXT[],
  preferred_company_sizes TEXT[],
  
  -- Work Preferences
  preferred_work_environment VARCHAR(50), -- remote, hybrid, onsite
  preferred_company_culture TEXT[],
  salary_expectations VARCHAR(200),
  location_preferences TEXT[],
  
  -- Skills & Development
  current_strengths TEXT[],
  areas_for_improvement TEXT[],
  skills_to_develop TEXT[],
  learning_interests TEXT[],
  
  -- Values & Motivations
  core_values TEXT[],
  work_motivations TEXT[],
  deal_breakers TEXT[],
  
  -- Survey Metadata
  survey_completed BOOLEAN DEFAULT FALSE,
  survey_completed_at TIMESTAMP WITH TIME ZONE,
  survey_version VARCHAR(10) DEFAULT '1.0',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Interview Sessions Table - Store AI-powered interview practice sessions
CREATE TABLE IF NOT EXISTS ai_interview_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_application_id INTEGER REFERENCES job_applications(id) ON DELETE CASCADE,
  
  -- Session Details
  session_type VARCHAR(50) CHECK (session_type IN ('technical', 'behavioral', 'mixed', 'company_specific')),
  session_duration INTEGER, -- Duration in minutes
  questions_asked JSONB DEFAULT '[]', -- Questions asked during session
  responses_given JSONB DEFAULT '[]', -- User responses
  
  -- AI Feedback
  overall_performance_score INTEGER CHECK (overall_performance_score BETWEEN 0 AND 100),
  detailed_feedback JSONB DEFAULT '{}', -- Detailed feedback per question
  improvement_suggestions TEXT[],
  strengths_identified TEXT[],
  
  -- Session Audio/Video (if recorded)
  recording_url TEXT,
  transcript TEXT,
  
  -- Performance Metrics
  response_times INTEGER[], -- Time taken for each response in seconds
  confidence_scores INTEGER[], -- AI-assessed confidence per response
  
  -- Session Status
  session_status VARCHAR(50) DEFAULT 'completed' CHECK (session_status IN ('in_progress', 'completed', 'abandoned')),
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_job_applications_company ON job_applications(company_name);
CREATE INDEX IF NOT EXISTS idx_tailored_resumes_user_id ON tailored_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_tailored_resumes_job_id ON tailored_resumes(job_application_id);
CREATE INDEX IF NOT EXISTS idx_tailored_cover_letters_user_id ON tailored_cover_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_tailored_cover_letters_job_id ON tailored_cover_letters(job_application_id);
CREATE INDEX IF NOT EXISTS idx_interview_preparation_user_id ON interview_preparation(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_preparation_job_id ON interview_preparation(job_application_id);
CREATE INDEX IF NOT EXISTS idx_career_goals_survey_user_id ON career_goals_survey(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interview_sessions_user_id ON ai_interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interview_sessions_job_id ON ai_interview_sessions(job_application_id);

-- RLS Policies
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tailored_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tailored_cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_preparation ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals_survey ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interview_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can access their own job applications" ON job_applications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own tailored resumes" ON tailored_resumes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own cover letters" ON tailored_cover_letters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own interview preparation" ON interview_preparation
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own career goals survey" ON career_goals_survey
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own AI interview sessions" ON ai_interview_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON job_applications TO authenticated;
GRANT ALL ON tailored_resumes TO authenticated;
GRANT ALL ON tailored_cover_letters TO authenticated;
GRANT ALL ON interview_preparation TO authenticated;
GRANT ALL ON career_goals_survey TO authenticated;
GRANT ALL ON ai_interview_sessions TO authenticated;

GRANT USAGE ON SEQUENCE job_applications_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE tailored_resumes_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE tailored_cover_letters_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE interview_preparation_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE career_goals_survey_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE ai_interview_sessions_id_seq TO authenticated;

-- Add triggers for updated_at
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tailored_resumes_updated_at BEFORE UPDATE ON tailored_resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tailored_cover_letters_updated_at BEFORE UPDATE ON tailored_cover_letters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_preparation_updated_at BEFORE UPDATE ON interview_preparation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_goals_survey_updated_at BEFORE UPDATE ON career_goals_survey
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 