import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Test auth endpoint called');
    console.log('Request URL:', request.url);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    console.log('Available cookies:', allCookies.map(c => ({ 
      name: c.name, 
      value: c.value?.substring(0, 20) + '...',
      hasValue: !!c.value 
    })));
    
    // Check for specific Supabase cookies
    const accessToken = cookieStore.get('sb-access-token');
    const refreshToken = cookieStore.get('sb-refresh-token');
    const authToken = cookieStore.get('supabase-auth-token');
    
    console.log('Supabase cookies found:', {
      accessToken: !!accessToken?.value,
      refreshToken: !!refreshToken?.value,
      authToken: !!authToken?.value
    });
    
    const supabase = createRouteHandlerClient({ cookies });
    
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
        debug: {
          hasAccessToken: !!accessToken?.value,
          hasRefreshToken: !!refreshToken?.value,
          hasAuthToken: !!authToken?.value,
          cookieCount: allCookies.length,
          errorDetails: userError ? {
            name: userError.name,
            message: userError.message,
            status: userError.status
          } : null
        }
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      message: 'Authentication working',
      debug: {
        hasAccessToken: !!accessToken?.value,
        hasRefreshToken: !!refreshToken?.value,
        hasAuthToken: !!authToken?.value,
        cookieCount: allCookies.length
      }
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