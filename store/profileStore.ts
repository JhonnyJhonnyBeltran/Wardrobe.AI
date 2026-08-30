'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

const PROFILE_POSTS_PER_PAGE = 40;

interface ProfileState {
  posts: any[];
  savedPosts: any[];
  savedPostsWithoutFolder: any[];
  folders: SaveFolder[];
  profileStats: ProfileStats;
  selectedFolder: SaveFolder | null;
  activeTab: 'posts' | 'saved';
  isLoading: boolean;
  postsHasMore: boolean;
  savedHasMore: boolean;
  postsPage: number;
  savedPage: number;
  loadingMorePosts: boolean;
  loadingMoreSaved: boolean;
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
  fetchMorePosts: (userId: string) => Promise<void>;
  fetchMoreSavedPosts: (userId: string) => Promise<void>;
  fetchFolders: () => Promise<void>;
  invalidate: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      posts: [],
      savedPosts: [],
      savedPostsWithoutFolder: [],
      folders: [],
      profileStats: { posts: 0, followers: 0, following: 0 },
      selectedFolder: null,
      activeTab: 'posts',
      isLoading: false,
      postsHasMore: true,
      savedHasMore: true,
      postsPage: 0,
      savedPage: 0,
      loadingMorePosts: false,
      loadingMoreSaved: false,
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
        const isRecent = Date.now() - state.lastFetchedAt < 120000; // 2 min cache

        if (!force && !isDifferentUser && hasData && isRecent) {
          return;
        }

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

          // Initial 40 posts fetch
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
              .order('created_at', { ascending: false })
              .range(0, PROFILE_POSTS_PER_PAGE - 1),
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
              .range(0, PROFILE_POSTS_PER_PAGE - 1)
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
            postsHasMore: userPosts.length >= PROFILE_POSTS_PER_PAGE,
            savedHasMore: fetchedSavedPosts.length >= PROFILE_POSTS_PER_PAGE,
            postsPage: 0,
            savedPage: 0,
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

      fetchMorePosts: async (userId: string) => {
        const { posts, postsPage, postsHasMore, loadingMorePosts } = get();
        if (loadingMorePosts || !postsHasMore) return;

        set({ loadingMorePosts: true });
        const nextPage = postsPage + 1;
        const from = nextPage * PROFILE_POSTS_PER_PAGE;
        const to = from + PROFILE_POSTS_PER_PAGE - 1;

        try {
          const { data } = await supabase
            .from('posts')
            .select('id, image_url, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

          const newPosts = data || [];
          set({
            posts: [...posts, ...newPosts],
            postsPage: nextPage,
            postsHasMore: newPosts.length >= PROFILE_POSTS_PER_PAGE,
            loadingMorePosts: false,
          });
        } catch (err) {
          console.error('[ProfileStore] Error fetching more posts:', err);
          set({ loadingMorePosts: false });
        }
      },

      fetchMoreSavedPosts: async (userId: string) => {
        const { savedPosts, savedPage, savedHasMore, loadingMoreSaved, selectedFolder } = get();
        if (loadingMoreSaved || !savedHasMore) return;

        set({ loadingMoreSaved: true });
        const nextPage = savedPage + 1;
        const from = nextPage * PROFILE_POSTS_PER_PAGE;
        const to = from + PROFILE_POSTS_PER_PAGE - 1;

        try {
          let query = supabase
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
            .eq('user_id', userId);

          if (selectedFolder) {
            query = query.eq('folder_id', selectedFolder.id);
          }

          const { data } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

          const rawSaves = data || [];
          const validSaves = rawSaves
            .filter((s: any) => s.posts)
            .map((s: any) => ({
              ...s.posts,
              save_id: s.id,
              folder_id: s.folder_id
            }));

          set({
            savedPosts: [...savedPosts, ...validSaves],
            savedPage: nextPage,
            savedHasMore: validSaves.length >= PROFILE_POSTS_PER_PAGE,
            loadingMoreSaved: false,
          });
        } catch (err) {
          console.error('[ProfileStore] Error fetching more saved posts:', err);
          set({ loadingMoreSaved: false });
        }
      },
    }),
    {
      name: 'klozet_profile_cache',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        posts: state.posts.slice(0, 40),
        savedPosts: state.savedPosts.slice(0, 40),
        savedPostsWithoutFolder: state.savedPostsWithoutFolder.slice(0, 40),
        folders: state.folders,
        profileStats: state.profileStats,
        lastFetchedUserId: state.lastFetchedUserId,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);
