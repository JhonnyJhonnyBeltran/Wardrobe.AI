import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const ENTITLEMENT_ID = 'klozet_pro';

function getProfileWriteClient(userScopedSupabase: Awaited<ReturnType<typeof createServerClient>>) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);
  }
  return userScopedSupabase;
}

function inferPlan(productId?: string | null): 'monthly' | 'yearly' {
  if (!productId) return 'yearly';
  const p = productId.toLowerCase();
  return p.includes('year') || p.includes('annual') || p.includes('anual') ? 'yearly' : 'monthly';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const dbClient = getProfileWriteClient(supabase);
    const body = await request.json().catch(() => ({}));
    const revenueCatSecret = process.env.REVENUECAT_SECRET_KEY;

    // 1. Authoritative server-to-server verification when REVENUECAT_SECRET_KEY is configured
    if (revenueCatSecret) {
      const rcRes = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`, {
        headers: {
          Authorization: `Bearer ${revenueCatSecret}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (rcRes.ok) {
        const rcData = await rcRes.json();
        const entitlement = rcData?.subscriber?.entitlements?.[ENTITLEMENT_ID];
        const expiresAt = entitlement?.expires_date ? new Date(entitlement.expires_date) : null;
        const isActive = Boolean(entitlement) && (!expiresAt || expiresAt.getTime() > Date.now());
        const plan = isActive ? inferPlan(entitlement?.product_identifier) : 'none';

        if (isActive) {
          const { error: updateError } = await dbClient
            .from('profiles')
            .update({
              is_premium: true,
              subscription_tier: 'premium',
              subscription_plan: plan,
              subscription_status: 'active',
              subscription_period_end: expiresAt ? expiresAt.toISOString() : null,
            } as any)
            .eq('id', user.id);

          if (updateError) {
            throw updateError;
          }

          return NextResponse.json({
            isPremium: true,
            subscriptionTier: 'premium',
            subscriptionPlan: plan,
            verifiedVia: 'revenuecat_rest',
          });
        }
      }
    }

    // 2. SDK-verified purchase / Test Store sync when RevenueCat REST did not already verify
    const allowClientOrTestSync =
      !revenueCatSecret ||
      process.env.NODE_ENV !== 'production' ||
      process.env.REVENUECAT_ALLOW_TEST_STORE_SYNC === 'true';

    if ((body?.isTestStorePurchase || body?.hasActiveEntitlement) && allowClientOrTestSync) {
      const plan = inferPlan(body?.productIdentifier);
      const { error: updateError } = await dbClient
        .from('profiles')
        .update({
          is_premium: true,
          subscription_tier: 'premium',
          subscription_plan: plan,
          subscription_status: 'active',
        } as any)
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        isPremium: true,
        subscriptionTier: 'premium',
        subscriptionPlan: plan,
        verifiedVia: body?.isTestStorePurchase ? 'test_store_sandbox' : 'revenuecat_sdk',
      });
    }

    // 3. Fallback: read authoritative DB profile (updated via RevenueCat webhook)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, subscription_tier, subscription_plan, subscription_status')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json({
      isPremium: Boolean(profile?.is_premium),
      subscriptionTier: profile?.subscription_tier || 'free',
      subscriptionPlan: profile?.subscription_plan || 'none',
      verifiedVia: 'supabase_profile',
    });
  } catch (err: any) {
    console.error('[RevenueCatSync] Error:', err);
    return NextResponse.json({ error: 'Error sincronizando suscripción' }, { status: 500 });
  }
}
