import { NextRequest, NextResponse } from 'next/server';
import {
  dispatchUserNotification,
  getAuthenticatedServerClients,
  type DispatchNotificationType,
} from '@/lib/server/notificationDispatch';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = new Set<DispatchNotificationType>([
  'like',
  'comment',
  'follow',
  'follow_request',
  'follow_accepted',
]);

export async function POST(request: NextRequest) {
  try {
    const { client, user } = await getAuthenticatedServerClients(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const type = body?.type as DispatchNotificationType;

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    const result = await dispatchUserNotification({
      client,
      actorUserId: user.id,
      type,
      recipientId: body?.recipientId || body?.recipient_id || null,
      postId: body?.postId || body?.post_id || null,
      commentId: body?.commentId || body?.comment_id || null,
      commentContent: body?.commentContent || body?.content || null,
      followStatus: body?.followStatus || body?.status || null,
    });

    return NextResponse.json({
      success: true,
      sent: result.sent,
    });
  } catch (err: any) {
    console.error('[API /api/notifications/dispatch] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Dispatch error' },
      { status: 500 }
    );
  }
}
