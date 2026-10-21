'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, LockKeyhole, ArrowLeft, Radio, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPage() {
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
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--foreground)] mb-3 tracking-tight">
                            Política de Privacidad
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-sm md:text-base max-w-xl mx-auto">
                            Reglamento General de Protección de Datos (RGPD UE 2016/679), LOPDGDD y Políticas de Publicidad de Google
                        </p>
                        <p className="text-xs text-[var(--foreground-tertiary)] mt-2">
                            Última actualización: Octubre de 2026 • Klozet (klozet.es)
                        </p>
                    </div>

                    <div className="bg-[var(--card-bg)]/70 backdrop-blur-xl border border-[var(--border-color)]/60 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl space-y-8 text-[var(--foreground-secondary)] text-sm md:text-base leading-relaxed">
                        
                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">1. Responsable del Tratamiento</h2>
                            <p>
                                De conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), se informa de que los datos personales recogidos a través de la plataforma <strong>Klozet</strong> (accesible en <a href="https://klozet.es" className="text-[var(--brand-pink)] underline font-medium">https://klozet.es</a>) serán tratados bajo la responsabilidad del equipo de Klozet (Wardrobe.AI).
                            </p>
                            <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]/60 text-xs md:text-sm space-y-1">
                                <p><strong>Denominación:</strong> Klozet (Wardrobe.AI)</p>
                                <p><strong>Correo electrónico de privacidad y DPO:</strong> <a href="mailto:privacidad@klozet.es" className="text-[var(--brand-pink)] font-semibold underline">privacidad@klozet.es</a></p>
                                <p><strong>Correo electrónico de soporte general:</strong> <a href="mailto:soporte@klozet.es" className="text-[var(--brand-pink)] font-semibold underline">soporte@klozet.es</a></p>
                                <p><strong>Ubicación:</strong> España (Unión Europea)</p>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">2. Datos Recopilados y Principio de Minimización (Art. 5.1.c RGPD)</h2>
                            <p>
                                Solo recopilamos los datos estrictamente necesarios y adecuados para prestar el servicio de red social de moda y armario virtual inteligente:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--brand-pink)] text-xs md:text-sm">
                                <li><strong>Datos de cuenta:</strong> Correo electrónico, nombre de usuario y nombre completo.</li>
                                <li><strong>Contenido del armario y publicaciones:</strong> Fotografías de prendas de ropa subidas voluntariamente por el usuario, categorizaciones, colores, combinaciones de outfits y comentarios en la comunidad.</li>
                                <li><strong>Preferencias opcionales de estilo:</strong> Rango de edad, morfología y preferencias estéticas (estrictamente voluntarias para refinar recomendaciones en el feed y estilismo).</li>
                                <li><strong>Datos transaccionales:</strong> Gestión de identificadores de suscripción procesados con cifrado seguro a través de Stripe (Klozet nunca almacena números de tarjeta bancaria).</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">3. Finalidades y Bases Jurídicas del Tratamiento</h2>
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
                                            <td className="p-3.5">Análisis de fotos de ropa y recomendaciones de estilismo con IA (Kloe).</td>
                                            <td className="p-3.5">Consentimiento expreso y ejecución de contrato (Art. 6.1.a y 6.1.b RGPD).</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3.5">Gestión de suscripciones de pago Klozet Pro.</td>
                                            <td className="p-3.5">Ejecución contractual y cumplimiento fiscal (Art. 6.1.b y 6.1.c RGPD).</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3.5">Medición de audiencia y visualización de anuncios no intrusivos mediante proveedores autorizados.</td>
                                            <td className="p-3.5">Consentimiento expreso previo mediante banner de cookies (Art. 6.1.a RGPD y Art. 22.2 LSSI).</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">4. Destinatarios y Encargados del Tratamiento</h2>
                            <p className="text-xs md:text-sm">
                                Klozet no vende ni alquila datos personales a intermediarios o terceros. Para la prestación segura del servicio colaboramos con proveedores técnicos bajo garantías del RGPD y Cláusulas Contractuales Tipo:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--brand-pink)] text-xs md:text-sm">
                                <li><strong>Supabase Inc.:</strong> Alojamiento de bases de datos, autenticación segura y almacenamiento cifrado en tránsito y reposo.</li>
                                <li><strong>Stripe Inc.:</strong> Pasarela de pagos segura certificada PCI-DSS Nivel 1.</li>
                                <li><strong>Google Cloud (Gemini API):</strong> Procesamiento seguro de visión por computador para catalogación de prendas sin almacenamiento persistente para entrenamiento general.</li>
                            </ul>
                        </section>

                        {/* SECTION REQUIRED BY GOOGLE ADSENSE */}
                        <section className="space-y-4 rounded-2xl bg-[var(--background-secondary)]/80 border border-[var(--brand-pink)]/30 p-5 md:p-6 shadow-sm">
                            <div className="flex items-center gap-2.5">
                                <Radio className="w-5 h-5 text-[var(--brand-pink)]" />
                                <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                                    5. Publicidad, Proveedores Externos y Cookies de Google AdSense
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm leading-relaxed">
                                Para mantener el acceso gratuito a funcionalidades de la plataforma, Klozet colabora con proveedores publicitarios externos, principalmente <strong>Google LLC (Google AdSense)</strong>, para servir anuncios publicitarios en páginas públicas del sitio web.
                            </p>
                            <div className="space-y-2 text-xs md:text-sm">
                                <p>
                                    En cumplimiento con los requisitos obligatorios de Google AdSense y la legislación europea de privacidad:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 marker:text-[var(--brand-pink)]">
                                    <li>
                                        <strong>Google y proveedores externos:</strong> Google, como proveedor asociado externo, utiliza cookies para publicar anuncios en Klozet en función de las visitas anteriores del usuario a este u otros sitios web de Internet.
                                    </li>
                                    <li>
                                        <strong>Cookies publicitarias:</strong> El uso de cookies de publicidad (incluida la cookie de Google / DoubleClick) permite a Google y a sus socios mostrar anuncios a los usuarios en función de las visitas realizadas a sitios de Internet.
                                    </li>
                                    <li>
                                        <strong>Inhabilitación de publicidad personalizada:</strong> Los usuarios pueden inhabilitar en cualquier momento la publicidad personalizada accediendo a la <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] underline font-semibold inline-flex items-center gap-1">Configuración de Anuncios de Google <ExternalLink className="w-3 h-3" /></a>.
                                    </li>
                                    <li>
                                        <strong>Mecanismos de exclusión adicionales:</strong> Si no has inhabilitado la publicación de anuncios de terceros, también puedes inhabilitar el uso de cookies para publicidad personalizada a través del sitio web de autorregulación <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] underline font-semibold inline-flex items-center gap-1">www.aboutads.info <ExternalLink className="w-3 h-3" /></a> o mediante la plataforma europea <a href="https://www.youronlinechoices.com/es/" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] underline font-semibold inline-flex items-center gap-1">Your Online Choices <ExternalLink className="w-3 h-3" /></a>.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">6. Derechos ARCO-POL de los Usuarios</h2>
                            <p className="text-xs md:text-sm">
                                En virtud de los artículos 15 a 22 del RGPD y la LOPDGDD, tienes garantizados los siguientes derechos:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--brand-pink)] text-xs md:text-sm">
                                <li><strong>Acceso y Rectificación:</strong> Consultar y modificar tus datos en cualquier momento desde los ajustes de perfil.</li>
                                <li><strong>Supresión (&quot;Derecho al Olvido&quot;):</strong> Eliminar tu cuenta y todos tus datos personales de manera inmediata desde los Ajustes de Perfil o escribiendo a <a href="mailto:soporte@klozet.es" className="text-[var(--brand-pink)] underline">soporte@klozet.es</a>.</li>
                                <li><strong>Limitación, Oposición y Portabilidad:</strong> Solicitar la limitación de tratamientos o descargar tus datos en formato estructurado.</li>
                                <li><strong>Reclamación ante la AEPD:</strong> Puedes presentar una reclamación ante la Agencia Española de Protección de Datos en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] underline">www.aepd.es</a>.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">7. Conservación y Eliminación de Datos</h2>
                            <p className="text-xs md:text-sm">
                                Los datos se conservan únicamente mientras mantengas activa tu cuenta en Klozet. En el momento en que solicites la baja, se eliminan definitivamente prendas, fotos, outfits y perfil de nuestros servidores y almacenes en la nube.
                            </p>
                        </section>

                        <section className="space-y-3 border-t border-[var(--border-color)]/60 pt-6">
                            <div className="flex items-center gap-2">
                                <LockKeyhole className="w-5 h-5 text-[var(--brand-pink)]" />
                                <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                                    8. Uso y Protección de Datos de Servicios de Google (Google API Services User Data Policy)
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm leading-relaxed">
                                Cuando decides iniciar sesión o registrarte con Google Sign-In (OAuth 2.0), únicamente solicitamos acceso a tu información básica pública no sensible (correo electrónico, nombre completo y avatar).
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--brand-pink)] text-xs md:text-sm">
                                <li><strong>Propósito Exclusivo:</strong> Autenticación e inicio de sesión seguro en tu armario virtual.</li>
                                <li><strong>No Cesión ni Venta:</strong> Klozet no vende ni comercializa datos procedentes de las APIs de Google.</li>
                                <li><strong>Requisitos de Uso Limitado:</strong> El tratamiento se adhiere de forma estricta a la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] font-semibold underline">Política de Datos de Usuario de los Servicios de API de Google</a>.</li>
                                <li><strong>Revocación:</strong> Puedes revocar el acceso en cualquier momento en <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-pink)] underline font-semibold">myaccount.google.com/permissions</a>.</li>
                            </ul>
                        </section>

                        <div className="pt-6 mt-6 border-t border-[var(--border-color)]/50 text-xs md:text-sm text-center">
                            <p>¿Tienes alguna consulta o deseas ejercer tus derechos de privacidad?</p>
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
