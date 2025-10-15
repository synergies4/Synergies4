# Critical: Stripe Webhook & Enrollment Fix

## Problem
After paying for a course:
- ❌ SSL error: `ERR_SSL_UNRECOGNIZED_NAME_ALERT`
- ❌ Course not appearing in `/courses/my`
- ❌ No enrollment created in database

## Root Causes
1. **Wrong redirect URL** - Using Vercel URL instead of custom domain
2. **Webhook not configured** - Stripe isn't sending events to create enrollments
3. **Environment variable mismatch** - `NEXT_PUBLIC_URL` doesn't match actual domain

---

## Fix 1: Update Environment Variables

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Update or add:

```env
NEXT_PUBLIC_URL=https://synergies4ai.com
```

4. **Redeploy** your application after changing this

### Verify in Production:
Run this in your browser console on your site:
```javascript
console.log(window.location.origin); // Should be: https://synergies4ai.com
```

---

## Fix 2: Configure Stripe Webhook

### Step 1: Add Webhook Endpoint in Stripe

1. Go to **Stripe Dashboard** → [Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Set **Endpoint URL** to:
   ```
   https://synergies4ai.com/api/stripe/webhooks
   ```
4. Click **"Select events"** and add these events:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.updated`

5. Click **"Add endpoint"**

### Step 2: Get Webhook Secret

After creating the webhook:
1. Click on the webhook you just created
2. Click **"Reveal"** next to **Signing secret**
3. Copy the secret (starts with `whsec_...`)

### Step 3: Add Webhook Secret to Vercel

1. Go to Vercel project settings → Environment Variables
2. Add or update:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```
3. **Redeploy** your application

---

## Fix 3: Test the Webhook

### Option A: Using Stripe Test Mode

1. In Stripe Dashboard, use **Test mode**
2. Go to your site and try purchasing a course with test card:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits
   ```

3. After "paying", check:
   - ✅ Redirects to success page (no SSL error)
   - ✅ Enrollment appears in database
   - ✅ Course shows in `/courses/my`

### Option B: Check Webhook Logs

1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook
3. Check **"Events"** tab - you should see:
   - `checkout.session.completed` events
   - Status should be `succeeded` (not failed)

4. If failed, click on event to see error details

---

## Fix 4: Verify Database Configuration

### Check if RLS is Blocking Webhooks

The webhook uses a **server client** which needs special permissions.

Run this in Supabase SQL Editor:

```sql
-- Ensure course_enrollments table has RLS disabled (for now)
ALTER TABLE public.course_enrollments DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.course_enrollments TO authenticated;
GRANT ALL ON public.course_enrollments TO anon;
GRANT ALL ON public.course_enrollments TO service_role;

-- Verify permissions
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'course_enrollments';
```

---

## Fix 5: Manual Testing Script

If webhooks still don't work, use this to manually create an enrollment after a successful payment:

### Get Session ID from URL
After a successful payment, you'll see a URL like:
```
https://synergies4ai.com/courses/success?session_id=cs_test_...&course_id=cour_...
```

Copy the `session_id` value.

### Run in Supabase SQL Editor:

```sql
-- First, get the session details from Stripe Dashboard
-- Go to Payments → Click on the payment → Copy Customer ID and Course ID from metadata

-- Then insert the enrollment manually:
INSERT INTO public.course_enrollments (
    user_id,
    course_id,
    status,
    payment_status,
    payment_id,
    payment_amount,
    enrolled_at,
    progress_percentage
)
VALUES (
    'YOUR_AUTH_USER_ID',  -- Get from auth.users table
    'YOUR_COURSE_ID',     -- From URL parameter or Stripe metadata
    'ACTIVE',
    'PAID',
    'STRIPE_PAYMENT_INTENT_ID',  -- From Stripe Dashboard
    0,  -- Price paid (0 or actual amount)
    NOW(),
    0
);
```

---

## Debugging Steps

### 1. Check Application Logs

In Vercel Dashboard → Your Project → Logs, search for:
- ❌ `Error handling course payment`
- ❌ `Webhook signature verification failed`
- ✅ `New enrollment created successfully`

### 2. Check Stripe Event Logs

In Stripe Dashboard → Webhooks → Your Webhook → Events:
- Look for `checkout.session.completed` events
- Check if they have `succeeded` or `failed` status
- If failed, read the error message

### 3. Verify Metadata

In Stripe Dashboard → Payments → Recent payment → Metadata:
Should show:
```
type: course_purchase
courseId: cour_xxxxx
userId: xxxxxxx
```

If metadata is missing, the webhook won't create the enrollment!

---

## Expected Flow (When Working)

1. **User clicks "Enroll Now"** → API creates Stripe checkout session
2. **User pays** → Stripe redirects to `https://synergies4ai.com/courses/success?session_id=cs_...`
3. **Stripe webhook fires** → Calls `/api/stripe/webhooks`
4. **Webhook handler** → Creates enrollment in `course_enrollments` table
5. **Success page polls** → Checks if enrollment exists
6. **User sees course** → In `/courses/my` and can start learning

---

## Quick Checklist

Before testing again, verify:

- [ ] `NEXT_PUBLIC_URL=https://synergies4ai.com` in Vercel
- [ ] Webhook endpoint: `https://synergies4ai.com/api/stripe/webhooks`
- [ ] Webhook secret in Vercel: `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Webhook events include: `checkout.session.completed`
- [ ] RLS disabled on `course_enrollments` table
- [ ] Application redeployed after env var changes
- [ ] Using Stripe test mode for testing

---

## After Everything Works

Once enrollments are working, you can:
1. Re-enable RLS with proper policies (see `ENROLLMENT_FIX_GUIDE.md`)
2. Switch Stripe to live mode
3. Update test cards to real payment methods

---

## Still Not Working?

Run the diagnostic SQL:
```sql
-- File: sql/diagnose_enrollments.sql
```

Or create a manual test enrollment:
```sql
-- File: sql/quick_test_enrollment.sql
```

Or check the webhook logs:
1. Vercel → Logs → Filter by `/api/stripe/webhooks`
2. Look for the webhook ID in square brackets `[webhook_xxxxx]`
3. Check what error occurred

