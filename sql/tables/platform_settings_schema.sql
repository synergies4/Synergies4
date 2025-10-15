-- Platform Settings Table
-- This table stores all platform-wide configuration settings
-- Single-row table with id=1 to ensure only one configuration exists

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  
  -- Site Information
  site_name TEXT DEFAULT 'Synergies4',
  site_description TEXT DEFAULT 'AI-powered learning platform for professional development',
  site_url TEXT DEFAULT 'https://synergies4ai.com',
  contact_email TEXT DEFAULT 'contact@synergies4ai.com',
  support_email TEXT DEFAULT 'support@synergies4ai.com',
  
  -- Platform Settings
  maintenance_mode BOOLEAN DEFAULT FALSE,
  registration_enabled BOOLEAN DEFAULT TRUE,
  email_verification_required BOOLEAN DEFAULT TRUE,
  max_file_size_mb INTEGER DEFAULT 10,
  allowed_file_types TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'mov'],
  default_user_role TEXT DEFAULT 'USER',
  course_approval_required BOOLEAN DEFAULT FALSE,
  
  -- Payment Settings
  payment_enabled BOOLEAN DEFAULT TRUE,
  stripe_public_key TEXT,
  stripe_secret_key TEXT,
  
  -- Email Settings
  email_provider TEXT DEFAULT 'smtp',
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_username TEXT,
  smtp_password TEXT,
  
  -- AI Settings
  ai_provider TEXT DEFAULT 'anthropic',
  openai_api_key TEXT,
  anthropic_api_key TEXT,
  
  -- Theme Settings
  theme_primary_color TEXT DEFAULT '#2563eb',
  theme_secondary_color TEXT DEFAULT '#7c3aed',
  custom_css TEXT,
  
  -- Analytics Settings
  analytics_enabled BOOLEAN DEFAULT TRUE,
  google_analytics_id TEXT,
  
  -- SEO Settings
  seo_title TEXT DEFAULT 'Synergies4 - AI-Powered Learning Platform',
  seo_description TEXT DEFAULT 'Transform your professional development with AI-powered courses, coaching, and consulting.',
  seo_keywords TEXT DEFAULT 'AI learning, professional development, agile, scrum, leadership, product management',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure only one row exists
  CONSTRAINT platform_settings_single_row CHECK (id = 1)
);

-- Insert default settings if not exists
INSERT INTO public.platform_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Create index on id (though it's primary key)
CREATE INDEX IF NOT EXISTS idx_platform_settings_id ON public.platform_settings(id);

-- Enable Row Level Security
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Allow admin write access to platform settings" ON public.platform_settings;

-- RLS Policies
-- Allow anyone to read platform settings (for public site configuration)
CREATE POLICY "Allow public read access to platform settings"
  ON public.platform_settings
  FOR SELECT
  USING (true);

-- Only allow admins to update platform settings
CREATE POLICY "Allow admin write access to platform settings"
  ON public.platform_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'ADMIN'
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS platform_settings_updated_at ON public.platform_settings;

CREATE TRIGGER platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_settings_updated_at();

-- Grant permissions
GRANT SELECT ON public.platform_settings TO anon, authenticated;
GRANT ALL ON public.platform_settings TO authenticated;

