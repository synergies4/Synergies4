# Course Enrollments Fix Guide

## Problem
The `course_enrollments` table is empty, causing:
- Users can't see their enrolled courses
- Enrollment buttons don't show status
- Admin can't see users enrolled in courses

## Root Causes
1. RLS policies were blocking access to the table
2. The table might have wrong column types
3. Webhook might not be creating enrollments properly

## Fix Steps

### Step 1: Check Table Structure and Disable RLS
Run this in Supabase SQL Editor:
```sql
-- File: sql/fix_course_enrollments.sql
```
This will:
- ✅ Disable RLS on course_enrollments table
- ✅ Check table structure
- ✅ Show current enrollment count
- ✅ Display any existing enrollments

### Step 2: Verify Webhook Configuration
The Stripe webhook creates enrollments after payment. Check:

1. **Stripe Dashboard** → Webhooks
   - Ensure webhook is pointing to: `https://your-domain.com/api/stripe/webhooks`
   - Event: `checkout.session.completed` should be enabled

2. **Environment Variables**
   Check `.env.local` has:
   ```
   STRIPE_SECRET_KEY=sk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Step 3: Test Enrollment Creation

#### Option A: Create a Test Enrollment (Manual)
1. Get your user ID:
   ```sql
   SELECT id, email FROM auth.users LIMIT 5;
   ```

2. Get a course ID:
   ```sql
   SELECT id, title FROM public.courses LIMIT 5;
   ```

3. Run the test enrollment script:
   ```sql
   -- File: sql/create_test_enrollment.sql
   -- Replace YOUR_USER_AUTH_ID and YOUR_COURSE_ID with real values
   ```

#### Option B: Test via UI (Recommended)
1. Go to a course page
2. Click "Enroll Now" (for free course) or complete Stripe checkout
3. Check if enrollment appears in database:
   ```sql
   SELECT * FROM public.course_enrollments ORDER BY enrolled_at DESC LIMIT 5;
   ```

### Step 4: Verify Enrollment Display

After creating an enrollment:

1. **User Side:**
   - Go to `/courses/my` - should see enrolled course
   - Go to course page - button should say "Continue Learning"

2. **Admin Side:**
   - Go to `/admin/enrollments` - should see enrollment in stats
   - Go to `/admin/courses/[course-id]/enrollments` - should see user

### Step 5: Debug Webhook Issues

If enrollments still aren't created after payment:

1. **Check Webhook Logs:**
   ```sql
   -- In your application logs, look for:
   -- "🎓 [webhook_xxx] Starting course payment processing..."
   -- "✅ [webhook_xxx] New enrollment created successfully"
   ```

2. **Test Webhook Locally:**
   - Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhooks`
   - Make a test payment
   - Check console output

3. **Check Database Logs:**
   - Supabase Dashboard → Logs
   - Look for any INSERT errors on course_enrollments

### Common Issues

#### Issue: "PGRST116 - No rows found"
**Solution:** This is normal when checking enrollment status for a user who hasn't enrolled yet.

#### Issue: Enrollments created but not showing
**Solution:** Check if RLS is blocking SELECT queries. Run:
```sql
ALTER TABLE public.course_enrollments DISABLE ROW LEVEL SECURITY;
```

#### Issue: Webhook creates enrollment but button still shows "Enroll"
**Solution:** Clear browser cache or check network tab for API errors.

#### Issue: User ID mismatch
**Solution:** Ensure webhook uses `auth_user_id` from auth.users, not the internal user ID.

### Re-enable RLS (After Testing)

Once everything works, you can re-enable RLS with proper policies:
```sql
-- Re-enable RLS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own enrollments
CREATE POLICY "Users can view own enrollments"
ON public.course_enrollments FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to create enrollments (needed for free courses)
CREATE POLICY "Users can create enrollments"
ON public.course_enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to see all enrollments
CREATE POLICY "Admins can view all enrollments"
ON public.course_enrollments FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_user_id = auth.uid()
        AND role = 'ADMIN'
    )
);

-- Allow service role (for webhooks) to create enrollments
CREATE POLICY "Service role can manage enrollments"
ON public.course_enrollments FOR ALL
USING (true);
```

### Need More Help?

Check these logs:
1. Vercel/deployment logs for webhook errors
2. Supabase logs for database errors
3. Browser console for frontend API errors
4. Stripe webhook logs for payment processing

