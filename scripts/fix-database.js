const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runDatabaseFix() {
  console.log('🚀 Running database fix...\n');
  
  try {
    // Read the SQL fix file
    const sqlFilePath = path.join(__dirname, '..', 'sql', 'fix-user-signup.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQL file loaded successfully');
    console.log('🔧 Executing database fixes...\n');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try alternative approach - execute SQL in chunks
      console.log('🔄 Trying alternative approach with SQL chunks...');
      await executeSQLInChunks(sqlContent);
    } else {
      console.log('✅ Database fix completed successfully!');
    }
    
    // Test the functions
    console.log('\n🧪 Testing database functions...');
    await testDatabaseFunctions();
    
  } catch (error) {
    console.error('❌ Error running database fix:', error);
  }
}

async function executeSQLInChunks(sqlContent) {
  // Split SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  console.log(`📝 Found ${statements.length} SQL statements to execute`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement.trim()) {
      try {
        console.log(`🔧 Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          // Continue with next statement
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
      }
    }
  }
}

async function testDatabaseFunctions() {
  try {
    // Test generate_short_id function
    const { data: shortIdResult, error: shortIdError } = await supabase
      .rpc('generate_short_id', { table_name: 'users' });
    
    if (shortIdError) {
      console.error('❌ generate_short_id function error:', shortIdError);
    } else {
      console.log('✅ generate_short_id function works:', shortIdResult);
    }
    
    // Test current_epoch function
    const { data: epochResult, error: epochError } = await supabase
      .rpc('current_epoch');
    
    if (epochError) {
      console.error('❌ current_epoch function error:', epochError);
    } else {
      console.log('✅ current_epoch function works:', epochResult);
    }
    
    // Test test_user_functions
    const { data: testResult, error: testError } = await supabase
      .rpc('test_user_functions');
    
    if (testError) {
      console.error('❌ test_user_functions error:', testError);
    } else {
      console.log('✅ test_user_functions result:', testResult);
    }
    
  } catch (error) {
    console.error('❌ Error testing functions:', error);
  }
}

async function main() {
  console.log('🔧 Database Fix Script for Synergies4\n');
  console.log('This script will fix user signup issues by:');
  console.log('1. Creating/updating required database functions');
  console.log('2. Setting up proper triggers for user creation');
  console.log('3. Ensuring all tables and permissions are correct');
  console.log('4. Testing the setup\n');
  
  await runDatabaseFix();
  
  console.log('\n✅ Database fix script completed!');
  console.log('You can now try creating a new account.');
}

main().catch(console.error);
