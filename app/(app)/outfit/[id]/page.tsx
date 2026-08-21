'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Layers, User as UserIcon } from 'lucide-react';
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

interface OutfitOwner {
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
  owner?: OutfitOwner;
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

export default function OutfitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<OutfitItem | null>(null);

  const outfitId = params.id as string;
  useBodyScrollLock(!!selectedItem);

  useEffect(() => {
    if (!outfitId) return;

    const fetchOutfitData = async () => {
      setLoading(true);
      try {
        // Strategy 1: Try server-side API (which bypasses client RLS)
        try {
          const res = await fetch(`/api/outfits/${outfitId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.outfit) {
              setOutfit(data.outfit);
              setRelatedPosts(data.posts || []);
              setLoading(false);
              return;
            }
          }
        } catch (apiErr) {
          console.warn('[OutfitDetail] API fetch failed, falling back to direct client query:', apiErr);
        }

        // Strategy 2: Client-side query
        console.log('[OutfitDetail] Running direct Supabase fetch');
        const { data: outfitData, error: outfitErr } = await supabase
          .from('outfits')
          .select('*')
          .eq('id', outfitId)
          .maybeSingle();

        if (outfitErr || !outfitData) {
          console.error('[OutfitDetail] Could not find outfit:', outfitErr);
          setOutfit(null);
          setLoading(false);
          return;
        }

        // Fetch owner
        let ownerData = null;
        if (outfitData.user_id) {
          const { data: p } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio')
            .eq('id', outfitData.user_id)
            .maybeSingle();
          ownerData = p;
        }

        // Fetch outfit items
        const { data: itemsData } = await supabase
          .from('outfit_items')
          .select('*')
          .eq('outfit_id', outfitId);

        const rawItems = itemsData || [];
        const clothingIds = rawItems.map((oi: any) => oi.clothing_item_id).filter(Boolean);

        const clothesMap = new Map<string, any>();
        if (clothingIds.length > 0) {
          const { data: clothesList } = await supabase
            .from('clothing_items')
            .select('id, name, category, color, color_hex, image_url, original_image_url, brand, size, fabric, reference, source_url')
            .in('id', clothingIds);

          if (clothesList) {
            clothesList.forEach((c: any) => clothesMap.set(c.id, c));
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

        // Fetch related posts
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, image_url, caption, created_at, user_id, likes_count, comments_count')
          .eq('outfit_id', outfitId)
          .order('created_at', { ascending: false });

        setOutfit({
          ...outfitData,
          owner: ownerData,
          outfit_items: resolvedItems
        });
        setRelatedPosts(postsData || []);

      } catch (err) {
        console.error('[OutfitDetail] Fatal error fetching outfit:', err);
        setOutfit(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfitData();
  }, [outfitId]);

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
          onClick={() => window.history.length > 2 ? router.back() : router.push('/feed')}
          className="mt-6 px-6 py-2.5 bg-[var(--brand-pink)] text-white rounded-full font-semibold shadow-md hover:opacity-90 transition-all active:scale-95"
        >
          Volver
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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Floating Back Button */}
      <button
        onClick={() => window.history.length > 2 ? router.back() : router.push('/feed')}
        className="fixed top-4 left-4 z-40 w-10 h-10 bg-[var(--brand-pink)] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        aria-label="Volver"
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
            {outfit.owner && (
              <Link 
                href={user?.id === outfit.owner.id ? '/profile' : `/profile/${outfit.owner.username || outfit.owner.id}`}
                className="flex items-center gap-3 p-3 bg-[var(--background-secondary)]/50 hover:bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)]/50 transition-colors"
              >
                <Avatar 
                  src={outfit.owner.avatar_url || null} 
                  alt={outfit.owner.username} 
                  size="sm" 
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--foreground-tertiary)] uppercase font-bold tracking-wider">Creador del look</p>
                  <p className="text-sm font-bold text-[var(--foreground)] truncate">
                    {outfit.owner.full_name || `@${outfit.owner.username}`}
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
