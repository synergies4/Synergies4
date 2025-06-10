import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('meeting_transcripts')
      .select(`
        *,
        meeting_participants (
          id,
          name,
          email,
          role,
          speaking_time_minutes
        ),
        meeting_action_items (
          id,
          title,
          status,
          due_date,
          priority
        )
      `)
      .eq('user_id', session.user.id)
      .order('meeting_date', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add search filter
    if (search) {
      query = query.textSearch('search_vector', search);
    }

    // Add platform filter
    if (platform && platform !== 'all') {
      query = query.eq('meeting_platform', platform);
    }

    const { data: transcripts, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('meeting_transcripts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);

    if (search) {
      countQuery = countQuery.textSearch('search_vector', search);
    }

    if (platform && platform !== 'all') {
      countQuery = countQuery.eq('meeting_platform', platform);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      transcripts,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Error fetching meeting transcripts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      meeting_platform,
      meeting_id,
      meeting_url,
      participants,
      transcript_text,
      transcript_json,
      duration_minutes,
      recording_url,
      summary,
      key_points,
      tags,
      meeting_date
    } = body;

    // Validate required fields
    if (!title || !transcript_text || !meeting_date) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, transcript_text, meeting_date' 
      }, { status: 400 });
    }

    // Create the meeting transcript
    const { data: transcript, error: transcriptError } = await supabase
      .from('meeting_transcripts')
      .insert({
        user_id: session.user.id,
        title,
        meeting_platform,
        meeting_id,
        meeting_url,
        participants: participants || [],
        transcript_text,
        transcript_json,
        duration_minutes,
        recording_url,
        summary,
        key_points: key_points || [],
        tags: tags || [],
        meeting_date: new Date(meeting_date).toISOString()
      })
      .select()
      .single();

    if (transcriptError) {
      console.error('Database error creating transcript:', transcriptError);
      return NextResponse.json({ error: 'Failed to create transcript' }, { status: 500 });
    }

    // Add participants if provided
    if (participants && participants.length > 0) {
      const participantRecords = participants.map((participant: any) => ({
        meeting_transcript_id: transcript.id,
        name: participant.name,
        email: participant.email,
        role: participant.role || 'participant',
        join_time: participant.join_time,
        leave_time: participant.leave_time,
        speaking_time_minutes: participant.speaking_time_minutes || 0
      }));

      const { error: participantError } = await supabase
        .from('meeting_participants')
        .insert(participantRecords);

      if (participantError) {
        console.error('Error adding participants:', participantError);
        // Don't fail the whole request for participant errors
      }
    }

    // Extract and create action items if provided in key_points
    if (key_points && key_points.length > 0) {
      const actionItems = key_points.filter((point: any) => point.type === 'action_item');
      
      if (actionItems.length > 0) {
        const actionItemRecords = actionItems.map((item: any) => ({
          meeting_transcript_id: transcript.id,
          user_id: session.user.id,
          assignee_email: item.assignee_email,
          title: item.title,
          description: item.description,
          due_date: item.due_date,
          priority: item.priority || 'medium'
        }));

        const { error: actionItemError } = await supabase
          .from('meeting_action_items')
          .insert(actionItemRecords);

        if (actionItemError) {
          console.error('Error creating action items:', actionItemError);
          // Don't fail the whole request for action item errors
        }
      }
    }

    return NextResponse.json({ 
      transcript,
      message: 'Meeting transcript created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating meeting transcript:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 