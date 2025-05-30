import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const supabase = createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const courseId = params.id;
    const body = await request.json();
    const { enrollmentId, answers } = body;

    if (!enrollmentId || !answers) {
      return NextResponse.json(
        { message: 'Missing required data' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Verify enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('id', enrollmentId)
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'ACTIVE')
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { message: 'Invalid enrollment' },
        { status: 403 }
      );
    }

    // Get quiz questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, correct_answer, points')
      .eq('course_id', courseId);

    if (questionsError || !questions) {
      return NextResponse.json(
        { message: 'Failed to fetch quiz questions' },
        { status: 500 }
      );
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const answerResults: any[] = [];

    for (const question of questions) {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correct_answer;
      
      if (isCorrect) {
        earnedPoints += question.points;
      }

      answerResults.push({
        question_id: question.id,
        user_answer: userAnswer || '',
        is_correct: isCorrect,
        points_earned: isCorrect ? question.points : 0
      });
    }

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    // Create quiz attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        course_id: courseId,
        enrollment_id: enrollmentId,
        score: earnedPoints,
        total_points: totalPoints,
        percentage,
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        answers: answers
      })
      .select('id')
      .single();

    if (attemptError) {
      console.error('Error creating quiz attempt:', attemptError);
      return NextResponse.json(
        { message: 'Failed to save quiz attempt' },
        { status: 500 }
      );
    }

    // Save individual answers
    const answersToInsert = answerResults.map(result => ({
      attempt_id: attempt.id,
      question_id: result.question_id,
      user_answer: result.user_answer,
      is_correct: result.is_correct,
      points_earned: result.points_earned
    }));

    const { error: answersError } = await supabase
      .from('quiz_answers')
      .insert(answersToInsert);

    if (answersError) {
      console.error('Error saving quiz answers:', answersError);
      // Don't fail the request as the attempt was saved
    }

    // Update course progress if quiz passed (80% or higher)
    if (percentage >= 80) {
      await updateCourseProgressForQuiz(supabase, user.id, courseId, enrollmentId);
    }

    return NextResponse.json({
      message: 'Quiz submitted successfully',
      attemptId: attempt.id,
      score: earnedPoints,
      totalPoints,
      percentage,
      passed: percentage >= 80,
      results: answerResults
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateCourseProgressForQuiz(
  supabase: any,
  userId: string,
  courseId: string,
  enrollmentId: string
) {
  try {
    // Get current enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('progress_percentage, status')
      .eq('id', enrollmentId)
      .single();

    if (!enrollment) return;

    // If course is already completed, don't update
    if (enrollment.status === 'COMPLETED') return;

    // If progress is already 100%, mark as completed
    if (enrollment.progress_percentage >= 100) {
      await supabase
        .from('course_enrollments')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId);
    }

  } catch (error) {
    console.error('Error updating course progress for quiz:', error);
    // Don't throw error as quiz submission was successful
  }
} 