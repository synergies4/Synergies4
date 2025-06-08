# Stripe Integration Setup Guide

## Overview
This guide will help you set up Stripe payments for your Synergize AI application, including course purchases and subscription plans.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_51R5eq8E3zn1Saf5nw9bMjK5S9bU3OlE0JY4q8V9bZMQ8BkEU2zUbaEcMmPtUQFslgrNBICSgNxARhX5seXhCRV7v000C9yhZ5E
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Application URL (for Stripe redirects)
NEXT_PUBLIC_URL=http://localhost:3000
```

**Important Notes:**
- You provided the same key twice, but both appear to be publishable keys (starting with `pk_test_`)
- You need to get your **secret key** from Stripe dashboard (starts with `sk_test_`)
- You'll need to set up webhooks in Stripe dashboard to get the webhook secret

## Getting Your Stripe Keys

1. **Log into your Stripe Dashboard**: https://dashboard.stripe.com/
2. **Get your Secret Key**:
   - Go to Developers → API keys
   - Copy your "Secret key" (starts with `sk_test_`)
3. **Set up Webhooks**:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Use URL: `https://yourdomain.com/api/stripe/webhooks`
   - Select these events:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
   - Copy the webhook signing secret (starts with `whsec_`)

## Database Setup

Run the Stripe schema to add necessary tables:

```bash
# Apply the Stripe schema to your Supabase database
psql -h your-supabase-host -U postgres -d postgres -f stripe-schema.sql
```

Or copy the contents of `stripe-schema.sql` and run it in your Supabase SQL editor.

## Features Implemented

### 1. Course Purchases
- Individual course payments via Stripe Checkout
- Automatic enrollment after successful payment
- Payment tracking in database

### 2. Subscription Plans
- **Starter Plan**: $29/month
  - 5 AI conversations per day
  - Basic presentation templates
  - Standard scenario simulations
  - Email support
  - Access to course library
  - Mobile app access

- **Professional Plan**: $79/month (Most Popular)
  - Unlimited AI conversations
  - Advanced presentation tools
  - Custom scenario creation
  - Priority support
  - Advanced analytics
  - 1-on-1 coaching sessions
  - Team collaboration tools
  - Export capabilities

- **Enterprise Plan**: $199/month
  - Everything in Professional
  - Multi-team management
  - Custom integrations
  - Dedicated account manager
  - Advanced reporting
  - SSO integration
  - API access
  - White-label options

### 3. Payment Processing
- Secure Stripe Checkout integration
- Webhook handling for payment events
- Automatic subscription management
- Payment status tracking

## API Endpoints Created

- `POST /api/stripe/create-checkout-session` - Create course purchase session
- `POST /api/stripe/create-subscription` - Create subscription checkout
- `POST /api/stripe/webhooks` - Handle Stripe webhook events

## Pages Created

- `/courses/success` - Payment success page with course access
- Updated course pages with Stripe checkout integration
- Updated contact page with subscription plan selection

## Testing

1. **Test Mode**: All keys provided are test keys, so you can safely test payments
2. **Test Cards**: Use Stripe's test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. **Webhooks**: Use Stripe CLI for local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

## Production Deployment

1. Replace test keys with live keys in production
2. Update webhook endpoint URL to your production domain
3. Ensure HTTPS is enabled for webhook security
4. Test all payment flows thoroughly

## Security Notes

- Never expose secret keys in client-side code
- Always validate webhook signatures
- Use HTTPS in production
- Implement proper error handling
- Log payment events for debugging

## Troubleshooting

### Common Issues:
1. **Webhook signature verification failed**: Check webhook secret
2. **Invalid API key**: Ensure you're using the correct secret key
3. **Payment not completing**: Check webhook endpoint is accessible
4. **Database errors**: Ensure Stripe schema is properly applied

### Debug Steps:
1. Check Stripe dashboard for payment events
2. Review webhook delivery logs
3. Check application logs for errors
4. Verify environment variables are set correctly

## Support

For Stripe-specific issues, refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)

For application-specific issues, check the application logs and ensure all environment variables are properly configured. 