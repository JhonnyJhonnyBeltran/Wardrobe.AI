'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Clock, MapPin, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function ContactPage() {
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
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 500);
  };

  const faqs = [
    {
      q: '¿Cómo digitalizo una prenda en Klozet?',
      a: 'Basta con tomar una foto de la prenda sobre una superficie neutra o colgada. Nuestro sistema aísla automáticamente la pieza, elimina el fondo y clasifica color, categoría y tejido en tu armario virtual.'
    },
    {
      q: '¿Es Klozet gratuito?',
      a: 'Sí. El registro, la subida de prendas y el feed social son gratuitos para todos los usuarios. Contamos con un plan Premium opcional para usuarios que desean recomendaciones ilimitadas de estilismo con Kloe y herramientas avanzadas de analítica de vestuario.'
    },
    {
      q: '¿Mi armario es público o privado?',
      a: 'Tú tienes el control total. Por defecto, tus prendas individuales permanecen en tu armario privado. Solo las combinaciones y outfits que decidas publicar en el feed serán visibles para la comunidad.'
    },
    {
      q: '¿Cómo puedo sugerir una nueva función o reportar un error?',
      a: 'Puedes utilizar este mismo formulario seleccionando la categoría "Sugerencia" o escribirnos directamente a soporte@klozet.es. También puedes usar el botón de reporte en los ajustes de tu perfil.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 antialiased selection:bg-[var(--brand-pink,#ff2d78)] selection:text-white">
      <PublicHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-xs uppercase font-bold tracking-widest text-[var(--brand-pink,#ff2d78)]">
            Contacto & Soporte
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
            ¿En qué podemos ayudarte?
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            Respondemos a todas las consultas, dudas técnicas o propuestas de colaboración en menos de 24 horas laborables.
          </p>
        </div>

        {/* Contact Grid: Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          
          {/* Direct Channels (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                Canales de Atención Directa
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">Soporte al Usuario</p>
                    <a href="mailto:soporte@klozet.es" className="text-zinc-500 hover:text-[var(--brand-pink,#ff2d78)] transition-colors">
                      soporte@klozet.es
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">Prensa y Colaboraciones</p>
                    <a href="mailto:contacto@klozet.es" className="text-zinc-500 hover:text-[var(--brand-pink,#ff2d78)] transition-colors">
                      contacto@klozet.es
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">Horario Operativo</p>
                    <p className="text-zinc-500">Lunes a Viernes • 9:00 a 19:00 CET</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">Ubicación</p>
                    <p className="text-zinc-500">España</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <p>
                <strong>Protección de Datos:</strong> Los datos remitidos en este formulario son tratados exclusivamente con la finalidad de resolver tu consulta de acuerdo con nuestra{' '}
                <Link href="/privacy" className="underline hover:text-zinc-900 dark:hover:text-white">
                  Política de Privacidad
                </Link>.
              </p>
            </div>
          </div>

          {/* Contact Form (3 cols) */}
          <div className="lg:col-span-3 p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
                  Mensaje recibido con éxito
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Gracias por contactar con Klozet. Nuestro equipo revisará tu mensaje y te responderá a <strong>{email}</strong> a la mayor brevedad.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setSubject('');
                      setMessage('');
                    }}
                    className="px-6 py-2 rounded-full text-xs font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                      Nombre completo *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                      Correo electrónico *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-category" className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                      Motivo de consulta
                    </label>
                    <select
                      id="contact-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-xs sm:text-sm"
                    >
                      <option value="soporte">Soporte Técnico / Problema en App</option>
                      <option value="cuenta">Mi Cuenta / Inicio de Sesión</option>
                      <option value="sugerencia">Sugerencia de Función</option>
                      <option value="prensa">Prensa & Marcas de Moda</option>
                      <option value="otro">Otro Asunto</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-subject" className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                      Asunto *
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Breve resumen del motivo"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                    Mensaje *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Cuéntanos con detalle en qué podemos ayudarte..."
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-xs sm:text-sm resize-none"
                  />
                </div>

                <div className="pt-1 flex items-start gap-2.5">
                  <input
                    id="contact-privacy"
                    type="checkbox"
                    required
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="contact-privacy" className="text-xs text-zinc-500 dark:text-zinc-400 select-none cursor-pointer">
                    He leído y acepto la{' '}
                    <Link href="/privacy" className="underline hover:text-zinc-900 dark:hover:text-white">
                      Política de Privacidad
                    </Link>{' '}
                    y el tratamiento de mis datos de contacto para responder a esta consulta.
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !acceptedPrivacy}
                    className="w-full py-3 rounded-full text-sm font-semibold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 disabled:opacity-40 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Enviando mensaje...' : 'Enviar consulta'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* FAQs Accordion / Grid */}
        <section className="pt-12 border-t border-zinc-200 dark:border-zinc-800 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Preguntas Frecuentes
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Respuestas rápidas a las dudas habituales de nuestra comunidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/70 space-y-2"
              >
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
