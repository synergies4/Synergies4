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

    const { data: conversation, error } = await supabase
      .from('user_conversations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return NextResponse.json(
        { message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Log content access
    await supabase
      .from('user_content_access')
      .insert({
        user_id: user.id,
        content_type: 'conversation',
        content_id: id,
        access_type: 'view'
      });

    return NextResponse.json(conversation);

  } catch (error) {
    console.error('Error in conversation GET:', error);
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

    // If conversation_data is being updated, recalculate message count
    if (allowedUpdates.conversation_data) {
      const messageCount = Array.isArray(allowedUpdates.conversation_data.messages) 
        ? allowedUpdates.conversation_data.messages.length 
        : 0;
      allowedUpdates.message_count = messageCount;
      allowedUpdates.last_message_at = new Date().toISOString();
    }

    const { data: conversation, error } = await supabase
      .from('user_conversations')
      .update(allowedUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      return NextResponse.json(
        { message: 'Failed to update conversation' },
        { status: 500 }
      );
    }

    // Log content access
    await supabase
      .from('user_content_access')
      .insert({
        user_id: user.id,
        content_type: 'conversation',
        content_id: id,
        access_type: 'edit'
      });

    return NextResponse.json(conversation);

  } catch (error) {
    console.error('Error in conversation PUT:', error);
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
      .from('user_conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting conversation:', error);
      return NextResponse.json(
        { message: 'Failed to delete conversation' },
        { status: 500 }
      );
    }

    // Log content access
    await supabase
      .from('user_content_access')
      .insert({
        user_id: user.id,
        content_type: 'conversation',
        content_id: id,
        access_type: 'delete'
      });

    return NextResponse.json({ message: 'Conversation deleted successfully' });

  } catch (error) {
    console.error('Error in conversation DELETE:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 