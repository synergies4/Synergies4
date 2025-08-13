import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header found');
      return null;
    }

    const token = authHeader.substring(7);
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.log('User auth failed:', error?.message);
      return null;
    }

    // Get user data from user_profiles table (more reliable)
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('role, name')
      .eq('user_id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      name: userData?.name || user.user_metadata?.name || user.email,
      role: userData?.role || 'USER'
    };
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

    const courseId = params.id;
    const supabase = await createClient();

    // Check if course exists and is published
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price, status')
      .eq('id', courseId)
      .eq('status', 'PUBLISHED')
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { message: 'Course not found or not available for enrollment' },
        { status: 404 }
      );
    }

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('course_enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      if (existingEnrollment.status === 'ACTIVE') {
        return NextResponse.json(
          { message: 'Already enrolled in this course' },
          { status: 400 }
        );
      } else if (existingEnrollment.status === 'COMPLETED') {
        return NextResponse.json(
          { message: 'Course already completed' },
          { status: 400 }
        );
      }
    }

    // Create enrollment
    const enrollmentData = {
      user_id: user.id,
      course_id: courseId,
      status: 'ACTIVE',
      payment_status: course.price && course.price > 0 ? 'PENDING' : 'PAID',
      payment_amount: course.price || 0,
      enrolled_at: new Date().toISOString()
    };

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .insert(enrollmentData)
      .select(`
        id,
        status,
        enrolled_at,
        progress_percentage,
        payment_status,
        payment_amount,
        course:courses(
          id,
          title,
          description,
          image,
          category,
          level,
          duration
        )
      `)
      .single();

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError);
      return NextResponse.json(
        { message: 'Failed to enroll in course: ' + enrollmentError.message },
        { status: 500 }
      );
    }

    // If it's a free course, initialize lesson progress
    if (!course.price || course.price === 0) {
      await initializeLessonProgress(supabase, user.id, courseId, enrollment.id);
    }

    return NextResponse.json({
      message: 'Successfully enrolled in course',
      enrollment,
      requiresPayment: course.price && course.price > 0
    }, { status: 201 });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to initialize lesson progress for enrolled users
async function initializeLessonProgress(
  supabase: any,
  userId: string,
  courseId: string,
  enrollmentId: string
) {
  try {
    // Get all lessons for the course
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId)
      );

    if (lessons && lessons.length > 0) {
      const progressEntries = lessons.map((lesson: any) => ({
        user_id: userId,
        lesson_id: lesson.id,
        enrollment_id: enrollmentId,
        status: 'NOT_STARTED'
      }));

      await supabase
        .from('lesson_progress')
        .insert(progressEntries);
    }
  } catch (error) {
    console.error('Error initializing lesson progress:', error);
    // Don't throw error as enrollment was successful
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
    const supabase = await createClient();

    // Get user's enrollment status for this course
    const { data: enrollment, error } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        status,
        enrolled_at,
        progress_percentage,
        payment_status,
        payment_amount,
        completed_at,
        certificate_issued
      `)
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching enrollment:', error);
      return NextResponse.json(
        { message: 'Error checking enrollment status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      enrolled: !!enrollment,
      enrollment: enrollment || null
    });

  } catch (error) {
    console.error('Error checking enrollment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 