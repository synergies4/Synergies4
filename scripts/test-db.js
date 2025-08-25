// Simple script to test Supabase database connection
const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth test:', { user: user?.id, error: authError?.message });
    
    // Test courses table
    console.log('\nTesting courses table...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .limit(1);
    
    if (coursesError) {
      console.log('Courses table error:', coursesError.message);
    } else {
      console.log('Courses table exists, sample data:', courses);
    }
    
    // Test enrollments table
    console.log('\nTesting enrollments table...');
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('*')
      .limit(1);
    
    if (enrollmentsError) {
      console.log('Enrollments table error:', enrollmentsError.message);
    } else {
      console.log('Enrollments table exists, sample data:', enrollments);
    }
    
    // Test user_profiles table
    console.log('\nTesting user_profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('User profiles table error:', profilesError.message);
    } else {
      console.log('User profiles table exists, sample data:', profiles);
    }
    
  } catch (error) {
    console.error('Database test failed:', error);
  }

}

testDatabase(); 
testDatabase(); 