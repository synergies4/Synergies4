-- Add missing columns to existing blog_posts table (FIXED VERSION)
-- Run this in your Supabase Dashboard → SQL Editor

-- First, let's check what values exist in the post_status enum and update it if needed
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

-- Add the missing columns using the enum type
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

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);

-- Update RLS policies to include the new columns
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can manage their own blog posts" ON blog_posts;

-- Recreate policies with status column
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