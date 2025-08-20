-- Blog System Database Schema for Supabase (Fresh Install)
-- This will drop existing tables and recreate them

-- Drop existing tables if they exist
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;

-- Create blog_posts table
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category TEXT NOT NULL,
  tags TEXT[], -- Array of tags
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  meta_title TEXT,
  meta_description TEXT,
  reading_time INTEGER DEFAULT 0 -- in minutes
);

-- Create blog_categories table for better organization
CREATE TABLE blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6', -- Hex color for category
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories based on the live site
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
('PQ Skills', 'pq-skills', 'Positive Intelligence and mental fitness', '#7C3AED');

-- Create indexes for better performance
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE
    ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public to read published posts
CREATE POLICY "Public can view published blog posts" ON blog_posts
    FOR SELECT USING (status = 'published');

-- Allow admins to do everything
CREATE POLICY "Admins can manage all blog posts" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'ADMIN'
        )
    );

-- Allow authors to manage their own posts
CREATE POLICY "Authors can manage their own blog posts" ON blog_posts
    FOR ALL USING (author_id = auth.uid());

-- RLS Policies for blog_categories
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Allow public to read categories
CREATE POLICY "Public can view blog categories" ON blog_categories
    FOR SELECT USING (true);

-- Allow admins to manage categories
CREATE POLICY "Admins can manage blog categories" ON blog_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'ADMIN'
        )
    );

-- Insert some sample blog posts (optional)
INSERT INTO blog_posts (title, slug, excerpt, content, category, tags, author_id, status, published_at) VALUES
(
    'Synergies4 – A Symbol of Human-Centered Intelligence in Motion',
    'synergies4-human-centered-intelligence',
    'Discover how Synergies4 represents the future of human-centered AI and intelligent learning systems.',
    '<h2>The Future of Human-Centered Intelligence</h2><p>At Synergies4, we believe that the future of artificial intelligence lies not in replacing human intelligence, but in amplifying it. Our approach to AI-powered learning represents a new paradigm where technology serves to enhance human potential rather than diminish it.</p><h3>What Makes Intelligence Human-Centered?</h3><p>Human-centered intelligence recognizes that the most powerful learning experiences occur when AI adapts to human needs, learning styles, and goals. Rather than forcing learners into rigid structures, our platform creates personalized pathways that respect individual differences and preferences.</p><h3>Intelligence in Motion</h3><p>The "motion" in our approach refers to the dynamic, adaptive nature of our learning systems. As learners progress, our AI continuously adjusts content difficulty, pacing, and methodology to optimize outcomes. This creates a living, breathing educational experience that evolves with each interaction.</p><h3>The Synergies4 Difference</h3><p>Our commitment to human-centered intelligence manifests in several key ways:</p><ul><li><strong>Adaptive Learning Paths:</strong> AI that learns from your learning style</li><li><strong>Emotional Intelligence:</strong> Recognition of learner motivation and engagement levels</li><li><strong>Collaborative Intelligence:</strong> Fostering human connections within AI-enhanced environments</li><li><strong>Ethical AI:</strong> Transparent algorithms that prioritize learner wellbeing</li></ul><p>As we continue to develop our platform, we remain committed to this vision of intelligence that serves humanity, creating synergies between human potential and artificial intelligence capabilities.</p>',
    'Best Practices & Strategies',
    ARRAY['AI', 'Human-Centered Design', 'Learning Technology', 'Innovation'],
    (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1),
    'published',
    NOW() - INTERVAL '2 days'
),
(
    'The Journey to Becoming an AI-First Company',
    'journey-ai-first-company',
    'Learn the essential steps and strategies for transforming your organization into an AI-first company.',
    '<h2>Embracing the AI-First Mindset</h2><p>The transformation to an AI-first company is not just about adopting new technologies—it''s about fundamentally reimagining how your organization operates, makes decisions, and creates value.</p><h3>Phase 1: Foundation Building</h3><p>Before diving into AI implementation, organizations must establish a solid foundation:</p><ul><li><strong>Data Infrastructure:</strong> Clean, accessible, and well-organized data systems</li><li><strong>Cultural Readiness:</strong> Leadership buy-in and employee education</li><li><strong>Skill Development:</strong> Training teams in AI literacy and data science</li></ul><h3>Phase 2: Strategic Implementation</h3><p>The implementation phase requires careful planning and execution:</p><ul><li><strong>Pilot Projects:</strong> Start with low-risk, high-impact use cases</li><li><strong>Cross-functional Teams:</strong> Bring together diverse expertise</li><li><strong>Iterative Approach:</strong> Learn, adapt, and scale gradually</li></ul><h3>Phase 3: Scaling and Optimization</h3><p>As AI capabilities mature, focus shifts to scaling and optimization:</p><ul><li><strong>Process Integration:</strong> Embed AI into core business processes</li><li><strong>Performance Monitoring:</strong> Continuous measurement and improvement</li><li><strong>Innovation Culture:</strong> Foster ongoing experimentation and learning</li></ul><h3>Common Pitfalls to Avoid</h3><p>Many organizations stumble during their AI transformation. Key pitfalls include:</p><ul><li>Underestimating the importance of data quality</li><li>Neglecting change management and employee training</li><li>Trying to implement too many AI solutions simultaneously</li><li>Focusing on technology without considering business outcomes</li></ul><p>The journey to becoming AI-first is challenging but rewarding. Organizations that successfully navigate this transformation position themselves for sustained competitive advantage in an increasingly AI-driven world.</p>',
    'AI',
    ARRAY['AI Transformation', 'Digital Strategy', 'Business Innovation', 'Change Management'],
    (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1),
    'published',
    NOW() - INTERVAL '5 days'
); 