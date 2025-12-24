'use client';

/**
 * Home Page - Outfit Generator with real fashion data and product images
 * Uses scraped data from fashion magazines and retailers
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Sun, Cloud, Snowflake, Leaf, Wand2, Heart, Share2,
  ShoppingBag, TrendingUp, ExternalLink, RefreshCw
} from 'lucide-react';
import { Card, Button } from '@/components';
import ProductModal from '@/components/ProductModal';
import { OutfitItem, GeneratedOutfit, OutfitStyle } from '@/lib/fashion/outfitGenerator';

// Style options with gradients
const styleOptions: { value: OutfitStyle; label: string; gradient: string }[] = [
  { value: 'quietluxury', label: 'Quiet Luxury', gradient: 'from-stone-400 to-stone-600' },
  { value: 'trending', label: 'Trending', gradient: 'from-pink-500 to-fuchsia-500' },
  { value: 'casual', label: 'Casual', gradient: 'from-blue-400 to-indigo-500' },
  { value: 'streetwear', label: 'Street', gradient: 'from-violet-400 to-purple-500' },
  { value: 'romantic', label: 'Romántico', gradient: 'from-rose-400 to-pink-500' },
  { value: 'business', label: 'Business', gradient: 'from-slate-500 to-gray-700' },
];

const seasons = [
  { value: 'spring', label: 'Primavera', icon: <Leaf className="w-5 h-5" />, gradient: 'from-emerald-400 to-green-500' },
  { value: 'summer', label: 'Verano', icon: <Sun className="w-5 h-5" />, gradient: 'from-amber-400 to-orange-500' },
  { value: 'fall', label: 'Otoño', icon: <Cloud className="w-5 h-5" />, gradient: 'from-orange-400 to-red-500' },
  { value: 'winter', label: 'Invierno', icon: <Snowflake className="w-5 h-5" />, gradient: 'from-sky-400 to-blue-500' },
];

// Saved outfit interface (from database)
interface SavedOutfit extends GeneratedOutfit {
  savedAt: string;
  favorite: boolean;
  views: number;
  shares: number;
}

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState<OutfitStyle | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('winter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState<SavedOutfit | null>(null);
  const [selectedItem, setSelectedItem] = useState<OutfitItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current season on load
  useEffect(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setSelectedSeason('spring');
    else if (month >= 5 && month <= 7) setSelectedSeason('summer');
    else if (month >= 8 && month <= 10) setSelectedSeason('fall');
    else setSelectedSeason('winter');
  }, []);

  const handleGenerate = async () => {
    if (!selectedStyle) return;

    setIsGenerating(true);
    setGeneratedOutfit(null);
    setError(null);

    try {
      const response = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          options: {
            style: selectedStyle,
            occasion: 'everyday',
            season: selectedSeason,
            numberOfOutfits: 1,
            mustIncludeTrends: true,
          },
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.[0]) {
        setGeneratedOutfit(result.data[0]);
      } else {
        setError(result.error || 'Error al generar el outfit');
      }
    } catch (err) {
      console.error('Error generating outfit:', err);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleItemClick = (item: OutfitItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleFavorite = async () => {
    if (!generatedOutfit) return;

    try {
      await fetch('/api/outfits/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'favorite',
          outfitId: generatedOutfit.id,
        }),
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600 p-6 md:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-pink-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-3"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-white/90">Datos reales de moda</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Crea tu look
          </h1>
          <p className="text-white/80 max-w-sm text-sm md:text-base">
            Outfits generados con prendas reales de ELLE, Vogue, Zara, Mango y más
          </p>
        </div>
      </motion.div>

      {/* Style Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-5 gradient-card">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            Estilo
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {styleOptions.map((style, index) => (
              <motion.button
                key={style.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index }}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedStyle(style.value)}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all overflow-hidden ${selectedStyle === style.value
                  ? `bg-gradient-to-br ${style.gradient} text-white shadow-lg`
                  : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-500 hover:shadow-md'
                  }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedStyle === style.value
                  ? 'bg-white/20 backdrop-blur-sm'
                  : `bg-gradient-to-br ${style.gradient}`
                  }`}>
                  <div className="w-3 h-3 rounded-full bg-white" />
                </div>
                <span className={`text-xs font-medium ${selectedStyle === style.value ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                  {style.label}
                </span>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Season Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-5 gradient-card">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sun className="w-3.5 h-3.5 text-white" />
            </div>
            Temporada
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {seasons.map((season, index) => (
              <motion.button
                key={season.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedSeason(season.value)}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${selectedSeason === season.value
                  ? `bg-gradient-to-br ${season.gradient} text-white shadow-lg`
                  : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md'
                  }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedSeason === season.value
                  ? 'bg-white/20 backdrop-blur-sm'
                  : `bg-gradient-to-br ${season.gradient} text-white`
                  }`}>
                  {season.icon}
                </div>
                <span className="text-xs font-medium dark:text-gray-200">{season.label}</span>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center py-4"
      >
        <div className="relative">
          {selectedStyle && !isGenerating && (
            <>
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 blur-xl"
              />
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 blur-2xl"
              />
            </>
          )}
          <Button
            onClick={handleGenerate}
            disabled={!selectedStyle || isGenerating}
            size="lg"
            glow
            className={`relative min-w-[240px] text-base py-4 ${selectedStyle && !isGenerating ? 'animate-pulse-glow' : ''}`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Wand2 className="w-5 h-5" />
                </motion.span>
                Creando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                GENERAR
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-center"
          >
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Outfit Preview */}
      <AnimatePresence mode="wait">
        {generatedOutfit ? (
          <motion.div
            key="outfit"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <Card className="overflow-hidden shadow-xl hover-lift">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 p-5 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{generatedOutfit.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-white/80">
                        {generatedOutfit.totalItems} prendas
                      </span>
                      {generatedOutfit.trendingScore >= 80 && (
                        <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          Top Trending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleFavorite}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${generatedOutfit.favorite ? 'fill-current' : ''}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Description & Trends */}
              <div className="p-4 bg-gradient-to-br from-pink-50 via-white to-violet-50 dark:from-pink-950/30 dark:via-gray-900 dark:to-violet-950/30">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  {generatedOutfit.description}
                </p>
                {generatedOutfit.matchedTrends.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {generatedOutfit.matchedTrends.map((trend, i) => (
                      <span
                        key={i}
                        className="text-xs bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 px-2 py-1 rounded-full font-medium"
                      >
                        #{trend}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Items Grid - With Images */}
              <div className="p-4 dark:bg-gray-900">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md gradient-primary flex items-center justify-center">
                      <ShoppingBag className="w-3 h-3 text-white" />
                    </div>
                    Prendas
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    Pulsa para ver detalles
                  </span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {generatedOutfit.items.map((item, index) => (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * (index + 1) }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleItemClick(item)}
                      className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:border-pink-300 dark:hover:border-pink-500 transition-all"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement?.querySelector('.fallback-color');
                              if (fallback) (fallback as HTMLElement).style.display = 'flex';
                            }}
                          />
                        ) : null}

                        {/* Fallback Color */}
                        <div
                          className={`fallback-color absolute inset-0 flex items-center justify-center ${item.imageUrl ? 'hidden' : ''}`}
                          style={{ backgroundColor: item.colorHex || '#f0f0f0' }}
                        >
                          <ShoppingBag className="w-8 h-8 text-white/50" />
                        </div>

                        {/* Trending Badge */}
                        {item.trending && (
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        )}

                        {/* Price Badge */}
                        {item.price && (
                          <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">{item.price}</span>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                          <span className="text-xs text-white font-medium flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Ver más
                          </span>
                        </div>
                      </div>

                      {/* Item Info */}
                      <div className="p-3">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate mb-0.5">
                          {item.name}
                        </p>
                        <p className="text-xs text-pink-500 dark:text-pink-400 font-medium truncate">
                          {item.brand}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="p-4 bg-gradient-to-r from-pink-50/50 to-violet-50/50 dark:from-pink-950/30 dark:to-violet-950/30 border-t border-gray-100 dark:border-gray-800">
                {/* Price Estimate */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Precio estimado</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{generatedOutfit.estimatedPrice}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${generatedOutfit.priceRange === 'Budget' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' :
                      generatedOutfit.priceRange === 'Mid-Range' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' :
                        generatedOutfit.priceRange === 'Premium' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' :
                          'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                    }`}>
                    {generatedOutfit.priceRange}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-200 hover:border-pink-300 hover:bg-pink-50 dark:border-gray-700 dark:hover:border-pink-500"
                    onClick={handleGenerate}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar
                  </Button>
                  <Button className="flex-1" glow>
                    <Heart className="w-4 h-4 mr-2" />
                    Guardar look
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-8 md:p-10 gradient-card">
              <div className="aspect-square max-w-xs mx-auto bg-gradient-to-br from-pink-100/50 via-white to-violet-100/50 dark:from-pink-900/30 dark:via-gray-900 dark:to-violet-900/30 rounded-3xl flex flex-col items-center justify-center border border-pink-100/50 dark:border-pink-800/30">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-4 shadow-lg"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <p className="text-gray-500 dark:text-gray-400 text-center text-sm px-4">
                  {selectedStyle
                    ? 'Pulsa generar para crear tu outfit con prendas reales'
                    : 'Selecciona un estilo para empezar'}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <ProductModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setSelectedItem(null), 300);
        }}
      />
    </div>
  );
}
