'use client';

/**
 * Sidebar - Desktop navigation with glassmorphism and Wardrobe.AI branding
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, MessageCircle, User, Crown } from 'lucide-react';
import { useUser } from '@/store';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: <Sparkles className="w-5 h-5" /> },
  { href: '/closet', label: 'Armario', icon: <ShoppingBag className="w-5 h-5" /> },
  { href: '/chat', label: 'Chat IA', icon: <MessageCircle className="w-5 h-5" /> },
  { href: '/profile', label: 'Perfil', icon: <User className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isPremium, upgradeToPremiun } = useUser();

  return (
    <aside className="hidden md:flex flex-col w-64 glass border-r border-gray-100/50 min-h-screen">
      {/* Logo */}
      <div className="p-6">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold gradient-text"
        >
          Wardrobe.AI
        </motion.h1>
        <p className="text-xs text-gray-500 mt-1">Tu asistente de moda IA</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${isActive
                  ? 'text-pink-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarItem"
                    className="absolute inset-0 bg-pink-50 rounded-2xl"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className={`relative z-10 ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Premium CTA / Status */}
      <div className="p-4">
        {isPremium() ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-pink-50 to-violet-50 rounded-2xl p-4 border border-pink-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-pink-500" />
              <span className="font-semibold text-gray-900 text-sm">Premium Activo</span>
            </div>
            <p className="text-xs text-gray-600">
              Disfruta de acceso ilimitado a todo tu historial ✨
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-pink-50 to-violet-50 rounded-2xl p-4"
          >
            <p className="text-sm font-medium text-gray-900 mb-2">
              Pásate a Premium 👑
            </p>
            <p className="text-xs text-gray-600 mb-3">
              Desbloquea historial ilimitado y más
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={upgradeToPremiun}
              className="w-full gradient-primary text-white rounded-full py-2 text-sm font-medium glow-effect"
            >
              Ir a Premium
            </motion.button>
          </motion.div>
        )}
      </div>
    </aside>
  );
}
