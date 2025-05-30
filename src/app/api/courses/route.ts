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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const featured = searchParams.get('featured');

    const supabase = createClient();
    
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
        created_at
      `)
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });

    // Apply filters
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

    return NextResponse.json({ courses: courses || [] });
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
    const user = await getAuthenticatedUser(request);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      title,
      description,
      shortDesc,
      category,
      level,
      price,
      duration,
      status,
      image,
      featured,
    } = data;

    const supabase = createClient();

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        short_desc: shortDesc,
        image,
        price: price ? parseFloat(price) : null,
        category,
        level: level || 'BEGINNER',
        duration,
        featured: featured || false,
        status: status || 'DRAFT',
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

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 