'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, FileText } from 'lucide-react';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 antialiased selection:bg-[var(--brand-pink,#ff2d78)] selection:text-white">
      <PublicHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <Scale className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
            <span>Condiciones Legales de Uso</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Términos y Condiciones
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Última actualización: 21 de octubre de 2026 • Versión 2.2
          </p>
        </div>

        {/* Content Document */}
        <article className="prose prose-zinc dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 space-y-8">
          
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              1. Aceptación y Objeto del Servicio
            </h2>
            <p>
              El acceso y uso de la plataforma Klozet (accesible en <strong>klozet.es</strong> y sus aplicaciones asociadas) atribuye la condición de usuario e implica la aceptación plena de las presentes Condiciones de Servicio. Klozet proporciona un servicio de red social de moda, organización de armario virtual mediante catalogación fotográfica y asistencia interactiva de estilismo.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              2. Registro, Cuenta y Seguridad
            </h2>
            <p>
              Para acceder a las funcionalidades principales del Servicio se requiere la creación de una cuenta de usuario. El usuario se compromete a:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Aportar información verídica y mantener actualizada la dirección de correo electrónico asociada.</li>
              <li>Custodiar con debida diligencia sus credenciales de acceso, siendo el único responsable de cualquier actividad realizada bajo su cuenta.</li>
              <li>Tener al menos 14 años de edad para registrarse o contar con el consentimiento de sus tutores legales conforme a la normativa española.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              3. Propiedad Intelectual y Contenido del Usuario
            </h2>
            <p>
              El usuario conserva en todo momento la titularidad y los derechos de propiedad intelectual sobre las fotografías, atuendos y comentarios que suba a Klozet. Al publicar contenido de forma pública en el feed o la comunidad, el usuario otorga a Klozet una licencia no exclusiva, gratuita y de ámbito mundial para alojar, visualizar y compartir dicho contenido estrictamente dentro de las funcionalidades de la plataforma.
            </p>
            <p>
              Todo el código, diseño gráfico, logotipos, marcas comerciales y arquitectura técnica de Klozet son propiedad exclusiva de sus creadores y están protegidos por las leyes de propiedad industrial e intelectual.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              4. Normas de Convivencia y Uso Aceptable
            </h2>
            <p>
              Klozet es un entorno dedicado a la moda, la creatividad y la inspiración positiva. Queda estrictamente prohibido:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Publicar contenido ofensivo, violento, difamatorio, con desnudez explícita o que vulnere la intimidad de terceros.</li>
              <li>Incurrir en acoso, insultos o conductas discriminatorias hacia otros miembros de la comunidad.</li>
              <li>Utilizar herramientas automatizadas (bots, scrapers) para extraer masivamente datos o imágenes del Servicio sin autorización previa por escrito.</li>
              <li>Suplantar la identidad de otras personas, marcas de moda o entidades.</li>
            </ul>
            <p>
              Klozet se reserva el derecho de retirar cualquier contenido que infrinja estas normas y de suspender o cancelar cuentas infractoras sin previo aviso.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              5. Suscripciones Premium, Facturación y Cancelación
            </h2>
            <p>
              Klozet ofrece un plan gratuito con límites razonables de uso diario y un plan de suscripción Premium recurrente (procesado de forma segura a través de Stripe).
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Renovación Automática:</strong> Las suscripciones se renuevan automáticamente al final de cada periodo mensual a menos que el usuario las cancele antes de la fecha de cobro.</li>
              <li><strong>Cancelación sin Penalización:</strong> El usuario puede cancelar su suscripción Premium en cualquier momento desde los Ajustes de Perfil. Tras la cancelación, mantendrá el acceso hasta agotar el ciclo ya abonado.</li>
              <li><strong>Derecho de Desistimiento:</strong> De acuerdo con la legislación de consumidores de la UE, el usuario tiene derecho a desistir dentro de los primeros 14 días naturales tras la contratación inicial si no ha consumido sustancialmente el servicio.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              6. Limitación de Responsabilidad
            </h2>
            <p>
              Klozet proporciona sus servicios &quot;tal cual&quot; y &quot;según disponibilidad&quot;. Aunque aplicamos las mayores medidas técnicas de seguridad y disponibilidad continua, no garantizamos que el servicio opere de forma ininterrumpida o libre de errores derivados de fallos de infraestructura ajenos a nuestro control directo.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              7. Legislación Aplicable y Jurisdicción
            </h2>
            <p>
              Las presentes Condiciones se rigen por la legislación común española. Para cualquier controversia derivada del uso del Servicio, ambas partes acuerdan someterse a la jurisdicción de los Juzgados y Tribunales competentes conforme a la legislación española, salvo que la normativa de protección a consumidores establezca imperativamente otro fuero.
            </p>
          </section>

        </article>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <Link href="/privacy" className="hover:underline">
            ← Ver Política de Privacidad
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
