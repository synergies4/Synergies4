const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Your Supabase credentials
const supabaseUrl = 'https://trgrhwzhgmdhbucesodf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZ3Jod3poZ21kaGJ1Y2Vzb2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1MDkyNCwiZXhwIjoyMDcxMjI2OTI0fQ.1TqEVC-U177Z79yP3buWuDVV1wq2MF-GviPbTJYR3J0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabase() {
  console.log('🔧 Running database fix...\n');
  
  try {
    // Read the SQL fix file
    const sqlFilePath = path.join(__dirname, '..', 'sql', 'quick-fix-auth.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQL file loaded successfully');
    console.log('🔧 Executing database fixes...\n');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('SELECT'));
    
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
    
    console.log('\n✅ Database fix completed!');
    console.log('You can now try creating the admin user again.');
    
  } catch (error) {
    console.error('❌ Error running database fix:', error);
    console.log('\n💡 Alternative: Run the SQL manually in your Supabase dashboard');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of sql/quick-fix-auth.sql');
    console.log('4. Click Run');
  }
}

fixDatabase().catch(console.error);


