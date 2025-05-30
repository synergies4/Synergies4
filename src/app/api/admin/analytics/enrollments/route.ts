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

    // Get user data to check role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      role: userData?.role || 'USER'
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const supabase = createClient();

    // Get total enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select('id, payment_amount, status, user_id')
      .eq('payment_status', 'PAID');

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return NextResponse.json(
        { message: 'Failed to fetch enrollment data' },
        { status: 500 }
      );
    }

    // Calculate stats
    const totalEnrollments = enrollments?.length || 0;
    const uniqueStudents = new Set(enrollments?.map(e => e.user_id)).size;
    const totalRevenue = enrollments?.reduce((sum, e) => sum + (e.payment_amount || 0), 0) || 0;
    const completedEnrollments = enrollments?.filter(e => e.status === 'COMPLETED').length || 0;
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    // Get quiz attempts for average score
    const { data: quizAttempts, error: quizError } = await supabase
      .from('quiz_attempts')
      .select('percentage')
      .eq('status', 'COMPLETED');

    const averageQuizScore = quizAttempts && quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / quizAttempts.length)
      : 0;

    // Get recent enrollments for trend data
    const { data: recentEnrollments, error: recentError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        enrolled_at,
        course:courses(title),
        user:users(name, email)
      `)
      .order('enrolled_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      totalEnrollments,
      totalStudents: uniqueStudents,
      totalRevenue,
      completionRate,
      averageQuizScore,
      recentEnrollments: recentEnrollments || []
    });

  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 