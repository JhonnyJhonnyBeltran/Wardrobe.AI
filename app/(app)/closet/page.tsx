'use client';

/**
 * Closet - Your Wardrobe (Mobile Optimized)
 * Search expands, buttons icon-only on mobile
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useRef } from 'react';
import {
  Heart, Grid3x3, List, Search, Filter, Plus, X, Shirt, Layers, Share2, Trash2, Check, CalendarDays, Camera, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, FloatingCreateButton, OutfitCard, ClothingItem, NotificationToastContainer, WardrobeSelectionModal, OutfitDetailModal, EmptyState, SkeletonCard, SkeletonCloset, ProfileProgressBar, KloeMascot } from '@/components';
import AddItemModal from '@/components/AddItemModal';
import ProductModal from '@/components/ProductModal';
import KloeProModal from '@/components/KloeProModal';
import OutfitCalendar from '@/components/OutfitCalendar';
import { haptics } from '@/lib/haptic';
import type { Outfit } from '@/types/outfit';
import type { ClothingItem as ClothingItemType } from '@/types/clothing';
import { useUser } from '@/store';
import { useUiStore } from '@/store/uiStore';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { useBodyScrollLock } from '@/lib/hooks';
import { useTranslation } from '@/lib/i18n';
import { translateSpanishString } from '@/lib/i18n/autoTranslate';
import Link from 'next/link';

import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

const KLOE_PROMPTS = [
  '¿Esto combina?',
  '¿Esto se lleva?',
  '¿No sabes qué ponerte?',
  '¿Qué me pongo hoy?',
  '¿Look con lo que ya tienes?',
  '¿Montamos un outfit juntos?',
  '¿Outfit según el tiempo?',
  '¿Cómo combino esta prenda?',
];

function KloeHeroBanner() {
  const { language } = useTranslation();
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    setPromptIndex(Math.floor(Math.random() * KLOE_PROMPTS.length));

    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % KLOE_PROMPTS.length);
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  const rawPrompt = KLOE_PROMPTS[promptIndex];
  const currentPrompt = translateSpanishString(rawPrompt, language) || rawPrompt;

  return (
    <Link href="/closet/kloe" className="block w-full" onClick={() => { try { haptics.tap(); } catch {} }}>
      <motion.div
        whileHover={{ y: -2, scale: 1.006 }}
        whileTap={{ scale: 0.975 }}
        transition={{ type: 'spring', stiffness: 460, damping: 24 }}
        className="w-full min-h-[78px] sm:min-h-[84px] py-3.5 px-5 sm:px-7 rounded-full kz-kloe-banner flex items-center justify-between gap-4 cursor-pointer group"
        aria-label={currentPrompt}
      >
        <div className="min-w-0 flex-1 flex items-center gap-4 sm:gap-5">
          <KloeMascot
            mood="happy"
            size="lg"
            variant="pink"
            className="!w-[52px] !h-[60px] sm:!w-[58px] sm:!h-[66px] drop-shadow-[0_0_18px_rgba(255,102,196,0.68)] shrink-0"
          />

          <div className="min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={promptIndex}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 0.85 }}
                className="font-display text-[19px] sm:text-[23px] font-bold tracking-[-0.025em] text-[#FF66C4] leading-tight line-clamp-2 select-none"
              >
                {currentPrompt}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <ChevronRight
          className="w-7 h-7 shrink-0 text-[#FF66C4] drop-shadow-[0_0_10px_rgba(255,102,196,0.45)] group-hover:translate-x-1 transition-transform"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </motion.div>
    </Link>
  );
}

export default function ClosetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPremium, user, setUser, isLoading } = useUser();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItemType | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [showKloeProModal, setShowKloeProModal] = useState(false);

  // Auto-open Add Item Modal, switch Tab or open Upgrade modal based on query param
  useEffect(() => {
    const action = searchParams.get('action');
    const tab = searchParams.get('tab');
    const upgrade = searchParams.get('upgrade');

    if (upgrade === 'true') {
      setShowKloeProModal(true);
      router.replace('/closet', { scroll: false });
    } else if (action === 'new-item') {
      setShowAddModal(true);
      router.replace('/closet', { scroll: false });
    } else if (tab === 'outfits') {
      setActiveTab('outfits');
      router.replace('/closet', { scroll: false });
    } else if (tab === 'calendar') {
      setActiveTab('calendar');
      router.replace('/closet', { scroll: false });
    }
  }, [searchParams, router]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<ClothingItemType | null>(null);
  const { items, loading, loadingMore, hasMore, loadMore, addItem, updateItem, deleteItem, refresh } = useWardrobe();

  // Selection Mode State (Synced with global store)
  const { isSelectionMode, setSelectionMode: setGlobalSelectionMode } = useUiStore();
  const [selectionMode, setSelectionModeLocal] = useState(false);
  
  // Custom setter to keep both in sync
  const setSelectionMode = useCallback((active: boolean) => {
    setSelectionModeLocal(active);
    setGlobalSelectionMode(active);
  }, [setGlobalSelectionMode]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fetchIdRef = useRef(0); // Para cancelar fetches obsoletos
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mounted ref for outfits fetching matching items pattern
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; }
  }, []);

  // Load filters from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const saved = localStorage.getItem(`closet_filters_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.searchQuery) setSearchQuery(parsed.searchQuery);
          if (parsed.showFavoritesOnly !== undefined) setShowFavoritesOnly(parsed.showFavoritesOnly);
          if (parsed.selectedCategories) setSelectedCategories(new Set(parsed.selectedCategories));
        } catch (e) {
          console.error('Error parsing saved filters', e);
        }
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id && mountedRef.current) {
      const filters = {
        searchQuery,
        showFavoritesOnly,
        selectedCategories: Array.from(selectedCategories)
      };
      localStorage.setItem(`closet_filters_${user.id}`, JSON.stringify(filters));
    }
  }, [searchQuery, showFavoritesOnly, selectedCategories, user?.id]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // Salir del modo de selección si ya no hay nada seleccionado
        if (next.size === 0) setSelectionMode(false);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleTouchStart = (id: string) => {
    if (selectionMode) return; // if already in selection mode, just ignore long press
    touchTimerRef.current = setTimeout(() => {
      setSelectionMode(true);
      toggleSelection(id);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500); // 500ms long press sets selection mode
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  };

  // Outfits State
  const [activeTab, setActiveTab] = useState<'items' | 'outfits' | 'calendar'>('items');


  // Lock body scroll when filter panel is open
  useBodyScrollLock(showFilters);

  // Clear selection and filters when changing tabs
  useEffect(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    
    // Reset filters
    setSearchQuery('');
    setSelectedCategories(new Set());
    setShowFavoritesOnly(false);
  }, [activeTab]);

  const [outfits, setOutfits] = useState<any[]>([]);
  const [outfitsLoading, setOutfitsLoading] = useState(false);
  const [outfitsLoadingMore, setOutfitsLoadingMore] = useState(false);
  const [outfitsHasMore, setOutfitsHasMore] = useState(true);
  const outfitsPageRef = useRef(0);
  const [itemUsageStats, setItemUsageStats] = useState<Record<string, { wears: number; looks: number }>>({});
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [recentlyFavoritedId, setRecentlyFavoritedId] = useState<string | null>(null);

  // Compute real wear counts (from calendar_outfits) and outfit appearance counts (from outfit_items)
  useEffect(() => {
    if (!user?.id) return;
    let active = true;

    const loadClosetContext = async () => {
      try {
        const [outfitsRes, calendarRes] = await Promise.all([
          supabase
            .from('outfits')
            .select('id, outfit_items(clothing_item_id)')
            .eq('user_id', user.id),
          (supabase as any)
            .from('calendar_outfits')
            .select('outfit_id')
            .eq('user_id', user.id),
        ]);

        if (!active) return;

        const outfitsRows = (outfitsRes.data as any[]) || [];

        // How many calendar entries exist per outfit_id
        const outfitWearCounts: Record<string, number> = {};
        ((calendarRes.data as any[]) || []).forEach((row) => {
          if (row.outfit_id) {
            outfitWearCounts[row.outfit_id] = (outfitWearCounts[row.outfit_id] || 0) + 1;
          }
        });

        const nextStats: Record<string, { wears: number; looks: number }> = {};
        outfitsRows.forEach((outfit) => {
          const wearIncrement = outfitWearCounts[outfit.id] || 0;
          const seenInOutfit = new Set<string>();
          (outfit.outfit_items || []).forEach((oi: any) => {
            const cid = oi.clothing_item_id;
            if (!cid) return;
            if (!nextStats[cid]) nextStats[cid] = { wears: 0, looks: 0 };
            if (!seenInOutfit.has(cid)) {
              nextStats[cid].looks += 1;
              seenInOutfit.add(cid);
            }
            nextStats[cid].wears += wearIncrement;
          });
        });

        setItemUsageStats(nextStats);
      } catch (err) {
        console.warn('[Closet] Failed loading garment usage stats:', err);
      }
    };

    loadClosetContext();
    return () => { active = false; };
  }, [user?.id, outfits.length]);

  // 🗄️ Dependency Checking Helpers for Safe Delete
  const checkItemUsage = async (ids: string[]) => {
    try {
      const { data, error } = await supabase
        .from('outfit_items')
        .select('clothing_item_id, outfit_id')
        .in('clothing_item_id', ids);

      if (error) throw error;

      // Group by item ID
      const usageMap: Record<string, number> = {};
      (data as any[])?.forEach(row => {
        usageMap[row.clothing_item_id] = (usageMap[row.clothing_item_id] || 0) + 1;
      });
      return usageMap;
    } catch (err) {
      console.error('Error checking item usage:', err);
      return {};
    }
  };

  const checkOutfitUsage = async (ids: string[]) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('outfit_id')
        .in('outfit_id', ids);

      if (error) throw error;

      const usageMap: Record<string, number> = {};
      (data as any[])?.forEach(row => {
        if (row.outfit_id) {
          usageMap[row.outfit_id] = (usageMap[row.outfit_id] || 0) + 1;
        }
      });
      return usageMap;
    } catch (err) {
      console.error('Error checking outfit usage:', err);
      return {};
    }
  };
  // More items per page on desktop for full scroll
  const OUTFITS_PER_PAGE = 16;

  const fetchOutfits = useCallback(async (isLoadMore = false) => {
    if (!user) return;

    if (isLoadMore) {
      setOutfitsLoadingMore(true);
    } else {
      setOutfits(prev => {
        if (prev.length === 0) {
          setOutfitsLoading(true);
        }
        return prev;
      });
    }

    const currentPage = isLoadMore ? outfitsPageRef.current + 1 : 0;
    const from = currentPage * OUTFITS_PER_PAGE;
    const to = from + OUTFITS_PER_PAGE - 1;

    try {
      const { data, error } = await supabase
        .from('outfits')
        .select(`
          *,
          posts (id),
          outfit_items (
            position_x,
            position_y,
            scale,
            rotation,
            layer_order,
            clothing_item:clothing_items (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Transform data to match Outfit type
      const formattedOutfits = (data || []).map((o: any) => ({
        ...o,
        createdAt: new Date(o.created_at),
        occasion: o.occasion,
        items: o.outfit_items.map((oi: any) => {
            const clothing = oi.clothing_item || oi.clothing_items;
            if (!clothing) return null;
            return {
                ...clothing,
                position_x: oi.position_x,
                position_y: oi.position_y,
                scale: oi.scale,
                rotation: oi.rotation,
                layer_order: oi.layer_order
            };
        }).filter(Boolean),
        style: o.occasion, // map occasion to style for UI
        date: new Date(o.created_at).toLocaleDateString(),
      }));

      if (isLoadMore) {
        setOutfits(prev => [...prev, ...formattedOutfits]);
      } else {
        setOutfits(formattedOutfits);
      }

      setOutfitsHasMore((data || []).length === OUTFITS_PER_PAGE);
      outfitsPageRef.current = currentPage;

    } catch (err) {
      console.error('Error fetching outfits:', err);
    } finally {
      if (mountedRef.current) {
        setOutfitsLoading(false);
        setOutfitsLoadingMore(false);
      }
    }
  }, [user]);

  const loadMoreOutfits = useCallback(() => {
    if (outfitsLoading || outfitsLoadingMore || !outfitsHasMore) return;
    fetchOutfits(true);
  }, [outfitsLoading, outfitsLoadingMore, outfitsHasMore, fetchOutfits]);

  // Infinite Scroll Observers
  const itemsObserverElement = useRef<HTMLDivElement | null>(null);
  const outfitsObserverElement = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (activeTab === 'items' && hasMore && !loadingMore) {
            loadMore();
          } else if (activeTab === 'outfits' && outfitsHasMore && !outfitsLoadingMore) {
            loadMoreOutfits();
          }
        }
      },
      { threshold: 0.1 }
    );

    if (activeTab === 'items' && itemsObserverElement.current) observer.observe(itemsObserverElement.current);
    if (activeTab === 'outfits' && outfitsObserverElement.current) observer.observe(outfitsObserverElement.current);

    return () => observer.disconnect();
  }, [activeTab, hasMore, loadingMore, outfitsHasMore, outfitsLoadingMore, loadMore, loadMoreOutfits]);

  // Fetch Outfits - fetch when user is available
  useEffect(() => {
    mountedRef.current = true;
    if (user && activeTab === 'outfits') {
      fetchOutfits(false);
    }
    return () => { mountedRef.current = false; };
  }, [user, activeTab, fetchOutfits]);

  // Sync favorites from items
  useEffect(() => {
    if (items) {
      const favIds = items.filter((i) => i.favorite).map(i => i.id);
      setFavorites(new Set(favIds));
    }
  }, [items]);

  // REDIRECT TO ONBOARDING if style profile is missing
  // Removed faulty user.styleCompleted redirect that caused blank screens on client-side routing


  const [shareOutfit, setShareOutfit] = useState<any | null>(null); // State for sharing outfit

  const handleFavoriteToggle = async (id: string) => {
    const isFav = favorites.has(id);
    const newFavStatus = !isFav;

    try {
      haptics.tap();
    } catch {}

    if (newFavStatus) {
      setRecentlyFavoritedId(id);
      setTimeout(() => {
        setRecentlyFavoritedId((prev) => (prev === id ? null : prev));
      }, 650);
    }

    // Optimistic update
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (isFav) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });

    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, favorite: newFavStatus } : null);
    }

    try {
      await updateItem(id, { favorite: newFavStatus });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (isFav) {
          newFavorites.add(id);
        } else {
          newFavorites.delete(id);
        }
        return newFavorites;
      });
    }
  };

  const toggleOutfitFavorite = useCallback(async (outfitToToggle: any, currentFav: boolean) => {
    const id = outfitToToggle.id || outfitToToggle; // Support both for backwards compatibility
    try {
      const newFavStatus = !currentFav;
      
      // Optimistic update
      setOutfits(prev => prev.map(o => o.id === id ? { ...o, favorite: newFavStatus } : o));
      setSelectedOutfit(prev => prev && prev.id === id ? { ...prev, favorite: newFavStatus } : prev);
      
      // Update DB
      const { error } = await (supabase.from('outfits') as any)
        .update({ favorite: newFavStatus })
        .eq('id', id);

      if (error) {
        // Revert on error
        setOutfits(prev => prev.map(o => o.id === id ? { ...o, favorite: currentFav } : o));
        setSelectedOutfit(prev => prev && prev.id === id ? { ...prev, favorite: currentFav } : prev);
        console.error('Error toggling outfit favorite:', error);
      }
    } catch (err) {
      console.error('Unexpected error toggling outfit favorite:', err);
    }
  }, [supabase]);

  const toggleOutfitVisibility = useCallback(async (outfitToToggle: any) => {
    try {
      const newVisibility = !outfitToToggle.is_public;
      
      // Optimistic update
      setOutfits(prev => prev.map(o => o.id === outfitToToggle.id ? { ...o, is_public: newVisibility } : o));
      setSelectedOutfit(prev => prev && prev.id === outfitToToggle.id ? { ...prev, is_public: newVisibility } : prev);
      
      // Update DB
      const { error } = await supabase
        .from('outfits')
        .update({ is_public: newVisibility })
        .eq('id', outfitToToggle.id);

      if (error) {
        // Revert on error
        setOutfits(prev => prev.map(o => o.id === outfitToToggle.id ? { ...o, is_public: outfitToToggle.is_public } : o));
        setSelectedOutfit(prev => prev && prev.id === outfitToToggle.id ? { ...prev, is_public: outfitToToggle.is_public } : prev);
        console.error('Error toggling outfit visibility:', error);
      }
    } catch (err) {
      console.error('Unexpected error toggling outfit visibility:', err);
    }
  }, [supabase]);

  const handleOutfitClick = useCallback((outfit: any) => {
    setSelectedOutfit(outfit);
  }, []);

  const handleOutfitEdit = useCallback((outfit: any) => {
    router.push(`/create?outfitId=${outfit.id}`);
  }, [router]);

  const handleOutfitShare = useCallback((outfit: any) => {
    router.push(`/create-post?outfitId=${outfit.id}`);
  }, [router]);

  const handleOutfitDelete = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('outfits').delete().eq('id', id);
      if (error) throw error;
      setOutfits(prev => prev.filter(o => o.id !== id));
      toast.success('El outfit se ha eliminado de tu armario.');
    } catch (err) {
      console.error('Error deleting outfit:', err);
      toast.error('Error al eliminar el outfit');
    }
  }, [supabase]);

  const handleEditItem = (id: string) => {
    const itemToEdit = items.find(i => i.id === id);
    if (itemToEdit) {
      setSelectedItem(null); // Close the product modal first
      setEditingItem(itemToEdit);
      setShowAddModal(true);
    }
  };

  // Store for system messages
  const { showModal } = useUiStore();

  const handleDeleteItem = async (id: string) => {
    // Buscar el item para obtener el nombre
    const itemToDelete = items.find(i => i.id === id);
    const itemName = itemToDelete ? itemToDelete.name : t.closet.thisItem;

    const success = await deleteItem(id);

    if (success) {
      // Limpiar de favoritos si estaba
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        newFavorites.delete(id);
        return newFavorites;
      });

      showModal({
        title: t.closet.itemDeleted,
        message: t.closet.itemDeletedMessage,
        type: 'success',
        confirmText: t.closet.understood
      });
    } else {
      showModal({
        title: t.closet.error,
        message: t.closet.deleteError,
        type: 'error',
        confirmText: t.closet.close
      });
    }
  };

  const handleItemClick = (item: ClothingItemType) => {
    setSelectedItem(item);
  };




  // Filter content based on active tab
  const filteredContent = activeTab === 'items'
    ? (items || []).filter(item => {
      const q = searchQuery.toLowerCase();
      const seasonStr = Array.isArray(item.season) ? item.season.join(' ') : (item.season || '');
      const matchesSearch = item.name.toLowerCase().includes(q) ||
        (item.brand || '').toLowerCase().includes(q) ||
        seasonStr.toLowerCase().includes(q);
      const matchesType = selectedCategories.size === 0 || selectedCategories.has(item.category);
      const matchesFavorites = !showFavoritesOnly || favorites.has(item.id);
      return matchesSearch && matchesType && matchesFavorites;
    })
    : (outfits || []).filter(outfit => {
      const q = searchQuery.toLowerCase();
      const seasonStr = Array.isArray(outfit.season) ? outfit.season.join(' ') : (outfit.season || '');
      
      const outfitMatches = outfit.name.toLowerCase().includes(q) || 
                            (outfit.occasion || outfit.style || '').toLowerCase().includes(q) ||
                            seasonStr.toLowerCase().includes(q);
      
      const itemsMatch = outfit.items?.some((item: any) => {
        const itemSeasonStr = Array.isArray(item.season) ? item.season.join(' ') : (item.season || '');
        return (item.name || '').toLowerCase().includes(q) ||
               (item.brand || '').toLowerCase().includes(q) ||
               (item.category || '').toLowerCase().includes(q) ||
               itemSeasonStr.toLowerCase().includes(q);
      });

      const matchesSearch = outfitMatches || itemsMatch;
      const matchesFavorites = !showFavoritesOnly || outfit.favorite;
      return matchesSearch && matchesFavorites;
    });

  const categories = [
    'top',
    'shirt',
    'sweater',
    'hoodie',
    'jacket',
    'outerwear',
    'bottom',
    'shorts',
    'skirt',
    'dress',
    'shoes',
    'bag',
    'accessory',
    'other',
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Active filter badge count
  const activeFilterCount = useMemo(
    () => (searchQuery ? 1 : 0) + selectedCategories.size + (showFavoritesOnly ? 1 : 0),
    [searchQuery, selectedCategories, showFavoritesOnly]
  );

  const colorMap: Record<string, string> = {
    white: '#FFFFFF',
    black: '#000000',
    gray: '#9CA3AF',
    beige: '#F5F5DC',
    brown: '#8B4513',
    blue: '#3B82F6',
    red: '#EF4444',
    green: '#10B981',
    pink: '#FF66C4',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    orange: '#FB923C',
    // ... add more if needed
  };



  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  const getViewIcon = () => {
    return viewMode === 'grid' ? <Grid3x3 className="w-5 h-5 text-[var(--foreground)]" /> :
      <List className="w-5 h-5 text-[var(--foreground)]" />;
  };

  const { setTabBarHidden } = useUiStore();

  // Handle mobile-only navbar hiding (Standardized for all detail modals)
  useEffect(() => {
    const handleResize = () => {
      const hasModalOpen = !!selectedItem || !!selectedOutfit || showAddModal || showFilters;
      setTabBarHidden(hasModalOpen);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      setTabBarHidden(false);
    };
  }, [selectedItem, selectedOutfit, showAddModal, showFilters, setTabBarHidden]);

  return (
    <>
      <motion.div
        className="min-h-screen bg-[var(--background)] pb-24 md:pb-8 relative overflow-hidden touch-pan-y"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >

      {/* Header Sticky (sin ralla divisoria horizontal) */}
      <header className="sticky top-0 z-40 apple-glass-bar !border-b-0 pb-2 pt-safe">
        <div className="max-w-7xl mx-auto px-4 pt-4 space-y-5">

          {/* Kloe Hero Action Banner */}
          <div className="w-full relative z-0">
            <KloeHeroBanner />
          </div>

          {/* Progress / Tutorial Bar (disappears permanently at 100%) */}
          <ProfileProgressBar />

          {/* Clear Labeled Top Tabs without giant dividing line */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                try { haptics.selection(); } catch {}
                setActiveTab('items');
              }}
              className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-full transition-all gap-1.5 cursor-pointer ${activeTab === 'items'
                ? 'bg-[var(--brand-pink)]/12 text-[var(--brand-pink)] font-semibold'
                : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)]/60 font-medium'
                }`}
            >
              <Shirt className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'items' ? 'text-[var(--brand-pink)]' : ''}`} />
              <span className="text-[13px] sm:text-sm">Prendas</span>
            </button>
            <button
              onClick={() => {
                try { haptics.selection(); } catch {}
                setActiveTab('outfits');
              }}
              className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-full transition-all gap-1.5 cursor-pointer ${activeTab === 'outfits'
                ? 'bg-[var(--brand-pink)]/12 text-[var(--brand-pink)] font-semibold'
                : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)]/60 font-medium'
                }`}
            >
              <Layers className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'outfits' ? 'text-[var(--brand-pink)]' : ''}`} />
              <span className="text-[13px] sm:text-sm">Outfits</span>
            </button>
            <button
              onClick={() => {
                try { haptics.selection(); } catch {}
                setActiveTab('calendar');
              }}
              className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-full transition-all gap-1.5 cursor-pointer ${activeTab === 'calendar'
                ? 'bg-[var(--brand-pink)]/12 text-[var(--brand-pink)] font-semibold'
                : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)]/60 font-medium'
                }`}
            >
              <CalendarDays className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'calendar' ? 'text-[var(--brand-pink)]' : ''}`} />
              <span className="text-[13px] sm:text-sm">Calendario</span>
            </button>
          </div>

        </div>
      </header>


      {/* Main Content */}




      <main className="max-w-7xl mx-auto pt-4 pb-4 relative">

        {/* Spacer removed because header is in flow now */}

        {/* TABS CONTENT */}
        <AnimatePresence mode="wait">
          {activeTab === 'items' ? (
            <motion.div
              key="items"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <SkeletonCloset count={viewMode === 'grid' ? 6 : 4} />
              ) : (!items || items.length === 0) ? (
                <EmptyState
                  icon={Shirt}
                  mascotMood="curious"
                  title="Tu armario está vacío"
                  description="Haz fotos a tus prendas o sube capturas de tiendas. Recortamos el fondo y quedan listas así."
                  actionLabel="Subir prendas"
                  actionIcon={Camera}
                  actionOnClick={() => setShowAddModal(true)}
                  fullHeight={false}
                  previewSlot={
                    <div className="flex items-center justify-center gap-4">
                      <KloeMascot
                        mood="curious"
                        size="xl"
                        variant="pink"
                        interactive
                        className="drop-shadow-[0_8px_18px_rgba(255,102,196,0.34)] -rotate-[4deg]"
                      />
                      <div className="w-28 rounded-[20px] bg-white border border-black/[0.06] shadow-[0_12px_28px_-8px_rgba(0,0,0,0.16)] p-2.5 flex flex-col items-center gap-1.5 rotate-[4deg]">
                        <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
                          <img
                            src="/landing/piezas/jersey-rayas-hombre.png"
                            alt="Ejemplo de prenda en Klozet"
                            className="w-full h-full object-contain scale-95"
                          />
                        </div>
                        <div className="w-full pt-1 border-t border-black/[0.05] text-left">
                          <p className="text-[11px] font-semibold text-zinc-900 truncate leading-tight">
                            Jersey rayas
                          </p>
                          <p className="text-[10px] font-medium text-zinc-500 truncate">
                            Ejemplo · Top
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                />
              ) : (filteredContent as ClothingItemType[]).length === 0 ? (
                <EmptyState
                  icon={Search}
                  mascotMood="curious"
                  title="Nada por aquí"
                  description="Prueba cambiando la búsqueda o quitando alguno de los filtros."
                  fullHeight={false}
                />
              ) : (
                <div className={`px-4 ${viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4'
                  : 'space-y-3' // List View
                  }`}>
                  {(filteredContent as ClothingItemType[]).map((item) => {
                    const stats = itemUsageStats[item.id] || { wears: 0, looks: 0 };
                    const isJustAdded = recentlyAddedId === item.id;
                    const isJustFav = recentlyFavoritedId === item.id;
                    const usageContext = stats.wears > 0
                      ? `${stats.wears} ${stats.wears === 1 ? 'uso' : 'usos'}`
                      : stats.looks > 0
                      ? `${stats.looks} ${stats.looks === 1 ? 'look' : 'looks'}`
                      : 'Sin estrenar';
                    const contextLabel = item.brand
                      ? `${item.brand} · ${usageContext}`
                      : usageContext;

                    return (
                    <div key={item.id} className={viewMode === 'grid' ? '' : 'flex items-center gap-2'}>
                      {viewMode === 'list' ? (
                        <>
                          <div onClick={() => setSelectedItem(item)} className="flex-1">
                            <div className="flex items-center gap-4 kz-surface-card p-3 cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                              <div className="w-16 h-16 rounded-[14px] bg-white relative overflow-hidden flex-shrink-0 border border-black/[0.05]">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain scale-[0.85]" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[var(--foreground-tertiary)]">
                                    <span className="text-xs">No img</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-[15px] text-[var(--foreground)] truncate">{item.name}</h3>
                                <p className="kz-caption text-[var(--foreground-secondary)] truncate">{contextLabel}</p>
                              </div>
                            </div>
                          </div>
                          {/* Delete button - hidden on mobile */}
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 rounded-full hover:bg-red-100 text-[var(--foreground-tertiary)] hover:text-red-500 transition-colors hidden md:block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <motion.div
                          initial={isJustAdded ? { scale: 0.72, opacity: 0, y: 16 } : false}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          whileHover={{ y: -3 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                          className="relative"
                          onTouchStart={() => handleTouchStart(item.id)}
                          onTouchMove={handleTouchEnd}
                          onTouchEnd={handleTouchEnd}
                          onTouchCancel={handleTouchEnd}
                        >
                          <Card
                            key={item.id}
                            variant="default"
                            className={`group relative overflow-hidden rounded-[20px] kz-surface-card hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 cursor-pointer flex flex-col ${
                              selectionMode && selectedIds.has(item.id)
                                ? 'ring-4 ring-[var(--brand-pink)] ring-inset'
                                : isJustAdded
                                ? 'ring-2 ring-[var(--brand-pink)]'
                                : ''
                            }`}
                            onClick={() => {
                              if (selectionMode) {
                                toggleSelection(item.id);
                              } else {
                                setSelectedItem(item);
                              }
                            }}
                          >
                            {/* Selection Checkmark & Overlay */}
                            {selectionMode && selectedIds.has(item.id) && (
                              <>
                                <div className="absolute inset-0 z-[25] bg-[var(--brand-pink)]/20 pointer-events-none transition-opacity" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-[var(--brand-pink)] rounded-full p-3 text-white shadow-xl shadow-[var(--brand-pink)]/30 backdrop-blur-sm pointer-events-none">
                                  <Check className="w-8 h-8" strokeWidth={3} />
                                </div>
                              </>
                            )}

                            <div className="relative aspect-[3/4] overflow-hidden bg-white dark:bg-zinc-900/50">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-contain scale-[0.86] group-hover:scale-[0.9] transition-transform duration-300"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--foreground-tertiary)]">
                                  <span className="text-xs">Sin imagen</span>
                                </div>
                              )}

                              {/* Favorite Button Overlay with celebratory bounce */}
                              <motion.button
                                whileTap={{ scale: 0.78 }}
                                whileHover={{ scale: 1.15 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFavoriteToggle(item.id);
                                }}
                                aria-label={item.favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                                className="absolute top-2 right-2 p-1.5 z-20 bg-transparent focus:outline-none cursor-pointer"
                              >
                                <motion.div
                                  animate={isJustFav ? { scale: [1, 1.45, 0.9, 1.1, 1] } : { scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                                >
                                  <Heart className={`w-[18px] h-[18px] transition-colors duration-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)] ${item.favorite ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'fill-none text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`} />
                                </motion.div>
                              </motion.button>

                              {/* Delete Button - Desktop hover */}
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(item.id);
                                }}
                                className="absolute top-2.5 left-2.5 p-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-red-500 transition-colors hidden md:block md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>
                          </Card>
                        </motion.div>
                      )}
                    </div>
                  );
                  })}
                  {/* Infinite Scroll Trigger - Items */}
                  {items.length > 0 && !loading && (
                    <div ref={itemsObserverElement} className="h-10 w-full flex items-center justify-center pt-4">
                      {loadingMore && <div className="animate-spin w-6 h-6 border-2 border-[var(--brand-pink)] border-t-transparent flex-shrink-0 animate-spin transition-colors rounded-full" />}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'outfits' ? (
            <motion.div
              key="outfits"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {outfitsLoading ? (
                <div className={`px-4 ${viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4'
                  : 'space-y-4'
                  }`}>
                  {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} height={220} withContext />
                  ))}
                </div>
              ) : (!outfits || outfits.length === 0 || (filteredContent as Outfit[]).length === 0) ? (
                <EmptyState
                  icon={Layers}
                  mascotMood="happy"
                  title={(!outfits || outfits.length === 0) ? 'Crea tu primer outfit' : 'No hay resultados'}
                  description={(!outfits || outfits.length === 0) ? 'Combina prendas de tu armario en el lienzo y guarda tus looks favoritos.' : 'Prueba con otra búsqueda.'}
                  actionLabel={(!outfits || outfits.length === 0) ? 'Crear primer outfit' : 'Crear outfit'}
                  actionIcon={Plus}
                  actionOnClick={() => {
                    if (!items || items.length === 0) {
                      toast.error('Añade prendas a tu armario antes de crear outfits');
                    } else {
                      router.push('/create');
                    }
                  }}
                  fullHeight={false}
                  previewSlot={(!outfits || outfits.length === 0) ? (
                    <div className="flex items-center justify-center gap-4">
                      <KloeMascot
                        mood="happy"
                        size="xl"
                        variant="pink"
                        interactive
                        className="drop-shadow-[0_8px_18px_rgba(255,102,196,0.34)] -rotate-[4deg]"
                      />
                      <div className="w-32 rounded-[20px] bg-white border border-black/[0.06] shadow-[0_12px_28px_-8px_rgba(0,0,0,0.16)] p-2.5 rotate-[3deg]">
                        <div className="w-full aspect-[4/5] relative flex flex-col items-center justify-between py-1">
                          <img
                            src="/landing/piezas/chaqueta-militar.png"
                            alt="Chaqueta ejemplo"
                            className="w-16 h-12 object-contain"
                          />
                          <div className="flex items-center justify-center gap-1 -mt-1">
                            <img
                              src="/landing/piezas/jeans-wide-mujer.png"
                              alt="Jeans ejemplo"
                              className="w-14 h-16 object-contain"
                            />
                            <img
                              src="/landing/piezas/bolso-ante-beige.png"
                              alt="Bolso ejemplo"
                              className="w-9 h-9 object-contain -ml-2"
                            />
                          </div>
                          <img
                            src="/landing/piezas/zapatillas-margiela.png"
                            alt="Zapatillas ejemplo"
                            className="w-14 h-9 object-contain -mt-1"
                          />
                        </div>
                        <div className="w-full pt-1 mt-1 border-t border-black/[0.05] text-left">
                          <p className="text-[11px] font-semibold text-zinc-900 truncate leading-tight">
                            Look diario
                          </p>
                          <p className="text-[10px] font-medium text-zinc-500 truncate">
                            Ejemplo · 4 prendas
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : undefined}
                />
              ) : (
                <div className={`px-4 ${viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4'
                  : 'space-y-4' // List for outfits
                  }`}>
                  {(filteredContent as Outfit[]).map((outfit) => (
                    <div
                      key={outfit.id}
                      className="relative rounded-[20px]"
                      onTouchStart={() => handleTouchStart(outfit.id)}
                      onTouchMove={handleTouchEnd}
                      onTouchEnd={handleTouchEnd}
                      onTouchCancel={handleTouchEnd}
                    >
                      {/* Interceptor overlay during multi-select mode */}
                      {selectionMode && (
                        <div
                          className="absolute inset-0 z-40 rounded-[20px] cursor-pointer"
                          onClick={() => toggleSelection(outfit.id)}
                        />
                      )}
                      <OutfitCard
                        outfit={outfit}
                        index={0}
                        selectionMode={selectionMode}
                        isSelected={selectionMode && selectedIds.has(outfit.id)}
                        onClick={handleOutfitClick}
                        onEdit={handleOutfitEdit}
                        onShare={handleOutfitShare}
                        onDelete={handleOutfitDelete}
                        onToggleFavorite={toggleOutfitFavorite}
                        onToggleVisibility={toggleOutfitVisibility}
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <OutfitCalendar />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FAB stack: Filter + Add — always stacked, fully responsive */}
      {!showAddModal && !selectedItem && !selectedOutfit && (
        <div className={`fixed right-6 z-[4990] flex flex-col items-end gap-3 transition-all duration-300 ${
          selectionMode 
            ? 'bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom,0px)+108px)]' 
            : 'bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom,0px)+36px)]'
        } md:bottom-[42px]`}>
          {/* Desktop Select Button */}
          {activeTab !== 'calendar' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (selectionMode) {
                  setSelectionMode(false);
                  setSelectedIds(new Set());
                } else {
                  setSelectionMode(true);
                }
              }}
              className={`h-12 px-5 rounded-full hidden md:flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                selectionMode
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-md'
                  : 'bg-[var(--brand-pink)] text-white shadow-[var(--brand-pink)]/35 hover:shadow-[0_0_22px_rgba(255,102,196,0.5)]'
              }`}
              aria-label={selectionMode ? 'Cancelar selección' : 'Seleccionar prendas'}
            >
              <Check className="w-5 h-5 text-white flex-shrink-0" strokeWidth={2.5} />
              <span className="text-sm font-bold whitespace-nowrap">
                {selectionMode ? 'Cancelar' : 'Seleccionar'}
              </span>
            </motion.button>
          )}

          {/* Search / Filter Button */}
          {activeTab !== 'calendar' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowFilters(prev => !prev)}
              className="h-12 min-w-[48px] px-0 md:px-5 rounded-full bg-[var(--brand-pink)] flex items-center justify-center gap-2 text-white shadow-lg shadow-[var(--brand-pink)]/35 hover:shadow-[0_0_22px_rgba(255,102,196,0.5)] transition-all cursor-pointer relative"
              aria-label="Buscar y filtrar"
            >
              <Search className="w-5 h-5 flex-shrink-0" strokeWidth={2.4} />
              <span className="hidden md:block text-sm font-bold whitespace-nowrap pr-0.5">
                Filtrar
              </span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[10px] font-bold flex items-center justify-center border-2 border-[var(--background)] shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </motion.button>
          )}

          {/* Action Button: Nueva Prenda / Nuevo Outfit / Añadir outfit para hoy (Oculto al abrir filtros) */}
          <AnimatePresence>
            {!showFilters && (
              <motion.button
                key="fab-add-btn"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (activeTab === 'items') {
                    setShowAddModal(true);
                  } else if (activeTab === 'outfits') {
                    router.push('/create');
                  } else if (activeTab === 'calendar') {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('klozet:calendar_add_today'));
                    }
                  }
                }}
                className="h-12 min-w-[48px] px-0 md:px-5 rounded-full bg-[var(--brand-pink)] flex items-center justify-center gap-2 text-white shadow-lg shadow-[var(--brand-pink)]/35 hover:shadow-[0_0_22px_rgba(255,102,196,0.5)] transition-all cursor-pointer group"
                aria-label={activeTab === 'items' ? 'Nueva Prenda' : activeTab === 'outfits' ? 'Nuevo Outfit' : 'Añadir outfit para hoy'}
              >
                <Plus className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                <span className="hidden md:block text-sm font-bold whitespace-nowrap pr-0.5">
                  {activeTab === 'items' ? 'Nueva Prenda' : activeTab === 'outfits' ? 'Nuevo Outfit' : 'Añadir outfit para hoy'}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Centered Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
                <div className="flex items-center gap-2.5">
                  <Filter className="w-5 h-5 text-[var(--brand-pink)]" />
                  <h3 className="font-bold text-base text-[var(--foreground)]">Filtros de Armario</h3>
                </div>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategories(new Set());
                        setShowFavoritesOnly(false);
                      }}
                      className="text-xs font-semibold text-[var(--brand-pink)] hover:underline cursor-pointer"
                    >
                      Limpiar todo
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1.5 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    aria-label="Cerrar filtros"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                <input
                  type="text"
                  placeholder={`Buscar ${activeTab === 'items' ? 'prendas' : 'outfits'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--background-secondary)] border border-[var(--border-color)] focus:border-[var(--brand-pink)] rounded-2xl py-2.5 pl-10 pr-10 text-xs sm:text-sm outline-none text-[var(--foreground)]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Categories (Only for Items tab) */}
              {activeTab === 'items' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">
                      Categoría
                    </p>
                    {selectedCategories.size > 0 && (
                      <button
                        onClick={() => setSelectedCategories(new Set())}
                        className="text-[11px] text-[var(--brand-pink)] font-semibold hover:underline cursor-pointer"
                      >
                        Restablecer
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all duration-200 cursor-pointer ${
                          selectedCategories.has(category)
                            ? 'bg-[var(--brand-pink)] text-white shadow-xs font-bold'
                            : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:border-[var(--brand-pink)]/40 border border-[var(--border-color)]'
                        }`}
                      >
                        {selectedCategories.has(category) && <span className="mr-1">✓</span>}
                        {t.itemTypes?.[category as keyof typeof t.itemTypes] || category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites Toggle */}
              <div className="mb-5">
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    showFavoritesOnly
                      ? 'bg-[var(--brand-pink)]/10 border-[var(--brand-pink)] text-[var(--brand-pink)] font-bold'
                      : 'bg-[var(--background-secondary)] border-[var(--border-color)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current text-[var(--brand-pink)]' : ''}`} />
                  <span className="text-xs sm:text-sm font-semibold">Solo prendas favoritas</span>
                  {showFavoritesOnly && <span className="ml-auto font-bold text-xs">✓ Activo</span>}
                </button>
              </div>

              {/* Apply CTA Button */}
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-3 rounded-2xl bg-[var(--brand-pink)] hover:bg-[#ff3377] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Ver {filteredContent.length} {activeTab === 'items' ? 'prenda' : 'outfit'}{filteredContent.length === 1 ? '' : 's'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Share/Post Modal */}
      <AnimatePresence>
        {shareOutfit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShareOutfit(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--card-bg)] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[var(--border-color)]"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-[var(--brand-pink)]" />
              </div>
              <h3 className="text-xl font-bold text-center text-[var(--foreground)] mb-2">
                Crear Publicación
              </h3>
              <p className="text-center text-[var(--foreground-secondary)] mb-6">
                ¿Quieres crear una nueva publicación con el outfit <span className="font-bold text-[var(--foreground)]">"{shareOutfit.name}"</span>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShareOutfit(null)}
                  className="flex-1 py-3 rounded-xl font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    router.push(`/create-post?outfitId=${shareOutfit.id}`);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold bg-[var(--foreground)] text-[var(--background)] shadow-lg hover:opacity-90 transition-opacity"
                >
                  Crear Post
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Delete Pill for Bulk Action */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom,0px)+20px)] md:bottom-8 left-3 right-3 md:left-[calc(72px+16px)] md:right-4 z-[4995] flex justify-center pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md bg-[var(--card-bg)]/95 dark:bg-[#16161b]/95 backdrop-blur-2xl border border-[var(--border-color)] rounded-full shadow-2xl flex items-center justify-between gap-2 px-3 py-1.5 sm:px-4 sm:py-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)] whitespace-nowrap">
                  {selectedIds.size}{' '}
                  <span className="hidden sm:inline">seleccionados</span>
                  <span className="sm:hidden">selec.</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const allVisibleIds = filteredContent.map(i => i.id);
                    if (selectedIds.size === allVisibleIds.length) {
                      setSelectedIds(new Set());
                    } else {
                      setSelectedIds(new Set(allVisibleIds));
                    }
                  }}
                  className="text-xs text-[var(--brand-pink)] font-bold hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span className="hidden sm:inline">
                    {selectedIds.size === filteredContent.length ? 'Desmarcar todo' : 'Seleccionar todo'}
                  </span>
                  <span className="sm:hidden">
                    {selectedIds.size === filteredContent.length ? 'Ninguno' : 'Todos'}
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    if (selectedIds.size === 0) return;

                    try {
                      const idsArray = Array.from(selectedIds);
                      if (activeTab === 'items') {
                        const results = await Promise.all(idsArray.map(id => deleteItem(id)));
                        const failures = results.filter(r => !r).length;

                        if (failures > 0) {
                          console.warn(`Falló la eliminación de ${failures} prendas.`);
                        }
                        refresh();
                      } else {
                        const { error: unlinkError } = await supabase
                          .from('posts')
                          .update({ outfit_id: null })
                          .in('outfit_id', idsArray);

                        if (unlinkError) {
                          console.warn('Advertencia al desvincular posts:', unlinkError);
                        }

                        const { error: itemsError } = await supabase
                          .from('outfit_items')
                          .delete()
                          .in('outfit_id', idsArray);

                        if (itemsError) {
                          console.warn('Advertencia al borrar items de outfits:', itemsError);
                        }

                        const { error } = await supabase.from('outfits').delete().in('id', idsArray);
                        if (error) throw error;

                        setOutfits(prev => prev.filter(o => !selectedIds.has(o.id)));
                        fetchOutfits(false);
                      }

                      setSelectionMode(false);
                      setSelectedIds(new Set());
                    } catch (err: any) {
                      console.error('Error in bulk delete:', err);
                    }
                  }}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${selectedIds.size > 0 ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[var(--background-secondary)] text-[var(--foreground-tertiary)] cursor-not-allowed'}`}
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }}
                  aria-label="Cancelar selección"
                  className="p-1.5 sm:p-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] bg-[var(--background-secondary)] rounded-full shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>

      {/* Modals — moved outside draggable container to fix fixed positioning */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        initialData={editingItem || undefined}
        isEditing={!!editingItem}
        onAdd={async (partial) => {
          if (editingItem && editingItem.id) {
            await updateItem(editingItem.id, partial as any);
          } else {
            const created = await addItem(partial as any);
            if (created?.id) {
              try { haptics.success(); } catch {}
              setRecentlyAddedId(created.id);
              setTimeout(() => {
                setRecentlyAddedId((prev) => (prev === created.id ? null : prev));
              }, 2600);
            }
          }
          setEditingItem(null); // Reset after save
        }}
      />

      <ProductModal
        item={selectedItem ? {
          ...selectedItem,
          type: selectedItem.category,
          source: 'Closet',
          trending: false,
          matchScore: 0,
          imageUrl: selectedItem.imageUrl || '',
        } as any : null}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        isFavorite={selectedItem ? favorites.has(selectedItem.id) : false}
        onFavoriteToggle={handleFavoriteToggle}
        onEdit={handleEditItem}
        onDelete={async (id: string) => {
          await deleteItem(id);
          setSelectedItem(null);
        }}
      />

      <OutfitDetailModal
        isOpen={!!selectedOutfit}
        onClose={() => setSelectedOutfit(null)}
        // @ts-ignore
        outfit={selectedOutfit}
        onToggleFavorite={toggleOutfitFavorite}
        onToggleVisibility={(outfit) => toggleOutfitVisibility(outfit)}
        onDelete={async (id) => {
          await supabase.from('outfit_items').delete().eq('outfit_id', id);
          const { error } = await supabase.from('outfits').delete().eq('id', id);
          if (error) {
            console.error('Error deleting outfit:', error);
            return;
          }
          setOutfits(prev => prev.filter(o => o.id !== id));
          setSelectedOutfit(null);
        }}
      />

      <KloeProModal
        isOpen={showKloeProModal}
        onClose={() => setShowKloeProModal(false)}
      />
    </>
  );
}
