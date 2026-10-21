'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, ExternalLink, Radio } from 'lucide-react';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 antialiased selection:bg-[var(--brand-pink,#ff2d78)] selection:text-white">
      <PublicHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Cumplimiento RGPD & LOPDGDD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Política de Privacidad
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Última actualización: 21 de octubre de 2026 • Versión 2.4
          </p>
        </div>

        {/* Content Document */}
        <article className="prose prose-zinc dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 space-y-8">
          
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              1. Responsable del Tratamiento
            </h2>
            <p>
              El responsable del tratamiento de los datos recabados a través de la plataforma web y móvil Klozet (en adelante, &quot;Klozet&quot; o el &quot;Servicio&quot;) es el equipo titular de Klozet con sede en España (correo de contacto: <a href="mailto:soporte@klozet.es" className="text-zinc-900 dark:text-white font-medium underline">soporte@klozet.es</a>).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              2. Datos Recabados y Finalidad
            </h2>
            <p>Klozet recopila y trata las siguientes categorías de datos personales:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Datos de Identificación y Cuenta:</strong> Dirección de correo electrónico, nombre de usuario y credenciales cifradas para autenticación y gestión de perfil.</li>
              <li><strong>Fotografías de Prendas y Armario:</strong> Imágenes aportadas voluntariamente por el usuario para la digitalización, etiquetado y creación de atuendos interactivos.</li>
              <li><strong>Preferencias de Estilo y Colorimetría:</strong> Respuestas al cuestionario de bienvenida (edad, preferencias estéticas, morfología) utilizadas exclusivamente para personalizar las sugerencias de estilismo.</li>
              <li><strong>Datos Técnicos y Analíticos:</strong> Dirección IP anonimizada, tipo de navegador y resolución para garantizar la estabilidad técnica y la seguridad de la plataforma.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              3. Base Jurídica del Tratamiento
            </h2>
            <p>
              La base legal para el tratamiento de tus datos es la ejecución de la relación contractual (Términos de Servicio) para prestar las funciones del armario virtual y la red social, así como el consentimiento explícito del usuario para cookies no esenciales y el cumplimiento de obligaciones legales aplicables.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              4. Destinatarios y Proveedores Encargados del Tratamiento
            </h2>
            <p>
              Klozet no comercializa ni vende datos personales a terceros bajo ninguna circunstancia. Solo compartimos datos indispensables con proveedores de infraestructura estrictamente auditados:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Supabase Inc.:</strong> Alojamiento de bases de datos relacionales, autenticación y almacenamiento cifrado en reposo y en tránsito.</li>
              <li><strong>Stripe Inc.:</strong> Gestión de suscripciones y procesamiento seguro de pagos con certificación PCI-DSS Nivel 1.</li>
              <li><strong>Google Cloud (Gemini API):</strong> Procesamiento de visión artificial para catalogación automática de prendas, sin retención persistente de imágenes para entrenamiento general de modelos de terceros.</li>
            </ul>
          </section>

          {/* SECTION MANDATED BY GOOGLE ADSENSE POLICIES */}
          <section className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[var(--brand-pink,#ff2d78)]" />
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                5. Publicidad, Proveedores Externos y Cookies de Google AdSense
              </h2>
            </div>
            <p>
              Para mantener el acceso gratuito a las funcionalidades principales de la plataforma, Klozet colabora con proveedores publicitarios externos, principalmente <strong>Google LLC (Google AdSense)</strong>, para servir anuncios en páginas públicas autorizadas del sitio web.
            </p>
            <div className="space-y-2">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                En cumplimiento riguroso de las políticas del programa Google AdSense y la directiva europea ePrivacy:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Google y proveedores asociados:</strong> Google, como proveedor externo, utiliza cookies para publicar anuncios en Klozet basados en visitas previas de los usuarios a este sitio web u otros sitios de Internet.
                </li>
                <li>
                  <strong>Cookies de publicidad:</strong> La utilización de cookies publicitarias permite a Google y a sus socios presentar anuncios orientados en función de las visitas realizadas a sitios web en la red.
                </li>
                <li>
                  <strong>Inhabilitación de la publicidad personalizada:</strong> Cualquier usuario puede inhabilitar en cualquier momento la publicidad personalizada accediendo directamente a la{' '}
                  <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-zinc-900 dark:text-white inline-flex items-center gap-0.5">
                    Configuración de Anuncios de Google <ExternalLink className="w-3 h-3" />
                  </a>.
                </li>
                <li>
                  <strong>Mecanismos adicionales de exclusión voluntaria:</strong> Puedes asimismo inhabilitar el uso de cookies publicitarias a través de plataformas sectoriales de autorregulación como{' '}
                  <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-zinc-900 dark:text-white inline-flex items-center gap-0.5">
                    www.aboutads.info <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  o en la Unión Europea a través de{' '}
                  <a href="https://www.youronlinechoices.com/es/" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-zinc-900 dark:text-white inline-flex items-center gap-0.5">
                    Your Online Choices <ExternalLink className="w-3 h-3" />
                  </a>.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              6. Derechos del Usuario (ARCO-POL)
            </h2>
            <p>
              Conforme a los artículos 15 a 22 del Reglamento General de Protección de Datos (RGPD) y la LOPDGDD, tienes garantizados en todo momento los derechos de:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Acceso y Rectificación:</strong> Consultar y corregir tus datos personales desde los ajustes de tu cuenta.</li>
              <li><strong>Supresión (&quot;Derecho al Olvido&quot;):</strong> Eliminar tu cuenta y todos tus datos personales asociados de manera inmediata desde Ajustes o escribiendo a <a href="mailto:soporte@klozet.es" className="underline">soporte@klozet.es</a>.</li>
              <li><strong>Limitación del Tratamiento y Portabilidad:</strong> Solicitar la exportación de tus datos en un formato digital estructurado.</li>
              <li><strong>Reclamación ante la Autoridad de Control:</strong> Tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="underline">www.aepd.es</a>).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              7. Conservación de los Datos
            </h2>
            <p>
              Los datos se conservan mientras mantengas tu cuenta de usuario activa en Klozet. En caso de solicitar la eliminación de tu cuenta, los datos serán suprimidos de manera irrevocable en un plazo máximo de 30 días, conservándose bloqueados únicamente aquellos estrictamente requeridos para el cumplimiento de obligaciones legales tributarias o mercantiles.
            </p>
          </section>

        </article>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <Link href="/terms" className="hover:underline">
            ← Ver Términos y Condiciones
          </Link>
          <Link href="/cookies" className="hover:underline">
            Ver Política de Cookies →
          </Link>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
