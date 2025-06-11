import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, type } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Get the API key from environment variables
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('No AI API key found, using fallback content generation');
      
      // Fallback content generation
      const fallbackContent = generateFallbackContent(prompt, type);
      return NextResponse.json({ content: fallbackContent });
    }

    let content = '';

    // Try Anthropic first
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 500,
            messages: [{
              role: 'user',
              content: formatPromptForType(prompt, type)
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          content = data.content[0].text;
        }
      } catch (error) {
        console.error('Anthropic API error:', error);
      }
    }

    // Fallback to OpenAI if Anthropic failed
    if (!content && process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            max_tokens: 500,
            messages: [{
              role: 'user',
              content: formatPromptForType(prompt, type)
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          content = data.choices[0].message.content;
        }
      } catch (error) {
        console.error('OpenAI API error:', error);
      }
    }

    // Final fallback
    if (!content) {
      content = generateFallbackContent(prompt, type);
    }

    return NextResponse.json({ content: content.trim() });

  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

function formatPromptForType(prompt: string, type: string): string {
  switch (type) {
    case 'title':
      return `Create a compelling, professional title for: ${prompt}. Keep it concise and impactful (max 10 words).`;
    
    case 'bullets':
      return `Create 3-4 bullet points about: ${prompt}. Make them clear, actionable, and professional. Format as:
• First point
• Second point
• Third point`;
    
    case 'text':
    default:
      return `Write 2-3 professional sentences about: ${prompt}. Make it clear, engaging, and suitable for a business presentation.`;
  }
}

function generateFallbackContent(prompt: string, type: string): string {
  const keywords = prompt.toLowerCase().split(' ').filter(word => word.length > 3);
  
  switch (type) {
    case 'title':
      if (keywords.includes('benefits') || keywords.includes('advantages')) {
        return `Key Benefits of ${prompt.split(' ').slice(-2).join(' ')}`;
      }
      if (keywords.includes('strategy') || keywords.includes('plan')) {
        return `Strategic Approach to ${prompt.split(' ').slice(-2).join(' ')}`;
      }
      return `${prompt.split(' ').slice(0, 4).join(' ')} Overview`;
    
    case 'bullets':
      return `• Enhanced efficiency and productivity
• Improved stakeholder engagement
• Reduced operational costs
• Measurable ROI and results`;
    
    case 'text':
    default:
      return `${prompt} represents a significant opportunity for organizational growth and development. Through strategic implementation and focused execution, this initiative can deliver measurable value and drive sustainable results.`;
  }
} 