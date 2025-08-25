const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual Supabase credentials
const supabaseUrl = 'https://trgrhwzhgmdhbucesodf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZ3Jod3poZ21kaGJ1Y2Vzb2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1MDkyNCwiZXhwIjoyMDcxMjI2OTI0fQ.1TqEVC-U177Z79yP3buWuDVV1wq2MF-GviPbTJYR3J0';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  try {
    const email = 'admin@synergies4.com';
    const password = 'admin123';

    console.log('🔧 Creating admin user in Supabase...');
    console.log('Email:', email);
    console.log('Password:', password);

    // Check if admin already exists in auth.users
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }

    const existingAdmin = existingUsers.users.find(user => user.email === email);

    if (existingAdmin) {
      console.log('✅ Admin user already exists in Supabase Auth!');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('User ID:', existingAdmin.id);
      
      // Check if admin record exists in public.users table
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', existingAdmin.id)
        .single();
      
      if (publicError) {
        console.log('⚠️  Admin user not found in public.users table');
      } else {
        console.log('✅ Admin user found in public.users table');
        console.log('Role:', publicUser.role);
      }
      
      return;
    }

    // Create admin user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: 'Admin User'
      }
    });

    if (authError) {
      console.error('❌ Error creating admin user in Auth:', authError);
      return;
    }

    console.log('✅ Admin user created successfully in Supabase Auth!');
    console.log('User ID:', authData.user.id);

    // Wait a moment for the trigger to create the public user record
    console.log('⏳ Waiting for trigger to create public user record...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if the trigger created the public user record
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (publicError) {
      console.log('⚠️  Trigger may not have created public user record, creating manually...');
      
      // Manually create the public user record with admin role
      const { error: insertError } = await supabase
        .from('users')
        .upsert({
          auth_user_id: authData.user.id,
          email: email,
          name: 'Admin User',
          role: 'ADMIN'
        });

      if (insertError) {
        console.error('❌ Error creating public user record:', insertError);
      } else {
        console.log('✅ Public user record created manually');
      }
    } else {
      console.log('✅ Public user record created by trigger');
      
      // Update the role to ADMIN if it's not already
      if (publicUser.role !== 'ADMIN') {
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'ADMIN' })
          .eq('auth_user_id', authData.user.id);

        if (updateError) {
          console.error('❌ Error updating user role to ADMIN:', updateError);
        } else {
          console.log('✅ User role updated to ADMIN');
        }
      }
    }

    console.log('\n🎉 Admin user setup completed!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role: ADMIN');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdmin(); 