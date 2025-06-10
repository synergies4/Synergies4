import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');

    let query = supabase
      .from('user_presentations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('presentation_type', type);
    }

    const { data: presentations, error } = await query;

    if (error) {
      console.error('Error fetching presentations:', error);
      return NextResponse.json(
        { message: 'Failed to fetch presentations' },
        { status: 500 }
      );
    }

    // Get user's content settings to check limits
    const { data: settings } = await supabase
      .from('user_content_settings')
      .select('max_presentations')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      presentations,
      total: presentations?.length || 0,
      limits: {
        max_presentations: settings?.max_presentations || 5,
        current_count: presentations?.length || 0
      }
    });

  } catch (error) {
    console.error('Error in presentations GET:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { title, content, presentation_type = 'standard', tags = [], is_public = false } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Check user's presentation limit
    const { data: settings } = await supabase
      .from('user_content_settings')
      .select('max_presentations')
      .eq('user_id', user.id)
      .single();

    const { count } = await supabase
      .from('user_presentations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const maxPresentations = settings?.max_presentations || 5;
    if (count && count >= maxPresentations) {
      return NextResponse.json(
        { 
          message: 'Presentation limit reached',
          current_count: count,
          max_allowed: maxPresentations
        },
        { status: 403 }
      );
    }

    const { data: presentation, error } = await supabase
      .from('user_presentations')
      .insert({
        user_id: user.id,
        title,
        content,
        presentation_type,
        tags,
        is_public
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating presentation:', error);
      return NextResponse.json(
        { message: 'Failed to create presentation' },
        { status: 500 }
      );
    }

    // Log content access
    await supabase
      .from('user_content_access')
      .insert({
        user_id: user.id,
        content_type: 'presentation',
        content_id: presentation.id,
        access_type: 'create'
      });

    return NextResponse.json(presentation, { status: 201 });

  } catch (error) {
    console.error('Error in presentations POST:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 