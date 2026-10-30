'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

/**
 * AdSenseScript - Compliance con Políticas del Programa Google AdSense
 *
 * Carga el SDK oficial de Google AdSense en las páginas públicas editoriales e institucionales
 * (/, /trends, /trends/*, /about, /contact, /contacto, /privacy, /terms, /cookies) para que
 * el verificador de sitios de AdSense y Mediapartners-Google validen el dominio raíz y los artículos,
 * bloqueando su carga en pantallas de herramientas privadas, login, creación o mensajería.
 */
const ALLOWED_PUBLIC_EXACT_PATHS = new Set([
  '/',
  '/trends',
  '/about',
  '/contact',
  '/contacto',
  '/privacy',
  '/terms',
  '/cookies',
]);

export default function AdSenseScript() {
  const pathname = usePathname() || '';

  const isAllowedPublicRoute =
    ALLOWED_PUBLIC_EXACT_PATHS.has(pathname) || pathname.startsWith('/trends/');

  if (!isAllowedPublicRoute) {
    return null;
  }

  return (
    <Script
      id="google-adsense-sdk"
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4628313000953034"
      crossOrigin="anonymous"
    />
  );
}
