'use client';

/**
 * ClothingItem Component - Floating Design (No harsh borders)
 * Apple/Revolut Style - Clean, minimal with subtle depth
 */

import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ClothingItemProps {
  id: string;
  name: string;
  brand?: string;
  type: string;
  color?: string;
  imageUrl: string;
  price?: string;
  isFavorite?: boolean;
  onClick?: () => void;
  onFavoriteToggle?: (id: string) => void;
  className?: string;
}

export const ClothingItem: React.FC<ClothingItemProps> = ({
  id,
  name,
  brand,
  type,
  color,
  imageUrl,
  price,
  isFavorite = false,
  onClick,
  onFavoriteToggle,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`clothing-item group relative cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Floating image container - NO background */}
      <div className="relative aspect-square overflow-hidden rounded-3xl">
        {/* Background glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-subtle opacity-0 group-hover:opacity-100 transition-all duration-300" />
        
        {/* Image with no-background simulation */}
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-contain no-background-image relative z-10 
                     group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.(id);
          }}
          className="absolute top-3 right-3 z-20 p-2 rounded-full glass
                     opacity-0 group-hover:opacity-100
                     transition-all duration-300
                     hover:scale-110 active:scale-95"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite
                ? 'fill-[var(--brand-pink)] stroke-[var(--brand-pink)]'
                : 'stroke-[var(--foreground-secondary)]'
            }`}
          />
        </button>

        {/* Price tag (if available) */}
        {price && (
          <div className="absolute bottom-3 left-3 z-20 px-3 py-1 rounded-full glass-strong
                          opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="text-sm font-semibold">{price}</span>
          </div>
        )}
      </div>

      {/* Info section - Minimal & Clean */}
      <div className="mt-3 px-1">
        {/* Type badge */}
        {type && (
          <span className="inline-block px-2 py-0.5 mb-2 text-xs font-medium rounded-full
                          bg-[var(--background-secondary)] text-[var(--foreground-tertiary)]">
            {type}
          </span>
        )}

        {/* Name */}
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-0.5 truncate">
          {name}
        </h3>

        {/* Brand */}
        {brand && (
          <p className="text-xs text-[var(--foreground-tertiary)] truncate">
            {brand}
          </p>
        )}

        {/* Color indicator */}
        {color && (
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-4 h-4 rounded-full border border-[var(--border-color)]"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-[var(--foreground-tertiary)]">
              {color}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClothingItem;
