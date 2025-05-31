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
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    // Get user data to check role
    const { data: userData } = await supabase
      .from('users')
      .select('role, name, email')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      name: userData?.name,
      role: userData?.role || 'USER'
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function GET(
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
    const supabase = await createClient();

    // Check if user is enrolled in the course (unless admin)
    if (user.role !== 'ADMIN') {
      const { data: enrollment } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('status', 'ACTIVE')
        .single();

      if (!enrollment) {
        return NextResponse.json(
          { message: 'Not enrolled in this course' },
          { status: 403 }
        );
      }
    }

    // Fetch quiz questions for the course
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select(`
        id,
        question_text,
        question_type,
        options,
        correct_answer,
        explanation,
        points,
        order_num
      `)
      .eq('course_id', courseId)
      .order('order_num');

    if (error) {
      console.error('Error fetching quiz questions:', error);
      return NextResponse.json(
        { message: 'Failed to fetch quiz questions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      questions: questions || []
    });

  } catch (error) {
    console.error('Error in quiz API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const user = await getAuthenticatedUser(request);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const courseId = params.id;
    const body = await request.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { message: 'Invalid questions data' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Delete existing questions for this course
    await supabase
      .from('quiz_questions')
      .delete()
      .eq('course_id', courseId);

    // Insert new questions
    const questionsToInsert = questions.map((q: any, index: number) => ({
      course_id: courseId,
      question_text: q.question_text,
      question_type: q.question_type || 'MULTIPLE_CHOICE',
      options: q.options || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      points: q.points || 1,
      order_num: index + 1
    }));

    const { data: insertedQuestions, error } = await supabase
      .from('quiz_questions')
      .insert(questionsToInsert)
      .select();

    if (error) {
      console.error('Error creating quiz questions:', error);
      return NextResponse.json(
        { message: 'Failed to create quiz questions: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Quiz questions created successfully',
      questions: insertedQuestions
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating quiz questions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 