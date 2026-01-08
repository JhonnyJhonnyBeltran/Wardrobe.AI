'use client';

/**
 * Sidebar - Desktop Navigation (Minimal)
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Wand2, MessageCircle, User, Crown } from 'lucide-react';
import { useUser } from '@/store';
import LogoExtended from './LogoExtended';
import LogoMark from './LogoMark';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  isLogoMark?: boolean;
}

const navItems: NavItem[] = [
  { href: '/feed', label: 'Feed', icon: <Home className="w-5 h-5" /> },
  { href: '/closet', label: 'Armario', icon: <ShoppingBag className="w-5 h-5" /> },
  { href: '/create', label: 'Crear Outfit', icon: null, isLogoMark: true },
  { href: '/chat', label: 'Chat', icon: <MessageCircle className="w-5 h-5" /> },
  { href: '/profile', label: 'Perfil', icon: <User className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isPremium, upgradeToPremiun } = useUser();

  return (
    <aside className="hidden md:flex flex-col w-64 glass border-r border-[var(--border-color)] min-h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <LogoExtended size="md" className="mb-2" />
        <p className="text-[10px] text-[var(--foreground-tertiary)]">Tu estilista personal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
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
                    item.icon
                  )}
                </span>
                <span className={`relative z-10 text-sm font-semibold`}>{item.label}</span>
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
              <span className="font-bold text-sm text-[var(--foreground)]">Premium</span>
            </div>
            <p className="text-[10px] text-[var(--foreground-tertiary)]">Activo</p>
          </div>
        ) : (
          <button
            onClick={upgradeToPremiun}
            className="w-full p-3 rounded-2xl bg-gradient-to-br from-[var(--brand-pink)]/5 to-[var(--brand-pink-dark)]/5 border border-[var(--border-color)] hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-[var(--brand-pink)]" />
              <span className="font-bold text-sm text-[var(--foreground)]">Premium</span>
            </div>
            <p className="text-[10px] text-[var(--foreground-tertiary)] mb-2">Desbloquea todo</p>
            <div className="w-full bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-pink-dark)] text-white rounded-full py-1.5 text-xs font-bold">
              Upgrade
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
