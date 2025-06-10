import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { botId, recordId } = await request.json();

    if (!botId && !recordId) {
      return NextResponse.json({ error: 'Bot ID or record ID is required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let actualBotId = botId;

    // If we only have recordId, get the botId from database
    if (!actualBotId && recordId) {
      const { data: botRecord } = await supabase
        .from('meeting_bots')
        .select('bot_id')
        .eq('id', recordId)
        .eq('user_id', user.id)
        .single();

      if (!botRecord) {
        return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
      }

      actualBotId = botRecord.bot_id;
    }

    // Stop the bot via Recall.ai API
    const recallResponse = await fetch(`https://api.recall.ai/api/v1/bot/${actualBotId}/leave_call/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.RECALL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!recallResponse.ok) {
      const errorData = await recallResponse.text();
      console.error('Recall.ai stop error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to stop recording bot',
        details: errorData 
      }, { status: 500 });
    }

    // Update status in database
    await supabase
      .from('meeting_bots')
      .update({
        status: 'stopping',
        stopped_at: new Date().toISOString()
      })
      .eq('bot_id', actualBotId)
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Recording stopped successfully'
    });

  } catch (error) {
    console.error('Stop recording error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
    }

    // Get bot status from Recall.ai
    const recallResponse = await fetch(`https://api.recall.ai/api/v1/bot/${botId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${process.env.RECALL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!recallResponse.ok) {
      const errorData = await recallResponse.text();
      console.error('Recall.ai status error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to get bot status',
        details: errorData 
      }, { status: 500 });
    }

    const botData = await recallResponse.json();

    return NextResponse.json({
      status: botData.status_changes?.status || 'unknown',
      bot: botData
    });

  } catch (error) {
    console.error('Get bot status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 