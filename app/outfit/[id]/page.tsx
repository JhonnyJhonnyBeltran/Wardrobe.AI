'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Edit2, Trash2, Share2, Heart, MessageCircle, Send, Circle, Briefcase, PartyPopper, Zap, Sparkles, Layers } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import { haptics } from '@/lib/haptic';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import InteractiveOutfitViewer from '@/components/InteractiveOutfitViewer';

interface OutfitItem {
  id: string;
  name: string;
  category: string;
  image_url: string;
  brand: string;
  color: string;
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

    const fetchOutfit = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('outfits')
          .select(`
            *,
            outfit_items (
              position_x,
              position_y,
              scale,
              rotation,
              layer_order,
              clothing_item:clothing_items (
                id,
                name,
                category,
                image_url,
                brand,
                color
              )
            )
          `)
          .eq('id', outfitId)
          .single();

        if (error) throw error;
        setOutfit(data);

        // Fetch related posts
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, image_url, caption')
          .eq('outfit_id', outfitId)
          .order('created_at', { ascending: false });
        
        if (postsData) {
          setRelatedPosts(postsData);
        }

      } catch (err) {
        console.error('Error fetching outfit:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfit();
  }, [outfitId]);

  const handleEdit = () => {
    haptics.tap();
    router.push(`/create?outfitId=${outfitId}`);
  };

  const handleDelete = async () => {
    haptics.warning();
    const confirmDelete = confirm('¿Seguro que quieres eliminar este outfit?');
    if (confirmDelete && outfit) {
      await supabase.from('outfits').delete().eq('id', outfit.id);
      haptics.success();
      router.push('/closet');
    }
  };

  const handleItemClick = (item: OutfitItem) => {
    haptics.selection();
    setSelectedItem(item);
  };

  const handleShare = () => {
    haptics.tap();
    if (navigator.share) {
      navigator.share({
        title: outfit?.name || 'Outfit',
        text: outfit?.description || 'Mira este outfit en Klozet',
        url: window.location.href,
      });
    }
  };

  const handleCreatePost = () => {
    haptics.tap();
    router.push(`/create-post?outfitId=${outfitId}`);
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
        <p className="text-[var(--foreground)]">Outfit no encontrado</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-[var(--brand-pink)]"
        >
          Volver
        </button>
      </div>
    );
  }

  const outfitItems = (outfit.outfit_items
    ?.map(oi => oi.clothing_item || oi.clothing_items)
    .filter(Boolean) as OutfitItem[]) || [];

  // Re-map outfit.outfit_items for InteractiveOutfitViewer
  const viewerOutfit = {
    ...outfit,
    outfit_items: outfit.outfit_items?.map((oi: any) => ({
      ...oi,
      clothing_items: oi.clothing_item || oi.clothing_items
    }))
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => window.history.length > 2 ? router.back() : router.push('/feed')}
          className="p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {user?.id === outfit.user_id && (
            <>
              <button
                onClick={handleEdit}
                className="p-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
              >
                <Edit2 className="w-5 h-5 text-[var(--brand-pink)]" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </>
          )}
        </div>
      </header>

      <main className="w-full flex flex-col md:flex-row pb-24 md:pb-0 md:h-[calc(100vh-56px)] md:justify-center overflow-x-hidden md:overflow-hidden bg-[var(--background)]">
        
        {/* Left Column (Desktop) / Top Half (Mobile) - The Image */}
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
                <h2 className="text-2xl font-bold text-[var(--foreground)]">{outfit.name || 'Outfit sin título'}</h2>
                {outfit.description && (
                  <p className="text-[var(--foreground-secondary)] mt-2">{outfit.description}</p>
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

            {/* Items Grid (Like the modal) */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Prendas de este look</h3>
              <div className="grid grid-cols-2 gap-3">
                {outfitItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="block group cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="aspect-square bg-[var(--background-secondary)] rounded-2xl overflow-hidden relative mb-2 flex items-center justify-center border border-transparent hover:border-[var(--border-color)] transition-all">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill className="object-cover scale-[0.8] group-hover:scale-[0.85] transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: item.color || '#ccc' }}>👕</div>
                      )}
                    </div>
                    <p className="text-[13px] font-bold text-[var(--foreground)] truncate px-1">{item.name}</p>
                    <p className="text-[11px] text-[var(--foreground-secondary)] px-1">{item.brand || 'Sin marca'}</p>
                  </div>
                ))}
              </div>
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

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[var(--card-bg)] rounded-3xl max-w-md w-full p-6 space-y-4 mb-16 md:mb-0 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--background-secondary)]">
              {selectedItem.image_url ? (
                <Image src={selectedItem.image_url} alt={selectedItem.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">👕</div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">{selectedItem.name}</h3>
              <p className="text-[var(--foreground-secondary)]">{selectedItem.brand || 'Sin marca'}</p>
              <p className="text-sm text-[var(--foreground-tertiary)]">{selectedItem.category}</p>
              {selectedItem.color && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-[var(--foreground-tertiary)]">Color:</span>
                  <div
                    className="w-4 h-4 rounded-full border border-[var(--border-color)]"
                    style={{ backgroundColor: selectedItem.color }}
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-3 rounded-full bg-[var(--brand-pink)] text-white font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
