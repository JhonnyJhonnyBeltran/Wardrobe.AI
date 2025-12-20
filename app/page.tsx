'use client';

/**
 * Home Page - Outfit Generator with premium visual design
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sun, Cloud, Snowflake, Leaf, Wand2, Heart, Share2 } from 'lucide-react';
import { Card, Button } from '@/components';
import { mockOutfits, styleOptions } from '@/data/mockOutfits';

const seasons = [
  { value: 'spring', label: 'Primavera', icon: <Leaf className="w-5 h-5" />, gradient: 'from-green-400 to-emerald-500' },
  { value: 'summer', label: 'Verano', icon: <Sun className="w-5 h-5" />, gradient: 'from-yellow-400 to-orange-500' },
  { value: 'fall', label: 'Otoño', icon: <Cloud className="w-5 h-5" />, gradient: 'from-orange-400 to-red-500' },
  { value: 'winter', label: 'Invierno', icon: <Snowflake className="w-5 h-5" />, gradient: 'from-blue-400 to-indigo-500' },
];

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('winter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState<typeof mockOutfits[0] | null>(null);

  const handleGenerate = () => {
    if (!selectedStyle) return;

    setIsGenerating(true);
    setGeneratedOutfit(null);

    // Simulate AI generation
    setTimeout(() => {
      const randomOutfit = mockOutfits[Math.floor(Math.random() * mockOutfits.length)];
      setGeneratedOutfit(randomOutfit);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Section with Gradient Background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-violet-600 p-6 md:p-8 text-white"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-300/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-2"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium text-white/90">Tu estilista personal con IA</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Crea tu look perfecto
          </h1>
          <p className="text-white/80 max-w-md">
            Deja que la inteligencia artificial genere outfits increíbles basados en tu estilo y la temporada
          </p>
        </div>
      </motion.div>

      {/* Style Selection with Gradient Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-br from-white to-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            ¿Qué estilo buscas?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {styleOptions.map((style, index) => (
              <motion.button
                key={style.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedStyle(style.value)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all overflow-hidden ${selectedStyle === style.value
                    ? 'border-transparent bg-gradient-to-br from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-200'
                    : 'border-gray-100 hover:border-pink-200 bg-white hover:shadow-md'
                  }`}
              >
                {selectedStyle === style.value && (
                  <motion.div
                    layoutId="selectedStyle"
                    className="absolute inset-0 bg-gradient-to-br from-pink-500 to-violet-500"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 text-2xl ${selectedStyle === style.value ? 'grayscale-0' : ''}`}>
                  {style.icon}
                </span>
                <span className={`relative z-10 text-sm font-medium ${selectedStyle === style.value ? 'text-white' : 'text-gray-900'}`}>
                  {style.label}
                </span>
                <span className={`relative z-10 text-xs ${selectedStyle === style.value ? 'text-white/80' : 'text-gray-500'}`}>
                  {style.description}
                </span>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Season Selection with Gradient Icons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 bg-gradient-to-br from-white to-violet-50/30">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sun className="w-4 h-4 text-white" />
            </div>
            Temporada
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {seasons.map((season, index) => (
              <motion.button
                key={season.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedSeason(season.value)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all overflow-hidden ${selectedSeason === season.value
                    ? 'bg-gradient-to-br text-white shadow-lg'
                    : 'bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-md'
                  } ${selectedSeason === season.value ? season.gradient : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedSeason === season.value
                    ? 'bg-white/20'
                    : `bg-gradient-to-br ${season.gradient} text-white`
                  }`}>
                  {season.icon}
                </div>
                <span className="text-sm font-medium">{season.label}</span>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Generate Button with Animated Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center py-6"
      >
        <div className="relative">
          {/* Animated rings */}
          {selectedStyle && !isGenerating && (
            <>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 blur-xl"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 blur-2xl"
              />
            </>
          )}
          <Button
            onClick={handleGenerate}
            disabled={!selectedStyle || isGenerating}
            size="lg"
            glow
            className={`relative min-w-[280px] text-lg py-5 ${selectedStyle && !isGenerating ? 'animate-pulse-glow' : ''
              }`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-3">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Wand2 className="w-5 h-5" />
                </motion.span>
                Creando magia...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                GENERAR OUTFIT
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Generated Outfit Preview with Premium Design */}
      <AnimatePresence mode="wait">
        {generatedOutfit ? (
          <motion.div
            key="outfit"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <Card className="overflow-hidden shadow-xl">
              {/* Header with Gradient */}
              <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 p-6 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{generatedOutfit.style}</h3>
                    <p className="text-sm text-white/80 mt-1">Tu look personalizado está listo</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* AI Description with Gradient Background */}
              <div className="p-5 bg-gradient-to-br from-pink-50 via-white to-violet-50">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {generatedOutfit.description}
                </p>
              </div>

              {/* Items Grid with Hover Effects */}
              <div className="p-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
                    <span className="text-white text-xs">4</span>
                  </div>
                  Prendas del look
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {generatedOutfit.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                      whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)' }}
                      className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 text-center border border-gray-100 cursor-pointer transition-all"
                    >
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{item.imageEmoji}</div>
                      <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Actions with Gradient Border */}
              <div className="p-5 bg-gradient-to-r from-pink-50/50 to-violet-50/50 border-t border-gray-100 flex gap-3">
                <Button variant="outline" className="flex-1 border-gray-200" onClick={handleGenerate}>
                  Regenerar
                </Button>
                <Button className="flex-1" glow>
                  Guardar look
                </Button>
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
            <Card className="p-8 md:p-12 bg-gradient-to-br from-white via-pink-50/30 to-violet-50/50">
              <div className="aspect-square max-w-sm mx-auto bg-gradient-to-br from-pink-100/50 via-white to-violet-100/50 rounded-3xl flex flex-col items-center justify-center border border-pink-100/50">
                <motion.div
                  animate={{
                    y: [0, -12, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl mb-4"
                >
                  👗
                </motion.div>
                <p className="text-gray-500 text-center px-4">
                  {selectedStyle
                    ? 'Pulsa el botón para generar tu outfit'
                    : 'Selecciona un estilo para empezar'}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
