'use client';

/**
 * TabBar - Floating Apple-Style Liquid Glass Mobile Navigation
 * Interfaz nativa Apple iOS: cápsula flotante con lente de cristal líquido (.apple-glass-bar),
 * refracción cromática prismática activa (efecto lente Apple), respuesta háptica y logo reactivo.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
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
      <LayoutGroup id="mobileTabBar">
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
                  whileTap={{ scale: 0.86 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22, mass: 0.8 }}
                  className="relative flex flex-col items-center justify-center p-2 rounded-full"
                >
                  {/* Lente de cristal líquido activo (Efecto lente Apple con refracción cromática prismática) */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabLiquidGlassLens"
                      className="absolute -inset-x-2.5 sm:-inset-x-3 -inset-y-1 sm:-inset-y-1.5 rounded-full z-0 pointer-events-none"
                      transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.65 }}
                    >
                      {/* Halo exterior de aberración cromática / refracción prismática en el borde */}
                      <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-cyan-400/40 via-[var(--brand-pink,#FF66C4)]/35 to-blue-500/40 opacity-80 blur-[1.5px]" />
                      
                      {/* Cuerpo de la lente de vidrio translúcido */}
                      <div className="relative w-full h-full rounded-full bg-white/45 dark:bg-white/[0.18] backdrop-blur-2xl border border-white/70 dark:border-white/35 shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1.5px_2px_rgba(255,255,255,0.9),inset_0_-1.5px_2px_rgba(0,0,0,0.25)] overflow-hidden">
                        {/* Reflejo especular superior en arco */}
                        <div className="absolute top-0.5 left-2.5 right-2.5 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90 rounded-full" />
                        {/* Brillo ambiental inferior de retorno */}
                        <div className="absolute bottom-0.5 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent opacity-60 rounded-full" />
                      </div>
                    </motion.div>
                  )}

                  {tab.isLogoMark ? (
                    // Center Klozet Brand Icon - Animado klzt/klozet y teñido rosa en active
                    <div className="relative z-10 w-[54px] h-[28px] flex items-center justify-center">
                      <NavbarKlozetLogo isActive={isActive} />
                    </div>
                  ) : (
                    // Active icons en rosa de marca (#FF66C4 / var(--brand-pink)), trazo más grueso y contorno sin relleno
                    <div
                      className={`relative z-10 transition-colors duration-200 ${
                        isActive ? 'text-[var(--brand-pink,#FF66C4)]' : 'text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white'
                      }`}
                    >
                      {React.cloneElement(tab.icon as React.ReactElement<any>, {
                        strokeWidth: isActive ? 2.6 : 1.8,
                        fill: 'none',
                        className: 'w-[23px] h-[23px] transition-[stroke-width] duration-200'
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
      </LayoutGroup>
    </nav>
  );
}
