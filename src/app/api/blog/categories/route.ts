import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/blog/categories - Fetch blog categories
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching blog categories:', error);
      return NextResponse.json(
        { message: 'Failed to fetch blog categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      categories: categories || []
    });
  } catch (error) {
    console.error('Error in blog categories API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 