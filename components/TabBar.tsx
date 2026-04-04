'use client';

/**
 * TabBar - Mobile Navigation (Instagram-like Minimal)
 * Con sistema de notificaciones de mensajes modular
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Heart, UserRound, Mail } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useMessageStore, selectTotalUnread, selectBadgeVisible } from '@/store/messageStore';
import { useRealtimeStore, selectUnreadCount } from '@/store/realtimeStore';

// Assuming /klozet-logo-dark.png is a suitable mask (solid shape)
const LOGO_MASK_URL = '/klozet-logo-dark.png';

interface TabItem {
  href: string;
  labelKey: 'home' | 'closet' | 'create' | 'social' | 'profile' | 'search' | 'messages' | 'notifications' | 'kloe';
  icon: React.ReactNode;
  isLogoMark?: boolean;
}

// Icono personalizado para estado activo de perfil (Relleno sólido)
const UserFilledIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

export default function TabBar() {
  const pathname = usePathname();
  const { requestsCount } = useUiStore();

  // Message notifications from new store
  const messageUnreadCount = useMessageStore(selectTotalUnread);
  const messageBadgeVisible = useMessageStore(selectBadgeVisible);
  const notificationUnreadCount = useRealtimeStore(selectUnreadCount);

  // Hide TabBar on deep flows (Contexto §3): Chat, Editor de Outfit, Configuración
  const hideTabBar =
    (pathname.startsWith('/messages/') && pathname !== '/messages') ||
    pathname === '/create' ||
    pathname.startsWith('/profile/settings');
  if (hideTabBar) return null;

  const tabs: TabItem[] = [
    { href: '/feed', labelKey: 'home', icon: <Home /> },
    { href: '/search', labelKey: 'search', icon: <Search /> },
    { href: '/closet', labelKey: 'closet', icon: null, isLogoMark: true },
    { href: '/notifications', labelKey: 'notifications', icon: <Heart /> }, // Heart icon for Notifications/Activity
    { href: '/profile', labelKey: 'profile', icon: <UserRound /> },
  ];

  // Helper to get badge count for each tab
  const getBadgeCount = (labelKey: string): number => {
    if (labelKey === 'search') return 0; // Explicitly 0 for search
    // Messages uses the new store with badge visibility logic
    if (labelKey === 'messages') return messageBadgeVisible ? messageUnreadCount : 0;
    // Notifications logic (Heart Icon)
    if (labelKey === 'notifications') return notificationUnreadCount;
    return 0;
  };

  // Check if we should show a badge at all
  const hasBadge = (labelKey: string): boolean => {
    return getBadgeCount(labelKey) > 0 && labelKey !== 'search';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-[5000] pb-safe bg-[var(--background)]/80 backdrop-blur-xl border-t border-[var(--border-color)]/50">
      <div className="relative flex justify-between items-center h-[72px] px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/feed' && pathname.startsWith(tab.href + '/'));
          const badgeCount = getBadgeCount(tab.labelKey);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex justify-center items-center h-full group touch-manipulation"
            >
              <div className="relative flex items-center justify-center p-2">
                {tab.isLogoMark ? (
                  // Center Logo - Masked for dynamic painting
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`
                      w-[32px] h-[32px] transition-colors duration-200
                      ${isActive ? 'bg-[var(--brand-pink)]' : 'bg-black dark:bg-white'}
                    `}
                    style={{
                      maskImage: `url(${LOGO_MASK_URL})`,
                      WebkitMaskImage: `url(${LOGO_MASK_URL})`,
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                    }}
                  />
                ) : (
                  // Standard Icons
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`relative transition-colors duration-200 ${isActive
                      ? 'text-[var(--brand-pink)]'
                      : 'text-black dark:text-white'
                      }`}
                  >
                    {/* Icon */}
                    {React.cloneElement(tab.icon as React.ReactElement<any>, {
                      strokeWidth: isActive ? (['profile', 'home'].includes(tab.labelKey) ? 3.5 : 3) : 2, // Extra bold for profile/home
                      // Only fill Heart (messages), keep others outlined
                      fill: (isActive && tab.labelKey === 'messages') ? 'currentColor' : 'none',
                      className: `w-[30px] h-[30px]`
                    })}

                    {/* Notification Badge */}
                    <AnimatePresence>
                      {hasBadge(tab.labelKey) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-[3px] flex items-center justify-center bg-[var(--brand-pink)] text-white text-[10px] font-bold rounded-full leading-none z-20"
                        >
                          {badgeCount > 99 ? '+99' : badgeCount}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
