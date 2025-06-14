import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface UserProfile {
  experience_level: string;
  current_role: string;
  target_role: string;
  industry: string;
  current_salary?: number;
  target_salary?: number;
  skills: string[];
  goals: string[];
  learning_style: string;
  time_commitment: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  cost: number;
  skills: string[];
  outcomes: string[];
  difficulty: string;
  format: string;
  prerequisites: string[];
}

interface ROICalculationRequest {
  profile: UserProfile;
  courses?: Course[];
  courseId?: string;
}

interface ROIProjection {
  course_id: string;
  course_title: string;
  fit_score: number;
  salary_increase: {
    year_1: number;
    year_3: number;
    year_5: number;
    lifetime: number;
  };
  roi_percentage: {
    year_1: number;
    year_3: number;
    year_5: number;
    lifetime: number;
  };
  personalized_benefits: string[];
  timeline_to_impact: string;
  confidence_score: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ROICalculationRequest = await request.json();
    const { profile, courses, courseId } = body;

    // Validate required profile fields
    if (!profile.experience_level || !profile.current_role || !profile.target_role || 
        !profile.industry || !profile.current_salary || !profile.learning_style) {
      return NextResponse.json({ 
        error: 'Incomplete profile. Please complete all required fields.' 
      }, { status: 400 });
    }

    // Save/update user profile
    const { error: profileError } = await supabase
      .from('user_career_profiles')
      .upsert({
        user_id: user.id,
        experience_level: profile.experience_level,
        current_role: profile.current_role,
        target_role: profile.target_role,
        industry: profile.industry,
        current_salary: profile.current_salary,
        target_salary: profile.target_salary,
        current_skills: profile.skills,
        career_goals: profile.goals,
        learning_style: profile.learning_style,
        time_commitment: profile.time_commitment,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.error('Profile save error:', profileError);
      return NextResponse.json({ 
        error: 'Failed to save profile' 
      }, { status: 500 });
    }

    // Get courses to analyze
    let coursesToAnalyze: Course[] = [];
    
    if (courseId) {
      // Single course analysis
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (courseError || !courseData) {
        return NextResponse.json({ 
          error: 'Course not found' 
        }, { status: 404 });
      }
      
      coursesToAnalyze = [courseData];
    } else if (courses && courses.length > 0) {
      // Multiple courses provided
      coursesToAnalyze = courses;
    } else {
      // Get all active courses from database
      const { data: allCourses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .limit(10); // Limit for performance
      
      if (coursesError) {
        console.error('Courses fetch error:', coursesError);
        return NextResponse.json({ 
          error: 'Failed to fetch courses' 
        }, { status: 500 });
      }
      
      coursesToAnalyze = allCourses || [];
    }

    // Calculate ROI for each course
    const roiProjections: ROIProjection[] = [];
    
    for (const course of coursesToAnalyze) {
      const projection = await calculateCourseROI(profile, course, user.id, supabase);
      roiProjections.push(projection);
    }

    // Sort by fit score
    roiProjections.sort((a, b) => b.fit_score - a.fit_score);

    // Save calculations to database
    const calculationsToSave = roiProjections.map(projection => ({
      user_id: user.id,
      course_id: projection.course_id,
      fit_score: projection.fit_score,
      confidence_score: projection.confidence_score,
      salary_increase_year_1: projection.salary_increase.year_1,
      salary_increase_year_3: projection.salary_increase.year_3,
      salary_increase_year_5: projection.salary_increase.year_5,
      salary_increase_lifetime: projection.salary_increase.lifetime,
      roi_percentage_year_1: projection.roi_percentage.year_1,
      roi_percentage_year_3: projection.roi_percentage.year_3,
      roi_percentage_year_5: projection.roi_percentage.year_5,
      roi_percentage_lifetime: projection.roi_percentage.lifetime,
      timeline_to_impact: projection.timeline_to_impact,
      personalized_benefits: projection.personalized_benefits,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }));

    const { error: saveError } = await supabase
      .from('course_roi_calculations')
      .upsert(calculationsToSave, {
        onConflict: 'user_id,course_id'
      });

    if (saveError) {
      console.error('ROI calculations save error:', saveError);
      // Don't return error, just log it - calculations can still be returned
    }

    // Track session
    await supabase
      .from('roi_engine_sessions')
      .insert({
        user_id: user.id,
        calculation_step_completed: true,
        courses_analyzed: roiProjections.length,
        session_source: 'api_calculation'
      });

    return NextResponse.json({
      success: true,
      projections: roiProjections,
      profile_saved: true
    });

  } catch (error) {
    console.error('ROI calculation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function calculateCourseROI(
  profile: UserProfile, 
  course: Course, 
  userId: string, 
  supabase: any
): Promise<ROIProjection> {
  
  // Get enhanced course metadata if available
  const { data: enhancedData } = await supabase
    .from('enhanced_course_metadata')
    .select('*')
    .eq('course_id', course.id)
    .single();

  // Base salary increase calculation
  const baseSalaryIncrease = calculateBaseSalaryIncrease(profile, course, enhancedData);
  
  // Calculate fit score (0-100)
  const fitScore = calculateFitScore(profile, course);
  
  // Calculate confidence score (0-100)
  const confidenceScore = calculateConfidenceScore(profile, course, enhancedData);
  
  // Calculate timeline to impact
  const timelineToImpact = calculateTimelineToImpact(profile, course, fitScore);
  
  // Generate personalized benefits
  const personalizedBenefits = generatePersonalizedBenefits(profile, course);

  // Calculate salary increases over time
  const salaryIncrease = {
    year_1: Math.floor(baseSalaryIncrease * 0.7),
    year_3: Math.floor(baseSalaryIncrease * 1.2),
    year_5: Math.floor(baseSalaryIncrease * 1.8),
    lifetime: Math.floor(baseSalaryIncrease * 12)
  };

  // Calculate ROI percentages
  const roiPercentage = {
    year_1: Math.floor((salaryIncrease.year_1 / course.cost) * 100),
    year_3: Math.floor((salaryIncrease.year_3 * 3 / course.cost) * 100),
    year_5: Math.floor((salaryIncrease.year_5 * 5 / course.cost) * 100),
    lifetime: Math.floor((salaryIncrease.lifetime / course.cost) * 100)
  };

  return {
    course_id: course.id,
    course_title: course.title,
    fit_score: fitScore,
    salary_increase: salaryIncrease,
    roi_percentage: roiPercentage,
    personalized_benefits: personalizedBenefits,
    timeline_to_impact: timelineToImpact,
    confidence_score: confidenceScore
  };
}

function calculateBaseSalaryIncrease(profile: UserProfile, course: Course, enhancedData: any): number {
  let baseSalaryIncrease = profile.current_salary ? profile.current_salary * 0.15 : 15000;
  
  // Apply enhanced data multipliers if available
  if (enhancedData?.typical_salary_increase_percentage) {
    baseSalaryIncrease = profile.current_salary ? 
      profile.current_salary * (enhancedData.typical_salary_increase_percentage / 100) : 
      enhancedData.typical_salary_increase_percentage * 1000;
  }
  
  // Experience level multipliers
  const experienceMultipliers = {
    'entry': 1.2,
    'mid': 1.0,
    'senior': 0.8,
    'executive': 0.6
  };
  
  baseSalaryIncrease *= experienceMultipliers[profile.experience_level as keyof typeof experienceMultipliers] || 1.0;
  
  // Industry multipliers
  const industryMultipliers = {
    'technology': 1.3,
    'finance': 1.2,
    'consulting': 1.1,
    'healthcare': 1.0,
    'education': 0.8,
    'retail': 0.9,
    'manufacturing': 0.9
  };
  
  baseSalaryIncrease *= industryMultipliers[profile.industry as keyof typeof industryMultipliers] || 1.0;
  
  return Math.floor(baseSalaryIncrease);
}

function calculateFitScore(profile: UserProfile, course: Course): number {
  let score = 70; // Base score
  
  // Skill alignment (0-15 points)
  const skillOverlap = course.skills.filter(skill => 
    profile.skills.some(userSkill => 
      userSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(userSkill.toLowerCase())
    )
  ).length;
  score += Math.min(skillOverlap * 3, 15);
  
  // Experience level alignment (0-10 points)
  const experienceAlignment = {
    'entry': { 'Beginner': 10, 'Intermediate': 5, 'Advanced': 0 },
    'mid': { 'Beginner': 5, 'Intermediate': 10, 'Advanced': 5 },
    'senior': { 'Beginner': 0, 'Intermediate': 5, 'Advanced': 10 },
    'executive': { 'Beginner': 0, 'Intermediate': 3, 'Advanced': 10 }
  };
  
  const difficultyScore = experienceAlignment[profile.experience_level as keyof typeof experienceAlignment]?.[course.difficulty as keyof typeof experienceAlignment.entry] || 5;
  score += difficultyScore;
  
  // Learning style alignment (0-5 points)
  const formatAlignment = {
    'self-paced': { 'Self-paced Online': 5, 'Online + Live Sessions': 3, 'Hybrid': 2, 'Live Sessions': 1 },
    'live-sessions': { 'Live Sessions': 5, 'Online + Live Sessions': 4, 'Hybrid': 3, 'Self-paced Online': 1 },
    'hybrid': { 'Hybrid': 5, 'Online + Live Sessions': 4, 'Live Sessions': 3, 'Self-paced Online': 2 },
    'cohort': { 'Live Sessions': 5, 'Hybrid': 4, 'Online + Live Sessions': 3, 'Self-paced Online': 1 }
  };
  
  const formatScore = formatAlignment[profile.learning_style as keyof typeof formatAlignment]?.[course.format as keyof typeof formatAlignment.hybrid] || 2;
  score += formatScore;
  
  return Math.min(Math.max(score, 0), 100);
}

function calculateConfidenceScore(profile: UserProfile, course: Course, enhancedData: any): number {
  let confidence = 80; // Base confidence
  
  // Higher confidence with more complete profile
  const profileCompleteness = [
    profile.experience_level,
    profile.current_role,
    profile.target_role,
    profile.industry,
    profile.current_salary,
    profile.skills.length > 0,
    profile.goals.length > 0
  ].filter(Boolean).length;
  
  confidence += Math.floor((profileCompleteness / 7) * 15);
  
  // Enhanced data boosts confidence
  if (enhancedData) {
    confidence += 5;
  }
  
  return Math.min(Math.max(confidence, 0), 100);
}

function calculateTimelineToImpact(profile: UserProfile, course: Course, fitScore: number): string {
  const baseDuration = parseInt(course.duration.match(/\d+/)?.[0] || '8');
  
  if (fitScore >= 90) return '3-6 months';
  if (fitScore >= 80) return '6-9 months';
  if (fitScore >= 70) return '9-12 months';
  return '12-18 months';
}

function generatePersonalizedBenefits(profile: UserProfile, course: Course): string[] {
  const benefits = [];
  
  benefits.push(`Advance to ${profile.target_role} role faster`);
  benefits.push(`Increase expertise in ${profile.industry} industry`);
  
  if (course.skills.some(skill => skill.toLowerCase().includes('leadership'))) {
    benefits.push('Build leadership capabilities for your career goals');
  }
  
  if (course.skills.some(skill => skill.toLowerCase().includes('ai') || skill.toLowerCase().includes('data'))) {
    benefits.push('Gain competitive advantage in current market');
  }
  
  benefits.push('Enhance your professional network');
  
  return benefits.slice(0, 4); // Return top 4 benefits
}

// GET endpoint for retrieving cached ROI calculations
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const limit = parseInt(searchParams.get('limit') || '5');

    let query = supabase
      .from('course_roi_calculations')
      .select(`
        *,
        courses:course_id (
          title,
          cost,
          duration
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('fit_score', { ascending: false });

    if (courseId) {
      query = query.eq('course_id', courseId);
    } else {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('ROI fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch ROI data' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      calculations: data || []
    });

  } catch (error) {
    console.error('ROI fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 