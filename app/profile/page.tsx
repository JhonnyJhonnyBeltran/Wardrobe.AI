'use client';

/**
 * Profile Page - User Settings with Premium Toggle
 */

import { motion } from 'framer-motion';
import { Crown, Mail, Lock, Moon, Sun, LogOut, ChevronRight, Palette, Sparkles, Check, X, Settings } from 'lucide-react';
import { Card, Button } from '@/components';
import { useUser, useTheme } from '@/store';
import { SubscriptionTier } from '@/types';
import { styleOptions } from '@/data/mockOutfits';

export default function ProfilePage() {
  const { user, isPremium, setUser } = useUser();
  const { isDark, toggleTheme } = useTheme();

  const handleTogglePremium = () => {
    if (user) {
      setUser({
        ...user,
        subscriptionTier: isPremium() ? SubscriptionTier.FREE : SubscriptionTier.PREMIUM,
      });
    }
  };

  const handleNameChange = () => {
    const newName = prompt('Introduce tu nuevo nombre:', user?.name);
    if (newName && user) {
      setUser({ ...user, name: newName });
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Mi Perfil
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Gestiona tu cuenta</p>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-5 gradient-card">
          <div className="flex flex-col md:flex-row items-center gap-5">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center text-3xl text-white font-bold shadow-lg cursor-pointer"
              onClick={handleNameChange}
            >
              {user?.name.charAt(0).toUpperCase()}
            </motion.div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-0.5">
                {user?.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{user?.email}</p>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isPremium()
                  ? 'gradient-primary text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
              >
                {isPremium() ? (
                  <>
                    <Crown className="w-3.5 h-3.5" />
                    Premium
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Free
                  </>
                )}
              </motion.span>
            </div>

            {/* Edit Button */}
            <Button variant="outline" size="sm" onClick={handleNameChange} className="hover:border-pink-300 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30">
              Editar
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <Card className="p-4 border-2 border-pink-200/50 dark:border-pink-800/30 bg-gradient-to-r from-pink-50/50 to-violet-50/50 dark:from-pink-950/30 dark:to-violet-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-violet-100 dark:from-pink-900/50 dark:to-violet-900/50 flex items-center justify-center">
                {isDark ? <Moon className="w-4 h-4 text-pink-500" /> : <Sun className="w-4 h-4 text-pink-500" />}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">Modo Oscuro</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{isDark ? 'Activado' : 'Desactivado'}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-all ${isDark
                ? 'bg-gradient-to-r from-pink-500 to-violet-500'
                : 'bg-gray-300 dark:bg-gray-600'
                }`}
            >
              <motion.div
                layout
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                style={{ left: isDark ? 'calc(100% - 22px)' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </Card>
      </motion.div>

      {/* Dev Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="p-4 border-2 border-dashed border-pink-200/50 dark:border-pink-800/30 bg-gradient-to-r from-pink-50/50 to-violet-50/50 dark:from-pink-950/30 dark:to-violet-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-violet-100 dark:from-pink-900/50 dark:to-violet-900/50 flex items-center justify-center">
                <Settings className="w-4 h-4 text-pink-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">Dev Mode</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Simula Premium/Free</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleTogglePremium}
              className={`relative w-12 h-6 rounded-full transition-all ${isPremium()
                ? 'bg-gradient-to-r from-pink-500 to-violet-500'
                : 'bg-gray-300 dark:bg-gray-600'
                }`}
            >
              <motion.div
                layout
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                style={{ left: isPremium() ? 'calc(100% - 22px)' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </Card>
      </motion.div>

      {/* Subscription Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-pink-500" />
            Suscripción
          </h2>

          {isPremium() ? (
            <div className="bg-gradient-to-br from-pink-50 to-violet-50 dark:from-pink-950/30 dark:to-violet-950/30 rounded-2xl p-4 border border-pink-100/50 dark:border-pink-800/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Plan Premium
                    <Crown className="w-4 h-4 text-pink-500" />
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Todo desbloqueado</p>
                </div>
              </div>
              <ul className="space-y-1.5 text-sm">
                {['Historial ilimitado', 'IA avanzada', 'Soporte prioritario'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Plan Free</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Funciones básicas</p>
                </div>
              </div>
              <ul className="space-y-1.5 text-sm mb-4">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Últimos 3 outfits
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <X className="w-4 h-4" />
                  Historial ilimitado
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <X className="w-4 h-4" />
                  IA avanzada
                </li>
              </ul>
              <Button fullWidth glow onClick={handleTogglePremium}>
                Pásate a Premium
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Style Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-500" />
            Preferencias
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {styleOptions.map((style) => (
              <motion.button
                key={style.value}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-500 hover:bg-pink-50/50 dark:hover:bg-pink-950/30 transition-all"
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                  <div className="w-3 h-3 rounded-full bg-white/80" />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{style.label}</span>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1 px-2">
            Cuenta
          </h2>
          <div className="space-y-0.5">
            {[
              { icon: <Mail className="w-4 h-4" />, label: 'Cambiar email' },
              { icon: <Lock className="w-4 h-4" />, label: 'Contraseña' },
            ].map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ x: 4, backgroundColor: isDark ? 'rgba(31, 41, 55, 1)' : 'rgba(249, 250, 251, 1)' }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.button>
            ))}
            <motion.button
              whileHover={{ x: 4, backgroundColor: isDark ? 'rgba(127, 29, 29, 0.3)' : 'rgba(254, 242, 242, 1)' }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-red-500"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Cerrar sesión</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}