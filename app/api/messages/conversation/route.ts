import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const getAdmin = () => createAdminClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Helper to authenticate user from cookies or Authorization Bearer token
async function resolveAuthUser(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;
  } catch {}

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.replace('Bearer ', '').trim();
      const admin = getAdmin();
      const { data: { user } } = await admin.auth.getUser(token);
      if (user) return user;
    } catch {}
  }

  return null;
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await resolveAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let targetUserId: string | null = null;
    const { searchParams } = new URL(request.url);
    targetUserId = searchParams.get('target_user_id') || searchParams.get('targetUserId') || searchParams.get('partnerId') || searchParams.get('id');

    if (!targetUserId) {
      try {
        const body = await request.json();
        targetUserId = body?.target_user_id || body?.targetUserId || body?.partnerId || body?.id;
      } catch {}
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'target_user_id is required' }, { status: 400 });
    }

    const admin = getAdmin();

    // Check if targetUserId is a username or UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedTargetId = targetUserId;

    if (!uuidRegex.test(targetUserId)) {
      const cleanUsername = decodeURIComponent(targetUserId).replace(/^@/, '');
      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (profile?.id) {
        resolvedTargetId = profile.id;
      }
    }

    // 1. Delete messages where sender = user and receiver = target, or sender = target and receiver = user
    const { error: deleteMessagesError } = await admin
      .from('messages')
      .delete()
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${resolvedTargetId}),and(sender_id.eq.${resolvedTargetId},receiver_id.eq.${user.id})`);

    if (deleteMessagesError) {
      console.warn('[API /api/messages/conversation DELETE] Direct OR delete failed, trying dual deletes:', deleteMessagesError);
      
      // Fallback dual delete
      await admin
        .from('messages')
        .delete()
        .eq('sender_id', user.id)
        .eq('receiver_id', resolvedTargetId);

      await admin
        .from('messages')
        .delete()
        .eq('sender_id', resolvedTargetId)
        .eq('receiver_id', user.id);
    }

    // 2. Also delete from conversation_participants / conversations if they exist
    try {
      const { data: userConvs } = await admin
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (userConvs && userConvs.length > 0) {
        const convIds = userConvs.map(c => c.conversation_id);
        const { data: targetInConvs } = await admin
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', resolvedTargetId)
          .in('conversation_id', convIds);

        if (targetInConvs && targetInConvs.length > 0) {
          const sharedConvIds = targetInConvs.map(c => c.conversation_id);
          
          // Delete messages linked by conversation_id
          await admin
            .from('messages')
            .delete()
            .in('conversation_id', sharedConvIds);

          // Delete conversation participants
          await admin
            .from('conversation_participants')
            .delete()
            .in('conversation_id', sharedConvIds);

          // Delete conversations
          await admin
            .from('conversations')
            .delete()
            .in('id', sharedConvIds);
        }
      }
    } catch (convCleanupErr) {
      console.warn('[API /api/messages/conversation DELETE] Conversation tables cleanup warning (ignored):', convCleanupErr);
    }

    // 3. Clean notifications of type 'message' between these two users
    try {
      await admin
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('sender_id', resolvedTargetId)
        .eq('type', 'message');
    } catch (notifErr) {
      console.warn('[API /api/messages/conversation DELETE] Notification cleanup warning (ignored):', notifErr);
    }

    return NextResponse.json({
      success: true,
      deleted: true,
      targetUserId: resolvedTargetId
    });
  } catch (error: any) {
    console.error('[API /api/messages/conversation DELETE] Exception:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
