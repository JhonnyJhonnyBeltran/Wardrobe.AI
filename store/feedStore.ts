'use client';

import { create } from 'zustand';

interface FeedState {
  posts: any[];
  hasMore: boolean;
  page: number;
  lastFetchedAt: number;
  scrollPosition: number;
  
  setPosts: (posts: any[] | ((prev: any[]) => any[])) => void;
  appendPosts: (newPosts: any[]) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  setScrollPosition: (scrollPosition: number) => void;
  invalidate: () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  hasMore: true,
  page: 0,
  lastFetchedAt: 0,
  scrollPosition: 0,

  setPosts: (updater) => {
    const current = get().posts;
    const next = typeof updater === 'function' ? updater(current) : updater;
    set({ posts: next, lastFetchedAt: Date.now() });
  },

  appendPosts: (newPosts) => {
    const current = get().posts;
    const existingIds = new Set(current.map(p => p.id));
    const uniqueNew = newPosts.filter(p => !existingIds.has(p.id));
    set({ posts: [...current, ...uniqueNew], lastFetchedAt: Date.now() });
  },

  setHasMore: (hasMore) => set({ hasMore }),
  setPage: (page) => set({ page }),
  setScrollPosition: (scrollPosition) => set({ scrollPosition }),
  invalidate: () => set({ lastFetchedAt: 0, page: 0 }),
}));
