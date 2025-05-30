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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const courseId = params.id;

    const supabase = createClient();
    
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        short_desc,
        image,
        price,
        category,
        level,
        duration,
        status,
        featured,
        created_at,
        course_modules (
          id,
          title,
          description,
          order_num,
          lessons (
            id,
            title,
            content,
            video_url,
            order_num
          )
        )
      `)
      .eq('id', courseId)
      .single();

    if (error || !course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const data = await request.json();
    const {
      title,
      description,
      short_desc,
      image,
      price,
      category,
      level,
      duration,
      featured,
      status,
    } = data;

    const supabase = createClient();

    const { data: course, error } = await supabase
      .from('courses')
      .update({
        title,
        description,
        short_desc,
        image,
        price: price ? parseFloat(price) : null,
        category,
        level,
        duration,
        featured,
        status,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating course:', error);
      return NextResponse.json(
        { message: 'Error updating course: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const supabase = createClient();

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting course:', error);
      return NextResponse.json(
        { message: 'Error deleting course: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 