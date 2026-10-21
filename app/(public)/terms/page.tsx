'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function TermsPage() {
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
                        <Link href="/privacy" className="hover:text-[var(--brand-pink)] transition-colors">
                            Privacidad
                        </Link>
                        <span>•</span>
                        <Link href="/cookies" className="hover:text-[var(--brand-pink)] transition-colors">
                            Cookies
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
                            <Scale className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--foreground)] mb-3 tracking-tight">
                            Términos y Condiciones
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-sm md:text-base max-w-xl mx-auto">
                            Condiciones Generales de Contratación y Uso de la Plataforma Klozet
                        </p>
                        <p className="text-xs text-[var(--foreground-tertiary)] mt-2">
                            Última actualización: Octubre de 2026 • Legislación española (LSSI-CE y TRLGDCU)
                        </p>
                    </div>

                    <div className="bg-[var(--card-bg)]/70 backdrop-blur-xl border border-[var(--border-color)]/60 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl space-y-8 text-[var(--foreground-secondary)] text-sm md:text-base leading-relaxed">
                        
                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">1. Información General y Titularidad (Art. 10 LSSI-CE)</h2>
                            <p>
                                En cumplimiento del deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se informa de los datos identificativos del prestador del servicio:
                            </p>
                            <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]/60 text-xs md:text-sm space-y-1">
                                <p><strong>Denominación comercial:</strong> Klozet (Wardrobe.AI)</p>
                                <p><strong>Actividad:</strong> Plataforma digital de gestión de armario virtual, red social de moda y estilismo mediante inteligencia artificial.</p>
                                <p><strong>Correo electrónico de contacto:</strong> <a href="mailto:soporte@klozet.es" className="text-[var(--brand-pink)] underline font-medium">soporte@klozet.es</a></p>
                                <p><strong>Dominio oficial:</strong> <a href="https://klozet.es" className="text-[var(--brand-pink)] underline font-medium">https://klozet.es</a></p>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">2. Objeto y Ámbito de Aplicación</h2>
                            <p>
                                Los presentes Términos regulan el acceso, navegación y uso de la plataforma web y móvil Klozet, así como la contratación de suscripciones digitales (Klozet Pro). La utilización del servicio atribuye la condición de Usuario y conlleva la aceptación plena de todas las disposiciones aquí expuestas.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">3. Registro, Cuenta y Obligaciones del Usuario</h2>
                            <p>
                                Para acceder a las funciones principales, el usuario debe crear una cuenta proporcionando información veraz y lícita. El usuario es responsable exclusivo de la custodia de sus credenciales.
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--brand-pink)] text-xs md:text-sm">
                                <li>Queda terminantemente prohibido publicar contenidos ilícitos, violentos, difamatorios, de odio o que vulneren derechos de propiedad intelectual de terceros.</li>
                                <li>No se permite el uso de herramientas automatizadas invasivas o ataques que comprometan la estabilidad de los servicios.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">4. Precios, Suscripciones y Pagos Seguros (Stripe)</h2>
                            <p>
                                De conformidad con el Real Decreto Legislativo 1/2007 (TRLGDCU), todos los precios indicados en la plataforma incluyen el Impuesto sobre el Valor Añadido (21% IVA en España):
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--brand-pink)] text-xs md:text-sm">
                                <li><strong>Plan Free:</strong> Gratuito, con gestión de armario virtual, feed y consultas de prueba.</li>
                                <li><strong>Plan Klozet Pro Mensual:</strong> 3,99 € / mes (IVA incl.).</li>
                                <li><strong>Plan Klozet Pro Anual:</strong> 29,99 € / año (IVA incl.).</li>
                            </ul>
                            <p className="text-xs md:text-sm">
                                El procesamiento de pagos se realiza a través de la pasarela segura certificada <strong>Stripe</strong> (compatible con tarjetas bancarias, Apple Pay y Google Pay con cifrado SSL/TLS de nivel bancario). La suscripción se renueva automáticamente salvo cancelación previa desde los ajustes del perfil.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">5. Derecho Legal de Desistimiento</h2>
                            <p className="text-xs md:text-sm">
                                De conformidad con el artículo 102 del TRLGDCU, el consumidor dispone de un plazo de 14 días naturales para desistir de la contratación del servicio. De acuerdo con el Art. 103.m del TRLGDCU, el inicio de la ejecución del contenido digital previa solicitud del usuario extingue el derecho de desistimiento una vez prestado el servicio.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">6. Inteligencia Artificial y Descargo de Responsabilidad (EU AI Act)</h2>
                            <p className="text-xs md:text-sm">
                                En cumplimiento del Reglamento Europeo de Inteligencia Artificial (Reglamento UE 2024/1689):
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--brand-pink)] text-xs md:text-sm">
                                <li>El usuario es informado de que interactúa con un sistema automatizado de inteligencia artificial generativa (Kloe AI).</li>
                                <li>Las recomendaciones de estilismo, combinaciones de ropa y armonía cromática son sugerencias creativas y orientativas.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">7. Propiedad Intelectual y Contenidos</h2>
                            <p className="text-xs md:text-sm">
                                El usuario conserva la titularidad de las fotografías de sus prendas y outfits subidas a la plataforma. Concede a Klozet una licencia no exclusiva y limitada para procesar, optimizar y exhibir dicho contenido dentro de la plataforma según los ajustes de privacidad del usuario.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">8. Ley Aplicable y Jurisdicción</h2>
                            <p className="text-xs md:text-sm">
                                Estos Términos se rigen por la legislación española. Para la resolución de litigios en línea, la Comisión Europea facilita la plataforma accesible en <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] underline">ec.europa.eu/consumers/odr</a>.
                            </p>
                        </section>

                        <div className="pt-6 mt-6 border-t border-[var(--border-color)]/50 text-xs md:text-sm text-center">
                            <p>¿Tienes dudas sobre nuestros Términos Legales?</p>
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
