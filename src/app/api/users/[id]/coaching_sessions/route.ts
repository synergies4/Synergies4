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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;
    const supabase = await createClient();

    // Verify the user is requesting their own data or is an admin
    const { data: userData } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is requesting their own data or is admin
    if (userData.id !== userId && userData.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get coaching sessions with pagination
    const { data: coachingSessions, error: sessionsError, count } = await supabase
      .from('user_coaching_sessions')
      .select(`
        id,
        user_id,
        session_type,
        context_data,
        session_goal,
        messages,
        session_summary,
        key_insights,
        action_items,
        user_satisfaction,
        session_rating,
        follow_up_needed,
        follow_up_date,
        duration_minutes,
        session_status,
        started_at,
        ended_at,
        created_at
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (sessionsError) {
      console.error('Error fetching coaching sessions:', sessionsError);
      return NextResponse.json(
        { message: 'Error fetching coaching sessions' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      coaching_sessions: coachingSessions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      },
      success: true
    });

  } catch (error) {
    console.error('Error fetching coaching sessions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
