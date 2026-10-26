'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

/**
 * AdSenseScript - Compliance con Políticas del Programa Google AdSense y Optimización Core Web Vitals
 * 
 * Solo se carga el SDK de AdSense en rutas editoriales con contenido sustancial (/trends),
 * evitando cargar 400 KiB de scripts publicitarios en la landing page principal (/),
 * lo que reduce drásticamente el LCP, FCP y el tiempo de bloqueo del hilo principal.
 */
export default function AdSenseScript() {
  const pathname = usePathname() || '';

  // Solo cargar en la revista editorial (/trends) donde residen los bloques publicitarios reales
  const isEditorialRoute = pathname === '/trends' || pathname.startsWith('/trends/');

  if (!isEditorialRoute) {
    return null;
  }

  return (
    <Script
      id="google-adsense-sdk"
      strategy="lazyOnload"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4628313000953034"
      crossOrigin="anonymous"
    />
  );
}