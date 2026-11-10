import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ENTITLEMENT_ID = 'klozet_pro';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

function inferPlanFromProductId(productId?: string | null): 'monthly' | 'yearly' | 'none' {
  if (!productId) return 'none';
  const p = productId.toLowerCase();
  if (p.includes('year') || p.includes('annual') || p.includes('anual')) {
    return 'yearly';
  }
  return 'monthly';
}

function isUUID(val?: string | null): boolean {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

/**
 * Queries RevenueCat REST API v1 to retrieve the authoritative entitlement state
 * for an identified subscriber.
 */
async function fetchAuthoritativeEntitlement(appUserId: string) {
  const secretKey = process.env.REVENUECAT_SECRET_KEY;
  if (!secretKey) return null;

  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const entitlement = data?.subscriber?.entitlements?.[ENTITLEMENT_ID];
    if (!entitlement) {
      return { isActive: false, expiresAt: null as string | null, productId: null as string | null };
    }
    const expiresAt = entitlement.expires_date ? new Date(entitlement.expires_date) : null;
    const isActive = !expiresAt || expiresAt.getTime() > Date.now();
    return {
      isActive,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      productId: entitlement.product_identifier || null,
    };
  } catch (err) {
    console.warn('[RevenueCatWebhook] REST API check failed:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = request.headers.get('authorization') || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
      if (token !== webhookSecret) {
        return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('[RevenueCatWebhook] REVENUECAT_WEBHOOK_SECRET not configured in production.');
    }

    const body = await request.json();
    const event = body?.event;

    if (!event || !event.type) {
      return NextResponse.json({ error: 'Invalid RevenueCat payload' }, { status: 400 });
    }

    const eventType: string = event.type;
    // Resolve non-anonymous Supabase user UUID
    const candidates: string[] = [
      event.app_user_id,
      event.original_app_user_id,
      ...(Array.isArray(event.transferred_to) ? event.transferred_to : []),
      ...(Array.isArray(event.aliases) ? event.aliases : []),
    ].filter(Boolean);

    const userId = candidates.find((id) => isUUID(id));

    if (!userId) {
      // Anonymous RC user not yet linked to a Supabase UUID; acknowledge cleanly
      return NextResponse.json({ received: true, skipped: 'No Supabase UUID app_user_id' });
    }

    // Prefer REST API ground-truth when REVENUECAT_SECRET_KEY is configured
    const restState = await fetchAuthoritativeEntitlement(userId);

    let isActive = false;
    let expiresAt: string | null = event.expiration_at_ms
      ? new Date(Number(event.expiration_at_ms)).toISOString()
      : null;
    let productId: string | null = event.product_id || null;

    if (restState) {
      isActive = restState.isActive;
      expiresAt = restState.expiresAt || expiresAt;
      productId = restState.productId || productId;
    } else {
      const hasKlozetPro =
        !Array.isArray(event.entitlement_ids) ||
        event.entitlement_ids.includes(ENTITLEMENT_ID);

      const expirationFuture = !event.expiration_at_ms || Number(event.expiration_at_ms) > Date.now();
      const activeEvents = new Set([
        'INITIAL_PURCHASE',
        'RENEWAL',
        'UNCANCELLATION',
        'NON_RENEWING_PURCHASE',
        'PRODUCT_CHANGE',
        'TRANSFER',
      ]);

      if (eventType === 'EXPIRATION' || eventType === 'BILLING_ISSUE') {
        isActive = false;
      } else if (activeEvents.has(eventType)) {
        isActive = hasKlozetPro && expirationFuture;
      } else if (eventType === 'CANCELLATION') {
        // User turned off auto-renew; remains active until period end
        isActive = hasKlozetPro && expirationFuture;
      }
    }

    const plan = isActive ? inferPlanFromProductId(productId) : 'none';
    const subStatus =
      eventType === 'EXPIRATION'
        ? 'expired'
        : eventType === 'BILLING_ISSUE'
        ? 'past_due'
        : eventType === 'CANCELLATION'
        ? 'canceled'
        : isActive
        ? 'active'
        : 'inactive';

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_premium: isActive,
        subscription_tier: isActive ? 'premium' : 'free',
        subscription_plan: plan,
        subscription_status: subStatus,
        subscription_period_end: expiresAt,
      } as any)
      .eq('id', userId);

    if (updateError) {
      console.error('[RevenueCatWebhook] Supabase update error:', updateError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    console.log(`[RevenueCatWebhook] ${eventType} -> user=${userId} active=${isActive} plan=${plan}`);
    return NextResponse.json({ received: true, userId, isPremium: isActive });
  } catch (error: any) {
    console.error('[RevenueCatWebhook] Error:', error);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
