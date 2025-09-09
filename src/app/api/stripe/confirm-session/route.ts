import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export const dynamic = 'force-dynamic';

async function getUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, courseId } = await request.json();
    if (!sessionId || !courseId) {
      return NextResponse.json({ message: 'sessionId and courseId required' }, { status: 400 });
    }

    const user = await getUser(request);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Confirm session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ message: 'Session not paid' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check existing enrollment
    const { data: existing } = await supabase
      .from('course_enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (existing) {
      if (existing.status !== 'ACTIVE') {
        await supabase
          .from('course_enrollments')
          .update({ status: 'ACTIVE', payment_status: 'PAID' })
          .eq('id', existing.id);
      }
      return NextResponse.json({ ok: true, enrolled: true });
    }

    // Create if missing
    const { error } = await supabase
      .from('course_enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        payment_status: 'PAID',
        payment_id: session.payment_intent as string,
        payment_amount: (session.amount_total || 0) / 100,
        status: 'ACTIVE',
        enrolled_at: new Date().toISOString(),
      });

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, enrolled: true });
  } catch (e) {
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}


