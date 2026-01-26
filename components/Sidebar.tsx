'use client';

/**
 * Sidebar - Desktop Navigation (Minimal)
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Search, Send, User, Crown, Bot, DoorClosed } from 'lucide-react';
import { useUser } from '@/store';
import { useTranslation } from '@/lib/i18n';
import { useUiStore } from '@/store/uiStore';
import LogoExtended from './LogoExtended';
import LogoMark from './LogoMark';

interface NavItem {
  href: string;
  labelKey: 'home' | 'closet' | 'create' | 'social' | 'profile' | 'search' | 'messages' | 'kloe';
  icon: React.ReactNode;
  isLogoMark?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isPremium, upgradeToPremiun } = useUser();
  const { t } = useTranslation();
  const { requestsCount, messageRequestsCount } = useUiStore();

  const navItems: NavItem[] = [
    { href: '/feed', labelKey: 'home', icon: <Home className="w-5 h-5" /> },
    { href: '/search', labelKey: 'search', icon: <Search className="w-5 h-5" /> },
    { href: '/messages', labelKey: 'messages', icon: <Send className="w-5 h-5 -rotate-45 translate-x-0.5 translate-y-1" /> },
    { href: '/closet', labelKey: 'closet', icon: null, isLogoMark: true },
    { href: '/chat', labelKey: 'kloe', icon: <Bot className="w-5 h-5" /> },
    { href: '/profile', labelKey: 'profile', icon: <User className="w-5 h-5" /> },
  ];

  // Helper to get badge count for each nav item
  const getBadgeCount = (labelKey: string): number => {
    if (labelKey === 'search') return requestsCount;
    if (labelKey === 'messages') return messageRequestsCount;
    return 0;
  };

  return (
    <aside className="hidden md:flex flex-col w-64 glass border-r border-[var(--border-color)] h-screen sticky top-0 overflow-hidden z-50">
      {/* Logo */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <LogoExtended size="md" className="mb-2" />
        <p className="text-[10px] text-[var(--foreground-tertiary)]">{t.app.tagline}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const badgeCount = getBadgeCount(item.labelKey);

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${isActive
                  ? 'bg-[rgba(255,105,180,0.85)] text-white backdrop-blur-md'
                  : 'text-[var(--foreground-secondary)] hover:bg-[rgba(255,255,255,0.25)] dark:hover:bg-[rgba(255,255,255,0.1)]'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarItem"
                    className="absolute left-0 w-1 h-6 bg-white/80 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">
                  {item.isLogoMark ? (
                    <LogoMark size="sm" inverted={isActive} />
                  ) : (
                    <div className="relative">
                      {item.icon}
                      {badgeCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 flex items-center justify-center bg-red-500 text-white text-[8px] font-bold rounded-full">
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </span>
                      )}
                    </div>
                  )}
                </span>
                <span className={`relative z-10 text-sm font-semibold`}>{t.nav[item.labelKey]}</span>
                {badgeCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Premium */}
      <div className="p-3 border-t border-[var(--border-color)]">
        {isPremium() ? (
          <div className="p-3 rounded-2xl gradient-subtle">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-[var(--brand-pink)]" />
              <span className="font-bold text-sm text-[var(--foreground)]">{t.premium.title}</span>
            </div>
            <p className="text-[10px] text-[var(--foreground-tertiary)]">{t.premium.active}</p>
          </div>
        ) : (
          <button
            onClick={upgradeToPremiun}
            className="w-full p-3 rounded-2xl bg-gradient-to-br from-[var(--brand-pink)]/5 to-[var(--brand-pink-dark)]/5 border border-[var(--border-color)] hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-[var(--brand-pink)]" />
              <span className="font-bold text-sm text-[var(--foreground)]">{t.premium.title}</span>
            </div>
            <p className="text-[10px] text-[var(--foreground-tertiary)] mb-2">{t.premium.unlockAll}</p>
            <div className="w-full bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-pink-dark)] text-white rounded-full py-1.5 text-xs font-bold">
              {t.premium.upgrade}
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}

