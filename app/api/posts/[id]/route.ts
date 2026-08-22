import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.SUPABASE_SERVICE_KEY || 
                           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !serviceKey) {
            console.error('[PostAPI] Missing Supabase credentials');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Fetch Post
        const { data: post, error: postError } = await supabaseAdmin
            .from('posts')
            .select(`
                id, caption, image_url, created_at, user_id, likes_count, comments_count, outfit_id, style_ids,
                profiles (id, username, full_name, avatar_url, bio)
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

        // 2. Fetch Outfit and Items if outfit_id exists
        let resolvedOutfit: any = null;

        if (post.outfit_id) {
            const { data: outfit } = await supabaseAdmin
                .from('outfits')
                .select('*')
                .eq('id', post.outfit_id)
                .maybeSingle();

            if (outfit) {
                const { data: outfitItems } = await supabaseAdmin
                    .from('outfit_items')
                    .select('*')
                    .eq('outfit_id', outfit.id)
                    .order('layer_order', { ascending: true });

                const rawItems = outfitItems || [];
                const clothingIds = rawItems.map((oi: any) => oi.clothing_item_id).filter(Boolean);

                const clothesMap = new Map<string, any>();

                if (clothingIds.length > 0) {
                    const { data: clothes } = await supabaseAdmin
                        .from('clothing_items')
                        .select('id, name, category, color, color_hex, image_url, original_image_url, brand, size, fabric, season, reference, source_url')
                        .in('id', clothingIds);

                    if (clothes) {
                        clothes.forEach((c: any) => clothesMap.set(c.id, c));
                    }
                }

                const resolvedItems = rawItems.map((oi: any) => {
                    const clothing = clothesMap.get(oi.clothing_item_id) || null;
                    return {
                        ...oi,
                        clothing_item: clothing,
                        clothing_items: clothing,
                        clothing: clothing
                    };
                });

                resolvedOutfit = {
                    ...outfit,
                    outfit_items: resolvedItems
                };
            }
        }

        return NextResponse.json({
            post: {
                ...post,
                outfits: resolvedOutfit,
                outfit: resolvedOutfit
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
