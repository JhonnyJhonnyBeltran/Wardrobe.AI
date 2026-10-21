'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useUser } from '@/store';
import { triggerHaptic } from '@/lib/haptic';

export default function PublicHeader() {
  const { user } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/trends', label: 'Tendencias & Guías' },
    { href: '/about', label: 'Sobre Nosotros' },
    { href: '/contact', label: 'Contacto' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#111113]/85 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        
        {/* Brand Anchor with Official Bubble Wordmark */}
        <Link 
          href="/" 
          className="flex items-center gap-2 group focus:outline-none rounded-xl p-1 active:scale-95 transition-transform"
          aria-label="Klozet Inicio"
        >
          <div className="relative h-9 sm:h-10 w-28 sm:w-32 shrink-0 flex items-center">
            <Image 
              src="/landing/klozet-nombre-grande.png" 
              alt="Klozet" 
              fill 
              sizes="128px"
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 transition-colors hover:text-zinc-950 dark:hover:text-white ${
                  isActive 
                    ? 'text-zinc-950 dark:text-white font-semibold' 
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span 
                    layoutId="headerActiveIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--brand-pink)] rounded-full" 
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/closet">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs cursor-pointer"
              >
                <span>Mi Armario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.div>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/auth">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  className="px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-all cursor-pointer"
                >
                  Iniciar sesión
                </motion.div>
              </Link>
              <Link href="/auth">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[var(--brand-pink)] text-white shadow-sm hover:bg-[var(--brand-pink-dark)] cursor-pointer"
                >
                  <span>Crear cuenta</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.div>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Trigger with Spring Feedback */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            onClick={() => {
              try { triggerHaptic('light'); } catch {}
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="md:hidden p-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer Menu with Apple Spring */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="md:hidden border-t border-black/[0.06] dark:border-white/[0.08] bg-white/95 dark:bg-[#111113]/95 backdrop-blur-2xl px-5 py-5 space-y-4 overflow-hidden"
          >
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium py-2.5 text-zinc-800 dark:text-zinc-200 hover:text-[var(--brand-pink)] transition-colors border-b border-zinc-100 dark:border-zinc-800/60"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-2 flex flex-col gap-2.5">
              {user ? (
                <Link
                  href="/closet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-full text-sm font-semibold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 active:scale-95 transition-transform"
                >
                  Ir a mi Armario
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-full text-sm font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 active:scale-95 transition-transform"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-full text-sm font-semibold bg-[var(--brand-pink)] text-white shadow-sm active:scale-95 transition-transform"
                  >
                    Registrarse gratis
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
