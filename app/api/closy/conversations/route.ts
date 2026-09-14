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
  let token: string | null = null;

  try {
    supabaseServerClient = await createClient();
    const { data } = await supabaseServerClient.auth.getUser();
    user = data?.user || null;
  } catch {}

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '').trim();
  }

  if (!user && token) {
    try {
      const admin = getAdmin();
      const { data } = await admin.auth.getUser(token);
      if (data?.user) {
        user = data.user;
      }
    } catch {}
  }

  const hasServiceRole = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
  let client: any = null;

  if (hasServiceRole) {
    client = getAdmin();
  } else if (token) {
    client = createAdminClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    });
  } else if (supabaseServerClient) {
    client = supabaseServerClient;
  } else {
    client = getAdmin();
  }

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
      .select('notification_preferences')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json({ success: true, conversations: [] });
    }

    const notifs = (profile as any)?.notification_preferences || {};
    const conversations = Array.isArray(notifs.kloe_conversations) ? notifs.kloe_conversations : [];

    return NextResponse.json({
      success: true,
      conversations
    });
  } catch (err: any) {
    console.error('[KloeConversations] GET error:', err);
    return NextResponse.json({ success: true, conversations: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client, user } = await resolveUserAndClient(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const rawConversations = Array.isArray(body.conversations) ? body.conversations.slice(0, 5) : [];

    // Sanitize conversation payload (strip huge base64 strings if any to avoid DB payload limit)
    const sanitizedConversations = rawConversations.map((c: any) => ({
      id: String(c.id || `conv_${Date.now()}`),
      title: String(c.title || 'Nueva conversación').slice(0, 100),
      updatedAt: Number(c.updatedAt) || Date.now(),
      messages: Array.isArray(c.messages)
        ? c.messages.slice(-30).map((m: any) => ({
            id: String(m.id || `msg_${Date.now()}`),
            role: m.role === 'user' ? 'user' : 'assistant',
            content: String(m.content || ''),
            recommended_outfit: m.recommended_outfit || null,
            highlighted_items: Array.isArray(m.highlighted_items) ? m.highlighted_items : [],
            follow_up_suggestions: Array.isArray(m.follow_up_suggestions) ? m.follow_up_suggestions : [],
            attached_items: Array.isArray(m.attached_items) ? m.attached_items : undefined,
            attached_item: m.attached_item || undefined,
            attached_post: m.attached_post ? {
              id: m.attached_post.id,
              caption: m.attached_post.caption,
              imageUrl: m.attached_post.imageUrl || m.attached_post.image_url,
              style_ids: m.attached_post.style_ids
            } : undefined,
            timestamp: m.timestamp || new Date().toISOString()
          }))
        : []
    }));

    // 1. Fetch current notification_preferences
    const { data: currentProfile } = await client
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.id)
      .maybeSingle();

    const currentNotifs = (currentProfile as any)?.notification_preferences || {};
    const updatedNotifs = {
      ...currentNotifs,
      kloe_conversations: sanitizedConversations,
      kloe_conversations_updated_at: new Date().toISOString()
    };

    // 2. Persist update to profiles JSONB
    const { error: updateError } = await (client.from('profiles') as any)
      .update({
        notification_preferences: updatedNotifs,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.warn('[KloeConversations] Profile update warning:', updateError.message);
    }

    return NextResponse.json({
      success: true,
      count: sanitizedConversations.length
    });
  } catch (err: any) {
    console.error('[KloeConversations] POST error:', err);
    // Non-fatal response to avoid 500 error on client
    return NextResponse.json({
      success: false,
      error: err.message || 'Error al sincronizar conversaciones'
    }, { status: 200 });
  }
}
