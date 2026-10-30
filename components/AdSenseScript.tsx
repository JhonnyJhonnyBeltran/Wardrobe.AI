'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

/**
 * AdSenseScript - Desactivado temporalmente a petición del fundador.
 *
 * Mientras ADSENSE_ENABLED sea false, no se inyecta el script de terceros de Google AdSense
 * y en su lugar la plataforma muestra auto-anuncios internos ("Habla con Kloe") orientados
 * a conversión a Klozet Pro.
 *
 * Para reactivar Google AdSense en el futuro:
 * Definir NEXT_PUBLIC_ENABLE_ADSENSE="true" en las variables de entorno o cambiar ADSENSE_ENABLED a true.
 */
const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ADSENSE === 'true';

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

  if (!ADSENSE_ENABLED) {
    return null;
  }

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
