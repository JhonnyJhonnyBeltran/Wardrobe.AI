import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Debes iniciar sesión para suscribirte' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const plan = body.plan === 'yearly' ? 'yearly' : 'monthly';

    // Price IDs from env or defaults
    const monthlyPriceId = process.env.STRIPE_PRICE_ID_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY;
    const yearlyPriceId = process.env.STRIPE_PRICE_ID_YEARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY;

    const priceId = plan === 'yearly' ? yearlyPriceId : monthlyPriceId;

    if (!priceId) {
      return NextResponse.json(
        { 
          error: `No se ha configurado el Price ID para el plan ${plan}. Por favor añade STRIPE_PRICE_ID_${plan.toUpperCase()} a tus variables de entorno.` 
        }, 
        { status: 500 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Check if user already has a Stripe Customer ID in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id;

    if (!customerId && user.email) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId } as any)
        .eq('id', user.id);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan
        }
      },
      allow_promotion_codes: true,
      success_url: `${origin}/closet/kloe?subscribed=success`,
      cancel_url: `${origin}/closet/kloe?subscribed=cancelled`
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('[StripeCheckout] Error creating session:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al iniciar la pasarela de pago' },
      { status: 500 }
    );
  }
}
