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

    const { job_url } = await request.json();

    if (!job_url) {
      return NextResponse.json({ error: 'Job URL is required' }, { status: 400 });
    }

    // Validate URL format
    let url: URL;
    try {
      url = new URL(job_url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Extract job information from URL
    const jobInfo = await extractJobFromUrl(job_url);

    return NextResponse.json({
      success: true,
      job_info: jobInfo
    });

  } catch (error) {
    console.error('Error in job URL extraction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function extractJobFromUrl(jobUrl: string) {
  try {
    console.log('🔍 Starting job extraction for URL:', jobUrl);

    // Fetch the webpage content
    const response = await fetch(jobUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch job page: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract text content from HTML (basic cleaning)
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Limit content length to avoid token limits
    const limitedContent = textContent.substring(0, 8000);

    console.log('📄 Extracted content length:', limitedContent.length);

    // Use AI to extract structured job information
    const jobInfo = await extractJobInfoWithAI(limitedContent, jobUrl);

    return jobInfo;

  } catch (error) {
    console.error('Error extracting job from URL:', error);
    
    // Fallback: return a partial structure with URL for manual completion
    return {
      job_title: '',
      company_name: '',
      job_description: `Unable to automatically extract job details from: ${jobUrl}\n\nPlease manually enter the job details below or try copying and pasting the job description directly.`,
      extraction_status: 'failed',
      original_url: jobUrl
    };
  }
}

async function extractJobInfoWithAI(content: string, url: string) {
  try {
    const prompt = `
You are an expert at extracting job information from web content. Analyze the following webpage content and extract the key job details.

WEBPAGE CONTENT:
${content}

SOURCE URL: ${url}

Please extract and return the following information in JSON format:
{
  "job_title": "<the job title/position name>",
  "company_name": "<the company/organization name>",
  "job_description": "<complete job description including responsibilities, requirements, qualifications, benefits, etc.>",
  "location": "<job location if mentioned>",
  "employment_type": "<full-time, part-time, contract, etc.>",
  "salary_range": "<salary information if available>",
  "key_requirements": ["<array of key requirements>"],
  "key_responsibilities": ["<array of main responsibilities>"],
  "extraction_status": "success"
}

IMPORTANT GUIDELINES:
- Extract the complete job description, including all sections (responsibilities, requirements, qualifications, benefits, company info, etc.)
- If the job title isn't clear, try to infer it from the content
- If company name isn't obvious, look for domain name or company mentions
- Include ALL relevant details in the job_description field - this will be used for resume matching
- If any field cannot be determined, use an empty string
- Ensure the job_description is comprehensive and includes all the original posting details
- Remove any irrelevant website navigation, ads, or unrelated content
- Keep the original formatting and structure where possible in the job_description

Focus on accuracy and completeness. The job_description should be detailed enough for AI resume matching.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at extracting and structuring job information from web content. You provide accurate, complete, and well-formatted job details."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
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

    // Validate required fields and provide fallbacks
    return {
      job_title: result.job_title || 'Position Title Not Found',
      company_name: result.company_name || 'Company Name Not Found',
      job_description: result.job_description || 'Job description could not be extracted. Please enter manually.',
      location: result.location || '',
      employment_type: result.employment_type || '',
      salary_range: result.salary_range || '',
      key_requirements: result.key_requirements || [],
      key_responsibilities: result.key_responsibilities || [],
      extraction_status: result.job_description ? 'success' : 'partial',
      original_url: url
    };

  } catch (error) {
    console.error('Error in AI job extraction:', error);
    
    // Fallback response
    return {
      job_title: '',
      company_name: '',
      job_description: 'AI extraction failed. Please enter job details manually.',
      location: '',
      employment_type: '',
      salary_range: '',
      key_requirements: [],
      key_responsibilities: [],
      extraction_status: 'failed',
      original_url: url
    };
  }
} 