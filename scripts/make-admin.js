// Script to make a user an admin
const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeAdmin(email) {
  try {
    console.log(`Making user with email ${email} an admin...`);
    
    // First, try to find the user by email in auth.users (this won't work with anon key)
    // So we'll update by email in user_profiles table
    
    // Update user_profiles table
    const { data: updatedProfile, error: profileError } = await supabase
      .from('user_profiles')
      .update({ role: 'ADMIN' })
      .eq('user_id', '(SELECT id FROM auth.users WHERE email = $1)')
      .select();
    
    if (profileError) {
      console.log('Could not update user_profiles table:', profileError.message);
      console.log('This is expected if the database tables don\'t exist yet.');
      
      // Try a direct SQL approach (this also won't work with anon key, but let's try)
      const { data, error } = await supabase.rpc('make_user_admin', { user_email: email });
      
      if (error) {
        console.log('RPC call failed:', error.message);
        console.log('\nTo make yourself an admin, you need to:');
        console.log('1. Set up your Supabase database using the setup-database.sql script');
        console.log('2. Run this SQL in your Supabase SQL editor:');
        console.log(`   UPDATE user_profiles SET role = 'ADMIN' WHERE user_id = (SELECT id FROM auth.users WHERE email = '${email}');`);
        return;
      }
      
      console.log('User made admin via RPC:', data);
    } else {
      console.log('User profile updated:', updatedProfile);
    }
    
  } catch (error) {
    console.error('Error making user admin:', error.message);
    console.log('\nTo make yourself an admin manually:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Go to the SQL Editor');
    console.log('3. Run this SQL:');
    console.log(`   UPDATE user_profiles SET role = 'ADMIN' WHERE user_id = (SELECT id FROM auth.users WHERE email = '${email}');`);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/make-admin.js <email>');
  console.log('Example: node scripts/make-admin.js paul@antimatteral.com');
  process.exit(1);
}

makeAdmin(email); 