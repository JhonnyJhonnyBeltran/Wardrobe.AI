'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Edit2, Trash2, Share2, Heart, MessageCircle, Send, Circle, Briefcase, PartyPopper, Zap, Sparkles, Layers } from 'lucide-react';
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
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

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
    if (outfit) {
      // 1. Unlink posts to prevent cascade delete
      await supabase.from('posts').update({ outfit_id: null }).eq('outfit_id', outfit.id);
      
      // 2. Delete outfit
      await supabase.from('outfits').delete().eq('id', outfit.id);
      haptics.success();
      router.push('/closet');
    }
  };

  const handleItemClick = (item: OutfitItem) => {
    haptics.selection();
    setSelectedItem(item);
    setIsProductModalOpen(true);
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
      {/* Floating Back Button */}
      <button
        onClick={() => window.history.length > 2 ? router.back() : router.push('/feed')}
        className="fixed top-4 left-4 z-40 w-10 h-10 bg-[var(--brand-pink)] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

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
                  <ClothingItem
                    key={item.id || index}
                    id={item.id}
                    name={item.name}
                    brand={item.brand}
                    type={item.category}
                    color={item.color}
                    colorHex={(item as any).color_hex}
                    imageUrl={item.image_url || '/placeholder.png'}
                    onClick={() => handleItemClick(item)}
                  />
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

      <ProductModal
        item={selectedItem as any}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </div>
  );
}
