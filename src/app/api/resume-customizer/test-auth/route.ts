import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Test auth endpoint called');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('User error:', userError);
    console.log('User data:', user ? { id: user.id, email: user.email } : null);
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        userError: userError?.message || 'No user',
        user: null
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      message: 'Authentication working'
    });

  } catch (error) {
    console.error('Error in test auth:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 