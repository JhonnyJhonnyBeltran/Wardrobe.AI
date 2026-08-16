'use client';

/**
 * General Settings Page - Ajustes generales de la aplicación
 * Incluye tema, idioma y otras configuraciones de usuario
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Globe, Smartphone, Trash2 } from 'lucide-react';
import { Card, Button } from '@/components';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/store/themeStore';

export default function GeneralSettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState('es');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'pt', label: 'Português' },
  ];

  const handleDeleteAccount = () => {
    // TODO: Implementar eliminación de cuenta
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass-strong border-b border-[var(--border-color)] px-4 py-3"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-lg font-bold text-[var(--foreground)]">Ajustes generales</h1>
          <div className="w-20" />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Apariencia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
            Apariencia
          </h2>
          <Card className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-[var(--brand-pink)]" />
                  ) : (
                    <Sun className="w-5 h-5 text-[var(--brand-pink)]" />
                  )}
                  <div>
                    <div className="font-medium text-[var(--foreground)]">Tema</div>
                    <div className="text-xs text-[var(--foreground-tertiary)]">
                      Cambia entre modo claro y oscuro
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${theme === 'light'
                      ? 'bg-[var(--brand-pink)] text-white'
                      : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                      }`}
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${theme === 'dark'
                      ? 'bg-[var(--brand-pink)] text-white'
                      : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                      }`}
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Idioma */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
            Idioma
          </h2>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-[var(--brand-pink)]" />
              <div>
                <div className="font-medium text-[var(--foreground)]">Idioma de la aplicación</div>
                <div className="text-xs text-[var(--foreground-tertiary)]">
                  Selecciona tu idioma preferido
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${language === lang.code
                    ? 'bg-[var(--brand-pink)] text-white'
                    : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Dispositivo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
            Dispositivo
          </h2>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[var(--brand-pink)]" />
              <div>
                <div className="font-medium text-[var(--foreground)]">Versión de la app</div>
                <div className="text-xs text-[var(--foreground-tertiary)]">
                  Klozet v1.0.0
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Zona de peligro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-4">
            Zona de peligro
          </h2>
          <Card className="p-5 border-red-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="font-medium text-[var(--foreground)]">Eliminar cuenta</div>
                  <div className="text-xs text-[var(--foreground-tertiary)]">
                    Elimina permanentemente tu cuenta y todos tus datos
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                className="!bg-red-500 hover:!bg-red-600 !text-white"
              >
                Eliminar
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[var(--card-bg)] rounded-3xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  ¿Eliminar cuenta?
                </h3>
                <p className="text-[var(--foreground-tertiary)] text-sm">
                  Esta acción no se puede deshacer. Todos tus datos, prendas y outfits serán eliminados permanentemente.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 !bg-[var(--background-secondary)] !text-[var(--foreground)]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  className="flex-1 !bg-red-500 hover:!bg-red-600 !text-white"
                >
                  Eliminar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
