import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    console.log('Recall.ai webhook event:', event);

    // Verify webhook signature (optional but recommended)
    const signature = request.headers.get('recall-signature');
    if (process.env.RECALL_WEBHOOK_SECRET && signature) {
      // Add signature verification here if needed
    }

    const supabase = createRouteHandlerClient({ cookies });

    switch (event.type) {
      case 'bot.status_change':
        await handleBotStatusChange(supabase, event);
        break;
      
      case 'bot.transcript.ready':
        await handleTranscriptReady(supabase, event);
        break;
        
      case 'bot.recording.ready':
        await handleRecordingReady(supabase, event);
        break;
        
      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleBotStatusChange(supabase: any, event: any) {
  const { data: botData } = event;
  
  console.log(`Bot ${botData.id} status changed to: ${botData.status_changes.status}`);

  if (botData.status_changes.status === 'joining_call') {
    // Bot is joining the meeting
    await supabase
      .from('meeting_bots')
      .upsert({
        bot_id: botData.id,
        meeting_url: botData.meeting_url,
        platform: detectPlatform(botData.meeting_url),
        status: 'joining',
        started_at: new Date().toISOString()
      });
  }
  
  if (botData.status_changes.status === 'in_call_recording') {
    // Bot is actively recording
    await supabase
      .from('meeting_bots')
      .update({
        status: 'recording',
        recording_started_at: new Date().toISOString()
      })
      .eq('bot_id', botData.id);
  }

  if (botData.status_changes.status === 'done') {
    // Meeting ended, process the recording
    await processMeetingComplete(supabase, botData);
  }
}

async function handleTranscriptReady(supabase: any, event: any) {
  const { data: botData } = event;
  
  try {
    // Download transcript
    const transcriptResponse = await fetch(botData.transcript_url);
    const transcriptText = await transcriptResponse.text();
    
    // Update bot record with transcript
    await supabase
      .from('meeting_bots')
      .update({
        transcript_url: botData.transcript_url,
        transcript_text: transcriptText,
        transcript_ready: true
      })
      .eq('bot_id', botData.id);

  } catch (error) {
    console.error('Error processing transcript:', error);
  }
}

async function handleRecordingReady(supabase: any, event: any) {
  const { data: botData } = event;
  
  await supabase
    .from('meeting_bots')
    .update({
      recording_url: botData.recording_url,
      recording_ready: true
    })
    .eq('bot_id', botData.id);
}

async function processMeetingComplete(supabase: any, botData: any) {
  try {
    // Get bot record to find the user who started it
    const { data: botRecord } = await supabase
      .from('meeting_bots')
      .select('*')
      .eq('bot_id', botData.id)
      .single();

    if (!botRecord) {
      console.error('Bot record not found:', botData.id);
      return;
    }

    // Download transcript and recording
    let transcriptText = '';
    let transcriptJson = null;

    if (botData.transcript_url) {
      try {
        const transcriptResponse = await fetch(botData.transcript_url);
        transcriptText = await transcriptResponse.text();
        
        // Try to parse as JSON for structured data
        try {
          transcriptJson = JSON.parse(transcriptText);
        } catch {
          // If not JSON, use as plain text
        }
      } catch (error) {
        console.error('Error fetching transcript:', error);
      }
    }

    // Extract participants from bot data
    const participants = botData.participants?.map((p: any) => ({
      name: p.name || 'Unknown',
      email: p.email || '',
      role: p.role || 'participant'
    })) || [];

    // Generate meeting title from URL or timestamp
    const meetingTitle = generateMeetingTitle(botData.meeting_url, botData.started_at);

    // Create meeting transcript record
    const { data: transcript, error: transcriptError } = await supabase
      .from('meeting_transcripts')
      .insert({
        user_id: botRecord.user_id,
        title: meetingTitle,
        meeting_platform: detectPlatform(botData.meeting_url),
        meeting_url: botData.meeting_url,
        participants: participants,
        transcript_text: transcriptText,
        transcript_json: transcriptJson,
        duration_minutes: Math.floor((botData.duration || 0) / 60),
        recording_url: botData.recording_url,
        meeting_date: new Date(botData.started_at).toISOString(),
        summary: await generateSummary(transcriptText),
        key_points: await extractKeyPoints(transcriptText)
      })
      .select()
      .single();

    if (transcriptError) {
      console.error('Error creating transcript:', transcriptError);
      return;
    }

    // Add participants to participants table
    if (participants.length > 0) {
      const participantRecords = participants.map((participant: any) => ({
        meeting_transcript_id: transcript.id,
        name: participant.name,
        email: participant.email,
        role: participant.role
      }));

      await supabase
        .from('meeting_participants')
        .insert(participantRecords);
    }

    // Update bot status to completed
    await supabase
      .from('meeting_bots')
      .update({
        status: 'completed',
        transcript_id: transcript.id,
        completed_at: new Date().toISOString()
      })
      .eq('bot_id', botData.id);

    console.log('Meeting processing completed:', transcript.id);

  } catch (error) {
    console.error('Error processing completed meeting:', error);
  }
}

function detectPlatform(meetingUrl: string): string {
  if (meetingUrl.includes('zoom.us')) return 'zoom';
  if (meetingUrl.includes('meet.google.com')) return 'google-meet';
  if (meetingUrl.includes('teams.microsoft.com')) return 'teams';
  return 'unknown';
}

function generateMeetingTitle(meetingUrl: string, startedAt: string): string {
  const platform = detectPlatform(meetingUrl);
  const date = new Date(startedAt).toLocaleDateString();
  const time = new Date(startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return `${platform.charAt(0).toUpperCase() + platform.slice(1)} Meeting - ${date} ${time}`;
}

async function generateSummary(transcriptText: string): Promise<string> {
  // TODO: Integrate with your AI service to generate summary
  // For now, return a simple summary
  if (!transcriptText || transcriptText.length < 100) {
    return 'Short meeting discussion.';
  }
  
  const words = transcriptText.split(' ').slice(0, 50);
  return words.join(' ') + '...';
}

async function extractKeyPoints(transcriptText: string): Promise<any[]> {
  // TODO: Use AI to extract key points and action items
  // For now, return empty array
  return [];
} 