'use client';

import { supabase } from '@/lib/supabase/client';

export type ClientNotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'follow_request'
  | 'follow_accepted';

export interface ClientDispatchParams {
  type: ClientNotificationType;
  recipientId?: string | null;
  postId?: string | null;
  commentId?: string | null;
  commentContent?: string | null;
  followStatus?: string | null;
}

export async function dispatchClientNotification(
  params: ClientDispatchParams
): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;
    const token = session?.access_token;

    if (!userId || !token) return;
    if (params.recipientId && params.recipientId === userId) return;

    await fetch('/api/notifications/dispatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
      keepalive: true,
    });
  } catch (err) {
    console.warn('[notificationClient] Failed to dispatch instant notification:', err);
  }
}
