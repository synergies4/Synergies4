import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: transcript, error } = await supabase
      .from('meeting_transcripts')
      .select(`
        *,
        meeting_participants (
          id,
          name,
          email,
          role,
          join_time,
          leave_time,
          speaking_time_minutes
        ),
        meeting_action_items (
          id,
          title,
          description,
          assignee_email,
          due_date,
          status,
          priority,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 });
    }

    return NextResponse.json({ transcript });

  } catch (error) {
    console.error('Error fetching meeting transcript:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      meeting_platform,
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

    // Update the meeting transcript
    const { data: transcript, error: updateError } = await supabase
      .from('meeting_transcripts')
      .update({
        title,
        meeting_platform,
        meeting_url,
        participants: participants || [],
        transcript_text,
        transcript_json,
        duration_minutes,
        recording_url,
        summary,
        key_points: key_points || [],
        tags: tags || [],
        meeting_date: meeting_date ? new Date(meeting_date).toISOString() : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
      }
      console.error('Database error updating transcript:', updateError);
      return NextResponse.json({ error: 'Failed to update transcript' }, { status: 500 });
    }

    return NextResponse.json({ 
      transcript,
      message: 'Meeting transcript updated successfully' 
    });

  } catch (error) {
    console.error('Error updating meeting transcript:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the meeting transcript (cascades to participants and action items)
    const { error: deleteError } = await supabase
      .from('meeting_transcripts')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (deleteError) {
      console.error('Database error deleting transcript:', deleteError);
      return NextResponse.json({ error: 'Failed to delete transcript' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Meeting transcript deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting meeting transcript:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 