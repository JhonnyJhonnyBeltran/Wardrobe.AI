'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Layers } from 'lucide-react';
import Link from 'next/link';
import ProductModal from '@/components/ProductModal';
import Avatar from '@/components/Avatar';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import { haptics } from '@/lib/haptic';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import InteractiveOutfitViewer from '@/components/InteractiveOutfitViewer';
import { ClothingItem } from '@/components/ClothingItem';

export default function ProfileOutfitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [outfit, setOutfit] = useState<any | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const profileParam = decodeURIComponent((params.id as string) || '');
  const outfitId = params.outfitId as string;

  useBodyScrollLock(!!selectedItem);

  useEffect(() => {
    if (!outfitId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Strategy 1: Server-side API (bypasses RLS to fetch all garments and creator profile)
        try {
          const res = await fetch(`/api/outfits/${outfitId}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.outfit) {
              setOutfit(data.outfit);
              setRelatedPosts(data.posts || []);
              setLoading(false);
              return;
            }
          }
        } catch (apiErr) {
          console.warn('[ProfileOutfit] Server API fetch fallback to direct Supabase:', apiErr);
        }

        // Strategy 2: Direct Supabase Fetch (same structure as /post/[id])
        const { data: outfitData, error: outfitError } = await supabase
          .from('outfits')
          .select(`
            id, name, description, image_url, occasion, season, is_public, favorite, created_at, user_id,
            profiles (id, username, avatar_url),
            outfit_items (
              position_x,
              position_y,
              scale,
              rotation,
              layer_order,
              clothing_items (id, name, brand, image_url, color, color_hex, category, size, reference)
            )
          `)
          .eq('id', outfitId)
          .single();

        let outfitObj = outfitData as any;

        if (outfitObj) {
          let oiList = outfitObj.outfit_items || [];

          // Fallback 1: If outfit_items was empty, fetch them directly
          if (oiList.length === 0) {
            const { data: directOi } = await supabase
              .from('outfit_items')
              .select('position_x, position_y, scale, rotation, layer_order, clothing_item_id, clothing_items (id, name, brand, image_url, color, color_hex, category, size, reference)')
              .eq('outfit_id', outfitId);
            if (directOi && directOi.length > 0) {
              oiList = directOi;
              outfitObj.outfit_items = oiList;
            }
          }

          // Fallback 2: If clothing_items relation didn't populate, fetch by IDs
          const missingIds = oiList
            .filter((oi: any) => !oi.clothing_items && !oi.clothing_item && oi.clothing_item_id)
            .map((oi: any) => oi.clothing_item_id);

          if (missingIds.length > 0) {
            const { data: clothesList } = await supabase
              .from('clothing_items')
              .select('id, name, brand, image_url, color, color_hex, category, size, reference, source_url')
              .in('id', missingIds);

            if (clothesList) {
              const map = new Map(clothesList.map((c: any) => [c.id, c]));
              oiList = oiList.map((oi: any) => ({
                ...oi,
                clothing_items: oi.clothing_items || oi.clothing_item || map.get(oi.clothing_item_id)
              }));
              outfitObj.outfit_items = oiList;
            }
          }
        }

        // Fetch related posts ("Aparece en")
        let relatedPostsList: any[] = [];
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, image_url, caption, created_at, user_id, likes_count, comments_count')
          .eq('outfit_id', outfitId)
          .order('created_at', { ascending: false });

        if (postsData && postsData.length > 0) {
          relatedPostsList = postsData;
        } else if (outfitObj?.image_url) {
          const { data: imgPosts } = await supabase
            .from('posts')
            .select('id, image_url, caption, created_at, user_id, likes_count, comments_count')
            .eq('image_url', outfitObj.image_url)
            .order('created_at', { ascending: false });
          if (imgPosts && imgPosts.length > 0) {
            relatedPostsList = imgPosts;
          }
        }

        setOutfit(outfitObj);
        setRelatedPosts(relatedPostsList);

      } catch (err) {
        console.error('[ProfileOutfit] Error in loadData:', err);
        setOutfit(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [outfitId]);

  const handleItemSelect = (item: any) => {
    if (!item) return;
    haptics.selection();
    const clothingRaw = item.clothing_items || item.clothing_item || item.clothing || item;
    const clothing = Array.isArray(clothingRaw) ? clothingRaw[0] : clothingRaw;
    if (!clothing) return;
    setSelectedItem(clothing);
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

  const authorRaw = outfit.profiles || outfit.owner;
  const author = Array.isArray(authorRaw) ? authorRaw[0] : (authorRaw || {});

  // Extract valid items
  const allRawItems = outfit.outfit_items || outfit.items || [];
  const validItems = allRawItems
    .map((item: any) => {
      const clothingRaw = item.clothing_items || item.clothing_item || item.clothing || item;
      const clothing = Array.isArray(clothingRaw) ? clothingRaw[0] : clothingRaw;
      if (!clothing) return null;
      return {
        ...item,
        clothing
      };
    })
    .filter((v: any) => v && v.clothing && (v.clothing.image_url || v.clothing.imageUrl));

  const backUrl = author?.username 
    ? `/profile/${author.username}` 
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
            outfit={outfit}
            onItemClick={handleItemSelect}
            className="w-full h-full absolute inset-0"
            isMobileSticker={true}
          />
        </div>

        {/* Right Column (Desktop) / Bottom Half (Mobile) - The Details */}
        <div className="relative w-full md:w-[400px] lg:w-[450px] flex-shrink-0 flex flex-col overflow-y-auto custom-scrollbar bg-[var(--background)]">
          <div className="w-full flex flex-col p-4 md:p-6 space-y-6">
            
            {/* Creator Profile Header */}
            {author?.username && (
              <Link 
                href={user?.id === author.id ? '/profile' : `/profile/${author.username}`}
                className="flex items-center gap-3 p-3 bg-[var(--background-secondary)]/50 hover:bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)]/50 transition-colors"
              >
                <Avatar 
                  src={author.avatar_url || null} 
                  alt={author.username} 
                  size="sm" 
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--foreground-tertiary)] uppercase font-bold tracking-wider">Creador del look</p>
                  <p className="text-sm font-bold text-[var(--foreground)] truncate">
                    @{author.username}
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
                        <p className="text-sm font-bold text-[var(--foreground)] capitalize">{outfit.occasion || outfit.style || 'Casual'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--background-secondary)] rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center text-[var(--brand-pink)]">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-[var(--foreground-tertiary)] uppercase font-bold tracking-wider">Prendas</p>
                        <p className="text-sm font-bold text-[var(--foreground)]">{validItems.length}</p>
                    </div>
                </div>
              </div>
            </section>

            {/* Items Grid */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Prendas de este look ({validItems.length})</h3>
              {validItems.length === 0 ? (
                <p className="text-sm text-[var(--foreground-tertiary)]">No hay prendas registradas para este outfit.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {validItems.map(({ clothing }: any, idx: number) => (
                    <ClothingItem
                      key={clothing.id || idx}
                      id={clothing.id}
                      name={clothing.name}
                      brand={clothing.brand}
                      type={clothing.category}
                      color={clothing.color}
                      colorHex={clothing.color_hex}
                      imageUrl={clothing.image_url || clothing.imageUrl || '/placeholder.png'}
                      onClick={() => handleItemSelect(clothing)}
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
          colorHex: selectedItem.color_hex || selectedItem.colorHex,
          imageUrl: selectedItem.image_url || selectedItem.imageUrl,
          sourceUrl: selectedItem.source_url || selectedItem.sourceUrl,
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
