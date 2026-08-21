'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Layers, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ProductModal from '@/components/ProductModal';
import Avatar from '@/components/Avatar';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import { haptics } from '@/lib/haptic';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import InteractiveOutfitViewer from '@/components/InteractiveOutfitViewer';
import { ClothingItem } from '@/components/ClothingItem';

interface OutfitItem {
  id: string;
  name: string;
  category: string;
  image_url: string;
  imageUrl?: string;
  brand: string;
  color: string;
  color_hex?: string;
  colorHex?: string;
  price?: string;
  source_url?: string;
  sourceUrl?: string;
  reference?: string;
  size?: string;
}

interface ProfileData {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

interface Outfit {
  id: string;
  user_id: string;
  name: string;
  description: string;
  image_url: string;
  occasion: string;
  season: string;
  is_public: boolean;
  favorite: boolean;
  created_at: string;
  owner?: ProfileData;
  outfit_items: Array<{
    position_x?: number;
    position_y?: number;
    scale?: number;
    rotation?: number;
    layer_order?: number;
    clothing_item_id?: string;
    clothing_item?: OutfitItem;
    clothing_items?: OutfitItem;
  }>;
}

export default function ProfileOutfitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<OutfitItem | null>(null);

  const profileParam = decodeURIComponent((params.id as string) || '');
  const outfitId = params.outfitId as string;

  useBodyScrollLock(!!selectedItem);

  useEffect(() => {
    if (!outfitId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Profile (by username or ID)
        let resolvedProfile: ProfileData | null = null;
        if (profileParam) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileParam);
          const query = supabase.from('profiles').select('id, username, full_name, avatar_url, bio');
          
          const { data: pData } = isUuid 
            ? await query.eq('id', profileParam).maybeSingle()
            : await query.eq('username', profileParam).maybeSingle();

          if (pData) {
            resolvedProfile = pData;
            setProfile(pData);
          }
        }

        // 2. Fetch Outfit row
        const { data: outfitData, error: outfitErr } = await supabase
          .from('outfits')
          .select('*')
          .eq('id', outfitId)
          .maybeSingle();

        if (outfitErr || !outfitData) {
          console.error('[ProfileOutfit] Error fetching outfit:', outfitErr);
          setOutfit(null);
          setLoading(false);
          return;
        }

        // If profile wasn't found from param, fetch from outfit.user_id
        if (!resolvedProfile && outfitData.user_id) {
          const { data: pData } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio')
            .eq('id', outfitData.user_id)
            .maybeSingle();
          if (pData) {
            resolvedProfile = pData;
            setProfile(pData);
          }
        }

        // 3. Fetch Outfit Items with joined clothing items
        let rawItems: any[] = [];
        const { data: itemsDataWithJoin } = await supabase
          .from('outfit_items')
          .select('*, clothing_item:clothing_items(id, name, category, color, color_hex, image_url, original_image_url, brand, size, fabric, reference, source_url)')
          .eq('outfit_id', outfitId);

        if (itemsDataWithJoin && itemsDataWithJoin.length > 0) {
          rawItems = itemsDataWithJoin;
        } else {
          // Fallback if join wasn't supported
          const { data: itemsDataPlain } = await supabase
            .from('outfit_items')
            .select('*')
            .eq('outfit_id', outfitId);
          rawItems = itemsDataPlain || [];
        }

        // 4. Fetch Missing Clothing Items by ID if any wasn't populated
        const missingClothingIds = rawItems
          .filter((oi: any) => !oi.clothing_item && !oi.clothing_items && oi.clothing_item_id)
          .map((oi: any) => oi.clothing_item_id);

        const clothesMap = new Map<string, any>();
        if (missingClothingIds.length > 0) {
          const { data: clothesList } = await supabase
            .from('clothing_items')
            .select('id, name, category, color, color_hex, image_url, original_image_url, brand, size, fabric, reference, source_url')
            .in('id', missingClothingIds);

          if (clothesList) {
            clothesList.forEach((c: any) => clothesMap.set(c.id, c));
          }
        }

        // 5. Merge items
        const resolvedItems = rawItems.map((oi: any) => {
          const clothing = oi.clothing_item || oi.clothing_items || clothesMap.get(oi.clothing_item_id) || null;
          return {
            ...oi,
            clothing_item: clothing,
            clothing_items: clothing,
            clothing: clothing
          };
        });

        // 6. Fetch related posts ("Aparece en")
        let relatedPostsList: any[] = [];
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, image_url, caption, created_at, user_id, likes_count, comments_count')
          .eq('outfit_id', outfitId)
          .order('created_at', { ascending: false });

        if (postsData && postsData.length > 0) {
          relatedPostsList = postsData;
        } else if (outfitData.image_url) {
          // Fallback: match by outfit composite image URL
          const { data: imgPosts } = await supabase
            .from('posts')
            .select('id, image_url, caption, created_at, user_id, likes_count, comments_count')
            .eq('image_url', outfitData.image_url)
            .order('created_at', { ascending: false });
          if (imgPosts && imgPosts.length > 0) {
            relatedPostsList = imgPosts;
          }
        }

        setOutfit({
          ...outfitData,
          owner: resolvedProfile || undefined,
          outfit_items: resolvedItems
        });
        setRelatedPosts(relatedPostsList);

      } catch (err) {
        console.error('[ProfileOutfit] Error in loadData:', err);
        setOutfit(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [outfitId, profileParam]);

  const handleItemClick = (item: any) => {
    if (!item) return;
    haptics.selection();
    const clothingRaw = item.clothing_items || item.clothing_item || item.clothing || item;
    const clothing = Array.isArray(clothingRaw) ? clothingRaw[0] : clothingRaw;
    if (!clothing) return;

    const normalizedItem: OutfitItem = {
      id: clothing.id,
      name: clothing.name || 'Prenda',
      category: clothing.category || clothing.type || 'Prenda',
      image_url: clothing.image_url || clothing.imageUrl || '',
      imageUrl: clothing.image_url || clothing.imageUrl || '',
      brand: clothing.brand || 'Klozet',
      color: clothing.color || '',
      color_hex: clothing.color_hex || clothing.colorHex || '',
      colorHex: clothing.color_hex || clothing.colorHex || '',
      price: clothing.price,
      source_url: clothing.source_url || clothing.sourceUrl,
      sourceUrl: clothing.source_url || clothing.sourceUrl,
      reference: clothing.reference,
      size: clothing.size
    };
    setSelectedItem(normalizedItem);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--brand-pink)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
        <p className="text-[var(--foreground)] font-semibold text-lg">Outfit no encontrado</p>
        <p className="text-sm text-[var(--foreground-tertiary)] mt-1">Este look no existe o ha sido eliminado.</p>
        <button
          onClick={() => profileParam ? router.push(`/profile/${profileParam}`) : router.push('/feed')}
          className="mt-6 px-6 py-2.5 bg-[var(--brand-pink)] text-white rounded-full font-semibold shadow-md hover:opacity-90 transition-all active:scale-95"
        >
          Volver al perfil
        </button>
      </div>
    );
  }

  // Extract items for list and viewer
  const outfitItems: OutfitItem[] = (outfit.outfit_items
    ?.map(oi => {
      const c = oi.clothing_items || oi.clothing_item;
      if (!c) return null;
      return {
        id: c.id,
        name: c.name,
        category: c.category,
        image_url: c.image_url,
        imageUrl: c.image_url,
        brand: c.brand,
        color: c.color,
        color_hex: c.color_hex,
        colorHex: c.color_hex,
        price: c.price,
        source_url: c.source_url,
        sourceUrl: c.source_url,
        reference: c.reference,
        size: c.size
      };
    })
    .filter(Boolean) as OutfitItem[]) || [];

  // Mapped for InteractiveOutfitViewer
  const viewerOutfit = {
    ...outfit,
    items: outfit.outfit_items?.map((oi: any) => ({
      ...oi,
      clothing_items: oi.clothing_items || oi.clothing_item,
      clothing: oi.clothing_items || oi.clothing_item
    }))
  };

  const backUrl = profile?.username 
    ? `/profile/${profile.username}` 
    : profileParam 
      ? `/profile/${profileParam}` 
      : '/profile';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Floating Back Button */}
      <button
        onClick={() => window.history.length > 2 ? router.back() : router.push(backUrl)}
        className="fixed top-4 left-4 z-40 w-10 h-10 bg-[var(--brand-pink)] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        aria-label="Volver al perfil"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      <main className="w-full flex flex-col md:flex-row pb-24 md:pb-0 md:h-[calc(100vh-56px)] md:justify-center overflow-x-hidden md:overflow-hidden bg-[var(--background)]">
        
        {/* Left Column (Desktop) / Top Half (Mobile) - The Interactive Canvas Image */}
        <div className="relative w-full aspect-[3/4] md:w-auto md:h-full md:aspect-[3/4] md:max-w-[calc(100%-400px)] shrink-0 bg-[#f8f9fa] dark:bg-[#111] z-0 flex items-center justify-center border-b md:border-b-0 md:border-r border-[var(--border-color)]">
          <InteractiveOutfitViewer
            outfit={viewerOutfit as any}
            onItemClick={handleItemClick}
            className="w-full h-full absolute inset-0"
            isMobileSticker={true}
            selectedItemId={selectedItem?.id}
          />
        </div>

        {/* Right Column (Desktop) / Bottom Half (Mobile) - The Details */}
        <div className="relative w-full md:w-[400px] lg:w-[450px] flex-shrink-0 flex flex-col overflow-y-auto custom-scrollbar bg-[var(--background)]">
          <div className="w-full flex flex-col p-4 md:p-6 space-y-6">
            
            {/* Creator Profile Header */}
            {(profile || outfit.owner) && (
              <Link 
                href={user?.id === (profile || outfit.owner)?.id ? '/profile' : `/profile/${(profile || outfit.owner)?.username || (profile || outfit.owner)?.id}`}
                className="flex items-center gap-3 p-3 bg-[var(--background-secondary)]/50 hover:bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)]/50 transition-colors"
              >
                <Avatar 
                  src={(profile || outfit.owner)?.avatar_url || null} 
                  alt={(profile || outfit.owner)?.username || 'Usuario'} 
                  size="sm" 
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--foreground-tertiary)] uppercase font-bold tracking-wider">Creador del look</p>
                  <p className="text-sm font-bold text-[var(--foreground)] truncate">
                    {(profile || outfit.owner)?.full_name || `@${(profile || outfit.owner)?.username}`}
                  </p>
                </div>
              </Link>
            )}

            {/* Outfit Info */}
            <section className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">{outfit.name || 'Outfit sin título'}</h1>
                {outfit.description && (
                  <p className="text-sm text-[var(--foreground-secondary)] mt-1">{outfit.description}</p>
                )}
              </div>

              {/* Tags Grid (Ocasión y Prendas) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-[var(--background-secondary)] rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center text-[var(--brand-pink)]">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-[var(--foreground-tertiary)] uppercase font-bold tracking-wider">Ocasión</p>
                        <p className="text-sm font-bold text-[var(--foreground)] capitalize">{outfit.occasion || (outfit as any).style || 'Casual'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--background-secondary)] rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center text-[var(--brand-pink)]">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-[var(--foreground-tertiary)] uppercase font-bold tracking-wider">Prendas</p>
                        <p className="text-sm font-bold text-[var(--foreground)]">{outfitItems.length}</p>
                    </div>
                </div>
              </div>
            </section>

            {/* Items Grid */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Prendas de este look ({outfitItems.length})</h3>
              {outfitItems.length === 0 ? (
                <p className="text-sm text-[var(--foreground-tertiary)]">No hay prendas registradas para este outfit.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {outfitItems.map((item, index) => (
                    <ClothingItem
                      key={item.id || index}
                      id={item.id}
                      name={item.name}
                      brand={item.brand}
                      type={item.category}
                      color={item.color}
                      colorHex={item.color_hex || item.colorHex}
                      imageUrl={item.image_url || item.imageUrl || '/placeholder.png'}
                      onClick={() => handleItemClick(item)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Appeared In Posts */}
            {relatedPosts.length > 0 && (
              <section className="space-y-3 pt-4 border-t border-[var(--border-color)]">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Aparece en ({relatedPosts.length})</h3>
                <div className="grid grid-cols-2 gap-3">
                  {relatedPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="aspect-square bg-[var(--background-secondary)] relative block rounded-xl overflow-hidden hover:opacity-90 transition-opacity border border-[var(--border-color)]/30"
                    >
                      {post.image_url ? (
                        <Image src={post.image_url} alt="Post" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs text-[var(--foreground-secondary)] overflow-hidden line-clamp-3">
                          {post.caption || 'Ver post'}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Product Detail Modal */}
      <ProductModal
        item={selectedItem ? ({
          id: selectedItem.id,
          name: selectedItem.name,
          brand: selectedItem.brand,
          type: selectedItem.category,
          category: selectedItem.category,
          color: selectedItem.color,
          colorHex: selectedItem.colorHex || selectedItem.color_hex,
          imageUrl: selectedItem.imageUrl || selectedItem.image_url,
          sourceUrl: selectedItem.sourceUrl || selectedItem.source_url,
          price: selectedItem.price,
          reference: selectedItem.reference,
          size: selectedItem.size
        } as any) : null}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
