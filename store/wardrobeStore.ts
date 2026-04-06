import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { ClothingItem, ClothingCategory, ClothingColor, Season } from '@/types/clothing';
import {
  uploadImage,
  deleteImage,
  BUCKETS,
  isDataUrl,
  isStorageUrl
} from '@/lib/supabase/storage';
import { Database } from '@/lib/supabase/database.types';

type ClothingItemRow = Database['public']['Tables']['clothing_items']['Row'];

interface WardrobeState {
  items: ClothingItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;

  // Actions
  setItems: (items: ClothingItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  fetchItems: (userId: string, isLoadMore?: boolean) => Promise<void>;
  addItem: (userId: string, item: Omit<ClothingItem, 'id' | 'createdAt'>) => Promise<ClothingItem | null>;
  updateItem: (userId: string, id: string, updates: Partial<ClothingItem>) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  toggleFavorite: (userId: string, id: string) => Promise<boolean>;
}

const ITEMS_PER_PAGE = 24;

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  items: [],
  loading: false,
  loadingMore: false,
  hasMore: true,
  error: null,
  page: 0,

  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchItems: async (userId, isLoadMore = false) => {
    if (isLoadMore) {
      set({ loadingMore: true });
    } else {
      set({ loading: true, page: 0 });
    }
    set({ error: null });

    const currentPage = isLoadMore ? get().page + 1 : 0;
    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      const { data, error: fetchError } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;

      const formattedItems: ClothingItem[] = ((data || []) as ClothingItemRow[]).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category as ClothingCategory,
        color: item.color as ClothingColor,
        imageUrl: item.image_url || undefined,
        season: item.season as Season[],
        brand: item.brand || undefined,
        tags: item.tags || undefined,
        favorite: item.favorite,
        createdAt: new Date(item.created_at),
        isAiProcessed: item.is_ai_processed,
        originalImageUrl: item.original_image_url || undefined,
        colorHex: item.color_hex || undefined,
        size: item.size || undefined,
        reference: item.reference || undefined,
        fabric: item.fabric || undefined,
      }));

      set(state => ({
        items: isLoadMore ? [...state.items, ...formattedItems] : formattedItems,
        hasMore: (data || []).length === ITEMS_PER_PAGE,
        page: currentPage,
        loading: false,
        loadingMore: false
      }));
    } catch (err) {
      console.error('Error fetching wardrobe store:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Error desconocido',
        loading: false,
        loadingMore: false
      });
    }
  },

  addItem: async (userId, item) => {
    try {
      let processedImageUrl: string | null = null;
      let originalImageUrl: string | null = null;

      if (item.imageUrl && isDataUrl(item.imageUrl)) {
        const uploadResult = await uploadImage(item.imageUrl, BUCKETS.CLOTHING, {
          folder: userId,
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.85
        });
        if (uploadResult.error) throw new Error('Error al subir la imagen');
        processedImageUrl = uploadResult.url ?? null;
      } else {
        processedImageUrl = item.imageUrl || null;
      }

      if (item.originalImageUrl && isDataUrl(item.originalImageUrl)) {
        const uploadResult = await uploadImage(item.originalImageUrl, BUCKETS.CLOTHING, {
          folder: `${userId}/originals`,
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.9
        });
        originalImageUrl = uploadResult.url ?? null;
      } else {
        originalImageUrl = item.originalImageUrl || null;
      }

      const itemData: any = {
        user_id: userId,
        name: item.name,
        category: item.category,
        color: item.color,
        image_url: processedImageUrl,
        season: item.season,
        brand: item.brand || null,
        tags: item.tags || null,
        favorite: item.favorite || false,
        is_ai_processed: item.isAiProcessed || false,
        original_image_url: originalImageUrl,
        color_hex: (item as any).colorHex || null,
        size: (item as any).size || null,
        reference: (item as any).reference || null,
        fabric: (item as any).fabric || null,
      };

      const { data, error: insertError } = await supabase
        .from('clothing_items')
        .insert(itemData)
        .select()
        .single();

      if (insertError) throw insertError;

      const dbItem = data as ClothingItemRow;
      const newItem: ClothingItem = {
        id: dbItem.id,
        name: dbItem.name,
        category: dbItem.category as ClothingCategory,
        color: dbItem.color as ClothingColor,
        imageUrl: dbItem.image_url || undefined,
        season: dbItem.season as Season[],
        brand: dbItem.brand || undefined,
        tags: dbItem.tags || undefined,
        favorite: dbItem.favorite,
        createdAt: new Date(dbItem.created_at),
        isAiProcessed: dbItem.is_ai_processed,
        originalImageUrl: dbItem.original_image_url || undefined,
        colorHex: dbItem.color_hex || undefined,
        size: dbItem.size || undefined,
        reference: dbItem.reference || undefined,
        fabric: dbItem.fabric || undefined,
      };

      set(state => ({ items: [newItem, ...state.items] }));
      return newItem;
    } catch (err) {
      console.error('Error adding item in store:', err);
      set({ error: err instanceof Error ? err.message : 'Error al añadir prenda' });
      return null;
    }
  },

  updateItem: async (userId, id, updates) => {
    let dbUpdates: any = {};
    try {
      if (updates.imageUrl !== undefined && isDataUrl(updates.imageUrl)) {
        const uploadResult = await uploadImage(updates.imageUrl, BUCKETS.CLOTHING, {
          folder: userId,
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.85
        });
        if (uploadResult.error) throw new Error('Error al subir la imagen');
        dbUpdates.image_url = uploadResult.url;

        const oldItem = get().items.find(i => i.id === id);
        if (oldItem?.imageUrl && isStorageUrl(oldItem.imageUrl)) {
          await deleteImage(oldItem.imageUrl, BUCKETS.CLOTHING).catch(console.warn);
        }
      } else if (updates.imageUrl !== undefined) {
        dbUpdates.image_url = updates.imageUrl;
      }

      if (updates.originalImageUrl !== undefined && isDataUrl(updates.originalImageUrl)) {
        const uploadResult = await uploadImage(updates.originalImageUrl, BUCKETS.CLOTHING, {
          folder: `${userId}/originals`,
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.9
        });
        if (!uploadResult.error) dbUpdates.original_image_url = uploadResult.url;
      } else if (updates.originalImageUrl !== undefined) {
        dbUpdates.original_image_url = updates.originalImageUrl;
      }

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.season !== undefined) dbUpdates.season = updates.season;
      if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.favorite !== undefined) dbUpdates.favorite = updates.favorite;
      if (updates.isAiProcessed !== undefined) dbUpdates.is_ai_processed = updates.isAiProcessed;
      if ((updates as any).colorHex !== undefined) dbUpdates.color_hex = (updates as any).colorHex;
      if ((updates as any).size !== undefined) dbUpdates.size = (updates as any).size;
      if ((updates as any).reference !== undefined) dbUpdates.reference = (updates as any).reference;
      if ((updates as any).fabric !== undefined) dbUpdates.fabric = (updates as any).fabric;
      if ((updates as any).sourceUrl !== undefined) dbUpdates.source_url = (updates as any).sourceUrl;

      // Only proceed if there are actual updates to perform
      if (Object.keys(dbUpdates).length === 0) {
        console.log('[WardrobeStore] No changes detected, skipping database update');
        return true;
      }

      const { error: updateError } = await (supabase.from('clothing_items') as any)
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      const localUpdates = { ...updates };
      if (dbUpdates.image_url) localUpdates.imageUrl = dbUpdates.image_url;
      if (dbUpdates.original_image_url) localUpdates.originalImageUrl = dbUpdates.original_image_url;

      set(state => ({
        items: state.items.map(item => item.id === id ? { ...item, ...localUpdates } : item)
      }));

      return true;
    } catch (err) {
      console.error('Error updating item in store:', err);
      set({ error: err instanceof Error ? err.message : 'Error al actualizar prenda' });
      return false;
    }
  },

  deleteItem: async (id) => {
    try {
      const itemToDelete = get().items.find(i => i.id === id);

      const { error: deleteError } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      if (itemToDelete) {
        if (itemToDelete.imageUrl && isStorageUrl(itemToDelete.imageUrl)) {
          deleteImage(itemToDelete.imageUrl, BUCKETS.CLOTHING).catch(console.warn);
        }
        if (itemToDelete.originalImageUrl && isStorageUrl(itemToDelete.originalImageUrl)) {
          deleteImage(itemToDelete.originalImageUrl, BUCKETS.CLOTHING).catch(console.warn);
        }
      }

      set(state => ({ items: state.items.filter(item => item.id !== id) }));
      return true;
    } catch (err) {
      console.error('Error deleting item in store:', err);
      set({ error: err instanceof Error ? err.message : 'Error al eliminar prenda' });
      return false;
    }
  },

  toggleFavorite: async (userId, id) => {
    const item = get().items.find(i => i.id === id);
    if (!item) return false;
    return get().updateItem(userId, id, { favorite: !item.favorite });
  }
}));
