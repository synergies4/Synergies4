import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user onboarding data
    const { data: onboarding, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching onboarding data:', error);
      return NextResponse.json({ error: 'Failed to fetch onboarding data' }, { status: 500 });
    }

    return NextResponse.json({ 
      onboarding: onboarding || null,
      hasCompletedOnboarding: onboarding?.onboarding_completed || false
    });

  } catch (error) {
    console.error('Error in onboarding GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      full_name,
      job_title,
      company,
      industry,
      years_experience,
      team_size,
      primary_role,
      secondary_roles,
      management_level,
      biggest_challenges,
      primary_goals,
      pain_points,
      success_metrics,
      company_size,
      work_environment,
      team_structure,
      technology_stack,
      learning_style,
      preferred_content_types,
      time_availability,
      coaching_style,
      communication_tone,
      feedback_frequency,
      focus_areas,
      skill_levels,
      timezone,
      completed_steps,
      onboarding_completed
    } = body;

    // Check if onboarding data already exists
    const { data: existing } = await supabase
      .from('user_onboarding')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('user_onboarding')
        .update({
          full_name,
          job_title,
          company,
          industry,
          years_experience,
          team_size,
          primary_role,
          secondary_roles,
          management_level,
          biggest_challenges,
          primary_goals,
          pain_points,
          success_metrics,
          company_size,
          work_environment,
          team_structure,
          technology_stack,
          learning_style,
          preferred_content_types,
          time_availability,
          coaching_style,
          communication_tone,
          feedback_frequency,
          focus_areas,
          skill_levels,
          timezone,
          completed_steps,
          onboarding_completed,
          onboarding_completed_at: onboarding_completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating onboarding:', error);
        return NextResponse.json({ error: 'Failed to update onboarding data' }, { status: 500 });
      }
      
      result = data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('user_onboarding')
        .insert({
          user_id: user.id,
          full_name,
          job_title,
          company,
          industry,
          years_experience,
          team_size,
          primary_role,
          secondary_roles,
          management_level,
          biggest_challenges,
          primary_goals,
          pain_points,
          success_metrics,
          company_size,
          work_environment,
          team_structure,
          technology_stack,
          learning_style,
          preferred_content_types,
          time_availability,
          coaching_style,
          communication_tone,
          feedback_frequency,
          focus_areas,
          skill_levels,
          timezone,
          completed_steps,
          onboarding_completed,
          onboarding_completed_at: onboarding_completed ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating onboarding:', error);
        return NextResponse.json({ error: 'Failed to create onboarding data' }, { status: 500 });
      }
      
      result = data;
    }

    return NextResponse.json({ 
      onboarding: result,
      message: existing ? 'Onboarding updated successfully' : 'Onboarding created successfully'
    });

  } catch (error) {
    console.error('Error in onboarding POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 