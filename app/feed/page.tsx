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

export default function FeedPage() {
  const [outfits, setOutfits] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<Post | null>(null);

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        const { data, error } = await supabase
          .from('outfits')
          .select(`
            id,
            name,
            created_at,
            items,
            user_id,
            profiles (
                username,
                avatar_url
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          // Fetch the first item image for the post thumbnail (or a generated collage logic later)
          // For now, we will try to fetch the first item's image for each outfit
          // optimization: in a real app, outfits table should have a 'thumbnail_url' column

          const outfitsWithImages = await Promise.all(data.map(async (outfit: any) => {
            let imageUrl = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'; // Fallback

            if (outfit.items && outfit.items.length > 0) {
              const { data: itemData } = await supabase
                .from('clothing_items')
                .select('image_url')
                .eq('id', outfit.items[0])
                .single();

              // Explicitly cast or check
              const item = itemData as { image_url: string | null } | null;
              if (item?.image_url) {
                imageUrl = item.image_url;
              }
            }

            // Map profile data correctly.
            // Supabase join returns an array or object depending on relationship.
            // Assuming One-to-One or Many-to-One, it returns a single object if ! is used or array otherwise.
            // We need to cast or check.
            const profile = Array.isArray(outfit.profiles) ? outfit.profiles[0] : outfit.profiles;

            return {
              id: outfit.id,
              title: outfit.name || 'Outfit sin título',
              imageUrl: imageUrl,
              author: {
                name: profile?.username || 'Usuario',
                avatar: profile?.avatar_url || 'https://i.pravatar.cc/150?u=default'
              },
              likes: 0, // TODO: Implement likes table count
              comments: 0,
              isLiked: false
            };
          }));
          setOutfits(outfitsWithImages);
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-[var(--background)] bg-black dark:bg-[var(--brand-pink)]" />
            </button>
          </Link>
        </div>
      </header >

      {/* Feed Content */}
      < div className="px-2 pt-2" >
        {
          loading ? (
            <div className="flex justify-center py-20" >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-pink)]"></div>
            </div>
          ) : outfits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[var(--foreground-secondary)] mb-4">Aún no hay publicaciones.</p>
              <Link href="/create">
                <button className="text-[var(--brand-pink)] font-bold">¡Crea el primer outfit!</button>
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
      </div >

      <style jsx global>{`
        .masonry-grid {
          column-count: 2;
          column-gap: 1rem;
        }
        @media (min-width: 768px) {
          .masonry-grid {
            column-count: 3;
          }
        }
        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: 4;
          }
        }
      `}</style>

      <AnimatePresence>
        {selectedOutfit && (
          <OutfitDetailsModal
            isOpen={!!selectedOutfit}
            onClose={() => setSelectedOutfit(null)}
            // @ts-ignore
            garment={{
              id: selectedOutfit.id,
              name: selectedOutfit.title,
              imageUrl: selectedOutfit.imageUrl,
              category: 'outfit'
            }}
          />
        )}
      </AnimatePresence>
    </div >
  );
}
