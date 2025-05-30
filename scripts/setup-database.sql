-- Basic setup script for Synergies4 database
-- This creates the minimum tables needed for the dashboard to work

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'INSTRUCTOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE course_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE course_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role user_role DEFAULT 'USER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  role user_role DEFAULT 'USER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  level course_level DEFAULT 'BEGINNER',
  duration TEXT DEFAULT '4 weeks',
  image TEXT,
  price DECIMAL DEFAULT 0,
  status course_status DEFAULT 'PUBLISHED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own user_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own user_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own user_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Courses are publicly readable" ON public.courses;
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON public.enrollments;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own user_profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own user_profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user_profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Courses are publicly readable" ON public.courses FOR SELECT USING (true);

CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own enrollments" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  
  -- Insert into user_profiles table
  INSERT INTO public.user_profiles (user_id, name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'USER');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample courses for testing
INSERT INTO public.courses (title, description, category, level, duration, image) VALUES
('Agile Leadership Fundamentals', 'Learn the core principles of agile leadership and how to apply them in your organization.', 'Leadership', 'BEGINNER', '4 weeks', '/api/placeholder/300/200'),
('Advanced Scrum Mastery', 'Deep dive into advanced Scrum techniques and practices for experienced practitioners.', 'Agile', 'ADVANCED', '6 weeks', '/api/placeholder/300/200'),
('Mental Fitness for Leaders', 'Develop mental resilience and emotional intelligence for effective leadership.', 'Mental Fitness', 'INTERMEDIATE', '8 weeks', '/api/placeholder/300/200')
ON CONFLICT DO NOTHING; 