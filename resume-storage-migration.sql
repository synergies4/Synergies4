-- Resume Storage Migration for User Onboarding Table
-- This safely adds resume storage columns to the existing user_onboarding table

-- Add resume storage columns to existing user_onboarding table
ALTER TABLE user_onboarding 
ADD COLUMN IF NOT EXISTS resume_filename VARCHAR(500),
ADD COLUMN IF NOT EXISTS resume_content TEXT,
ADD COLUMN IF NOT EXISTS resume_file_url TEXT,
ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resume_file_size INTEGER,
ADD COLUMN IF NOT EXISTS resume_file_type VARCHAR(50);

-- Add comment to document the migration
COMMENT ON COLUMN user_onboarding.resume_filename IS 'Original filename of uploaded resume';
COMMENT ON COLUMN user_onboarding.resume_content IS 'Extracted text content from resume file';
COMMENT ON COLUMN user_onboarding.resume_file_url IS 'URL to stored resume file';
COMMENT ON COLUMN user_onboarding.resume_uploaded_at IS 'Timestamp when resume was uploaded';
COMMENT ON COLUMN user_onboarding.resume_file_size IS 'Size of resume file in bytes';
COMMENT ON COLUMN user_onboarding.resume_file_type IS 'MIME type of resume file';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_onboarding' 
AND column_name LIKE 'resume_%'
ORDER BY column_name; 