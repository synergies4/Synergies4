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

    // Get user data to check role (role is stored in users table)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      role: userData?.role || 'USER'
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; moduleId: string; lessonId: string }> }
) {
  try {
    const params = await context.params;
    const { moduleId, lessonId } = params;
    const supabase = createClient();

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .eq('module_id', moduleId)
      .single();

    if (error) {
      console.error('Error fetching lesson:', error);
      return NextResponse.json(
        { message: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; moduleId: string; lessonId: string }> }
) {
  try {
    const params = await context.params;
    const user = await getAuthenticatedUser(request);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { moduleId, lessonId } = params;
    const data = await request.json();
    const { title, content, video_url, duration } = data;

    const supabase = createClient();

    // Update the lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .update({
        title,
        content,
        video_url,
        duration,
      })
      .eq('id', lessonId)
      .eq('module_id', moduleId)
      .select()
      .single();

    if (lessonError) {
      console.error('Error updating lesson:', lessonError);
      return NextResponse.json(
        { message: 'Error updating lesson: ' + lessonError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; moduleId: string; lessonId: string }> }
) {
  try {
    const params = await context.params;
    const user = await getAuthenticatedUser(request);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { moduleId, lessonId } = params;
    const supabase = createClient();

    // Delete the lesson
    const { error: lessonError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)
      .eq('module_id', moduleId);

    if (lessonError) {
      console.error('Error deleting lesson:', lessonError);
      return NextResponse.json(
        { message: 'Error deleting lesson: ' + lessonError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Lesson deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 