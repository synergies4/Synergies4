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

    // Fetch user's quiz attempts with course details
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select(`
        id,
        score,
        total_points,
        percentage,
        status,
        completed_at,
        time_taken_minutes,
        course:courses(
          id,
          title
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'COMPLETED')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz attempts:', error);
      return NextResponse.json(
        { message: 'Failed to fetch quiz attempts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      attempts: attempts || []
    });

  } catch (error) {
    console.error('Error in quiz attempts API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 