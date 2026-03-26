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

export default function Avatar({ src, alt = 'Usuario', size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizeClasses[size];
  
  // Check if src is valid (not null, undefined, or empty string)
  const hasValidSrc = src && src.trim() !== '' && !src.startsWith('https://i.pravatar.cc') && !src.startsWith('https://robohash.org');

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

  // Fallback to user_icon_149851.svg (elegant minimal avatar)
  // If image fails to load, fall back to User icon
  return (
    <div className={`relative rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center ${sizeClass} ${className}`}>
      <Image
        src={defaultAvatar}
        alt={alt}
        fill
        className="object-cover p-2"
        sizes={size === 'xl' ? '96px' : size === 'lg' ? '48px' : size === 'xs' ? '20px' : '40px'}
        onError={(e) => {
          // Hide the image and show the icon instead
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <User className={`absolute text-gray-400 dark:text-gray-300 ${size === 'xl' ? 'w-12 h-12' : size === 'lg' ? 'w-6 h-6' : size === 'xs' ? 'w-3 h-3' : 'w-1/2 h-1/2'}`} strokeWidth={1.5} />
    </div>
  );
}
