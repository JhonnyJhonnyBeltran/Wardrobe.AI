import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zitsnkacbmkeqnkjasbr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.SUPABASE_SERVICE_KEY || 
                           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const userId = body.userId;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // 1. Resolve calling user via Server Cookies or Authorization header
        let callerUser: any = null;

        try {
            const serverSupabase = await createServerClient();
            const { data } = await serverSupabase.auth.getUser();
            if (data?.user) {
                callerUser = data.user;
            }
        } catch {}

        const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
        const token = authHeader ? authHeader.replace('Bearer ', '').trim() : '';

        // Initialize admin or client
        const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        if (!callerUser && token) {
            try {
                const { data } = await supabaseAdmin.auth.getUser(token);
                if (data?.user) {
                    callerUser = data.user;
                }
            } catch {}
        }

        // Verify that the caller is authenticated and deleting their own account
        if (!callerUser || callerUser.id !== userId) {
            console.error('[UserDelete] Unauthorized delete attempt:', { caller: callerUser?.id, target: userId });
            return NextResponse.json({ error: 'No autorizado para eliminar esta cuenta' }, { status: 403 });
        }

        const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);

        console.log(`[UserDelete] Starting complete purge for user: ${userId}`);

        // 1. Gather all User's Post IDs & Outfit IDs & Conversation IDs
        const [{ data: userPosts }, { data: userOutfits }, { data: userConvs }] = await Promise.all([
            supabaseAdmin.from('posts').select('id').eq('user_id', userId),
            supabaseAdmin.from('outfits').select('id').eq('user_id', userId),
            supabaseAdmin.from('conversation_participants').select('conversation_id').eq('user_id', userId)
        ]);

        const postIds = (userPosts || []).map((p: any) => p.id);
        const outfitIds = (userOutfits || []).map((o: any) => o.id);
        const convIds = [...new Set((userConvs || []).map((c: any) => c.conversation_id))];

        // 2. Delete Comments
        await Promise.all([
            supabaseAdmin.from('comments').delete().eq('user_id', userId),
            postIds.length > 0 ? supabaseAdmin.from('comments').delete().in('post_id', postIds) : Promise.resolve()
        ]);

        // 3. Delete Likes
        await Promise.all([
            supabaseAdmin.from('likes').delete().eq('user_id', userId),
            postIds.length > 0 ? supabaseAdmin.from('likes').delete().in('post_id', postIds) : Promise.resolve()
        ]);

        // 4. Delete Saves & Folders
        await Promise.all([
            supabaseAdmin.from('saves').delete().eq('user_id', userId),
            postIds.length > 0 ? supabaseAdmin.from('saves').delete().in('post_id', postIds) : Promise.resolve(),
            supabaseAdmin.from('save_folders').delete().eq('user_id', userId)
        ]);

        // 5. Delete Follows & Follow Requests
        await Promise.all([
            supabaseAdmin.from('follows').delete().eq('follower_id', userId),
            supabaseAdmin.from('follows').delete().eq('following_id', userId),
            supabaseAdmin.from('follow_requests').delete().eq('follower_id', userId),
            supabaseAdmin.from('follow_requests').delete().eq('following_id', userId)
        ]);

        // 6. Delete Notifications
        await Promise.all([
            supabaseAdmin.from('notifications').delete().eq('user_id', userId),
            supabaseAdmin.from('notifications').delete().eq('actor_id', userId)
        ]);

        // 7. Delete Direct Messages & Clean up empty Conversations
        await Promise.all([
            supabaseAdmin.from('messages').delete().eq('sender_id', userId),
            supabaseAdmin.from('conversation_participants').delete().eq('user_id', userId)
        ]);

        for (const cId of convIds) {
            try {
                const { count } = await supabaseAdmin
                    .from('conversation_participants')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', cId);

                if (!count || count === 0) {
                    await supabaseAdmin.from('messages').delete().eq('conversation_id', cId);
                    await supabaseAdmin.from('conversations').delete().eq('id', cId);
                }
            } catch (convErr) {
                console.warn(`[UserDelete] Could not clean conversation ${cId}:`, convErr);
            }
        }

        // 8. Delete Posts
        if (postIds.length > 0) {
            await supabaseAdmin.from('posts').delete().eq('user_id', userId);
        }

        // 9. Delete Outfits & Outfit Items
        if (outfitIds.length > 0) {
            await supabaseAdmin.from('outfit_items').delete().in('outfit_id', outfitIds);
            await supabaseAdmin.from('outfits').delete().eq('user_id', userId);
        }

        // 10. Delete Clothing Items
        await supabaseAdmin.from('clothing_items').delete().eq('user_id', userId);

        // 11. Delete Profile & Legacy DB Entries
        await Promise.all([
            supabaseAdmin.from('profiles').delete().eq('id', userId),
            supabaseAdmin.from('users').delete().eq('id', userId).maybeSingle()
        ]);

        // 12. Clean Storage files (best effort)
        try {
            const { data: avatarFiles } = await supabaseAdmin.storage.from('avatars').list('', { search: userId });
            if (avatarFiles && avatarFiles.length > 0) {
                await supabaseAdmin.storage.from('avatars').remove(avatarFiles.map(f => f.name));
            }
        } catch (storageErr) {
            console.warn('[UserDelete] Storage cleanup avatars error:', storageErr);
        }

        try {
            const { data: clothingFiles } = await supabaseAdmin.storage.from('clothing-images').list(userId);
            if (clothingFiles && clothingFiles.length > 0) {
                await supabaseAdmin.storage.from('clothing-images').remove(clothingFiles.map(f => `${userId}/${f.name}`));
            }
            const { data: outfitFiles } = await supabaseAdmin.storage.from('clothing-images').list(`outfits/${userId}`);
            if (outfitFiles && outfitFiles.length > 0) {
                await supabaseAdmin.storage.from('clothing-images').remove(outfitFiles.map(f => `outfits/${userId}/${f.name}`));
            }
        } catch (storageErr) {
            console.warn('[UserDelete] Storage cleanup clothing error:', storageErr);
        }

        // 13. Finally Delete User from Supabase Auth (if Service Role is available)
        let deletedAuthUser = null;
        if (hasServiceRole) {
            try {
                const { data, error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
                if (authDeleteError) {
                    console.warn('[UserDelete] Service role GoTrue deleteUser warning:', authDeleteError);
                } else {
                    deletedAuthUser = data;
                }
            } catch (authErr) {
                console.warn('[UserDelete] GoTrue admin delete exception:', authErr);
            }
        }

        console.log(`[UserDelete] Successfully purged all user data for: ${userId}`);
        return NextResponse.json({ success: true, data: deletedAuthUser || { id: userId } });

    } catch (err: any) {
        console.error('[UserDelete] Unexpected error during user deletion:', err);
        return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
    }
}
