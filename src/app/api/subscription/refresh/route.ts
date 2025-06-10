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

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get user's stripe customer ID
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!customerData) {
      return NextResponse.json(
        { message: 'No customer found' },
        { status: 404 }
      );
    }

    // Fetch active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerData.stripe_customer_id,
      status: 'active',
      limit: 10,
    });

    console.log('Found subscriptions:', subscriptions.data.length);

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0]; // Get the most recent active subscription

      // Update subscription in database
      const { data: updatedSubscription, error: updateError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          plan_id: subscription.metadata?.planId || 'starter',
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'stripe_subscription_id'
        });

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return NextResponse.json(
          { message: 'Failed to update subscription' },
          { status: 500 }
        );
      }

      // Update user content settings based on plan
      const planId = subscription.metadata?.planId || 'starter';
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

      const { error: settingsError } = await supabase
        .from('user_content_settings')
        .upsert({
          user_id: user.id,
          subscription_id: subscription.id,
          plan_type: planId,
          max_presentations: maxPresentations,
          max_conversations: maxConversations,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (settingsError) {
        console.error('Error updating content settings:', settingsError);
      }

      // Get updated usage counts
      const { count: presentationsCount } = await supabase
        .from('user_presentations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: conversationsCount } = await supabase
        .from('user_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_archived', false);

      return NextResponse.json({
        subscription: updatedSubscription,
        usage: {
          currentPresentations: presentationsCount || 0,
          currentConversations: conversationsCount || 0,
          maxPresentations,
          maxConversations,
          planType: planId
        }
      });
    } else {
      // No active subscriptions found
      return NextResponse.json(
        { message: 'No active subscription found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error refreshing subscription:', error);
    return NextResponse.json(
      { 
        message: 'Failed to refresh subscription',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 