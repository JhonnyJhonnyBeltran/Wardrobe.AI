'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PublicFooter() {
  return (
    <footer className="w-full bg-zinc-50 dark:bg-[#0b0b0d] border-t border-zinc-200/80 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3.5">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="relative h-8 w-28 shrink-0">
                <Image
                  src="/landing/klozet-nombre-grande.png"
                  alt="Klozet"
                  fill
                  sizes="112px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              Tu armario real en el móvil. Digitaliza tus prendas, combina tus outfits en el lienzo, descubre qué lleva puesto la comunidad y habla con Kloe.
            </p>
          </div>

          {/* Guías de Estilo */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-zinc-950 dark:text-zinc-100">
              Guías de Estilo
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/trends" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Todas las guías
                </Link>
              </li>
              <li>
                <Link href="/trends/armario-capsula-2026" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Armario cápsula
                </Link>
              </li>
              <li>
                <Link href="/trends/quiet-luxury-streetwear" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Streetwear y sastrería
                </Link>
              </li>
              <li>
                <Link href="/trends/teoria-del-color-moda" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Teoría del color
                </Link>
              </li>
              <li>
                <Link href="/trends/moda-circular-digitalizacion" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Coste por puesta
                </Link>
              </li>
            </ul>
          </div>

          {/* Proyecto */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-zinc-950 dark:text-zinc-100">
              Proyecto
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  La historia de Klozet
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Contacto y soporte
                </Link>
              </li>
              <li>
                <Link href="/closet/kloe" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Hablar con Kloe
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Entrar a mi armario
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-zinc-950 dark:text-zinc-100">
              Legal
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
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
                  href="mailto:klozet.enterprise@gmail.com"
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  klozet.enterprise@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Klozet · Creado por Ethan.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:underline">Privacidad</Link>
            <Link href="/terms" className="hover:underline">Términos</Link>
            <Link href="/cookies" className="hover:underline">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
