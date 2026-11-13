import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    const customerId = profile?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json(
        { error: 'No hay identificador de cliente en Stripe para esta cuenta' },
        { status: 404 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://klozet.es';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/profile/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[StripePortal] Error creating portal session:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al abrir el portal de Stripe' },
      { status: 500 }
    );
  }
}
