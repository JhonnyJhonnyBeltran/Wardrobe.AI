'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Layers } from 'lucide-react';
import Link from 'next/link';
import ProductModal from '@/components/ProductModal';
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
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const outfitId = params.id as string;
  useBodyScrollLock(!!selectedItem);

  useEffect(() => {
    if (!outfitId) return;

    const fetchOutfit = async () => {
      setLoading(true);
      try {
        // 1. Fetch outfit record directly (no nested PostgREST joins to avoid 400 schema-cache errors)
        const { data: outfitData, error: outfitError } = await supabase
          .from('outfits')
          .select('*')
          .eq('id', outfitId)
          .maybeSingle();

        if (outfitError) {
          console.error('Error fetching outfit row:', outfitError);
          throw outfitError;
        }

        if (!outfitData) {
          console.warn('No outfit found for id:', outfitId);
          setOutfit(null);
          setLoading(false);
          return;
        }

        // 2. Fetch outfit items for this outfit
        const { data: itemsData, error: itemsError } = await supabase
          .from('outfit_items')
          .select('*')
          .eq('outfit_id', outfitId);

        if (itemsError) {
          console.warn('Error fetching outfit_items:', itemsError);
        }

        const rawItems = itemsData || [];

        // 3. Fetch clothing items by ID with explicit valid columns
        const clothingIds = rawItems
          .map((oi: any) => oi.clothing_item_id)
          .filter(Boolean);

        const clothesMap = new Map<string, any>();

        if (clothingIds.length > 0) {
          const { data: clothesData, error: clothesError } = await supabase
            .from('clothing_items')
            .select('id, name, category, image_url, brand, color, color_hex, size, reference, source_url')
            .in('id', clothingIds);

          if (!clothesError && clothesData) {
            clothesData.forEach((c: any) => clothesMap.set(c.id, c));
          }
        }

        // 4. Merge items with clothing details
        const resolvedItems = rawItems.map((oi: any) => {
          const clothing = clothesMap.get(oi.clothing_item_id);
          return {
            ...oi,
            clothing_item: clothing,
            clothing_items: clothing,
            clothing: clothing
          };
        });

        const fullOutfit: Outfit = {
          ...outfitData,
          outfit_items: resolvedItems
        };

        setOutfit(fullOutfit);

        // 5. Fetch related posts that link to this outfit
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, image_url, caption')
          .eq('outfit_id', outfitId)
          .order('created_at', { ascending: false });

        if (postsData) {
          setRelatedPosts(postsData);
        }

      } catch (err) {
        console.error('Error in fetchOutfit flow:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfit();
  }, [outfitId]);

  const handleItemClick = (item: any) => {
    if (!item) return;
    haptics.selection();
    const normalizedItem: OutfitItem = {
      id: item.id,
      name: item.name || 'Prenda',
      category: item.category || 'Prenda',
      image_url: item.image_url || item.imageUrl || '',
      imageUrl: item.image_url || item.imageUrl || '',
      brand: item.brand || 'Klozet',
      color: item.color || '',
      color_hex: item.color_hex || item.colorHex || '',
      colorHex: item.color_hex || item.colorHex || '',
      price: item.price,
      source_url: item.source_url || item.sourceUrl,
      sourceUrl: item.source_url || item.sourceUrl
    };
    setSelectedItem(normalizedItem);
    setIsProductModalOpen(true);
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
        <p className="text-sm text-[var(--foreground-tertiary)] mt-1">Este outfit no existe o es privado.</p>
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
        sourceUrl: c.source_url
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
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Prendas de este look</h3>
              {outfitItems.length === 0 ? (
                <p className="text-sm text-[var(--foreground-tertiary)]">No se pudieron cargar las prendas individuales de este outfit.</p>
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
                      className="aspect-square bg-[var(--background-secondary)] relative block rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
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
          ...selectedItem,
          imageUrl: selectedItem.imageUrl || selectedItem.image_url,
          sourceUrl: selectedItem.sourceUrl || selectedItem.source_url,
          colorHex: selectedItem.colorHex || selectedItem.color_hex,
        } as any) : null}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedItem(null);
        }}
      />
    </div>
  );
}
