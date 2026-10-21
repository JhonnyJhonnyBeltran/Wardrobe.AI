'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PublicFooter() {
  return (
    <footer className="w-full bg-zinc-50 dark:bg-[#070709] border-t border-zinc-200/80 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8 mb-14">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="relative w-8 h-8 shrink-0">
                <Image 
                  src="/klozet-logo.png" 
                  alt="Klozet" 
                  fill 
                  sizes="32px"
                  className="object-contain dark:hidden" 
                />
                <Image 
                  src="/klozet-logo-dark.png" 
                  alt="Klozet" 
                  fill 
                  sizes="32px"
                  className="object-contain hidden dark:block" 
                />
              </div>
              <span className="text-xl font-bold tracking-[0.2em] uppercase text-zinc-950 dark:text-zinc-50 font-sans">
                Klozet
              </span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              La red social de moda y armario virtual. Digitaliza tus prendas reales, descubre combinaciones inteligentes y conecta con una comunidad que viste con intención.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Plataforma activa y en evolución continua</span>
            </div>
          </div>

          {/* Editorial / Trends */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-950 dark:text-zinc-200">
              Editorial & Estilo
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/trends" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Todas las Guías
                </Link>
              </li>
              <li>
                <Link href="/trends/armario-capsula-2026" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Armario Cápsula 2026
                </Link>
              </li>
              <li>
                <Link href="/trends/quiet-luxury-streetwear" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Quiet Luxury & Streetwear
                </Link>
              </li>
              <li>
                <Link href="/trends/teoria-del-color-moda" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Teoría del Color en tu Ropa
                </Link>
              </li>
              <li>
                <Link href="/trends/moda-circular-armario-digital" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Moda Circular y Armario
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-950 dark:text-zinc-200">
              Klozet
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Contacto & Soporte
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Crear Cuenta
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Acceso a Mi Armario
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-950 dark:text-zinc-200">
              Legal
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/privacy" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:contacto@klozet.es" 
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  contacto@klozet.es
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} Klozet. Todos los derechos reservados. Diseñado y desarrollado con pasión artesanal.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:underline">Privacidad</Link>
            <Link href="/terms" className="hover:underline">Términos</Link>
            <Link href="/cookies" className="hover:underline">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
