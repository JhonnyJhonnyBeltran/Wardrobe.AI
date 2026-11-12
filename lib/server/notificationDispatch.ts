import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type DispatchNotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'follow_request'
  | 'follow_accepted';

export interface DispatchNotificationInput {
  client: any;
  actorUserId: string;
  type: DispatchNotificationType;
  recipientId?: string | null;
  postId?: string | null;
  commentId?: string | null;
  commentContent?: string | null;
  followStatus?: string | null;
}

export async function getAuthenticatedServerClients(request: NextRequest) {
  let user: any = null;
  let userClient: any = null;

  const authHeader =
    request.headers.get('authorization') || request.headers.get('Authorization');
  let token: string | null = null;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '').trim();
  }

  if (token) {
    try {
      const anonClient = createAdminClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data } = await anonClient.auth.getUser(token);
      if (data?.user) {
        user = data.user;
        userClient = createAdminClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
      }
    } catch (e) {
      console.warn('[notificationDispatch] Error authenticating with Bearer token:', e);
    }
  }

  if (!user) {
    try {
      const supabaseServer = await createClient();
      const { data } = await supabaseServer.auth.getUser();
      if (data?.user) {
        user = data.user;
        userClient = supabaseServer;
      }
    } catch (e) {
      console.warn('[notificationDispatch] Error authenticating with server cookies:', e);
    }
  }

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const adminClient = serviceKey
    ? createAdminClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  if (!userClient) {
    userClient =
      adminClient ||
      createAdminClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
  }

  return {
    client: adminClient || userClient,
    userClient,
    adminClient,
    user,
  };
}

export async function broadcastRealtimeNotification(
  recipientId: string,
  payload: Record<string, any>
): Promise<boolean> {
  if (!supabaseUrl || !recipientId) return false;
  const authKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    anonKey;
  if (!authKey) return false;

  try {
    const res = await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: authKey,
        Authorization: `Bearer ${authKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            topic: `global:${recipientId}`,
            event: 'notification',
            payload,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('[notificationDispatch] Realtime broadcast HTTP failed:', res.status, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[notificationDispatch] Realtime broadcast error:', err);
    return false;
  }
}

export async function dispatchUserNotification({
  client,
  actorUserId,
  type,
  recipientId: explicitRecipientId,
  postId,
  commentId,
  commentContent,
  followStatus,
}: DispatchNotificationInput): Promise<{ sent: boolean; notification?: Record<string, any> }> {
  try {
    let recipientId = explicitRecipientId || null;
    let postImageUrl: string | null = null;

    if (postId) {
      const { data: postData } = await client
        .from('posts')
        .select('user_id, image_url')
        .eq('id', postId)
        .maybeSingle();

      if (postData) {
        if (!recipientId) recipientId = postData.user_id;
        postImageUrl = postData.image_url || null;
      }
    }

    if (!recipientId || recipientId === actorUserId) {
      return { sent: false };
    }

    const { data: senderProfile } = await client
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', actorUserId)
      .maybeSingle();

    const senderUsername = senderProfile?.username || '';
    const senderName =
      senderProfile?.full_name || senderUsername || 'Alguien';
    const senderAvatar = senderProfile?.avatar_url || null;

    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();

    let title = 'Notificación';
    let message = `${senderName} interactuó contigo`;
    const trimmedComment = (commentContent || '').trim();

    if (type === 'like') {
      title = 'Nuevo me gusta';
      message = `A ${senderName} le gustó tu publicación`;
    } else if (type === 'comment') {
      title = 'Nuevo comentario';
      message = trimmedComment
        ? `${senderName} comentó: "${trimmedComment.slice(0, 60)}"`
        : `${senderName} comentó en tu publicación`;
    } else if (type === 'follow_request') {
      title = 'Nueva solicitud';
      message = `${senderName} quiere seguirte`;
    } else if (type === 'follow_accepted') {
      title = 'Solicitud aceptada';
      message = `${senderName} aceptó tu solicitud`;
    } else {
      title = 'Nuevo seguidor';
      message = `${senderName} comenzó a seguirte`;
    }

    const entityId = postId || actorUserId;
    const deterministicId =
      type === 'comment' && commentId
        ? `comment_${commentId}`
        : type === 'like' && postId
          ? `like_${actorUserId}_${postId}`
          : `${type}_${actorUserId}_${recipientId}`;

    const dataPayload: Record<string, any> = {
      actor_id: actorUserId,
      sender_avatar: senderAvatar,
      avatar_url: senderAvatar,
      username: senderUsername,
      full_name: senderName,
    };

    if (postId) dataPayload.post_id = postId;
    if (postImageUrl) dataPayload.image_url = postImageUrl;
    if (commentId) dataPayload.comment_id = commentId;
    if (trimmedComment) dataPayload.content = trimmedComment;
    if (type.startsWith('follow')) {
      dataPayload.follower_id = actorUserId;
      if (followStatus) dataPayload.status = followStatus;
    }

    // Persist in notifications table only if no recent duplicate row was inserted by a SQL trigger
    try {
      const fiveSecondsAgo = new Date(nowMs - 5000).toISOString();
      const { data: recentExisting } = await client
        .from('notifications')
        .select('id')
        .eq('user_id', recipientId)
        .eq('sender_id', actorUserId)
        .eq('type', type)
        .gte('created_at', fiveSecondsAgo)
        .limit(1);

      if (!recentExisting || recentExisting.length === 0) {
        await client.from('notifications').insert({
          user_id: recipientId,
          sender_id: actorUserId,
          type,
          title,
          message,
          entity_id: entityId,
          data: dataPayload,
        });
      }
    } catch (dbErr) {
      console.warn('[notificationDispatch] DB insert skipped:', dbErr);
    }

    const realtimePayload: Record<string, any> = {
      id: deterministicId,
      type,
      title,
      message,
      content: type === 'comment' ? trimmedComment : undefined,
      sender_id: actorUserId,
      actor_id: actorUserId,
      entity_id: entityId,
      postId: postId || undefined,
      image: postImageUrl || undefined,
      actor: {
        id: actorUserId,
        username: senderUsername,
        name: senderName,
        avatar: senderAvatar || '',
      },
      sender: {
        username: senderUsername || senderName,
        avatar_url: senderAvatar,
      },
      data: dataPayload,
      read: false,
      created_at: nowIso,
      timestamp: nowMs,
      time: 'Justo ahora',
    };

    await broadcastRealtimeNotification(recipientId, realtimePayload);
    return { sent: true, notification: realtimePayload };
  } catch (err) {
    console.warn('[notificationDispatch] Error dispatching notification:', err);
    return { sent: false };
  }
}
