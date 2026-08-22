'use client';

import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import * as followService from '@/lib/services/followService';

export interface SaveFolder {
  id: string;
  name: string;
  created_at: string;
  preview_posts?: {
    id: string;
    image_url: string;
  }[];
}

export interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
}

interface ProfileState {
  posts: any[];
  savedPosts: any[];
  savedPostsWithoutFolder: any[];
  folders: SaveFolder[];
  profileStats: ProfileStats;
  selectedFolder: SaveFolder | null;
  activeTab: 'posts' | 'saved';
  isLoading: boolean;
  lastFetchedUserId: string | null;
  lastFetchedAt: number;

  // Actions
  setActiveTab: (tab: 'posts' | 'saved') => void;
  setSelectedFolder: (folder: SaveFolder | null) => void;
  setFolders: (folders: SaveFolder[] | ((prev: SaveFolder[]) => SaveFolder[])) => void;
  setPosts: (posts: any[] | ((prev: any[]) => any[])) => void;
  setSavedPosts: (saved: any[] | ((prev: any[]) => any[])) => void;
  setProfileStats: (stats: ProfileStats) => void;
  
  fetchProfileData: (userId: string, force?: boolean) => Promise<void>;
  fetchFolders: () => Promise<void>;
  invalidate: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  posts: [],
  savedPosts: [],
  savedPostsWithoutFolder: [],
  folders: [],
  profileStats: { posts: 0, followers: 0, following: 0 },
  selectedFolder: null,
  activeTab: 'posts',
  isLoading: false,
  lastFetchedUserId: null,
  lastFetchedAt: 0,

  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedFolder: (selectedFolder) => set({ selectedFolder }),
  
  setFolders: (updater) => {
    const current = get().folders;
    const next = typeof updater === 'function' ? updater(current) : updater;
    set({ folders: next });
  },

  setPosts: (updater) => {
    const current = get().posts;
    const next = typeof updater === 'function' ? updater(current) : updater;
    set({ posts: next });
  },

  setSavedPosts: (updater) => {
    const current = get().savedPosts;
    const next = typeof updater === 'function' ? updater(current) : updater;
    set({ savedPosts: next });
  },

  setProfileStats: (profileStats) => set({ profileStats }),

  invalidate: () => set({ lastFetchedAt: 0 }),

  fetchFolders: async () => {
    try {
      const response = await fetch('/api/save-folders');
      const data = await response.json();
      if (data.folders) {
        set({ folders: data.folders });
      }
    } catch (error) {
      console.error('[ProfileStore] Error fetching folders:', error);
    }
  },

  fetchProfileData: async (userId: string, force = false) => {
    const state = get();
    const isDifferentUser = state.lastFetchedUserId !== userId;
    const hasData = state.posts.length > 0 || state.savedPosts.length > 0;
    const isRecent = Date.now() - state.lastFetchedAt < 60000; // 1 min cache

    // If we already have fresh data in memory for this user, do not show loading state!
    if (!force && !isDifferentUser && hasData && isRecent) {
      return;
    }

    // If user changed or we have zero data, show initial loading
    if (isDifferentUser || !hasData) {
      set({ isLoading: true });
    }

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      if (!isUuid) {
        set({
          profileStats: { posts: 0, followers: 0, following: 0 },
          posts: [],
          savedPosts: [],
          isLoading: false,
          lastFetchedUserId: userId,
          lastFetchedAt: Date.now(),
        });
        return;
      }

      // Parallel data fetching for high performance
      const [
        postsResult,
        followersCount,
        followingCount,
        foldersRes,
        savedRes
      ] = await Promise.allSettled([
        supabase
          .from('posts')
          .select('id, image_url, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        followService.getFollowersCount(userId),
        followService.getFollowingCount(userId),
        fetch('/api/save-folders').then(r => r.json()).catch(() => ({ folders: [] })),
        supabase
          .from('saves')
          .select(`
            id,
            folder_id,
            posts (
              id,
              image_url,
              created_at
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      ]);

      const userPosts = postsResult.status === 'fulfilled' && postsResult.value.data ? postsResult.value.data : [];
      const followers = followersCount.status === 'fulfilled' ? followersCount.value : 0;
      const following = followingCount.status === 'fulfilled' ? followingCount.value : 0;
      const fetchedFolders = foldersRes.status === 'fulfilled' && foldersRes.value?.folders ? foldersRes.value.folders : [];

      let fetchedSavedPosts: any[] = [];
      let withoutFolder: any[] = [];

      if (savedRes.status === 'fulfilled' && savedRes.value.data) {
        const rawSaves = savedRes.value.data;
        const validSaves = rawSaves
          .filter((s: any) => s.posts)
          .map((s: any) => ({
            ...s.posts,
            save_id: s.id,
            folder_id: s.folder_id
          }));

        fetchedSavedPosts = validSaves;
        withoutFolder = validSaves.filter((p: any) => !p.folder_id);
      }

      set({
        posts: userPosts,
        savedPosts: fetchedSavedPosts,
        savedPostsWithoutFolder: withoutFolder,
        folders: fetchedFolders,
        profileStats: {
          posts: userPosts.length,
          followers,
          following,
        },
        isLoading: false,
        lastFetchedUserId: userId,
        lastFetchedAt: Date.now(),
      });

    } catch (error) {
      console.error('[ProfileStore] Error fetching profile data:', error);
      set({ isLoading: false });
    }
  },
}));
