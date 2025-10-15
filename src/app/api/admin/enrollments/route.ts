import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Check if user is admin
    const supabase = await createClient();
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData || userData.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all enrollments grouped by course
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        status,
        payment_status,
        payment_amount,
        enrolled_at,
        user_id,
        course_id,
        user:users(
          id,
          name,
          email
        ),
        course:courses(
          id,
          title,
          price
        )
      `)
      .order('enrolled_at', { ascending: false });

    if (enrollmentError) {
      console.error('Error fetching enrollments:', enrollmentError);
      return NextResponse.json(
        { message: 'Failed to fetch enrollments' },
        { status: 500 }
      );
    }

    // Group enrollments by course
    const courseEnrollments: { [key: string]: any[] } = {};
    const courseSummary: { [key: string]: any } = {};

    (enrollments || []).forEach((enrollment: any) => {
      const courseId = enrollment.course_id;
      
      if (!courseEnrollments[courseId]) {
        courseEnrollments[courseId] = [];
        courseSummary[courseId] = {
          course_id: courseId,
          course_title: enrollment.course?.title || 'Unknown Course',
          course_price: enrollment.course?.price || 0,
          total_enrollments: 0,
          total_revenue: 0
        };
      }
      
      courseEnrollments[courseId].push(enrollment);
      courseSummary[courseId].total_enrollments += 1;
      courseSummary[courseId].total_revenue += enrollment.payment_amount || 0;
    });

    // Convert to array format
    const result = Object.keys(courseSummary).map(courseId => ({
      ...courseSummary[courseId],
      enrollments: courseEnrollments[courseId]
    }));

    // Sort by total revenue descending
    result.sort((a, b) => b.total_revenue - a.total_revenue);

    return NextResponse.json({
      message: 'Success',
      enrollments: result,
      total_courses: result.length,
      total_enrollments: (enrollments || []).length
    });

  } catch (error) {
    console.error('Error fetching admin enrollments:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
