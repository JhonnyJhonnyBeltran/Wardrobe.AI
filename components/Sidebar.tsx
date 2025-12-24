'use client';

/**
 * Sidebar - Desktop navigation with glassmorphism and Klozet branding
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, MessageCircle, User, Crown, Moon, Sun } from 'lucide-react';
import { useUser, useTheme } from '@/store';

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
  const { isDark, toggleTheme } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 glass border-r border-gray-100/50 dark:border-gray-800/50 min-h-screen">
      {/* Logo & Theme Toggle */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <img
              src={isDark ? "/klozet-logo-dark.png" : "/klozet-logo.png"}
              alt="Klozet"
              className="h-12 w-auto"
            />
          </motion.div>

          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.div>
          </motion.button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Tu asistente de moda</p>
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
                  ? 'text-pink-600 dark:text-pink-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarItem"
                    className="absolute inset-0 bg-gradient-to-r from-pink-50 to-violet-50 dark:from-pink-900/30 dark:to-violet-900/30 rounded-2xl"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.span
                  className="relative z-10"
                  whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                >
                  {item.icon}
                </motion.span>
                <span className={`relative z-10 ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
                {/* Hover indicator */}
                {!isActive && (
                  <motion.div
                    className="absolute left-0 w-1 h-6 bg-gradient-to-b from-pink-400 to-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
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
            className="bg-gradient-to-br from-pink-50 to-violet-50 dark:from-pink-900/30 dark:to-violet-900/30 rounded-2xl p-4 border border-pink-100/50 dark:border-pink-800/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">Premium</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Acceso ilimitado activo
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-pink-50 to-violet-50 dark:from-pink-900/30 dark:to-violet-900/30 rounded-2xl p-4 cursor-pointer"
            onClick={upgradeToPremiun}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">Premium</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Desbloquea todo el historial
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full gradient-primary text-white rounded-full py-2 text-sm font-medium glow-effect"
            >
              Upgrade
            </motion.button>
          </motion.div>
        )}
      </div>
    </aside>
  );
}

