import { createClient as createAdminClient } from '@supabase/supabase-js';

export interface SubscriptionStatusResult {
  isPremium: boolean;
  subscriptionTier: 'free' | 'premium';
  subscriptionPlan: 'monthly' | 'yearly' | 'none';
  subscriptionStatus: string;
  isExpired: boolean;
  periodEnd: string | null;
}

/**
 * Validates whether a profile has an ACTIVE, PAID, unexpired premium subscription.
 * Strictly verifies:
 * 1. is_premium === true OR subscription_tier === 'premium'
 * 2. subscription_status is not 'canceled', 'unpaid', 'incomplete_expired', or 'inactive'
 * 3. If subscription_period_end is defined, verifies current time <= periodEnd + 3 days grace period
 */
export function validateUserSubscription(profile: any): SubscriptionStatusResult {
  if (!profile) {
    return {
      isPremium: false,
      subscriptionTier: 'free',
      subscriptionPlan: 'none',
      subscriptionStatus: 'inactive',
      isExpired: false,
      periodEnd: null,
    };
  }

  const rawStatus = String(profile.subscription_status || '').toLowerCase().trim();
  const rawTier = String(profile.subscription_tier || '').toLowerCase().trim();
  const rawPlan = String(profile.subscription_plan || 'none').toLowerCase().trim();
  const periodEnd = profile.subscription_period_end ? new Date(profile.subscription_period_end) : null;
  const periodEndMs = periodEnd && !isNaN(periodEnd.getTime()) ? periodEnd.getTime() : 0;

  // 3-day grace period for renewals / bank webhooks delay
  const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;
  const isExpired = periodEndMs > 0 && (Date.now() - periodEndMs > GRACE_PERIOD_MS);

  // Statuses that categorically represent non-paid / revoked states
  const isStatusInactive =
    rawStatus === 'canceled' ||
    rawStatus === 'unpaid' ||
    rawStatus === 'incomplete_expired' ||
    rawStatus === 'inactive' ||
    (rawStatus === 'past_due' && isExpired);

  const hasPremiumFlag = Boolean(profile.is_premium === true || rawTier === 'premium');

  // Strict check: must have premium flag, NOT be inactive status, and NOT be past the paid period
  const isPaidAndActive = hasPremiumFlag && !isStatusInactive && !isExpired;

  const validPlan: 'monthly' | 'yearly' | 'none' =
    rawPlan === 'yearly' || rawPlan === 'monthly' ? rawPlan : 'none';

  return {
    isPremium: isPaidAndActive,
    subscriptionTier: isPaidAndActive ? 'premium' : 'free',
    subscriptionPlan: isPaidAndActive ? validPlan : 'none',
    subscriptionStatus: rawStatus || (isPaidAndActive ? 'active' : 'inactive'),
    isExpired,
    periodEnd: periodEnd ? periodEnd.toISOString() : null,
  };
}

/**
 * Asynchronously demotes expired premium profiles in Supabase with admin privileges
 */
export async function syncExpiredProfileIfNecessary(userId: string, result: SubscriptionStatusResult) {
  if (result.isExpired && !result.isPremium) {
    try {
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      await supabaseAdmin
        .from('profiles')
        .update({
          is_premium: false,
          subscription_tier: 'free',
          subscription_status: 'expired',
        } as any)
        .eq('id', userId);
    } catch {
      // Non-blocking background sync
    }
  }
}
