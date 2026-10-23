'use client';

/**
 * TabBar - Floating Apple-Style Mobile Navigation
 * Barra de navegación móvil flotante estilo cápsula de vidrio Apple (.apple-glass-bar).
 * - Iconos Apple sobrios en reposo (zinc-500, strokeWidth: 1.8).
 * - Icono activo teñido en rosa de marca (#FF66C4) con mayor grosor de trazo (strokeWidth: 2.6).
 * - Logo central interactivo con ciclo klzt -> k -> klozet cada 15s (NavbarKlozetLogo).
 * - Badges reactivos para mensajes y notificaciones con física spring.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Heart, UserRound } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useMessageStore, selectTotalUnread, selectBadgeVisible } from '@/store/messageStore';
import { useRealtimeStore, selectUnreadCount } from '@/store/realtimeStore';
import { triggerHaptic } from '@/lib/haptic';
import NavbarKlozetLogo from './NavbarKlozetLogo';

interface TabItem {
  href: string;
  labelKey: 'home' | 'closet' | 'create' | 'social' | 'profile' | 'search' | 'messages' | 'notifications';
  icon: React.ReactNode;
  isLogoMark?: boolean;
}

export default function TabBar() {
  const pathname = usePathname();
  const { isTabBarHidden: storeTabBarHidden, isCreateMenuOpen } = useUiStore();

  const messageUnreadCount = useMessageStore(selectTotalUnread);
  const messageBadgeVisible = useMessageStore(selectBadgeVisible);
  const notificationUnreadCount = useRealtimeStore(selectUnreadCount);

  const tabs: TabItem[] = [
    { href: '/feed', labelKey: 'home', icon: <Home /> },
    { href: '/search', labelKey: 'search', icon: <Search /> },
    { href: '/closet', labelKey: 'closet', icon: null, isLogoMark: true },
    { href: '/notifications', labelKey: 'notifications', icon: <Heart /> },
    { href: '/profile', labelKey: 'profile', icon: <UserRound /> },
  ];

  // Hide TabBar on deep flows: Messages, Outfit Canvas, Profile Settings
  const hideTabBar =
    storeTabBarHidden ||
    isCreateMenuOpen ||
    pathname.startsWith('/messages') ||
    pathname === '/create' ||
    pathname.startsWith('/profile/settings');

  if (hideTabBar) return null;

  const getBadgeCount = (labelKey: string): number => {
    if (labelKey === 'search') return 0;
    if (labelKey === 'messages') return messageBadgeVisible ? messageUnreadCount : 0;
    if (labelKey === 'notifications') return notificationUnreadCount;
    return 0;
  };

  const hasBadge = (labelKey: string): boolean => {
    return getBadgeCount(labelKey) > 0 && labelKey !== 'search';
  };

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-3.5 sm:bottom-5 left-4 right-4 max-w-sm mx-auto md:hidden z-[5000] will-change-transform isolate pointer-events-none pb-[env(safe-area-inset-bottom)]"
    >
      {/* Floating Apple Glass Capsule */}
      <div
        className="relative flex justify-between items-center h-[58px] px-1.5 rounded-full bg-white/85 dark:bg-[#111113]/85 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.55)] pointer-events-auto select-none"
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/feed' && pathname.startsWith(tab.href + '/'));
          const badgeCount = getBadgeCount(tab.labelKey);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => {
                triggerHaptic('light');
                if (!isActive) {
                  triggerHaptic('medium');
                }
              }}
              className="flex-1 flex justify-center items-center h-full group touch-manipulation z-10"
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                className="relative flex flex-col items-center justify-center p-2 rounded-full"
              >
                {tab.isLogoMark ? (
                  // Center Klozet Brand Icon - klzt -> k -> klozet con rotación y zoom in / shrink
                  <div className="relative z-10 w-[48px] h-[28px] flex items-center justify-center">
                    <NavbarKlozetLogo isActive={isActive} />
                  </div>
                ) : (
                  // Native Outlined Apple Contour Icons
                  <div
                    className={`relative z-10 transition-colors duration-150 ${
                      isActive
                        ? 'text-[var(--brand-pink,#FF66C4)] drop-shadow-[0_2px_10px_rgba(255,102,196,0.45)]'
                        : 'text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white'
                    }`}
                  >
                    {React.cloneElement(tab.icon as React.ReactElement<any>, {
                      strokeWidth: isActive ? 2.6 : 1.8,
                      fill: 'none',
                      className: 'w-[23px] h-[23px] transition-[stroke-width] duration-150',
                    })}

                    {/* Notification Badge with Spring Pop */}
                    <AnimatePresence>
                      {hasBadge(tab.labelKey) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.25, 1] }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 550, damping: 20 }}
                          className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold rounded-full border-2 border-white dark:border-[#111113] shadow-xs pointer-events-none"
                        >
                          {badgeCount > 99 ? '+99' : badgeCount}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
