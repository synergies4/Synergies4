import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

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
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

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
    // This would integrate with your AI service (OpenAI, Claude, etc.)
    // For now, providing contextual responses based on keywords
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm')) {
      return `I understand you're feeling stressed. Here are some immediate strategies that can help:

1. **Take a breath**: Try the 4-7-8 breathing technique (inhale for 4, hold for 7, exhale for 8)
2. **Prioritize ruthlessly**: What are the top 3 things that absolutely must get done today?
3. **Time-box your work**: Set specific time limits for tasks to prevent them from expanding
4. **Communicate boundaries**: Let your team know your current capacity

What's the biggest source of stress right now? I can help you create a specific action plan.`;
    }
    
    if (lowerMessage.includes('meeting') || lowerMessage.includes('standup')) {
      return `Meetings can be challenging! Here are some strategies to make them more effective:

**Before the meeting:**
- Set a clear agenda with time limits
- Share materials in advance
- Define the decision-making process

**During the meeting:**
- Start with the outcome you want
- Use time-boxing for discussions
- Park off-topic items in a "parking lot"
- Summarize decisions and action items

**After the meeting:**
- Send a quick recap with action items
- Set deadlines and owners for each item

What specific meeting challenge are you facing? I can give you more targeted advice.`;
    }
    
    if (lowerMessage.includes('team') || lowerMessage.includes('conflict')) {
      return `Team dynamics can be complex. Here's a framework to address team challenges:

**Listen first**: Understand all perspectives before jumping to solutions
**Focus on behavior, not personality**: Address specific actions and their impact
**Find common ground**: What does everyone agree on?
**Collaborative problem-solving**: Involve the team in finding solutions

For immediate action:
1. Have one-on-one conversations with key stakeholders
2. Identify the root cause (process, communication, or expectations?)
3. Create a safe space for open dialogue

What's the specific team challenge you're dealing with? I can help you navigate it step by step.`;
    }

    if (lowerMessage.includes('goal') || lowerMessage.includes('plan')) {
      return `Great that you're thinking about goals! Let's break this down:

**SMART Goals Framework:**
- **Specific**: What exactly do you want to achieve?
- **Measurable**: How will you track progress?
- **Achievable**: Is this realistic given your resources?
- **Relevant**: Does this align with your bigger picture?
- **Time-bound**: When do you want to achieve this?

**Next steps:**
1. Write down your goal in one clear sentence
2. Identify 3-5 key milestones
3. Break each milestone into weekly actions
4. Schedule regular check-ins with yourself

What goal are you working on? I can help you create a specific action plan.`;
    }

    // Default response
    return `Thank you for sharing that with me. Based on what you've told me, here are some thoughts:

Every challenge is an opportunity to grow and improve. The fact that you're actively seeking guidance shows great self-awareness and commitment to your development.

Here's what I'd suggest as immediate next steps:
1. **Clarify the specific outcome** you want to achieve
2. **Identify what's within your control** vs. what isn't
3. **Take one small action** today that moves you forward
4. **Reflect on what you learn** from each step

I'm here to help you work through this. Can you tell me more about the specific situation or challenge you're facing? The more context you provide, the more tailored my guidance can be.

What would be most helpful for you right now?`;

  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I apologize, but I'm having trouble generating a response right now. Please try again in a moment, or feel free to rephrase your question.";
  }
} 