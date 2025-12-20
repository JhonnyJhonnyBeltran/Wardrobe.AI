'use client';

/**
 * Closet Page - Wardrobe with Freemium Logic
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Grid, List, Plus } from 'lucide-react';
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            Mi Armario
          </h1>
          <p className="text-gray-600">
            {isPremium()
              ? 'Todo tu historial disponible'
              : `Últimos ${freeLimit} looks visibles`}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {!isPremium() && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium rounded-full transition-all ${activeTab === tab
              ? 'gradient-primary text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {tab === 'outfits' ? '✨ Outfits' : '👕 Prendas'}
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
          <Card className="p-5 bg-gradient-to-r from-pink-50 via-white to-violet-50 border border-pink-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Desbloquea tu historial completo 🔓
                  </h3>
                  <p className="text-sm text-gray-600">
                    Solo puedes ver los últimos {freeLimit} outfits. ¡Pásate a Premium!
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
          <Card className="p-12 text-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl mb-4"
            >
              👚
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tu armario está vacío
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Añade prendas para que la IA pueda crear outfits personalizados con tu ropa
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