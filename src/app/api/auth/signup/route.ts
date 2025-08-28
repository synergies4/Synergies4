import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  console.log('🚀 Signup API called');
  
  try {
    const body = await request.json();
    console.log('📝 Request body received:', { email: body.email, name: body.name, hasPassword: !!body.password });
    
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password || !name) {
      console.log('❌ Missing required fields:', { email: !!email, password: !!password, name: !!name });
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    console.log('🔧 Creating Supabase client...');
    const supabase = await createClient();
    console.log('✅ Supabase client created');

    // Create user with Supabase Auth
    console.log('👤 Calling supabase.auth.signUp...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });
    console.log('📊 Supabase signup result:', { 
      hasUser: !!data.user, 
      userId: data.user?.id, 
      hasError: !!error,
      errorMessage: error?.message 
    });

    if (error) {
      console.error('Supabase signup error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('already registered')) {
        errorMessage = 'An account with this email already exists. Please try signing in instead.';
      } else if (error.message.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message.includes('weak password')) {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.message.includes('signup disabled')) {
        errorMessage = 'Account creation is temporarily disabled. Please try again later.';
      } else if (error.message.includes('Database error')) {
        errorMessage = 'Account creation failed due to a database error. Please try again or contact support.';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    if (data.user) {
      // Log successful user creation - let database triggers handle the rest
      console.log('✅ User successfully created in Supabase Auth:', {
        id: data.user.id,
        email: data.user.email,
        confirmed: data.user.email_confirmed_at ? 'confirmed' : 'pending'
      });
      
      let userData = null;
      
      // Verify that the database trigger created the user records
      try {
        console.log('🔍 Verifying database records were created...');
        
        // Check if user record was created
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select('id, email, name, role')
          .eq('auth_user_id', data.user.id)
          .single();
          
        if (userError) {
          console.error('❌ Error checking user record:', userError);
          console.log('🔄 Database trigger failed, creating user records manually...');
          
          // Manual fallback: Create user records if trigger failed
          try {
            // Insert into users table (short ID will be auto-generated)
            const { data: newUser, error: insertUserError } = await supabase
              .from('users')
              .insert({
                auth_user_id: data.user.id,
                email: data.user.email,
                name: name
              })
              .select()
              .single();
              
            if (insertUserError) {
              console.error('❌ Error creating user record manually:', insertUserError);
            } else {
              console.log('✅ User record created manually:', newUser);
              userData = newUser;
              
              // Create user profile
              const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                  user_id: newUser.id,
                  full_name: name
                });
                
              if (profileError) {
                console.error('❌ Error creating user profile manually:', profileError);
              } else {
                console.log('✅ User profile created manually');
              }
              
              // Create user content settings
              const { error: settingsError } = await supabase
                .from('user_content_settings')
                .insert({
                  user_id: newUser.id
                });
                
              if (settingsError) {
                console.error('❌ Error creating user content settings manually:', settingsError);
              } else {
                console.log('✅ User content settings created manually');
              }
            }
          } catch (manualError) {
            console.error('❌ Error in manual user creation:', manualError);
          }
        } else {
          console.log('✅ User record created by trigger:', userRecord);
          userData = userRecord;
          
          // Check if user profile was created
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, user_id, full_name')
            .eq('user_id', userData?.id)
            .single();
            
          if (profileError) {
            console.error('❌ Error checking user profile:', profileError);
          } else {
            console.log('✅ User profile created:', profileData);
          }
          
          // Check if user content settings were created
          const { data: settingsData, error: settingsError } = await supabase
            .from('user_content_settings')
            .select('id, user_id, max_presentations, max_conversations')
            .eq('user_id', userData?.id)
            .single();
            
          if (settingsError) {
            console.error('❌ Error checking user content settings:', settingsError);
          } else {
            console.log('✅ User content settings created:', settingsData);
          }
        }
        
      } catch (verificationError) {
        console.error('❌ Error during database verification:', verificationError);
        // Don't fail signup if verification fails - the trigger might still have worked
      }

      // Send welcome email (but don't fail signup if email fails)
      try {
        await emailService.sendWelcomeEmail({
          email: data.user.email!,
          userName: name,
          loginLink: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
        });
        console.log('✅ Welcome email sent successfully');
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError);
        // Continue anyway - don't fail signup because of email issues
      }

      return NextResponse.json(
        { 
          message: 'Account created successfully. Please check your email to verify your account.',
          user: {
            id: userData?.id || data.user.id, // Use the generated user ID from our table, fallback to auth user ID
            auth_user_id: data.user.id, // Include the auth user ID for reference
            email: data.user.email,
            name: name
          }
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  } catch (error) {
    console.error('❌ Signup API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { error: `Database error saving new user: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 