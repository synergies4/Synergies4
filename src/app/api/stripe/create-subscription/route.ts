import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

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

// Pre-defined pricing plans
const PRICING_PLANS = {
  starter: {
    name: 'Starter Plan',
    price: 29,
    interval: 'month',
    features: [
      '5 AI conversations per day',
      'Basic presentation templates',
      'Standard scenario simulations',
      'Email support',
      'Access to course library',
      'Mobile app access'
    ]
  },
  professional: {
    name: 'Professional Plan',
    price: 79,
    interval: 'month',
    features: [
      'Unlimited AI conversations',
      'Advanced presentation tools',
      'Custom scenario creation',
      'Priority support',
      'Advanced analytics',
      '1-on-1 coaching sessions',
      'Team collaboration tools',
      'Export capabilities'
    ]
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 199,
    interval: 'month',
    features: [
      'Everything in Professional',
      'White-label branding',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced security controls',
      'Custom reporting',
      'API access',
      'On-premise deployment'
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { planId, successUrl, cancelUrl } = await request.json();

    if (!planId || !PRICING_PLANS[planId as keyof typeof PRICING_PLANS]) {
      return NextResponse.json(
        { message: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    const supabase = await createClient();

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id, status, plan_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        { message: 'You already have an active subscription' },
        { status: 400 }
      );
    }

    // Create or get customer
    let customerId: string;
    
    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.stripe_customer_id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id
        }
      });
      
      customerId = customer.id;
      
      // Save customer ID to database
      await supabase
        .from('stripe_customers')
        .insert({
          user_id: user.id,
          stripe_customer_id: customerId,
          email: user.email
        });
    }

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: `${plan.name} - ${plan.features.join(', ')}`,
            },
            unit_amount: plan.price * 100, // Convert to cents
            recurring: {
              interval: plan.interval as 'month' | 'year',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_URL}/dashboard?subscription=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_URL}/contact#plans-pricing`,
      metadata: {
        userId: user.id,
        planId: planId,
        type: 'subscription'
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: planId
        }
      }
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { message: 'Failed to create subscription' },
      { status: 500 }
    );
  }
} 