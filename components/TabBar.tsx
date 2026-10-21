'use client';

/**
 * TabBar - Floating Apple-Style Glass Mobile Navigation
 * Interfaz nativa Apple iOS: cápsula flotante con vidrio translúcido (.apple-glass-bar),
 * respuesta elástica al toque con rebote físico y el logo oficial de Klozet.
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Heart, UserRound } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useMessageStore, selectTotalUnread, selectBadgeVisible } from '@/store/messageStore';
import { useRealtimeStore, selectUnreadCount } from '@/store/realtimeStore';
import { triggerHaptic } from '@/lib/haptic';

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

  // Hide TabBar on deep flows: Messages, Outfit Canvas, Profile Settings
  const hideTabBar =
    storeTabBarHidden ||
    isCreateMenuOpen ||
    pathname.startsWith('/messages') ||
    pathname === '/create' ||
    pathname.startsWith('/profile/settings');
  if (hideTabBar) return null;

  const tabs: TabItem[] = [
    { href: '/feed', labelKey: 'home', icon: <Home /> },
    { href: '/search', labelKey: 'search', icon: <Search /> },
    { href: '/closet', labelKey: 'closet', icon: null, isLogoMark: true },
    { href: '/notifications', labelKey: 'notifications', icon: <Heart /> },
    { href: '/profile', labelKey: 'profile', icon: <UserRound /> },
  ];

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
      className="fixed bottom-3.5 sm:bottom-5 left-4 right-4 max-w-sm mx-auto md:hidden z-40 will-change-transform isolate pointer-events-none pb-[env(safe-area-inset-bottom)]"
    >
      {/* Floating Apple Glass Capsule */}
      <div className="relative flex justify-between items-center h-[58px] px-2 rounded-full bg-white/80 dark:bg-[#111113]/85 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/feed' && pathname.startsWith(tab.href + '/'));
          const badgeCount = getBadgeCount(tab.labelKey);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => {
                try {
                  triggerHaptic('light');
                } catch {}
              }}
              className="flex-1 flex justify-center items-center h-full group touch-manipulation"
            >
              <motion.div 
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22, mass: 0.8 }}
                className="relative flex flex-col items-center justify-center p-2 rounded-full"
              >
                {/* Círculo Glassmorphic alrededor de la pantalla activa (reemplaza el brillo y punto rosa) */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlassCircle"
                    className="absolute inset-0 -m-1 rounded-full bg-black/[0.07] dark:bg-white/[0.14] backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.16] shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                  />
                )}

                {tab.isLogoMark ? (
                  // Center Klozet Official Icon - Entero en negro
                  <div className="relative w-[28px] h-[28px] flex items-center justify-center">
                    <Image
                      src="/klozet-logo.png"
                      alt="Armario"
                      width={28}
                      height={28}
                      priority
                      className={`object-contain transition-transform duration-200 brightness-0 ${
                        isActive ? 'scale-105 opacity-100' : 'opacity-60 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                ) : (
                  // Native Outlined Apple Contour Icons - Sin cambio de color rosa, sobrio en negro/zinc
                  <div
                    className={`relative transition-colors duration-200 ${
                      isActive ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
                    }`}
                  >
                    {React.cloneElement(tab.icon as React.ReactElement<any>, {
                      strokeWidth: isActive ? 2.2 : 1.8,
                      fill: 'none',
                      className: 'w-[23px] h-[23px]'
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
