'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Scale, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function TermsPage() {
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
                        <Link href="/privacy" className="text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] transition-colors">
                            Privacidad
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
                            <Scale className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight">
                            Términos y Condiciones
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-base md:text-lg">
                            Condiciones Generales de Contratación y Uso de la Plataforma
                        </p>
                        <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                            Última actualización: Septiembre de 2026 • Adaptado a la legislación española (LSSI-CE y TRLGDCU)
                        </p>
                    </div>

                    <div className="bg-[var(--card-bg)]/60 backdrop-blur-xl border border-[var(--border-color)]/50 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 text-[var(--foreground-secondary)] text-base leading-relaxed">
                        
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">1. Información General y Titularidad (Art. 10 LSSI-CE)</h2>
                            <p>
                                En cumplimiento del deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se informa de los datos identificativos del prestador del servicio:
                            </p>
                            <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]/60 text-sm space-y-1">
                                <p><strong>Denominación comercial:</strong> Klozet (Wardrobe.AI)</p>
                                <p><strong>Actividad:</strong> Plataforma digital de gestión de armario virtual, red social de moda y estilismo mediante inteligencia artificial.</p>
                                <p><strong>Correo electrónico de contacto:</strong> soporte@klozet.app</p>
                                <p><strong>Dominio principal:</strong> https://klozet.ai</p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">2. Objeto y Ámbito de Aplicación</h2>
                            <p>
                                Los presentes Términos regulan el acceso, navegación y uso de la plataforma web y móvil Klozet, así como la contratación de suscripciones digitales (Klozet Pro). La utilización del servicio atribuye la condición de Usuario y conlleva la aceptación plena y sin reservas de todas las disposiciones incluidas en este documento.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">3. Registro, Cuenta y Obligaciones del Usuario</h2>
                            <p>
                                Para acceder a las funciones principales, el usuario debe crear una cuenta proporcionando información veraz y lícita. El usuario es responsable exclusivo de la custodia de sus credenciales.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[var(--brand-pink)] text-sm">
                                <li>Queda terminantemente prohibido publicar o transmitir contenidos ilícitos, violentos, difamatorios, pornográficos o que vulneren derechos de propiedad intelectual o industrial de terceros.</li>
                                <li>No se permite el uso de herramientas automatizadas, scrapers no autorizados o ataques que comprometan la estabilidad de la plataforma o los límites de uso de la IA.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">4. Precios, Suscripciones y Pagos Seguros (Stripe)</h2>
                            <p>
                                De conformidad con el Real Decreto Legislativo 1/2007 (TRLGDCU), todos los precios indicados en la plataforma incluyen el Impuesto sobre el Valor Añadido (21% IVA en España):
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[var(--brand-pink)] text-sm">
                                <li><strong>Plan Free:</strong> Gratuito, con gestión de armario virtual, feed y consultas de prueba.</li>
                                <li><strong>Plan Klozet Pro Mensual:</strong> 3,99 € / mes (IVA incl.).</li>
                                <li><strong>Plan Klozet Pro Anual:</strong> 29,99 € / año (IVA incl.).</li>
                            </ul>
                            <p className="text-sm">
                                El procesamiento de pagos se realiza a través de la pasarela segura certificada <strong>Stripe</strong> (compatible con tarjetas bancarias, Apple Pay y Google Pay con cifrado SSL/TLS de nivel bancario). La suscripción se renovará automáticamente al término de cada ciclo salvo cancelación previa por parte del usuario desde los ajustes de su perfil.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">5. Derecho Legal de Desistimiento y Excepciones Digitales</h2>
                            <p>
                                De conformidad con el artículo 102 del TRLGDCU, el consumidor dispone de un plazo de <strong>14 días naturales</strong> para desistir de la contratación del servicio sin necesidad de justificación.
                            </p>
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs md:text-sm text-amber-900 dark:text-amber-200">
                                <strong>Aviso legal sobre contenido digital (Art. 103.m TRLGDCU):</strong> Al solicitar la activación inmediata de los servicios digitales Klozet Pro (acceso a análisis de fotos con IA, estilismo multimodal y generación instantánea), el usuario consiente expresamente el inicio de la ejecución del servicio y reconoce que pierde su derecho de desistimiento una vez que la ejecución del servicio haya comenzado plenamente.
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">6. Inteligencia Artificial y Descargo de Responsabilidad (EU AI Act)</h2>
                            <p>
                                En cumplimiento del Reglamento Europeo de Inteligencia Artificial (Reglamento UE 2024/1689):
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[var(--brand-pink)] text-sm">
                                <li>El usuario es informado de que interactúa con un sistema automatizado de inteligencia artificial generativa (Kloe AI / modelos multimodales).</li>
                                <li>Las recomendaciones de estilismo, armonía de color y combinaciones de ropa son sugerencias orientativas y creativas. Klozet no garantiza que los resultados se adapten a exigencias subjetivas ni emite afirmaciones engañosas sobre infalibilidad.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">7. Propiedad Intelectual y Contenidos</h2>
                            <p>
                                El usuario conserva la titularidad y derechos de autor sobre las fotografías de sus prendas y outfits. Concede a Klozet una licencia no exclusiva, limitada territorial y temporalmente, y exenta de royalties para almacenar, procesar (eliminación de fondo y análisis cromático) y mostrar dicho contenido según la configuración de privacidad elegida.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">8. Ley Aplicable y Resolución de Disputas</h2>
                            <p>
                                Estos Términos se rigen por la legislación española. Para la resolución de controversias relativas a consumidores, serán competentes los juzgados y tribunales del domicilio del usuario. Asimismo, la Comisión Europea facilita una plataforma de resolución de litigios en línea disponible en: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] underline">https://ec.europa.eu/consumers/odr</a>.
                            </p>
                        </section>

                        <div className="pt-8 mt-8 border-t border-[var(--border-color)]/50 text-sm text-center">
                            <p>¿Tienes dudas sobre nuestros Términos Legales?</p>
                            <a href="mailto:soporte@klozet.app" className="text-[var(--brand-pink)] font-semibold hover:underline mt-1 inline-block">
                                Escríbenos a soporte@klozet.app
                            </a>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
