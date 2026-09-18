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
      // In production, reject unsigned webhook calls
      if (process.env.NODE_ENV === 'production') {
        console.error('[StripeWebhook] Missing webhook secret or signature in production');
        return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
      }
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
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        // Grace period check: 3 days after period end
        const periodEndMs = subscription.current_period_end ? subscription.current_period_end * 1000 : 0;
        const isWithin3DaysGrace = periodEndMs > 0 && (Date.now() - periodEndMs <= 3 * 24 * 60 * 60 * 1000);

        const isActive = subscription.status === 'active' || 
                         subscription.status === 'trialing' ||
                         (subscription.status === 'past_due' && isWithin3DaysGrace);

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

          console.log(`[StripeWebhook] Subscription updated for customer ${customerId}: status=${subscription.status}, is_premium=${isActive}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice: any = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;
        const attemptCount = invoice.attempt_count || 1;

        if (customerId) {
          // Check if subscription has exceeded the 3-day grace period
          let shouldRevoke = attemptCount >= 3;
          if (invoice.lines?.data?.[0]?.period?.end) {
            const periodEndMs = invoice.lines.data[0].period.end * 1000;
            if (Date.now() - periodEndMs > 3 * 24 * 60 * 60 * 1000) {
              shouldRevoke = true;
            }
          }

          await supabaseAdmin
            .from('profiles')
            .update({
              is_premium: !shouldRevoke,
              subscription_tier: shouldRevoke ? 'free' : 'premium',
              subscription_status: 'past_due',
            } as any)
            .eq('stripe_customer_id', customerId);

          console.log(`[StripeWebhook] Payment failed for customer ${customerId} (attempt #${attemptCount}). Revoked=${shouldRevoke}`);
        }
        break;
      }

      case 'invoice.payment_succeeded':
      case 'invoice.paid': {
        const invoice: any = event.data.object;
        const customerId = invoice.customer;
        const periodEnd = invoice.lines?.data?.[0]?.period?.end
          ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
          : null;

        if (customerId && invoice.subscription) {
          await supabaseAdmin
            .from('profiles')
            .update({
              is_premium: true,
              subscription_tier: 'premium',
              subscription_status: 'active',
              subscription_period_end: periodEnd
            } as any)
            .eq('stripe_customer_id', customerId);

          console.log(`[StripeWebhook] Payment succeeded for customer ${customerId}. Restored Premium active until ${periodEnd}`);
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
