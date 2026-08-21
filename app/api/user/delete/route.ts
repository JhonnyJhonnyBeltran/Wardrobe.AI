import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Verify the user making the request has a valid token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '').trim();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[UserDelete] Missing Supabase service role key or URL');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Create admin client with service role key to bypass RLS and perform full cascade deletion
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Verify that the caller's JWT token matches the userId being deleted
        const { data: { user: callerUser }, error: verifyError } = await supabaseAdmin.auth.getUser(token);
        if (verifyError || !callerUser || callerUser.id !== userId) {
            console.error('[UserDelete] Unauthorized delete attempt:', { caller: callerUser?.id, target: userId, error: verifyError });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

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

        // 13. Finally Delete User from Supabase Auth
        const { data: deletedAuthUser, error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authDeleteError) {
            console.error('[UserDelete] Error deleting auth user from GoTrue:', authDeleteError);
            return NextResponse.json({ error: authDeleteError.message }, { status: 500 });
        }

        console.log(`[UserDelete] Successfully purged all user data for: ${userId}`);
        return NextResponse.json({ success: true, data: deletedAuthUser });

    } catch (err: any) {
        console.error('[UserDelete] Unexpected error during user deletion:', err);
        return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
    }
}
