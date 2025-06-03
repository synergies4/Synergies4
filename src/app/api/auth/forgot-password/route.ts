import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    const supabase = await createClient();

    // Use Supabase's built-in password reset functionality
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: 'If an account with this email exists, you will receive a password reset link.' },
        { status: 200 }
      );
    }

    // Send custom email using our email service
    try {
      // Get user data to personalize the email
      const { data: userData } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('email', email)
        .single();

      const userName = userData ? `${userData.first_name} ${userData.last_name}`.trim() : undefined;

      // Send our custom password reset email
      await emailService.sendPasswordReset({
        email,
        resetLink: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?email=${encodeURIComponent(email)}`,
        userName,
      });
    } catch (emailError) {
      console.error('Error sending custom reset email:', emailError);
      // Still return success even if custom email fails
    }

    return NextResponse.json(
      { message: 'If an account with this email exists, you will receive a password reset link.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 