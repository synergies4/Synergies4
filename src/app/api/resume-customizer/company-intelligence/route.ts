import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_name } = await request.json();

    if (!company_name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Get company intelligence
    const intelligence = await getCompanyIntelligence(company_name);

    return NextResponse.json({
      success: true,
      intelligence
    });

  } catch (error) {
    console.error('Error in company intelligence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getCompanyIntelligence(companyName: string) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not available, using fallback intelligence');
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const prompt = `
Provide comprehensive company intelligence for: ${companyName}

Please provide information in the following JSON format:
{
  "company_background": "<detailed company overview, history, mission, and business model>",
  "company_culture": [<array of key cultural values and work environment aspects>],
  "recent_news": [<array of recent news, developments, or announcements>],
  "company_size": "<estimated employee count range>",
  "industry": "<primary industry/sector>",
  "values": [<array of core company values>],
  "leadership_style": "<typical leadership and management approach>",
  "growth_stage": "<startup, growth, mature, etc.>",
  "known_for": [<array of what the company is known for>],
  "interview_insights": {
    "typical_process": "<typical interview process>",
    "what_they_value": [<array of qualities they typically look for>],
    "questions_to_ask": [<array of good questions to ask them>]
  },
  "application_tips": [<array of tips for applying to this company>]
}

Guidelines:
- Provide factual, up-to-date information
- Focus on insights that would help a job applicant
- Include cultural aspects that matter for fit assessment
- Mention any recent changes or developments
- If you don't have specific information, indicate that clearly
- Be honest about limitations in your knowledge
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional career advisor with extensive knowledge of companies across various industries. Provide accurate, helpful company intelligence to assist job seekers. Be honest about limitations in your knowledge and avoid speculation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const intelligenceText = completion.choices[0]?.message?.content;
    
    if (!intelligenceText) {
      throw new Error('No intelligence received from AI');
    }

    // Parse the JSON response
    const jsonMatch = intelligenceText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI intelligence response');
    }

    const intelligence = JSON.parse(jsonMatch[0]);

    // Validate and ensure all required fields are present
    return {
      company_background: intelligence.company_background || `${companyName} is a company in the business sector. Specific details about their background, mission, and business model would require additional research.`,
      company_culture: intelligence.company_culture || ['Professional work environment', 'Team collaboration', 'Results-oriented'],
      recent_news: intelligence.recent_news || ['Recent company news and developments would require real-time research'],
      company_size: intelligence.company_size || 'Size information not available',
      industry: intelligence.industry || 'Industry classification pending research',
      values: intelligence.values || ['Quality', 'Innovation', 'Customer focus'],
      leadership_style: intelligence.leadership_style || 'Leadership style information not available',
      growth_stage: intelligence.growth_stage || 'Growth stage assessment pending',
      known_for: intelligence.known_for || ['Business operations', 'Industry presence'],
      interview_insights: intelligence.interview_insights || {
        typical_process: 'Standard interview process with multiple rounds',
        what_they_value: ['Relevant experience', 'Cultural fit', 'Technical skills'],
        questions_to_ask: ['What are the biggest challenges facing the team?', 'How do you measure success in this role?']
      },
      application_tips: intelligence.application_tips || [
        'Tailor your resume to match job requirements',
        'Research the company thoroughly',
        'Highlight relevant experience and achievements',
        'Prepare specific examples of your work'
      ]
    };

  } catch (error) {
    console.error('Error in AI company intelligence:', error);
    
    // Fallback intelligence if AI fails
    return {
      company_background: `${companyName} is a company that we're currently researching. Detailed background information will be available soon.`,
      company_culture: ['Professional environment', 'Team collaboration', 'Growth-oriented'],
      recent_news: ['Company intelligence temporarily unavailable'],
      company_size: 'To be determined',
      industry: 'Industry research in progress',
      values: ['Quality', 'Innovation', 'Customer satisfaction'],
      leadership_style: 'Information being gathered',
      growth_stage: 'Assessment pending',
      known_for: ['Business operations', 'Industry presence'],
      interview_insights: {
        typical_process: 'Multi-stage interview process',
        what_they_value: ['Relevant experience', 'Problem-solving skills', 'Cultural fit'],
        questions_to_ask: [
          'What are the main challenges in this role?',
          'How does the team measure success?',
          'What opportunities are there for growth?'
        ]
      },
      application_tips: [
        'Research the company website and recent news',
        'Align your experience with their job requirements',
        'Prepare specific examples of your achievements',
        'Show enthusiasm for their mission and values'
      ]
    };
  }
} 