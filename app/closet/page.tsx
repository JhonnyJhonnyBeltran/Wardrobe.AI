'use client';

/**
 * Closet - Your Wardrobe (Mobile Optimized)
 * Search expands, buttons icon-only on mobile
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Grid3x3, List, Search, Filter, Plus, Wand2, X, Shirt, Layers, Share2, Trash2
} from 'lucide-react';
import { Card, Button, ClothingItem, LogoMark } from '@/components';
import AddItemModal from '@/components/AddItemModal';
import ProductModal from '@/components/ProductModal';
import BubbleToggle from '@/components/BubbleToggle';
import OutfitCard from '@/components/OutfitCard';
import type { Outfit } from '@/types/outfit';
import type { ClothingItem as ClothingItemType } from '@/types/clothing';
import { useUser } from '@/store';
import { useUiStore } from '@/store/uiStore';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { useBodyScrollLock } from '@/lib/hooks';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import { OutfitItem } from '@/lib/fashion/outfitGenerator';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

export default function ClosetPage() {
  const router = useRouter();
  const { isPremium, user, setUser, isLoading } = useUser();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItemType | null>(null);
  const { items, loading, addItem, updateItem, deleteItem, refresh } = useWardrobe();

  // Lock body scroll when filter panel is open
  useBodyScrollLock(showFilters);

  // Outfits State
  const [activeTab, setActiveTab] = useState<'items' | 'outfits'>('items');
  const [outfits, setOutfits] = useState<any[]>([]);
  const [outfitsLoading, setOutfitsLoading] = useState(false);

  // Fetch Outfits
  useEffect(() => {
    let mounted = true;

    async function fetchOutfits() {
      if (!user) return;
      setOutfitsLoading(true);
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
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (mounted) {
          // Transform data to match Outfit type
          const formattedOutfits = (data || []).map((o: any) => ({
            ...o,
            createdAt: new Date(o.created_at),
            occasion: o.occasion,
            items: o.outfit_items.map((oi: any) => oi.clothing_item).filter(Boolean),
            style: o.occasion, // map occasion to style for UI
            date: new Date(o.created_at).toLocaleDateString(),
          }));

          setOutfits(formattedOutfits);
        }
      } catch (err) {
        console.error('Error fetching outfits:', err);
      } finally {
        if (mounted) setOutfitsLoading(false);
      }
    }

    if (activeTab === 'outfits') {
      fetchOutfits();
    }

    return () => { mounted = false; };
  }, [user, activeTab]);

  // Sync favorites from items
  useEffect(() => {
    if (items) {
      const favIds = items.filter((i) => i.favorite).map(i => i.id);
      setFavorites(new Set(favIds));
    }
  }, [items]);

  // REDIRECT TO ONBOARDING if style profile is missing
  // Removed faulty user.styleCompleted redirect that caused blank screens on client-side routing


  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<(OutfitItem & { sourceUrl?: string }) | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
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
    // Convert ClothingItemData to OutfitItem for the modal
    const productItem: OutfitItem & { sourceUrl?: string } = {
      id: item.id,
      type: (item.category as any) || 'top',
      name: item.name,
      brand: item.brand || '',
      color: (item.color as any) || 'white',
      imageUrl: item.imageUrl || '',
      buyLink: (item as any).buyLink || undefined,
      colorHex: (item as any).colorHex || undefined,
      source: 'wardrobe',
      trending: false,
      matchScore: 100,
      // sourceUrl: (item as any).sourceUrl || undefined, // Include source URL for scraped products
    };

    setSelectedProduct(productItem);
    // Small delay handled by ClothingItem drawer animation
    setShowProductModal(true);
  };


  // Products/Items State
  const [selectedItem, setSelectedItem] = useState<ClothingItemType | null>(null);

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
      return matchesSearch;
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

  return (
    <motion.div
      className="min-h-screen bg-[var(--background)] pb-24 md:pb-8 pt-4 relative overflow-hidden touch-pan-y"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.05}
      onDragEnd={handleDragEnd}
    >

      {/* Header Fixed */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--background)]/95 backdrop-blur-md pb-2 transition-all supports-[ios]:pt-safe-top">
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



      <main className="max-w-7xl mx-auto pt-36 sm:pt-24 pb-4 relative">

        {/* Spacer for filter button area — keeps consistent top margin */}
        <div className="h-16" />

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
                  ? 'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
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
                        >
                          <Card
                            key={item.id}
                            variant="default"
                            className="group relative overflow-hidden bg-[var(--card-bg)] border-none shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                            onClick={() => setSelectedItem(item)}
                          >
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
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                  : 'space-y-4' // List for outfits
                  }`}>
                  {(filteredContent as Outfit[]).map((outfit) => (
                    <div key={outfit.id}>
                      <OutfitCard
                        outfit={outfit}
                        index={0}
                        onClick={() => {
                          router.push(`/outfit/${outfit.id}`);
                        }}
                        onEdit={(outfit) => {
                          router.push(`/create?outfitId=${outfit.id}`);
                        }}
                        onShare={(outfit) => {
                          router.push(`/create-post?outfitId=${outfit.id}`);
                        }}
                        onDelete={async (id) => {
                          const confirmDelete = confirm('¿Seguro que quieres eliminar este outfit?');
                          if (confirmDelete) {
                            await supabase.from('outfits').delete().eq('id', id);
                            // Refresh logic for outfits would go here
                            setOutfits(prev => prev.filter(o => o.id !== id));
                          }
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

      {/* Modals — always mounted, internal AnimatePresence handles exit */}
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
          await deleteItem(id);
          setSelectedItem(null);
        }}
      />

      {/* FAB stack: Filter + Add — always stacked, fully responsive */}
      {activeTab === 'items' && !showAddModal && !selectedItem && (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-[5005] flex flex-col items-end gap-3">
          {/* Filter Bubble */}
          <BubbleToggle
            isOpen={showFilters}
            onToggle={() => setShowFilters(prev => !prev)}
            icon={Filter}
            activeCount={activeFilterCount}
            ariaLabel="Filtros"
            origin="bottom right"
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
            </div>
          </BubbleToggle>

          {/* Create Outfit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="w-14 h-14 rounded-full bg-[var(--brand-pink)] flex items-center justify-center text-white shadow-xl hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all cursor-pointer"
          >
            <Plus className="w-7 h-7" />
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
    </motion.div>
  );
}
