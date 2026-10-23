'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertTriangle, Bot, MessageSquare, CheckCircle2, Loader2, HelpCircle } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { toast } from 'sonner';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackCategory = 'bug' | 'feature' | 'ai' | 'other';

const CATEGORIES: { id: FeedbackCategory; label: string; icon: React.ElementType }[] = [
  { id: 'bug', label: 'Error o Bug', icon: AlertTriangle },
  { id: 'feature', label: 'Sugerencia', icon: HelpCircle },
  { id: 'ai', label: 'IA / Kloe', icon: Bot },
  { id: 'other', label: 'Otro', icon: MessageSquare },
];

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { user } = useUser();
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      toast.error('Por favor, describe con un poco más de detalle el problema o sugerencia.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        category,
        message: message.trim(),
        email: email.trim() || user?.email || 'anónimo',
        userId: user?.id || null,
        username: user?.username || null,
        metadata: {
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
          timestamp: new Date().toISOString()
        }
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Error al enviar el reporte');
      }

      setSubmitted(true);
      toast.success('¡Gracias! Tu reporte ha sido recibido.');
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('[FeedbackModal] Error:', err);
      toast.error('Hubo un problema al enviar tu mensaje. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                    Reportar un problema o sugerencia
                  </h3>
                  <p className="text-xs text-[var(--foreground-tertiary)]">
                    Tu opinión nos ayuda a perfeccionar Klozet
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="py-10 text-center flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <h4 className="text-lg font-bold text-[var(--foreground)] mb-1">
                  ¡Reporte enviado con éxito!
                </h4>
                <p className="text-xs text-[var(--foreground-tertiary)] max-w-xs">
                  Lo revisaremos en el panel de control del equipo. Muchas gracias por ayudarnos a mejorar.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Pills */}
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-2">
                    Tipo de reporte
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const selected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl border transition-all text-xs font-semibold cursor-pointer ${
                            selected
                              ? 'bg-[var(--brand-pink)] text-white border-[var(--brand-pink)] shadow-sm scale-[1.02]'
                              : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] border-[var(--border-color)] hover:border-[var(--brand-pink)]/40 hover:text-[var(--foreground)]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-1.5">
                    ¿Qué ha ocurrido o qué podemos mejorar?
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe el error, la pantalla donde ocurrió o la idea que tienes..."
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:border-[var(--brand-pink)] text-sm resize-none transition-colors"
                  />
                </div>

                {/* Optional Email */}
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-1.5">
                    Tu correo de contacto (opcional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:border-[var(--brand-pink)] text-sm transition-colors"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || message.trim().length < 5}
                    className="flex-1 py-3 px-4 rounded-full bg-[var(--brand-pink)] hover:opacity-90 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar reporte</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
