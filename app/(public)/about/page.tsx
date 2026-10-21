'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Sparkles, 
    Layers, 
    Users, 
    HeartHandshake, 
    ShieldCheck, 
    Shirt, 
    Compass, 
    ArrowRight,
    Leaf,
    Palette
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen bg-[var(--background)] overflow-x-hidden selection:bg-[var(--brand-pink)] selection:text-white">
            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 py-10 md:py-16">
                {/* Header Navigation */}
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
                        <Link href="/contact" className="hover:text-[var(--brand-pink)] transition-colors">
                            Contacto
                        </Link>
                        <span>•</span>
                        <Link href="/privacy" className="hover:text-[var(--brand-pink)] transition-colors">
                            Privacidad
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
                    className="space-y-12"
                >
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs md:text-sm font-semibold border border-[var(--brand-pink)]/20 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>La Red Social de Moda y Armario Virtual</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-tight">
                            Redefiniendo cómo te relacionas <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent">
                                con tu armario cada día
                            </span>
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                            Klozet nace con un propósito claro: terminar con el clásico dilema de &quot;tengo el armario lleno pero nada que ponerme&quot;. Fusionamos la creatividad de una comunidad de moda real con tecnología de digitalización y estilismo inteligente.
                        </p>
                    </div>

                    {/* Mission Card */}
                    <div className="bg-[var(--card-bg)]/70 backdrop-blur-xl border border-[var(--border-color)]/60 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center border border-[var(--brand-pink)]/20">
                                <Compass className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">Nuestra Misión</h2>
                                <p className="text-xs md:text-sm text-[var(--foreground-secondary)]">Democratizar el estilismo personal y dar una nueva vida a tu ropa</p>
                            </div>
                        </div>

                        <p className="text-sm md:text-base text-[var(--foreground-secondary)] leading-relaxed">
                            En Klozet creemos que el estilo no depende de comprar ropa sin parar, sino de saber combinar y valorar las prendas que ya forman parte de tu vida. Creamos un espacio donde puedes digitalizar tus prendas favoritas en segundos, armar combinaciones en un lienzo interactivo libre de ataduras y recibir recomendaciones de estilismo que respetan tu personalidad y tus colores.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            <div className="p-4 rounded-2xl bg-[var(--background-secondary)]/80 border border-[var(--border-color)]/50 space-y-2">
                                <Shirt className="w-5 h-5 text-[var(--brand-pink)]" />
                                <h3 className="font-bold text-sm text-[var(--foreground)]">Digitalización Real</h3>
                                <p className="text-xs text-[var(--foreground-secondary)] leading-relaxed">
                                    Sube fotos de tus prendas cotidianas; la IA elimina el fondo al instante y organiza tu armario en la palma de tu mano.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-[var(--background-secondary)]/80 border border-[var(--border-color)]/50 space-y-2">
                                <Palette className="w-5 h-5 text-purple-400" />
                                <h3 className="font-bold text-sm text-[var(--foreground)]">Estilismo y Colorimetría</h3>
                                <p className="text-xs text-[var(--foreground-secondary)] leading-relaxed">
                                    Nuestra asesora Kloe analiza proporciones, cortes anatómicos y balance de colores para ofrecerte outfits de pies a cabeza.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-[var(--background-secondary)]/80 border border-[var(--border-color)]/50 space-y-2">
                                <Leaf className="w-5 h-5 text-emerald-500" />
                                <h3 className="font-bold text-sm text-[var(--foreground)]">Moda Sostenible</h3>
                                <p className="text-xs text-[var(--foreground-secondary)] leading-relaxed">
                                    Fomentamos un consumo consciente: redescubre prendas olvidadas, optimiza tus combinaciones y compra con criterio.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Community Values */}
                    <div className="bg-[var(--card-bg)]/70 backdrop-blur-xl border border-[var(--border-color)]/60 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">Comunidad y Estándares de Convivencia</h2>
                                <p className="text-xs md:text-sm text-[var(--foreground-secondary)]">Un entorno seguro, inspirador y auténtico para amantes de la moda</p>
                            </div>
                        </div>

                        <p className="text-sm md:text-base text-[var(--foreground-secondary)] leading-relaxed">
                            Klozet es más que una herramienta: es una comunidad vibrante donde personas con diferentes gustos (streetwear, minimalismo, quiet luxury, y2k, vintage o casual) comparten sus outfits diarios (OOTD) sin la toxicidad o algoritmos engañosos de redes tradicionales.
                        </p>

                        <div className="space-y-3 text-xs md:text-sm text-[var(--foreground-secondary)]">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center shrink-0 mt-0.5">
                                    ✓
                                </div>
                                <p>
                                    <strong>Inspiración real sin postureo:</strong> Celebramos looks auténticos del día a día creados con prendas reales, accesibles y combinadas con estilo propio.
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center shrink-0 mt-0.5">
                                    ✓
                                </div>
                                <p>
                                    <strong>Respeto absoluto y cero tolerancia al acoso:</strong> Mantenemos filtros de moderación activos para garantizar un entorno inclusivo, libre de comentarios ofensivos, discriminación o conductas tóxicas.
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center shrink-0 mt-0.5">
                                    ✓
                                </div>
                                <p>
                                    <strong>Privacidad como derecho fundamental:</strong> Tu armario es tuyo. Puedes decidir qué looks compartir con la comunidad y cuáles conservar de forma estrictamente privada.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="bg-[var(--card-bg)]/70 backdrop-blur-xl border border-[var(--border-color)]/60 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                                <HeartHandshake className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">El Equipo Detrás de Klozet</h2>
                                <p className="text-xs md:text-sm text-[var(--foreground-secondary)]">Desarrollado con pasión artesanal desde España</p>
                            </div>
                        </div>

                        <p className="text-sm md:text-base text-[var(--foreground-secondary)] leading-relaxed">
                            Somos un equipo multidisciplinar de diseñadores de producto, entusiastas de la moda y desarrolladores de software con sede en Madrid, España. Diseñamos cada pantalla con estándares artesanales de calidad (Apple Human Interface Guidelines), obsesionándonos con la fluidez, la tipografía y la experiencia táctil.
                        </p>

                        <div className="p-4 rounded-2xl bg-[var(--background-secondary)]/80 border border-[var(--border-color)]/50 text-xs md:text-sm text-[var(--foreground-secondary)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <p className="font-semibold text-[var(--foreground)]">¿Quieres colaborar con nosotros o hacernos una propuesta?</p>
                                <p className="text-[var(--foreground-tertiary)] text-xs mt-0.5">Estamos siempre abiertos a ideas, prensa y diseñadores de moda.</p>
                            </div>
                            <Link
                                href="/contact"
                                className="px-5 py-2.5 rounded-full text-xs md:text-sm font-bold bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shrink-0 text-center"
                            >
                                Hablar con nosotros
                            </Link>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center py-6 space-y-4">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                            ¿Listo para transformar tu armario?
                        </h2>
                        <p className="text-xs md:text-sm text-[var(--foreground-secondary)] max-w-md mx-auto">
                            Únete a miles de personas que ya disfrutan de vestir mejor cada mañana sin complicaciones.
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/auth"
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/25 active:scale-95"
                            >
                                <span>Empezar gratis en Klozet</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
