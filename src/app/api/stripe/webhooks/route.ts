import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { metadata } = session;

        if (metadata?.type === 'course_purchase') {
          await handleCoursePayment(supabase, session);
        } else if (metadata?.type === 'subscription') {
          await handleSubscriptionPayment(supabase, session);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription;
        if (subscriptionId && typeof subscriptionId === 'string') {
          await handleSubscriptionRenewal(supabase, invoice);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(supabase, subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCoursePayment(supabase: any, session: Stripe.Checkout.Session) {
  const { metadata } = session;
  const courseId = metadata?.courseId;
  const userId = metadata?.userId;

  if (!courseId || !userId) {
    console.error('Missing metadata in course payment:', metadata);
    return;
  }

  try {
    // Update or create enrollment
    const { data: existingEnrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      // Update existing enrollment
      await supabase
        .from('course_enrollments')
        .update({
          payment_status: 'PAID',
          payment_id: session.payment_intent,
          status: 'ACTIVE',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEnrollment.id);
    } else {
      // Create new enrollment
      await supabase
        .from('course_enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          payment_status: 'PAID',
          payment_id: session.payment_intent,
          payment_amount: (session.amount_total || 0) / 100,
          status: 'ACTIVE',
          enrolled_at: new Date().toISOString()
        });
    }

    // Initialize lesson progress
    await initializeLessonProgress(supabase, userId, courseId);

    console.log(`Course payment completed for user ${userId}, course ${courseId}`);
    
  } catch (error) {
    console.error('Error handling course payment:', error);
  }
}

async function handleSubscriptionPayment(supabase: any, session: Stripe.Checkout.Session) {
  const { metadata } = session;
  const userId = metadata?.userId;
  const planId = metadata?.planId;

  if (!userId || !planId) {
    console.error('Missing metadata in subscription payment:', metadata);
    return;
  }

  try {
    // Get subscription details from Stripe
    const subscriptionId = (session as any).subscription;
    if (subscriptionId && typeof subscriptionId === 'string') {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Create or update subscription record
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          plan_id: planId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      console.log(`Subscription created for user ${userId}, plan ${planId}`);
    }
    
  } catch (error) {
    console.error('Error handling subscription payment:', error);
  }
}

async function handleSubscriptionRenewal(supabase: any, invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription;
    if (subscriptionId && typeof subscriptionId === 'string') {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);

      console.log(`Subscription renewed: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error handling subscription renewal:', error);
  }
}

async function handleSubscriptionCancellation(supabase: any, subscription: Stripe.Subscription) {
  try {
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    console.log(`Subscription cancelled: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
  try {
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    console.log(`Subscription updated: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function initializeLessonProgress(supabase: any, userId: string, courseId: string) {
  try {
    // Get course enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (!enrollment) return;

    // Get all lessons for the course
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .order('order_index');

    if (lessons && lessons.length > 0) {
      // Create progress records for all lessons
      const progressRecords = lessons.map(lesson => ({
        user_id: userId,
        lesson_id: lesson.id,
        enrollment_id: enrollment.id,
        status: 'NOT_STARTED'
      }));

      await supabase
        .from('lesson_progress')
        .upsert(progressRecords, { onConflict: 'user_id,lesson_id' });
    }
  } catch (error) {
    console.error('Error initializing lesson progress:', error);
  }
} 