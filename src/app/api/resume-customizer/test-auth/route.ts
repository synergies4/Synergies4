import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Test auth endpoint called');
    
    const supabase = await createClient();
    
    // Get current user
    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;
    
    console.log('User error:', userError);
    console.log('User data:', data);
    console.log('User:', user ? { id: user.id, email: user.email } : null);
    
    if (userError) {
      console.log('Detailed error:', {
        name: userError.name,
        message: userError.message,
        status: userError.status
      });
    }
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        userError: userError?.message || 'No user',
        user: null,
        errorDetails: userError ? {
          name: userError.name,
          message: userError.message,
          status: userError.status
        } : null
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      message: 'Authentication working - using new server client'
    });

  } catch (error) {
    console.error('Error in test auth:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 