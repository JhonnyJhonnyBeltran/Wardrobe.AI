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

// Fallback constants for when database is unavailable
const DEFAULT_CATEGORIES = [
  { value: 'top', label: 'Top / Camiseta' },
  { value: 'shirt', label: 'Camisa' },
  { value: 'sweater', label: 'Jersey / Suéter' },
  { value: 'bottom', label: 'Pantalón' },
  { value: 'skirt', label: 'Falda' },
  { value: 'dress', label: 'Vestido' },
  { value: 'outerwear', label: 'Abrigo / Chaqueta' },
  { value: 'shoes', label: 'Calzado' },
  { value: 'accessory', label: 'Accesorio' },
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
        // Fall back to defaults
      } else if (categoriesData && categoriesData.length > 0) {
        const formattedCategories = categoriesData.map((cat: any) => ({
          value: cat.slug,
          label: cat.name,
        }));
        setCategories(formattedCategories);
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
