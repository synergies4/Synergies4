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
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return null;

    const { data: userData } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) return null;

    return { id: userData.id, email: user.email, role: userData.role || 'USER' };
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const courseId = params.id;
    const user = await getAuthenticatedUser(request);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch the source course with modules and lessons
    const { data: course, error: courseError } = await supabase
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
        featured,
        course_modules:course_modules (
          id,
          title,
          description,
          order_num,
          lessons:lessons (
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

    if (courseError || !course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const requestBody = await request.json().catch(() => ({}));
    const { newTitle, newStatus, newStartDate } = requestBody || {};

    // Create the duplicated course (as draft by default)
    const { data: newCourse, error: insertError } = await supabase
      .from('courses')
      .insert({
        title: newTitle || `Copy of ${course.title}`,
        description: course.description,
        short_desc: course.short_desc,
        image: course.image,
        price: course.price,
        category: course.category,
        level: course.level,
        duration: newStartDate ? newStartDate : course.duration,
        featured: course.featured,
        status: newStatus || 'DRAFT',
      })
      .select()
      .single();

    if (insertError || !newCourse) {
      return NextResponse.json(
        { message: 'Failed to create duplicated course' },
        { status: 500 }
      );
    }

    const newCourseId = newCourse.id;

    // Duplicate modules
    const moduleIdMap: Record<string, string> = {};
    if (course.course_modules && course.course_modules.length > 0) {
      for (const mod of course.course_modules) {
        const { data: newModule, error: modError } = await supabase
          .from('course_modules')
          .insert({
            course_id: newCourseId,
            title: mod.title,
            description: mod.description,
            order_num: mod.order_num,
          })
          .select()
          .single();

        if (modError || !newModule) continue;
        moduleIdMap[mod.id] = newModule.id;

        // Duplicate lessons for this module
        if (mod.lessons && mod.lessons.length > 0) {
          for (const lesson of mod.lessons) {
            await supabase
              .from('lessons')
              .insert({
                module_id: newModule.id,
                title: lesson.title,
                content: lesson.content,
                video_url: lesson.video_url,
                order_num: lesson.order_num,
              });
          }
        }
      }
    }

    return NextResponse.json({ message: 'Course duplicated', course: newCourse });
  } catch (error) {
    console.error('Duplicate course error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}


