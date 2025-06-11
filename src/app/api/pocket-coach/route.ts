import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get user's session using the same method as the working chat API
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, sessionId, context } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user onboarding data for personalization
    const { data: onboarding } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get or create coaching session
    let session;
    if (sessionId) {
      const { data: existingSession } = await supabase
        .from('user_coaching_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();
      session = existingSession;
    }

    if (!session) {
      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from('user_coaching_sessions')
        .insert({
          user_id: user.id,
          session_type: 'pocket_coach',
          context_data: context || {},
          session_goal: 'General coaching support',
          messages: []
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return NextResponse.json({ error: 'Failed to create coaching session' }, { status: 500 });
      }
      session = newSession;
    }

    // Build AI context from user data
    const aiContext = buildAIContext(onboarding, session, context);
    
    // Add personalization context if provided
    let fullContext = aiContext;
    if (context?.personalizationContext) {
      fullContext = `${aiContext}\n\nAdditional User Context:\n${context.personalizationContext}`;
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(message, fullContext);

    // Update session with new messages
    const updatedMessages = [
      ...(session.messages || []),
      {
        id: Date.now(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      },
      {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }
    ];

    const { data: updatedSession, error: updateError } = await supabase
      .from('user_coaching_sessions')
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating session:', updateError);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    return NextResponse.json({
      sessionId: session.id,
      response: aiResponse,
      messages: updatedMessages
    });

  } catch (error) {
    console.error('Error in pocket coach:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user's session using the same method as the working chat API
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific session
      const { data: session, error } = await supabase
        .from('user_coaching_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json({ session });
    } else {
      // Get recent sessions
      const { data: sessions, error } = await supabase
        .from('user_coaching_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_type', 'pocket_coach')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
      }

      return NextResponse.json({ sessions });
    }

  } catch (error) {
    console.error('Error in pocket coach GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildAIContext(onboarding: any, session: any, context: any) {
  const baseContext = `You are a professional AI coach specializing in Agile, leadership, and professional development. You are helping a user with their day-to-day challenges and growth.`;

  let userContext = '';
  if (onboarding) {
    userContext = `
User Profile:
- Name: ${onboarding.full_name || 'Not provided'}
- Role: ${onboarding.job_title || 'Not provided'} at ${onboarding.company || 'Not provided'}
- Primary Role: ${onboarding.primary_role || 'Not provided'}
- Management Level: ${onboarding.management_level || 'Not provided'}
- Experience: ${onboarding.years_experience || 'Not provided'} years
- Team Size: ${onboarding.team_size || 'Not provided'}
- Company Size: ${onboarding.company_size || 'Not provided'}
- Work Environment: ${onboarding.work_environment || 'Not provided'}
- Team Structure: ${onboarding.team_structure || 'Not provided'}

Current Challenges: ${onboarding.biggest_challenges?.join(', ') || 'Not provided'}
Primary Goals: ${onboarding.primary_goals?.join(', ') || 'Not provided'}
Focus Areas: ${onboarding.focus_areas?.join(', ') || 'Not provided'}

Communication Preferences:
- Coaching Style: ${onboarding.coaching_style || 'balanced'}
- Communication Tone: ${onboarding.communication_tone || 'professional'}
- Learning Style: ${onboarding.learning_style || 'mixed'}
`;
  }

  let sessionContext = '';
  if (session.messages && session.messages.length > 0) {
    sessionContext = `
Previous conversation context:
${session.messages.slice(-4).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}
`;
  }

  let currentContext = '';
  if (context) {
    currentContext = `
Current situation: ${JSON.stringify(context)}
`;
  }

  return `${baseContext}\n${userContext}\n${sessionContext}\n${currentContext}

Provide helpful, actionable advice tailored to their specific role and challenges. Be empathetic, professional, and focus on practical solutions they can implement immediately.`;
}

async function generateAIResponse(message: string, context: string): Promise<string> {
  try {
    // Try Anthropic first, then fallback to OpenAI
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    console.log('API Key check:', {
      hasAnthropic: !!anthropicKey,
      hasOpenAI: !!openaiKey,
      anthropicLength: anthropicKey?.length || 0,
      openaiLength: openaiKey?.length || 0
    });
    
    if (!anthropicKey && !openaiKey) {
      console.error('No AI API keys configured');
      return "I'm currently unable to provide AI responses. Please contact support to configure API keys.";
    }

    // Prefer Anthropic if available
    if (anthropicKey) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            system: context,
            messages: [
              {
                role: 'user',
                content: message
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.content && data.content[0] && data.content[0].text) {
            return data.content[0].text;
          }
        } else {
          console.error('Anthropic API error:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Anthropic API call failed:', error);
      }
    }

    // Fallback to OpenAI if Anthropic fails or isn't available
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            max_tokens: 1000,
            messages: [
              {
                role: 'system',
                content: context
              },
              {
                role: 'user',
                content: message
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
          }
        } else {
          console.error('OpenAI API error:', response.status, await response.text());
        }
      } catch (error) {
        console.error('OpenAI API call failed:', error);
      }
    }

    // If both APIs fail, return a helpful fallback message
    return "I'm experiencing some technical difficulties connecting to my AI services right now. Please try again in a moment, or feel free to contact our support team for immediate assistance.";

  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I apologize, but I'm having trouble generating a response right now. Please try again in a moment, or feel free to rephrase your question.";
  }
} 