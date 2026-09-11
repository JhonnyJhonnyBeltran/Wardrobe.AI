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

        // 1. Fetch Post with joined profiles and outfit
        const { data: post, error: postError } = await supabaseAdmin
            .from('posts')
            .select(`
                id, caption, image_url, created_at, user_id, likes_count, comments_count, outfit_id, style_ids,
                profiles (id, username, full_name, avatar_url, bio),
                outfits (
                    id, name, image_url, occasion,
                    outfit_items (
                        id, position_x, position_y, scale, rotation, layer_order, clothing_item_id,
                        clothing_items (*)
                    )
                )
            `)
            .eq('id', postId)
            .maybeSingle();

        if (postError) {
            console.error('[PostAPI] Error fetching post:', postError);
            return NextResponse.json({ error: postError.message }, { status: 500 });
        }

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        let resolvedOutfit: any = post.outfits || null;
        if (Array.isArray(resolvedOutfit)) {
            resolvedOutfit = resolvedOutfit[0] || null;
        }

        // If outfit_id exists but join was empty, fetch directly
        if (!resolvedOutfit && post.outfit_id) {
            const { data: directOutfit } = await supabaseAdmin
                .from('outfits')
                .select(`
                    id, name, image_url, occasion,
                    outfit_items (
                        id, position_x, position_y, scale, rotation, layer_order, clothing_item_id,
                        clothing_items (*)
                    )
                `)
                .eq('id', post.outfit_id)
                .maybeSingle();
            if (directOutfit) resolvedOutfit = directOutfit;
        }

        // If still no outfit, check if there is an outfit matching post image_url or creator
        if (!resolvedOutfit && post.image_url) {
            const { data: imgOutfit } = await supabaseAdmin
                .from('outfits')
                .select(`
                    id, name, image_url, occasion,
                    outfit_items (
                        id, position_x, position_y, scale, rotation, layer_order, clothing_item_id,
                        clothing_items (*)
                    )
                `)
                .eq('image_url', post.image_url)
                .maybeSingle();
            if (imgOutfit) resolvedOutfit = imgOutfit;
        }

        // Ensure clothing_items inside outfit_items are completely populated
        let postGarments: any[] = [];
        if (resolvedOutfit) {
            const outfitData = Array.isArray(resolvedOutfit) ? resolvedOutfit[0] : resolvedOutfit;
            let rawItems = outfitData.outfit_items || outfitData.items || [];

            // If outfit_items was empty or missing garments, fetch from outfit_items table
            if (rawItems.length === 0 && outfitData.id) {
                const { data: directOi } = await supabaseAdmin
                    .from('outfit_items')
                    .select('id, position_x, position_y, scale, rotation, layer_order, clothing_item_id, clothing_items (*)')
                    .eq('outfit_id', outfitData.id)
                    .order('layer_order', { ascending: true });
                if (directOi) rawItems = directOi;
            }

            const missingClothingIds = rawItems
                .map((oi: any) => oi.clothing_item_id)
                .filter(Boolean);

            const clothesMap = new Map<string, any>();

            if (missingClothingIds.length > 0) {
                const { data: fetchedClothes } = await supabaseAdmin
                    .from('clothing_items')
                    .select('*')
                    .in('id', missingClothingIds);

                if (fetchedClothes) {
                    fetchedClothes.forEach((c: any) => clothesMap.set(c.id, c));
                }
            }

            const normalizedItems = rawItems.map((oi: any) => {
                const garment = clothesMap.get(oi.clothing_item_id) || oi.clothing_items || oi.clothing_item || null;
                const normalizedGarment = Array.isArray(garment) ? garment[0] : garment;
                return {
                    ...oi,
                    clothing_items: normalizedGarment,
                    clothing_item: normalizedGarment,
                    clothing: normalizedGarment
                };
            });

            outfitData.outfit_items = normalizedItems;
            outfitData.items = normalizedItems;
            resolvedOutfit = outfitData;

            postGarments = normalizedItems
                .map((oi: any) => oi.clothing_items)
                .filter(Boolean);
        }

        return NextResponse.json({
            post: {
                ...post,
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
