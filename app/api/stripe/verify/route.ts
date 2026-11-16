import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendProWelcomeEmail } from '@/lib/email/emailService';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const sessionId = body?.sessionId;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 });
    }

    // Retrieve checkout session securely from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    const sessionUserId = session.client_reference_id || session.metadata?.supabase_user_id;
    if (sessionUserId && sessionUserId !== user.id) {
      return NextResponse.json({ error: 'La sesión no coincide con el usuario activo' }, { status: 403 });
    }

    const isPaid = session.payment_status === 'paid' || session.status === 'complete';
    if (!isPaid) {
      return NextResponse.json({ isPremium: false, status: session.status });
    }

    const sub = session.subscription as any;
    const interval = sub?.items?.data?.[0]?.price?.recurring?.interval;
    const plan = session.metadata?.plan || (interval === 'year' ? 'yearly' : 'monthly');
    const periodEnd = sub?.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

    // Check if user was already premium before update to prevent duplicate welcome emails
    const { data: previousProfile } = await supabaseAdmin
      .from('profiles')
      .select('is_premium, full_name, username')
      .eq('id', user.id)
      .maybeSingle();

    const isFirstTimePro = !previousProfile?.is_premium;

    // Immediately grant Klozet Pro in Supabase without waiting for webhook
    await supabaseAdmin
      .from('profiles')
      .update({
        is_premium: true,
        subscription_tier: 'premium',
        subscription_plan: plan,
        subscription_status: sub?.status || 'active',
        subscription_period_end: periodEnd,
        stripe_customer_id: customerId,
        stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : sub?.id,
        stripe_price_id: sub?.items?.data?.[0]?.price?.id,
      } as any)
      .eq('id', user.id);

    // Enviar email de bienvenida y agradecimiento por comprar Pro si es nueva activación
    if (isFirstTimePro && user.email) {
      const formattedDate = periodEnd
        ? new Date(periodEnd).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
        : undefined;

      sendProWelcomeEmail({
        to: user.email,
        name: previousProfile?.full_name || previousProfile?.username,
        plan: plan as 'monthly' | 'yearly',
        nextBillingDate: formattedDate,
      }).catch(err => console.warn('[StripeVerify] Error dispatching Pro welcome email:', err));
    }

    return NextResponse.json({
      isPremium: true,
      subscriptionTier: 'premium',
      subscriptionPlan: plan,
    });
  } catch (err: any) {
    console.error('[StripeVerify] Error verifying checkout session:', err);
    return NextResponse.json(
      { error: err?.message || 'Error al verificar la sesión de Stripe' },
      { status: 500 }
    );
  }
}
