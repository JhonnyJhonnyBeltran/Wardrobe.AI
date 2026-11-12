import { createClient as createAdminClient, SupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zitsnkacbmkeqnkjasbr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

async function purgeStoragePrefix(client: SupabaseClient, bucket: string, prefix: string) {
  try {
    let offset = 0;
    const limit = 100;
    while (true) {
      const { data: files, error } = await client.storage.from(bucket).list(prefix, { limit, offset });
      if (error || !files || files.length === 0) break;

      const filePaths: string[] = [];
      for (const file of files) {
        const fullPath = prefix ? `${prefix}/${file.name}` : file.name;
        // Folders in Supabase storage list have id === null
        if (!file.id) {
          await purgeStoragePrefix(client, bucket, fullPath);
        } else {
          filePaths.push(fullPath);
        }
      }

      if (filePaths.length > 0) {
        await client.storage.from(bucket).remove(filePaths);
      }

      if (files.length < limit) break;
      offset += limit;
    }
  } catch (err) {
    console.warn(`[UserDelete] Storage cleanup skipped for ${bucket}/${prefix}:`, err);
  }
}

async function safeDelete(promise: PromiseLike<{ error?: any }>, label: string) {
  try {
    const res = await promise;
    if (res?.error) {
      console.warn(`[UserDelete] ${label} warning:`, res.error.message || res.error);
    }
  } catch (err: any) {
    console.warn(`[UserDelete] ${label} skipped:`, err?.message || err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedUserId: string | undefined = body?.userId;

    // 1. Authenticate caller strictly from SSR cookies or Bearer JWT
    let callerUser: any = null;
    let bearerToken = '';

    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      bearerToken = authHeader.slice(7).trim();
    }

    const serverSupabase = await createServerClient();
    try {
      const { data } = await serverSupabase.auth.getUser();
      if (data?.user) {
        callerUser = data.user;
      }
    } catch {}

    const userScopedClient = bearerToken
      ? createAdminClient(supabaseUrl, supabaseAnonKey, {
          auth: { autoRefreshToken: false, persistSession: false },
          global: { headers: { Authorization: `Bearer ${bearerToken}` } },
        })
      : (serverSupabase as unknown as SupabaseClient);

    if (!callerUser && bearerToken) {
      try {
        const { data } = await userScopedClient.auth.getUser(bearerToken);
        if (data?.user) {
          callerUser = data.user;
        }
      } catch {}
    }

    if (!callerUser) {
      return NextResponse.json({ error: 'No autorizado: sesión no válida' }, { status: 401 });
    }

    const userId: string = callerUser.id;
    if (requestedUserId && requestedUserId !== userId) {
      console.error('[UserDelete] Mismatched user delete attempt:', { caller: userId, target: requestedUserId });
      return NextResponse.json({ error: 'No autorizado para eliminar esta cuenta' }, { status: 403 });
    }

    const hasServiceRole = Boolean(serviceRoleKey);
    const supabaseAdmin = hasServiceRole
      ? createAdminClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null;

    // Use true admin client if available, otherwise caller-authenticated JWT client (respects user RLS)
    const db: SupabaseClient = supabaseAdmin || userScopedClient;

    console.log(`[UserDelete] Starting permanent purge for user: ${userId} (serviceRole=${hasServiceRole})`);

    // 2. Gather owned entity IDs
    const [{ data: userPosts }, { data: userOutfits }, { data: userConvs }] = await Promise.all([
      db.from('posts').select('id').eq('user_id', userId),
      db.from('outfits').select('id').eq('user_id', userId),
      db.from('conversation_participants').select('conversation_id').eq('user_id', userId),
    ]);

    const postIds = (userPosts || []).map((p: any) => p.id);
    const outfitIds = (userOutfits || []).map((o: any) => o.id);
    const convIds = [...new Set((userConvs || []).map((c: any) => c.conversation_id))];

    // 3. Delete dependent social records
    await Promise.all([
      safeDelete(db.from('comments').delete().eq('user_id', userId), 'comments.user'),
      postIds.length > 0 ? safeDelete(db.from('comments').delete().in('post_id', postIds), 'comments.post') : Promise.resolve(),
      safeDelete(db.from('likes').delete().eq('user_id', userId), 'likes.user'),
      postIds.length > 0 ? safeDelete(db.from('likes').delete().in('post_id', postIds), 'likes.post') : Promise.resolve(),
      safeDelete(db.from('saves').delete().eq('user_id', userId), 'saves.user'),
      postIds.length > 0 ? safeDelete(db.from('saves').delete().in('post_id', postIds), 'saves.post') : Promise.resolve(),
      safeDelete(db.from('saved_posts').delete().eq('user_id', userId), 'saved_posts.user'),
      safeDelete(db.from('save_folders').delete().eq('user_id', userId), 'save_folders.user'),
      safeDelete(db.from('follows').delete().eq('follower_id', userId), 'follows.follower'),
      safeDelete(db.from('follows').delete().eq('following_id', userId), 'follows.following'),
      safeDelete(db.from('follow_requests').delete().eq('follower_id', userId), 'follow_requests.follower'),
      safeDelete(db.from('follow_requests').delete().eq('following_id', userId), 'follow_requests.following'),
      safeDelete(db.from('notifications').delete().eq('user_id', userId), 'notifications.user'),
      safeDelete(db.from('notifications').delete().eq('actor_id', userId), 'notifications.actor'),
    ]);

    // 4. Delete messages and empty conversations
    await Promise.all([
      safeDelete(db.from('messages').delete().eq('sender_id', userId), 'messages.sender'),
      safeDelete(db.from('conversation_participants').delete().eq('user_id', userId), 'conv_participants'),
    ]);

    for (const cId of convIds) {
      try {
        const { count } = await db
          .from('conversation_participants')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', cId);
        if (!count || count === 0) {
          await safeDelete(db.from('messages').delete().eq('conversation_id', cId), 'conv.messages');
          await safeDelete(db.from('conversations').delete().eq('id', cId), 'conversations');
        }
      } catch {}
    }

    // 5. Delete calendar assignments, posts, outfits & clothing items
    await Promise.all([
      safeDelete(db.from('calendar_outfits').delete().eq('user_id', userId), 'calendar_outfits.user'),
      outfitIds.length > 0
        ? safeDelete(db.from('calendar_outfits').delete().in('outfit_id', outfitIds), 'calendar_outfits.outfit')
        : Promise.resolve(),
    ]);

    if (postIds.length > 0) {
      await safeDelete(db.from('posts').delete().eq('user_id', userId), 'posts');
    }

    if (outfitIds.length > 0) {
      await safeDelete(db.from('outfit_items').delete().in('outfit_id', outfitIds), 'outfit_items');
      await safeDelete(db.from('outfits').delete().eq('user_id', userId), 'outfits');
    }

    await safeDelete(db.from('clothing_items').delete().eq('user_id', userId), 'clothing_items');

    // 6. Delete user profile & legacy users table
    await safeDelete(db.from('profiles').delete().eq('id', userId), 'profiles');
    await safeDelete(db.from('users').delete().eq('id', userId), 'users.id');
    if (callerUser?.email) {
      await safeDelete(db.from('users').delete().eq('email', callerUser.email), 'users.email');
    }

    // 7. Purge storage objects across all buckets
    const storageClient = supabaseAdmin || userScopedClient;
    await Promise.all([
      purgeStoragePrefix(storageClient, 'avatars', userId),
      purgeStoragePrefix(storageClient, 'clothing-images', userId),
      purgeStoragePrefix(storageClient, 'clothing-images', `outfits/${userId}`),
      purgeStoragePrefix(storageClient, 'posts', userId),
      purgeStoragePrefix(storageClient, 'outfits', userId),
    ]);

    // Clean flat avatar file naming `${userId}.ext` in avatars root
    try {
      const { data: avatarRootFiles } = await storageClient.storage.from('avatars').list('', { search: userId });
      if (avatarRootFiles && avatarRootFiles.length > 0) {
        const exactMatches = avatarRootFiles
          .filter((f) => f.id && f.name.startsWith(userId))
          .map((f) => f.name);
        if (exactMatches.length > 0) {
          await storageClient.storage.from('avatars').remove(exactMatches);
        }
      }
    } catch {}

    // 8. Permanently delete Supabase Auth user (Service Role Admin OR SQL RPC `delete_own_account`)
    let authDeleted = false;
    let authErrorMsg: string | null = null;

    if (supabaseAdmin) {
      const { error: adminErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (!adminErr) {
        authDeleted = true;
      } else {
        authErrorMsg = adminErr.message;
        console.warn('[UserDelete] auth.admin.deleteUser failed:', adminErr.message);
      }
    }

    if (!authDeleted) {
      const { error: rpcErr } = await (userScopedClient as any).rpc('delete_own_account');
      if (!rpcErr) {
        authDeleted = true;
      } else {
        authErrorMsg = authErrorMsg || rpcErr.message;
        console.warn('[UserDelete] rpc(delete_own_account) failed:', rpcErr.message);
      }
    }

    if (!authDeleted) {
      return NextResponse.json(
        {
          error:
            'No se pudo eliminar definitivamente el usuario de autenticación. Configura SUPABASE_SERVICE_ROLE_KEY o aplica la migración SQL delete_own_account.',
          details: authErrorMsg,
        },
        { status: 500 }
      );
    }

    // Clear cookies on server client best-effort
    try {
      await serverSupabase.auth.signOut();
    } catch {}

    console.log(`[UserDelete] Permanent account purge completed for: ${userId}`);
    return NextResponse.json({ success: true, deletedAuth: true, userId });
  } catch (err: any) {
    console.error('[UserDelete] Unexpected error during user deletion:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
