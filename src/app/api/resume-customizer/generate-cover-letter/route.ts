import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      resume_content,
      job_description, 
      job_title,
      company_name,
      company_intelligence,
      fit_analysis,
      job_application_id 
    } = await request.json();

    if (!resume_content || !job_description) {
      return NextResponse.json({ error: 'Resume content and job description are required' }, { status: 400 });
    }

    // Generate cover letter using AI
    const coverLetter = await generateCoverLetter(
      resume_content,
      job_description,
      job_title,
      company_name,
      company_intelligence,
      fit_analysis
    );

    // Store the cover letter
    if (job_application_id) {
      const { error: storeError } = await supabase
        .from('tailored_cover_letters')
        .insert({
          user_id: user.id,
          job_application_id,
          content: coverLetter.content,
          content_plain: coverLetter.plain_text,
          personalization_elements: coverLetter.personalization_elements,
          key_achievements_highlighted: coverLetter.key_achievements,
          call_to_action: coverLetter.call_to_action
        });

      if (storeError) {
        console.error('Error storing cover letter:', storeError);
        // Continue even if storage fails
      }
    }

    return NextResponse.json({
      success: true,
      cover_letter: coverLetter.content,
      personalization_elements: coverLetter.personalization_elements
    });

  } catch (error) {
    console.error('Error in cover letter generation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateCoverLetter(
  resumeContent: string,
  jobDescription: string,
  jobTitle: string = '',
  companyName: string = '',
  companyIntelligence?: any,
  fitAnalysis?: any
) {
  try {
    const prompt = `
You are an expert cover letter writer. Create a compelling, personalized cover letter for this job application.

RESUME CONTENT:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

JOB TITLE: ${jobTitle}
COMPANY NAME: ${companyName}

${fitAnalysis ? `FIT ANALYSIS:
- Overall Fit Score: ${fitAnalysis.overall_fit_score}%
- Key Strengths: ${fitAnalysis.strengths?.join(', ')}
- Unique Value Propositions: ${fitAnalysis.unique_value_propositions?.join(', ')}
- Recommended Focus Areas: ${fitAnalysis.recommended_focus_areas?.join(', ')}
` : ''}

${companyIntelligence ? `COMPANY INTELLIGENCE:
- Company Background: ${companyIntelligence.company_background}
- Company Culture: ${companyIntelligence.company_culture?.join(', ')}
- Values: ${companyIntelligence.values?.join(', ')}
- Known For: ${companyIntelligence.known_for?.join(', ')}
` : ''}

INSTRUCTIONS:
Create a professional cover letter that:
1. Opens with a strong, attention-grabbing introduction
2. Demonstrates clear understanding of the role and company
3. Highlights 2-3 most relevant achievements from the resume
4. Shows alignment with company values and culture
5. Addresses any potential concerns or gaps proactively
6. Includes a compelling call to action
7. Maintains professional yet engaging tone
8. Is concise (3-4 paragraphs, under 400 words)

Provide your response in the following JSON format:
{
  "content": "<complete cover letter in professional format>",
  "plain_text": "<plain text version>",
  "personalization_elements": {
    "company_specific": [<array of company-specific mentions>],
    "role_specific": [<array of role-specific connections>],
    "value_alignment": [<array of value/culture alignments>]
  },
  "key_achievements": [<array of achievements highlighted>],
  "call_to_action": "<the closing call to action used>",
  "tone_notes": "<notes on tone and approach used>"
}

Guidelines:
- Address hiring manager professionally (use "Dear Hiring Manager" if name unknown)
- Start with why you're excited about this specific opportunity
- Use specific examples and quantified achievements
- Show research and genuine interest in the company
- Avoid generic templates - make it personal and specific
- End with confidence and next steps
- Use active voice and strong action verbs
- Proofread for perfect grammar and spelling
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional career advisor and expert cover letter writer. You create compelling, personalized cover letters that capture attention and demonstrate clear value proposition while maintaining authenticity and professionalism."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response received from AI');
    }

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate and ensure all required fields are present
    return {
      content: result.content || generateFallbackCoverLetter(jobTitle, companyName),
      plain_text: result.plain_text || result.content?.replace(/\n\n/g, '\n') || '',
      personalization_elements: result.personalization_elements || {
        company_specific: [companyName || 'Company research'],
        role_specific: [jobTitle || 'Role requirements'],
        value_alignment: ['Professional values', 'Career goals']
      },
      key_achievements: result.key_achievements || ['Relevant experience', 'Key qualifications'],
      call_to_action: result.call_to_action || 'I look forward to discussing how I can contribute to your team.',
      tone_notes: result.tone_notes || 'Professional and enthusiastic'
    };

  } catch (error) {
    console.error('Error in AI cover letter generation:', error);
    
    // Fallback cover letter if AI fails
    const fallbackContent = generateFallbackCoverLetter(jobTitle, companyName);
    
    return {
      content: fallbackContent,
      plain_text: fallbackContent.replace(/\n\n/g, '\n'),
      personalization_elements: {
        company_specific: [companyName || 'Your organization'],
        role_specific: [jobTitle || 'This position'],
        value_alignment: ['Professional growth', 'Team collaboration']
      },
      key_achievements: ['Relevant experience', 'Professional skills'],
      call_to_action: 'I would welcome the opportunity to discuss how my experience can contribute to your team.',
      tone_notes: 'Professional template - manual customization recommended'
    };
  }
}

function generateFallbackCoverLetter(jobTitle: string, companyName: string): string {
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle || 'position'} at ${companyName || 'your organization'}. Based on my review of the job requirements, I believe my experience and skills make me an excellent candidate for this role.

Throughout my career, I have developed expertise in the key areas outlined in your job description. My background has provided me with a strong foundation in the technical and professional skills necessary to excel in this position. I am particularly drawn to this opportunity because it aligns with my career goals and offers the chance to contribute to meaningful work.

I am excited about the possibility of bringing my unique perspective and experience to your team. My proven track record of success, combined with my passion for professional growth, positions me well to make a valuable contribution to your organization.

Thank you for considering my application. I would welcome the opportunity to discuss how my experience and enthusiasm can contribute to your team's continued success. I look forward to hearing from you soon.

Best regards,
[Your Name]

---
Note: This is a template cover letter. For best results, please customize it with specific details about your experience, achievements, and knowledge of the company.`;
} 