import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/email/emailService';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zitsnkacbmkeqnkjasbr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_VRuWVE-qd-9QdweTy8GxXA_0rRGx72L'
);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if welcome email was already dispatched to this profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, username, notification_preferences')
      .eq('id', user.id)
      .maybeSingle();

    const prefs = profile?.notification_preferences || {};
    if (prefs.welcome_email_sent) {
      return NextResponse.json({ success: true, alreadySent: true });
    }

    const sent = await sendWelcomeEmail({
      to: user.email,
      name: profile?.full_name || user.user_metadata?.name || user.user_metadata?.full_name,
      username: profile?.username,
    });

    if (sent) {
      await supabaseAdmin
        .from('profiles')
        .update({
          notification_preferences: {
            ...prefs,
            welcome_email_sent: true,
            welcome_email_sent_at: new Date().toISOString(),
          }
        } as any)
        .eq('id', user.id);
    }

    return NextResponse.json({ success: true, sent });
  } catch (err: any) {
    console.error('[WelcomeEmailAPI] Error:', err);
    return NextResponse.json({ error: 'Error enviando email de bienvenida' }, { status: 500 });
  }
}
