-- Complete Blog Posts Table Setup
-- Run this in your Supabase Dashboard → SQL Editor
-- This combines all blog column additions and fixes into one comprehensive script

-- First, ensure the post_status enum exists with all needed values
DO $$ 
BEGIN
    -- Check if post_status enum exists and update it to include our needed values
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
        -- Add missing enum values if they don't exist
        BEGIN
            ALTER TYPE post_status ADD VALUE IF NOT EXISTS 'draft';
        EXCEPTION WHEN duplicate_object THEN
            -- Value already exists, continue
        END;
        
        BEGIN
            ALTER TYPE post_status ADD VALUE IF NOT EXISTS 'published';
        EXCEPTION WHEN duplicate_object THEN
            -- Value already exists, continue
        END;
        
        BEGIN
            ALTER TYPE post_status ADD VALUE IF NOT EXISTS 'archived';
        EXCEPTION WHEN duplicate_object THEN
            -- Value already exists, continue
        END;
    ELSE
        -- Create the enum if it doesn't exist
        CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
    END IF;
END $$;

-- Add all missing columns to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS status post_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add a check constraint to ensure valid status values (with proper syntax)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'blog_posts_status_check' 
        AND table_name = 'blog_posts'
    ) THEN
        ALTER TABLE blog_posts 
        ADD CONSTRAINT blog_posts_status_check 
        CHECK (status IN ('draft', 'published', 'archived'));
    END IF;
END $$;

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can manage their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can view blog posts" ON blog_posts;

-- Recreate comprehensive RLS policies
CREATE POLICY "Public can view published blog posts" ON blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all blog posts" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'ADMIN'
        )
    );

CREATE POLICY "Authors can manage their own blog posts" ON blog_posts
    FOR ALL USING (author_id = auth.uid());

-- Create blog categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for blog categories
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_name ON blog_categories(name);

-- Enable RLS for blog categories
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Policies for blog categories
DROP POLICY IF EXISTS "Public can view blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins can manage blog categories" ON blog_categories;

CREATE POLICY "Public can view blog categories" ON blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog categories" ON blog_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'ADMIN'
        )
    );

-- Insert some default blog categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
    ('Industry Insights', 'industry-insights', 'Latest trends and insights from the industry', '#3B82F6'),
    ('Career Development', 'career-development', 'Tips and strategies for career growth', '#10B981'),
    ('Leadership', 'leadership', 'Leadership skills and management insights', '#F59E0B'),
    ('Technology', 'technology', 'Technology trends and innovations', '#8B5CF6'),
    ('Professional Development', 'professional-development', 'Professional skills and development', '#EF4444')
ON CONFLICT (slug) DO NOTHING;

-- Create function to update blog post reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
BEGIN
    -- Estimate reading time: ~200 words per minute
    RETURN GREATEST(1, CEIL(LENGTH(content) / 1000.0));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update reading time
CREATE OR REPLACE FUNCTION update_blog_reading_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reading_time = calculate_reading_time(NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for reading time calculation
DROP TRIGGER IF EXISTS trigger_update_blog_reading_time ON blog_posts;
CREATE TRIGGER trigger_update_blog_reading_time
    BEFORE INSERT OR UPDATE OF content ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_blog_reading_time();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trigger_update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_blog_posts_updated_at();

-- Grant necessary permissions
GRANT ALL ON blog_posts TO authenticated;
GRANT ALL ON blog_categories TO authenticated;

-- Enable RLS on blog_posts if not already enabled
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Final verification query
SELECT 
    'Blog setup completed successfully!' as status,
    COUNT(*) as total_blog_posts,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts
FROM blog_posts; 