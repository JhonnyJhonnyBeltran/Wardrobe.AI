'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

/**
 * AdSenseScript - Compliance con Políticas del Programa Google AdSense
 * 
 * Regla Estricta de Google:
 * "No se permiten los anuncios servidos por Google en pantallas que:
 *  - No tengan contenido o su contenido sea de poco valor.
 *  - Se estén creando o editando (ej: /create, /create-post).
 *  - Se usen para enviar alertas, navegar u otros fines de comportamiento (ej: /messages, /notifications, /settings)."
 * 
 * Este componente inspecciona la ruta activa y BLOQUEA la carga del SDK de AdSense
 * en cualquier pantalla de edición, navegación interna, autenticación o configuración.
 * Solo lo ejecuta en rutas públicas con contenido editorial y publicaciones reales.
 */

const FORBIDDEN_APP_ROUTES = [
  '/create',
  '/create-post',
  '/closet',
  '/messages',
  '/notifications',
  '/profile/settings',
  '/profile/edit',
  '/auth',
  '/login',
  '/onboarding',
  '/process-image',
  '/admin',
  '/premium',
];

export default function AdSenseScript() {
  const pathname = usePathname() || '';

  // 1. Verificar si la ruta actual es una pantalla de edición, creación, chat o navegación interna
  const isForbiddenScreen = FORBIDDEN_APP_ROUTES.some((forbiddenPrefix) =>
    pathname === forbiddenPrefix || pathname.startsWith(`${forbiddenPrefix}/`)
  );

  // Si es una pantalla prohibida por políticas de AdSense, NO cargar el script
  if (isForbiddenScreen) {
    return null;
  }

  // 2. Solo cargar en rutas públicas permitidas (Landing, Tendencias/Editorial, Sobre Nosotros, Contacto, Post/Feed público)
  return (
    <Script
      id="google-adsense-sdk"
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4628313000953034"
      crossOrigin="anonymous"
    />
  );
}
