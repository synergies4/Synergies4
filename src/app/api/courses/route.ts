import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found');
      return null;
    }

    const token = authHeader.substring(7);
    console.log('🔑 Token extracted:', token.substring(0, 20) + '...');
    
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.log('❌ Auth error or no user:', error);
      return null;
    }

    console.log('✅ Auth user found:', { id: user.id, email: user.email });

    // Get user data to check role (role is stored in users table)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (userError) {
      console.log('❌ Error fetching user data:', userError);
      return null;
    }

    if (!userData) {
      console.log('❌ User not found in users table for auth_user_id:', user.id);
      return null;
    }

    console.log('✅ User data found:', userData);

    return {
      id: userData.id, // Use the TEXT id from users table, not the UUID from auth
      email: user.email,
      role: userData.role || 'USER'
    };
  } catch (error) {
    console.error('💥 Auth error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const featured = searchParams.get('featured');
    const userId = searchParams.get('user_id');
    const statusFilter = searchParams.get('status');
    
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

    // Check if user is requesting their own courses or is an admin
    let authenticatedUser = null;
    let isOwnCourses = false;
    let isAdmin = false;
    
    // Always try to get authenticated user to check admin status
    authenticatedUser = await getAuthenticatedUser(request);
    
    if (authenticatedUser) {
      isAdmin = authenticatedUser.role === 'ADMIN';
      console.log('👤 Authenticated user:', { id: authenticatedUser.id, role: authenticatedUser.role });
    }
    
    if (userId) {
      // User is requesting specific user's courses
      if (authenticatedUser && authenticatedUser.id === userId) {
        isOwnCourses = true;
        console.log('✅ User requesting their own courses');
      } else if (isAdmin) {
        isOwnCourses = true;
        console.log('✅ Admin requesting courses for user:', userId);
      } else if (authenticatedUser) {
        console.log('❌ User not authorized to view courses for user:', userId);
        return NextResponse.json(
          { message: 'Unauthorized - You can only view your own courses' },
          { status: 403 }
        );
      } else {
        console.log('❌ No authentication provided for user-specific request');
        return NextResponse.json(
          { message: 'Authentication required to view user-specific courses' },
          { status: 401 }
        );
      }
    } else if (isAdmin) {
      // Admin requesting all courses (no user_id specified)
      isOwnCourses = true;
      console.log('✅ Admin requesting all courses');
    }

    const supabase = await createClient();
    
    // First, let's check if the courses table exists and has data
    const { data: tableCheck, error: tableError } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Table check error:', tableError);
      // If table doesn't exist or has RLS issues, return empty array with pagination
      return NextResponse.json({ 
        courses: [],
        pagination: {
          has_next: false,
          has_prev: false,
          count_total: 0,
          count_queried: 0,
          count_page: 0
        }
      });
    }
    
    // Build base query for counting total records
    let countQuery = supabase
      .from('courses')
      .select('id', { count: 'exact' });

    // Apply status filter based on context
    if (isOwnCourses) {
      // User is requesting their own courses - show all statuses
      if (statusFilter && statusFilter !== 'ANY') {
        countQuery = countQuery.eq('status', statusFilter);
      }
      // If status is 'ANY' or not specified, don't filter by status
    } else {
      // Public request - only show published courses
      countQuery = countQuery.eq('status', 'PUBLISHED');
    }

    // Apply user filter if specified
    if (userId) {
      countQuery = countQuery.eq('instructor_id', userId);
    }

    // Apply other filters to count query
    if (category) {
      countQuery = countQuery.eq('category', category);
    }
    if (level) {
      countQuery = countQuery.eq('level', level);
    }
    if (featured === 'true') {
      countQuery = countQuery.eq('featured', true);
    }

    // Get total count
    const { count: totalCount, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json(
        { message: 'Error counting courses' },
        { status: 500 }
      );
    }

    // Calculate pagination values
    const totalCountNum = totalCount || 0;
    const offset = (page - 1) * per_page;
    const hasNext = offset + per_page < totalCountNum;
    const hasPrev = page > 1;
    
    // Build main query with pagination
    let query = supabase
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
        instructor_id,
        created_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply status filter based on context
    if (isOwnCourses) {
      // User is requesting their own courses - show all statuses
      if (statusFilter && statusFilter !== 'ANY') {
        query = query.eq('status', statusFilter);
      }
      // If status is 'ANY' or not specified, don't filter by status
    } else {
      // Public request - only show published courses
      query = query.eq('status', 'PUBLISHED');
    }

    // Apply user filter if specified
    if (userId) {
      query = query.eq('instructor_id', userId);
    }

    // Apply other filters
    if (category) {
      query = query.eq('category', category);
    }
    if (level) {
      query = query.eq('level', level);
    }
    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data: courses, error } = await query;

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json(
        { message: 'Error fetching courses' },
        { status: 500 }
      );
    }

    const coursesData = courses || [];
    const countPage = coursesData.length;

    return NextResponse.json({ 
      courses: coursesData,
      pagination: {
        has_next: hasNext,
        has_prev: hasPrev,
        count_total: totalCountNum,
        count_queried: coursesData.length,
        count_page: countPage
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/courses - Starting course creation...');
    
    const user = await getAuthenticatedUser(request);
    console.log('👤 Authenticated user:', user);

    if (!user) {
      console.log('❌ No authenticated user found');
      return NextResponse.json(
        { message: 'Unauthorized - No authenticated user' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      console.log('❌ User is not admin. Role:', user.role);
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      title,
      description,
      short_desc,
      category,
      level = 'BEGINNER',
      price = 0,
      duration = '4 weeks',
      status = 'DRAFT',
      image,
      featured = false,
      prerequisites = [],
      learning_objectives = [],
      target_audience = [],
      tags = []
    } = data;

    // Clean and validate the image URL
    let cleanedImage = image;
    if (image && typeof image === 'string') {
      cleanedImage = image.trim();
      console.log('Original image URL:', image);
      console.log('Cleaned image URL:', cleanedImage);
      
      // Validate the URL format
      try {
        new URL(cleanedImage);
        console.log('✅ Valid image URL format');
      } catch (urlError) {
        console.warn('⚠️ Invalid image URL format:', cleanedImage);
        // Set to null if invalid URL
        cleanedImage = null;
      }
    }

    // Get the user's ID from the authenticated user to use as instructor_id
    const instructor_id = user.id;

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { message: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        short_desc,
        image: cleanedImage,
        price: parseFloat(price) || 0,
        category,
        level,
        duration,
        status,
        featured,
        instructor_id,
        prerequisites,
        learning_objectives,
        target_audience,
        tags
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return NextResponse.json(
        { message: 'Error creating course: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Course created successfully',
      course
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 