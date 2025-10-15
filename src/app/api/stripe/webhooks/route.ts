import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia' as any,
  });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`🔄 [${webhookId}] Webhook received - Starting processing...`);
  
  try {
    const stripe = getStripeClient();
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    console.log(`📝 [${webhookId}] Request body length: ${body.length} characters`);
    console.log(`🔑 [${webhookId}] Signature present: ${!!signature}`);

    if (!signature) {
      console.error(`❌ [${webhookId}] Missing stripe-signature header`);
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      console.log(`🔐 [${webhookId}] Verifying webhook signature...`);
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
      console.log(`✅ [${webhookId}] Webhook signature verified successfully`);
    } catch (err) {
      console.error(`❌ [${webhookId}] Webhook signature verification failed:`, err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`📊 [${webhookId}] Event details:`, {
      id: event.id,
      type: event.type,
      created: new Date(event.created * 1000).toISOString(),
      livemode: event.livemode,
      api_version: event.api_version
    });

    const supabase = await createClient();
    console.log(`🔗 [${webhookId}] Supabase client created`);

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log(`💰 [${webhookId}] Processing checkout.session.completed event`);
        const session = event.data.object as Stripe.Checkout.Session;
        const { metadata } = session;
        
        console.log(`📋 [${webhookId}] Session metadata:`, metadata);
        console.log(`💳 [${webhookId}] Payment details:`, {
          amount_total: session.amount_total,
          currency: session.currency,
          payment_status: session.payment_status,
          customer_email: session.customer_email
        });

        if (metadata?.type === 'course_purchase') {
          console.log(`🎓 [${webhookId}] Processing course purchase for course: ${metadata.courseId}, user: ${metadata.userId}`);
          await handleCoursePayment(supabase, session);
        } else if (metadata?.type === 'subscription') {
          console.log(`📅 [${webhookId}] Processing subscription payment for plan: ${metadata.planId}, user: ${metadata.userId}`);
          await handleSubscriptionPayment(stripe, supabase, session);
        } else {
          console.warn(`⚠️ [${webhookId}] Unknown metadata type: ${metadata?.type}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        console.log(`💳 [${webhookId}] Processing invoice.payment_succeeded event`);
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription;
        
        console.log(`📄 [${webhookId}] Invoice details:`, {
          id: invoice.id,
          amount_paid: invoice.amount_paid,
          currency: invoice.currency,
          subscription_id: subscriptionId
        });
        
        if (subscriptionId && typeof subscriptionId === 'string') {
          console.log(`🔄 [${webhookId}] Processing subscription renewal for: ${subscriptionId}`);
          await handleSubscriptionRenewal(stripe, supabase, invoice);
        } else {
          console.warn(`⚠️ [${webhookId}] No valid subscription ID found in invoice`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        console.log(`🗑️ [${webhookId}] Processing customer.subscription.deleted event`);
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log(`📅 [${webhookId}] Subscription details:`, {
          id: subscription.id,
          status: subscription.status,
          customer: subscription.customer
        });
        
        await handleSubscriptionCancellation(supabase, subscription);
        break;
      }

      case 'customer.subscription.updated': {
        console.log(`✏️ [${webhookId}] Processing customer.subscription.updated event`);
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log(`📅 [${webhookId}] Subscription details:`, {
          id: subscription.id,
          status: subscription.status,
          customer: subscription.customer,
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
        });
        
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      default:
        console.log(`❓ [${webhookId}] Unhandled event type: ${event.type}`);
        console.log(`📋 [${webhookId}] Event data:`, JSON.stringify(event.data, null, 2));
    }

    console.log(`✅ [${webhookId}] Webhook processing completed successfully`);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error(`💥 [${webhookId}] Webhook error:`, error);
    console.error(`📋 [${webhookId}] Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCoursePayment(supabase: any, session: Stripe.Checkout.Session) {
  const webhookId = `course_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`🎓 [${webhookId}] Starting course payment processing...`);
  
  const { metadata } = session;
  const courseId = metadata?.courseId;
  const userId = metadata?.userId;

  console.log(`📋 [${webhookId}] Payment details:`, {
    courseId,
    userId,
    payment_intent: session.payment_intent,
    amount_total: session.amount_total,
    currency: session.currency,
    customer_email: session.customer_email
  });

  if (!courseId || !userId) {
    console.error(`❌ [${webhookId}] Missing metadata in course payment:`, metadata);
    return;
  }

  try {
    console.log(`🔍 [${webhookId}] Checking for existing enrollment...`);
    
    // Update or create enrollment
    const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
      .from('course_enrollments')
      .select('id, status, payment_status')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (enrollmentCheckError && enrollmentCheckError.code !== 'PGRST116') {
      console.error(`❌ [${webhookId}] Error checking existing enrollment:`, enrollmentCheckError);
      throw enrollmentCheckError;
    }

    if (existingEnrollment) {
      console.log(`📝 [${webhookId}] Found existing enrollment:`, {
        enrollment_id: existingEnrollment.id,
        current_status: existingEnrollment.status,
        current_payment_status: existingEnrollment.payment_status
      });
      
      console.log(`🔄 [${webhookId}] Updating existing enrollment...`);
      
      // Update existing enrollment
      const { data: updatedEnrollment, error: updateError } = await supabase
        .from('course_enrollments')
        .update({
          payment_status: 'PAID',
          payment_id: session.payment_intent,
          status: 'ACTIVE',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEnrollment.id)
        .select()
        .single();

      if (updateError) {
        console.error(`❌ [${webhookId}] Error updating enrollment:`, updateError);
        throw updateError;
      }

      console.log(`✅ [${webhookId}] Enrollment updated successfully:`, {
        enrollment_id: updatedEnrollment.id,
        new_status: updatedEnrollment.status,
        new_payment_status: updatedEnrollment.payment_status
      });
    } else {
      console.log(`🆕 [${webhookId}] No existing enrollment found, creating new enrollment...`);
      
      // Create new enrollment
      const enrollmentData = {
        user_id: userId,
        course_id: courseId,
        payment_status: 'PAID',
        payment_id: session.payment_intent,
        payment_amount: (session.amount_total || 0) / 100,
        status: 'ACTIVE',
        enrolled_at: new Date().toISOString()
      };

      console.log(`📝 [${webhookId}] Creating enrollment with data:`, enrollmentData);

      const { data: newEnrollment, error: insertError } = await supabase
        .from('course_enrollments')
        .insert(enrollmentData)
        .select()
        .single();

      if (insertError) {
        console.error(`❌ [${webhookId}] Error creating enrollment:`, insertError);
        throw insertError;
      }

      console.log(`✅ [${webhookId}] New enrollment created successfully:`, {
        enrollment_id: newEnrollment.id,
        user_id: newEnrollment.user_id,
        course_id: newEnrollment.course_id,
        status: newEnrollment.status,
        payment_status: newEnrollment.payment_status
      });
    }

    console.log(`📚 [${webhookId}] Initializing lesson progress...`);
    
    // Initialize lesson progress
    await initializeLessonProgress(supabase, userId, courseId);

    console.log(`🎉 [${webhookId}] Course payment processing completed successfully for user ${userId}, course ${courseId}`);
    
  } catch (error) {
    console.error(`💥 [${webhookId}] Error handling course payment:`, error);
    console.error(`📋 [${webhookId}] Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    throw error; // Re-throw to be handled by the main webhook handler
  }
}

async function handleSubscriptionPayment(stripe: Stripe, supabase: any, session: Stripe.Checkout.Session) {
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
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      // Initialize/update user content settings based on subscription plan
      let maxPresentations = 5;
      let maxConversations = 10;
      
      switch (planId) {
        case 'starter':
          maxPresentations = 20;
          maxConversations = 50;
          break;
        case 'professional':
          maxPresentations = 50;
          maxConversations = 200;
          break;
        case 'enterprise':
          maxPresentations = 100;
          maxConversations = 500;
          break;
      }

      await supabase
        .from('user_content_settings')
        .upsert({
          user_id: userId,
          subscription_id: subscription.id,
          plan_type: planId,
          max_presentations: maxPresentations,
          max_conversations: maxConversations,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      console.log(`Subscription created for user ${userId}, plan ${planId} with limits: ${maxPresentations} presentations, ${maxConversations} conversations`);
    }
    
  } catch (error) {
    console.error('Error handling subscription payment:', error);
  }
}

async function handleSubscriptionRenewal(stripe: Stripe, supabase: any, invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription;
    if (subscriptionId && typeof subscriptionId === 'string') {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
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
    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    // Reset user content settings to free tier
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (subscriptionData) {
      await supabase
        .from('user_content_settings')
        .update({
          plan_type: 'free',
          max_presentations: 5,
          max_conversations: 10,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', subscriptionData.user_id);
    }

    console.log(`Subscription cancelled: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
  try {
    // Get current subscription data to check for plan changes
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('user_id, plan_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    // Update subscription record
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    // Update user content settings if subscription is active
    if (currentSub && subscription.status === 'active') {
      let maxPresentations = 5;
      let maxConversations = 10;
      
      // Get plan from subscription metadata or current plan
      const planId = currentSub.plan_id;
      
      switch (planId) {
        case 'starter':
          maxPresentations = 20;
          maxConversations = 50;
          break;
        case 'professional':
          maxPresentations = 50;
          maxConversations = 200;
          break;
        case 'enterprise':
          maxPresentations = 100;
          maxConversations = 500;
          break;
      }

      await supabase
        .from('user_content_settings')
        .upsert({
          user_id: currentSub.user_id,
          plan_type: planId,
          max_presentations: maxPresentations,
          max_conversations: maxConversations,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }

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
      const progressRecords = lessons.map((lesson: any) => ({
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