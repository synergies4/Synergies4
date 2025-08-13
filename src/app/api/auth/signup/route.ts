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
          name,
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
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    if (data.user) {
      // Log successful user creation - let database triggers handle the rest
      console.log('User successfully created in Supabase Auth:', {
        id: data.user.id,
        email: data.user.email,
        confirmed: data.user.email_confirmed_at ? 'confirmed' : 'pending'
      });
      
      // The database triggers should automatically create user and user_profile records
      // If they don't, that's a configuration issue to be fixed in the database setup

      // Send welcome email (but don't fail signup if email fails)
      try {
        await emailService.sendWelcomeEmail({
          email: data.user.email!,
          userName: name,
          loginLink: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
        });
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Continue anyway - don't fail signup because of email issues
      }

      return NextResponse.json(
        { 
          message: 'Account created successfully. Please check your email to verify your account.',
          user: {
            id: data.user.id,
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
    console.error('Signup API error:', error);
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