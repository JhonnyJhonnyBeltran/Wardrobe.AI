'use client';

import { create } from 'zustand';
import { type Post } from '@/components/Feed/PostCard';

export interface SearchUserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
}

interface SearchState {
  query: string;
  debouncedQuery: string;
  results: Post[];
  userResults: SearchUserProfile[];
  explorePosts: Post[];
  loading: boolean;
  postsHasMore: boolean;
  usersHasMore: boolean;
  postsPage: number;
  usersPage: number;
  hasInitialLoaded: boolean;
  lastFetchedAt: number;

  // Actions
  setQuery: (query: string) => void;
  setDebouncedQuery: (debouncedQuery: string) => void;
  setResults: (results: Post[] | ((prev: Post[]) => Post[])) => void;
  setUserResults: (userResults: SearchUserProfile[] | ((prev: SearchUserProfile[]) => SearchUserProfile[])) => void;
  setExplorePosts: (explorePosts: Post[] | ((prev: Post[]) => Post[])) => void;
  setLoading: (loading: boolean) => void;
  setPostsHasMore: (hasMore: boolean) => void;
  setUsersHasMore: (hasMore: boolean) => void;
  setPostsPage: (page: number) => void;
  setUsersPage: (page: number) => void;
  setHasInitialLoaded: (loaded: boolean) => void;
  resetSearch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  debouncedQuery: '',
  results: [],
  userResults: [],
  explorePosts: [],
  loading: false,
  postsHasMore: true,
  usersHasMore: true,
  postsPage: 0,
  usersPage: 0,
  hasInitialLoaded: false,
  lastFetchedAt: 0,

  setQuery: (query) => set({ query }),
  setDebouncedQuery: (debouncedQuery) => set({ debouncedQuery }),
  
  setResults: (updater) => {
    const current = get().results;
    const next = typeof updater === 'function' ? updater(current) : updater;
    set({ results: next });
  },

  setUserResults: (updater) => {
    const current = get().userResults;
    const next = typeof updater === 'function' ? updater(current) : updater;
    set({ userResults: next });
  },

  setExplorePosts: (updater) => {
    const current = get().explorePosts;
    const next = typeof updater === 'function' ? updater(current) : updater;
    set({ explorePosts: next, lastFetchedAt: Date.now() });
  },

  setLoading: (loading) => set({ loading }),
  setPostsHasMore: (postsHasMore) => set({ postsHasMore }),
  setUsersHasMore: (usersHasMore) => set({ usersHasMore }),
  setPostsPage: (postsPage) => set({ postsPage }),
  setUsersPage: (usersPage) => set({ usersPage }),
  setHasInitialLoaded: (hasInitialLoaded) => set({ hasInitialLoaded }),

  resetSearch: () => set({
    query: '',
    debouncedQuery: '',
    results: [],
    userResults: [],
    postsPage: 0,
    usersPage: 0,
    postsHasMore: true,
    usersHasMore: true
  })
}));
