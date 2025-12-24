'use client';

/**
 * Closet Page - Wardrobe with Freemium Logic
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Shirt, Plus } from 'lucide-react';
import { Card, Button, OutfitCard, ItemDetailModal } from '@/components';
import { useUser } from '@/store';
import { mockOutfits, MockOutfit } from '@/data/mockOutfits';

export default function ClosetPage() {
  const { isPremium, upgradeToPremiun } = useUser();
  const [activeTab, setActiveTab] = useState<'outfits' | 'items'>('outfits');
  const [selectedOutfit, setSelectedOutfit] = useState<MockOutfit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const freeLimit = 3;

  const handleOutfitClick = (outfit: MockOutfit) => {
    setSelectedOutfit(outfit);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Mi Armario
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isPremium()
              ? 'Historial completo disponible'
              : `Últimos ${freeLimit} looks`}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {!isPremium() && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={upgradeToPremiun} glow>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        {(['outfits', 'items'] as const).map((tab) => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-full transition-all ${activeTab === tab
              ? 'gradient-primary text-white shadow-md'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-pink-200 dark:hover:border-pink-500 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            {tab === 'outfits' ? <Sparkles className="w-4 h-4" /> : <Shirt className="w-4 h-4" />}
            {tab === 'outfits' ? 'Outfits' : 'Prendas'}
          </motion.button>
        ))}
      </motion.div>

      {/* Freemium Banner */}
      {!isPremium() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-gradient-to-r from-pink-50 via-white to-violet-50 dark:from-pink-950/30 dark:via-gray-900 dark:to-violet-950/30 border border-pink-100/50 dark:border-pink-800/30 hover-lift">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Desbloquea historial completo
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Solo ves los últimos {freeLimit} outfits
                  </p>
                </div>
              </div>
              <Button onClick={upgradeToPremiun} glow className="whitespace-nowrap">
                Ir a Premium
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Outfits Grid */}
      {activeTab === 'outfits' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        >
          {mockOutfits.map((outfit, index) => {
            const isLocked = !isPremium() && index >= freeLimit;
            return (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                isLocked={isLocked}
                index={index}
                onClick={() => handleOutfitClick(outfit)}
              />
            );
          })}
        </motion.div>
      )}

      {/* Items Tab - Empty State */}
      {activeTab === 'items' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-10 text-center gradient-card">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 mx-auto mb-4 rounded-3xl gradient-primary flex items-center justify-center shadow-lg"
            >
              <Shirt className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Tu armario está vacío
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Añade prendas para outfits personalizados
            </p>
            <Button glow>
              <Plus className="w-5 h-5 mr-2" />
              Añadir prenda
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        outfit={selectedOutfit}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}