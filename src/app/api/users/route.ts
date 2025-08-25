import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get user data from users table (includes role)
    // Using RPC to bypass RLS recursion issue
    const { data: userData, error: userError } = await supabase
      .rpc('get_user_by_auth_id', { auth_user_uuid: user.id });

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { message: 'Error fetching user data' },
        { status: 500 }
      );
    }

    if (!userData) {
      return NextResponse.json(
        { message: 'User not found in database' },
        { status: 404 }
      );
    }

    // Get user profile data using RPC to bypass RLS
    const { data: userProfile, error: profileError } = await supabase
      .rpc('get_user_profile_by_auth_id', { auth_user_uuid: user.id });

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching user profile:', profileError);
    }

    // Get user's enrollments count using RPC
    const { data: enrollmentsCount, error: enrollmentsError } = await supabase
      .rpc('get_user_enrollments_count', { user_uuid: user.id });

    if (enrollmentsError) {
      console.error('Error fetching enrollments count:', enrollmentsError);
    }

    // Get user's learning progress using RPC
    const { data: learningProgress, error: progressError } = await supabase
      .rpc('get_user_learning_progress', { user_uuid: user.id });

    if (progressError) {
      console.error('Error fetching learning progress:', progressError);
    }

    // Get user's content settings using RPC
    const { data: contentSettings, error: settingsError } = await supabase
      .rpc('get_user_content_settings', { user_uuid: user.id });

    if (settingsError) {
      console.error('Error fetching content settings:', settingsError);
    }

    // Get coaching sessions count using RPC
    const { data: coachingSessionsCount, error: sessionsCountError } = await supabase
      .rpc('get_user_coaching_sessions_count', { user_uuid: user.id });

    if (sessionsCountError) {
      console.error('Error fetching coaching sessions count:', sessionsCountError);
    }

    // Compile user data in the requested structure
    const userResponse = {
      id: userData[0]?.id,
      auth_user_id: userData[0]?.auth_user_id,
      email: userData[0]?.email,
      name: userData[0]?.name,
      role: userData[0]?.role,
      created_at: userData[0]?.created_at,
      updated_at: userData[0]?.updated_at,
      email_verified: user.email_confirmed_at ? true : false,
      phone: user.phone,
      last_sign_in: user.last_sign_in_at,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
      enrollments_count: enrollmentsCount || 0,
      is_admin: userData[0]?.role === 'ADMIN',
      is_instructor: userData[0]?.role === 'INSTRUCTOR',
      can_access_admin: userData[0]?.role === 'ADMIN' || userData[0]?.role === 'INSTRUCTOR',
      profile: userProfile?.[0] || null,
      content_settings: contentSettings?.[0] || null,
      learning_progress: learningProgress || [],
      coaching_sessions: {
        hasMany: true,
        count: coachingSessionsCount || 0,
        endpoint: `/api/users/${userData[0]?.id}/coaching_sessions`
      }
    };

    return NextResponse.json({ 
      user: userResponse,
      success: true 
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
