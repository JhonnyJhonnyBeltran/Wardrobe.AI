'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import { useUser } from '@/store';

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
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 dark:bg-[#09090b]/85 border-b border-zinc-200/70 dark:border-zinc-800/60 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Anchor */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white rounded-lg p-1"
          aria-label="Klozet Inicio"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0">
            <Image 
              src="/klozet-logo.png" 
              alt="Klozet Icon" 
              fill 
              sizes="36px"
              className="object-contain dark:hidden"
              priority
            />
            <Image 
              src="/klozet-logo-dark.png" 
              alt="Klozet Icon" 
              fill 
              sizes="36px"
              className="object-contain hidden dark:block"
              priority
            />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-[0.2em] uppercase text-zinc-900 dark:text-zinc-50 font-sans">
            Klozet
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 transition-colors hover:text-zinc-900 dark:hover:text-white ${
                  isActive 
                    ? 'text-zinc-950 dark:text-white font-semibold' 
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-pink,#ff2d78)] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/closet"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 active:scale-95 transition-all shadow-xs"
            >
              <span>Mi Armario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/auth"
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-all"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 hover:opacity-90 active:scale-95 transition-all shadow-xs"
              >
                <span>Crear cuenta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl px-5 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-2 text-zinc-800 dark:text-zinc-200 hover:text-[var(--brand-pink,#ff2d78)] transition-colors border-b border-zinc-100 dark:border-zinc-900"
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
                className="w-full text-center py-3 rounded-full text-sm font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
              >
                Ir a mi Armario
              </Link>
            ) : (
              <>
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full text-sm font-semibold border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full text-sm font-semibold bg-[var(--brand-pink,#ff2d78)] text-white shadow-md shadow-pink-500/20"
                >
                  Registrarse gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
