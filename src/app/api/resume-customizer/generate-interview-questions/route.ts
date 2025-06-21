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
      job_description,
      job_title,
      company_name,
      company_intelligence,
      resume_content,
      job_application_id 
    } = await request.json();

    if (!job_description) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    // Generate interview questions using AI
    const questions = await generateInterviewQuestions(
      job_description,
      job_title,
      company_name,
      company_intelligence,
      resume_content
    );

    // Store the interview preparation data
    if (job_application_id) {
      const { error: storeError } = await supabase
        .from('interview_preparation')
        .insert({
          user_id: user.id,
          job_application_id,
          technical_questions: questions.technical || [],
          behavioral_questions: questions.behavioral || [],
          company_specific_questions: questions.company_specific || [],
          role_specific_questions: questions.role_specific || [],
          question_sources: ['AI Generated', 'Job Requirements', 'Company Research'],
          difficulty_levels: {
            technical: 'Mixed',
            behavioral: 'Standard',
            company: 'Research-based',
            role: 'Job-specific'
          },
          company_culture_notes: company_intelligence?.company_background || 'Research company culture and values',
          recent_company_news: company_intelligence?.recent_news || []
        });

      if (storeError) {
        console.error('Error storing interview preparation:', storeError);
        // Continue even if storage fails
      }
    }

    return NextResponse.json({
      success: true,
      questions: [
        ...questions.behavioral.map((q: any) => ({ ...q, type: 'behavioral' })),
        ...questions.technical.map((q: any) => ({ ...q, type: 'technical' })),
        ...questions.company_specific.map((q: any) => ({ ...q, type: 'company' })),
        ...questions.role_specific.map((q: any) => ({ ...q, type: 'role' }))
      ]
    });

  } catch (error) {
    console.error('Error in interview questions generation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateInterviewQuestions(
  jobDescription: string,
  jobTitle: string = '',
  companyName: string = '',
  companyIntelligence?: any,
  resumeContent?: string
) {
  try {
    const prompt = `
You are an expert interview coach and hiring manager. Generate comprehensive interview questions for this job application.

JOB DESCRIPTION:
${jobDescription}

JOB TITLE: ${jobTitle}
COMPANY NAME: ${companyName}

${resumeContent ? `CANDIDATE'S RESUME:
${resumeContent}
` : ''}

${companyIntelligence ? `COMPANY INTELLIGENCE:
- Company Background: ${companyIntelligence.company_background}
- Company Culture: ${companyIntelligence.company_culture?.join(', ')}
- Values: ${companyIntelligence.values?.join(', ')}
- Known For: ${companyIntelligence.known_for?.join(', ')}
- What They Value: ${companyIntelligence.interview_insights?.what_they_value?.join(', ')}
` : ''}

INSTRUCTIONS:
Generate a comprehensive set of interview questions across four categories. Each question should include tips for answering effectively and personalized suggested answers based on the candidate's resume.

Provide your response in the following JSON format:
{
  "behavioral": [
    {
      "question": "<behavioral question>",
      "tips": "<advice for answering this question>",
      "suggested_answer": "<personalized guidance based on the candidate's resume>",
      "category": "<leadership|teamwork|problem_solving|communication|etc>",
      "difficulty": "<easy|medium|hard>"
    }
  ],
  "technical": [
    {
      "question": "<technical question>",
      "tips": "<advice for answering this question>",
      "suggested_answer": "<personalized guidance based on the candidate's resume>",
      "category": "<skills|tools|methodologies|experience>",
      "difficulty": "<easy|medium|hard>"
    }
  ],
  "company_specific": [
    {
      "question": "<company-specific question>",
      "tips": "<advice for answering this question>",
      "suggested_answer": "<personalized guidance based on the candidate's resume>",
      "category": "<culture|values|goals|industry>",
      "difficulty": "<easy|medium|hard>"
    }
  ],
  "role_specific": [
    {
      "question": "<role-specific question>",
      "tips": "<advice for answering this question>",
      "suggested_answer": "<personalized guidance based on the candidate's resume>",
      "category": "<responsibilities|challenges|growth>",
      "difficulty": "<easy|medium|hard>"
    }
  ]
}

Guidelines:
- Generate 6-8 questions per category
- Mix difficulty levels (easy, medium, hard)
- Include common interview questions and job-specific ones
- Provide actionable tips using STAR method where appropriate
- Create personalized suggested answers based on the candidate's resume content
- Reference specific experiences, skills, or achievements from the resume in suggested answers
- Include questions about company culture and values
- Add situational and hypothetical questions
- Cover both hard and soft skills
- Include questions candidates should ask the interviewer
- Make suggested answers specific to the candidate's background and the target role
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert interview coach with extensive experience in various industries. You help candidates prepare for interviews by providing realistic questions and strategic advice for answering them effectively."
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
      behavioral: result.behavioral || generateFallbackBehavioralQuestions(),
      technical: result.technical || generateFallbackTechnicalQuestions(jobTitle),
      company_specific: result.company_specific || generateFallbackCompanyQuestions(companyName),
      role_specific: result.role_specific || generateFallbackRoleQuestions(jobTitle)
    };

  } catch (error) {
    console.error('Error in AI interview questions generation:', error);
    
    // Fallback questions if AI fails
    return {
      behavioral: generateFallbackBehavioralQuestions(),
      technical: generateFallbackTechnicalQuestions(jobTitle),
      company_specific: generateFallbackCompanyQuestions(companyName),
      role_specific: generateFallbackRoleQuestions(jobTitle)
    };
  }
}

function generateFallbackBehavioralQuestions() {
  return [
    {
      question: "Tell me about yourself and your professional background.",
      tips: "Focus on relevant experience and skills. Use a structured approach: current situation, past experience, future goals.",
      suggested_answer: "Structure your response around your current role, relevant past experiences, and how they align with this position. Keep it concise (2-3 minutes).",
      category: "introduction",
      difficulty: "easy"
    },
    {
      question: "Describe a challenging situation you faced at work and how you handled it.",
      tips: "Use the STAR method (Situation, Task, Action, Result). Focus on your problem-solving skills and positive outcome.",
      suggested_answer: "Choose a specific challenge from your experience, explain the context, describe your actions, and highlight the positive results achieved.",
      category: "problem_solving",
      difficulty: "medium"
    },
    {
      question: "Tell me about a time when you had to work with a difficult team member.",
      tips: "Show your interpersonal skills and ability to handle conflict professionally. Focus on resolution and teamwork.",
      suggested_answer: "Describe the situation professionally, explain your approach to building understanding, and highlight how you maintained team productivity.",
      category: "teamwork",
      difficulty: "medium"
    },
    {
      question: "What are your greatest strengths and how do they apply to this role?",
      tips: "Choose strengths that are relevant to the job. Provide specific examples of how you've demonstrated these strengths.",
      suggested_answer: "Identify 2-3 key strengths from your background that directly relate to the job requirements, with concrete examples.",
      category: "strengths",
      difficulty: "easy"
    },
    {
      question: "Describe a time when you had to learn something new quickly.",
      tips: "Show your adaptability and learning ability. Describe your learning process and the successful outcome.",
      suggested_answer: "Share a specific example of rapid learning from your experience, emphasizing your learning strategy and successful application.",
      category: "adaptability",
      difficulty: "medium"
    },
    {
      question: "Where do you see yourself in 5 years?",
      tips: "Align your goals with the company's growth opportunities. Show ambition while being realistic.",
      suggested_answer: "Connect your career progression to this role, showing how it fits into your professional development plan and aligns with company opportunities.",
      category: "career_goals",
      difficulty: "easy"
    }
  ];
}

function generateFallbackTechnicalQuestions(jobTitle: string) {
  return [
    {
      question: "What technical skills do you consider most important for this role?",
      tips: "Reference the job description and explain how your skills align. Provide specific examples of how you've used these skills.",
      suggested_answer: "Identify the key technical skills from the job description that match your background, and provide specific examples of how you've applied them.",
      category: "skills",
      difficulty: "easy"
    },
    {
      question: "Describe your experience with the tools and technologies mentioned in the job description.",
      tips: "Be honest about your experience level. If you lack experience in some areas, show willingness to learn.",
      suggested_answer: "Be honest about your experience level with each technology, highlighting where you're strong and expressing eagerness to learn where you have gaps.",
      category: "tools",
      difficulty: "medium"
    },
    {
      question: "How do you stay updated with industry trends and new technologies?",
      tips: "Mention specific resources, courses, or communities you engage with. Show commitment to continuous learning.",
      suggested_answer: "Share specific resources you use (blogs, courses, communities) and give examples of recent technologies or trends you've explored.",
      category: "learning",
      difficulty: "easy"
    },
    {
      question: "Walk me through your approach to solving a complex technical problem.",
      tips: "Describe your systematic approach: problem analysis, research, solution design, implementation, and testing.",
      suggested_answer: "Outline your step-by-step problem-solving methodology, ideally with a specific example from your experience.",
      category: "problem_solving",
      difficulty: "medium"
    },
    {
      question: "What's a project you're particularly proud of and why?",
      tips: "Choose a relevant project. Explain the challenges, your contributions, and the impact or results achieved.",
      suggested_answer: "Select a project from your background that demonstrates skills relevant to this role, focusing on your specific contributions and the measurable impact.",
      category: "experience",
      difficulty: "medium"
    }
  ];
}

function generateFallbackCompanyQuestions(companyName: string) {
  return [
    {
      question: `What interests you most about working at ${companyName || 'our company'}?`,
      tips: "Research the company's mission, values, and recent developments. Connect their goals with your career interests.",
      suggested_answer: `Research ${companyName || 'the company'}'s mission, recent news, and values. Connect what you find to your career goals and the experiences in your background.`,
      category: "motivation",
      difficulty: "easy"
    },
    {
      question: "What do you know about our company culture and values?",
      tips: "Research the company's website, social media, and employee reviews. Show alignment with their culture.",
      suggested_answer: "Demonstrate your research by mentioning specific aspects of their culture that resonate with your work style and values, as shown in your experience.",
      category: "culture",
      difficulty: "medium"
    },
    {
      question: "How do you think you would fit into our team?",
      tips: "Discuss your collaborative skills and how your working style aligns with their culture and team dynamics.",
      suggested_answer: "Reference your collaborative experiences and working style from your background, showing how they align with what you know about their team culture.",
      category: "fit",
      difficulty: "medium"
    },
    {
      question: "What questions do you have about our company or this role?",
      tips: "Prepare thoughtful questions about the role, team, company goals, and growth opportunities. Show genuine interest.",
      suggested_answer: "Ask about growth opportunities, team dynamics, success metrics, current challenges, or specific projects you'd be working on.",
      category: "engagement",
      difficulty: "easy"
    }
  ];
}

function generateFallbackRoleQuestions(jobTitle: string) {
  return [
    {
      question: `What appeals to you most about this ${jobTitle || 'position'}?`,
      tips: "Connect the role's responsibilities with your career goals and interests. Show understanding of the position.",
      suggested_answer: "Connect specific aspects of the role to your career goals and past experiences, showing genuine enthusiasm for the position's key responsibilities.",
      category: "motivation",
      difficulty: "easy"
    },
    {
      question: "What do you think would be your biggest challenge in this role?",
      tips: "Show awareness of the role's challenges and discuss how you would approach them. Turn it into a strength.",
      suggested_answer: "Identify a realistic challenge from the job description, then explain how your background and skills would help you address it effectively.",
      category: "challenges",
      difficulty: "medium"
    },
    {
      question: "How would you prioritize your responsibilities in the first 90 days?",
      tips: "Show you understand the role requirements. Discuss learning, relationship building, and early contributions.",
      suggested_answer: "Structure your answer around learning the role, building relationships, understanding priorities, and identifying early wins based on your experience.",
      category: "planning",
      difficulty: "medium"
    },
    {
      question: "What would success look like in this role after one year?",
      tips: "Reference the job description and company goals. Provide specific, measurable outcomes you'd aim to achieve.",
      suggested_answer: "Define success in terms of specific outcomes mentioned in the job description, showing how your background prepares you to achieve them.",
      category: "success",
      difficulty: "medium"
    }
  ];
} 