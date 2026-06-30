'use client';

/**
 * ClothingItem Component - Floating Design (No harsh borders)
 * Apple/Revolut Style - Clean, minimal with subtle depth
 * OPTIMIZED: Uses Next.js Image for better performance
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

export interface ClothingItemProps {
  id: string;
  name: string;
  brand?: string;
  type: string;
  color?: string;
  colorHex?: string;
  imageUrl: string;
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
  isFavorite = false,
  onClick,
  onFavoriteToggle,
  onDelete,
  className = '',
}) => {
  const { t } = useTranslation();
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
    // La confirmación ya la maneja el componente padre (ClosetPage) con el modal del sistema
    onDelete?.(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`clothing-item group relative cursor-pointer focus:outline-none ${className}`}
      onClick={onClick}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Card Container */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#f8f9fa] dark:bg-[#111] border border-[var(--border-color)]">

        {/* Image or Placeholder */}
        <div className="w-full h-full flex items-center justify-center relative z-10">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-contain p-2"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[var(--foreground-tertiary)] animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-[var(--background-secondary)] flex items-center justify-center mb-2 shadow-inner">
                <ShoppingBag className="w-8 h-8 opacity-30" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">{t.common.noImage}</span>
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

        {/* Delete button (Custom Animated) */}
        {onDelete && (
          <motion.button
            onClick={handleDeleteClick}
            initial="idle"
            whileHover="hover"
            whileTap="active"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className="absolute top-3 left-3 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-black/70 hover:shadow-md border border-white/20"
          >
            <motion.svg
              viewBox="0 -10 64 74"
              className="w-6 h-6 overflow-visible"
              variants={{
                idle: { rotate: 0, scale: 1 },
                hover: { rotate: 3, scale: 1.08, filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" },
                active: { rotate: -1, scale: 0.96 }
              }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }} // Custom bezier from request
            >
              <g id="trash-can">
                <rect
                  x="16"
                  y="24"
                  width="32"
                  height="30"
                  rx="3"
                  ry="3"
                  fill="#ff4d4f"
                />

                <motion.g
                  style={{ originX: "12px", originY: "18px" }} // Explicit origin from request
                  variants={{
                    idle: { rotate: 0, y: 0, scale: 1 },
                    hover: { rotate: -28, y: 2 },
                    active: { rotate: -12, scale: 0.98, y: 0 }
                  }}
                  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <rect
                    x="12"
                    y="12"
                    width="40"
                    height="6"
                    rx="2"
                    ry="2"
                    fill="#e03e3e"
                  />
                  <rect
                    x="26"
                    y="8"
                    width="12"
                    height="4"
                    rx="2"
                    ry="2"
                    fill="#e03e3e"
                  />
                </motion.g>
              </g>
            </motion.svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default ClothingItem;
