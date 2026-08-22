import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';

// Service role client to update profile subscription status securely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`[StripeWebhook] Signature verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.supabase_user_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (userId && subscriptionId) {
          // Fetch full subscription details from Stripe
          const subscription: any = await stripe.subscriptions.retrieve(subscriptionId as string);
          const priceId = subscription.items?.data[0]?.price?.id;
          const interval = subscription.items?.data[0]?.price?.recurring?.interval;
          const plan = interval === 'year' ? 'yearly' : 'monthly';
          const periodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null;

          await supabaseAdmin
            .from('profiles')
            .update({
              is_premium: true,
              subscription_tier: 'premium',
              subscription_plan: plan,
              subscription_status: subscription.status || 'active',
              subscription_period_end: periodEnd,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: priceId
            } as any)
            .eq('id', userId);
          
          console.log(`[StripeWebhook] User ${userId} upgraded to Premium (${plan}, expires: ${periodEnd})`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription: any = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items?.data[0]?.price?.id;
        const interval = subscription.items?.data[0]?.price?.recurring?.interval;
        const plan = interval === 'year' ? 'yearly' : 'monthly';
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        if (customerId) {
          await supabaseAdmin
            .from('profiles')
            .update({
              is_premium: isActive,
              subscription_tier: isActive ? 'premium' : 'free',
              subscription_plan: isActive ? plan : 'none',
              subscription_status: subscription.status,
              subscription_period_end: periodEnd,
              stripe_price_id: priceId
            } as any)
            .eq('stripe_customer_id', customerId);

          console.log(`[StripeWebhook] Subscription updated for customer ${customerId}: status=${subscription.status}, active=${isActive}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        if (customerId) {
          await supabaseAdmin
            .from('profiles')
            .update({
              is_premium: false,
              subscription_tier: 'free',
              subscription_plan: 'none',
              subscription_status: 'canceled',
              stripe_subscription_id: null
            } as any)
            .eq('stripe_customer_id', customerId);

          console.log(`[StripeWebhook] Customer ${customerId} subscription cancelled and downgraded to Free`);
        }
        break;
      }

      default:
        console.log(`[StripeWebhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[StripeWebhook] Handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
