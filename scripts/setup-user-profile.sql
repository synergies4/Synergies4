-- Script to create user profiles for existing auth users
-- Run this in your Supabase SQL editor if you have auth users without profiles

-- Insert user profile for Paul Wallace if it doesn't exist
INSERT INTO user_profiles (user_id, name, role, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', 'Paul Wallace') as name,
  'ADMIN' as role,
  created_at,
  NOW() as updated_at
FROM auth.users 
WHERE email = 'paul@antimatterai.com'
AND id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  role = 'ADMIN',
  updated_at = NOW();

-- Create user profiles for any other auth users without profiles
INSERT INTO user_profiles (user_id, name, role, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', email) as name,
  'USER' as role,
  created_at,
  NOW() as updated_at
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Check the results
SELECT 
  up.name,
  up.role,
  au.email,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at; 