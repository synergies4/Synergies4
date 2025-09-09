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

    // Get user data to check role (our app stores auth_user_id on users table)
    const { data: userData } = await supabase
      .from('users')
      .select('id, role, auth_user_id')
      .eq('auth_user_id', user.id)
      .single();

    return {
      id: userData?.id || user.id,
      role: userData?.role || 'USER'
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// GET /api/blog - List blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const offset = (page - 1) * limit;
    
    const supabase = await createClient();
    
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    // Apply filters (removed status filtering since we don't have that column yet)
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Error fetching blog posts:', error);
      return NextResponse.json(
        { message: 'Failed to fetch blog posts' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true });

    if (category && category !== 'all') {
      countQuery = countQuery.eq('category', category);
    }

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in blog API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/blog - Create new blog post
export async function POST(request: NextRequest) {
  try {
    console.log('Blog POST API called');
    
    const user = await getAuthenticatedUser(request);
    console.log('Authenticated user:', user);

    if (!user || user.role !== 'ADMIN') {
      console.log('Access denied - user role:', user?.role);
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const {
      title,
      slug,
      excerpt,
      content,
      image,
      category,
      categories = [],
      tags,
      meta_title,
      meta_description,
      reading_time
    } = body;

    if (!title || !content || !category) {
      console.log('Missing required fields:', { title: !!title, content: !!content, category: !!category });
      return NextResponse.json(
        { message: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if slug already exists
    const { data: existingPost, error: slugError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (slugError && slugError.code !== 'PGRST116') {
      console.error('Error checking slug:', slugError);
      return NextResponse.json(
        { message: 'Error checking slug uniqueness' },
        { status: 500 }
      );
    }

    if (existingPost) {
      console.log('Slug already exists:', slug);
      return NextResponse.json(
        { message: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    // Create post data with all the columns (except status for now)
    const postData = {
      title,
      slug,
      excerpt: excerpt || '',
      content,
      image: image || '',
      category,
      categories,
      tags: tags || [],
      author_id: user.id,
      meta_title: meta_title || title,
      meta_description: meta_description || excerpt || '',
      reading_time: reading_time || Math.ceil(content.split(' ').length / 200),
      featured: false,
      published_at: new Date().toISOString() // Always set as published for now
    };

    console.log('Inserting post data:', postData);

    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return NextResponse.json(
        { message: `Failed to create blog post: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Blog post created successfully:', post);
    return NextResponse.json({ post }, { status: 201 });

  } catch (error) {
    console.error('Error in blog POST API:', error);
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 