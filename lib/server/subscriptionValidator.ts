import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendCancellationEmail } from '@/lib/email/emailService';

export interface SubscriptionStatusResult {
  isPremium: boolean;
  subscriptionTier: 'free' | 'premium';
  subscriptionPlan: 'monthly' | 'yearly' | 'none';
  subscriptionStatus: string;
  isExpired: boolean;
  isWithinGracePeriod: boolean;
  graceDaysRemaining: number;
  periodEnd: string | null;
}

/**
 * 3-day grace period in milliseconds (72 hours)
 */
export const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Validates whether a profile has an ACTIVE, PAID, unexpired premium subscription.
 * Handles the 3-day grace period:
 * 1. During paid period: isPremium = true, isWithinGracePeriod = false.
 * 2. During 3-day grace period (now > periodEnd && now <= periodEnd + 3 days):
 *    isPremium = true, isWithinGracePeriod = true, graceDaysRemaining (1-3).
 * 3. After 3-day grace period (now > periodEnd + 3 days):
 *    isPremium = false, isExpired = true, triggers automatic revocation in Supabase.
 */
export function validateUserSubscription(profile: any): SubscriptionStatusResult {
  if (!profile) {
    return {
      isPremium: false,
      subscriptionTier: 'free',
      subscriptionPlan: 'none',
      subscriptionStatus: 'inactive',
      isExpired: false,
      isWithinGracePeriod: false,
      graceDaysRemaining: 0,
      periodEnd: null,
    };
  }

  const rawStatus = String(profile.subscription_status || '').toLowerCase().trim();
  const rawTier = String(profile.subscription_tier || '').toLowerCase().trim();
  const rawPlan = String(profile.subscription_plan || 'none').toLowerCase().trim();
  const periodEnd = profile.subscription_period_end ? new Date(profile.subscription_period_end) : null;
  const periodEndMs = periodEnd && !isNaN(periodEnd.getTime()) ? periodEnd.getTime() : 0;

  const now = Date.now();
  const hasPeriodEnd = periodEndMs > 0;

  // Check 3-day grace period
  const isPastPeriodEnd = hasPeriodEnd && now > periodEndMs;
  const isPastGrace = hasPeriodEnd && now - periodEndMs > GRACE_PERIOD_MS;
  const isWithinGracePeriod = hasPeriodEnd && isPastPeriodEnd && !isPastGrace;
  const graceDaysRemaining = isWithinGracePeriod
    ? Math.max(1, Math.ceil((periodEndMs + GRACE_PERIOD_MS - now) / (24 * 60 * 60 * 1000)))
    : 0;

  // Statuses that represent explicitly non-paid/revoked states after grace expires
  const isStatusInactive =
    rawStatus === 'unpaid' ||
    rawStatus === 'incomplete_expired' ||
    rawStatus === 'expired' ||
    (rawStatus === 'canceled' && isPastGrace) ||
    (rawStatus === 'past_due' && isPastGrace) ||
    isPastGrace;

  const hasPremiumFlag = Boolean(profile.is_premium === true || rawTier === 'premium');

  // Active if user has premium flag and is either in active period OR within the 3-day grace period
  const isPaidAndActive = hasPremiumFlag && !isStatusInactive && !isPastGrace;

  const validPlan: 'monthly' | 'yearly' | 'none' =
    rawPlan === 'yearly' || rawPlan === 'monthly' ? rawPlan : 'none';

  return {
    isPremium: isPaidAndActive,
    subscriptionTier: isPaidAndActive ? 'premium' : 'free',
    subscriptionPlan: isPaidAndActive ? validPlan : 'none',
    subscriptionStatus: isWithinGracePeriod ? 'grace_period' : (rawStatus || (isPaidAndActive ? 'active' : 'inactive')),
    isExpired: isPastGrace,
    isWithinGracePeriod,
    graceDaysRemaining,
    periodEnd: periodEnd ? periodEnd.toISOString() : null,
  };
}

/**
 * Asynchronously demotes expired premium profiles in Supabase with admin privileges
 * once the 3-day grace period has passed.
 */
export async function syncExpiredProfileIfNecessary(userId: string, result: SubscriptionStatusResult) {
  if (result.isExpired && !result.isPremium) {
    try {
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zitsnkacbmkeqnkjasbr.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_VRuWVE-qd-9QdweTy8GxXA_0rRGx72L'
      );

      // 1. Demote to free in profiles
      const { data: updatedProfile } = await supabaseAdmin
        .from('profiles')
        .update({
          is_premium: false,
          subscription_tier: 'free',
          subscription_plan: 'none',
          subscription_status: 'expired',
        } as any)
        .eq('id', userId)
        .select('full_name, username')
        .maybeSingle();

      console.log(`[SubscriptionValidator] Profile ${userId} demoted to Free (3-day grace period expired).`);

      // 2. Fetch email and dispatch cancellation confirmation
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const userEmail = authData?.user?.email;
      if (userEmail) {
        sendCancellationEmail({
          to: userEmail,
          name: updatedProfile?.full_name || updatedProfile?.username,
          accessUntilDate: 'hoy (periodo de gracia finalizado)',
        }).catch(err => console.warn('[SubscriptionValidator] Error sending expiration notice email:', err));
      }
    } catch (err) {
      console.warn('[SubscriptionValidator] Non-blocking sync error:', err);
    }
  }
}
