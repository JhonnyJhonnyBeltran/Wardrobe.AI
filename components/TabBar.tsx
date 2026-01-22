'use client';

/**
 * TabBar - Mobile Navigation (Minimal)
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Search, Send, User, Bot, DoorClosed } from 'lucide-react';
import LogoMark from './LogoMark';
import { useTranslation } from '@/lib/i18n';
import { useUiStore } from '@/store/uiStore';

interface TabItem {
  href: string;
  labelKey: 'home' | 'closet' | 'create' | 'social' | 'profile' | 'search' | 'messages' | 'kloe';
  icon: React.ReactNode;
  isLogoMark?: boolean;
}

export default function TabBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { requestsCount } = useUiStore();

  const tabs: TabItem[] = [
    { href: '/feed', labelKey: 'home', icon: <Home className="w-6 h-6" /> },
    { href: '/search', labelKey: 'search', icon: <Search className="w-6 h-6" /> },
    { href: '/messages', labelKey: 'messages', icon: <Send className="w-5 h-5 -rotate-45" /> },
    { href: '/closet', labelKey: 'closet', icon: null, isLogoMark: true },
    { href: '/chat', labelKey: 'kloe', icon: <Bot className="w-6 h-6" /> },
    { href: '/profile', labelKey: 'profile', icon: <User className="w-6 h-6" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-[var(--background)] border-t border-[var(--border-color)] pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
      <div className="flex justify-between items-center h-16 px-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} className="flex-1 flex justify-center items-center h-full">
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isActive
                  ? 'bg-[var(--brand-pink)] text-white shadow-[0_4px_12px_rgba(255,105,180,0.4)]'
                  : 'text-[var(--foreground-tertiary)]'
                  }`}
              >
                {tab.isLogoMark ? (
                  <div className={`w-8 h-8 flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    <LogoMark size="sm" inverted={isActive} />
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center">
                    {tab.icon}
                    {tab.labelKey === 'search' && requestsCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-[var(--background)] z-20"
                      >
                        {requestsCount > 9 ? '9+' : requestsCount}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
