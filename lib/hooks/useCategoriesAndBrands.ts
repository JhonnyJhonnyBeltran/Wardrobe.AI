/**
 * useCategoriesAndBrands Hook
 * Fetches categories and brands from the database
 * Falls back to default constants if database fetch fails
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  display_order: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  is_active: boolean;
  display_order: number;
}

// Fallback constants for when database is unavailable or partial
const DEFAULT_CATEGORIES = [
  { value: 'top', label: 'Top / Camiseta' },
  { value: 'shirt', label: 'Camisa / Blusa' },
  { value: 'sweater', label: 'Jersey / Suéter' },
  { value: 'hoodie', label: 'Sudadera' },
  { value: 'jacket', label: 'Chaqueta / Cazadora' },
  { value: 'outerwear', label: 'Abrigo / Parka' },
  { value: 'bottom', label: 'Pantalón / Jeans' },
  { value: 'shorts', label: 'Pantalón corto / Shorts' },
  { value: 'skirt', label: 'Falda' },
  { value: 'dress', label: 'Vestido / Mono' },
  { value: 'shoes', label: 'Calzado / Zapatillas' },
  { value: 'bag', label: 'Bolso / Mochila' },
  { value: 'accessory', label: 'Accesorio / Joyería' },
  { value: 'other', label: 'Otros (Libros, objetos, etc.)' },
];

const DEFAULT_BRANDS = [
  'Zara',
  'Mango',
  'H&M',
  'Pull&Bear',
  'Bershka',
  'Stradivarius',
  'Massimo Dutti',
  'COS',
  'Uniqlo',
  'Nike',
  'Adidas',
  'Levi\'s',
  'Tommy Hilfiger',
  'Calvin Klein',
  'Primark',
  'ASOS',
  'Shein',
  'Otra marca',
];

interface UseCategoriesAndBrandsResult {
  categories: Array<{ value: string; label: string }>;
  brands: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCategoriesAndBrands(): UseCategoriesAndBrandsResult {
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>(DEFAULT_CATEGORIES);
  const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories' as any)
        .select('name, slug')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) {
        console.error('[useCategoriesAndBrands] Error fetching categories:', categoriesError);
      } else if (categoriesData && categoriesData.length > 0) {
        const dbCategories = categoriesData.map((cat: any) => ({
          value: cat.slug,
          label: cat.name,
        }));
        
        // Merge DB categories with default categories to guarantee all options (like 'other', 'hoodie', etc.) are present
        const mergedCategories = [...dbCategories];
        for (const def of DEFAULT_CATEGORIES) {
          if (!mergedCategories.some(c => c.value === def.value)) {
            mergedCategories.push(def);
          }
        }
        setCategories(mergedCategories);
      }

      // Fetch brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands' as any)
        .select('name')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (brandsError) {
        console.error('[useCategoriesAndBrands] Error fetching brands:', brandsError);
        // Fall back to defaults
      } else if (brandsData && brandsData.length > 0) {
        const formattedBrands = brandsData.map((brand: any) => brand.name);
        setBrands(formattedBrands);
      }
    } catch (err) {
      console.error('[useCategoriesAndBrands] Unexpected error:', err);
      setError('Error al cargar las opciones del servidor');
      // Keep defaults on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    categories,
    brands,
    isLoading,
    error,
    refetch: fetchData,
  };
}
