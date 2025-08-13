import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password || !name) {
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

    const supabase = await createClient();

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
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
      // Ensure user records are created in our custom tables
      // (Database triggers should handle this, but let's be defensive)
      try {
        const userId = data.user.id;
        const userEmail = data.user.email!;
        
        // Check if user already exists in our users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();
        
        if (!existingUser) {
          console.log('Creating user record in users table for:', userEmail);
          
          // Create user record
          const { error: userInsertError } = await supabase
            .from('users')
            .insert([{
              id: userId,
              email: userEmail,
              name: name,
              role: 'USER'
            }]);
          
          if (userInsertError) {
            console.error('Error creating user record:', userInsertError);
            // Don't fail the signup, but log the error
          }
        }
        
        // Check if user profile exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();
        
        if (!existingProfile) {
          console.log('Creating user profile for:', userEmail);
          
          // Create user profile record  
          const { error: profileInsertError } = await supabase
            .from('user_profiles')
            .insert([{
              user_id: userId,
              name: name,
              role: 'USER'
            }]);
          
          if (profileInsertError) {
            console.error('Error creating user profile:', profileInsertError);
            // Don't fail the signup, but log the error
          }
        }
      } catch (dbError) {
        console.error('Error ensuring user records exist:', dbError);
        // Continue anyway - the auth user was created successfully
      }

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 