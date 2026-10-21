'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, ShieldCheck, ArrowLeft, Radio, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function CookiesPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen bg-[var(--background)] overflow-x-hidden selection:bg-[var(--brand-pink)] selection:text-white">
            {/* Main Content */}
            <main className="relative z-10 max-w-3xl mx-auto px-4 py-10 md:py-16">
                <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--border-color)]/40">
                    <button 
                        onClick={() => router.push('/')}
                        className="inline-block hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--brand-pink)] rounded-lg p-1 self-start"
                        title="Volver a Inicio"
                        aria-label="Volver a Inicio"
                    >
                        <Image src="/klozet-logo.png" alt="Klozet" width={110} height={32} className="dark:hidden block object-contain" priority />
                        <Image src="/klozet-logo-dark.png" alt="Klozet" width={110} height={32} className="hidden dark:block object-contain" priority />
                    </button>
                    <nav className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-[var(--foreground-secondary)]">
                        <Link href="/" className="hover:text-[var(--brand-pink)] transition-colors">
                            Inicio
                        </Link>
                        <span>•</span>
                        <Link href="/about" className="hover:text-[var(--brand-pink)] transition-colors">
                            Sobre Nosotros
                        </Link>
                        <span>•</span>
                        <Link href="/contact" className="hover:text-[var(--brand-pink)] transition-colors">
                            Contacto
                        </Link>
                        <span>•</span>
                        <Link href="/terms" className="hover:text-[var(--brand-pink)] transition-colors">
                            Términos
                        </Link>
                        <span>•</span>
                        <Link href="/privacy" className="hover:text-[var(--brand-pink)] transition-colors">
                            Privacidad
                        </Link>
                    </nav>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center mx-auto mb-4 border border-[var(--brand-pink)]/20 shadow-lg shadow-[var(--brand-pink)]/5">
                            <Cookie className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--foreground)] mb-3 tracking-tight">
                            Política de Cookies
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-sm md:text-base max-w-xl mx-auto">
                            Conforme a la Ley 34/2002 (LSSI-CE), directrices de la AEPD y Políticas de Google AdSense
                        </p>
                        <p className="text-xs text-[var(--foreground-tertiary)] mt-2">
                            Última actualización: Octubre de 2026 • Klozet (klozet.es)
                        </p>
                    </div>

                    <div className="bg-[var(--card-bg)]/70 backdrop-blur-xl border border-[var(--border-color)]/60 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl space-y-8 text-[var(--foreground-secondary)] text-sm md:text-base leading-relaxed">
                        
                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">1. ¿Qué son las cookies?</h2>
                            <p>
                                Una cookie o dispositivo de almacenamiento y recuperación de datos (DARD) es un pequeño fichero de texto que los sitios web descargan en tu navegador, smartphone o tableta al acceder a determinadas páginas. 
                                Permiten a una página web almacenar y recuperar información sobre los hábitos de navegación del usuario o de su equipo, garantizar el funcionamiento seguro de la sesión y mostrar contenidos adaptados.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">2. ¿Qué tipos de cookies utiliza Klozet?</h2>
                            <p>
                                En <strong>Klozet</strong> diferenciamos de forma transparente las siguientes categorías de cookies:
                            </p>

                            <div className="space-y-3 pt-2">
                                <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]/60">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            Estrictamente Necesarias (Técnicas)
                                        </span>
                                    </div>
                                    <p className="text-xs md:text-sm">
                                        Imprescindibles para la navegación y el funcionamiento de la plataforma: autenticación de usuario con Supabase, prevención de ataques CSRF y seguridad en pagos con Stripe. Están exceptuadas del consentimiento previo según el Art. 22.2 de la LSSI-CE.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]/60">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] border border-[var(--brand-pink)]/20">
                                            Preferencias y Personalización
                                        </span>
                                    </div>
                                    <p className="text-xs md:text-sm">
                                        Permiten recordar la elección de tema visual (modo claro u oscuro) y el estado de aceptación o configuración del aviso de cookies.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]/60">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                            Publicitarias y de Terceros (Google AdSense)
                                        </span>
                                    </div>
                                    <p className="text-xs md:text-sm">
                                        Permiten gestionar y mostrar espacios publicitarios en las páginas públicas de Klozet. Google y sus socios utilizan cookies para publicar anuncios basados en las visitas previas del usuario a este u otros sitios web, limitar la frecuencia con que se muestra un mismo anuncio y evaluar la eficacia de las campañas. Requieren tu consentimiento expreso previo.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">3. Tabla Detallada de Cookies y Almacenamiento Local</h2>
                            <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)]">
                                <table className="w-full text-left text-xs md:text-sm">
                                    <thead className="bg-[var(--background-secondary)] text-[var(--foreground)] border-b border-[var(--border-color)] font-semibold">
                                        <tr>
                                            <th className="p-3">Nombre / Clave</th>
                                            <th className="p-3">Tipo</th>
                                            <th className="p-3">Finalidad</th>
                                            <th className="p-3">Duración</th>
                                            <th className="p-3">Titular</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]/60 text-[var(--foreground-secondary)]">
                                        <tr>
                                            <td className="p-3 font-mono text-xs text-[var(--foreground)]">sb-*-auth-token</td>
                                            <td className="p-3">Técnica</td>
                                            <td className="p-3">Mantiene la sesión de usuario activa y segura.</td>
                                            <td className="p-3">1 año</td>
                                            <td className="p-3">Propia (Supabase)</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono text-xs text-[var(--foreground)]">klozet_cookie_consent_v1</td>
                                            <td className="p-3">Técnica</td>
                                            <td className="p-3">Registra las preferencias de cookies del usuario.</td>
                                            <td className="p-3">12 meses</td>
                                            <td className="p-3">Propia</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono text-xs text-[var(--foreground)]">klozet-theme</td>
                                            <td className="p-3">Personalización</td>
                                            <td className="p-3">Guarda la preferencia visual de modo oscuro o claro.</td>
                                            <td className="p-3">Persistente</td>
                                            <td className="p-3">Propia</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono text-xs text-[var(--foreground)]">__stripe_mid / __stripe_sid</td>
                                            <td className="p-3">Seguridad</td>
                                            <td className="p-3">Prevención de fraude en operaciones de suscripción.</td>
                                            <td className="p-3">1 año / 30 min</td>
                                            <td className="p-3">Stripe Inc.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono text-xs text-[var(--foreground)]">__gads / __gpi / IDE</td>
                                            <td className="p-3">Publicidad</td>
                                            <td className="p-3">Servicio de anuncios de Google AdSense basados en navegación y limitación de frecuencia.</td>
                                            <td className="p-3">13 meses</td>
                                            <td className="p-3">Google LLC</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="space-y-4 rounded-2xl bg-[var(--background-secondary)]/80 border border-[var(--brand-pink)]/30 p-5 md:p-6 shadow-sm">
                            <div className="flex items-center gap-2.5">
                                <Radio className="w-5 h-5 text-[var(--brand-pink)]" />
                                <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                                    4. Cookies de Publicidad de Google AdSense y Opciones de Exclusión
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm leading-relaxed">
                                Google utiliza cookies para personalizar los anuncios que ves en Klozet y en otros sitios asociados de la red de display de Google. Puedes consultar cómo utiliza Google los datos cuando utilizas sitios de sus socios en la <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] underline font-semibold inline-flex items-center gap-1">Política de Privacidad y Términos de Google <ExternalLink className="w-3 h-3" /></a>.
                            </p>
                            <p className="text-xs md:text-sm">
                                Si deseas deshabilitar los anuncios personalizados de Google o revocar tu consentimiento:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--brand-pink)] text-xs md:text-sm">
                                <li>
                                    <strong>Configuración de Anuncios de Google:</strong> Visita <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] underline font-semibold">adssettings.google.com</a> para gestionar o desactivar la personalización.
                                </li>
                                <li>
                                    <strong>Alianza de Publicidad Digital (DAA):</strong> Puedes inhabilitar cookies publicitarias de terceros a través de <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] underline font-semibold">aboutads.info/choices</a>.
                                </li>
                                <li>
                                    <strong>Alianza Europea de Publicidad Digital Interactiva (EDAA):</strong> En Europa, puedes gestionar tus preferencias en <a href="https://www.youronlinechoices.com/es/" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] underline font-semibold">youronlinechoices.com/es/</a>.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">5. Cómo gestionar y eliminar cookies desde tu navegador</h2>
                            <p className="text-xs md:text-sm">
                                Puedes permitir, bloquear o eliminar las cookies instaladas en tu dispositivo configurando las opciones de tu navegador:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--brand-pink)] text-xs md:text-sm">
                                <li><strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies de terceros.</li>
                                <li><strong>Apple Safari:</strong> Ajustes / Preferencias → Privacidad → Bloquear todas las cookies.</li>
                                <li><strong>Mozilla Firefox:</strong> Ajustes → Privacidad & Seguridad → Cookies y datos del sitio.</li>
                                <li><strong>Microsoft Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies.</li>
                            </ul>
                        </section>

                        <div className="pt-6 mt-6 border-t border-[var(--border-color)]/50 text-xs md:text-sm text-center">
                            <p>¿Tienes dudas sobre nuestra Política de Cookies?</p>
                            <a href="mailto:soporte@klozet.es" className="text-[var(--brand-pink)] font-semibold hover:underline mt-1 inline-block">
                                Escríbenos a soporte@klozet.es
                            </a>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
