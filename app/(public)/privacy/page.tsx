'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, LockKeyhole, ArrowLeft, Cookie } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPage() {
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
                    <div className="flex items-center gap-3 text-xs md:text-sm">
                        <Link href="/terms" className="text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] transition-colors">
                            Términos
                        </Link>
                        <span>•</span>
                        <Link href="/cookies" className="text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] transition-colors">
                            Cookies
                        </Link>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-12 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center mx-auto mb-4 border border-[var(--brand-pink)]/20 shadow-lg shadow-[var(--brand-pink)]/5">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight">
                            Política de Privacidad
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-base md:text-lg">
                            Reglamento General de Protección de Datos (RGPD) y Ley Orgánica 3/2018 (LOPDGDD)
                        </p>
                        <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                            Última actualización: Septiembre de 2026 • Protección Integral de Datos en España y la Unión Europea
                        </p>
                    </div>

                    <div className="bg-[var(--card-bg)]/60 backdrop-blur-xl border border-[var(--border-color)]/50 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 text-[var(--foreground-secondary)] text-base leading-relaxed">
                        
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">1. Responsable del Tratamiento</h2>
                            <p>
                                De conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), se informa de que los datos personales recogidos a través de la plataforma <strong>Klozet</strong> serán tratados bajo la responsabilidad del equipo titular de Klozet (Wardrobe.AI).
                            </p>
                            <p className="text-sm">
                                <strong>Correo electrónico de privacidad y DPO:</strong> <a href="mailto:privacidad@klozet.app" className="text-[var(--brand-pink)] font-semibold underline">privacidad@klozet.app</a>
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">2. Datos Recopilados y Principio de Minimización (Art. 5.1.c RGPD)</h2>
                            <p>
                                Solo recopilamos los datos estrictamente necesarios y adecuados para prestar el servicio de armario inteligente:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[var(--brand-pink)] text-sm">
                                <li><strong>Datos de cuenta:</strong> Correo electrónico, nombre de usuario y nombre completo.</li>
                                <li><strong>Contenido del armario:</strong> Fotografías de prendas de ropa subidas voluntariamente por el usuario, categorizaciones, colores y combinaciones de outfits.</li>
                                <li><strong>Preferencias opcionales de estilo:</strong> Rango de edad, morfología y paleta de temporada (estrictamente voluntarias para refinar recomendaciones).</li>
                                <li><strong>Datos transaccionales:</strong> Gestión de identificadores de suscripción procesados con cifrado seguro a través de Stripe (Klozet nunca almacena números de tarjeta bancaria).</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">3. Finalidades y Bases Jurídicas del Tratamiento</h2>
                            <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)] text-xs md:text-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-[var(--background-secondary)] text-[var(--foreground)] border-b border-[var(--border-color)] font-semibold">
                                        <tr>
                                            <th className="p-3.5">Finalidad</th>
                                            <th className="p-3.5">Base Jurídica (RGPD)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]/60">
                                        <tr>
                                            <td className="p-3.5">Gestión del registro, armario virtual y sesión segura.</td>
                                            <td className="p-3.5">Ejecución del contrato de servicio (Art. 6.1.b RGPD).</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3.5">Análisis de fotos de ropa y recomendaciones de estilismo con IA.</td>
                                            <td className="p-3.5">Consentimiento expreso y ejecución de contrato (Art. 6.1.a y 6.1.b RGPD).</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3.5">Gestión de suscripciones de pago Klozet Pro.</td>
                                            <td className="p-3.5">Ejecución contractual y cumplimiento de obligaciones fiscales (Art. 6.1.b y 6.1.c RGPD).</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">4. Destinatarios y Transferencias Internacionales</h2>
                            <p className="text-sm">
                                No vendemos ni cedemos datos personales a terceros con fines publicitarios. Para la correcta operativa técnica, trabajamos con encargados del tratamiento que cumplen con las garantías del RGPD y el Marco de Privacidad de Datos UE-EE.UU.:
                            </p>
                            <ul className="list-disc pl-6 space-y-1.5 marker:text-[var(--brand-pink)] text-sm">
                                <li><strong>Supabase Inc.</strong>: Alojamiento de bases de datos, autenticación y almacenamiento seguro con políticas RLS y cifrado en tránsito y reposo.</li>
                                <li><strong>Stripe Inc.</strong>: Pasarela de pagos segura certificada PCI-DSS Nivel 1.</li>
                                <li><strong>Google Cloud (Gemini API)</strong>: Procesamiento de visión por computador para análisis de prendas bajo acuerdos de protección de datos empresariales.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">5. Derechos ARCO-POL de los Usuarios</h2>
                            <p>
                                En virtud de los artículos 15 a 22 del RGPD y la LOPDGDD, tienes derecho a ejercer:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[var(--brand-pink)] text-sm">
                                <li><strong>Acceso y Rectificación:</strong> Consultar y modificar tus datos en cualquier momento desde los ajustes de la aplicación.</li>
                                <li><strong>Supresión ("Derecho al Olvido"):</strong> Eliminar tu cuenta y todos tus datos personales de manera inmediata e irreversible desde los Ajustes de Perfil o enviando un correo a privacidad@klozet.app.</li>
                                <li><strong>Limitación, Oposición y Portabilidad:</strong> Solicitar la limitación del tratamiento o la exportación de tus datos en formato estructurado.</li>
                                <li><strong>Reclamación ante la Autoridad de Control:</strong> Tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] underline">www.aepd.es</a> si consideras que tus derechos han sido vulnerados.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">6. Conservación de los Datos</h2>
                            <p className="text-sm">
                                Los datos se conservarán mientras mantengas activa tu cuenta en Klozet. En el momento en que solicites la eliminación de tu cuenta, todos los registros de tu perfil, fotos de prendas, outfits y conversaciones se eliminarán de forma inmediata y definitiva de nuestros servidores.
                            </p>
                        </section>

                        <div className="pt-8 mt-8 border-t border-[var(--border-color)]/50 text-sm text-center">
                            <p>¿Quieres ejercer tus derechos de privacidad o tienes alguna consulta?</p>
                            <a href="mailto:privacidad@klozet.app" className="text-[var(--brand-pink)] font-semibold hover:underline mt-1 inline-block">
                                Contactar con privacidad@klozet.app
                            </a>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
