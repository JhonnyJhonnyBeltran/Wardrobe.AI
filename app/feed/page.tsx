'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusSquare, Send, Heart } from 'lucide-react';
import PostCard, { type Post } from '@/components/Feed/PostCard';
import PremiumAdCard from '@/components/Feed/PremiumAdCard';
import OutfitDetailsModal from '@/components/Feed/GarmentModal'; // Reusing GarmentModal as OutfitDetailsModal
import { LogoMark } from '@/components';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useMessageStore, selectTotalUnread, selectBadgeVisible } from '@/store/messageStore';

export default function FeedPage() {
  const [outfits, setOutfits] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<Post | null>(null);

  // Enable swipe navigation
  useSwipeNavigation();

  // Message notifications
  const messageUnreadCount = useMessageStore(selectTotalUnread);
  const messageBadgeVisible = useMessageStore(selectBadgeVisible);

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('outfits')
          .select(`
            id,
            name,
            created_at,
            user_id,
            profiles (
                username,
                avatar_url
            ),
            outfit_items (
              clothing_items (
                image_url
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedOutfits = data.map((outfit: any) => {
            // Get first image from nested joins
            let imageUrl = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'; // Fallback

            // outfit.outfit_items is array of objects, each has clothing_items object
            if (outfit.outfit_items && outfit.outfit_items.length > 0) {
              // Find first item with an image
              const itemWithImage = outfit.outfit_items.find((oi: any) => oi.clothing_items?.image_url);
              if (itemWithImage) {
                imageUrl = itemWithImage.clothing_items.image_url;
              }
            }

            const profile = Array.isArray(outfit.profiles) ? outfit.profiles[0] : outfit.profiles;

            return {
              id: outfit.id,
              title: outfit.name || 'Outfit sin título',
              imageUrl: imageUrl,
              author: {
                name: profile?.username || 'Usuario',
                avatar: profile?.avatar_url || 'https://i.pravatar.cc/150?u=default'
              },
              likes: 0,
              comments: 0,
              isLiked: false
            };
          });
          setOutfits(formattedOutfits);
        }
      } catch (error) {
        console.error('Error fetching outfits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfits();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] md:hidden">
        <div className="px-4 h-14 flex items-center justify-between">
          {/* Left: New Post Icon */}
          <Link href="/create">
            <button className="p-2 -ml-2 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-full transition-colors">
              <PlusSquare className="w-6 h-6" />
            </button>
          </Link>

          {/* Center: Logo */}
          <div className="w-8 h-8">
            <LogoMark size="sm" />
          </div>

          {/* Right: Messages Icon */}
          <Link href="/messages">
            <button className="p-2 -mr-2 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-full transition-colors relative">
              <Send className="w-6 h-6" />
              {messageBadgeVisible && messageUnreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center bg-[#FF69B4] text-white text-[10px] font-bold rounded-full border-2 border-[var(--background)]">
                  {messageUnreadCount > 99 ? '+99' : messageUnreadCount}
                </span>
              )}
            </button>
          </Link>
        </div>
      </header>

      {/* Feed Content - Contexto §4A: Masonry, skeletons (§6D) */}
      <div className="px-2 pt-2 md:px-4">
        {
          loading ? (
            <div className="masonry-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="break-inside-avoid mb-4">
                  <div className="rounded-xl overflow-hidden bg-[var(--background-secondary)] skeleton" style={{ height: [180, 220, 260, 200, 240][i % 5] }} />
                </div>
              ))}
            </div>
          ) : outfits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[var(--foreground-secondary)] text-lg font-medium">No hay publicaciones aún.</p>
              <p className="text-[var(--foreground-tertiary)] text-sm mt-2">Sé el primero en compartir tu estilo.</p>
              <Link href="/create" className="mt-6">
                <button className="text-[var(--brand-pink)] font-bold px-6 py-2 rounded-full bg-[var(--brand-pink)]/10 hover:bg-[var(--brand-pink)]/20 transition-colors">
                  Crear Outfit
                </button>
              </Link>
            </div>
          ) : (
            <div className="masonry-grid">
              {outfits.map((post, index) => (
                <>
                  <div key={post.id} className="break-inside-avoid mb-4">
                    <PostCard
                      post={post}
                      onClick={() => setSelectedOutfit(post)}
                    />
                  </div>
                  {/* Insert Premium Ad Card every 15 posts on desktop */}
                  {(index + 1) % 15 === 0 && (
                    <div key={`premium-ad-${index}`} className="break-inside-avoid mb-4 col-span-full">
                      <PremiumAdCard />
                    </div>
                  )}
                </>
              ))}
            </div>
          )
        }
      </div>

      <style jsx global>{`
        .masonry-grid {
          column-count: 2;
          column-gap: 0.75rem;
        }
        @media (min-width: 768px) {
          .masonry-grid {
            column-count: 4;
            column-gap: 1rem;
          }
        }
        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: 6;
            column-gap: 1rem;
          }
        }
        @media (min-width: 1440px) {
          .masonry-grid {
            column-count: 7;
          }
        }
      `}</style>

      <AnimatePresence>
        {selectedOutfit && (
          <OutfitDetailsModal
            post={selectedOutfit}
            isOpen={!!selectedOutfit}
            onClose={() => setSelectedOutfit(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
