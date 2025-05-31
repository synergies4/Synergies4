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

export async function POST(
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

    const lessonId = params.id;
    const supabase = await createClient();

    // Get lesson details to find the course
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        module:course_modules(
          id,
          course_id
        )
      `)
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { message: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled in the course
    const moduleData = Array.isArray(lesson.module) ? lesson.module[0] : lesson.module;
    const courseId = moduleData?.course_id;

    if (!courseId) {
      return NextResponse.json(
        { message: 'Course not found for this lesson' },
        { status: 404 }
      );
    }

    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'ACTIVE')
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { message: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Update or create lesson progress
    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

    if (existingProgress) {
      // Update existing progress
      const { error: updateError } = await supabase
        .from('lesson_progress')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id);

      if (updateError) {
        console.error('Error updating lesson progress:', updateError);
        return NextResponse.json(
          { message: 'Failed to update progress' },
          { status: 500 }
        );
      }
    } else {
      // Create new progress record
      const { error: insertError } = await supabase
        .from('lesson_progress')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          enrollment_id: enrollment.id,
          status: 'COMPLETED',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating lesson progress:', insertError);
        return NextResponse.json(
          { message: 'Failed to create progress' },
          { status: 500 }
        );
      }
    }

    // Update overall course progress
    await updateCourseProgress(supabase, user.id, courseId, enrollment.id);

    return NextResponse.json({
      message: 'Lesson marked as complete',
      lessonId,
      status: 'COMPLETED'
    });

  } catch (error) {
    console.error('Error completing lesson:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateCourseProgress(
  supabase: any,
  userId: string,
  courseId: string,
  enrollmentId: string
) {
  try {
    // Get all modules for this course
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', courseId);

    if (!modules || modules.length === 0) return;

    const moduleIds = modules.map((m: any) => m.id);

    // Get total lessons in course
    const { data: totalLessons } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds);

    // Get all lessons for these modules
    const { data: allLessons } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds);

    if (!allLessons || allLessons.length === 0) return;

    const lessonIds = allLessons.map((l: any) => l.id);

    // Get completed lessons for this user
    const { data: completedLessons } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'COMPLETED')
      .in('lesson_id', lessonIds);

    const totalCount = totalLessons?.length || 0;
    const completedCount = completedLessons?.length || 0;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Update enrollment progress
    const updateData: any = {
      progress_percentage: progressPercentage,
      updated_at: new Date().toISOString()
    };

    // If 100% complete, mark as completed
    if (progressPercentage === 100) {
      updateData.status = 'COMPLETED';
      updateData.completed_at = new Date().toISOString();
    }

    await supabase
      .from('course_enrollments')
      .update(updateData)
      .eq('id', enrollmentId);

  } catch (error) {
    console.error('Error updating course progress:', error);
    // Don't throw error as lesson completion was successful
  }
} 