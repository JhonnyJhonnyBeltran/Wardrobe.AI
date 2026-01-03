'use client';

/**
 * Closet - Your Wardrobe (Mobile Optimized)
 * Search expands, buttons icon-only on mobile
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Grid3x3, List, Search, Filter, Plus, Wand2, X
} from 'lucide-react';
import { Card, Button, ClothingItem, StyleQuizModal } from '@/components';
import AddItemModal from '@/components/AddItemModal';
import ProductModal from '@/components/ProductModal';
import type { StyleQuizResponses } from '@/components/StyleQuizModal';
import { useUser } from '@/store';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import Link from 'next/link';
import { OutfitItem } from '@/lib/fashion/outfitGenerator';
import { supabase } from '@/lib/supabase/client';

export default function ClosetPage() {
  const { isPremium, user, setUser } = useUser();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1', '2', '5', '6', '9', '10']));
  const [showAddModal, setShowAddModal] = useState(false);
  const { items, loading, addItem, refresh } = useWardrobe();

  // Style Quiz State - Mostrar si no está completado
  const [showStyleQuiz, setShowStyleQuiz] = useState(false);

  useEffect(() => {
    // Si el usuario no ha completado el cuestionario, mostrarlo automáticamente
    if (user && !user.styleCompleted) {
      setShowStyleQuiz(true);
    }
  }, [user]);

  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<OutfitItem | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const handleItemClick = (item: ClothingItemData) => {
    // Convert ClothingItemData to OutfitItem for the modal
    const productItem: OutfitItem = {
      id: item.id,
      type: (item.category as any) || 'top',
      name: item.name,
      brand: item.brand,
      color: (item.color as any) || 'white',
      imageUrl: item.imageUrl || '',
      price: (item as any).price || undefined,
      buyLink: '#',
      colorHex: (item as any).colorHex || undefined,
      source: 'wardrobe',
      trending: false,
      matchScore: 100
    };

    setSelectedProduct(productItem);
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

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Mi Armario</h1>
          <p className="text-xs text-[var(--foreground-tertiary)]">{items.length} prendas</p>
        </div>
      </motion.div>

      {/* Toolbar - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 mb-4"
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
                    className="px-3 md:hidden"
                  >
                    <Search className="w-4 h-4" />
                  </Button>

                  {/* Search Full - Desktop */}
                  <div className="hidden md:flex flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                    />
                  </div>

                  {/* Filters - Icon only on mobile */}
                  <Button
                    variant="secondary"
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>

                  {/* Favorites - Icon only on mobile */}
                  <Button
                    variant={showFavoritesOnly ? 'primary' : 'secondary'}
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className="px-3"
                  >
                    <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  </Button>

                  {/* View Mode - Icon only on mobile */}
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="px-3"
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
                      Todo
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
                        {type}
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
                      Limpiar
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Quick Actions - Integrated in main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="px-4 mb-6"
      >
        <h2 className="text-sm font-bold text-[var(--foreground-secondary)] mb-3">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Create Outfit Card */}
          <Link href="/create">
            <Card className="p-6 hover-lift cursor-pointer group bg-gradient-to-br from-[var(--brand-pink)]/5 to-[var(--brand-pink-dark)]/5 border-2 border-[var(--brand-pink)]/20 hover:border-[var(--brand-pink)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                    Crear Outfit
                  </h3>
                  <p className="text-sm text-[var(--foreground-tertiary)]">
                    Genera looks con IA basados en tu armario
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Add Item Card */}
          <Card
            onClick={() => setShowAddModal(true)}
            className="p-6 hover-lift cursor-pointer group border-2 border-[var(--border-color)] hover:border-[var(--brand-pink)]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--background-secondary)] border-2 border-[var(--brand-pink)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-[var(--brand-pink)]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                  Añadir Prenda
                </h3>
                <p className="text-sm text-[var(--foreground-tertiary)]">
                  Sube fotos o escanea URLs de tiendas
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Items Section Header */}
      <div className="px-4 mb-3">
        <h2 className="text-sm font-bold text-[var(--foreground-secondary)]">
          Mis Prendas {filteredItems.length > 0 && `(${filteredItems.length})`}
        </h2>
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
                type={item.category as any}
                color={item.color as any}
                colorHex={(item as any).colorHex || colorMap[(item.color as any) as string] || '#EEEEEE'}
                imageUrl={item.imageUrl || ''}
                price={(item as any).price}
                isFavorite={favorites.has(item.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={() => handleItemClick(item)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="mx-4 p-8 text-center">
          <Plus className="w-12 h-12 text-[var(--brand-pink)] mx-auto mb-3" />
          <p className="text-sm font-bold text-[var(--foreground)] mb-1">Añade una prenda</p>
          <p className="text-xs text-[var(--foreground-tertiary)]">Tu armario te está esperando</p>
          <div className="mt-4">
            <Button onClick={() => setShowAddModal(true)} className="px-4">
              Añadir prenda
            </Button>
          </div>
        </Card>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async (partial) => {
          // delegate persistence to the hook
          await addItem(partial as any);
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
            // Actualizar en la base de datos
            const { error } = await supabase
              .from('users')
              .update({
                age_range: responses.ageRange,
                gender: responses.gender,
                height: responses.height,
                height_range: responses.heightRange,
                preferred_styles: responses.preferredStyles,
                uses_accessories: responses.usesAccessories,
                visual_style_preferences: responses.visualStylePreferences,
                style_completed: true,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);

            if (error) {
              console.error('Error guardando preferencias:', error);
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
      />
    </div>
  );
}
