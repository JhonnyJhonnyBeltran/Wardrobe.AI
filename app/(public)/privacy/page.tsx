'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PrivacyPage() {
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
                        <div className="w-16 h-16 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center mx-auto mb-6">
                            <LockKeyhole className="w-8 h-8 text-[var(--brand-pink)]" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight">
                            Política de Privacidad
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-lg">
                            Última actualización: Agosto de 2026
                        </p>
                    </div>

                    <div className="bg-[var(--card-bg)]/60 backdrop-blur-xl border border-[var(--border-color)]/50 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 text-[var(--foreground-secondary)] text-base md:text-lg leading-relaxed">
                        
                        <section className="space-y-4">
                            <p className="font-medium text-[var(--foreground)]">En Klozet, valoramos tu privacidad tanto como valoras tu propio armario.</p>
                            <p>
                                Esta Política de Privacidad explica de forma clara y transparente cómo recopilamos, utilizamos, 
                                protegemos y compartimos tu información cuando utilizas nuestra aplicación y plataforma.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">1. Información que recopilamos</h2>
                            <p>Para que Klozet funcione como tu estilista personal, necesitamos recopilar cierta información básica:</p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[var(--brand-pink)]">
                                <li><strong>Información de la cuenta:</strong> Tu nombre de usuario, dirección de correo electrónico e imagen de perfil.</li>
                                <li><strong>Contenido subido:</strong> Imágenes de tus prendas, outfits creados, colecciones y categorizaciones que realices dentro de la app.</li>
                                <li><strong>Datos de uso:</strong> Interacciones con la IA, tiempo de uso, preferencias de estilo y la forma en que navegas por Klozet.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">2. Uso de tu información</h2>
                            <p>Tus datos se utilizan exclusivamente para mejorar tu experiencia. Los utilizamos para:</p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[var(--brand-pink)]">
                                <li>Proporcionar y mantener nuestro servicio (por ejemplo, guardar tu armario virtual).</li>
                                <li>Permitir que nuestra IA analice tus prendas para recomendarte los mejores outfits.</li>
                                <li>Personalizar tu experiencia y las sugerencias de estilo de acuerdo a tus gustos y el clima de tu ubicación.</li>
                                <li>Comunicarnos contigo sobre actualizaciones, seguridad o soporte técnico.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">3. Protección y Seguridad (Supabase)</h2>
                            <p>
                                Nos tomamos la seguridad muy en serio. Klozet utiliza <strong>Supabase</strong> como backend principal, lo que garantiza 
                                que tu información, credenciales de inicio de sesión y datos personales estén encriptados y protegidos 
                                mediante estándares modernos de seguridad en la nube. 
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">4. Servicios de Terceros</h2>
                            <p>
                                Para facilitarte el acceso, permitimos el inicio de sesión a través de proveedores externos (Google, Apple). 
                                No tenemos acceso a tus contraseñas en esos servicios. Asimismo, utilizamos procesadores de inteligencia artificial 
                                a los que enviamos imágenes de tus prendas de forma anónima para generar sugerencias o eliminar fondos.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">5. Tus Derechos</h2>
                            <p>
                                Tienes control total sobre tus datos. Puedes editar o eliminar tu cuenta, tus prendas y tus outfits 
                                en cualquier momento desde los ajustes de la aplicación. Una vez eliminados, se borran permanentemente 
                                de nuestros servidores.
                            </p>
                        </section>

                        <div className="pt-8 mt-8 border-t border-[var(--border-color)]/50 text-sm text-center">
                            <p>¿Tienes dudas sobre nuestra política de privacidad?</p>
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
