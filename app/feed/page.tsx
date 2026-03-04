'use client';

import { useState, useEffect } from 'react';
import { SquarePlus, Plus, PlusSquare, Send, Shirt, Layers, Image as ImageIcon } from 'lucide-react';
import PostCard, { type Post } from '@/components/Feed/PostCard';
import PremiumAdCard from '@/components/Feed/PremiumAdCard';
import { LogoMark } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useMessageStore, selectTotalUnread, selectBadgeVisible } from '@/store/messageStore';
import { useUser } from '@/store/userStore';
import { getFollowing } from '@/lib/services/followService';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  // Enable swipe navigation
  useSwipeNavigation();

  // Message notifications
  const messageUnreadCount = useMessageStore(selectTotalUnread);
  const messageBadgeVisible = useMessageStore(selectBadgeVisible);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const fetchPosts = async () => {
      try {
        setLoading(true);

        if (!user) {
          setPosts([]);
          setLoading(false);
          return;
        }

        // Get all users that the current user follows
        const following = await getFollowing(user.id);
        const followingIds = following.map(f => f.id);

        // Include current user's posts and friends' posts
        const targetIds = [user.id, ...followingIds];

        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            id,
            caption,
            image_url,
            created_at,
            user_id,
            outfits (
                name,
                outfit_items (
                    clothing_items (
                        image_url
                    )
                )
            ),
             likes (count)
          `)
          .in('user_id', targetIds)
          .order('created_at', { ascending: false })
          .abortSignal(controller.signal);

        if (postsError) throw postsError;

        if (postsData && isMounted) {
          // Manually fetch profiles for these posts
          const userIds = [...new Set((postsData as any[]).map(p => p.user_id))];

          let profilesMap: Record<string, any> = {};

          if (userIds.length > 0) {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .in('id', userIds);

            if (profilesData) {
              (profilesData as any[]).forEach(p => {
                profilesMap[p.id] = p;
              });
            }
          }

          const formattedPosts = postsData.map((post: any) => {
            // Determine display image:
            // 1. Real Uploaded Image (post.image_url)
            // 2. Outfit Image (first item)
            let displayImage = post.image_url;

            if (!displayImage && post.outfits?.outfit_items?.length > 0) {
              const itemWithImage = post.outfits.outfit_items.find((oi: any) => oi.clothing_items?.image_url);
              if (itemWithImage) {
                displayImage = itemWithImage.clothing_items.image_url;
              }
            }

            // Fallback if still no image (shouldn't happen if validation works, but mostly for old data)
            // If no image is found, we pass null to PostCard which handles text-only card

            const profile = profilesMap[post.user_id];

            return {
              id: post.id,
              title: post.caption || post.outfits?.name || 'Publicación sin título',
              description: post.caption, // For text-only fallback
              imageUrl: displayImage,
              author: {
                name: profile?.username || 'Usuario',
                avatar: profile?.avatar_url || 'https://i.pravatar.cc/150?u=default'
              },
              likes: post.likes?.[0]?.count || 0,
              comments: 0,
              isLiked: false
            };
          });
          setPosts(formattedPosts);
        }
      } catch (error: any) {
        console.error('Error fetching posts:', error);
        if (error.name !== 'AbortError' && isMounted) {
          setPosts([]); // Set to empty on error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header Mejorado */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/95 backdrop-blur-lg border-b border-[var(--border-color)]/50 md:hidden shadow-sm">
        <div className="px-5 h-16 flex items-center justify-between">
          {/* Left: Title instead of Logo */}
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Feed</h1>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* New Post Modal Trigger */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="p-2.5 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-full transition-all duration-200 transform hover:scale-110"
            >
              <Plus className="w-6 h-6" />
            </button>

            {/* Messages */}
            <Link href="/messages">
              <button className="p-2.5 -mr-1 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-full transition-all duration-200 transform hover:scale-110 relative">
                <Send className="w-6 h-6" />
                {messageBadgeVisible && messageUnreadCount > 0 && (
                  <span className="absolute top-1 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[var(--brand-pink)] text-white text-[10px] font-bold rounded-full border-2 border-[var(--background)] shadow-sm">
                    {messageUnreadCount > 99 ? '+99' : messageUnreadCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Feed Content - Masonry Grid con mejor diseño */}
      <div className="px-3 pt-4 md:px-6">
        {
          loading ? (
            <div className="masonry-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="break-inside-avoid mb-6">
                  <div className="rounded-2xl overflow-hidden bg-[var(--background-secondary)] skeleton" style={{ height: [180, 220, 260, 200, 240][i % 5] }} />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-6">
                <PlusSquare className="w-10 h-10 text-[var(--foreground-tertiary)]" />
              </div>
              <p className="text-[var(--foreground-secondary)] text-lg font-medium">No hay publicaciones aún.</p>
              <p className="text-[var(--foreground-tertiary)] text-sm mt-2 max-w-xs mx-auto">Sé el primero en compartir tu estilo con la comunidad.</p>
              <Link href="/create" className="mt-8">
                <button className="text-white font-bold px-8 py-3 rounded-full bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-purple)] hover:from-[var(--brand-purple)] hover:to-[var(--brand-pink)] transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Crear Outfit
                </button>
              </Link>
            </div>
          ) : (
            <div className="masonry-grid">
              {posts.map((post, index) => (
                <div key={post.id} className="contents">
                  <div className="break-inside-avoid mb-6">
                    <PostCard post={post} />
                  </div>
                  {/* Insert Premium Ad Card every 15 posts on desktop */}
                  {(index + 1) % 15 === 0 && (
                    <div key={`premium-ad-${index}`} className="break-inside-avoid mb-6 col-span-full">
                      <PremiumAdCard />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Mobile Creation Bottom Sheet Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsCreateModalOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-[var(--card-bg)] rounded-t-3xl pt-2 pb-safe border-t border-[var(--border-color)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full mx-auto my-3" />
              <div className="px-4 pb-12">
                <h3 className="text-xl font-bold text-center text-[var(--foreground)] mb-6">Crear Nuevo</h3>
                <div className="space-y-3">
                  <button onClick={() => { setIsCreateModalOpen(false); router.push('/create-post') }} className="w-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] transition-colors p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-500">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-[var(--foreground)] font-semibold text-lg">Nuevo Post</span>
                  </button>
                  <button onClick={() => { setIsCreateModalOpen(false); router.push('/create') }} className="w-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] transition-colors p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-purple-500">
                      <Layers className="w-6 h-6" />
                    </div>
                    <span className="text-[var(--foreground)] font-semibold text-lg">Nuevo Outfit</span>
                  </button>
                  <button onClick={() => { setIsCreateModalOpen(false); router.push('/closet?action=new-item') }} className="w-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] transition-colors p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-pink-400">
                      <Shirt className="w-6 h-6" />
                    </div>
                    <span className="text-[var(--foreground)] font-semibold text-lg">Nueva Prenda</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .masonry-grid {
          column-count: 2;
          column-gap: 0.5rem;
        }
        @media (min-width: 768px) {
          .masonry-grid {
            column-count: 3;
            column-gap: 1rem;
          }
        }
        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: 4;
            column-gap: 1rem;
          }
        }
        @media (min-width: 1440px) {
          .masonry-grid {
            column-count: 5;
          }
        }
      `}</style>
    </div>
  );
}
