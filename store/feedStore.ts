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
