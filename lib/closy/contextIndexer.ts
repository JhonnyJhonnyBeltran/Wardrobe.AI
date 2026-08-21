import { SupabaseClient } from '@supabase/supabase-js';

export interface UserStylingContext {
  user: {
    id: string;
    username?: string;
    fullName?: string;
    preferredStyles: string[];
    bodyShape?: string;
    seasonPalette?: string;
    gender?: string;
    age?: number;
  };
  wardrobe: {
    totalItems: number;
    items: Array<{
      id: string;
      name: string;
      category: string;
      color?: string;
      colorHex?: string;
      brand?: string;
      fabric?: string;
      season?: string;
      imageUrl?: string;
    }>;
    categoryCounts: Record<string, number>;
  };
  existingOutfits: Array<{
    id: string;
    name: string;
    occasion?: string;
    itemIds: string[];
  }>;
  recentLikedStyles: string[];
}

/**
 * Builds a complete structured styling context for CloSy AI
 */
export async function buildUserStylingContext(
  supabase: SupabaseClient,
  userId: string
): Promise<UserStylingContext> {
  try {
    // 1. Fetch Profile Preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, full_name, preferred_styles, body_shape, season_palette, gender, age')
      .eq('id', userId)
      .maybeSingle();

    // 2. Fetch User's Clothing Items
    const { data: clothes } = await supabase
      .from('clothing_items')
      .select('id, name, category, color, color_hex, brand, fabric, season, image_url, original_image_url')
      .eq('user_id', userId);

    const clothingList = (clothes || []).map((c: any) => ({
      id: c.id,
      name: c.name || 'Prenda sin nombre',
      category: c.category || 'other',
      color: c.color,
      colorHex: c.color_hex,
      brand: c.brand,
      fabric: c.fabric,
      season: c.season,
      imageUrl: c.image_url || c.original_image_url
    }));

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    clothingList.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    // 3. Fetch User's Outfits
    const { data: outfits } = await supabase
      .from('outfits')
      .select(`
        id, name, occasion,
        outfit_items (clothing_item_id)
      `)
      .eq('user_id', userId)
      .limit(20);

    const existingOutfits = (outfits || []).map((o: any) => ({
      id: o.id,
      name: o.name || 'Outfit',
      occasion: o.occasion,
      itemIds: (o.outfit_items || []).map((oi: any) => oi.clothing_item_id).filter(Boolean)
    }));

    // 4. Fetch User's Recent Likes to Extract Trending Personal Styles
    let recentLikedStyles: string[] = [];
    try {
      const { data: userLikes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      const postIds = (userLikes || []).map((l: any) => l.post_id).filter(Boolean);

      if (postIds.length > 0) {
        const { data: likedPosts } = await supabase
          .from('posts')
          .select('style_ids')
          .in('id', postIds);

        const styleFrequency: Record<string, number> = {};
        (likedPosts || []).forEach((p: any) => {
          if (Array.isArray(p.style_ids)) {
            p.style_ids.forEach((st: string) => {
              if (st) styleFrequency[st] = (styleFrequency[st] || 0) + 1;
            });
          }
        });

        recentLikedStyles = Object.entries(styleFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([style]) => style);
      }
    } catch (likeErr) {
      console.warn('[ContextIndexer] Could not fetch liked styles:', likeErr);
    }

    return {
      user: {
        id: userId,
        username: profile?.username || 'Usuario',
        fullName: profile?.full_name,
        preferredStyles: profile?.preferred_styles || [],
        bodyShape: profile?.body_shape,
        seasonPalette: profile?.season_palette,
        gender: profile?.gender,
        age: profile?.age
      },
      wardrobe: {
        totalItems: clothingList.length,
        items: clothingList,
        categoryCounts
      },
      existingOutfits,
      recentLikedStyles
    };
  } catch (error) {
    console.error('[ContextIndexer] Error building context:', error);
    return {
      user: {
        id: userId,
        preferredStyles: []
      },
      wardrobe: {
        totalItems: 0,
        items: [],
        categoryCounts: {}
      },
      existingOutfits: [],
      recentLikedStyles: []
    };
  }
}
