/**
 * useWardrobe Hook
 * Maneja todas las operaciones del armario con Supabase
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ClothingItem, ClothingCategory, ClothingColor, Season } from '@/types/clothing';
import { useUser } from '@/store/userStore';

interface UseWardrobeReturn {
  items: ClothingItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<ClothingItem, 'id' | 'createdAt'>) => Promise<ClothingItem | null>;
  updateItem: (id: string, updates: Partial<ClothingItem>) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useWardrobe(): UseWardrobeReturn {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Fetch items
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setItems([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Convert DB format to ClothingItem format
      const formattedItems: ClothingItem[] = (data || []).map(item => ({
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
        originalImageUrl: item.original_image_url,
        // Campos adicionales
        ...({
          colorHex: item.color_hex,
          size: item.size,
          reference: item.reference,
          fabric: item.fabric,
        } as any)
      }));

      setItems(formattedItems);
    } catch (err) {
      console.error('Error fetching wardrobe:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Add item
  const addItem = async (item: Omit<ClothingItem, 'id' | 'createdAt'>): Promise<ClothingItem | null> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setError('Usuario no autenticado');
        return null;
      }

      const itemData: any = {
        user_id: authUser.id,
        name: item.name,
        category: item.category,
        color: item.color,
        image_url: item.imageUrl || null,
        season: item.season,
        brand: item.brand || null,
        tags: item.tags || null,
        favorite: item.favorite || false,
        is_ai_processed: item.isAiProcessed || false,
        original_image_url: item.originalImageUrl || null,
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

      const newItem: ClothingItem = {
        id: data.id,
        name: data.name,
        category: data.category as ClothingCategory,
        color: data.color as ClothingColor,
        imageUrl: data.image_url || undefined,
        season: data.season as Season[],
        brand: data.brand || undefined,
        tags: data.tags || undefined,
        favorite: data.favorite,
        createdAt: new Date(data.created_at),
        isAiProcessed: data.is_ai_processed,
        originalImageUrl: data.original_image_url,
        ...({
          colorHex: data.color_hex,
          size: data.size,
          reference: data.reference,
          fabric: data.fabric,
        } as any)
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
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.season !== undefined) dbUpdates.season = updates.season;
      if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.favorite !== undefined) dbUpdates.favorite = updates.favorite;
      if (updates.isAiProcessed !== undefined) dbUpdates.is_ai_processed = updates.isAiProcessed;
      if (updates.originalImageUrl !== undefined) dbUpdates.original_image_url = updates.originalImageUrl;

      if ((updates as any).colorHex !== undefined) dbUpdates.color_hex = (updates as any).colorHex;
      if ((updates as any).size !== undefined) dbUpdates.size = (updates as any).size;
      if ((updates as any).reference !== undefined) dbUpdates.reference = (updates as any).reference;
      if ((updates as any).fabric !== undefined) dbUpdates.fabric = (updates as any).fabric;

      const { error: updateError } = await supabase
        .from('clothing_items')
        .update(dbUpdates)
        .eq('id', id);

      if (updateError) throw updateError;

      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...updates } : item
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
      const { error: deleteError } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

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
    await fetchItems();
  };

  // Fetch on mount and user change
  useEffect(() => {
    fetchItems();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchItems();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    refresh,
  };
}
