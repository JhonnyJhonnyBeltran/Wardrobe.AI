'use client';

/**
 * ClothingItem Component - Floating Design (No harsh borders)
 * Apple/Revolut Style - Clean, minimal with subtle depth
 */

import React, { useState } from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ClothingItemProps {
  id: string;
  name: string;
  brand?: string;
  type: string;
  color?: string;
  colorHex?: string;
  imageUrl: string;
  price?: string;
  isFavorite?: boolean;
  onClick?: () => void;
  onFavoriteToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const ClothingItem: React.FC<ClothingItemProps> = ({
  id,
  name,
  brand,
  type,
  color,
  colorHex,
  imageUrl,
  price,
  isFavorite = false,
  onClick,
  onFavoriteToggle,
  onDelete,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    onFavoriteToggle?.(id);
    // Reset animation after it completes
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Seguro que quieres eliminar esta prenda?')) {
      onDelete?.(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`clothing-item group relative cursor-pointer focus:outline-none ${className}`}
      onClick={onClick}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Card Container */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] transition-all duration-500">

        {/* Background Gradient/Color - Subtle tint based on item color */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          style={{
            background: colorHex ? `linear-gradient(135deg, ${colorHex}, transparent)` : 'var(--gradient-primary)'
          }}
        />

        {/* Image or Placeholder */}
        <div className="w-full h-full flex items-center justify-center relative z-10">
          {!imageError && imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[var(--foreground-tertiary)] animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-[var(--background-secondary)] flex items-center justify-center mb-2 shadow-inner">
                <ShoppingBag className="w-8 h-8 opacity-30" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Favorite button - Always visible */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleFavoriteClick}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full bg-black/20 dark:bg-white/20 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-0
                     ${isFavorite ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
        >
          <motion.div
            animate={isAnimating ? {
              scale: [1, 1.4, 0.9, 1.2, 1],
            } : { scale: 1 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
              times: [0, 0.2, 0.4, 0.7, 1]
            }}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${isFavorite
                ? 'fill-[var(--brand-pink)] stroke-[var(--brand-pink)]'
                : 'stroke-white hover:stroke-[var(--brand-pink)]'
                }`}
            />
          </motion.div>
        </motion.button>

        {/* Delete button */}
        {onDelete && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDeleteClick}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className="absolute top-3 left-3 z-20 p-2 rounded-full bg-red-500 backdrop-blur-sm opacity-90 group-hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-0 hover:bg-red-600 shadow-lg"
          >
            <Trash2 className="w-5 h-5 stroke-white" />
          </motion.button>
        )}

        {/* Price tag */}
        {price && (
          <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 rounded-full glass-strong
                          opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <span className="text-xs font-bold bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-pink-dark)] bg-clip-text text-transparent">
              {price}
            </span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="mt-3 px-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-[var(--foreground)] truncate leading-tight group-hover:text-[var(--brand-pink)] transition-colors">
              {name}
            </h3>
            {brand && (
              <p className="text-xs text-[var(--foreground-tertiary)] truncate mt-0.5 font-medium">
                {brand}
              </p>
            )}
          </div>
          {/* Color Dot */}
          {colorHex && (
            <div
              className="w-3 h-3 rounded-full border border-[var(--border-color)] shadow-sm flex-shrink-0 mt-1 ring-2 ring-transparent group-hover:ring-[var(--brand-pink)]/20 transition-all"
              style={{ backgroundColor: colorHex }}
              title={color}
            />
          )}
        </div>

        {/* Type Badge */}
        {type && (
          <div className="mt-2 flex flex-wrap gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md
                                bg-[var(--background-secondary)] text-[var(--foreground-secondary)] uppercase tracking-wider">
              {type}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClothingItem;
