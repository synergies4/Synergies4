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
  context: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const params = await context.params;
    const { moduleId } = params;
    const supabase = await createClient();

    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_num', { ascending: true });

    if (error) {
      console.error('Error fetching lessons:', error);
      return NextResponse.json(
        { message: 'Error fetching lessons' },
        { status: 500 }
      );
    }

    return NextResponse.json(lessons || []);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; moduleId: string }> }
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

    const { moduleId } = params;
    const data = await request.json();
    const { title, content, video_url, duration } = data;

    const supabase = await createClient();

    // Get the next order number
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('order_num')
      .eq('module_id', moduleId)
      .order('order_num', { ascending: false })
      .limit(1);

    const nextOrder = existingLessons && existingLessons.length > 0 
      ? existingLessons[0].order_num + 1 
      : 1;

    // Create the lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        module_id: moduleId,
        title,
        content,
        video_url,
        order_num: nextOrder,
        duration,
      })
      .select()
      .single();

    if (lessonError) {
      console.error('Error creating lesson:', lessonError);
      return NextResponse.json(
        { message: 'Error creating lesson: ' + lessonError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 