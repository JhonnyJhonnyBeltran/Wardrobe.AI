import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const resolvedParams = await props.params;
        const postId = resolvedParams?.id;

        if (!postId) {
            return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.SUPABASE_SERVICE_KEY || 
                           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabaseAdmin = createAdminClient(supabaseUrl, serviceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Fetch Post directly (avoids PostgREST relationship schema cache failures)
        const { data: post, error: postError } = await supabaseAdmin
            .from('posts')
            .select('id, caption, image_url, created_at, user_id, likes_count, comments_count, outfit_id, style_ids')
            .eq('id', postId)
            .maybeSingle();

        if (postError) {
            console.error('[PostAPI] Error fetching post:', postError);
            return NextResponse.json({ error: postError.message }, { status: 500 });
        }

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // 2. Fetch Creator Profile
        let authorProfile: any = null;
        if (post.user_id) {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id, username, full_name, avatar_url, bio')
                .eq('id', post.user_id)
                .maybeSingle();
            authorProfile = profile;
        }

        // 3. Fetch Outfit
        let resolvedOutfit: any = null;
        if (post.outfit_id) {
            const { data: directOutfit } = await supabaseAdmin
                .from('outfits')
                .select('id, name, image_url, occasion, style_ids, user_id')
                .eq('id', post.outfit_id)
                .maybeSingle();
            if (directOutfit) resolvedOutfit = directOutfit;
        }

        if (!resolvedOutfit && post.image_url) {
            const { data: imgOutfit } = await supabaseAdmin
                .from('outfits')
                .select('id, name, image_url, occasion, style_ids, user_id')
                .eq('image_url', post.image_url)
                .maybeSingle();
            if (imgOutfit) resolvedOutfit = imgOutfit;
        }

        // 4. Fetch Outfit Items
        let rawItems: any[] = [];
        if (resolvedOutfit?.id) {
            const { data: oiList } = await supabaseAdmin
                .from('outfit_items')
                .select('id, position_x, position_y, scale, rotation, layer_order, clothing_item_id')
                .eq('outfit_id', resolvedOutfit.id)
                .order('layer_order', { ascending: true });
            if (oiList) rawItems = oiList;
        }

        // 5. Fetch Garments / Clothing Items
        const clothingIds = rawItems
            .map((oi: any) => oi.clothing_item_id)
            .filter(Boolean);

        const clothesMap = new Map<string, any>();

        if (clothingIds.length > 0) {
            const { data: fetchedClothes } = await supabaseAdmin
                .from('clothing_items')
                .select('id, name, brand, category, color, color_hex, size, price, fabric, season, reference, source_url, image_url, original_image_url')
                .in('id', clothingIds);

            if (fetchedClothes) {
                fetchedClothes.forEach((c: any) => clothesMap.set(c.id, c));
            }
        }

        // 6. Normalize Items and Garments
        const normalizedItems = rawItems.map((oi: any) => {
            const garment = clothesMap.get(oi.clothing_item_id) || null;
            return {
                ...oi,
                clothing_items: garment,
                clothing_item: garment,
                clothing: garment
            };
        });

        const postGarments = normalizedItems
            .map((oi: any) => oi.clothing_items)
            .filter(Boolean);

        if (resolvedOutfit) {
            resolvedOutfit.outfit_items = normalizedItems;
            resolvedOutfit.items = normalizedItems;
        }

        return NextResponse.json({
            post: {
                ...post,
                profiles: authorProfile,
                user: authorProfile,
                outfits: resolvedOutfit,
                outfit: resolvedOutfit,
                clothing_items: postGarments,
                garments: postGarments
            }
        });

    } catch (error: any) {
        console.error('[PostAPI] Unexpected error:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
