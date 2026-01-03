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

      const { data, error: insertError } = await supabase
        .from('clothing_items')
        .insert({
          user_id: authUser.id,
          name: item.name,
          category: item.category,
          color: item.color,
          image_url: item.imageUrl || null,
          season: item.season,
          brand: item.brand || null,
          tags: item.tags || null,
          favorite: item.favorite || false,
        })
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
    try {
      const dbUpdates: any = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.season !== undefined) dbUpdates.season = updates.season;
      if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.favorite !== undefined) dbUpdates.favorite = updates.favorite;

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
      console.error('Error updating item:', err);
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
