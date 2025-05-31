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
    const { id: courseId, moduleId } = params;
    const supabase = await createClient();

    const { data: module, error } = await supabase
      .from('course_modules')
      .select(`
        id,
        title,
        description,
        order_num,
        duration,
        video_url,
        content,
        resources,
        lessons (
          id,
          title,
          content,
          video_url,
          order_num,
          duration
        )
      `)
      .eq('id', moduleId)
      .eq('course_id', courseId)
      .single();

    if (error) {
      console.error('Error fetching module:', error);
      return NextResponse.json(
        { message: 'Module not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const { id: courseId, moduleId } = params;
    const data = await request.json();
    const { title, description, order, contents } = data;

    const supabase = await createClient();

    // Update the module
    const { error: moduleError } = await supabase
      .from('course_modules')
      .update({
        title,
        description,
        order_num: order,
      })
      .eq('id', moduleId)
      .eq('course_id', courseId);

    if (moduleError) {
      console.error('Error updating module:', moduleError);
      return NextResponse.json(
        { message: 'Error updating module: ' + moduleError.message },
        { status: 500 }
      );
    }

    // Delete existing lessons
    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('module_id', moduleId);

    if (deleteError) {
      console.error('Error deleting existing lessons:', deleteError);
      return NextResponse.json(
        { message: 'Error updating lessons: ' + deleteError.message },
        { status: 500 }
      );
    }

    // Create new lessons for each content item
    if (contents && contents.length > 0) {
      const lessons = contents.map((content: any, index: number) => ({
        module_id: moduleId,
        title: content.title,
        content: content.type === 'text' ? content.content : `[${content.type.toUpperCase()}] ${content.content}`,
        video_url: content.type === 'video' ? content.content : null,
        order_num: index + 1,
        duration: content.duration || null,
      }));

      const { error: lessonsError } = await supabase
        .from('lessons')
        .insert(lessons);

      if (lessonsError) {
        console.error('Error creating lessons:', lessonsError);
        return NextResponse.json(
          { message: 'Module updated but lessons failed: ' + lessonsError.message },
          { status: 500 }
        );
      }
    }

    // Return the updated module with its lessons
    const { data: updatedModule, error: fetchError } = await supabase
      .from('course_modules')
      .select(`
        id,
        title,
        description,
        order_num,
        lessons (
          id,
          title,
          content,
          video_url,
          order_num,
          duration
        )
      `)
      .eq('id', moduleId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated module:', fetchError);
      return NextResponse.json(
        { message: 'Module updated successfully' },
        { status: 200 }
      );
    }

    return NextResponse.json(updatedModule, { status: 200 });
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { id: courseId, moduleId } = params;
    const supabase = await createClient();

    // Delete lessons first (due to foreign key constraint)
    const { error: lessonsError } = await supabase
      .from('lessons')
      .delete()
      .eq('module_id', moduleId);

    if (lessonsError) {
      console.error('Error deleting lessons:', lessonsError);
      return NextResponse.json(
        { message: 'Error deleting lessons: ' + lessonsError.message },
        { status: 500 }
      );
    }

    // Delete the module
    const { error: moduleError } = await supabase
      .from('course_modules')
      .delete()
      .eq('id', moduleId)
      .eq('course_id', courseId);

    if (moduleError) {
      console.error('Error deleting module:', moduleError);
      return NextResponse.json(
        { message: 'Error deleting module: ' + moduleError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Module deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 