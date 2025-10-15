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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');
    const userId = searchParams.get('user_id');
    
    // Only require authentication if no filters are provided (user wants to see their own enrollments)
    let user = null;
    if (!courseId && !userId) {
      user = await getAuthenticatedUser(request);
      if (!user) {
        return NextResponse.json(
          { message: 'Authentication required to view your own enrollments' },
          { status: 401 }
        );
      }
    }
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '25');
    
    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json(
        { message: 'Page must be greater than 0' },
        { status: 400 }
      );
    }
    
    if (per_page < 1 || per_page > 100) {
      return NextResponse.json(
        { message: 'Per page must be between 1 and 100' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Build base query for counting total records
    let countQuery = supabase
      .from('course_enrollments')
      .select('id', { count: 'exact' });

    // Apply filters to count query
    if (courseId) {
      countQuery = countQuery.eq('course_id', courseId);
    } else if (userId) {
      countQuery = countQuery.eq('user_id', userId);
    } else {
      // If no filters, only count user's own enrollments (user is guaranteed to exist here)
      if (user) {
        countQuery = countQuery.eq('user_id', user.id);
      } else {
        // This should never happen due to the authentication check above
        return NextResponse.json(
          { message: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    // Get total count
    const { count: totalCount, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error counting enrollments:', countError);
      return NextResponse.json(
        { message: 'Error counting enrollments' },
        { status: 500 }
      );
    }

    // Calculate pagination values
    const totalCountNum = totalCount || 0;
    const offset = (page - 1) * per_page;
    const hasNext = offset + per_page < totalCountNum;
    const hasPrev = page > 1;

    // Build main query with pagination
    // Note: We fetch enrollments and their related course data
    // User data will be fetched separately because of the FK relationship mismatch
    let query = supabase
      .from('course_enrollments')
      .select(`
        id,
        user_id,
        status,
        enrolled_at,
        progress_percentage,
        completed_at,
        certificate_issued,
        payment_status,
        payment_amount,
        course:courses(
          id,
          title,
          description,
          image,
          category,
          level,
          duration,
          price
        )
      `)
      .order('enrolled_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply filters based on parameters
    if (courseId) {
      query = query.eq('course_id', courseId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else {
      // If no filters, only show user's own enrollments (user is guaranteed to exist here)
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        // This should never happen due to the authentication check above
        return NextResponse.json(
          { message: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    const { data: enrollments, error } = await query;

    if (error) {
      console.error('Error fetching enrollments:', error);
      return NextResponse.json(
        { message: 'Failed to fetch enrollments' },
        { status: 500 }
      );
    }

    const enrollmentsData = enrollments || [];
    
    // Fetch user data separately and merge it with enrollments
    // This is necessary because course_enrollments.user_id references auth.users.id (UUID)
    // but we need to join with public.users using auth_user_id
    const uniqueUserIds = [...new Set(enrollmentsData.map(e => e.user_id))];
    
    let usersMap: Record<string, any> = {};
    
    if (uniqueUserIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, auth_user_id, name, email, role, created_at')
        .in('auth_user_id', uniqueUserIds);
      
      if (!usersError && users) {
        // Create a map of auth_user_id -> user data
        users.forEach(u => {
          if (u.auth_user_id) {
            usersMap[u.auth_user_id] = u;
          }
        });
      } else {
        console.error('Error fetching users:', usersError);
      }
    }
    
    // Merge user data into enrollments
    const enrichedEnrollments = enrollmentsData.map(enrollment => ({
      ...enrollment,
      user: usersMap[enrollment.user_id] || null
    }));

    const countPage = enrichedEnrollments.length;

    return NextResponse.json({
      enrollments: enrichedEnrollments,
      pagination: {
        has_next: hasNext,
        has_prev: hasPrev,
        count_total: totalCountNum,
        count_queried: enrichedEnrollments.length,
        count_page: countPage,
        page: page,
        per_page: per_page,
        total_pages: Math.ceil(totalCountNum / per_page)
      },
      filters: {
        course_id: courseId,
        user_id: userId
      }
    });

  } catch (error) {
    console.error('Error in enrollments API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 