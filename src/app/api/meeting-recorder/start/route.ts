import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { meetingUrl, botName, recordingSettings } = await request.json();

    if (!meetingUrl) {
      return NextResponse.json({ error: 'Meeting URL is required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create bot with Recall.ai
    const recallResponse = await fetch('https://api.recall.ai/api/v1/bot/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.RECALL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meeting_url: meetingUrl,
        bot_name: botName || `${user.email}'s Recorder`,
        recording_mode: 'speaker_view', // or 'gallery_view'
        recording_mode_config: {
          speaker_view: {
            participant_video_when_screenshare: true
          }
        },
        transcription_options: {
          provider: 'meeting_captions'
        },
        chat_options: {
          on_bot_join: {
            send_to: 'everyone',
            message: '🤖 Recording bot has joined to capture this meeting'
          }
        },
        real_time_transcription: {
          destination_url: `${process.env.NEXTAUTH_URL}/api/recall-webhooks`,
          partial_results: true
        },
        ...recordingSettings
      })
    });

    if (!recallResponse.ok) {
      const errorData = await recallResponse.text();
      console.error('Recall.ai API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to create recording bot',
        details: errorData 
      }, { status: 500 });
    }

    const botData = await recallResponse.json();

    // Save bot info to database
    const { data: botRecord, error: dbError } = await supabase
      .from('meeting_bots')
      .insert({
        user_id: user.id,
        bot_id: botData.id,
        meeting_url: meetingUrl,
        platform: detectPlatform(meetingUrl),
        bot_name: botName || `${user.email}'s Recorder`,
        status: 'created',
        recall_data: botData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to clean up the bot if DB save failed
      try {
        await fetch(`https://api.recall.ai/api/v1/bot/${botData.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${process.env.RECALL_API_KEY}`
          }
        });
      } catch {}
      
      return NextResponse.json({ error: 'Failed to save recording info' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      botId: botData.id,
      status: botData.status_changes?.status || 'created',
      recordId: botRecord.id
    });

  } catch (error) {
    console.error('Start recording error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function detectPlatform(meetingUrl: string): string {
  if (meetingUrl.includes('zoom.us')) return 'zoom';
  if (meetingUrl.includes('meet.google.com')) return 'google-meet';
  if (meetingUrl.includes('teams.microsoft.com')) return 'teams';
  return 'unknown';
} 