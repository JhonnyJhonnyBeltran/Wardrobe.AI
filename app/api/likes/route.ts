import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const getAdmin = () => createAdminClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { post_id } = body;

    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    const admin = getAdmin();

    // Check if like already exists
    const { data: existingLike } = await admin
      .from('likes')
      .select('post_id')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingLike) {
      return NextResponse.json({ success: true, isLiked: true });
    }

    // Insert like
    const { error: insertError } = await admin
      .from('likes')
      .insert({
        post_id,
        user_id: user.id
      });

    if (insertError && insertError.code !== '23505') {
      console.error('[API /api/likes POST] Error inserting like:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Fetch post to get author and image for safe notification
    const { data: postData } = await admin
      .from('posts')
      .select('user_id, image_url, likes_count')
      .eq('id', post_id)
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
            entity_id: post_id,
            data: {
              post_id,
              image_url: postData.image_url,
              actor_id: user.id,
              sender_avatar: senderProfile?.avatar_url || null
            }
          });
      } catch (notifErr) {
        console.warn('[API /api/likes POST] Notification creation warning (ignored):', notifErr);
      }
    }

    return NextResponse.json({ success: true, isLiked: true });
  } catch (error: any) {
    console.error('[API /api/likes POST] Server exception:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');

    if (!postId) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    const admin = getAdmin();

    const { error: deleteError } = await admin
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[API /api/likes DELETE] Error removing like:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, isLiked: false });
  } catch (error: any) {
    console.error('[API /api/likes DELETE] Server exception:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
