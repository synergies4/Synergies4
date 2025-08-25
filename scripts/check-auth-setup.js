const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAuthSetup() {
  console.log('🔍 Checking Supabase Auth Setup...\n');
  
  try {
    // Check 1: Test basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth connection error:', authError);
    } else {
      console.log('✅ Auth connection successful');
    }
    
    // Check 2: Test if auth.users table exists and is accessible
    console.log('\n2️⃣ Checking auth.users table...');
    try {
      const { data: users, error: usersError } = await supabase
        .from('auth.users')
        .select('id, email')
        .limit(1);
      
      if (usersError) {
        console.error('❌ auth.users table error:', usersError);
      } else {
        console.log('✅ auth.users table accessible');
      }
    } catch (error) {
      console.error('❌ Cannot access auth.users table:', error.message);
    }
    
    // Check 3: Test if public.users table exists
    console.log('\n3️⃣ Checking public.users table...');
    try {
      const { data: publicUsers, error: publicUsersError } = await supabase
        .from('users')
        .select('id, email, auth_user_id')
        .limit(1);
      
      if (publicUsersError) {
        console.error('❌ public.users table error:', publicUsersError);
      } else {
        console.log('✅ public.users table accessible');
      }
    } catch (error) {
      console.error('❌ Cannot access public.users table:', error.message);
    }
    
    // Check 4: Test required functions
    console.log('\n4️⃣ Testing required functions...');
    
    // Test generate_short_id
    try {
      const { data: shortId, error: shortIdError } = await supabase
        .rpc('generate_short_id', { table_name: 'users' });
      
      if (shortIdError) {
        console.error('❌ generate_short_id function error:', shortIdError);
      } else {
        console.log('✅ generate_short_id function works:', shortId);
      }
    } catch (error) {
      console.error('❌ generate_short_id function not found:', error.message);
    }
    
    // Test current_epoch
    try {
      const { data: epoch, error: epochError } = await supabase
        .rpc('current_epoch');
      
      if (epochError) {
        console.error('❌ current_epoch function error:', epochError);
      } else {
        console.log('✅ current_epoch function works:', epoch);
      }
    } catch (error) {
      console.error('❌ current_epoch function not found:', error.message);
    }
    
    // Check 5: Test trigger function
    console.log('\n5️⃣ Testing trigger function...');
    try {
      const { data: triggerTest, error: triggerError } = await supabase
        .rpc('test_user_functions');
      
      if (triggerError) {
        console.error('❌ test_user_functions error:', triggerError);
      } else {
        console.log('✅ test_user_functions result:', triggerTest);
      }
    } catch (error) {
      console.error('❌ test_user_functions not found:', error.message);
    }
    
    // Check 6: Test creating a user with admin API
    console.log('\n6️⃣ Testing user creation with admin API...');
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'testpassword123';
      
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          name: 'Test User'
        }
      });
      
      if (createError) {
        console.error('❌ Admin user creation failed:', createError);
        console.error('Error details:', {
          message: createError.message,
          status: createError.status,
          name: createError.name
        });
      } else {
        console.log('✅ Admin user creation successful:', createData.user.id);
        
        // Clean up test user
        await supabase.auth.admin.deleteUser(createData.user.id);
        console.log('🧹 Test user cleaned up');
      }
    } catch (error) {
      console.error('❌ Admin user creation error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking auth setup:', error);
  }
}

async function main() {
  console.log('🔧 Supabase Auth Setup Checker\n');
  console.log('This script will check if your Supabase Auth is properly configured.\n');
  
  await checkAuthSetup();
  
  console.log('\n✅ Auth setup check completed!');
  console.log('\nIf you see errors above, you may need to:');
  console.log('1. Run the database fix script: node scripts/fix-database.js');
  console.log('2. Check your Supabase project settings');
  console.log('3. Verify your environment variables');
}

main().catch(console.error);
