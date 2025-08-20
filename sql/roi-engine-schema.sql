-- Personalized Course ROI & Value Engine Database Schema
-- This schema supports the ROI calculation engine with user profiles and course analytics

-- User Career Profiles Table
CREATE TABLE IF NOT EXISTS user_career_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Career Information
    experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    current_role VARCHAR(255),
    target_role VARCHAR(255),
    industry VARCHAR(100),
    
    -- Salary Information
    current_salary INTEGER,
    target_salary INTEGER,
    currency_code VARCHAR(3) DEFAULT 'USD',
    
    -- Skills and Goals
    current_skills TEXT[], -- Array of skill names
    target_skills TEXT[], -- Skills they want to develop
    career_goals TEXT[], -- Array of career objectives
    
    -- Learning Preferences
    learning_style VARCHAR(20) CHECK (learning_style IN ('self-paced', 'live-sessions', 'hybrid', 'cohort')),
    time_commitment VARCHAR(10) CHECK (time_commitment IN ('2-4', '5-10', '10-15', '15+')),
    budget_range VARCHAR(20),
    
    -- Profile Completeness
    profile_completion_score INTEGER DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
    is_profile_complete BOOLEAN DEFAULT FALSE,
    
    -- Resume/LinkedIn Data
    resume_text TEXT,
    linkedin_url VARCHAR(500),
    parsed_experience JSONB, -- Structured experience data from resume parsing
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Course ROI Calculations Table
CREATE TABLE IF NOT EXISTS course_roi_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL,
    
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
    
    -- Indexes for performance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, course_id)
);

-- Course ROI Rankings Table (for smart course ranking feature)
CREATE TABLE IF NOT EXISTS user_course_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Ranking Data
    ranking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    top_courses JSONB, -- Array of course IDs with scores
    ranking_methodology VARCHAR(50) DEFAULT 'roi_fit_score',
    
    -- Filters Applied
    filters_applied JSONB, -- Store filters used for this ranking
    budget_max INTEGER,
    time_constraint VARCHAR(20),
    skill_focus TEXT[],
    
    -- Metadata
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, ranking_date::DATE)
);

-- User ROI Engine Sessions (track usage and engagement)
CREATE TABLE IF NOT EXISTS roi_engine_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token UUID DEFAULT gen_random_uuid(),
    
    -- Session Data
    profile_step_completed BOOLEAN DEFAULT FALSE,
    calculation_step_completed BOOLEAN DEFAULT FALSE,
    results_viewed BOOLEAN DEFAULT FALSE,
    
    -- Interaction Data
    courses_analyzed INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    actions_taken JSONB, -- Track specific actions
    
    -- A/B Testing
    experiment_variant VARCHAR(50),
    
    -- Conversion Tracking
    courses_clicked TEXT[],
    courses_enrolled TEXT[],
    roi_engine_to_enrollment BOOLEAN DEFAULT FALSE,
    
    -- Device and Context
    user_agent TEXT,
    device_type VARCHAR(20),
    session_source VARCHAR(50), -- 'direct', 'course_page', 'navigation', etc.
    
    -- Timing
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course Enhancement Data (for better ROI calculations)
CREATE TABLE IF NOT EXISTS enhanced_course_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL UNIQUE,
    
    -- Outcome Data
    typical_salary_increase_percentage DECIMAL(5,2), -- e.g., 15.50 for 15.5%
    average_time_to_promotion_months INTEGER,
    skill_market_value JSONB, -- Market value of skills taught
    
    -- Industry Alignment
    target_industries TEXT[],
    job_role_alignment JSONB, -- Which roles this course best serves
    experience_level_fit VARCHAR(20),
    
    -- Success Metrics
    completion_rate DECIMAL(5,2),
    student_satisfaction_score DECIMAL(3,2), -- 0.00 to 5.00
    career_impact_score INTEGER, -- 0 to 100
    employer_recognition_score INTEGER, -- 0 to 100
    
    -- Market Data
    demand_score INTEGER, -- Market demand for these skills
    competition_level VARCHAR(20), -- 'low', 'medium', 'high'
    growth_trend VARCHAR(20), -- 'declining', 'stable', 'growing', 'explosive'
    
    -- ROI Calculation Inputs
    base_roi_multiplier DECIMAL(4,2) DEFAULT 1.00,
    industry_multipliers JSONB, -- Different multipliers per industry
    role_multipliers JSONB, -- Different multipliers per role level
    
    -- Last updated
    data_last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_career_profiles_user_id ON user_career_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_career_profiles_industry ON user_career_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_user_career_profiles_experience_level ON user_career_profiles(experience_level);

CREATE INDEX IF NOT EXISTS idx_course_roi_calculations_user_id ON course_roi_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_course_roi_calculations_course_id ON course_roi_calculations(course_id);
CREATE INDEX IF NOT EXISTS idx_course_roi_calculations_fit_score ON course_roi_calculations(fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_course_roi_calculations_active ON course_roi_calculations(is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_user_course_rankings_user_id ON user_course_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_rankings_date ON user_course_rankings(ranking_date DESC);

CREATE INDEX IF NOT EXISTS idx_roi_engine_sessions_user_id ON roi_engine_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_roi_engine_sessions_date ON roi_engine_sessions(session_start DESC);

CREATE INDEX IF NOT EXISTS idx_enhanced_course_metadata_course_id ON enhanced_course_metadata(course_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_roi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_engine_sessions ENABLE ROW LEVEL SECURITY;

-- User can only access their own profile data
CREATE POLICY "Users can manage own career profile" ON user_career_profiles
    FOR ALL USING (auth.uid() = user_id);

-- User can only access their own ROI calculations
CREATE POLICY "Users can manage own ROI calculations" ON course_roi_calculations
    FOR ALL USING (auth.uid() = user_id);

-- User can only access their own rankings
CREATE POLICY "Users can manage own course rankings" ON user_course_rankings
    FOR ALL USING (auth.uid() = user_id);

-- User can only access their own session data
CREATE POLICY "Users can manage own ROI engine sessions" ON roi_engine_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Enhanced course metadata is readable by all authenticated users
CREATE POLICY "Authenticated users can read enhanced course metadata" ON enhanced_course_metadata
    FOR SELECT TO authenticated
    USING (true);

-- Admins can manage enhanced course metadata
CREATE POLICY "Admins can manage enhanced course metadata" ON enhanced_course_metadata
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at timestamps
CREATE TRIGGER update_user_career_profiles_updated_at 
    BEFORE UPDATE ON user_career_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_roi_calculations_updated_at 
    BEFORE UPDATE ON course_roi_calculations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate profile completion score
CREATE OR REPLACE FUNCTION calculate_profile_completion_score()
RETURNS TRIGGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Basic information (40 points total)
    IF NEW.experience_level IS NOT NULL THEN score := score + 8; END IF;
    IF NEW.current_role IS NOT NULL AND LENGTH(NEW.current_role) > 0 THEN score := score + 8; END IF;
    IF NEW.target_role IS NOT NULL AND LENGTH(NEW.target_role) > 0 THEN score := score + 8; END IF;
    IF NEW.industry IS NOT NULL THEN score := score + 8; END IF;
    IF NEW.current_salary IS NOT NULL THEN score := score + 8; END IF;
    
    -- Skills and goals (30 points total)
    IF NEW.current_skills IS NOT NULL AND array_length(NEW.current_skills, 1) > 0 THEN score := score + 10; END IF;
    IF NEW.target_skills IS NOT NULL AND array_length(NEW.target_skills, 1) > 0 THEN score := score + 10; END IF;
    IF NEW.career_goals IS NOT NULL AND array_length(NEW.career_goals, 1) > 0 THEN score := score + 10; END IF;
    
    -- Learning preferences (20 points total)
    IF NEW.learning_style IS NOT NULL THEN score := score + 10; END IF;
    IF NEW.time_commitment IS NOT NULL THEN score := score + 10; END IF;
    
    -- Resume/additional data (10 points total)
    IF NEW.resume_text IS NOT NULL AND LENGTH(NEW.resume_text) > 100 THEN score := score + 5; END IF;
    IF NEW.target_salary IS NOT NULL THEN score := score + 5; END IF;
    
    NEW.profile_completion_score := score;
    NEW.is_profile_complete := (score >= 70); -- At least 70% complete for full ROI calculations
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profile completion calculation
CREATE TRIGGER calculate_profile_completion_on_update
    BEFORE INSERT OR UPDATE ON user_career_profiles
    FOR EACH ROW EXECUTE FUNCTION calculate_profile_completion_score();

-- Function to clean up expired ROI calculations
CREATE OR REPLACE FUNCTION cleanup_expired_roi_calculations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM course_roi_calculations 
    WHERE expires_at < NOW() AND is_active = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Function to get user's top course recommendations
CREATE OR REPLACE FUNCTION get_user_top_course_recommendations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    course_id UUID,
    fit_score INTEGER,
    roi_percentage_year_1 INTEGER,
    estimated_salary_increase INTEGER,
    timeline_to_impact VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        crc.course_id,
        crc.fit_score,
        crc.roi_percentage_year_1,
        crc.salary_increase_year_1,
        crc.timeline_to_impact
    FROM course_roi_calculations crc
    WHERE crc.user_id = p_user_id 
      AND crc.is_active = TRUE 
      AND crc.expires_at > NOW()
    ORDER BY crc.fit_score DESC, crc.roi_percentage_year_1 DESC
    LIMIT p_limit;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Sample data insertion function (for testing)
CREATE OR REPLACE FUNCTION insert_sample_enhanced_course_metadata()
RETURNS VOID AS $$
BEGIN
    INSERT INTO enhanced_course_metadata (
        course_id,
        typical_salary_increase_percentage,
        average_time_to_promotion_months,
        target_industries,
        experience_level_fit,
        completion_rate,
        student_satisfaction_score,
        career_impact_score,
        demand_score,
        growth_trend,
        base_roi_multiplier
    ) VALUES
    (gen_random_uuid(), 15.5, 8, ARRAY['technology', 'finance'], 'mid', 85.5, 4.2, 88, 92, 'growing', 1.2),
    (gen_random_uuid(), 22.0, 6, ARRAY['technology', 'consulting'], 'senior', 78.3, 4.5, 95, 89, 'explosive', 1.4),
    (gen_random_uuid(), 12.5, 12, ARRAY['healthcare', 'education'], 'entry', 92.1, 4.1, 76, 85, 'stable', 1.0)
    ON CONFLICT (course_id) DO NOTHING;
END;
$$ language 'plpgsql';

-- Comments for documentation
COMMENT ON TABLE user_career_profiles IS 'Stores comprehensive career profile data for ROI calculations';
COMMENT ON TABLE course_roi_calculations IS 'Cached ROI calculations for user-course combinations';
COMMENT ON TABLE user_course_rankings IS 'Smart course rankings based on user profile and preferences';
COMMENT ON TABLE roi_engine_sessions IS 'Tracks user engagement and conversion through the ROI engine';
COMMENT ON TABLE enhanced_course_metadata IS 'Enhanced course data for improved ROI calculations';

COMMENT ON FUNCTION calculate_profile_completion_score() IS 'Automatically calculates profile completion percentage';
COMMENT ON FUNCTION cleanup_expired_roi_calculations() IS 'Maintenance function to clean up expired ROI calculations';
COMMENT ON FUNCTION get_user_top_course_recommendations(UUID, INTEGER) IS 'Returns top course recommendations for a user'; 