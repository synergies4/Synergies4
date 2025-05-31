-- Simple Blog Schema for Supabase SQL Editor
-- Run this in your Supabase Dashboard → SQL Editor

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  meta_title TEXT,
  meta_description TEXT,
  reading_time INTEGER DEFAULT 0
);

-- Insert categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
('AI', 'ai', 'Artificial Intelligence insights and trends', '#8B5CF6'),
('Best Practices & Strategies', 'best-practices-strategies', 'Industry best practices and strategic insights', '#3B82F6'),
('Sustainability & Corporate', 'sustainability-corporate', 'Corporate sustainability and responsibility', '#10B981'),
('Technology & Innovation', 'technology-innovation', 'Latest technology trends and innovations', '#F59E0B'),
('Agile', 'agile', 'Agile methodologies and practices', '#EF4444'),
('Business Analysis', 'business-analysis', 'Business analysis techniques and insights', '#6366F1'),
('Business Management', 'business-management', 'Management strategies and leadership', '#8B5CF6'),
('Business Strategy', 'business-strategy', 'Strategic business planning and execution', '#059669'),
('Product Management', 'product-management', 'Product development and management insights', '#DC2626'),
('PQ Skills', 'pq-skills', 'Positive Intelligence and mental fitness', '#7C3AED')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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