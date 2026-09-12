import { SupabaseClient } from '@supabase/supabase-js';

export interface UserStylingContext {
  user: {
    id: string;
    username?: string;
    fullName?: string;
    firstName?: string;
    bio?: string;
    preferredStyles: string[];
    bodyShape?: string;
    seasonPalette?: string;
    morphology?: string;
    colorimetry?: string;
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
      tags?: string[];
      reference?: string;
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
  savedInspirations?: Array<{
    id: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    styleIds?: string[];
  }>;
}

/**
 * Builds a complete structured styling context for Klosy AI
 */
export async function buildUserStylingContext(
  supabase: SupabaseClient,
  userId: string
): Promise<UserStylingContext> {
  try {
    // 1. Fetch Profile Preferences from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, full_name, bio, preferred_styles, body_shape, season_palette, gender, age, age_range, morphology, colorimetry')
      .eq('id', userId)
      .maybeSingle();

    // Fallback to legacy 'users' table if profile fields are missing
    let fallbackName: string | null = null;
    let fallbackAge: number | null = null;
    let fallbackGender: string | null = null;
    let fallbackUsername: string | null = null;

    if (!profile?.full_name || !profile?.age || !profile?.gender) {
      try {
        const { data: legacyUser } = await supabase
          .from('users')
          .select('name, username, age, gender, preferred_styles, morphology, colorimetry')
          .eq('id', userId)
          .maybeSingle();

        if (legacyUser) {
          fallbackName = legacyUser.name || null;
          fallbackUsername = legacyUser.username || null;
          fallbackAge = legacyUser.age || null;
          fallbackGender = legacyUser.gender || null;
        }
      } catch (legacyErr) {
        console.warn('[ContextIndexer] Could not check legacy users table:', legacyErr);
      }
    }

    // Determine final clean name and first name for Kloe
    const rawFullName = profile?.full_name || fallbackName;
    const rawUsername = profile?.username || fallbackUsername;
    const primaryName = rawFullName || rawUsername || '';
    const cleanFirstName = primaryName
      ? primaryName.split(' ')[0].replace(/^@/, '').trim()
      : '';
    const formattedFirstName = cleanFirstName
      ? cleanFirstName.charAt(0).toUpperCase() + cleanFirstName.slice(1)
      : '';

    const finalAge = profile?.age || fallbackAge;
    const finalGender = profile?.gender || fallbackGender;

    // 2. Fetch User's Clothing Items with extended attributes
    const { data: clothes } = await supabase
      .from('clothing_items')
      .select('id, name, category, color, color_hex, brand, fabric, season, tags, reference, image_url, original_image_url')
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
      tags: c.tags || [],
      reference: c.reference,
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

    // 5. Fetch User's Saved Posts & Inspo Outfits
    let savedInspirations: Array<{
      id: string;
      title?: string;
      description?: string;
      imageUrl?: string;
      styleIds?: string[];
    }> = [];

    try {
      const { data: savedEntries } = await supabase
        .from('saves')
        .select(`
          post_id,
          posts (
            id,
            caption,
            style_ids,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      savedInspirations = (savedEntries || [])
        .map((s: any) => s.posts)
        .filter(Boolean)
        .map((p: any) => ({
          id: p.id,
          title: p.caption || 'Look Guardado',
          description: p.caption,
          imageUrl: p.image_url,
          styleIds: p.style_ids || []
        }));
    } catch (saveErr) {
      console.warn('[ContextIndexer] Could not fetch saved posts:', saveErr);
    }

    return {
      user: {
        id: userId,
        username: rawUsername || 'Usuario',
        fullName: rawFullName || undefined,
        firstName: formattedFirstName || undefined,
        bio: profile?.bio,
        preferredStyles: profile?.preferred_styles || [],
        bodyShape: profile?.body_shape || (profile as any)?.morphology,
        seasonPalette: profile?.season_palette || (profile as any)?.colorimetry,
        morphology: (profile as any)?.morphology || profile?.body_shape,
        colorimetry: (profile as any)?.colorimetry || profile?.season_palette,
        gender: finalGender,
        age: typeof finalAge === 'number' ? finalAge : undefined
      },
      wardrobe: {
        totalItems: clothingList.length,
        items: clothingList,
        categoryCounts
      },
      existingOutfits,
      recentLikedStyles,
      savedInspirations
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
      recentLikedStyles: [],
      savedInspirations: []
    };
  }
}
