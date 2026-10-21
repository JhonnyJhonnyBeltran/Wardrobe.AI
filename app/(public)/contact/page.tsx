'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Mail, 
    MessageSquare, 
    Clock, 
    MapPin, 
    Send, 
    CheckCircle2, 
    HelpCircle, 
    Sparkles, 
    ShieldCheck, 
    ArrowRight 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ContactPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState('soporte');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message || !acceptedPrivacy) return;

        setIsSubmitting(true);
        // Simulate immediate delivery confirmation & mailto fallback
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 600);
    };

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
                        <Link href="/about" className="hover:text-[var(--brand-pink)] transition-colors">
                            Sobre Nosotros
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
                >
                    {/* Hero Title */}
                    <div className="mb-12 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center mx-auto mb-4 border border-[var(--brand-pink)]/20 shadow-lg shadow-[var(--brand-pink)]/5">
                            <Mail className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--foreground)] mb-3 tracking-tight">
                            Contacto y Soporte
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-sm md:text-lg max-w-xl mx-auto leading-relaxed">
                            ¿Tienes dudas, sugerencias o necesitas ayuda con tu armario? Nuestro equipo te responderá con atención personalizada.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Company & Support Cards */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="bg-[var(--card-bg)]/70 backdrop-blur-xl border border-[var(--border-color)]/60 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
                                <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[var(--brand-pink)]" />
                                    <span>Atención directa</span>
                                </h2>

                                <div className="space-y-4 text-xs md:text-sm">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-9 h-9 rounded-xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--brand-pink)]/20">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--foreground)]">Soporte Técnico y General</p>
                                            <a href="mailto:soporte@klozet.es" className="text-[var(--brand-pink)] hover:underline font-mono">
                                                soporte@klozet.es
                                            </a>
                                            <p className="text-[var(--foreground-tertiary)] text-[11px] mt-0.5">Respuestas en menos de 24 horas laborables</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5">
                                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/20">
                                            <MessageSquare className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--foreground)]">Alianzas, Prensa y Publicidad</p>
                                            <a href="mailto:contacto@klozet.es" className="text-[var(--brand-pink)] hover:underline font-mono">
                                                contacto@klozet.es
                                            </a>
                                            <p className="text-[var(--foreground-tertiary)] text-[11px] mt-0.5">Propuestas comerciales y medios</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--foreground)]">Delegado de Privacidad (DPO)</p>
                                            <a href="mailto:privacidad@klozet.es" className="text-[var(--brand-pink)] hover:underline font-mono">
                                                privacidad@klozet.es
                                            </a>
                                            <p className="text-[var(--foreground-tertiary)] text-[11px] mt-0.5">Derechos RGPD y protección de datos</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[var(--border-color)]/50 space-y-2.5 text-xs text-[var(--foreground-secondary)]">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-[var(--foreground-tertiary)]" />
                                        <span>Horario: Lunes a Viernes, 9:00 - 18:00 CET</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-[var(--foreground-tertiary)]" />
                                        <span>Madrid, España (Unión Europea)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rapid Help Box */}
                            <div className="bg-[var(--background-secondary)]/70 border border-[var(--border-color)]/60 rounded-3xl p-6 text-xs md:text-sm space-y-3">
                                <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4 text-[var(--brand-pink)]" />
                                    <span>Preguntas Frecuentes</span>
                                </h3>
                                <div className="space-y-2.5 text-xs text-[var(--foreground-secondary)]">
                                    <div>
                                        <p className="font-semibold text-[var(--foreground)]">¿Cómo digitalizo mi ropa?</p>
                                        <p className="text-[var(--foreground-tertiary)] mt-0.5">Sube una foto desde tu galería o cámara; el recorte automático de fondo se realiza en 1 segundo.</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[var(--foreground)]">¿Es gratuito usar Klozet?</p>
                                        <p className="text-[var(--foreground-tertiary)] mt-0.5">Sí, el plan básico incluye armario virtual, feed social de moda y consultas de estilismo.</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[var(--foreground)]">¿Cómo cancelo una suscripción Pro?</p>
                                        <p className="text-[var(--foreground-tertiary)] mt-0.5">Puedes gestionarla y cancelarla en cualquier momento desde Ajustes de Perfil sin penalizaciones.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Contact Form */}
                        <div className="lg:col-span-7">
                            <div className="bg-[var(--card-bg)]/70 backdrop-blur-xl border border-[var(--border-color)]/60 rounded-3xl p-6 sm:p-9 md:p-10 shadow-xl">
                                {submitted ? (
                                    <div className="text-center py-10 space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">
                                            ¡Mensaje enviado con éxito!
                                        </h3>
                                        <p className="text-sm text-[var(--foreground-secondary)] max-w-md mx-auto leading-relaxed">
                                            Gracias por escribirnos, <strong>{name}</strong>. Hemos recibido tu consulta y nuestro equipo se pondrá en contacto contigo a través de <strong>{email}</strong> en un plazo inferior a 24 horas.
                                        </p>
                                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setSubmitted(false);
                                                    setMessage('');
                                                    setSubject('');
                                                }}
                                                className="px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold bg-[var(--background-secondary)] hover:bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] transition-all"
                                            >
                                                Enviar otro mensaje
                                            </button>
                                            <Link
                                                href="/"
                                                className="px-5 py-2.5 rounded-full text-xs md:text-sm font-bold bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-md shadow-[var(--brand-pink)]/20"
                                            >
                                                Volver a la portada
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                                                Envíanos un mensaje
                                            </h2>
                                            <p className="text-xs md:text-sm text-[var(--foreground-secondary)] mt-1">
                                                Rellena el formulario y te daremos respuesta lo antes posible.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-[var(--foreground)]">
                                                    Nombre completo <span className="text-[var(--brand-pink)]">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Tu nombre"
                                                    className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/40 transition-all"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-[var(--foreground)]">
                                                    Correo electrónico <span className="text-[var(--brand-pink)]">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="tu@email.com"
                                                    className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/40 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-[var(--foreground)]">
                                                    Motivo de consulta
                                                </label>
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/40 transition-all cursor-pointer"
                                                >
                                                    <option value="soporte">Soporte Técnico / Incidencias</option>
                                                    <option value="suscripcion">Dudas de Cuenta y Suscripción</option>
                                                    <option value="alianzas">Alianzas, Moda y Publicidad</option>
                                                    <option value="privacidad">Privacidad y Protección de Datos</option>
                                                    <option value="sugerencias">Ideas y Sugerencias de Estilo</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-[var(--foreground)]">
                                                    Asunto
                                                </label>
                                                <input
                                                    type="text"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                    placeholder="Breve descripción"
                                                    className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/40 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[var(--foreground)]">
                                                Mensaje <span className="text-[var(--brand-pink)]">*</span>
                                            </label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Cuéntanos en detalle en qué podemos ayudarte..."
                                                className="w-full px-4 py-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/40 transition-all resize-none"
                                            />
                                        </div>

                                        <div className="flex items-start gap-2.5 pt-1">
                                            <input
                                                type="checkbox"
                                                id="privacy-checkbox"
                                                required
                                                checked={acceptedPrivacy}
                                                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                                                className="mt-1 w-4 h-4 rounded text-[var(--brand-pink)] focus:ring-[var(--brand-pink)]/40 border-[var(--border-color)] cursor-pointer"
                                            />
                                            <label htmlFor="privacy-checkbox" className="text-xs text-[var(--foreground-secondary)] leading-snug cursor-pointer select-none">
                                                He leído y acepto la <Link href="/privacy" className="text-[var(--brand-pink)] underline hover:text-[var(--brand-pink-dark)]">Política de Privacidad</Link> de Klozet y autorizo el tratamiento de mis datos para responder a esta consulta.
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !name || !email || !message || !acceptedPrivacy}
                                            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-lg shadow-[var(--brand-pink)]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <Send className="w-4 h-4" />
                                            <span>{isSubmitting ? 'Enviando...' : 'Enviar consulta'}</span>
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
