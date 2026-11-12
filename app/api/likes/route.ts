import { NextRequest, NextResponse } from 'next/server';
import {
  dispatchUserNotification,
  getAuthenticatedServerClients,
} from '@/lib/server/notificationDispatch';

export const dynamic = 'force-dynamic';

const getDbClient = getAuthenticatedServerClients;

export async function GET(request: NextRequest) {
  try {
    const { client, user } = await getDbClient(request);
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id') || searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    let isLiked = false;
    if (user) {
      const { data: existing } = await client
        .from('likes')
        .select('user_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .limit(1);
      isLiked = Boolean(existing && existing.length > 0);
    }

    const { count: realCount } = await client
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    return NextResponse.json({
      isLiked,
      likes_count: typeof realCount === 'number' ? realCount : 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client, userClient, user } = await getDbClient(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let postId: string | null = null;
    try {
      const body = await request.json();
      postId = body?.post_id || body?.postId;
    } catch {}

    if (!postId) {
      const { searchParams } = new URL(request.url);
      postId = searchParams.get('post_id') || searchParams.get('postId');
    }

    if (!postId) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    // 1. Check if like already exists; if not, insert row using authenticated client (avoids 42P10 onConflict error & 42501 RLS error)
    try {
      const { data: existing } = await userClient
        .from('likes')
        .select('user_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .limit(1);

      if (!existing || existing.length === 0) {
        const { error: insertErr } = await userClient
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });

        if (insertErr && insertErr.code !== '23505') {
          console.warn('[API /api/likes POST] Insert warning:', insertErr);
        }
      }
    } catch (insertErr) {
      console.warn('[API /api/likes POST] Insert exception:', insertErr);
    }

    // 2. Dispatch persistent notification + instant Realtime broadcast to post author
    await dispatchUserNotification({
      client,
      actorUserId: user.id,
      type: 'like',
      postId,
    });

    // 3. Recalculate exact real count from `likes` table and persist on `posts`
    let safeLikesCount = 1;
    try {
      const { count: realCount } = await client
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      safeLikesCount = typeof realCount === 'number' ? Math.max(1, realCount) : 1;

      await client
        .from('posts')
        .update({ likes_count: safeLikesCount })
        .eq('id', postId);
    } catch (countErr) {
      console.warn('[API /api/likes POST] Likes count sync warning:', countErr);
    }

    return NextResponse.json({ 
      success: true, 
      isLiked: true, 
      likes_count: safeLikesCount 
    });
  } catch (error: any) {
    console.error('[API /api/likes POST] Server exception:', error);
    return NextResponse.json({ success: true, isLiked: true });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { client, userClient, user } = await getDbClient(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let postId: string | null = null;
    const { searchParams } = new URL(request.url);
    postId = searchParams.get('post_id') || searchParams.get('postId');

    if (!postId) {
      try {
        const body = await request.json();
        postId = body?.post_id || body?.postId;
      } catch {}
    }

    if (!postId) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    // 1. Remove like from `likes` table using authenticated client
    const { error: deleteError } = await userClient
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[API /api/likes DELETE] Error removing like:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 2. Safely remove associated like notification
    try {
      await client
        .from('notifications')
        .delete()
        .eq('entity_id', postId)
        .eq('sender_id', user.id)
        .eq('type', 'like');
    } catch (notifErr) {
      console.warn('[API /api/likes DELETE] Notification removal warning (ignored):', notifErr);
    }

    // 3. Recalculate exact real count from `likes` table and update `posts.likes_count`
    const { count: realCount } = await client
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    const safeLikesCount = typeof realCount === 'number' ? realCount : 0;

    await client
      .from('posts')
      .update({ likes_count: safeLikesCount })
      .eq('id', postId);

    return NextResponse.json({ 
      success: true, 
      isLiked: false, 
      likes_count: safeLikesCount 
    });
  } catch (error: any) {
    console.error('[API /api/likes DELETE] Server exception:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
