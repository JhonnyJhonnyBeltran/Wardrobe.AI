'use client';

/**
 * Profile Page - Diseño Premium estilo Apple/Revolut
 * Minimalista, elegante y profesional
 * Enfocado en configuración y gestión de cuenta
 */

import { motion } from 'framer-motion';
import { useUser } from '@/store/userStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Palette,
  Settings,
  Bell,
  Shield,
  Key,
  ChevronRight,
  LogOut
} from 'lucide-react';

// Menu Item Component
interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  variant?: 'default' | 'danger';
}

function MenuItem({ href, icon, label, subtitle, variant = 'default' }: MenuItemProps) {
  return (
    <Link href={href}>
      <motion.div
        className={`flex items-center gap-4 p-4 border-b border-[var(--border-color)] last:border-b-0 cursor-pointer ${variant === 'danger' ? 'hover:bg-red-500/5' : ''
          }`}
        whileHover={{ backgroundColor: variant === 'danger' ? 'rgba(239, 68, 68, 0.05)' : 'var(--card-hover)' }}
        transition={{ duration: 0.15 }}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${variant === 'danger'
            ? 'bg-red-500/10'
            : 'bg-[var(--brand-pink)]/10'
          }`}>
          {icon}
        </div>
        <div className="flex-1">
          <span className={`font-medium block ${variant === 'danger' ? 'text-red-500' : 'text-[var(--foreground)]'
            }`}>
            {label}
          </span>
          {subtitle && (
            <span className="text-xs text-[var(--foreground-tertiary)]">
              {subtitle}
            </span>
          )}
        </div>
        <ChevronRight className={`w-5 h-5 ${variant === 'danger' ? 'text-red-400' : 'text-[var(--foreground-tertiary)]'
          }`} />
      </motion.div>
    </Link>
  );
}

// Button Item Component (for actions like logout)
interface ButtonItemProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'danger';
}

function ButtonItem({ onClick, icon, label, variant = 'default' }: ButtonItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 cursor-pointer"
      whileHover={{ backgroundColor: variant === 'danger' ? 'rgba(239, 68, 68, 0.05)' : 'var(--card-hover)' }}
      transition={{ duration: 0.15 }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${variant === 'danger'
          ? 'bg-red-500/10'
          : 'bg-[var(--brand-pink)]/10'
        }`}>
        {icon}
      </div>
      <span className={`font-medium flex-1 text-left ${variant === 'danger' ? 'text-red-500' : 'text-[var(--foreground)]'
        }`}>
        {label}
      </span>
      <ChevronRight className={`w-5 h-5 ${variant === 'danger' ? 'text-red-400' : 'text-[var(--foreground-tertiary)]'
        }`} />
    </motion.button>
  );
}

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) return null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      <motion.div
        className="max-w-2xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Header - Centrado y Premium */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          {/* Avatar con glow sutil */}
          <motion.div
            className="relative inline-block mb-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] p-[3px] shadow-lg">
              <div className="w-full h-full rounded-full bg-[var(--card-bg)] flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] bg-clip-text text-transparent">
                    {user.name[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Nombre */}
          <h1 className="page-title">
            <span className="page-title-secondary">{user.name.toUpperCase()}</span>
          </h1>

          {/* Email - Sutil */}
          {user.email && (
            <p className="text-sm text-[var(--foreground-tertiary)]">
              {user.email}
            </p>
          )}
        </motion.div>

        {/* Perfil y Personalización */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
            Perfil
          </h2>
          <Card className="overflow-hidden">
            <MenuItem
              href="/profile/edit"
              icon={<User className="w-5 h-5 text-[var(--brand-pink)]" />}
              label="Editar perfil"
              subtitle="Nombre, foto y datos personales"
            />
            <MenuItem
              href="/profile/preferences"
              icon={<Palette className="w-5 h-5 text-[var(--brand-pink)]" />}
              label="Preferencias de estilo"
              subtitle="Colores, tallas y estilo favorito"
            />
          </Card>
        </motion.div>

        {/* Configuración */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
            Configuración
          </h2>
          <Card className="overflow-hidden">
            <MenuItem
              href="/profile/settings"
              icon={<Settings className="w-5 h-5 text-[var(--brand-pink)]" />}
              label="Ajustes generales"
              subtitle="Tema, idioma y más"
            />
            <MenuItem
              href="/profile/settings/notifications"
              icon={<Bell className="w-5 h-5 text-[var(--brand-pink)]" />}
              label="Notificaciones"
              subtitle="Gestiona tus alertas"
            />
            <MenuItem
              href="/profile/settings/security"
              icon={<Key className="w-5 h-5 text-[var(--brand-pink)]" />}
              label="Seguridad"
              subtitle="Contraseña y autenticación"
            />
            <MenuItem
              href="/profile/settings/privacy"
              icon={<Shield className="w-5 h-5 text-[var(--brand-pink)]" />}
              label="Privacidad"
              subtitle="Datos y permisos"
            />
          </Card>
        </motion.div>

        {/* Style Profile - Si existe */}
        {user.styleCompleted && (
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
              Tu Estilo
            </h2>
            <Card className="p-5">
              <div className="space-y-5">
                {/* Info básica en grid */}
                <div className="grid grid-cols-2 gap-4">
                  {user.gender && (
                    <div>
                      <div className="text-xs text-[var(--foreground-tertiary)] mb-1">Género</div>
                      <div className="font-medium text-[var(--foreground)] capitalize">{user.gender}</div>
                    </div>
                  )}
                  {user.ageRange && (
                    <div>
                      <div className="text-xs text-[var(--foreground-tertiary)] mb-1">Edad</div>
                      <div className="font-medium text-[var(--foreground)]">{user.ageRange}</div>
                    </div>
                  )}
                  {(user.height || user.heightRange) && (
                    <div>
                      <div className="text-xs text-[var(--foreground-tertiary)] mb-1">Altura</div>
                      <div className="font-medium text-[var(--foreground)]">
                        {user.height ? `${user.height} cm` : user.heightRange}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-[var(--foreground-tertiary)] mb-1">Accesorios</div>
                    <div className="font-medium text-[var(--foreground)]">
                      {user.usesAccessories ? 'Sí' : 'Minimalista'}
                    </div>
                  </div>
                </div>

                {/* Estilos preferidos */}
                {user.preferredStyles && user.preferredStyles.length > 0 && (
                  <div>
                    <div className="text-xs text-[var(--foreground-tertiary)] mb-2">Estilos preferidos</div>
                    <div className="flex flex-wrap gap-2">
                      {user.preferredStyles.map((style, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-full bg-[var(--brand-pink)]/8 text-[var(--brand-pink)] text-xs font-medium"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferencias visuales */}
                {user.visualStylePreferences && user.visualStylePreferences.length > 0 && (
                  <div>
                    <div className="text-xs text-[var(--foreground-tertiary)] mb-2">Preferencias</div>
                    <div className="flex flex-wrap gap-2">
                      {user.visualStylePreferences.map((pref, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] text-xs font-medium"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Cuenta */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
            Cuenta
          </h2>
          <Card className="overflow-hidden">
            <ButtonItem
              onClick={handleLogout}
              icon={<LogOut className="w-5 h-5 text-red-500" />}
              label="Cerrar sesión"
              variant="danger"
            />
          </Card>
        </motion.div>

        {/* Version Footer */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-10"
        >
          <p className="text-xs text-[var(--foreground-tertiary)]">
            Klozet v1.0.0
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
