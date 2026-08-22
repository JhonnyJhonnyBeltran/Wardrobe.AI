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
    let priceId = plan === 'yearly'
      ? (process.env.STRIPE_PRICE_ID_YEARLY || process.env.STRIPE_PRODUCT_ID_YEARLY || 'price_1U7DiWCt6LJbs620MmU8s5Vr')
      : (process.env.STRIPE_PRICE_ID_MONTHLY || process.env.STRIPE_PRODUCT_ID_MONTHLY || 'price_1U7DeHCt6LJbs620osDLmL2m');

    // If a product ID (prod_...) was provided instead of a price ID (price_...), fetch its default price
    if (priceId.startsWith('prod_')) {
      const prices = await stripe.prices.list({ product: priceId, active: true, limit: 1 });
      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
      }
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

    // Create Stripe Checkout Session (Supports Apple Pay, Google Pay, Card, Link)
    const session = await stripe.checkout.sessions.create({
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
