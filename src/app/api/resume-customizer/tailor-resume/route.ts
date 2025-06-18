import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      original_resume, 
      job_description, 
      fit_analysis, 
      company_intelligence,
      job_application_id 
    } = await request.json();

    if (!original_resume || !job_description) {
      return NextResponse.json({ error: 'Original resume and job description are required' }, { status: 400 });
    }

    // Generate tailored resume using AI
    const tailoredResume = await generateTailoredResume(
      original_resume, 
      job_description, 
      fit_analysis, 
      company_intelligence
    );

    // Store the tailored resume
    if (job_application_id) {
      const { error: storeError } = await supabase
        .from('tailored_resumes')
        .insert({
          user_id: user.id,
          job_application_id,
          tailored_content: tailoredResume.content,
          tailored_content_plain: tailoredResume.plain_text,
          modifications_made: tailoredResume.modifications_made,
          keywords_emphasized: tailoredResume.keywords_emphasized,
          content_additions: tailoredResume.content_additions
        });

      if (storeError) {
        console.error('Error storing tailored resume:', storeError);
        // Continue even if storage fails
      }
    }

    return NextResponse.json({
      success: true,
      tailored_resume: tailoredResume.content,
      modifications_summary: tailoredResume.modifications_made,
      keywords_emphasized: tailoredResume.keywords_emphasized
    });

  } catch (error) {
    console.error('Error in resume tailoring:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateTailoredResume(
  originalResume: string, 
  jobDescription: string, 
  fitAnalysis?: any, 
  companyIntelligence?: any
) {
  try {
    const prompt = `
You are an expert resume writer and career advisor. Create a tailored version of this resume optimized for the specific job and company.

ORIGINAL RESUME:
${originalResume}

JOB DESCRIPTION:
${jobDescription}

${fitAnalysis ? `FIT ANALYSIS:
- Overall Fit Score: ${fitAnalysis.overall_fit_score}%
- Matching Skills: ${fitAnalysis.skill_matches?.join(', ')}
- Skills to Highlight: ${fitAnalysis.skill_gaps?.join(', ')}
- Key Strengths: ${fitAnalysis.strengths?.join(', ')}
- Focus Areas: ${fitAnalysis.recommended_focus_areas?.join(', ')}
` : ''}

${companyIntelligence ? `COMPANY INTELLIGENCE:
- Company Culture: ${companyIntelligence.company_culture?.join(', ')}
- Values: ${companyIntelligence.values?.join(', ')}
- Known For: ${companyIntelligence.known_for?.join(', ')}
- What They Value: ${companyIntelligence.interview_insights?.what_they_value?.join(', ')}
` : ''}

INSTRUCTIONS:
Create a tailored resume that:
1. Emphasizes relevant skills and experience for this specific job
2. Uses keywords from the job description naturally
3. Reorders/reorganizes sections to highlight most relevant information first
4. Enhances descriptions to better match job requirements
5. Adds relevant details that were understated in the original
6. Aligns with company culture and values where appropriate
7. Maintains honesty and accuracy - do not fabricate experience

Provide your response in the following JSON format:
{
  "content": "<the complete tailored resume in markdown format>",
  "plain_text": "<plain text version of the resume>",
  "modifications_made": [<array of specific changes made>],
  "keywords_emphasized": [<array of keywords added or emphasized>],
  "content_additions": [<array of new content added>],
  "reorganization_notes": "<notes on how sections were reorganized>"
}

Guidelines:
- Keep the same factual information but optimize presentation
- Use action verbs and quantified achievements
- Tailor job titles and descriptions to better match the target role
- Emphasize transferable skills
- Include relevant technical skills and certifications prominently
- Structure for ATS (Applicant Tracking System) compatibility
- Ensure consistent formatting and professional presentation
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer with expertise in crafting tailored resumes that pass through ATS systems and appeal to hiring managers. You maintain strict honesty while optimizing presentation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
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
      content: result.content || originalResume,
      plain_text: result.plain_text || originalResume.replace(/[#*`]/g, ''),
      modifications_made: result.modifications_made || ['Resume tailored for job requirements'],
      keywords_emphasized: result.keywords_emphasized || ['Relevant skills', 'Key qualifications'],
      content_additions: result.content_additions || ['Enhanced descriptions', 'Improved formatting'],
      reorganization_notes: result.reorganization_notes || 'Resume optimized for target role'
    };

  } catch (error) {
    console.error('Error in AI resume tailoring:', error);
    
    // Fallback tailored resume if AI fails
    const fallbackContent = `# TAILORED RESUME

*Note: Resume tailoring service is temporarily unavailable. Please review and customize your resume manually based on the job requirements.*

${originalResume}

---

## ADDITIONAL NOTES FOR THIS APPLICATION:
- Review job description keywords and incorporate relevant ones naturally
- Emphasize experience that aligns with the job requirements
- Highlight achievements with quantifiable results
- Ensure skills section matches job requirements
- Consider reordering sections to lead with most relevant information
`;

    return {
      content: fallbackContent,
      plain_text: fallbackContent.replace(/[#*`-]/g, ''),
      modifications_made: ['Manual tailoring recommended due to service unavailability'],
      keywords_emphasized: ['Job-relevant skills', 'Key qualifications'],
      content_additions: ['Tailoring guidance notes'],
      reorganization_notes: 'Manual review and reorganization recommended'
    };
  }
} 