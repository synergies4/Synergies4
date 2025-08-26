import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No Bearer token found' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = await createClient();
    
    // Get auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Auth error', details: authError }, { status: 401 });
    }

    // Get user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (userError) {
      return NextResponse.json({ 
        error: 'User table error', 
        details: userError,
        authUser: { id: user.id, email: user.email }
      }, { status: 500 });
    }

    if (!userData) {
      return NextResponse.json({ 
        error: 'User not found in users table',
        authUser: { id: user.id, email: user.email }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      authUser: { id: user.id, email: user.email },
      userData: userData,
      isAdmin: userData.role === 'ADMIN'
    });

  } catch (error) {
    return NextResponse.json({ error: 'Server error', details: error }, { status: 500 });
  }
}
