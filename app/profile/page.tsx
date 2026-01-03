'use client';

/**
 * Profile Page - Vista simplificada del perfil de usuario
 * MVP Version - Sin funciones sociales ni análisis avanzados
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Mail, Calendar, Shirt, Sparkles, LogOut } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { Card, Button } from '@/components';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [showSettings, setShowSettings] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass-strong border-b border-[var(--border-color)] px-4 py-3"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← Volver
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-[var(--foreground)]">Mi Perfil</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 rounded-full hover:bg-[var(--background-secondary)] flex items-center justify-center transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name[0]
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                  {user.name}
                </h2>
                {user.email && (
                  <p className="text-[var(--foreground-secondary)] flex items-center justify-center md:justify-start gap-2 mb-4">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-sm font-semibold">
                    👕 12 Prendas
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-semibold">
                    ✨ 8 Outfits
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <Link href="/profile/edit">
                <Button>
                  <User className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        >
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Shirt className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--foreground)]">12</div>
                <div className="text-sm text-[var(--foreground-secondary)]">Prendas en armario</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--foreground)]">8</div>
                <div className="text-sm text-[var(--foreground-secondary)]">Outfits guardados</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--foreground)]">24</div>
                <div className="text-sm text-[var(--foreground-secondary)]">Días usando la app</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/closet">
              <Card className="p-6 hover-lift cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shirt className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--foreground)]">Ir a mi Armario</div>
                    <div className="text-sm text-[var(--foreground-secondary)]">Gestiona tus prendas</div>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/create">
              <Card className="p-6 hover-lift cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--foreground)]">Generar Outfit</div>
                    <div className="text-sm text-[var(--foreground-secondary)]">Crea nuevas combinaciones</div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Configuración</h3>
              <div className="space-y-4">
                <button className="w-full p-4 rounded-xl hover:bg-[var(--background-secondary)] text-left transition-colors">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[var(--foreground-secondary)]" />
                    <div>
                      <div className="font-semibold text-[var(--foreground)]">Editar Información Personal</div>
                      <div className="text-sm text-[var(--foreground-secondary)]">Nombre, email, etc.</div>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 rounded-xl hover:bg-[var(--background-secondary)] text-left transition-colors">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-[var(--foreground-secondary)]" />
                    <div>
                      <div className="font-semibold text-[var(--foreground)]">Preferencias</div>
                      <div className="text-sm text-[var(--foreground-secondary)]">Tema, notificaciones, etc.</div>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 rounded-xl hover:bg-red-500/10 text-left transition-colors group">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="font-semibold text-red-500">Cerrar Sesión</div>
                      <div className="text-sm text-[var(--foreground-secondary)]">Salir de tu cuenta</div>
                    </div>
                  </div>
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
