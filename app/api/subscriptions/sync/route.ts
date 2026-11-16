import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { validateUserSubscription, syncExpiredProfileIfNecessary } from '@/lib/server/subscriptionValidator';

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

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    const subValidation = validateUserSubscription(profile);

    // If grace period expired and user is demoted, sync Supabase
    if (subValidation.isExpired && profile.is_premium) {
      await syncExpiredProfileIfNecessary(user.id, subValidation);
    }

    return NextResponse.json({
      isPremium: subValidation.isPremium,
      subscriptionTier: subValidation.subscriptionTier,
      subscriptionStatus: subValidation.subscriptionStatus,
      isWithinGracePeriod: subValidation.isWithinGracePeriod,
      graceDaysRemaining: subValidation.graceDaysRemaining,
      periodEnd: subValidation.periodEnd,
    });
  } catch (err: any) {
    console.error('[SubscriptionSyncAPI] Error:', err);
    return NextResponse.json({ error: 'Error sincronizando suscripción' }, { status: 500 });
  }
}

/**
 * GET route for background cron / automated sweep:
 * Scans all profiles with is_premium = true where subscription_period_end < NOW() - 3 days
 * and bulk-demotes them.
 */
export async function GET(request: NextRequest) {
  try {
    const cutoffDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: expiredProfiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, subscription_period_end, subscription_status')
      .eq('is_premium', true)
      .not('subscription_period_end', 'is', null)
      .lt('subscription_period_end', cutoffDate);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let demotedCount = 0;
    if (expiredProfiles && expiredProfiles.length > 0) {
      for (const p of expiredProfiles) {
        const val = validateUserSubscription(p);
        if (val.isExpired) {
          await syncExpiredProfileIfNecessary(p.id, val);
          demotedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      scanned: expiredProfiles?.length || 0,
      demotedCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
