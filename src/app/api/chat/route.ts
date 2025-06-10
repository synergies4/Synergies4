import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: 'anthropic' | 'openai' | 'google';
  attachments?: FileAttachment[];
}

interface FileAttachment {
  name: string;
  type: string;
  size: number;
}

type AIProvider = 'anthropic' | 'openai' | 'google';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get user's personalization context
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    let personalizationContext = '';
    if (user) {
      const { data: onboarding } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (onboarding && onboarding.onboarding_completed) {
        personalizationContext = `

User Profile Context (tailor your responses to this user):
- Name: ${onboarding.full_name}
- Role: ${onboarding.job_title} at ${onboarding.company}
- Primary Role: ${onboarding.primary_role}
- Management Level: ${onboarding.management_level}
- Experience: ${onboarding.years_experience} years
- Team Size: ${onboarding.team_size}
- Company Size: ${onboarding.company_size}
- Work Environment: ${onboarding.work_environment}

Current Challenges: ${onboarding.biggest_challenges?.join(', ') || 'None specified'}
Primary Goals: ${onboarding.primary_goals?.join(', ') || 'None specified'}
Focus Areas: ${onboarding.focus_areas?.join(', ') || 'None specified'}

Communication Preferences:
- Coaching Style: ${onboarding.coaching_style || 'balanced'}
- Communication Tone: ${onboarding.communication_tone || 'professional'}
- Learning Style: ${onboarding.learning_style || 'mixed'}

IMPORTANT: Address them by name (${onboarding.full_name}) and provide advice that's relevant to their specific role, challenges, and experience level.`;
      }
    }
    
    // Handle both old format (message, history) and new format (messages)
    let message: string;
    let history: Message[] = [];
    let provider: AIProvider = 'anthropic';
    let attachments: FileAttachment[] = [];

    if (body.messages && Array.isArray(body.messages)) {
      // New format from Synergize page
      const messages = body.messages;
      const systemMessage = messages.find((msg: any) => msg.role === 'system');
      const userMessages = messages.filter((msg: any) => msg.role === 'user');
      
      if (userMessages.length > 0) {
        message = userMessages[userMessages.length - 1].content;
        history = userMessages.slice(0, -1).map((msg: any) => ({
          id: Date.now().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date()
        }));
      } else {
        return NextResponse.json(
          { error: 'No user message found' },
          { status: 400 }
        );
      }
      
      provider = body.provider || 'anthropic';
      attachments = body.attachments || [];
    } else {
      // Old format
      message = body.message;
      history = body.history || [];
      provider = body.provider || 'anthropic';
      attachments = body.attachments || [];
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Get the appropriate API key based on provider
    let apiKey: string | undefined;
    let apiUrl: string;
    let headers: Record<string, string>;
    let requestBody: any;

    switch (provider) {
      case 'anthropic':
        apiKey = process.env.ANTHROPIC_API_KEY;
        apiUrl = 'https://api.anthropic.com/v1/messages';
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
          'anthropic-version': '2023-06-01'
        };
        break;
      case 'openai':
        apiKey = process.env.OPENAI_API_KEY;
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        break;
      case 'google':
        apiKey = process.env.GOOGLE_AI_API_KEY;
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        headers = {
          'Content-Type': 'application/json'
        };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid provider specified' },
          { status: 400 }
        );
    }

    if (!apiKey) {
      console.error(`${provider.toUpperCase()}_API_KEY is not configured`);
      return NextResponse.json(
        { 
          content: `I'm currently unavailable with ${provider}. Please try a different provider or contact support for assistance.`,
          response: `I'm currently unavailable with ${provider}. Please try a different provider or contact support for assistance.`
        },
        { status: 200 }
      );
    }

    // Prepare conversation history based on provider
    const conversationHistory = history
      ?.filter((msg: Message) => msg.role !== 'assistant' || msg.id !== 'welcome')
      ?.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })) || [];

    // Add current message
    let fullMessage = message;
    if (attachments && attachments.length > 0) {
      fullMessage += '\n\nAttached files: ' + attachments.map((att: FileAttachment) => 
        `${att.name} (${att.type})`
      ).join(', ');
    }

    conversationHistory.push({
      role: 'user',
      content: fullMessage
    });

    // System prompt for the AI assistant
    const systemPrompt = `You are an AI learning companion for Synergies4, a professional development and training company. You specialize in:

1. Business Strategy & Leadership
2. Agile & Scrum Methodologies
3. Product Management
4. Technology & Digital Transformation
5. Professional Development
6. Team Management & Coaching

Your role is to:
- Provide helpful, accurate, and actionable advice
- Share insights on best practices in business and technology
- Help users develop their professional skills
- Offer guidance on career development
- Explain complex concepts in an accessible way
- Be encouraging and supportive while maintaining professionalism
- Analyze documents and files when provided
- Generate creative content including presentations and visual aids

Keep responses concise but comprehensive, and always aim to add value to the user's learning journey. If asked about topics outside your expertise, politely redirect to your core areas or suggest they contact Synergies4 directly for specialized consultation.

You can also help with:
- Creating presentations and slideshows
- Analyzing uploaded documents
- Generating images (when requested)
- Providing visual learning aids

${personalizationContext}`;

    // Prepare request body based on provider
    switch (provider) {
      case 'anthropic':
        requestBody = {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          system: systemPrompt,
          messages: conversationHistory
        };
        break;
      case 'openai':
        requestBody = {
          model: 'gpt-4',
          max_tokens: 1000,
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory
          ]
        };
        break;
      case 'google':
        requestBody = {
          contents: [
            {
              parts: [
                { text: systemPrompt + '\n\nUser: ' + fullMessage }
              ]
            }
          ]
        };
        break;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`${provider} API error:`, response.status, errorData);
      
      return NextResponse.json(
        { 
          content: `I'm experiencing some technical difficulties with ${provider}. Please try again in a moment, or feel free to contact our support team for immediate assistance.`,
          response: `I'm experiencing some technical difficulties with ${provider}. Please try again in a moment, or feel free to contact our support team for immediate assistance.`
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    let responseText: string;

    // Extract response based on provider
    switch (provider) {
      case 'anthropic':
        if (!data.content || !data.content[0] || !data.content[0].text) {
          throw new Error('Unexpected response format from Anthropic');
        }
        responseText = data.content[0].text;
        break;
      case 'openai':
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Unexpected response format from OpenAI');
        }
        responseText = data.choices[0].message.content;
        break;
      case 'google':
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          throw new Error('Unexpected response format from Google');
        }
        responseText = data.candidates[0].content.parts[0].text;
        break;
      default:
        throw new Error('Unknown provider');
    }

    return NextResponse.json({
      content: responseText,  // For Synergize page
      response: responseText, // For backward compatibility
      provider: provider
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        content: "I'm currently experiencing technical difficulties. Please try again later or contact our support team for assistance.",
        response: "I'm currently experiencing technical difficulties. Please try again later or contact our support team for assistance."
      },
      { status: 200 }
    );
  }
} 