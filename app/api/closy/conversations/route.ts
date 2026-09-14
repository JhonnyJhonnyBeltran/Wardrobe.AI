import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                   process.env.SUPABASE_SERVICE_KEY || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const getAdmin = () => createAdminClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function resolveUserAndClient(request: NextRequest) {
  let user: any = null;
  let supabaseServerClient: any = null;

  try {
    supabaseServerClient = await createClient();
    const { data } = await supabaseServerClient.auth.getUser();
    user = data?.user || null;
  } catch {}

  if (!user) {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '').trim();
        const admin = getAdmin();
        const { data } = await admin.auth.getUser(token);
        if (data?.user) {
          user = data.user;
        }
      } catch {}
    }
  }

  const hasServiceRole = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
  const client = hasServiceRole ? getAdmin() : (supabaseServerClient || getAdmin());

  return { client, user };
}

export async function GET(request: NextRequest) {
  try {
    const { client, user } = await resolveUserAndClient(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json({ conversations: [] });
    }

    let conversations: any[] = [];

    // 1. Try column kloe_conversations if exists
    if ((profile as any).kloe_conversations && Array.isArray((profile as any).kloe_conversations)) {
      conversations = (profile as any).kloe_conversations;
    }

    // 2. Fallback to notification_preferences.kloe_conversations
    if (conversations.length === 0) {
      const notifs = (profile as any).notification_preferences || {};
      if (notifs.kloe_conversations && Array.isArray(notifs.kloe_conversations)) {
        conversations = notifs.kloe_conversations;
      }
    }

    return NextResponse.json({
      success: true,
      conversations: conversations || []
    });
  } catch (err: any) {
    console.error('[KloeConversations] GET error:', err);
    return NextResponse.json({ error: err.message || 'Error al obtener conversaciones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client, user } = await resolveUserAndClient(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const conversations = Array.isArray(body.conversations) ? body.conversations.slice(0, 10) : [];

    // 1. Get current notification_preferences
    const { data: currentProfile } = await client
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.id)
      .maybeSingle();

    const currentNotifs = (currentProfile as any)?.notification_preferences || {};
    const updatedNotifs = {
      ...currentNotifs,
      kloe_conversations: conversations,
      kloe_conversations_updated_at: new Date().toISOString()
    };

    // 2. Update profiles table
    let { error: updateError } = await (client.from('profiles') as any)
      .update({
        kloe_conversations: conversations,
        notification_preferences: updatedNotifs,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      // Fallback to JSONB only if direct column doesn't exist
      const { error: fallbackError } = await (client.from('profiles') as any)
        .update({
          notification_preferences: updatedNotifs,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (fallbackError) {
        throw fallbackError;
      }
    }

    return NextResponse.json({
      success: true,
      count: conversations.length
    });
  } catch (err: any) {
    console.error('[KloeConversations] POST error:', err);
    return NextResponse.json({ error: err.message || 'Error al sincronizar conversaciones' }, { status: 500 });
  }
}
