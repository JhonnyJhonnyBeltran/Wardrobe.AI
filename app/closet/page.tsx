'use client';

/**
 * Closet - Your Wardrobe (Mobile Optimized)
 * Search expands, buttons icon-only on mobile
 * Features wardrobe door opening animation
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Grid3x3, List, Search, Filter, Plus, Wand2, X, Shirt, Layers
} from 'lucide-react';
import { Card, Button, ClothingItem, LogoMark } from '@/components';
import AddItemModal from '@/components/AddItemModal';
import ProductModal from '@/components/ProductModal';
import OutfitCard from '@/components/OutfitCard';
import type { Outfit } from '@/types/outfit';
import type { ClothingItem as ClothingItemType } from '@/types/clothing';
import { useUser } from '@/store';
import { useUiStore } from '@/store/uiStore';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import { OutfitItem } from '@/lib/fashion/outfitGenerator';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

// Wardrobe Door Animation Component
const WardrobeDoorAnimation = ({ onComplete, isOpen }: { onComplete: () => void; isOpen: boolean }) => {
  useEffect(() => {
    if (!isOpen) return;

    // Complete animation after doors fully open
    const timer = setTimeout(onComplete, 2300);
    return () => clearTimeout(timer);
  }, [onComplete, isOpen]);

  return (
    <div className="closet-door-container">
      {/* Left Door */}
      <motion.div
        className="closet-door closet-door-left"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isOpen ? -105 : 0 }}
        transition={{
          duration: 1.7,
          delay: isOpen ? 0.3 : 0,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <div className="closet-door-inner">
          <div className="closet-door-detail closet-door-detail-horizontal closet-door-detail-top" />
          <Image
            src="/klozet-logo-extended.png"
            alt="Klozet"
            width={120} // Valor de referencia (ancho intrínseco)
            height={48} // Valor de referencia (alto intrínseco)
            style={{
              width: '40%', // Aquí aplicas el porcentaje
              height: 'auto',
            }}
            className="h-8 w-auto object-contain opacity-100"
          />
          <div className="closet-door-accent" />
          <div className="closet-door-detail closet-door-detail-horizontal closet-door-detail-bottom" />
        </div>
        <motion.div
          className="closet-door-handle"
          initial={{ opacity: 1 }}
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.4, delay: isOpen ? 0.6 : 0 }}
        />
      </motion.div>

      {/* Right Door */}
      <motion.div
        className="closet-door closet-door-right"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isOpen ? 105 : 0 }}
        transition={{
          duration: 1.7,
          delay: isOpen ? 0.3 : 0,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <div className="closet-door-inner">
          <div className="closet-door-detail closet-door-detail-horizontal closet-door-detail-top" />
          <Image
            src="/klozet-logo-dark-extended.png"
            alt="Klozet"
            width={120} // Valor de referencia (ancho intrínseco)
            height={48} // Valor de referencia (alto intrínseco)
            style={{
              width: '40%', // Aquí aplicas el porcentaje
              height: 'auto',
            }}
            className="h-8 w-auto object-contain opacity-100"
          />
          <div className="closet-door-accent" />
          <div className="closet-door-detail closet-door-detail-horizontal closet-door-detail-bottom" />
        </div>
        <motion.div
          className="closet-door-handle"
          initial={{ opacity: 1 }}
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.4, delay: isOpen ? 0.6 : 0 }}
        />
      </motion.div>
    </div>
  );
};

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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItemType | null>(null);
  const { items, loading, addItem, updateItem, deleteItem, refresh } = useWardrobe();

  // Outfits State
  const [activeTab, setActiveTab] = useState<'items' | 'outfits'>('items');
  const [outfits, setOutfits] = useState<any[]>([]);
  const [outfitsLoading, setOutfitsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  // Wardrobe Door Animation State - Solo mostrar la primera vez
  // Wardrobe Door Animation State - Mostrar si es la primera visit
  const [showDoorAnimation, setShowDoorAnimation] = useState(true);

  // REDIRECT TO ONBOARDING if style profile is missing
  useEffect(() => {
    if (!isLoading && user && !user.styleCompleted) {
      // Checking if styleCompleted is explicitly false (it defaults to false in new users)
      // Adding a slight delay or check to ensure user data is loaded
      router.push('/onboarding');
    }
  }, [user, isLoading, router]);


  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<(OutfitItem & { sourceUrl?: string }) | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

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
      setEditingItem(itemToEdit);
      setShowProductModal(false);
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
      const matchesType = !selectedCategory || item.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || favorites.has(item.id);
      return matchesSearch && matchesType && matchesFavorites;
    })
    : (outfits || []).filter(outfit => {
      const matchesSearch = outfit.name.toLowerCase().includes(searchQuery.toLowerCase());
      // For outfits we might want to filter by occasion if we had that UI
      return matchesSearch;
    });

  const categories = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessories'];

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



  // Handle door animation completion
  const handleDoorAnimationComplete = () => {
    setShowDoorAnimation(false);
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
      <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border-color)] pb-2 transition-all supports-[ios]:pt-safe-top">
        <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">

          {/* Top Actions: Create & AI */}
          <div className="bg-[var(--card-bg)] p-2 rounded-2xl border border-[var(--border-color)] flex items-center gap-2 shadow-sm">
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

          {/* Filters Area (Wrapped in rounded div) */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-2 shadow-sm overflow-hidden">

            {/* Search Bar - Always Visible here */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
              <input
                type="text"
                placeholder={`Buscar ${activeTab === 'items' ? 'prendas' : 'outfits'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--background-secondary)] border-none rounded-xl py-2 pl-9 pr-10 text-sm focus:ring-1 focus:ring-[var(--brand-pink)]"
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

            {/* Categories (Only for Items) */}
            {activeTab === 'items' && (
              <div className="overflow-x-auto scrollbar-hide pb-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!selectedCategory
                      ? 'bg-[var(--foreground)] text-[var(--background)]'
                      : 'bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
                      }`}
                  >
                    Todo
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${selectedCategory === category
                        ? 'bg-[var(--foreground)] text-[var(--background)]'
                        : 'bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
                        }`}
                    >
                      {t.itemTypes?.[category as keyof typeof t.itemTypes] || category}
                    </button>
                  ))}

                  {/* Divider */}
                  <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

                  {/* Favorites Toggle */}
                  <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`p-2 rounded-full border transition-all ${showFavoritesOnly
                      ? 'bg-[var(--brand-pink)] border-[var(--brand-pink)] text-white shadow-sm'
                      : 'bg-[var(--background-secondary)] border-transparent text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                      }`}
                    aria-label="Ver favoritos"
                  >
                    <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto pt-44 sm:pt-32 pb-4">

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
              {(filteredContent as ClothingItemType[]).length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center mt-8 md:mt-12 mx-4 bg-[var(--card-bg)]/50 rounded-3xl border border-dashed border-[var(--border-color)]">
                  <div className="w-20 h-20 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-6 shadow-sm">
                    {(items || []).length === 0 ? (
                      <Shirt className="w-10 h-10 text-[var(--foreground-tertiary)]" />
                    ) : (
                      <Search className="w-10 h-10 text-[var(--foreground-tertiary)]" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[var(--foreground)]">
                    {(items || []).length === 0 ? 'Añade tu primera prenda' : 'No se encontraron prendas'}
                  </h3>
                  <p className="text-[var(--foreground-secondary)] max-w-sm mx-auto mb-8 text-base">
                    {(items || []).length === 0
                      ? 'Tu armario está esperando. Añade prendas con foto y crea looks increíbles.'
                      : 'No hay resultados para tu búsqueda. Prueba otros filtros o términos.'}
                  </p>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="h-12 px-8 text-lg rounded-xl shadow-lg shadow-[var(--brand-pink)]/20 hover:shadow-[var(--brand-pink)]/40 transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {(items || []).length === 0 ? 'Añadir primera prenda' : 'Añadir prenda'}
                  </Button>
                </div>
              ) : (
                <div className={`px-4 ${viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                  : 'space-y-3' // List View
                  }`}>
                  {(filteredContent as ClothingItemType[]).map((item) => (
                    <div key={item.id} onClick={() => setSelectedItem(item)}>
                      {viewMode === 'list' ? (
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
                      ) : (
                        <Card
                          key={item.id}
                          variant="default"
                          className="group relative overflow-hidden bg-[var(--card-bg)] border-none shadow-sm hover:shadow-md transition-all duration-300"
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-[var(--background-secondary)]">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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

                            {/* Gradient Overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
              {(filteredContent as Outfit[]).length === 0 && !outfitsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center mt-8 md:mt-12 mx-4 bg-[var(--card-bg)]/50 rounded-3xl border border-dashed border-[var(--border-color)]">
                  <div className="w-20 h-20 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Layers className="w-10 h-10 text-[var(--foreground-tertiary)]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[var(--foreground)]">
                    {outfits.length === 0 ? 'Crea tu primer outfit' : 'No hay resultados'}
                  </h3>
                  <p className="text-[var(--foreground-secondary)] max-w-sm mx-auto mb-8 text-base">
                    {outfits.length === 0
                      ? 'Combina prendas de tu armario y guarda tus looks favoritos.'
                      : 'Prueba con otra búsqueda.'}
                  </p>
                  <Link href="/create">
                    <Button className="h-12 px-8 text-lg rounded-xl shadow-lg shadow-[var(--brand-pink)]/20 hover:shadow-[var(--brand-pink)]/40 transition-all">
                      <Plus className="w-5 h-5 mr-2" />
                      {outfits.length === 0 ? 'Crear primer outfit' : 'Crear outfit'}
                    </Button>
                  </Link>
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
                        onEdit={(outfit) => {
                          router.push(`/create?outfitId=${outfit.id}`);
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

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
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
        )}

        {selectedItem && (
          <ProductModal
            item={{
              ...selectedItem,
              type: selectedItem.category,
              source: 'Closet',
              trending: false,
              matchScore: 0,
              imageUrl: selectedItem.imageUrl || '',
            } as any}
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            onDelete={async (id: string) => {
              await deleteItem(id);
              setSelectedItem(null);
            }}
          />
        )}


      </AnimatePresence>

      {/* Floating Action Button (FAB) for adding items (Only in Items tab) */}
      {activeTab === 'items' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setEditingItem(null);
            setShowAddModal(true);
          }}
          className="fixed bottom-24 md:bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--brand-pink)] shadow-lg shadow-[var(--brand-pink)]/40 flex items-center justify-center text-white hover:bg-[var(--brand-pink-dark)] transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--brand-pink)]/30"
          aria-label={t.closet.addItem}
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      )}
    </motion.div>
  );
}
