'use client';

/**
 * TabBar - Floating Apple-Style Liquid Glass Mobile Navigation
 * Interfaz nativa Apple iOS con efecto lupa WebGL / Liquid Glass:
 * 1. Pompa de cristal líquido deslizable (Drag-to-Navigate) con captura de puntero táctil.
 * 2. Efecto lupa continuo en los alrededores: los iconos y elementos bajo la lente se magnifican (scale: 1.26),
 *    y los alrededores se dilatan ópticamente simulando refracción convexa continua.
 * 3. Deformación líquida ("pompa") con press bulge, velocity skew y squash & stretch entre pestañas distantes.
 * 4. Micro-hápticos ("sinápticos") de selección al cruzar cada pestaña y pulso de confirmación al soltar.
 * 5. Secuencia de logo cíclica: klzt -> k (mascota con ojos) -> klozet (bubbly wordmark) cada 15s con shrink/zoom.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
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

  // Track previous index for jump distance (squash & stretch)
  const prevIndexRef = useRef(activeIndex);
  const [jumpDistance, setJumpDistance] = useState(0);

  useEffect(() => {
    if (prevIndexRef.current !== activeIndex) {
      setJumpDistance(Math.abs(activeIndex - prevIndexRef.current));
      prevIndexRef.current = activeIndex;
    }
  }, [activeIndex]);

  // Dragging & real-time lens position state
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetPct, setDragOffsetPct] = useState<number | null>(null);
  const [dragVelocity, setDragVelocity] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const prevPointerX = useRef<number | null>(null);
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

  // Current optical center of the lens along the bar (0% to 100%)
  const currentLensCenterPct =
    dragOffsetPct !== null ? dragOffsetPct + 10 : activeIndex * 20 + 10;

  // Calculate magnifying glass (lupa) optical effect for any tab index
  const getTabMagnification = (index: number) => {
    const tabCenterPct = index * 20 + 10;
    const dist = Math.abs(currentLensCenterPct - tabCenterPct);

    // Optical core zone (< 11%): Direct under lens magnification
    if (dist <= 11) {
      const factor = 1 - dist / 11;
      return {
        scale: 1 + 0.24 * factor, // 1.24x magnification at dead-center
        y: -3 * factor,           // Slight optical elevation toward user
        isActiveOptical: true,
        opticalPullX: 0,
      };
    }
    // Optical perimeter zone (11% to 23%): Convex lens fringe swell
    if (dist < 23) {
      const factor = 1 - (dist - 11) / 12;
      const direction = currentLensCenterPct > tabCenterPct ? 1 : -1;
      return {
        scale: 1 + 0.08 * factor, // Subtle swell in surrounding area
        y: -1 * factor,
        isActiveOptical: false,
        opticalPullX: direction * 1.5 * factor, // Optical pull toward lens
      };
    }
    // Resting state
    return {
      scale: 1,
      y: 0,
      isActiveOptical: false,
      opticalPullX: 0,
    };
  };

  // Pointer event handlers for liquid drag
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = e.clientX;
    prevPointerX.current = e.clientX;
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

    if (!isDraggingRef.current && Math.abs(deltaX) > 4) {
      isDraggingRef.current = true;
      setIsDragging(true);
    }

    if (isDraggingRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const tabWidth = rect.width / 5;
      const hovered = Math.max(0, Math.min(4, Math.floor(relativeX / tabWidth)));

      // Velocity calculation for momentum skew
      if (prevPointerX.current !== null) {
        const vel = e.clientX - prevPointerX.current;
        setDragVelocity(vel);
      }
      prevPointerX.current = e.clientX;

      // Clamped percentage for lens left (0% to 80%)
      const pct = Math.max(0, Math.min(80, ((relativeX - tabWidth / 2) / rect.width) * 100));
      setDragOffsetPct(pct);

      // Trigger selection haptic tick when crossing into a new tab zone
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

    if (isDraggingRef.current && barRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const tabWidth = rect.width / 5;
      const targetIndex = Math.max(0, Math.min(4, Math.floor(relativeX / tabWidth)));

      triggerHaptic('medium');

      // Navigate to target tab if changed
      if (tabs[targetIndex] && tabs[targetIndex].href !== pathname) {
        router.push(tabs[targetIndex].href);
      }
    }

    pointerStartX.current = null;
    prevPointerX.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragOffsetPct(null);
    setDragVelocity(0);
  };

  const handlePointerCancel = () => {
    pointerStartX.current = null;
    prevPointerX.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragOffsetPct(null);
    setDragVelocity(0);
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
        className="relative flex justify-between items-center h-[58px] px-1.5 rounded-full bg-white/85 dark:bg-[#111113]/85 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.55)] pointer-events-auto select-none touch-none"
      >
        {/* Pompa de Cristal Líquido (Efecto Lupa con Aberración Cromática y Press Bulge) */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-full z-0 pointer-events-none"
          style={{
            width: 'calc(20% - 4px)',
            left: dragOffsetPct !== null ? `${dragOffsetPct}%` : `calc(${activeIndex * 20}% + 2px)`,
          }}
          animate={
            dragOffsetPct !== null
              ? {
                  scaleX: isDragging ? 1.08 + Math.min(0.14, Math.abs(dragVelocity) * 0.008) : 1,
                  scaleY: isDragging ? 1.10 : 1, // Press bulge idéntico a webgl-liquid-glass
                  skewX: Math.max(-10, Math.min(10, dragVelocity * 0.35)),
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
                  skewX: jumpDistance > 1 ? [0, -6, 3, 0] : 0,
                }
          }
          transition={{
            left: { type: 'spring', stiffness: 440, damping: 28, mass: 0.65 },
            scaleX: { duration: 0.38, times: [0, 0.45, 0.8, 1], ease: 'easeInOut' },
            scaleY: { duration: 0.38, times: [0, 0.45, 0.8, 1], ease: 'easeInOut' },
            skewX: { duration: 0.32, ease: 'easeOut' },
          }}
        >
          {/* Halo de dispersión cromática prismática (RGB split en bordes) */}
          <div className="absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-cyan-400/50 via-[var(--brand-pink,#FF66C4)]/45 to-blue-500/50 opacity-90 blur-[1.5px]" />

          {/* Cuerpo translúcido de la pompa con reflejo Apple Liquid Glass */}
          <div className="relative w-full h-full rounded-full bg-white/50 dark:bg-white/[0.22] backdrop-blur-2xl border border-white/80 dark:border-white/40 shadow-[0_10px_28px_rgba(0,0,0,0.22),inset_0_1.5px_2.5px_rgba(255,255,255,0.95),inset_0_-1.5px_2px_rgba(0,0,0,0.22)] overflow-hidden">
            {/* Reflejo especular superior en arco */}
            <div className="absolute top-0.5 left-2.5 right-2.5 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95 rounded-full" />
            {/* Reflejo de retorno inferior cyan sutil */}
            <div className="absolute bottom-0.5 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent opacity-70 rounded-full" />
          </div>
        </motion.div>

        {/* 5 Tab Items con Efecto Lupa Progresivo en los Alrededores */}
        {tabs.map((tab, index) => {
          const { scale, y, isActiveOptical, opticalPullX } = getTabMagnification(index);
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
                animate={{
                  scale,
                  y,
                  x: opticalPullX,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 24,
                  mass: 0.6,
                }}
                className="relative flex flex-col items-center justify-center p-2 rounded-full will-change-transform"
              >
                {tab.isLogoMark ? (
                  // Center Klozet Brand Icon - klzt -> k -> klozet con rotación y zoom in / shrink
                  <div className="relative z-10 w-[48px] h-[28px] flex items-center justify-center">
                    <NavbarKlozetLogo isActive={isActiveOptical} />
                  </div>
                ) : (
                  // Native Outlined Apple Contour Icons con refracción y aumento bajo lupa
                  <div
                    className={`relative z-10 transition-colors duration-150 ${
                      isActiveOptical
                        ? 'text-[var(--brand-pink,#FF66C4)] drop-shadow-[0_2px_10px_rgba(255,102,196,0.45)]'
                        : 'text-zinc-600 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white'
                    }`}
                  >
                    {React.cloneElement(tab.icon as React.ReactElement<any>, {
                      strokeWidth: isActiveOptical ? 2.6 : 1.8,
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
