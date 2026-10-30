'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Clock, Send, CheckCircle2 } from 'lucide-react';
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

    const targetEmail = 'klozet.enterprise@gmail.com';
    const emailSubject = `[Klozet ${category.toUpperCase()}] ${subject || 'Consulta'}`;
    const emailBody = `Nombre: ${name}\nCorreo de contacto: ${email}\nMotivo: ${category}\n\nMensaje:\n${message}\n\n--\nEnviado desde el formulario de contacto de Klozet`;

    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  const faqs = [
    {
      q: '¿Cómo subo una prenda a mi armario?',
      a: 'Hazle una foto con luz natural o sube una captura de la tienda online donde la compraste. La app borra el fondo automáticamente en tu dispositivo y la etiqueta por ti.'
    },
    {
      q: '¿Es Klozet gratis?',
      a: 'Sí. Subir todas las prendas que quieras, montar outfits en el lienzo, usar el calendario semanal y compartir tus looks en el feed es 100% gratis, además de 3 consultas diarias con Kloe.'
    },
    {
      q: '¿Mi armario es público o privado?',
      a: 'Tus prendas sueltas son privadas por defecto. Solo los outfits o fotos que decidas compartir o dejar públicos se muestran en tu perfil.'
    },
    {
      q: '¿Cómo propongo una idea o reporto un fallo?',
      a: 'Escríbeme directamente desde este formulario o a klozet.enterprise@gmail.com. Leo y respondo todos los correos personalmente.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#111113] text-zinc-950 dark:text-zinc-50 antialiased selection:bg-[var(--brand-pink,#FF66C4)] selection:text-white">
      <PublicHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
        {/* Clean Left-Aligned Header */}
        <header className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold text-[var(--brand-pink-dark,#ED4C9E)]">
            Contacto y soporte directo
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.08]">
            ¿Tienes alguna duda o idea para mejorar Klozet?
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Soy Ethan, creador de Klozet. Si necesitas ayuda con tu cuenta, quieres proponer una mejora o colaborar, escríbeme directamente a{' '}
            <a
              href="mailto:klozet.enterprise@gmail.com"
              className="text-zinc-950 dark:text-white font-semibold underline decoration-[var(--brand-pink,#FF66C4)] underline-offset-4"
            >
              klozet.enterprise@gmail.com
            </a>.
          </p>
        </header>

        {/* Contact Grid: Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Direct Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-7 rounded-[24px] bg-zinc-50 dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800 space-y-6">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
                Contacto directo
              </h2>

              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[var(--brand-pink,#FF66C4)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-950 dark:text-white">Correo directo</p>
                    <a
                      href="mailto:klozet.enterprise@gmail.com"
                      className="text-zinc-600 dark:text-zinc-300 hover:text-[var(--brand-pink,#FF66C4)] transition-colors"
                    >
                      klozet.enterprise@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-950 dark:text-white">Dentro de la app</p>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-0.5">
                      También puedes enviarme sugerencias o reportar errores desde Ajustes → Soporte y Ayuda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-950 dark:text-white">Tiempo de respuesta</p>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-0.5">
                      Normalmente en menos de 24 horas (Lunes a Viernes).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-[20px] border border-zinc-200/70 dark:border-zinc-800/70 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Tus datos de contacto se usan únicamente para responder a tu mensaje conforme a la{' '}
              <Link href="/privacy" className="underline hover:text-zinc-950 dark:hover:text-white">
                Política de Privacidad
              </Link>.
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-[24px] bg-zinc-50 dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
                  Mensaje listo para enviar
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Se ha abierto tu aplicación de correo hacia <strong>klozet.enterprise@gmail.com</strong>. Te responderé a <strong>{email}</strong> enseguida.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setSubject('');
                      setMessage('');
                    }}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Escribir otro mensaje
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                      Nombre *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-pink,#FF66C4)] transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                      Tu correo *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-pink,#FF66C4)] transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-category" className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                      Motivo
                    </label>
                    <select
                      id="contact-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-pink,#FF66C4)] transition-all text-sm"
                    >
                      <option value="soporte">Soporte Técnico / Problema en App</option>
                      <option value="cuenta">Mi Cuenta / Suscripción Pro</option>
                      <option value="sugerencia">Idea o Sugerencia</option>
                      <option value="prensa">Marcas / Colaboraciones</option>
                      <option value="otro">Otro</option>
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
                      placeholder="¿Sobre qué me escribes?"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-pink,#FF66C4)] transition-all text-sm"
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
                    placeholder="Cuéntame con detalle..."
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-pink,#FF66C4)] transition-all text-sm resize-none"
                  />
                </div>

                <div className="pt-1 flex items-start gap-2.5">
                  <input
                    id="contact-privacy"
                    type="checkbox"
                    required
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-300 text-[var(--brand-pink,#FF66C4)] focus:ring-[var(--brand-pink,#FF66C4)] cursor-pointer"
                  />
                  <label htmlFor="contact-privacy" className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal cursor-pointer">
                    Acepto la <Link href="/privacy" className="underline hover:text-zinc-900 dark:hover:text-white">Política de Privacidad</Link> para recibir respuesta a mi consulta.
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !name || !email || !message || !acceptedPrivacy}
                    className="w-full py-3.5 px-6 rounded-full font-semibold text-sm bg-[var(--brand-pink,#FF66C4)] hover:opacity-95 text-white transition-all shadow-sm active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Enviar mensaje</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Clean FAQ Ledger */}
        <section className="pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white mb-6">
            Preguntas frecuentes
          </h2>

          <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 border-t border-b border-zinc-200/80 dark:border-zinc-800/80">
            {faqs.map((faq, i) => (
              <div key={i} className="py-5 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 items-baseline">
                <p className="md:col-span-5 font-semibold text-sm sm:text-base text-zinc-950 dark:text-white">
                  {faq.q}
                </p>
                <p className="md:col-span-7 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
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
