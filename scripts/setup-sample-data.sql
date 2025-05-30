-- Sample data setup script for Synergies4 platform
-- Run this in your Supabase SQL editor to populate the database with test data

-- First, make sure Paul Wallace is an admin (update existing user)
UPDATE user_profiles 
SET role = 'ADMIN', name = 'Paul Wallace'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'paul@antimatterai.com'
);

-- Insert sample courses
INSERT INTO courses (title, description, category, level, price, duration_hours, status, thumbnail_url, instructor_id, tags) VALUES
('AI-Powered Scrum Master', 'Master AI-enhanced Scrum methodologies and lead high-performing agile teams in the digital age', 'agile', 'INTERMEDIATE', 299.00, 12, 'PUBLISHED', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400', (SELECT id FROM auth.users WHERE email = 'paul@antimatterai.com'), ARRAY['scrum', 'ai', 'agile', 'leadership']),

('PQ Series: Advanced Intelligence', 'Strengthen your mental fitness with our comprehensive Positive Intelligence program', 'pq', 'BEGINNER', 199.00, 8, 'PUBLISHED', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', (SELECT id FROM auth.users WHERE email = 'paul@antimatterai.com'), ARRAY['pq', 'mental-fitness', 'intelligence']),

('AI Product Owner Certification', 'Become a certified AI Product Owner and drive innovation in product development', 'product', 'ADVANCED', 399.00, 16, 'PUBLISHED', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', (SELECT id FROM auth.users WHERE email = 'paul@antimatterai.com'), ARRAY['product-owner', 'ai', 'certification']),

('Leadership in the AI Era', 'Develop essential leadership skills for managing teams in an AI-driven world', 'leadership', 'INTERMEDIATE', 249.00, 10, 'PUBLISHED', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', (SELECT id FROM auth.users WHERE email = 'paul@antimatterai.com'), ARRAY['leadership', 'ai', 'management']),

('Agile Transformation Workshop', 'Complete guide to implementing agile methodologies in your organization', 'agile', 'BEGINNER', 149.00, 6, 'DRAFT', 'https://images.unsplash.com/photo-1553028826-f4804a6dfd3f?w=400', (SELECT id FROM auth.users WHERE email = 'paul@antimatterai.com'), ARRAY['agile', 'transformation', 'workshop']);

-- Insert course modules for the first course
INSERT INTO course_modules (course_id, title, description, order_index) VALUES
((SELECT id FROM courses WHERE title = 'AI-Powered Scrum Master' LIMIT 1), 'Introduction to AI in Scrum', 'Understanding how AI can enhance traditional Scrum practices', 1),
((SELECT id FROM courses WHERE title = 'AI-Powered Scrum Master' LIMIT 1), 'AI Tools for Sprint Planning', 'Leveraging AI tools for better sprint planning and estimation', 2),
((SELECT id FROM courses WHERE title = 'AI-Powered Scrum Master' LIMIT 1), 'Data-Driven Retrospectives', 'Using AI analytics to improve retrospective insights', 3),
((SELECT id FROM courses WHERE title = 'AI-Powered Scrum Master' LIMIT 1), 'Leading AI-Enhanced Teams', 'Best practices for leading teams that use AI tools', 4);

-- Insert sample users (these will need to be created through Supabase Auth first)
-- You can create these users through the signup process or Supabase dashboard

-- Insert sample enrollments (replace user_ids with actual user IDs from your auth.users table)
-- This is just an example - you'll need to update with real user IDs
/*
INSERT INTO enrollments (user_id, course_id, progress, enrolled_at) VALUES
('user-id-1', (SELECT id FROM courses WHERE title = 'AI-Powered Scrum Master' LIMIT 1), 75, NOW() - INTERVAL '10 days'),
('user-id-1', (SELECT id FROM courses WHERE title = 'PQ Series: Advanced Intelligence' LIMIT 1), 30, NOW() - INTERVAL '5 days'),
('user-id-2', (SELECT id FROM courses WHERE title = 'AI Product Owner Certification' LIMIT 1), 90, NOW() - INTERVAL '20 days'),
('user-id-2', (SELECT id FROM courses WHERE title = 'Leadership in the AI Era' LIMIT 1), 45, NOW() - INTERVAL '3 days');
*/

-- Check the data
SELECT 'Courses created:' as info, COUNT(*) as count FROM courses;
SELECT 'Modules created:' as info, COUNT(*) as count FROM course_modules;
SELECT 'User profiles:' as info, COUNT(*) as count FROM user_profiles; 