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

export async function POST(request: NextRequest) {
  try {
    const user = await resolveAuthUser(request);

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

    const admin = getAdmin();

    // Check if like already exists
    const { data: existingLike } = await admin
      .from('likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingLike) {
      const { error: insertError } = await admin
        .from('likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (insertError && insertError.code !== '23505') {
        console.error('[API /api/likes POST] Error inserting like:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    // Fetch post to get author and image for safe notification
    const { data: postData } = await admin
      .from('posts')
      .select('user_id, image_url')
      .eq('id', postId)
      .maybeSingle();

    // Send notification safely (never block or fail the like)
    if (postData && postData.user_id && postData.user_id !== user.id) {
      try {
        const { data: senderProfile } = await admin
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        const senderName = senderProfile?.full_name || senderProfile?.username || 'Alguien';

        await admin
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
      } catch (notifErr) {
        console.warn('[API /api/likes POST] Notification creation warning (ignored):', notifErr);
      }
    }

    // Recalculate exact real count from `likes` table and persist on `posts`
    const { count: realCount } = await admin
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    const safeLikesCount = typeof realCount === 'number' ? realCount : 1;

    await admin
      .from('posts')
      .update({ likes_count: safeLikesCount })
      .eq('id', postId);

    return NextResponse.json({ 
      success: true, 
      isLiked: true, 
      likes_count: safeLikesCount 
    });
  } catch (error: any) {
    console.error('[API /api/likes POST] Server exception:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await resolveAuthUser(request);

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

    const admin = getAdmin();

    // 1. Remove like from `likes` table
    const { error: deleteError } = await admin
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
      await admin
        .from('notifications')
        .delete()
        .eq('entity_id', postId)
        .eq('sender_id', user.id)
        .eq('type', 'like');
    } catch (notifErr) {
      console.warn('[API /api/likes DELETE] Notification removal warning (ignored):', notifErr);
    }

    // 3. Recalculate exact real count from `likes` table and update `posts.likes_count`
    const { count: realCount } = await admin
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    const safeLikesCount = typeof realCount === 'number' ? realCount : 0;

    await admin
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
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

