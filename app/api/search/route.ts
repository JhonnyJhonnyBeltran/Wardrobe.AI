import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Synonyms and category aliases mapping for fashion terms
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  shoes: [
    'zapato', 'zapatos', 'calzado', 'bamba', 'bambas', 'zapatilla', 'zapatillas',
    'sneaker', 'sneakers', 'bota', 'botas', 'botin', 'botines', 'botín',
    'mocasín', 'mocasines', 'mocasin', 'loafer', 'loafers', 'sandalia', 'sandalias',
    'tacon', 'tacón', 'tacones', 'slide', 'slides', 'chancla', 'chanclas', 'crocs',
    'derby', 'oxford', 'chelsea', 'jordan', 'dunk'
  ],
  hoodie: [
    'sudadera', 'sudaderas', 'sudaca', 'hoodie', 'hoodies', 'crewneck', 'sweater',
    'sueter', 'suéter', 'jersey', 'jerseys', 'pullover', 'cardigan', 'cárdigan'
  ],
  sweater: [
    'jersey', 'jerseys', 'sueter', 'suéter', 'sweater', 'sweaters', 'punto',
    'cardigan', 'cárdigan', 'rebeca', 'chaleco'
  ],
  jacket: [
    'chaqueta', 'chaquetas', 'cazadora', 'cazadoras', 'cazo', 'abrigo', 'abrigos',
    'blazer', 'blazers', 'bomber', 'bombers', 'biker', 'chupa', 'anorak', 'parka',
    'gabardina', 'trench', 'polar', 'fleece', 'cortavientos', 'windbreaker'
  ],
  outerwear: [
    'abrigo', 'abrigos', 'chaqueta', 'cazadora', 'parka', 'anorak', 'gabardina', 'trench', 'plumifero', 'plumífero'
  ],
  bottom: [
    'pantalon', 'pantalón', 'pantalones', 'vaquero', 'vaqueros', 'jean', 'jeans',
    'tejano', 'tejanos', 'cargo', 'cargos', 'jogger', 'joggers', 'chandal', 'chándal',
    'chino', 'chinos', 'bermuda', 'bermudas', 'shorts', 'short', 'legging', 'leggings',
    'pitillo', 'pitillos', 'baggy', 'wide leg'
  ],
  skirt: [
    'falda', 'faldas', 'minifalda', 'maxifalda', 'falda midi', 'skirt'
  ],
  dress: [
    'vestido', 'vestidos', 'dress', 'mono', 'jumpsuit'
  ],
  top: [
    'camiseta', 'camisetas', 'camisa', 'camisas', 'polo', 'polos', 'top', 'tops',
    'blusa', 'blusas', 'tirantes', 'tank top', 'crop top'
  ],
  bag: [
    'bolso', 'bolsos', 'mochila', 'mochilas', 'cartera', 'carteras', 'tote', 'tote bag',
    'bandolera', 'bandoleras', 'rinonera', 'riñonera', 'shopper', 'clutch'
  ],
  accessory: [
    'accesorio', 'accesorios', 'reloj', 'relojes', 'gorra', 'gorras', 'gorro', 'gorros',
    'beanie', 'gafas', 'gafas de sol', 'cinturon', 'cinturón', 'cinturones',
    'bufanda', 'bufandas', 'collar', 'collares', 'anillo', 'anillos', 'pulsera', 'pulseras',
    'pendientes', 'joya', 'joyas'
  ]
};

// Comprehensive fashion style families and kinship mappings (parentesco)
const STYLE_FAMILIES_MAP: Record<string, string[]> = {
  'glam': ['baddie-glam', 'noche-fiesta', 'y2k', 'chic-parisino', 'baddie'],
  'baddie': ['baddie-glam', 'streetwear', 'y2k'],
  'elegante': ['elegante-clasico', 'old-money', 'business-casual', 'chic-parisino', 'clean-look'],
  'clasico': ['elegante-clasico', 'old-money', 'preppy', 'business-casual'],
  'deportivo': ['deportivo-athleisure', 'gorpcore', 'skater-surf'],
  'athleisure': ['deportivo-athleisure', 'casual-moderno', 'gorpcore'],
  'streetwear': ['streetwear', 'techwear', 'y2k', 'skater-surf', 'cyberpunk', 'harajuku-j-fashion'],
  'casual': ['casual-moderno', 'smart-casual', 'clean-look', 'normcore'],
  'old money': ['old-money', 'elegante-clasico', 'preppy', 'quiet-luxury'],
  'quiet luxury': ['old-money', 'minimalista', 'clean-look'],
  'minimalista': ['minimalista', 'clean-look', 'normcore', 'old-money'],
  'y2k': ['y2k', 'cyberpunk', 'baddie-glam', 'harajuku-j-fashion'],
  'techwear': ['techwear', 'cyberpunk', 'gorpcore', 'streetwear'],
  'vintage': ['vintage-retro', 'cottagecore', 'coastal-resort', 'western-cowboy', 'dark-academia'],
  'retro': ['vintage-retro', 'y2k', 'rock-grunge'],
  'rock': ['rock-grunge', 'gotico-alt', 'dark-academia'],
  'grunge': ['rock-grunge', 'streetwear', 'gotico-alt'],
  'gotico': ['gotico-alt', 'rock-grunge', 'dark-academia'],
  'academia': ['dark-academia', 'light-academia', 'preppy'],
  'dark academia': ['dark-academia', 'light-academia', 'gotico-alt'],
  'light academia': ['light-academia', 'dark-academia', 'preppy'],
  'preppy': ['preppy', 'old-money', 'elegante-clasico'],
  'boho': ['boho-chic', 'cottagecore', 'coastal-resort'],
  'cottagecore': ['cottagecore', 'boho-chic', 'soft-girl-soft-boy'],
  'gorpcore': ['gorpcore', 'techwear', 'deportivo-athleisure'],
  'skater': ['skater-surf', 'streetwear', 'rock-grunge'],
  'clean look': ['clean-look', 'minimalista', 'casual-moderno'],
  'normcore': ['normcore', 'casual-moderno', 'minimalista'],
  'fiesta': ['noche-fiesta', 'baddie-glam', 'chic-parisino'],
  'noche': ['noche-fiesta', 'baddie-glam', 'elegante-clasico'],
  'smart casual': ['smart-casual', 'casual-moderno', 'business-casual'],
  'business': ['business-casual', 'elegante-clasico', 'smart-casual'],
  'workwear': ['workwear-americana', 'techwear', 'gorpcore'],
  'coquette': ['coquette', 'soft-girl-soft-boy', 'cottagecore'],
  'soft': ['soft-girl-soft-boy', 'coquette', 'light-academia'],
  'k-fashion': ['k-fashion', 'harajuku-j-fashion', 'clean-look', 'streetwear'],
  'harajuku': ['harajuku-j-fashion', 'k-fashion', 'cyberpunk', 'y2k'],
  'cyberpunk': ['cyberpunk', 'techwear', 'y2k', 'streetwear'],
  'western': ['western-cowboy', 'workwear-americana', 'boho-chic'],
  'cowboy': ['western-cowboy', 'vintage-retro'],
  'coastal': ['coastal-resort', 'old-money', 'clean-look'],
  'parisino': ['chic-parisino', 'elegante-clasico', 'old-money']
};

function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '40', 10);
    const from = page * limit;
    const to = from + limit - 1;

    const queryNorm = normalizeText(rawQuery);
    if (!queryNorm) {
      return NextResponse.json({
        posts: [],
        users: [],
        hasMore: false,
        total: 0
      });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Search Users / Profiles
    let userProfiles: any[] = [];
    try {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .or(`username.ilike.%${rawQuery}%,full_name.ilike.%${rawQuery}%`)
        .limit(10);

      if (profilesData) {
        userProfiles = profilesData.filter((p: any) => !user || p.id !== user.id);
      }
    } catch (e) {
      console.warn('[SearchAPI] Error searching profiles:', e);
    }

    // 2. Identify Category Matches via Fashion Synonyms
    const words = queryNorm.split(/\s+/).filter(w => w.length > 1);
    const matchedCategories = new Set<string>();

    for (const [catKey, synList] of Object.entries(CATEGORY_SYNONYMS)) {
      for (const word of words) {
        if (catKey === word || synList.some(s => normalizeText(s) === word || word.includes(normalizeText(s)))) {
          matchedCategories.add(catKey);
        }
      }
    }

    // 2.5 Identify Style Matches & Kinship (Parentesco de Estilos)
    const matchedStyleSlugs = new Set<string>();
    for (const [styleFamily, slugs] of Object.entries(STYLE_FAMILIES_MAP)) {
      if (queryNorm === styleFamily || queryNorm.includes(styleFamily) || styleFamily.includes(queryNorm)) {
        slugs.forEach(s => matchedStyleSlugs.add(s));
      }
      for (const word of words) {
        if (word === styleFamily || styleFamily.includes(word)) {
          slugs.forEach(s => matchedStyleSlugs.add(s));
        }
      }
    }

    // 3. Search Matching Clothing Items (Brand, Name, Category, Color, Fabric)
    let matchingClothingItemIds = new Set<string>();
    try {
      let clothingQuery = supabase
        .from('clothing_items')
        .select('id, name, brand, category, color, fabric');

      const clothingFilters: string[] = [
        `name.ilike.%${rawQuery}%`,
        `brand.ilike.%${rawQuery}%`,
        `color.ilike.%${rawQuery}%`,
        `fabric.ilike.%${rawQuery}%`
      ];

      // Add individual word queries (e.g., "sudadera" and "scuffers")
      if (words.length > 1) {
        words.forEach(w => {
          clothingFilters.push(`name.ilike.%${w}%`);
          clothingFilters.push(`brand.ilike.%${w}%`);
        });
      }

      if (matchedCategories.size > 0) {
        Array.from(matchedCategories).forEach(cat => {
          clothingFilters.push(`category.ilike.%${cat}%`);
        });
      }

      const { data: matchingItems } = await clothingQuery.or(clothingFilters.join(',')).limit(150);
      if (matchingItems) {
        matchingItems.forEach((ci: any) => matchingClothingItemIds.add(ci.id));
      }
    } catch (e) {
      console.warn('[SearchAPI] Error searching clothing items:', e);
    }

    // 4. Find Outfit IDs containing matching clothing items OR outfit name/description
    let matchingOutfitIds = new Set<string>();
    if (matchingClothingItemIds.size > 0) {
      try {
        const { data: outfitItemsData } = await supabase
          .from('outfit_items')
          .select('outfit_id')
          .in('clothing_item_id', Array.from(matchingClothingItemIds))
          .limit(200);

        if (outfitItemsData) {
          outfitItemsData.forEach((oi: any) => {
            if (oi.outfit_id) matchingOutfitIds.add(oi.outfit_id);
          });
        }
      } catch (e) {
        console.warn('[SearchAPI] Error finding outfit items:', e);
      }
    }

    // Search outfits directly by name/description
    try {
      const { data: outfitsByName } = await supabase
        .from('outfits')
        .select('id')
        .or(`name.ilike.%${rawQuery}%,description.ilike.%${rawQuery}%,occasion.ilike.%${rawQuery}%`)
        .limit(100);

      if (outfitsByName) {
        outfitsByName.forEach((o: any) => matchingOutfitIds.add(o.id));
      }
    } catch (e) {
      console.warn('[SearchAPI] Error searching outfits by name:', e);
    }

    // 5. Query Posts: Matches in Caption OR Outfit ID in matching outfits OR Style Tag
    let postsQuery = supabase
      .from('posts')
      .select(`
        id,
        caption,
        image_url,
        created_at,
        user_id,
        style_ids,
        outfits (
          id,
          name,
          description,
          occasion,
          outfit_items (
            clothing_items (
              id,
              name,
              brand,
              category,
              color,
              image_url
            )
          )
        ),
        likes (count)
      `);

    const postOrFilters: string[] = [`caption.ilike.%${rawQuery}%`];

    // If individual words exist, add to caption search
    if (words.length > 1) {
      words.forEach(w => {
        postOrFilters.push(`caption.ilike.%${w}%`);
      });
    }

    // If we matched style kinship slugs, include them in the query filter
    if (matchedStyleSlugs.size > 0) {
      Array.from(matchedStyleSlugs).forEach(slug => {
        postOrFilters.push(`style_ids.cs.{${slug}}`);
      });
    }

    // If we found matching outfits, include them in the query filter
    if (matchingOutfitIds.size > 0) {
      const outfitIdList = Array.from(matchingOutfitIds).slice(0, 100);
      outfitIdList.forEach(oid => {
        postOrFilters.push(`outfit_id.eq.${oid}`);
      });
    }

    // Execute posts query
    const { data: rawPosts, error: postsError } = await postsQuery
      .or(postOrFilters.join(','))
      .order('created_at', { ascending: false })
      .range(from, to + 10);

    if (postsError) {
      throw postsError;
    }

    const fetchedPosts = rawPosts || [];

    // 6. Enrich with Author Profiles
    const userIds = Array.from(new Set(fetchedPosts.map((p: any) => p.user_id)));
    let profilesMap: Record<string, any> = {};

    if (userIds.length > 0) {
      const { data: authorProfiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, full_name')
        .in('id', userIds);

      if (authorProfiles) {
        authorProfiles.forEach((p: any) => {
          profilesMap[p.id] = p;
        });
      }
    }

    // 7. Check User's Likes and Saves for results
    const likedPostIds = new Set<string>();
    const savedPostIds = new Set<string>();

    if (user?.id && fetchedPosts.length > 0) {
      const postIds = fetchedPosts.map((p: any) => p.id);
      const [likesRes, savesRes] = await Promise.all([
        supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
        supabase.from('saves').select('post_id').eq('user_id', user.id).in('post_id', postIds)
      ]);

      if (likesRes.data) {
        (likesRes.data as any[]).forEach((l: any) => likedPostIds.add(l.post_id));
      }
      if (savesRes.data) {
        (savesRes.data as any[]).forEach((s: any) => savedPostIds.add(s.post_id));
      }
    }

    // 8. Calculate Relevance Scoring & Format
    const scoredPosts = fetchedPosts.map((item: any) => {
      let score = 0;
      const captionNorm = normalizeText(item.caption);
      const outfitNameNorm = normalizeText(item.outfits?.name);

      // Score 1: Exact Caption match
      if (captionNorm.includes(queryNorm)) score += 20;

      // Score 2: Outfit Name match
      if (outfitNameNorm.includes(queryNorm)) score += 25;

      // Score 3: Linked Clothing Items match (Name, Brand, Category, Fabric)
      const outfitItems = item.outfits?.outfit_items || [];
      outfitItems.forEach((oi: any) => {
        const c = oi.clothing_items;
        if (!c) return;
        const cName = normalizeText(c.name);
        const cBrand = normalizeText(c.brand);
        const cCategory = normalizeText(c.category);
        const cColor = normalizeText(c.color);

        // Exact brand match (e.g. "scuffers")
        if (cBrand && (cBrand === queryNorm || queryNorm.includes(cBrand))) {
          score += 35;
        }
        // Garment name match (e.g. "sudadera")
        if (cName && (cName.includes(queryNorm) || queryNorm.includes(cName))) {
          score += 30;
        }
        // Category match
        if (cCategory && matchedCategories.has(cCategory)) {
          score += 20;
        }
        // Word level overlap
        words.forEach(w => {
          if (cName.includes(w)) score += 10;
          if (cBrand.includes(w)) score += 15;
          if (cColor.includes(w)) score += 8;
        });
      });

      // Score 4: Style Tag & Kinship Matches (Parentesco de Estilos)
      if (item.style_ids && Array.isArray(item.style_ids)) {
        item.style_ids.forEach((sId: string) => {
          const sNorm = normalizeText(sId);
          if (queryNorm === sNorm || sNorm.includes(queryNorm) || queryNorm.includes(sNorm)) {
            score += 45;
          }
          if (matchedStyleSlugs.has(sId) || matchedStyleSlugs.has(sNorm)) {
            score += 40;
          }
        });
      }

      // Likes contribution
      const likesCount = item.likes?.[0]?.count || 0;
      score += Math.min(likesCount * 0.2, 10);

      // Resolve display image
      let displayImage = item.image_url;
      if (!displayImage && outfitItems.length > 0) {
        const itemWithImg = outfitItems.find((oi: any) => oi.clothing_items?.image_url);
        if (itemWithImg) displayImage = itemWithImg.clothing_items.image_url;
      }

      const profile = profilesMap[item.user_id];
      const authorName = profile?.username || profile?.full_name || 'Usuario';
      const authorAvatar = profile?.avatar_url || '/placeholder-avatar.png';

      return {
        id: item.id,
        imageUrl: displayImage,
        title: item.caption || item.outfits?.name || 'Look',
        author: {
          name: authorName,
          avatar: authorAvatar
        },
        likes: likesCount,
        comments: 0,
        isLiked: likedPostIds.has(item.id),
        isSaved: savedPostIds.has(item.id),
        user_id: item.user_id,
        description: item.caption,
        score
      };
    });

    // Sort by relevance score descending
    scoredPosts.sort((a, b) => b.score - a.score);

    const paginatedPosts = scoredPosts.slice(0, limit);
    const hasMore = scoredPosts.length > limit || rawPosts.length === limit;

    return NextResponse.json({
      posts: paginatedPosts,
      users: userProfiles,
      hasMore,
      total: paginatedPosts.length
    });

  } catch (error: any) {
    console.error('[SearchAPI] Error in search API:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al realizar la búsqueda', posts: [], users: [] },
      { status: 500 }
    );
  }
}
