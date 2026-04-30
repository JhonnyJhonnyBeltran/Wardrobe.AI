'use client';

/**
 * Closet - Your Wardrobe (Mobile Optimized)
 * Search expands, buttons icon-only on mobile
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import {
  Heart, Grid3x3, List, Search, Filter, Plus, Wand2, X, Shirt, Layers, Share2, Trash2, Check
} from 'lucide-react';
import { Card, Button, ClothingItem, LogoMark } from '@/components';
import AddItemModal from '@/components/AddItemModal';
import ProductModal from '@/components/ProductModal';
import BubbleToggle from '@/components/BubbleToggle';
import OutfitCard from '@/components/OutfitCard';
import { OutfitDetailModal } from '@/components/OutfitDetailModal';
import type { Outfit } from '@/types/outfit';
import type { ClothingItem as ClothingItemType } from '@/types/clothing';
import { useUser } from '@/store';
import { useUiStore } from '@/store/uiStore';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { useBodyScrollLock } from '@/lib/hooks';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

export default function ClosetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPremium, user, setUser, isLoading } = useUser();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridCols, setGridCols] = useState(2);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItemType | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

  // Auto-hide Header State
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If pulled past top (iOS bounce) or at very top, show header
      if (currentScrollY <= 0) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current + 5) {
        // Scrolling down
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        // Scrolling up
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-open Add Item Modal or switch Tab based on query param
  useEffect(() => {
    const action = searchParams.get('action');
    const tab = searchParams.get('tab');

    if (action === 'new-item') {
      setShowAddModal(true);
      // Clean up the URL
      router.replace('/closet', { scroll: false });
    } else if (tab === 'outfits') {
      setActiveTab('outfits');
      // Clean up the URL
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
  const [activeTab, setActiveTab] = useState<'items' | 'outfits'>('items');

  useSwipeNavigation({
    onSwipeRight: () => {
      // Swipe Right -> Goes "Back" geographically -> Search
      router.push('/search');
    },
    onSwipeLeft: () => {
      // Swipe Left -> Goes "Forward" geographically -> Outfits or Notifications
      if (activeTab === 'items') {
        setActiveTab('outfits');
      } else {
        router.push('/notifications');
      }
    }
  });

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
      setOutfitsLoading(true);
    }

    const currentPage = isLoadMore ? outfitsPageRef.current + 1 : 0;
    const from = currentPage * OUTFITS_PER_PAGE;
    const to = from + OUTFITS_PER_PAGE - 1;

    try {
      const { data, error } = await supabase
        .from('outfits')
        .select(`
          *,
          outfit_items (
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
        items: o.outfit_items.map((oi: any) => oi.clothing_item).filter(Boolean),
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

  const toggleOutfitFavorite = async (id: string, currentFav: boolean) => {
    try {
      const newFavStatus = !currentFav;
      
      // Optimistic update
      setOutfits(prev => prev.map(o => o.id === id ? { ...o, favorite: newFavStatus } : o));
      
      // Update DB
      const { error } = await (supabase.from('outfits') as any)
        .update({ favorite: newFavStatus })
        .eq('id', id);

      if (error) {
        // Revert on error
        setOutfits(prev => prev.map(o => o.id === id ? { ...o, favorite: currentFav } : o));
        console.error('Error toggling outfit favorite:', error);
      }
    } catch (err) {
      console.error('Unexpected error toggling outfit favorite:', err);
    }
  };

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

  const handleDeleteItem = (id: string) => {
    // Buscar el item para obtener el nombre
    const itemToDelete = items.find(i => i.id === id);
    const itemName = itemToDelete ? itemToDelete.name : t.closet.thisItem;

    showModal({
      title: t.closet.deleteConfirm,
      message: `${t.closet.deleteMessage.replace('{name}', itemName)}`,
      type: 'confirm',
      confirmText: t.closet.delete,
      cancelText: t.closet.cancel,
      onConfirm: async () => {
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
      }
    });
  };

  const handleItemClick = (item: ClothingItemType) => {
    setSelectedItem(item);
  };




  // Filter content based on active tab
  const filteredContent = activeTab === 'items'
    ? (items || []).filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedCategories.size === 0 || selectedCategories.has(item.category);
      const matchesFavorites = !showFavoritesOnly || favorites.has(item.id);
      return matchesSearch && matchesType && matchesFavorites;
    })
    : (outfits || []).filter(outfit => {
      const matchesSearch = outfit.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFavorites = !showFavoritesOnly || outfit.favorite;
      return matchesSearch && matchesFavorites;
    });

  const categories = ['top', 'shirt', 'sweater', 'bottom', 'skirt', 'dress', 'outerwear', 'shoes', 'accessory'];

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
    () => (searchQuery ? 1 : 0) + selectedCategories.size + (showFavoritesOnly ? 1 : 0) + (gridCols !== 2 ? 1 : 0),
    [searchQuery, selectedCategories, showFavoritesOnly, gridCols]
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
    pink: '#EC4899',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    orange: '#FB923C',
    // ... add more if needed
  };

  // Swipe Navigation Logic
  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      // Swipe Left -> Next (Notifications)
      router.push('/notifications');
    } else if (info.offset.x > threshold) {
      // Swipe Right -> Prev (Search)
      router.push('/search');
    }
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
      const hasModalOpen = !!selectedItem || !!selectedOutfit || showAddModal;
      setTabBarHidden(hasModalOpen);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      setTabBarHidden(false);
    };
  }, [selectedItem, selectedOutfit, showAddModal, setTabBarHidden]);

  return (
    <>
      <motion.div
      className="min-h-screen bg-[var(--background)] pb-24 md:pb-8 relative overflow-hidden touch-pan-y"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.05}
      onDragEnd={handleDragEnd}
    >

      {/* Header Sticky & Auto-hide */}
      <header className={`sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-md pb-2 transition-transform duration-300 supports-[ios]:pt-safe-top ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">

          {/* Top Actions: Create & AI */}
          <div className="bg-[var(--card-bg)] p-2 rounded-2xl flex items-center gap-2">
            <Link href="/create" className="flex-1">
              <button className="w-full py-3 px-4 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity">
                <Plus className="w-5 h-5" />
                Crear Outfit
              </button>
            </Link>
            <Link href="/premium" className="flex-1">
              <button className="w-full py-3 px-4 rounded-xl bg-[var(--background-secondary)] text-[var(--foreground-secondary)] font-semibold flex items-center justify-center gap-2 border border-[var(--border-color)] relative overflow-hidden group">
                <Wand2 className="w-5 h-5" />
                Crear con IA
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
          </div>

          {/* Profile-Style Tabs */}
          <div className="flex border-b border-[var(--border-color)]">
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors gap-2 ${activeTab === 'items'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
                }`}
            >
              <Shirt className={`w-5 h-5 ${activeTab === 'items' ? 'text-[var(--brand-pink)]' : ''}`} />
              <span className="font-medium">Prendas</span>
            </button>
            <button
              onClick={() => setActiveTab('outfits')}
              className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors gap-2 ${activeTab === 'outfits'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
                }`}
            >
              <Layers className={`w-5 h-5 ${activeTab === 'outfits' ? 'text-[var(--brand-pink)]' : ''}`} />
              <span className="font-medium">Outfits</span>
            </button>
          </div>

        </div>
      </header>


      {/* Main Content */}
      {/* Filter Backdrop */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            key="filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowFilters(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[55]"
          />
        )}
      </AnimatePresence>



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
              {!loading && (!items || items.length === 0 || (filteredContent as ClothingItemType[]).length === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center mt-8 md:mt-12 mx-4 bg-[var(--card-bg)]/50 rounded-3xl border border-dashed border-[var(--border-color)]">
                  <div className="w-20 h-20 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-6 shadow-sm">
                    {(!items || items.length === 0) ? (
                      <Shirt className="w-10 h-10 text-[var(--foreground-tertiary)]" />
                    ) : (
                      <Search className="w-10 h-10 text-[var(--foreground-tertiary)]" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[var(--foreground)]">
                    {(!items || items.length === 0) ? 'Añade tu primera prenda' : 'No se encontraron prendas'}
                  </h3>
                  <p className="text-[var(--foreground-secondary)] max-w-sm mx-auto mb-8 text-base">
                    {(!items || items.length === 0)
                      ? 'Tu armario está esperando. Añade prendas con foto y crea looks increíbles.'
                      : 'No hay resultados para tu búsqueda. Prueba otros filtros o términos.'}
                  </p>
                </div>
              ) : (
                <div className={`px-4 ${viewMode === 'grid'
                  ? `grid grid-cols-${gridCols} md:grid-cols-${gridCols + 1} lg:grid-cols-${gridCols + 2} gap-3`
                  : 'space-y-3' // List View
                  }`}>
                  {(filteredContent as ClothingItemType[]).map((item) => (
                    <div key={item.id} className={viewMode === 'grid' ? '' : 'flex items-center gap-2'}>
                      {viewMode === 'list' ? (
                        <>
                          <div onClick={() => setSelectedItem(item)} className="flex-1">
                            <div className="flex items-center gap-4 bg-[var(--card-bg)] p-3 rounded-2xl shadow-sm border border-[var(--border)]">
                              <div className="w-16 h-16 rounded-xl bg-[var(--background-secondary)] relative overflow-hidden flex-shrink-0">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[var(--foreground-tertiary)]">
                                    <span className="text-xs">No img</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-[var(--foreground)] truncate">{item.name}</h3>
                                <p className="text-sm text-[var(--foreground-secondary)] capitalize">{item.category} • {item.brand || 'Sin marca'}</p>
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
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.2 }}
                          className="relative"
                          onTouchStart={() => handleTouchStart(item.id)}
                          onTouchEnd={handleTouchEnd}
                          onTouchCancel={handleTouchEnd}
                        >
                          <Card
                            key={item.id}
                            variant="default"
                            className={`group relative overflow-hidden bg-[var(--card-bg)] border-none shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${selectionMode && selectedIds.has(item.id) ? 'ring-4 ring-[var(--brand-pink)] ring-inset' : ''}`}
                            onClick={() => {
                              if (selectionMode) {
                                toggleSelection(item.id);
                              } else {
                                setSelectedItem(item);
                              }
                            }}
                          >
                            {/* Selection Checkmark */}
                            {selectionMode && selectedIds.has(item.id) && (
                              <div className="absolute top-2 right-2 z-10 bg-[var(--brand-pink)] rounded-full p-1 text-white shadow-md">
                                <Check className="w-4 h-4" />
                              </div>
                            )}

                            <div className="relative aspect-[3/4] overflow-hidden bg-[var(--background-secondary)]">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--foreground-tertiary)]">
                                  <span className="text-xs">Sin imagen</span>
                                </div>
                              )}

                              {/* Favorite Button Overlay */}
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFavoriteToggle(item.id);
                                }}
                                className="absolute top-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Heart className={`w-4 h-4 ${item.favorite ? 'fill-current text-red-500' : 'text-white'}`} />
                              </motion.button>

                              {/* Delete Button - Always visible on desktop */}
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(item.id);
                                }}
                                className="absolute top-2 left-2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-red-500 transition-colors hidden md:block"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>

                            <div className="p-3">
                              <h3 className="font-medium text-[var(--foreground)] truncate text-sm">
                                {item.name}
                              </h3>
                              <p className="text-xs text-[var(--foreground-secondary)] mt-0.5 capitalize truncate">
                                {item.category} • {item.brand || 'Sin marca'}
                              </p>
                            </div>
                          </Card>
                        </motion.div>
                      )}
                    </div>
                  ))}
                  {/* Infinite Scroll Trigger - Items */}
                  {items.length > 0 && !loading && (
                    <div ref={itemsObserverElement} className="h-10 w-full flex items-center justify-center pt-4">
                      {loadingMore && <div className="animate-spin w-6 h-6 border-2 border-[var(--brand-pink)] border-t-transparent flex-shrink-0 animate-spin transition-colors rounded-full" />}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="outfits"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {!outfitsLoading && (!outfits || outfits.length === 0 || (filteredContent as Outfit[]).length === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center mt-8 md:mt-12 mx-4 bg-[var(--card-bg)]/50 rounded-3xl border border-dashed border-[var(--border-color)]">
                  <div className="w-20 h-20 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Layers className="w-10 h-10 text-[var(--foreground-tertiary)]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[var(--foreground)]">
                    {(!outfits || outfits.length === 0) ? 'Crea tu primer outfit' : 'No hay resultados'}
                  </h3>
                  <p className="text-[var(--foreground-secondary)] max-w-sm mx-auto mb-8 text-base">
                    {(!outfits || outfits.length === 0)
                      ? 'Combina prendas de tu armario y guarda tus looks favoritos.'
                      : 'Prueba con otra búsqueda.'}
                  </p>
                  <Button
                    onClick={() => {
                      if (!items || items.length === 0) {
                        alert('Añade prendas a tu armario antes de crear outfits');
                      } else {
                        router.push('/create');
                      }
                    }}
                    className={`h-12 px-8 text-lg rounded-xl shadow-lg shadow-[var(--brand-pink)]/20 transition-all
                       ${(!items || items.length === 0) ? 'opacity-60 cursor-pointer' : 'hover:shadow-[var(--brand-pink)]/40'}`}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {(!outfits || outfits.length === 0) ? 'Crear primer outfit' : 'Crear outfit'}
                  </Button>
                </div>
              ) : (
                <div className={`px-4 ${viewMode === 'grid'
                  ? `grid grid-cols-${gridCols} md:grid-cols-${gridCols + 1} lg:grid-cols-${gridCols + 2} gap-4`
                  : 'space-y-4' // List for outfits
                  }`}>
                  {(filteredContent as Outfit[]).map((outfit) => (
                    <div
                      key={outfit.id}
                      className="relative"
                      onTouchStart={() => handleTouchStart(outfit.id)}
                      onTouchEnd={handleTouchEnd}
                      onTouchCancel={handleTouchEnd}
                    >
                      {/* Interceptor overlay during multi-select mode */}
                      {selectionMode && (
                        <div
                          className="absolute inset-0 z-10 cursor-pointer"
                          onClick={() => toggleSelection(outfit.id)}
                        />
                      )}
                      {/* Selection Checkmark */}
                      {selectionMode && selectedIds.has(outfit.id) && (
                        <div className="absolute top-2 right-2 z-20 bg-[var(--brand-pink)] rounded-full p-1 text-white shadow-md">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      <OutfitCard
                        outfit={outfit}
                        index={0}
                        onClick={() => {
                          setSelectedOutfit(outfit);
                        }}
                        onEdit={(outfit) => {
                          router.push(`/create?outfitId=${outfit.id}`);
                        }}
                        onShare={(outfit) => {
                          router.push(`/create-post?outfitId=${outfit.id}`);
                        }}
                        onDelete={(id) => {
                          showModal({
                            title: 'Eliminar outfit',
                            message: `¿Seguro que quieres eliminar el outfit "${outfit.name}"? Esta acción no se puede deshacer.`,
                            type: 'confirm',
                            confirmText: 'Eliminar',
                            cancelText: 'Cancelar',
                            onConfirm: async () => {
                              try {
                                const { error } = await supabase.from('outfits').delete().eq('id', id);
                                if (error) throw error;
                                setOutfits(prev => prev.filter(o => o.id !== id));
                                showModal({
                                  title: 'Outfit eliminado',
                                  message: 'El outfit se ha eliminado de tu armario.',
                                  type: 'success',
                                  confirmText: 'Entendido'
                                });
                              } catch (err) {
                                console.error('Error deleting outfit:', err);
                              }
                            }
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
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
          <button
            onClick={() => {
              if (selectionMode) {
                setSelectionMode(false);
                setSelectedIds(new Set());
              } else {
                setSelectionMode(true);
              }
            }}
            className="hidden md:flex items-center gap-2 bg-[var(--card-bg)] px-4 py-2.5 rounded-full shadow-lg font-medium text-[var(--foreground)] border border-[var(--border-color)] hover:bg-[var(--background-secondary)] transition-colors"
          >
            <Check className="w-5 h-5" />
            {selectionMode ? 'Cancelar' : 'Seleccionar'}
          </button>

          {/* Filter Bubble */}
          <BubbleToggle
            isOpen={showFilters}
            onToggle={() => setShowFilters(prev => !prev)}
            icon={Filter}
            activeCount={activeFilterCount}
            ariaLabel="Filtros"
            origin="bottom right"
            label="Filtrar"
          >
            <div className="w-[calc(100vw-3rem)] max-w-sm bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-2xl p-4 max-h-[70vh] overflow-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-bold text-[var(--foreground)]">Filtros</span>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowFilters(false)}
                  className="w-9 h-9 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-[var(--foreground-secondary)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
                  aria-label="Cerrar filtros"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                <input
                  type="text"
                  placeholder={`Buscar ${activeTab === 'items' ? 'prendas' : 'outfits'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--background-secondary)] border-none rounded-xl py-2.5 pl-9 pr-10 text-sm focus:ring-1 focus:ring-[var(--brand-pink)]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-[var(--foreground-tertiary)]" />
                  </button>
                )}
              </div>

              {/* Categories (Only for Items tab) */}
              {activeTab === 'items' && (
                <>
                  <p className="text-xs font-semibold text-[var(--foreground-tertiary)] uppercase tracking-wider mb-3 pl-1">Categoría</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all duration-200 ${selectedCategories.has(category)
                          ? 'bg-[var(--foreground)] text-[var(--background)]'
                          : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)]'
                          }`}
                      >
                        {selectedCategories.has(category) && (
                          <span className="mr-1">✓</span>
                        )}
                        {t.itemTypes?.[category as keyof typeof t.itemTypes] || category}
                      </button>
                    ))}
                  </div>

                  {selectedCategories.size > 0 && (
                    <button
                      onClick={() => setSelectedCategories(new Set())}
                      className="text-xs text-[var(--brand-pink)] font-semibold mb-3 pl-1 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Limpiar categorías
                    </button>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-[var(--border-color)] mb-4" />
                </>
              )}

              {/* Favorites Toggle */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${showFavoritesOnly
                  ? 'bg-[var(--foreground)] text-[var(--background)]'
                  : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)]'
                  }`}
              >
                <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                <span className="text-sm font-semibold">Solo favoritos</span>
                {showFavoritesOnly && (
                  <span className="ml-auto">✓</span>
                )}
              </button>

              {/* Grid Column Selector */}
              <div className="mt-6">
                <p className="text-xs font-semibold text-[var(--foreground-tertiary)] uppercase tracking-wider mb-3 pl-1">Diseño de cuadrícula</p>
                <div className="flex gap-2 bg-[var(--background-secondary)] p-1 rounded-2xl border border-[var(--border-color)]">
                  {[2, 3, 4].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setGridCols(cols)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${gridCols === cols
                        ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm'
                        : 'text-[var(--foreground-secondary)] hover:bg-[var(--border-color)]'
                        }`}
                    >
                      {cols} x {cols}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--foreground-tertiary)] mt-2 pl-1 italic">
                  Cambia cuántas prendas se ven por fila
                </p>
              </div>
            </div>
          </BubbleToggle>

          {/* Create Outfit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (activeTab === 'items') {
                setShowAddModal(true);
              } else {
                router.push('/create');
              }
            }}
            className="h-14 min-w-[56px] px-0 md:px-6 rounded-full bg-[var(--brand-pink)] flex items-center justify-center text-white shadow-xl hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all cursor-pointer group"
          >
            <Plus className="w-7 h-7" />
            <span className="hidden md:block font-bold whitespace-nowrap text-[15px] ml-1 pr-1">
              {activeTab === 'items' ? 'Nueva Prenda' : 'Nuevo Outfit'}
            </span>
          </motion.button>
        </div>
      )}
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
            className="fixed bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom,0px)+36px)] md:bottom-[42px] left-1/2 -translate-x-1/2 z-[4995] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-full shadow-2xl flex items-center p-2 gap-4 whitespace-nowrap"
          >
            <div className="flex items-center gap-2 pl-4 mr-2">
              <span className="font-semibold text-[var(--foreground)]">{selectedIds.size} seleccionados</span>
              <button 
                onClick={() => {
                  const allVisibleIds = filteredContent.map(i => i.id);
                  if (selectedIds.size === allVisibleIds.length) {
                    setSelectedIds(new Set());
                  } else {
                    setSelectedIds(new Set(allVisibleIds));
                  }
                }}
                className="text-xs text-[var(--brand-pink)] font-bold hover:underline"
              >
                {selectedIds.size === filteredContent.length ? 'Desmarcar todo' : 'Seleccionar todo'}
              </button>
            </div>
            <button
              onClick={async () => {
                if (selectedIds.size === 0) return;
                
                const idsArray = Array.from(selectedIds);
                let message = `¿Seguro que quieres eliminar ${selectedIds.size} ${activeTab === 'outfits' ? 'outfit(s)' : 'prenda(s)'}? Esta acción no se puede deshacer.`;
                let hasDependencies = false;

                if (activeTab === 'items') {
                  const usage = await checkItemUsage(idsArray);
                  const itemsInUseCount = Object.keys(usage).length;
                  if (itemsInUseCount > 0) {
                    hasDependencies = true;
                    message = `${itemsInUseCount} de las prendas seleccionadas están en uso en uno o más outfits. Si las borras, esos outfits se verán afectados. ¿Quieres continuar con la eliminación de los ${selectedIds.size} elementos?`;
                  }
                } else {
                  const usage = await checkOutfitUsage(idsArray);
                  const outfitsInPostsCount = Object.keys(usage).length;
                  if (outfitsInPostsCount > 0) {
                    hasDependencies = true;
                    message = `${outfitsInPostsCount} de los outfits seleccionados están publicados en el feed. Si los borras, las publicaciones podrían verse afectadas. ¿Quieres continuar con la eliminación de los ${selectedIds.size} elementos?`;
                  }
                }

                useUiStore.getState().showModal({
                  title: hasDependencies ? 'Atención: Elementos en uso' : 'Confirmar eliminación',
                  message,
                  type: 'warning',
                  confirmText: 'Sí, eliminar todo',
                  cancelText: 'Cancelar',
                  onConfirm: async () => {
                    try {
                      if (activeTab === 'items') {
                        // Borrado en paralelo para mayor velocidad
                        const results = await Promise.all(idsArray.map(id => deleteItem(id)));
                        const failures = results.filter(r => !r).length;
                        
                        if (failures > 0) {
                          console.warn(`Falló la eliminación de ${failures} prendas.`);
                        }
                        refresh();
                      } else {
                        // 1. Borrar primero las relaciones en outfit_items para evitar errores de FK
                        const { error: itemsError } = await supabase
                          .from('outfit_items')
                          .delete()
                          .in('outfit_id', idsArray);
                        
                        if (itemsError) {
                          console.warn('Advertencia al borrar items de outfits:', itemsError);
                        }

                        // 2. Borrado de los outfits por lote
                        const { error } = await supabase.from('outfits').delete().in('id', idsArray);
                        if (error) throw error;
                        
                        // Actualización optimista del estado local
                        setOutfits(prev => prev.filter(o => !selectedIds.has(o.id)));
                        
                        // Sincronización real con el servidor
                        fetchOutfits(false);
                      }
                      
                      // Limpiar selección después del éxito
                      setSelectionMode(false);
                      setSelectedIds(new Set());
                    } catch (err: any) {
                      console.error('Error in bulk delete:', err);
                      useUiStore.getState().showModal({
                        title: 'Error al eliminar',
                        message: err?.message || 'No se pudieron eliminar todos los elementos seleccionados.',
                        type: 'error',
                        confirmText: 'Entendido'
                      });
                    }
                  }
                });
              }}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${selectedIds.size > 0 ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[var(--background-secondary)] text-[var(--foreground-tertiary)] cursor-not-allowed'}`}
            >
              Eliminar
            </button>
            <button
              onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }}
              className="p-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] bg-[var(--background-secondary)] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
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
            await addItem(partial as any);
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
        onEdit={handleEditItem}
        onDelete={async (id: string) => {
          const usage = await checkItemUsage([id]);
          const count = usage[id] || 0;

          if (count > 0) {
            useUiStore.getState().showModal({
              title: 'Prenda en uso',
              message: `Esta prenda forma parte de ${count} outfit(s). Si la borras, esos outfits quedarán incompletos. ¿Estás seguro de que quieres eliminarla?`,
              type: 'warning',
              confirmText: 'Sí, eliminar',
              cancelText: 'Cancelar',
              onConfirm: async () => {
                await deleteItem(id);
                setSelectedItem(null);
              }
            });
          } else {
            useUiStore.getState().showModal({
              title: 'Eliminar prenda',
              message: '¿Estás seguro de que quieres eliminar esta prenda? Esta acción no se puede deshacer.',
              type: 'warning',
              confirmText: 'Eliminar',
              cancelText: 'Cancelar',
              onConfirm: async () => {
                await deleteItem(id);
                setSelectedItem(null);
              }
            });
          }
        }}
      />

      <OutfitDetailModal
        isOpen={!!selectedOutfit}
        onClose={() => setSelectedOutfit(null)}
        // @ts-ignore
        outfit={selectedOutfit}
        onToggleFavorite={toggleOutfitFavorite}
        onDelete={async (id) => {
          const usage = await checkOutfitUsage([id]);
          const count = usage[id] || 0;

          if (count > 0) {
            useUiStore.getState().showModal({
              title: 'Outfit publicado en un post',
              message: `Si eliminas este outfit, los ${count} post(s) asociado(s) se quedarán sin outfit. ¿Estás seguro de que quieres eliminarlo de todas formas?`,
              type: 'warning',
              confirmText: 'Sí, eliminar',
              cancelText: 'Cancelar',
              onConfirm: async () => {
                await supabase.from('outfit_items').delete().eq('outfit_id', id);
                const { error } = await supabase.from('outfits').delete().eq('id', id);
                if (error) {
                  console.error('Error deleting outfit:', error);
                  return;
                }
                setOutfits(prev => prev.filter(o => o.id !== id));
                setSelectedOutfit(null);
              }
            });
          } else {
            useUiStore.getState().showModal({
              title: 'Eliminar outfit',
              message: '¿Estás seguro de que quieres eliminar este outfit? Esta acción no se puede deshacer.',
              type: 'warning',
              confirmText: 'Eliminar',
              cancelText: 'Cancelar',
              onConfirm: async () => {
                await supabase.from('outfit_items').delete().eq('outfit_id', id);
                await supabase.from('outfits').delete().eq('id', id);
                setOutfits(prev => prev.filter(o => o.id !== id));
                setSelectedOutfit(null);
              }
            });
          }
        }}
      />
    </>
  );
}
