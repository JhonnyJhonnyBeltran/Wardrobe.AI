'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, ShieldCheck, ArrowLeft, Info, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function CookiesPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen bg-[var(--background)] overflow-x-hidden selection:bg-[var(--brand-pink)] selection:text-white">
            {/* Main Content */}
            <main className="relative z-10 max-w-3xl mx-auto px-4 py-12 md:py-20">
                <div className="mb-12 flex items-center justify-between">
                    <button 
                        onClick={() => router.push('/auth')}
                        className="inline-block hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--brand-pink)] rounded-lg p-1"
                        title="Volver a Inicio"
                        aria-label="Volver a Inicio"
                    >
                        <Image src="/klozet-logo.png" alt="Klozet" width={100} height={30} className="dark:hidden block object-contain" priority />
                        <Image src="/klozet-logo-dark.png" alt="Klozet" width={100} height={30} className="hidden dark:block object-contain" priority />
                    </button>
                    <Link
                        href="/privacy"
                        className="text-xs md:text-sm text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] transition-colors flex items-center gap-1.5"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Política de Privacidad</span>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-12 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center mx-auto mb-4 border border-[var(--brand-pink)]/20 shadow-lg shadow-[var(--brand-pink)]/5">
                            <Cookie className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight">
                            Política de Cookies
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-base md:text-lg">
                            Conforme a la Ley 34/2002 (LSSI-CE) y las directrices de la AEPD
                        </p>
                        <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                            Última actualización: Septiembre de 2026
                        </p>
                    </div>

                    <div className="bg-[var(--card-bg)]/60 backdrop-blur-xl border border-[var(--border-color)]/50 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 text-[var(--foreground-secondary)] text-base leading-relaxed">
                        
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">1. ¿Qué son las cookies?</h2>
                            <p>
                                Una cookie o dispositivo de almacenamiento y recuperación de datos (DARD) es un pequeño fichero de texto que los sitios web descargan en tu navegador, smartphone o tableta al acceder a determinadas páginas. 
                                Permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y garantizar el funcionamiento seguro de la sesión.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">2. ¿Qué tipos de cookies utiliza Klozet?</h2>
                            <p>
                                En <strong>Klozet</strong> cumplimos estrictamente con el principio de minimización y no utilizamos cookies publicitarias ni de seguimiento invasivo. Nuestro servicio emplea únicamente las siguientes categorías:
                            </p>

                            <div className="space-y-4 pt-2">
                                <div className="p-5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]/60">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            Estrictamente Necesarias (Técnicas)
                                        </span>
                                    </div>
                                    <p className="text-sm">
                                        Son aquellas imprescindibles para la navegación y el correcto funcionamiento de la plataforma. Permiten mantener tu sesión autenticada con Supabase, gestionar la seguridad frente a ataques de falsificación de petición (CSRF) y procesar pagos seguros con Stripe. Están exceptuadas del consentimiento previo según el Art. 22.2 de la LSSI-CE.
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]/60">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] border border-[var(--brand-pink)]/20">
                                            Preferencias y Personalización
                                        </span>
                                    </div>
                                    <p className="text-sm">
                                        Permiten recordar información para que accedas al servicio con determinadas características personalizadas, como el modo de visualización (modo claro u oscuro) y recordar si ya has configurado el banner de cookies.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">3. Tabla Detallada de Cookies y Almacenamiento Local</h2>
                            <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)]">
                                <table className="w-full text-left text-xs md:text-sm">
                                    <thead className="bg-[var(--background-secondary)] text-[var(--foreground)] border-b border-[var(--border-color)] font-semibold">
                                        <tr>
                                            <th className="p-3.5">Nombre / Clave</th>
                                            <th className="p-3.5">Tipo</th>
                                            <th className="p-3.5">Finalidad</th>
                                            <th className="p-3.5">Duración</th>
                                            <th className="p-3.5">Titular</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]/60 text-[var(--foreground-secondary)]">
                                        <tr>
                                            <td className="p-3.5 font-mono text-xs text-[var(--foreground)]">sb-*-auth-token</td>
                                            <td className="p-3.5">Técnica</td>
                                            <td className="p-3.5">Mantiene la sesión autenticada segura del usuario.</td>
                                            <td className="p-3.5">1 año</td>
                                            <td className="p-3.5">Propia (Supabase)</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3.5 font-mono text-xs text-[var(--foreground)]">klozet_cookie_consent_v1</td>
                                            <td className="p-3.5">Técnica</td>
                                            <td className="p-3.5">Registra las preferencias de cookies aceptadas o rechazadas.</td>
                                            <td className="p-3.5">12 meses</td>
                                            <td className="p-3.5">Propia</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3.5 font-mono text-xs text-[var(--foreground)]">klozet-theme</td>
                                            <td className="p-3.5">Personalización</td>
                                            <td className="p-3.5">Guarda la preferencia de tema (Dark/Light mode).</td>
                                            <td className="p-3.5">Persistente</td>
                                            <td className="p-3.5">Propia</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3.5 font-mono text-xs text-[var(--foreground)]">__stripe_mid / __stripe_sid</td>
                                            <td className="p-3.5">Técnica / Seguridad</td>
                                            <td className="p-3.5">Prevención de fraude en transacciones seguras de suscripción.</td>
                                            <td className="p-3.5">1 año / 30 min</td>
                                            <td className="p-3.5">Stripe Inc.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">4. Cómo gestionar y revocar el consentimiento</h2>
                            <p>
                                Puedes modificar tus preferencias en cualquier momento o revocar el consentimiento previamente otorgado. Además, puedes configurar tu navegador para bloquear o eliminar las cookies instaladas:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[var(--brand-pink)] text-sm">
                                <li><strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios.</li>
                                <li><strong>Apple Safari:</strong> Ajustes / Preferencias → Privacidad → Bloquear todas las cookies.</li>
                                <li><strong>Mozilla Firefox:</strong> Ajustes → Privacidad & Seguridad → Cookies y datos del sitio.</li>
                                <li><strong>Microsoft Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">5. Transferencias Internacionales</h2>
                            <p>
                                Los servicios de autenticación y base de datos (Supabase) y pasarela de pago (Stripe) operan bajo marcos legales conformes al RGPD (incluyendo Cláusulas Contractuales Tipo de la Comisión Europea y el Marco de Privacidad de Datos UE-EE.UU.).
                            </p>
                        </section>

                        <div className="pt-8 mt-8 border-t border-[var(--border-color)]/50 text-sm text-center">
                            <p>¿Tienes preguntas sobre el uso de cookies en Klozet?</p>
                            <a href="mailto:privacidad@klozet.app" className="text-[var(--brand-pink)] font-semibold hover:underline mt-1 inline-block">
                                Escríbenos a privacidad@klozet.app
                            </a>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
