'use client';

/**
 * TabBar - Floating Apple-Style Glass Mobile Navigation
 * Flotante, completamente redondeada (rounded-full) con blur glass Apple
 * e iconos delineados con contorno (sin rellenos planos).
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Heart, UserRound } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useMessageStore, selectTotalUnread, selectBadgeVisible } from '@/store/messageStore';
import { useRealtimeStore, selectUnreadCount } from '@/store/realtimeStore';

const LOGO_MASK_URL = '/klozet-logo-dark.png';

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
      className="fixed bottom-3.5 sm:bottom-5 left-3.5 right-3.5 max-w-md mx-auto md:hidden z-40 will-change-transform isolate pointer-events-none"
    >
      {/* Floating Apple Glass Capsule */}
      <div className="relative flex justify-between items-center h-[62px] px-2 sm:px-3 rounded-full bg-white/80 dark:bg-[#121216]/85 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.55)] pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/feed' && pathname.startsWith(tab.href + '/'));
          const badgeCount = getBadgeCount(tab.labelKey);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex justify-center items-center h-full group touch-manipulation"
            >
              <div className="relative flex flex-col items-center justify-center p-1.5">
                {tab.isLogoMark ? (
                  // Center Klozet Brand Icon
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    className={`
                      w-[28px] h-[28px] transition-colors duration-200
                      ${isActive ? 'bg-[var(--brand-pink)]' : 'bg-[var(--foreground)]'}
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
                  // Outlined Contour Icons (Preserving internal lines and geometry)
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    className={`relative transition-colors duration-200 ${
                      isActive ? 'text-[var(--brand-pink)]' : 'text-[var(--foreground)]'
                    }`}
                  >
                    {React.cloneElement(tab.icon as React.ReactElement<any>, {
                      strokeWidth: isActive ? 2.3 : 1.8,
                      fill: 'none',
                      className: 'w-[26px] h-[26px]'
                    })}

                    {/* Notification Badge */}
                    <AnimatePresence>
                      {hasBadge(tab.labelKey) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-[var(--brand-pink)] text-white text-[9px] font-black rounded-full border-2 border-white dark:border-[#121216] shadow-xs pointer-events-none"
                        >
                          {badgeCount > 99 ? '+99' : badgeCount}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Subtle Active Indicator Dot */}
                {isActive && (
                  <motion.span 
                    layoutId="activeTabDot"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--brand-pink)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
