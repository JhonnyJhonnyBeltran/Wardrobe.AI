'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Blob = ({ className, delay }: { className: string, delay: number }) => (
    <motion.div
        className={`fixed rounded-full mix-blend-screen filter blur-[100px] opacity-20 dark:opacity-30 pointer-events-none ${className}`}
        animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: delay,
            ease: "easeInOut"
        }}
    />
);

export default function TermsPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen bg-[var(--background)] overflow-x-hidden selection:bg-[var(--brand-pink)] selection:text-white">
            {/* Animated Gradient Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <Blob className="top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[var(--brand-pink)] to-purple-500" delay={0} />
                <Blob className="bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-tl from-indigo-500 to-[var(--brand-pink)]" delay={2} />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border-color)]/50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-[var(--background-secondary)] transition-colors flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:block">Volver</span>
                    </button>
                    
                    <div className="flex items-center justify-center">
                        <Image src="/klozet-logo.png" alt="Klozet" width={80} height={24} className="dark:hidden block object-contain" priority />
                        <Image src="/klozet-logo-dark.png" alt="Klozet" width={80} height={24} className="hidden dark:block object-contain" priority />
                    </div>

                    <div className="w-[68px]"></div> {/* Spacer for centering */}
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-3xl mx-auto px-4 py-12 md:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-8 h-8 text-[var(--brand-pink)]" />
                        </div>
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
