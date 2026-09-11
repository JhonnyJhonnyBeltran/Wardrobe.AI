'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FeedState {
  posts: any[];
  hasMore: boolean;
  page: number;
  lastFetchedAt: number;
  scrollPosition: number;
  hasInitialLoaded: boolean;
  
  setPosts: (posts: any[] | ((prev: any[]) => any[])) => void;
  appendPosts: (newPosts: any[]) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  setScrollPosition: (scrollPosition: number) => void;
  setHasInitialLoaded: (loaded: boolean) => void;
  updatePostLike: (postId: string, isLiked: boolean, likesCount?: number) => void;
  invalidate: () => void;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      posts: [],
      hasMore: true,
      page: 0,
      lastFetchedAt: 0,
      scrollPosition: 0,
      hasInitialLoaded: false,

      setPosts: (updater) => {
        const current = get().posts;
        const next = typeof updater === 'function' ? updater(current) : updater;
        set({ posts: next, lastFetchedAt: Date.now(), hasInitialLoaded: true });
      },

      appendPosts: (newPosts) => {
        const current = get().posts;
        const existingIds = new Set(current.map(p => p.id));
        const uniqueNew = newPosts.filter(p => !existingIds.has(p.id));
        set({ posts: [...current, ...uniqueNew], lastFetchedAt: Date.now(), hasInitialLoaded: true });
      },

      setHasMore: (hasMore) => set({ hasMore }),
      setPage: (page) => set({ page }),
      setScrollPosition: (scrollPosition) => set({ scrollPosition }),
      setHasInitialLoaded: (hasInitialLoaded) => set({ hasInitialLoaded }),
      updatePostLike: (postId, isLiked, likesCount) => {
        const current = get().posts;
        const updated = current.map(p => {
          if (p.id === postId) {
            const newCount = likesCount !== undefined ? likesCount : (isLiked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 1) - 1));
            return { ...p, is_liked: isLiked, isLiked: isLiked, likes_count: newCount, likesCount: newCount };
          }
          return p;
        });
        set({ posts: updated });
      },
      invalidate: () => set({ lastFetchedAt: 0, page: 0 }),
    }),
    {
      name: 'klozet_feed_cache',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        posts: state.posts.slice(0, 40),
        hasMore: state.hasMore,
        lastFetchedAt: state.lastFetchedAt,
        hasInitialLoaded: state.hasInitialLoaded,
      }),
    }
  )
);
