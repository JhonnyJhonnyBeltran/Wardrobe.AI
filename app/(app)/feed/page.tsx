'use client';

import { useState, useEffect } from 'react';
import { SquarePlus, Plus, PlusSquare, Send, Shirt, Layers, Image as ImageIcon, Sparkles } from 'lucide-react';
import PostCard, { type Post } from '@/components/Feed/PostCard';
import PremiumAdCard from '@/components/Feed/PremiumAdCard';
import { LogoMark, EmptyState, InfiniteScrollFooter, PullToRefresh } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useCallback } from 'react';
import { useUiStore } from '@/store/uiStore';
import { supabase } from '@/lib/supabase/client';

import { useMessageStore, selectTotalUnread, selectBadgeVisible } from '@/store/messageStore';
import { useUser } from '@/store/userStore';
import { useFeedStore } from '@/store/feedStore';
import { getFollowing } from '@/lib/services/followService';

export default function FeedPage() {
  const { posts, setPosts, hasMore, setHasMore } = useFeedStore();
  const [loading, setLoading] = useState(posts.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const { user } = useUser();
  const { toggleCreateMenu } = useUiStore();
  const router = useRouter();

  const pageRef = useRef(0);
  // More posts per page on desktop for full scroll
  const POSTS_PER_PAGE = 12;
  const observerElement = useRef<HTMLDivElement | null>(null);

  // Message notifications
  const messageUnreadCount = useMessageStore(selectTotalUnread);
  const messageBadgeVisible = useMessageStore(selectBadgeVisible);

  const fetchPosts = useCallback(async (isLoadMore = false) => {
    try {
      setLoadError(false);
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        if (posts.length === 0) {
          setLoading(true);
        }
      }

      if (!user) {
        setPosts([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const currentPage = isLoadMore ? pageRef.current + 1 : 0;
      const from = currentPage * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      // Get all users that the current user follows
      const following = await getFollowing(user.id);
      const followingIds = following.map(f => f.id);

      // Include current user's posts and friends' posts
      const targetIds = [user.id, ...followingIds];

      // 1. Fetch posts from following
      const { data: followingPostsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id, caption, image_url, created_at, user_id,
          outfits ( name, outfit_items ( clothing_items ( image_url ) ) ),
          likes_count, comments_count, style_ids
        `)
        .in('user_id', targetIds)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (postsError) throw postsError;

      // 2. Fetch suggested posts based on preferredStyles & affinity
      let suggestedPostsData: any[] = [];
      const userStyles = user.preferredStyles || [];

      if (userStyles.length > 0) {
        let query = supabase
          .from('posts')
          .select(`
            id, caption, image_url, created_at, user_id,
            outfits ( name, outfit_items ( clothing_items ( image_url ) ) ),
            likes_count, comments_count, style_ids
          `)
          .overlaps('style_ids', userStyles)
          .order('likes_count', { ascending: false });

        if (targetIds.length > 0) {
          query = query.not('user_id', 'in', `(${targetIds.join(',')})`);
        }

        const { data: suggestions } = await query.range(currentPage * 6, (currentPage * 6) + 5);
        if (suggestions && suggestions.length > 0) {
          suggestedPostsData = suggestions.map((p: any) => ({ ...p, isSuggested: true }));
        }
      }

      // If user has 0 following or no posts from following, fetch general community explore posts
      if ((!followingPostsData || followingPostsData.length === 0) && suggestedPostsData.length === 0 && currentPage === 0) {
        const { data: explorePosts } = await supabase
          .from('posts')
          .select(`
            id, caption, image_url, created_at, user_id,
            outfits ( name, outfit_items ( clothing_items ( image_url ) ) ),
            likes_count, comments_count, style_ids
          `)
          .order('created_at', { ascending: false })
          .limit(POSTS_PER_PAGE);

        if (explorePosts && explorePosts.length > 0) {
          suggestedPostsData = explorePosts.map((p: any) => ({ ...p, isSuggested: true }));
        }
      }

      // Mix following posts and suggested posts
      let mixedPosts: any[] = [];
      const mainPosts = followingPostsData || [];
      
      let sIdx = 0;
      for (let i = 0; i < mainPosts.length; i++) {
        mixedPosts.push(mainPosts[i]);
        if ((i + 1) % 2 === 0 && sIdx < suggestedPostsData.length) {
          mixedPosts.push(suggestedPostsData[sIdx]);
          sIdx++;
        }
      }
      while (sIdx < suggestedPostsData.length) {
        mixedPosts.push(suggestedPostsData[sIdx]);
        sIdx++;
      }

      if (mixedPosts.length > 0) {
        // Manually fetch profiles for ALL mixed posts
        const userIds = [...new Set(mixedPosts.map(p => p.user_id))];

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

        // Check which posts the current user has liked
        let likedPostIds = new Set<string>();
        const { data: userLikes, error: likesError } = await supabase
          .from('likes' as any)
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', mixedPosts.map(p => p.id));
        
        if (!likesError && userLikes) {
          (userLikes as any[]).forEach(l => likedPostIds.add(l.post_id));
        }

        // Check which posts the current user has saved
        let savedPostIds = new Set<string>();
        const { data: userSaves, error: savesError } = await supabase
          .from('saves')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', mixedPosts.map(p => p.id));
        
        if (!savesError && userSaves) {
          (userSaves as any[]).forEach(s => savedPostIds.add(s.post_id));
        }

        const postsData = mixedPosts;

        const formattedPosts = postsData.map((post: any) => {
          let displayImage = post.image_url;

          if (!displayImage && post.outfits?.outfit_items?.length > 0) {
            const itemWithImage = post.outfits.outfit_items.find((oi: any) => oi.clothing_items?.image_url);
            if (itemWithImage) {
              displayImage = itemWithImage.clothing_items.image_url;
            }
          }

          const profile = profilesMap[post.user_id];

          return {
            id: post.id,
            title: post.caption || post.outfits?.name || 'Publicación sin título',
            description: post.caption,
            imageUrl: displayImage,
            author: {
              name: profile?.username || 'Usuario',
              avatar: profile?.avatar_url || null
            },
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            isLiked: likedPostIds.has(post.id),
            isSaved: savedPostIds.has(post.id),
            isSuggested: post.isSuggested
          };
        });

        if (isLoadMore) {
          setPosts(prev => [...prev, ...formattedPosts]);
        } else {
          setPosts(formattedPosts);
        }

        setHasMore(postsData.length >= POSTS_PER_PAGE);
        pageRef.current = currentPage;
      } else {
        if (!isLoadMore) {
          setPosts([]);
        }
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error.message || error);
      if (!isLoadMore) {
        setPosts([]);
      }
      setHasMore(false);
      setLoadError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user?.id, user?.preferredStyles]);

  // Initial Fetch - fetch when user is available or changes
  useEffect(() => {
    if (user) {
      fetchPosts(false);
    }
  }, [user, fetchPosts]);

  const loadMorePosts = useCallback(() => {
    if (loading || loadingMore || !hasMore || loadError) return;
    fetchPosts(true);
  }, [loading, loadingMore, hasMore, loadError, fetchPosts]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading && !loadError) {
        loadMorePosts();
      }
    }, { threshold: 0.1 });

    if (observerElement.current) observer.observe(observerElement.current);
    return () => observer.disconnect();
  }, [loadMorePosts, hasMore, loadingMore, loading, loadError]);

  return (
    <PullToRefresh onRefresh={() => fetchPosts(false)}>
      <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
          <div className="px-5 h-16 flex items-center justify-between">
            <button
              onClick={toggleCreateMenu}
              className="p-2.5 -ml-2 text-[var(--brand-pink)] hover:bg-[var(--background-secondary)] rounded-full transition-all duration-200 transform hover:scale-110"
            >
              <Plus className="w-6 h-6" />
            </button>

            <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] absolute left-1/2 -translate-x-1/2">Para ti</h1>

            <div className="flex items-center gap-1">
              <Link href="/messages">
                <button className="p-2.5 -mr-1 text-[var(--brand-pink)] hover:bg-[var(--background-secondary)] rounded-full transition-all duration-200 transform hover:scale-110 relative">
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

        {/* Feed Content */}
        <div className="px-3 pt-4 md:px-6">
          {
            loading ? (
              <div className="hidden md:block">
                <div className="masonry-grid">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="break-inside-avoid mb-6">
                      <div className="rounded-2xl overflow-hidden bg-[var(--background-secondary)]" style={{ height: [180, 220, 260, 200, 240][i % 5] }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                icon={PlusSquare}
                title="No hay publicaciones aún."
                description="Sé el primero en compartir tu estilo con la comunidad."
                actionLabel="Crear publicación"
                actionHref="/create-post"
                fullHeight={true}
              />
            ) : (
              <div className="masonry-grid">
                {posts.map((post, index) => (
                  <div key={post.id} className="contents">
                    <div className="break-inside-avoid mb-6">
                      <PostCard post={post} />
                    </div>
                    {(index + 1) % 15 === 0 && (
                      <div key={`premium-ad-${index}`} className="break-inside-avoid mb-6 col-span-full">
                        <PremiumAdCard />
                      </div>
                    )}
                  </div>
                ))}

                {loadingMore && (
                  [...Array(3)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="break-inside-avoid mb-6">
                      <div className="rounded-2xl overflow-hidden bg-[var(--background-secondary)] animate-pulse" style={{ height: [180, 220, 240][i % 3] }} />
                    </div>
                  ))
                )}
              </div>
            )
          }

          {/* Infinite Scroll Trigger only if there are posts */}
          {posts.length > 0 && hasMore && (
            <div ref={observerElement} className="w-full flex items-center justify-center col-span-full">
              <InfiniteScrollFooter
                isLoading={loadingMore}
                isError={loadError}
                hasMore={hasMore}
                hasItems={posts.length > 0}
                onRetry={() => loadMorePosts()}
                skeleton={<></>}
              />
            </div>
          )}
        </div>

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
    </PullToRefresh>
  );
}
