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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const courseId = params.id;
    const supabase = await createClient();

    const { data: modules, error } = await supabase
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
      .eq('course_id', courseId)
      .order('order_num', { ascending: true });

    if (error) {
      console.error('Error fetching modules:', error);
      return NextResponse.json(
        { message: 'Error fetching modules' },
        { status: 500 }
      );
    }

    return NextResponse.json(modules || []);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const courseId = params.id;
    const data = await request.json();
    const { title, description, order, contents } = data;

    const supabase = await createClient();

    // Create the module
    const { data: module, error: moduleError } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title,
        description,
        order_num: order,
      })
      .select()
      .single();

    if (moduleError) {
      console.error('Error creating module:', moduleError);
      return NextResponse.json(
        { message: 'Error creating module: ' + moduleError.message },
        { status: 500 }
      );
    }

    // Create lessons for each content item
    if (contents && contents.length > 0) {
      const lessons = contents.map((content: any, index: number) => ({
        module_id: module.id,
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
        // Module was created but lessons failed
        return NextResponse.json(
          { message: 'Module created but lessons failed: ' + lessonsError.message },
          { status: 500 }
        );
      }
    }

    // Return the module with its lessons
    const { data: moduleWithLessons, error: fetchError } = await supabase
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
      .eq('id', module.id)
      .single();

    if (fetchError) {
      console.error('Error fetching created module:', fetchError);
      return NextResponse.json(module, { status: 201 });
    }

    return NextResponse.json(moduleWithLessons, { status: 201 });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 