/**
 * useWardrobe Hook - Refactored to use Global Store
 * Maneja todas las operaciones del armario con Supabase a través de wardrobeStore
 */

import { useEffect, useCallback } from 'react';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import { ClothingItem } from '@/types/clothing';

interface UseWardrobeReturn {
  items: ClothingItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  addItem: (item: Omit<ClothingItem, 'id' | 'createdAt'>) => Promise<ClothingItem | null>;
  updateItem: (id: string, updates: Partial<ClothingItem>) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useWardrobe(): UseWardrobeReturn {
  const { user } = useUser();
  const {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    fetchItems,
    addItem: storeAddItem,
    updateItem: storeUpdateItem,
    deleteItem,
    toggleFavorite: storeToggleFavorite,
  } = useWardrobeStore();

  const refresh = useCallback(async () => {
    if (user?.id) {
      await fetchItems(user.id, false);
    }
  }, [user?.id, fetchItems]);

  const loadMore = useCallback(async () => {
    if (user?.id && !loading && !loadingMore && hasMore) {
      await fetchItems(user.id, true);
    }
  }, [user?.id, loading, loadingMore, hasMore, fetchItems]);

  const addItem = useCallback(async (item: Omit<ClothingItem, 'id' | 'createdAt'>) => {
    if (!user?.id) return null;
    return storeAddItem(user.id, item);
  }, [user?.id, storeAddItem]);

  const updateItem = useCallback(async (id: string, updates: Partial<ClothingItem>) => {
    if (!user?.id) return false;
    return storeUpdateItem(user.id, id, updates);
  }, [user?.id, storeUpdateItem]);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!user?.id) return false;
    return storeToggleFavorite(user.id, id);
  }, [user?.id, storeToggleFavorite]);

  // Initial fetch on mount
  useEffect(() => {
    if (user?.id && items.length === 0 && !loading) {
      fetchItems(user.id);
    }
    
    // Subscribe to auth changes to clear or refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        useWardrobeStore.setState({ items: [], loading: false, error: null });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Only fetch if we have a user
        supabase.auth.getUser().then(({ data: { user: authUser } }) => {
          if (authUser) fetchItems(authUser.id);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [user?.id, fetchItems]); // Removed items.length and loading from deps to avoid infinite loops, handeled inside

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    refresh,
    loadMore,
  };
}
