'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Edit2, Trash2, Share2, Heart, MessageCircle, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import { haptics } from '@/lib/haptic';

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
    clothing_items: OutfitItem;
  }>;
}

export default function OutfitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<OutfitItem | null>(null);

  const outfitId = params.id as string;

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
              clothing_items (
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

  const outfitItems = outfit.outfit_items
    ?.map(oi => oi.clothing_items)
    .filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
        </button>
        
        <h1 className="text-lg font-semibold text-[var(--foreground)] truncate max-w-[200px]">
          {outfit.name}
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreatePost}
            className="p-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors text-[var(--brand-pink)]"
            title="Crear Publicación"
          >
            <Send className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
          >
            <Share2 className="w-5 h-5 text-[var(--foreground)]" />
          </button>
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

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Outfit Preview Grid */}
        <section className="grid grid-cols-2 gap-2">
          {outfitItems.map((item, index) => (
            <button
              key={item.id || index}
              onClick={() => handleItemClick(item)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--background-secondary)] border border-[var(--border-color)] hover:border-[var(--brand-pink)] transition-colors"
            >
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">👕</span>
                </div>
              )}
            </button>
          ))}
        </section>

        {/* Outfit Info */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">{outfit.name}</h2>
            {outfit.description && (
              <p className="text-[var(--foreground-secondary)] mt-2">{outfit.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {outfit.occasion && (
              <span className="px-3 py-1 rounded-full bg-[var(--background-secondary)] text-sm text-[var(--foreground)]">
                {outfit.occasion}
              </span>
            )}
            {outfit.season && (
              <span className="px-3 py-1 rounded-full bg-[var(--brand-pink)]/10 text-sm text-[var(--brand-pink)]">
                {outfit.season}
              </span>
            )}
          </div>
        </section>

        {/* Items List */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Prendas ({outfitItems.length})</h3>
          <div className="space-y-2">
            {outfitItems.map((item, index) => (
              <button
                key={item.id || index}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center gap-4 p-3 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors text-left"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--card-bg)] relative shrink-0">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--foreground)] truncate">{item.name}</p>
                  <p className="text-sm text-[var(--foreground-secondary)]">{item.brand || 'Sin marca'}</p>
                  <p className="text-xs text-[var(--foreground-tertiary)]">{item.category}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[var(--card-bg)] rounded-2xl max-w-md w-full p-6 space-y-4"
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
