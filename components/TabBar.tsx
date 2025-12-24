'use client';

/**
 * TabBar - Mobile navigation with floating iOS-style design
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, MessageCircle, User } from 'lucide-react';

interface TabItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  { href: '/', label: 'Home', icon: <Sparkles className="w-5 h-5" /> },
  { href: '/closet', label: 'Armario', icon: <ShoppingBag className="w-5 h-5" /> },
  { href: '/chat', label: 'Chat', icon: <MessageCircle className="w-5 h-5" /> },
  { href: '/profile', label: 'Perfil', icon: <User className="w-5 h-5" /> },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 md:hidden z-50">
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="glass-strong rounded-full shadow-xl px-2 py-2 border border-white/50 dark:border-gray-700/50"
      >
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center justify-center flex-1 py-2"
              >
                <motion.div
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-colors ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Active Background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 gradient-primary rounded-full shadow-lg"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <motion.span
                    className="relative z-10"
                    animate={{ scale: isActive ? 1.1 : 1 }}
                  >
                    {tab.icon}
                  </motion.span>
                  <span className={`relative z-10 text-xs font-medium ${isActive ? 'text-white' : ''}`}>
                    {tab.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}
