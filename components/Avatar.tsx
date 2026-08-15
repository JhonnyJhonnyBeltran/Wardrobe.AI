/**
 * Avatar Component - Estandarizado para KLOZET
 * Muestra una imagen de perfil o un icono por defecto elegante
 */
'use client';

import Image from 'next/image';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-5 h-5',
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-24 h-24',
};

const textSizes = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-4xl',
};

export default function Avatar({ src, alt = 'Usuario', size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizeClasses[size];
  
  // Check if src is valid (not null, undefined, or empty string)
  const hasValidSrc = src && src.trim() !== '' && !src.startsWith('https://i.pravatar.cc') && !src.startsWith('https://robohash.org') && !src.includes('default user.png') && !src.includes('user_icon_149851');

  // Use the default user image as placeholder for new users
  const defaultAvatar = '/default user.png';

  if (hasValidSrc) {
    return (
      <div className={`relative rounded-full overflow-hidden bg-[var(--background-secondary)] ${sizeClass} ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={size === 'xl' ? '96px' : size === 'lg' ? '48px' : size === 'xs' ? '20px' : '40px'}
        />
      </div>
    );
  }

  // Fallback to letter avatar
  const initial = (alt && alt !== 'Usuario') ? alt.charAt(0).toUpperCase() : '?';
  const textSizeClass = textSizes[size];

  return (
    <div className={`relative rounded-full overflow-hidden bg-gradient-to-br from-[var(--brand-pink)] to-[#d63384] flex items-center justify-center ${sizeClass} ${className}`}>
      <span className={`font-bold text-white leading-none ${textSizeClass}`}>
        {initial}
      </span>
    </div>
  );
}
