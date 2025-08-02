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

    const { resume_content, job_description, job_title, company_name } = await request.json();

    if (!resume_content || !job_description) {
      return NextResponse.json({ error: 'Resume content and job description are required' }, { status: 400 });
    }

    // Analyze job fit using AI
    const analysis = await analyzeJobFit(resume_content, job_description, job_title);

    // Store the job application data
    const { data: jobApp, error: jobError } = await supabase
      .from('job_applications')
      .insert({
        user_id: user.id,
        job_title: job_title || 'Untitled Position',
        company_name: company_name || 'Unknown Company',
        job_description,
        overall_fit_score: analysis.overall_fit_score,
        skill_matches: analysis.skill_matches,
        skill_gaps: analysis.skill_gaps,
        keyword_matches: analysis.keyword_matches,
        experience_alignment: analysis.experience_alignment,
        ai_analysis: analysis,
        recommended_focus_areas: analysis.recommended_focus_areas
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error storing job application:', jobError);
      // Continue even if storage fails
    }

    return NextResponse.json({
      success: true,
      analysis,
      job_application_id: jobApp?.id
    });

  } catch (error) {
    console.error('Error in job fit analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function analyzeJobFit(resumeContent: string, jobDescription: string, jobTitle: string = '') {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not available, using fallback analysis');
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const prompt = `
Analyze the fit between this resume and job description. Provide a comprehensive analysis with specific, actionable insights.

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

JOB TITLE: ${jobTitle}

Please provide your analysis in the following JSON format:
{
  "overall_fit_score": <number 0-100>,
  "skill_matches": [<array of specific matching skills/technologies>],
  "skill_gaps": [<array of skills mentioned in job but missing/weak in resume>],
  "keyword_matches": [<array of important keywords that match>],
  "experience_alignment": "<detailed assessment of how experience aligns>",
  "recommended_focus_areas": [<array of areas to emphasize in application>],
  "strengths": [<array of candidate's strongest points for this role>],
  "improvement_suggestions": [<array of specific suggestions to improve fit>],
  "red_flags": [<array of potential concerns employers might have>],
  "unique_value_propositions": [<array of what makes this candidate stand out>]
}

Analysis Guidelines:
- Be specific and actionable in your recommendations
- Focus on skills, experience, and qualifications that matter for this specific role
- Consider both technical and soft skills
- Look for industry experience and domain knowledge
- Assess leadership/management experience if relevant to the role
- Consider cultural fit indicators
- Provide honest assessment of gaps and how to address them
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert career advisor and recruiter with deep knowledge of various industries and job markets. Provide thorough, honest, and actionable career advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const analysisText = completion.choices[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No analysis received from AI');
    }

    // Parse the JSON response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI analysis response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate and ensure all required fields are present
    return {
      overall_fit_score: analysis.overall_fit_score || 0,
      skill_matches: analysis.skill_matches || [],
      skill_gaps: analysis.skill_gaps || [],
      keyword_matches: analysis.keyword_matches || [],
      experience_alignment: analysis.experience_alignment || '',
      recommended_focus_areas: analysis.recommended_focus_areas || [],
      strengths: analysis.strengths || [],
      improvement_suggestions: analysis.improvement_suggestions || [],
      red_flags: analysis.red_flags || [],
      unique_value_propositions: analysis.unique_value_propositions || []
    };

  } catch (error) {
    console.error('Error in AI analysis:', error);
    
    // Fallback analysis if AI fails
    return {
      overall_fit_score: 65,
      skill_matches: ['Communication', 'Problem-solving', 'Team collaboration'],
      skill_gaps: ['Specific technical skills mentioned in job description'],
      keyword_matches: ['Experience', 'Skills', 'Qualifications'],
      experience_alignment: 'Analysis temporarily unavailable. Please try again.',
      recommended_focus_areas: ['Highlight relevant experience', 'Emphasize matching skills'],
      strengths: ['Professional experience', 'Relevant background'],
      improvement_suggestions: ['Tailor resume to job requirements', 'Highlight specific achievements'],
      red_flags: [],
      unique_value_propositions: ['Diverse experience', 'Professional background']
    };
  }
} 