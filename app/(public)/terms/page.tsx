'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function TermsPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen bg-[var(--background)] overflow-x-hidden selection:bg-[var(--brand-pink)] selection:text-white">
            {/* Main Content */}
            <main className="relative z-10 max-w-3xl mx-auto px-4 py-12 md:py-20">
                <div className="mb-12">
                    <button 
                        onClick={() => router.push('/auth')}
                        className="inline-block hover:opacity-80 transition-opacity"
                        title="Volver a Inicio"
                    >
                        <Image src="/klozet-logo.png" alt="Klozet" width={100} height={30} className="dark:hidden block object-contain" priority />
                        <Image src="/klozet-logo-dark.png" alt="Klozet" width={100} height={30} className="hidden dark:block object-contain" priority />
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-12 text-center">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight">
                            Términos de Servicio
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-lg">
                            Última actualización: Agosto de 2026
                        </p>
                    </div>

                    <div className="bg-[var(--card-bg)]/60 backdrop-blur-xl border border-[var(--border-color)]/50 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 text-[var(--foreground-secondary)] text-base md:text-lg leading-relaxed">
                        
                        <section className="space-y-4">
                            <p className="font-medium text-[var(--foreground)]">Bienvenido a Klozet. El asistente de moda inteligente que revolucionará tu estilo diario.</p>
                            <p>
                                Estos Términos de Servicio ("Términos") rigen tu uso de nuestra aplicación web, móvil y cualquier servicio relacionado (colectivamente, el "Servicio"). 
                                Al acceder o utilizar Klozet, aceptas estar sujeto a estos términos en su totalidad. Si no estás de acuerdo, no utilices nuestra plataforma.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">1. Uso del Servicio</h2>
                            <p>
                                Klozet te permite subir imágenes de prendas, crear outfits y explorar estilos sugeridos por inteligencia artificial.
                                Te comprometes a usar nuestra plataforma de manera responsable, legal y ética. No está permitido:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[var(--brand-pink)]">
                                <li>Subir contenido ofensivo, violento o que infrinja los derechos de autor de terceros.</li>
                                <li>Utilizar la plataforma para fines ilícitos o no autorizados.</li>
                                <li>Intentar eludir las limitaciones de seguridad o acceso del Servicio.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">2. Contenido del Usuario</h2>
                            <p>
                                Tú conservas todos los derechos de propiedad sobre el contenido que subes a Klozet. Sin embargo, al publicar contenido (como prendas u outfits), 
                                nos concedes una licencia mundial, no exclusiva y libre de regalías para alojar, almacenar, utilizar y mostrar dicho contenido con el único fin 
                                de proporcionarte el Servicio y operar la plataforma, siempre respetando tu configuración de privacidad.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">3. Cuenta y Seguridad</h2>
                            <p>
                                Eres responsable de mantener la confidencialidad de tus credenciales de inicio de sesión y de todas las actividades que ocurran bajo tu cuenta. 
                                Te recomendamos usar métodos de inicio de sesión seguros (como Apple o Google) que integramos en nuestra plataforma.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">4. Inteligencia Artificial</h2>
                            <p>
                                Klozet utiliza modelos avanzados de inteligencia artificial para organizar tu armario y sugerir outfits. 
                                Ten en cuenta que, aunque nos esforzamos por ofrecer sugerencias precisas y estéticas, la IA puede cometer errores 
                                o proponer combinaciones inusuales. El uso final de las recomendaciones es tu decisión.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">5. Modificaciones</h2>
                            <p>
                                Nos reservamos el derecho de modificar o reemplazar estos Términos en cualquier momento. 
                                Te notificaremos sobre cambios significativos a través de la aplicación o por correo electrónico. 
                                Tu uso continuado del Servicio después de dichos cambios constituye tu aceptación de los nuevos Términos.
                            </p>
                        </section>

                        <div className="pt-8 mt-8 border-t border-[var(--border-color)]/50 text-sm text-center">
                            <p>¿Tienes dudas sobre nuestros Términos?</p>
                            <a href="mailto:soporte@klozet.app" className="text-[var(--brand-pink)] font-semibold hover:underline mt-1 inline-block">
                                Contacta con soporte@klozet.app
                            </a>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
