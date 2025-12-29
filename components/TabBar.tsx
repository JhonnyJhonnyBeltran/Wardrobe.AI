'use client';

/**
 * TabBar - Mobile Navigation (Minimal)
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, MessageCircle, User } from 'lucide-react';

interface TabItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  { href: '/', label: 'Inicio', icon: <Home className="w-6 h-6" /> },
  { href: '/closet', label: 'Armario', icon: <ShoppingBag className="w-6 h-6" /> },
  { href: '/chat', label: 'Chat', icon: <MessageCircle className="w-6 h-6" /> },
  { href: '/profile', label: 'Perfil', icon: <User className="w-6 h-6" /> },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 pb-safe">
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="mx-3 mb-3 glass-strong rounded-3xl shadow-[var(--shadow-float-strong)] border border-[var(--border-color)]"
      >
        <div className="flex justify-around items-center px-2 py-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href} className="relative flex-1">
                <motion.div
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all ${isActive ? 'text-white' : 'text-[var(--foreground-tertiary)]'
                    }`}
                  whileTap={{ scale: 0.92 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] rounded-2xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <motion.span
                    className="relative z-10"
                    animate={{ scale: isActive ? 1.1 : 1 }}
                  >
                    {tab.icon}
                  </motion.span>
                  <span className="relative z-10 text-[10px] font-semibold">{tab.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}
