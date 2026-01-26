'use client';

/**
 * TabBar - Mobile Navigation (Instagram-like Minimal)
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Send, User } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

// Assuming /klozet-logo-dark.png is a suitable mask (solid shape)
const LOGO_MASK_URL = '/klozet-logo-dark.png';

interface TabItem {
  href: string;
  labelKey: 'home' | 'closet' | 'create' | 'social' | 'profile' | 'search' | 'messages' | 'kloe';
  icon: React.ReactNode;
  isLogoMark?: boolean;
}

export default function TabBar() {
  const pathname = usePathname();
  const { requestsCount, messageRequestsCount } = useUiStore();

  const tabs: TabItem[] = [
    { href: '/feed', labelKey: 'home', icon: <Home /> },
    { href: '/search', labelKey: 'search', icon: <Search /> },
    { href: '/closet', labelKey: 'closet', icon: null, isLogoMark: true },
    { href: '/messages', labelKey: 'messages', icon: <Send className="-rotate-45 mb-0.5 ml-0.5" /> }, // Little nudge for visual balance
    { href: '/profile', labelKey: 'profile', icon: <User /> },
  ];

  // Helper to get badge count for each tab
  const getBadgeCount = (labelKey: string): number => {
    if (labelKey === 'search') return requestsCount;
    if (labelKey === 'messages') return messageRequestsCount;
    return 0;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-[5000]">
      {/* Minimal Glass Background */}
      <div className="absolute inset-0 bg-[var(--background)]/95 backdrop-blur-xl border-t border-[var(--border-color)]/50" />

      <div className="relative flex justify-between items-center h-[72px] px-2 pb-safe">
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
                      strokeWidth: isActive ? 3 : 2, // Thicker stroke for active
                      fill: (isActive && tab.labelKey !== 'search') ? 'currentColor' : 'none', // Fill active (except search)
                      className: `w-[30px] h-[30px]`
                    })}

                    {/* Notification Badge - Minimal Red Dot */}
                    <AnimatePresence>
                      {badgeCount > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-[3px] flex items-center justify-center bg-[#FF3040] text-white text-[10px] font-bold rounded-full border border-[var(--background)] leading-none z-20"
                        >
                          {badgeCount > 9 ? '9+' : badgeCount}
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

