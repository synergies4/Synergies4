import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active recording sessions (not completed, failed, or older than 4 hours)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    
    const { data: sessions, error } = await supabase
      .from('meeting_bots')
      .select('*')
      .eq('user_id', user.id)
      .not('status', 'in', '(completed,failed)')
      .gte('created_at', fourHoursAgo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Transform the data for the frontend
    const activeSessions = sessions.map(session => ({
      id: session.id,
      botId: session.bot_id,
      meetingUrl: session.meeting_url,
      platform: session.platform,
      status: session.status,
      botName: session.bot_name,
      createdAt: session.created_at,
      startedAt: session.started_at,
      recordingStartedAt: session.recording_started_at
    }));

    return NextResponse.json(activeSessions);

  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 