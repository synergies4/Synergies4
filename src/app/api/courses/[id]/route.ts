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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const courseId = params.id;

    const supabase = await createClient();
    
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
    console.log('🚀 PUT /api/courses/[id] - Starting course update...');
    
    const params = await context.params;
    console.log('📝 Course ID:', params.id);
    
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
      image,
      price,
      category,
      level,
      duration,
      featured,
      status,
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

    const supabase = await createClient();

    const { data: course, error } = await supabase
      .from('courses')
      .update({
        title,
        description,
        short_desc,
        image: cleanedImage,
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

    const supabase = await createClient();

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