import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const resolvedParams = await props.params;
        const outfitId = resolvedParams?.id;

        if (!outfitId) {
            return NextResponse.json({ error: 'Missing outfit ID' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.SUPABASE_SERVICE_KEY || 
                           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !serviceKey) {
            console.error('[OutfitAPI] Missing Supabase credentials');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Create Supabase client (service role if available, fallback to anon)
        const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Fetch Outfit
        const { data: outfit, error: outfitError } = await supabaseAdmin
            .from('outfits')
            .select('*')
            .eq('id', outfitId)
            .maybeSingle();

        if (outfitError) {
            console.error('[OutfitAPI] Error fetching outfit:', outfitError);
            return NextResponse.json({ error: outfitError.message }, { status: 500 });
        }

        if (!outfit) {
            return NextResponse.json({ error: 'Outfit not found' }, { status: 404 });
        }

        // 2. Fetch Outfit Items
        const { data: outfitItems, error: itemsError } = await supabaseAdmin
            .from('outfit_items')
            .select('*')
            .eq('outfit_id', outfitId);

        if (itemsError) {
            console.warn('[OutfitAPI] Error fetching outfit_items:', itemsError);
        }

        const rawItems = outfitItems || [];

        // 3. Fetch Clothing Items by ID
        const clothingIds = rawItems
            .map((oi: any) => oi.clothing_item_id)
            .filter(Boolean);

        const clothesMap = new Map<string, any>();

        if (clothingIds.length > 0) {
            const { data: clothes, error: clothesError } = await supabaseAdmin
                .from('clothing_items')
                .select('id, name, category, color, color_hex, image_url, original_image_url, brand, size, fabric, reference, source_url')
                .in('id', clothingIds);

            if (clothesError) {
                console.error('[OutfitAPI] Error fetching clothing items:', clothesError);
            } else if (clothes) {
                clothes.forEach((c: any) => clothesMap.set(c.id, c));
            }
        }

        // 4. Merge items with clothing details
        const resolvedItems = rawItems.map((oi: any) => {
            const clothing = clothesMap.get(oi.clothing_item_id) || null;
            return {
                ...oi,
                clothing_item: clothing,
                clothing_items: clothing,
                clothing: clothing
            };
        });

        // 5. Fetch Owner Profile
        let owner = null;
        if (outfit.user_id) {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id, username, full_name, avatar_url, bio')
                .eq('id', outfit.user_id)
                .maybeSingle();
            owner = profile;
        }

        // 6. Fetch Related Posts ("Aparece en")
        const { data: postsData, error: postsError } = await supabaseAdmin
            .from('posts')
            .select('id, image_url, caption, created_at, user_id, likes_count, comments_count')
            .eq('outfit_id', outfitId)
            .order('created_at', { ascending: false });

        if (postsError) {
            console.warn('[OutfitAPI] Error fetching related posts:', postsError);
        }

        return NextResponse.json({
            outfit: {
                ...outfit,
                owner,
                outfit_items: resolvedItems
            },
            posts: postsData || []
        });

    } catch (err: any) {
        console.error('[OutfitAPI] Unexpected error:', err);
        return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
    }
}
