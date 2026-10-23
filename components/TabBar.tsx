'use client';

/**
 * TabBar - Floating Apple-Style Liquid Glass Mobile Navigation
 * Interfaz nativa Apple iOS: cápsula flotante con pompa de cristal líquido interactiva,
 * deslizamiento táctil con arrastre (drag-to-navigate), deformación de burbuja líquida
 * (squash & stretch al saltar de profile a home), respuesta háptica ("sinápticos") y logo reactivo.
 */

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();
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

  // Determine active tab index (0 to 4)
  const currentActiveIndex = tabs.findIndex(
    (tab) => pathname === tab.href || (tab.href !== '/feed' && pathname.startsWith(tab.href + '/'))
  );
  const activeIndex = currentActiveIndex >= 0 ? currentActiveIndex : 0;

  // Track previous index to calculate liquid stretch distance
  const prevIndexRef = useRef(activeIndex);
  const [jumpDistance, setJumpDistance] = useState(0);

  useEffect(() => {
    if (prevIndexRef.current !== activeIndex) {
      setJumpDistance(Math.abs(activeIndex - prevIndexRef.current));
      prevIndexRef.current = activeIndex;
    }
  }, [activeIndex]);

  // Dragging & gesture sliding state
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragHoverIndex, setDragHoverIndex] = useState<number | null>(null);
  const [dragOffsetPct, setDragOffsetPct] = useState<number | null>(null);
  const pointerStartX = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const lastHapticIndex = useRef(activeIndex);

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

  // Pointer event handlers for fluid drag-to-navigate
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = e.clientX;
    isDraggingRef.current = false;
    lastHapticIndex.current = activeIndex;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    triggerHaptic('light');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null || !barRef.current) return;
    const deltaX = e.clientX - pointerStartX.current;

    // Threshold to distinguish tap from drag
    if (!isDraggingRef.current && Math.abs(deltaX) > 5) {
      isDraggingRef.current = true;
      setIsDragging(true);
    }

    if (isDraggingRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const tabWidth = rect.width / 5;
      const hovered = Math.max(0, Math.min(4, Math.floor(relativeX / tabWidth)));

      // Calculate percentage along the 5 tabs (clamped 0% to 80%)
      const pct = Math.max(0, Math.min(80, ((relativeX - tabWidth / 2) / rect.width) * 100));
      setDragOffsetPct(pct);
      setDragHoverIndex(hovered);

      // Trigger selection haptic tick when crossing tab thresholds
      if (hovered !== lastHapticIndex.current) {
        lastHapticIndex.current = hovered;
        triggerHaptic('light');
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (isDraggingRef.current) {
      const targetIndex = dragHoverIndex ?? activeIndex;
      triggerHaptic('medium');

      // Navigate to target tab if changed
      if (tabs[targetIndex] && tabs[targetIndex].href !== pathname) {
        router.push(tabs[targetIndex].href);
      }
    }

    pointerStartX.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragOffsetPct(null);
    setDragHoverIndex(null);
  };

  const handlePointerCancel = () => {
    pointerStartX.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragOffsetPct(null);
    setDragHoverIndex(null);
  };

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-3.5 sm:bottom-5 left-4 right-4 max-w-sm mx-auto md:hidden z-[5000] will-change-transform isolate pointer-events-none pb-[env(safe-area-inset-bottom)]"
    >
      {/* Floating Apple Glass Capsule */}
      <div
        ref={barRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="relative flex justify-between items-center h-[58px] px-1.5 rounded-full bg-white/85 dark:bg-[#111113]/85 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.55)] pointer-events-auto select-none touch-none"
      >
        {/* Lente de cristal líquido / Pompa deslizante e interactiva */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-full z-0 pointer-events-none"
          style={{
            width: 'calc(20% - 4px)',
            left: dragOffsetPct !== null ? `${dragOffsetPct}%` : `calc(${activeIndex * 20}% + 2px)`,
          }}
          animate={
            dragOffsetPct !== null
              ? {
                  scaleX: isDragging ? 1.08 : 1,
                  scaleY: isDragging ? 0.94 : 1,
                }
              : {
                  left: `calc(${activeIndex * 20}% + 2px)`,
                  scaleX:
                    jumpDistance > 1
                      ? [1, 1 + Math.min(0.48, jumpDistance * 0.12), 0.88, 1]
                      : jumpDistance === 1
                      ? [1, 1.14, 0.94, 1]
                      : 1,
                  scaleY:
                    jumpDistance > 1
                      ? [1, Math.max(0.72, 1 - jumpDistance * 0.08), 1.10, 1]
                      : jumpDistance === 1
                      ? [1, 0.92, 1.05, 1]
                      : 1,
                }
          }
          transition={{
            left: { type: 'spring', stiffness: 440, damping: 28, mass: 0.65 },
            scaleX: { duration: 0.38, times: [0, 0.45, 0.8, 1], ease: 'easeInOut' },
            scaleY: { duration: 0.38, times: [0, 0.45, 0.8, 1], ease: 'easeInOut' },
          }}
        >
          {/* Halo de aberración cromática / refracción prismática en el contorno */}
          <div className="absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-cyan-400/50 via-[var(--brand-pink,#FF66C4)]/45 to-blue-500/50 opacity-90 blur-[1.5px]" />

          {/* Cuerpo translúcido de la pompa con reflejo Apple Liquid Glass */}
          <div className="relative w-full h-full rounded-full bg-white/50 dark:bg-white/[0.22] backdrop-blur-2xl border border-white/80 dark:border-white/40 shadow-[0_8px_24px_rgba(0,0,0,0.22),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1.5px_2px_rgba(0,0,0,0.22)] overflow-hidden">
            {/* Reflejo especular superior en arco */}
            <div className="absolute top-0.5 left-2.5 right-2.5 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95 rounded-full" />
            {/* Reflejo de retorno inferior cyan sutil */}
            <div className="absolute bottom-0.5 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent opacity-70 rounded-full" />
          </div>
        </motion.div>

        {/* 5 Tab Items */}
        {tabs.map((tab, index) => {
          const isTabActive = dragHoverIndex !== null ? dragHoverIndex === index : activeIndex === index;
          const badgeCount = getBadgeCount(tab.labelKey);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={(e) => {
                if (isDraggingRef.current) {
                  e.preventDefault();
                  return;
                }
                triggerHaptic('light');
                if (activeIndex !== index) {
                  triggerHaptic('medium');
                }
              }}
              className="flex-1 flex justify-center items-center h-full group touch-manipulation z-10"
            >
              <motion.div
                whileTap={{ scale: 0.86 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22, mass: 0.8 }}
                className="relative flex flex-col items-center justify-center p-2 rounded-full"
              >
                {tab.isLogoMark ? (
                  // Center Klozet Brand Icon - Animado k-bubble/klzt y teñido rosa en active
                  <div className="relative z-10 w-[48px] h-[28px] flex items-center justify-center">
                    <NavbarKlozetLogo isActive={isTabActive} />
                  </div>
                ) : (
                  // Active icons en rosa de marca (#FF66C4 / var(--brand-pink)), trazo más grueso y contorno sin relleno
                  <div
                    className={`relative z-10 transition-colors duration-200 ${
                      isTabActive
                        ? 'text-[var(--brand-pink,#FF66C4)]'
                        : 'text-zinc-600 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white'
                    }`}
                  >
                    {React.cloneElement(tab.icon as React.ReactElement<any>, {
                      strokeWidth: isTabActive ? 2.6 : 1.8,
                      fill: 'none',
                      className: 'w-[23px] h-[23px] transition-[stroke-width] duration-200',
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
