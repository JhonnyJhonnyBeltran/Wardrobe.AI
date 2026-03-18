/**
 * useWardrobe Hook
 * Maneja todas las operaciones del armario con Supabase
 * 
 * NOTA: Las imágenes se suben a Supabase Storage (bucket 'clothing-images')
 * y solo se guarda la URL pública en la base de datos.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ClothingItem, ClothingCategory, ClothingColor, Season } from '@/types/clothing';
import { useUser } from '@/store/userStore';
import {
  uploadImage,
  deleteImage,
  BUCKETS,
  isDataUrl,
  isStorageUrl
} from '@/lib/supabase/storage';
import type { Database } from '@/lib/supabase/database.types';

// Tipo de fila de la tabla clothing_items
type ClothingItemRow = Database['public']['Tables']['clothing_items']['Row'];

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
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0); // Para cancelar fetches obsoletos
  const pageRef = useRef(0);
  // More items per page on desktop for full scroll
  const ITEMS_PER_PAGE = 24;

  // Fetch items — usa getSession() (local) en vez de getUser() (red)
  // para evitar fallos intermitentes por latencia o token refresh
  const fetchItems = useCallback(async (isLoadMore = false) => {
    const currentFetchId = ++fetchIdRef.current;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const currentPage = isLoadMore ? pageRef.current + 1 : 0;
    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      if (!user) {
        if (mountedRef.current && currentFetchId === fetchIdRef.current) {
          setItems([]);
          setHasMore(false);
          setLoading(false);
          setLoadingMore(false);
        }
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;

      // No actualizar si el componente se desmontó o hay un fetch más reciente
      if (!mountedRef.current || currentFetchId !== fetchIdRef.current) return;

      // Convert DB format to ClothingItem format
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

      if (isLoadMore) {
        setItems(prev => [...prev, ...formattedItems]);
      } else {
        setItems(formattedItems);
      }

      setHasMore((data || []).length === ITEMS_PER_PAGE);
      pageRef.current = currentPage;
    } catch (err) {
      if (!mountedRef.current || currentFetchId !== fetchIdRef.current) return;
      console.error('Error fetching wardrobe:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      if (mountedRef.current && currentFetchId === fetchIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [user?.id]);

  // Add item — usa getSession() (local) para consistencia
  const addItem = async (item: Omit<ClothingItem, 'id' | 'createdAt'>): Promise<ClothingItem | null> => {
    try {
      if (!user) {
        setError('Usuario no autenticado');
        return null;
      }

      // Subir imágenes a Storage si son Data URLs (base64)
      let processedImageUrl: string | null = null;
      let originalImageUrl: string | null = null;

      // Subir imagen procesada
      if (item.imageUrl && isDataUrl(item.imageUrl)) {
        const uploadResult = await uploadImage(
          item.imageUrl,
          BUCKETS.CLOTHING,
          {
            folder: user.id,
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.85
          }
        );
        if (uploadResult.error) {
          console.error('Error subiendo imagen procesada:', uploadResult.error);
          setError('Error al subir la imagen');
          return null;
        }
        processedImageUrl = uploadResult.url ?? null;
      } else if (item.imageUrl) {
        // Ya es una URL válida (Storage o externa)
        processedImageUrl = item.imageUrl;
      }

      // Subir imagen original si existe
      if (item.originalImageUrl && isDataUrl(item.originalImageUrl)) {
        const uploadResult = await uploadImage(
          item.originalImageUrl,
          BUCKETS.CLOTHING,
          {
            folder: `${user.id}/originals`,
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.9
          }
        );
        if (uploadResult.error) {
          console.warn('Error subiendo imagen original:', uploadResult.error);
          // No es crítico, continuamos sin la original
        } else {
          originalImageUrl = uploadResult.url ?? null;
        }
      } else if (item.originalImageUrl) {
        originalImageUrl = item.originalImageUrl;
      }

      const itemData: any = {
        user_id: user.id,
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
        // TODO: Descomentar cuando se añada columna source_url en Supabase
        // source_url: (item as any).sourceUrl || null,
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

      setItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err instanceof Error ? err.message : 'Error al añadir prenda');
      return null;
    }
  };

  // Update item
  const updateItem = async (id: string, updates: Partial<ClothingItem>): Promise<boolean> => {
    let dbUpdates: any = {};
    try {
      // Use getSession to check auth locally instead of calling getUser (network)
      // This prevents unnecessary user fetching on every interaction
      if (!user) {
        setError('Usuario no autenticado');
        return false;
      }

      // Si hay una imagen nueva en base64, subirla a Storage
      if (updates.imageUrl !== undefined && isDataUrl(updates.imageUrl)) {
        const uploadResult = await uploadImage(
          updates.imageUrl,
          BUCKETS.CLOTHING,
          {
            folder: user.id,
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.85
          }
        );
        if (uploadResult.error) {
          console.error('Error subiendo imagen:', uploadResult.error);
          setError('Error al subir la imagen');
          return false;
        }
        dbUpdates.image_url = uploadResult.url;

        // Eliminar imagen anterior si era de Storage
        const oldItem = items.find(i => i.id === id);
        if (oldItem?.imageUrl && isStorageUrl(oldItem.imageUrl)) {
          await deleteImage(oldItem.imageUrl, BUCKETS.CLOTHING); // No bloqueamos si falla
        }
      } else if (updates.imageUrl !== undefined) {
        dbUpdates.image_url = updates.imageUrl;
      }

      // Lo mismo para imagen original
      if (updates.originalImageUrl !== undefined && isDataUrl(updates.originalImageUrl)) {
        const uploadResult = await uploadImage(
          updates.originalImageUrl,
          BUCKETS.CLOTHING,
          {
            folder: `${user.id}/originals`,
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.9
          }
        );
        if (!uploadResult.error) {
          dbUpdates.original_image_url = uploadResult.url;
        }
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
      // TODO: Descomentar cuando se añada columna source_url en Supabase
      // if ((updates as any).sourceUrl !== undefined) dbUpdates.source_url = (updates as any).sourceUrl;

      const { error: updateError } = await (supabase.from('clothing_items') as any)
        .update(dbUpdates)
        .eq('id', id);

      if (updateError) throw updateError;

      // Actualizar estado local con las URLs de Storage
      const localUpdates = { ...updates };
      if (dbUpdates.image_url) localUpdates.imageUrl = dbUpdates.image_url;
      if (dbUpdates.original_image_url) localUpdates.originalImageUrl = dbUpdates.original_image_url;

      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...localUpdates } : item
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating item:', JSON.stringify(err, null, 2), err, 'Updates:', dbUpdates);
      setError(err instanceof Error ? err.message : 'Error al actualizar prenda');
      return false;
    }
  };

  // Delete item
  const deleteItem = async (id: string): Promise<boolean> => {
    try {
      // Obtener el item para eliminar sus imágenes de Storage
      const itemToDelete = items.find(i => i.id === id);

      const { error: deleteError } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Eliminar imágenes de Storage (en background, no bloqueamos)
      if (itemToDelete) {
        if (itemToDelete.imageUrl && isStorageUrl(itemToDelete.imageUrl)) {
          deleteImage(itemToDelete.imageUrl, BUCKETS.CLOTHING).catch(console.warn);
        }
        if (itemToDelete.originalImageUrl && isStorageUrl(itemToDelete.originalImageUrl)) {
          deleteImage(itemToDelete.originalImageUrl, BUCKETS.CLOTHING).catch(console.warn);
        }
      }

      setItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar prenda');
      return false;
    }
  };

  // Toggle favorite
  const toggleFavorite = async (id: string): Promise<boolean> => {
    const item = items.find(i => i.id === id);
    if (!item) return false;

    return updateItem(id, { favorite: !item.favorite });
  };

  // Refresh
  const refresh = async () => {
    await fetchItems(false);
  };

  const loadMore = async () => {
    if (loading || loadingMore || !hasMore) return;
    await fetchItems(true);
  };

  // Fetch on mount and auth changes
  useEffect(() => {
    mountedRef.current = true;
    fetchItems();

    // Suscribirse a cambios de auth, pero saltar INITIAL_SESSION
    // (ya hicimos fetch arriba) para evitar doble llamada/race condition
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') return; // Ya cargamos arriba
      if (!mountedRef.current) return;

      if (event === 'SIGNED_OUT') {
        setItems([]);
        setLoading(false);
        return;
      }
      // TOKEN_REFRESHED, SIGNED_IN, etc → refrescar items
      fetchItems(false);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchItems]);

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
