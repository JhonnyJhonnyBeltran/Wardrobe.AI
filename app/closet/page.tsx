'use client';

/**
 * Closet - Your Wardrobe (Mobile Optimized)
 * Search expands, buttons icon-only on mobile
 * Features wardrobe door opening animation with model preloading
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Grid3x3, List, Search, Filter, Plus, Wand2, X
} from 'lucide-react';
import { Card, Button, ClothingItem, StyleQuizModal, LogoMark } from '@/components';
import AddItemModal from '@/components/AddItemModal';
import ProductModal from '@/components/ProductModal';
import type { StyleQuizResponses } from '@/components/StyleQuizModal';
import type { ClothingItem as ClothingItemType } from '@/types/clothing';
import { useUser } from '@/store';
import { useUiStore } from '@/store/uiStore';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import { OutfitItem } from '@/lib/fashion/outfitGenerator';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { preloadModel, isModelLoaded } from '@/lib/imageProcessing';

// Storage key for tracking first visit
const CLOSET_PRELOAD_KEY = 'klozet_model_preloaded';

// Wardrobe Door Animation Component with Model Preloading
const WardrobeDoorAnimation = ({ 
  onComplete, 
  isOpen,
  isPreloading,
  preloadProgress 
}: { 
  onComplete: () => void; 
  isOpen: boolean;
  isPreloading: boolean;
  preloadProgress: string;
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Complete animation after doors fully open
    const timer = setTimeout(onComplete, 2300);
    return () => clearTimeout(timer);
  }, [onComplete, isOpen]);

  return (
    <div className="closet-door-container">
      {/* Loading indicator while preloading model */}
      {isPreloading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-[var(--brand-pink)] border-t-transparent rounded-full mb-4"
          />
          <p className="text-sm text-[var(--foreground-secondary)] font-medium">
            {preloadProgress}
          </p>
        </motion.div>
      )}

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
  const { isPremium, user, setUser } = useUser();
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

  // Sync favorites from items
  useEffect(() => {
    if (items) {
      const favIds = items.filter((i) => i.favorite).map(i => i.id);
      setFavorites(new Set(favIds));
    }
  }, [items]);

  // Model preloading state - now purely background, doesn't block UI
  const [isModelPreloading, setIsModelPreloading] = useState(false);
  const [modelPreloadProgress, setModelPreloadProgress] = useState('Preparando tu armario...');
  const preloadStarted = useRef(false);

  // Check if this is the first visit (model not preloaded yet)
  const checkIsFirstVisit = useCallback(() => {
    if (typeof window === 'undefined') return true;
    const hasPreloaded = localStorage.getItem(CLOSET_PRELOAD_KEY);
    return !hasPreloaded;
  }, []);

  // Wardrobe Door Animation State - null means "not yet determined"
  const [showDoorAnimation, setShowDoorAnimation] = useState<boolean | null>(null);
  const [doorsCanOpen, setDoorsCanOpen] = useState(false);

  // Initialize animation state on mount (client-side only)
  useEffect(() => {
    const isFirst = checkIsFirstVisit();
    
    if (isFirst) {
      // First visit: show animation
      setShowDoorAnimation(true);
      setIsModelPreloading(true);
      setModelPreloadProgress('Preparando tu armario...');
      
      const openTimer = setTimeout(() => {
        setDoorsCanOpen(true);
        setIsModelPreloading(false);
      }, 3000);
      
      return () => clearTimeout(openTimer);
    } else {
      // Not first visit: no animation at all
      setShowDoorAnimation(false);
      setDoorsCanOpen(true);
    }
  }, [checkIsFirstVisit]);

  // Preload model in background (doesn't affect door animation)
  useEffect(() => {
    if (preloadStarted.current) return;
    if (isModelLoaded('quality')) return;
    
    preloadStarted.current = true;
    
    // Preload in background - fire and forget
    const doPreload = async () => {
      try {
        await preloadModel('quality');
        
        // Mark as preloaded for future visits
        if (typeof window !== 'undefined') {
          localStorage.setItem(CLOSET_PRELOAD_KEY, 'true');
        }
      } catch {
        // Still mark as "visited" so we don't show animation again
        if (typeof window !== 'undefined') {
          localStorage.setItem(CLOSET_PRELOAD_KEY, 'true');
        }
      }
    };
    
    // Start after a brief delay
    setTimeout(doPreload, 500);
  }, []);

  // Style Quiz State - Mostrar si no está completado
  const [showStyleQuiz, setShowStyleQuiz] = useState(false);

  useEffect(() => {
    // Si el usuario no ha completado el cuestionario, mostrarlo automáticamente
    if (user && !user.styleCompleted) {
      setShowStyleQuiz(true);
    }
  }, [user]);

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


  // Filter clothing items
  const filteredItems = (items || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || item.category === filterType;
    const matchesFavorites = !showFavoritesOnly || favorites.has(item.id);

    return matchesSearch && matchesType && matchesFavorites;
  });

  const itemTypes = ['top', 'bottom', 'dress', 'outerwear'];

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
  };

  // Handle door animation completion
  const handleDoorAnimationComplete = () => {
    setShowDoorAnimation(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8 pt-4 relative overflow-hidden">

      {/* Wardrobe Door Opening Animation - Only on first visit (showDoorAnimation === true, not null) */}
      <AnimatePresence>
        {showDoorAnimation === true && (
          <WardrobeDoorAnimation
            onComplete={handleDoorAnimationComplete}
            isOpen={doorsCanOpen}
            isPreloading={isModelPreloading}
            preloadProgress={modelPreloadProgress}
          />
        )}
      </AnimatePresence>

      {/* Main Content - Visible from the start */}
      <div>
        {/* Toolbar - Mobile Optimized */}


        {/* Quick Actions - Integrated in main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-4 mb-6"
        >
          <h2 className="text-sm font-bold text-[var(--foreground-secondary)] mb-3">{t.closet.quickActions}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Create Outfit Card */}
            <Link href="/create">
              <Card className="h-full p-6 hover-lift cursor-pointer group bg-gradient-to-br from-[var(--brand-pink)]/5 to-[var(--brand-pink-dark)]/5 border-2 border-[var(--brand-pink)]/20 hover:border-[var(--brand-pink)]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--background)] shadow-md flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                    <LogoMark size="md" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                      {t.closet.createOutfit}
                    </h3>
                    <p className="text-sm text-[var(--foreground-tertiary)]">
                      {t.closet.createOutfitDesc}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Chat with Kloe - Coming Soon */}
            <Card className="h-full p-6 relative overflow-hidden group border-2 border-[var(--border-color)] opacity-80">
              <div className="absolute top-3 right-3 bg-[var(--brand-pink)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Próximamente
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--background-secondary)] border-2 border-gray-200 flex items-center justify-center flex-shrink-0 grayscale">
                  <Wand2 className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                    Charla con Kloe
                  </h3>
                  <p className="text-sm text-[var(--foreground-tertiary)]">
                    Tu asistente de moda personal con IA
                  </p>
                </div>
              </div>
            </Card>

            {/* Add Item Card */}
            <Card
              onClick={() => setShowAddModal(true)}
              className="h-full p-6 hover-lift cursor-pointer group border-2 border-[var(--border-color)] hover:border-[var(--brand-pink)]"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--background-secondary)] border-2 border-[var(--brand-pink)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-[var(--brand-pink)]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                    {t.closet.addItem}
                  </h3>
                  <p className="text-sm text-[var(--foreground-tertiary)]">
                    {t.closet.addItemDesc}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Items Section Header */}
        <div className="px-4 mb-3">
          <h2 className="text-sm font-bold text-[var(--foreground-secondary)]">
            {t.closet.myItems} {filteredItems.length > 0 && `(${filteredItems.length})`}
          </h2>
          {/* Toolbar - Mobile Optimized (Moved) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mt-4 mb-2"
          >
            <Card className="p-3">
              <div className="flex gap-2">
                {/* Search - Expands on mobile */}
                <AnimatePresence mode="wait">
                  {searchExpanded ? (
                    <motion.div
                      key="expanded"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '100%', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="flex-1 relative"
                    >
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full pl-9 pr-9 py-2 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                      />
                      <button
                        onClick={() => {
                          setSearchExpanded(false);
                          setSearchQuery('');
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="buttons"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2 flex-1"
                    >
                      {/* Search Icon - Mobile */}
                      <Button
                        variant="secondary"
                        onClick={() => setSearchExpanded(true)}
                        className="px-3 md:hidden flex-1"
                      >
                        <Search className="w-4 h-4" />
                      </Button>

                      {/* Search Full - Desktop */}
                      <div className="hidden md:flex flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                        <input
                          type="text"
                          placeholder={t.closet.search}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                        />
                      </div>

                      {/* Filters - Icon only on mobile */}
                      <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-3 flex-1 md:flex-none"
                      >
                        <Filter className="w-4 h-4" />
                      </Button>

                      {/* Favorites - Icon only on mobile */}
                      <Button
                        variant={showFavoritesOnly ? 'primary' : 'secondary'}
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className="px-3 flex-1 md:flex-none"
                      >
                        <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                      </Button>

                      {/* View Mode - Icon only on mobile */}
                      <Button
                        variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="px-3 flex-1 md:flex-none"
                      >
                        {viewMode === 'grid' ? <Grid3x3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filter Panel */}
              <AnimatePresence>
                {showFilters && !searchExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 border-t border-[var(--border-color)] mt-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setFilterType(null)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${!filterType
                            ? 'bg-[var(--brand-pink)] text-white'
                            : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)]'
                            }`}
                        >
                          {t.closet.all}
                        </button>
                        {itemTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${filterType === type
                              ? 'bg-[var(--brand-pink)] text-white'
                              : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)]'
                              }`}
                          >
                            {t.itemTypes[type as keyof typeof t.itemTypes]}
                          </button>
                        ))}
                      </div>

                      {(filterType || showFavoritesOnly) && (
                        <button
                          onClick={() => {
                            setFilterType(null);
                            setShowFavoritesOnly(false);
                          }}
                          className="mt-2 text-xs text-[var(--brand-pink)] font-semibold flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          {t.closet.clear}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>

        {filteredItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`px-4 ${viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-3'
              }`}
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <ClothingItem
                  id={item.id}
                  name={item.name}
                  brand={item.brand}
                  type={t.itemTypes[item.category as keyof typeof t.itemTypes] || item.category}
                  color={t.colors[(item.color as any) as keyof typeof t.colors] || item.color}
                  colorHex={(item as any).colorHex || colorMap[(item.color as any) as string] || '#EEEEEE'}
                  imageUrl={item.imageUrl || ''}
                  isFavorite={favorites.has(item.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  onDelete={handleDeleteItem}
                  onClick={() => handleItemClick(item)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="mx-4 p-8 text-center">
            <Plus className="w-12 h-12 text-[var(--brand-pink)] mx-auto mb-3" />
            <p className="text-sm font-bold text-[var(--foreground)] mb-1">{t.closet.addFirstItem}</p>
            <p className="text-xs text-[var(--foreground-tertiary)]">{t.closet.wardrobeWaiting}</p>
            <div className="mt-4">
              <Button onClick={() => setShowAddModal(true)} className="px-4">
                {t.closet.addItemButton}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Add Item Modal */}
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

      {/* Style Quiz Modal - Obligatorio para nuevos usuarios */}
      <StyleQuizModal
        isOpen={showStyleQuiz}
        required={true}
        onClose={() => {
          // No se puede cerrar si es obligatorio
        }}
        onComplete={async (responses: StyleQuizResponses) => {
          // Guardar preferencias del usuario en Supabase
          if (user) {
            const updates = {
              age_range: responses.ageRange,
              gender: responses.gender,
              height: responses.height,
              height_range: responses.heightRange,
              preferred_styles: responses.preferredStyles,
              uses_accessories: responses.usesAccessories,
              visual_style_preferences: responses.visualStylePreferences,
              style_completed: true,
              updated_at: new Date().toISOString(),
            };

            // Actualizar 'profiles' (Tabla principal)
            const { error: errorProfiles } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', user.id);

            if (errorProfiles) {
              console.error('Error guardando preferencias:', errorProfiles);
              alert('Hubo un error guardando tus preferencias. Inténtalo de nuevo.');
              return;
            }

            // Actualizar en el store local
            setUser({
              ...user,
              ageRange: responses.ageRange as any,
              gender: responses.gender as any,
              height: responses.height,
              heightRange: responses.heightRange as any,
              preferredStyles: responses.preferredStyles,
              usesAccessories: responses.usesAccessories,
              visualStylePreferences: responses.visualStylePreferences,
              styleCompleted: true,
            });
          }
          setShowStyleQuiz(false);
        }}
      />

      {/* Product Detail Modal */}
      <ProductModal
        item={selectedProduct}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        isFavorite={selectedProduct ? favorites.has(selectedProduct.id) : false}
        onFavoriteToggle={handleFavoriteToggle}
        onEdit={handleEditItem}
      />
    </div>
  );
}
