'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  src?: string | null;
  name?: string;
  username?: string;
}

export default function AvatarModal({
  isOpen,
  onClose,
  src,
  name,
  username
}: AvatarModalProps) {
  if (!isOpen) return null;

  const hasValidSrc = src && src.trim() !== '' && !src.startsWith('https://i.pravatar.cc') && !src.startsWith('https://robohash.org') && !src.includes('default user.png') && !src.includes('user_icon_149851');
  const initial = (name || username || '?').charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative z-10 flex flex-col items-center max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Large Avatar Container - Pure circle, no borders or colorful rings */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden shadow-2xl mb-6 bg-[#121216]">
            {hasValidSrc ? (
              <Image
                src={src!}
                alt={name || username || 'Avatar'}
                fill
                className="object-cover"
                sizes="320px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[var(--brand-pink)]">
                <span className="text-7xl font-bold text-white leading-none select-none">
                  {initial}
                </span>
              </div>
            )}
          </div>

          {/* User Details */}
          {(name || username) && (
            <div className="text-center px-4">
              {name && (
                <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                  {name}
                </h3>
              )}
              {username && (
                <p className="text-sm font-medium text-white/70 mt-0.5">
                  @{username}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
