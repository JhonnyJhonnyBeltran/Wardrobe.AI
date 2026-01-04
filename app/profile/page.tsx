'use client';

/**
 * Profile Page - Diseño Premium estilo Apple/Revolut
 * Minimalista, elegante y profesional
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/store/userStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Fancy Button Component with click animation
interface FancyButtonProps {
  href: string;
  variant: 'pink' | 'amber';
  title: string;
  subtitle: string;
}

function FancyButton({ href, variant, title, subtitle }: FancyButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsActive(true);
    // Navigate after animation plays
    setTimeout(() => {
      router.push(href);
    }, 450);
  };

  return (
    <button
      onClick={handleClick}
      className={`fancy-btn fancy-btn--${variant} ${isActive ? 'active' : ''}`}
    >
      <div className="fancy-btn__line"></div>
      <div className="fancy-btn__line"></div>
      <span className="fancy-btn__text">
        <span className="fancy-btn__text-main">{title}</span>
        <span className="fancy-btn__text-sub">{subtitle}</span>
      </span>
      <div className="fancy-btn__drow1"></div>
      <div className="fancy-btn__drow2"></div>
    </button>
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
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            {user.name}
          </h1>

          {/* Email - Sutil */}
          {user.email && (
            <p className="text-sm text-[var(--foreground-tertiary)]">
              {user.email}
            </p>
          )}
        </motion.div>

        {/* Stats Row - Minimalista */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="p-6">
            <div className="grid grid-cols-3 divide-x divide-[var(--border-color)]">
              <div className="text-center px-4">
                <div className="text-2xl font-bold text-[var(--foreground)]">12</div>
                <div className="text-xs text-[var(--foreground-tertiary)] mt-1">Prendas</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold text-[var(--foreground)]">8</div>
                <div className="text-xs text-[var(--foreground-tertiary)] mt-1">Outfits</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold text-[var(--foreground)]">24</div>
                <div className="text-xs text-[var(--foreground-tertiary)] mt-1">Días activo</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions - Fancy Buttons */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col gap-4">
            <FancyButton
              href="/closet"
              variant="pink"
              title="MI ARMARIO"
              subtitle="Gestiona tus prendas"
            />
            <FancyButton
              href="/create"
              variant="amber"
              title="CREAR OUTFIT"
              subtitle="Nuevas combinaciones"
            />
          </div>
        </motion.div>

        {/* Style Profile - Si existe */}
        {user.styleCompleted && (
          <motion.div variants={itemVariants} className="mb-8">
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

        {/* Account Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
            Cuenta
          </h2>
          <Card className="overflow-hidden">
            {/* Edit Profile */}
            <Link href="/profile/edit">
              <motion.div
                className="flex items-center justify-between p-4 border-b border-[var(--border-color)] cursor-pointer"
                whileHover={{ backgroundColor: 'var(--card-hover)' }}
                transition={{ duration: 0.15 }}
              >
                <span className="font-medium text-[var(--foreground)]">Editar perfil</span>
                <span className="text-[var(--foreground-tertiary)]">→</span>
              </motion.div>
            </Link>

            {/* Logout */}
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 cursor-pointer"
              whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
              transition={{ duration: 0.15 }}
            >
              <span className="font-medium text-red-500">Cerrar sesión</span>
              <span className="text-red-400">→</span>
            </motion.button>
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
