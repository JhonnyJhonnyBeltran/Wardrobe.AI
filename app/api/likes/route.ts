import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Helper to authenticate user and select an RLS-authenticated (or service-role) database client
async function getDbClient(request: NextRequest) {
  let user: any = null;
  let client: any = null;

  // 1. Check Bearer token from header
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  let token: string | null = null;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '').trim();
  }

  if (token) {
    try {
      const anonClient = createAdminClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { data } = await anonClient.auth.getUser(token);
      if (data?.user) {
        user = data.user;
        client = createAdminClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false }
        });
      }
    } catch (e) {
      console.warn('[api/likes] Error authenticating with Bearer token:', e);
    }
  }

  // 2. If no user from token, check cookies via SSR createClient()
  if (!user) {
    try {
      const supabaseServer = await createClient();
      const { data } = await supabaseServer.auth.getUser();
      if (data?.user) {
        user = data.user;
        client = supabaseServer;
      }
    } catch (e) {
      console.warn('[api/likes] Error authenticating with server cookies:', e);
    }
  }

  // 3. If service role key is available, also provide an admin client for count sync / notifications
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const adminClient = serviceKey
    ? createAdminClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      })
    : null;

  if (!client) {
    client = adminClient || createAdminClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  return { client: adminClient || client, userClient: client, user };
}

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

    // 2. Fetch post to get author and image for safe notification
    try {
      const { data: postData } = await client
        .from('posts')
        .select('user_id, image_url')
        .eq('id', postId)
        .maybeSingle();

      if (postData && postData.user_id && postData.user_id !== user.id) {
        const { data: senderProfile } = await client
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        const senderName = senderProfile?.full_name || senderProfile?.username || 'Alguien';

        await client
          .from('notifications')
          .insert({
            user_id: postData.user_id,
            sender_id: user.id,
            type: 'like',
            title: 'Nuevo me gusta',
            message: `${senderName} le gustó tu publicación`,
            entity_id: postId,
            data: {
              post_id: postId,
              image_url: postData.image_url,
              actor_id: user.id,
              sender_avatar: senderProfile?.avatar_url || null
            }
          });
      }
    } catch (notifErr) {
      console.warn('[API /api/likes POST] Notification creation warning (ignored):', notifErr);
    }

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
