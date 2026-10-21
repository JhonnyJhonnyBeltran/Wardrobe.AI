'use client';

import React from 'react';
import Link from 'next/link';
import { Cookie, ExternalLink, ShieldCheck } from 'lucide-react';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 antialiased selection:bg-[var(--brand-pink,#ff2d78)] selection:text-white">
      <PublicHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <Cookie className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
            <span>Guía de Cookies AEPD & LSSI-CE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Política de Cookies
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Última actualización: 21 de octubre de 2026 • Versión 2.3
          </p>
        </div>

        {/* Content Document */}
        <article className="prose prose-zinc dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 space-y-8">
          
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              1. ¿Qué son las Cookies?
            </h2>
            <p>
              Una cookie es un pequeño archivo de texto que los sitios web almacenan en tu navegador o dispositivo al visitarlos. Las cookies permiten a la plataforma recordar tus preferencias de sesión, garantizar la seguridad de tu navegación y, en su caso, ofrecerte contenido publicitario relevante.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              2. Tipos de Cookies que Utiliza Klozet
            </h2>
            <p>
              En Klozet clasificamos las cookies utilizadas según su finalidad específica:
            </p>

            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <p className="font-bold text-zinc-950 dark:text-white">A. Cookies Técnicas y Estrictamente Necesarias (Exentas de consentimiento)</p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Son indispensables para que la plataforma funcione de forma segura. Permiten mantener tu sesión iniciada, recordar tus preferencias de idioma y gestionar las opciones de consentimiento de privacidad.
                </p>
                <ul className="list-disc pl-5 text-xs text-zinc-500 space-y-1">
                  <li><code>wardrobe-auth</code>: Token de sesión cifrado gestionado por Supabase (duración: 30 días).</li>
                  <li><code>klozet_language</code>: Idioma preferido del usuario (duración: 1 año).</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <p className="font-bold text-zinc-950 dark:text-white">B. Cookies de Rendimiento y Analítica</p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Nos permiten conocer de forma agregada y anónima cómo interactúan los usuarios con la plataforma (páginas visitadas, tiempos de carga, posibles errores) para optimizar la fluidez de Klozet.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <p className="font-bold text-zinc-950 dark:text-white">C. Cookies de Publicidad (Google AdSense)</p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Utilizadas en páginas públicas seleccionadas para servir anuncios relevantes a través de la red publicitaria de Google LLC y sus socios certificados. Google utiliza estas cookies para personalizar los anuncios en función de las visitas previas a este y a otros sitios web.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              3. Cómo Configurar o Inhabilitar las Cookies
            </h2>
            <p>
              Puedes rechazar, configurar o eliminar las cookies en cualquier momento desde las opciones de configuración de tu navegador web:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios.
              </li>
              <li>
                <strong>Apple Safari:</strong> Ajustes &gt; Safari &gt; Avanzado &gt; Privacidad y Bloqueo de Cookies.
              </li>
              <li>
                <strong>Mozilla Firefox:</strong> Ajustes &gt; Privacidad y Seguridad &gt; Cookies y datos del sitio.
              </li>
              <li>
                <strong>Microsoft Edge:</strong> Configuración &gt; Cookies y permisos del sitio &gt; Administrar y eliminar cookies.
              </li>
            </ul>
            <p className="pt-2">
              Para inhabilitar específicamente los anuncios personalizados servidos por Google AdSense, puedes visitar la{' '}
              <a 
                href="https://adssettings.google.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline font-semibold text-zinc-900 dark:text-white inline-flex items-center gap-0.5"
              >
                Configuración de Anuncios de Google <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
          </section>

        </article>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <Link href="/privacy" className="hover:underline">
            ← Ver Política de Privacidad
          </Link>
          <Link href="/terms" className="hover:underline">
            Ver Términos y Condiciones →
          </Link>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
