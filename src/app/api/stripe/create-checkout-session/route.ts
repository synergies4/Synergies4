import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

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

    return {
      id: user.id,
      email: user.email
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return NextResponse.json(
        { message: 'Stripe configuration error' },
        { status: 500 }
      );
    }

    // Validate and set base URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    
    // Validate URL format
    try {
      new URL(baseUrl);
    } catch (urlError) {
      console.error('Invalid NEXT_PUBLIC_URL:', baseUrl);
      return NextResponse.json(
        { message: 'Invalid application URL configuration' },
        { status: 500 }
      );
    }

    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { courseId, successUrl, cancelUrl } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { message: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Validate custom URLs if provided
    let validatedSuccessUrl = successUrl;
    let validatedCancelUrl = cancelUrl;

    if (successUrl) {
      try {
        new URL(successUrl);
      } catch (urlError) {
        return NextResponse.json(
          { message: 'Invalid success URL provided' },
          { status: 400 }
        );
      }
    }

    if (cancelUrl) {
      try {
        new URL(cancelUrl);
      } catch (urlError) {
        return NextResponse.json(
          { message: 'Invalid cancel URL provided' },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, description, price, image')
      .eq('id', courseId)
      .eq('status', 'PUBLISHED')
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    if (!course.price || course.price <= 0) {
      return NextResponse.json(
        { message: 'This course is free' },
        { status: 400 }
      );
    }

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('course_enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment && existingEnrollment.status === 'ACTIVE') {
      return NextResponse.json(
        { message: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Validate course image URL if provided
    let imageUrls: string[] = [];
    if (course.image) {
      try {
        new URL(course.image);
        imageUrls = [course.image];
      } catch (imageUrlError) {
        console.warn('Invalid course image URL:', course.image);
        // Continue without image rather than failing
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description || '',
              images: imageUrls,
            },
            unit_amount: Math.round(course.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: validatedSuccessUrl || `${baseUrl}/courses/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: validatedCancelUrl || `${baseUrl}/courses/${course.id}`,
      metadata: {
        courseId: course.id,
        userId: user.id,
        type: 'course_purchase'
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check if it's a Stripe-specific error
    if (error && typeof error === 'object' && 'type' in error) {
      console.error('Stripe error type:', (error as any).type);
      console.error('Stripe error code:', (error as any).code);
      console.error('Stripe error message:', (error as any).message);
    }
    
    return NextResponse.json(
      { 
        message: 'Failed to create checkout session',
        error: error instanceof Error ? error.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' && {
          details: error
        })
      },
      { status: 500 }
    );
  }
} 