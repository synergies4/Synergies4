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
    const supabase = createClient();
    
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const courseId = params.id;
    const supabase = createClient();

    // First, get all modules for this course
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', courseId);

    if (!modules || modules.length === 0) {
      return NextResponse.json({
        progress: []
      });
    }

    const moduleIds = modules.map(m => m.id);

    // Then get all lessons for these modules
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds);

    if (!lessons || lessons.length === 0) {
      return NextResponse.json({
        progress: []
      });
    }

    const lessonIds = lessons.map(l => l.id);

    // Finally, get lesson progress for this user and these lessons
    const { data: progress, error } = await supabase
      .from('lesson_progress')
      .select(`
        id,
        lesson_id,
        status,
        started_at,
        completed_at,
        time_spent_minutes,
        lesson:lessons(
          id,
          title,
          module_id
        )
      `)
      .eq('user_id', user.id)
      .in('lesson_id', lessonIds);

    if (error) {
      console.error('Error fetching lesson progress:', error);
      return NextResponse.json(
        { message: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      progress: progress || []
    });

  } catch (error) {
    console.error('Error in progress API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 