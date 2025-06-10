import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header or invalid format');
      return null;
    }

    const token = authHeader.substring(7);
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error('Supabase auth error:', error);
      return null;
    }
    
    if (!user) {
      console.error('No user found for token');
      return null;
    }

    console.log('User authenticated:', user.id, user.email);
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
    console.log('Starting subscription creation...');
    
    // Try server-side auth first
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    let authenticatedUser;
    
    if (authError || !user) {
      console.error('Server-side auth failed, trying token auth...');
      const tokenUser = await getAuthenticatedUser(request);
      if (!tokenUser) {
        console.error('Both auth methods failed');
        return NextResponse.json(
          { message: 'Authentication required' },
          { status: 401 }
        );
      }
      // Use token user data
      authenticatedUser = tokenUser;
    } else {
      // Use server-side user data
      authenticatedUser = {
        id: user.id,
        email: user.email
      };
    }

    console.log('Authenticated user:', authenticatedUser.id);

    const { planId, successUrl, cancelUrl } = await request.json();
    console.log('Request data:', { planId, successUrl, cancelUrl });

    if (!planId || !PRICING_PLANS[planId as keyof typeof PRICING_PLANS]) {
      console.error('Invalid plan ID:', planId);
      return NextResponse.json(
        { message: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    console.log('Selected plan:', plan.name, plan.price);

    // Check if user already has an active subscription
    const { data: existingSubscription, error: subscriptionCheckError } = await supabase
      .from('subscriptions')
      .select('id, status, plan_id')
      .eq('user_id', authenticatedUser.id)
      .eq('status', 'active')
      .single();

    if (subscriptionCheckError && subscriptionCheckError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', subscriptionCheckError);
      return NextResponse.json(
        { message: 'Database error checking subscription' },
        { status: 500 }
      );
    }

    if (existingSubscription) {
      console.log('User already has active subscription:', existingSubscription.plan_id);
      return NextResponse.json(
        { message: 'You already have an active subscription' },
        { status: 400 }
      );
    }

    // Create or get customer
    let customerId: string;
    
    // Check if customer already exists
    const { data: existingCustomer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', authenticatedUser.id)
      .single();

    if (customerError && customerError.code !== 'PGRST116') {
      console.error('Error checking existing customer:', customerError);
      return NextResponse.json(
        { message: 'Database error checking customer' },
        { status: 500 }
      );
    }

    if (existingCustomer) {
      customerId = existingCustomer.stripe_customer_id;
      console.log('Using existing customer:', customerId);
    } else {
      console.log('Creating new Stripe customer...');
      // Create new customer
      const customer = await stripe.customers.create({
        email: authenticatedUser.email,
        metadata: {
          userId: authenticatedUser.id
        }
      });
      
      customerId = customer.id;
      console.log('Created new customer:', customerId);
      
      // Save customer ID to database
      const { error: insertError } = await supabase
        .from('stripe_customers')
        .insert({
          user_id: authenticatedUser.id,
          stripe_customer_id: customerId,
          email: authenticatedUser.email
        });

      if (insertError) {
        console.error('Error saving customer to database:', insertError);
        return NextResponse.json(
          { message: 'Database error saving customer' },
          { status: 500 }
        );
      }
    }

    // Create checkout session for subscription
    console.log('Creating Stripe checkout session...');
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
        userId: authenticatedUser.id,
        planId: planId,
        type: 'subscription'
      },
      subscription_data: {
        metadata: {
          userId: authenticatedUser.id,
          planId: planId
        }
      }
    });

    console.log('Checkout session created:', session.id);

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