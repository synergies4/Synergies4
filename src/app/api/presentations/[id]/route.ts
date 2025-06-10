import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data: presentation, error } = await supabase
      .from('user_presentations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching presentation:', error);
      return NextResponse.json(
        { message: 'Presentation not found' },
        { status: 404 }
      );
    }

    // Update last accessed timestamp
    await supabase
      .from('user_presentations')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', id);

    // Log content access
    await supabase
      .from('user_content_access')
      .insert({
        user_id: user.id,
        content_type: 'presentation',
        content_id: id,
        access_type: 'view'
      });

    return NextResponse.json(presentation);

  } catch (error) {
    console.error('Error in presentation GET:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    
    // Remove fields that shouldn't be updated directly
    const { id: updateId, user_id, created_at, ...allowedUpdates } = updates;

    const { data: presentation, error } = await supabase
      .from('user_presentations')
      .update(allowedUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating presentation:', error);
      return NextResponse.json(
        { message: 'Failed to update presentation' },
        { status: 500 }
      );
    }

    // Log content access
    await supabase
      .from('user_content_access')
      .insert({
        user_id: user.id,
        content_type: 'presentation',
        content_id: id,
        access_type: 'edit'
      });

    return NextResponse.json(presentation);

  } catch (error) {
    console.error('Error in presentation PUT:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('user_presentations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting presentation:', error);
      return NextResponse.json(
        { message: 'Failed to delete presentation' },
        { status: 500 }
      );
    }

    // Log content access
    await supabase
      .from('user_content_access')
      .insert({
        user_id: user.id,
        content_type: 'presentation',
        content_id: id,
        access_type: 'delete'
      });

    return NextResponse.json({ message: 'Presentation deleted successfully' });

  } catch (error) {
    console.error('Error in presentation DELETE:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 