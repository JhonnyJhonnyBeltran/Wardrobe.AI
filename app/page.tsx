'use client';

/**
 * Home - Dashboard Principal
 * Punto de entrada principal de la aplicación
 */

import { motion } from 'framer-motion';
import { Shirt, MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Logo, Card, Button } from '@/components';
import { useUser } from '@/store/userStore';

export default function Home() {
  const { user } = useUser();

  const quickActions = [
    {
      title: 'Mi Armario',
      description: 'Gestiona tu ropa y añade nuevas prendas',
      icon: Shirt,
      href: '/closet',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Chat IA',
      description: 'Habla con tu asistente de moda personal',
      icon: MessageSquare,
      href: '/chat',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Generar Outfit',
      description: 'Crea combinaciones instantáneas',
      icon: Sparkles,
      href: '/create',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass-strong border-b border-[var(--border-color)] px-4 py-3"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Logo />
          <Link href="/profile">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold cursor-pointer hover-lift">
              {user?.name?.[0] || 'U'}
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
            ¡Hola, {user?.name || 'Usuario'}! 👋
          </h1>
          <p className="text-[var(--foreground-secondary)]">
            ¿Qué quieres hacer hoy?
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Link href={action.href}>
                <Card className="p-6 hover-lift cursor-pointer group h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                    {action.title}
                  </h3>
                  <p className="text-[var(--foreground-secondary)]">
                    {action.description}
                  </p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Tu actividad
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-500 mb-1">12</div>
              <div className="text-sm text-[var(--foreground-secondary)]">Prendas</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-500 mb-1">8</div>
              <div className="text-sm text-[var(--foreground-secondary)]">Outfits</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-500 mb-1">24</div>
              <div className="text-sm text-[var(--foreground-secondary)]">Generados</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-green-500 mb-1">5</div>
              <div className="text-sm text-[var(--foreground-secondary)]">Esta semana</div>
            </Card>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  ¿Necesitas inspiración?
                </h3>
                <p className="text-[var(--foreground-secondary)]">
                  Deja que la IA te ayude a encontrar el outfit perfecto
                </p>
              </div>
            </div>
            <Link href="/chat">
              <Button className="w-full md:w-auto">
                <MessageSquare className="w-5 h-5 mr-2" />
                Hablar con el asistente
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
