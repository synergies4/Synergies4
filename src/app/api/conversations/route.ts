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
    const archived = searchParams.get('archived') === 'true';
    const courseId = searchParams.get('course_id');

    let query = supabase
      .from('user_conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', archived)
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('conversation_type', type);
    }

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: conversations, error } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { message: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    // Get user's content settings to check limits
    const { data: settings } = await supabase
      .from('user_content_settings')
      .select('max_conversations')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      conversations,
      total: conversations?.length || 0,
      limits: {
        max_conversations: settings?.max_conversations || 10,
        current_count: conversations?.length || 0
      }
    });

  } catch (error) {
    console.error('Error in conversations GET:', error);
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

    const { 
      title, 
      conversation_data, 
      conversation_type = 'general', 
      course_id = null 
    } = await request.json();

    if (!conversation_data) {
      return NextResponse.json(
        { message: 'Conversation data is required' },
        { status: 400 }
      );
    }

    // Check user's conversation limit
    const { data: settings } = await supabase
      .from('user_content_settings')
      .select('max_conversations')
      .eq('user_id', user.id)
      .single();

    const { count } = await supabase
      .from('user_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_archived', false);

    const maxConversations = settings?.max_conversations || 10;
    if (count && count >= maxConversations) {
      return NextResponse.json(
        { 
          message: 'Conversation limit reached',
          current_count: count,
          max_allowed: maxConversations
        },
        { status: 403 }
      );
    }

    // Calculate message count from conversation data
    const messageCount = Array.isArray(conversation_data.messages) 
      ? conversation_data.messages.length 
      : 0;

    const { data: conversation, error } = await supabase
      .from('user_conversations')
      .insert({
        user_id: user.id,
        title: title || `Conversation ${new Date().toLocaleDateString()}`,
        conversation_data,
        conversation_type,
        course_id,
        message_count: messageCount,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json(
        { message: 'Failed to create conversation' },
        { status: 500 }
      );
    }

    // Log content access
    await supabase
      .from('user_content_access')
      .insert({
        user_id: user.id,
        content_type: 'conversation',
        content_id: conversation.id,
        access_type: 'create'
      });

    return NextResponse.json(conversation, { status: 201 });

  } catch (error) {
    console.error('Error in conversations POST:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 