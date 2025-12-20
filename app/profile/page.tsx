'use client';

/**
 * Profile Page - User Settings with Premium Toggle for Testing
 */

import { motion } from 'framer-motion';
import { Crown, Mail, Lock, Moon, LogOut, ChevronRight, Palette, Sparkles } from 'lucide-react';
import { Card, Button } from '@/components';
import { useUser } from '@/store';
import { SubscriptionTier } from '@/types';
import { styleOptions } from '@/data/mockOutfits';

export default function ProfilePage() {
  const { user, isPremium, setUser } = useUser();

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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
          Mi Perfil
        </h1>
        <p className="text-gray-600">Gestiona tu cuenta y preferencias</p>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-lg cursor-pointer"
              onClick={handleNameChange}
            >
              {user?.name.charAt(0).toUpperCase()}
            </motion.div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                {user?.name}
              </h2>
              <p className="text-gray-600 mb-3">{user?.email}</p>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${isPremium()
                    ? 'gradient-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-600'
                  }`}
              >
                {isPremium() ? (
                  <>
                    <Crown className="w-4 h-4" />
                    Premium
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Free
                  </>
                )}
              </motion.span>
            </div>

            {/* Edit Button */}
            <Button variant="outline" onClick={handleNameChange}>
              Editar perfil
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Dev Toggle - Premium Simulation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="p-5 border-2 border-dashed border-pink-200 bg-pink-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-lg">🔧</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Modo Desarrollador
                </h3>
                <p className="text-xs text-gray-600">
                  Simula el estado Premium/Free
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleTogglePremium}
              className={`relative w-14 h-8 rounded-full transition-colors ${isPremium() ? 'bg-pink-500' : 'bg-gray-300'
                }`}
            >
              <motion.div
                layout
                className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                style={{ left: isPremium() ? 'calc(100% - 28px)' : '4px' }}
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
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-pink-500" />
            Suscripción
          </h2>

          {isPremium() ? (
            <div className="bg-gradient-to-br from-pink-50 to-violet-50 rounded-2xl p-5 border border-pink-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span>Plan Premium</span>
                    <span className="text-xl">👑</span>
                  </h3>
                  <p className="text-sm text-gray-600">
                    Todas las funciones desbloqueadas
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {['Historial ilimitado de outfits', 'Recomendaciones IA avanzadas', 'Soporte prioritario'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Plan Free</h3>
                  <p className="text-sm text-gray-600">
                    Funciones básicas activas
                  </p>
                </div>
                <span className="text-3xl">🆓</span>
              </div>
              <ul className="space-y-2 text-sm mb-5">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500">✓</span>
                  Últimos 3 outfits
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span>✗</span>
                  Historial ilimitado
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span>✗</span>
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
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-500" />
            Preferencias de estilo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {styleOptions.map((style) => (
              <motion.button
                key={style.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-all text-left"
              >
                <span className="text-2xl">{style.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{style.label}</p>
                  <p className="text-xs text-gray-500">{style.description}</p>
                </div>
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
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 px-2">
            Cuenta
          </h2>
          <div className="space-y-1">
            {[
              { icon: <Mail className="w-5 h-5" />, label: 'Cambiar email' },
              { icon: <Lock className="w-5 h-5" />, label: 'Cambiar contraseña' },
              { icon: <Moon className="w-5 h-5" />, label: 'Modo oscuro', badge: 'Próximamente' },
            ].map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ x: 4 }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </motion.button>
            ))}
            <motion.button
              whileHover={{ x: 4 }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-red-50 transition-all text-red-500"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span>Cerrar sesión</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}