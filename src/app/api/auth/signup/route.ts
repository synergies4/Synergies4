import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    console.log('✅ Basic validation passed');

    // Create user in Supabase Auth
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      console.error('❌ No user returned from Supabase');
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    console.log('✅ User created in Supabase Auth:', authData.user.id);

    // Create user profile in our users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        name: name,
        email: email,
        role: 'USER'
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError);
      // Don't fail the signup if profile creation fails - user is still created in auth
      console.warn('⚠️ User created in auth but profile creation failed');
    } else {
      console.log('✅ User profile created:', profileData.id);
    }
    
    return NextResponse.json(
      { 
        message: 'Account created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name
        },
        needsConfirmation: !authData.user.email_confirmed_at
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Signup API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { error: `API error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 