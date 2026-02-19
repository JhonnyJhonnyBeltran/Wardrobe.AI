'use client';

/**
 * Settings Page - Configuración completa en una sola página
 * Todas las opciones expandidas sin navegación
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/store/userStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, Button } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/store/themeStore';
// import { useLanguage } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import type { Language } from '@/lib/i18n/translations';
import {
    ChevronLeft,
    Moon,
    Sun,
    Globe,
    Bell,
    Key,
    Shield,
    Smartphone,
    LogOut,
    Trash2,
    Edit
} from 'lucide-react';

export default function SettingsPage() {
    const { user } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    // const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showStyleForm, setShowStyleForm] = useState(false);

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    const handleDeleteAccount = () => {
        // TODO: Implementar eliminación de cuenta
        setShowDeleteConfirm(false);
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
            transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
            }
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
                {/* Back Button */}
                <motion.div variants={itemVariants} className="mb-6">
                    <Link href="/profile">
                        <button className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-medium">{t.profile.backToProfile}</span>
                        </button>
                    </Link>
                </motion.div>

                {/* CONFIGURACIÓN - Contexto §4F: Datos personales (Avatar, Nombre, Bio, Usuario) */}
                <motion.div variants={itemVariants} className="mb-6">
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        {t.profile.configuration}
                    </h2>

                    {/* Datos personales - Contexto §4F: Avatar, Nombre, Bio, Usuario */}
                    <Link href="/profile/settings/personal">
                        <Card className="p-5 mb-4 cursor-pointer hover:bg-[var(--card-hover)] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                    <Edit className="w-5 h-5 text-[var(--brand-pink)]" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-[var(--foreground)]">Datos personales</div>
                                    <div className="text-xs text-[var(--foreground-tertiary)]">Avatar, nombre, bio y usuario</div>
                                </div>
                                <ChevronLeft className="w-5 h-5 text-[var(--foreground-tertiary)] rotate-180" />
                            </div>
                        </Card>
                    </Link>

                    {/* Ajustes generales - EXPANDIDO */}
                    <Card className="p-5 mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                {theme === 'dark' ? (
                                    <Moon className="w-5 h-5 text-[var(--brand-pink)]" />
                                ) : (
                                    <Sun className="w-5 h-5 text-[var(--brand-pink)]" />
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-[var(--foreground)]">{t.profile.generalSettings}</div>
                                <div className="text-xs text-[var(--foreground-tertiary)]">{t.profile.generalSettingsDesc}</div>
                            </div>
                        </div>

                        {/* Tema */}
                        <div className="space-y-4 mb-4">
                            <div>
                                <div className="text-sm font-medium text-[var(--foreground)] mb-2">{t.profile.theme}</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${theme === 'light'
                                            ? 'bg-[var(--brand-pink)] text-white'
                                            : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                                            }`}
                                    >
                                        <Sun className="w-4 h-4" />
                                        {t.profile.light}
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${theme === 'dark'
                                            ? 'bg-[var(--brand-pink)] text-white'
                                            : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                                            }`}
                                    >
                                        <Moon className="w-4 h-4" />
                                        {t.profile.dark}
                                    </button>
                                </div>
                            </div>

                            {/* Idioma */}
                            <div>
                                <div className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    {t.profile.language}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        // Non-functional as requested
                                        className={'flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all bg-[var(--brand-pink)] text-white'}
                                    >
                                        🇪🇸 Español
                                    </button>
                                    <button
                                        // Non-functional as requested
                                        className={'flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all bg-[var(--background-secondary)] text-[var(--foreground-secondary)] opacity-50 cursor-not-allowed'}
                                    >
                                        🇬🇧 English (Soon)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Notificaciones */}
                    <Card className="p-5 mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-[var(--brand-pink)]" />
                            </div>
                            <div>
                                <div className="font-medium text-[var(--foreground)]">{t.profile.notifications}</div>
                                <div className="text-xs text-[var(--foreground-tertiary)]">
                                    {t.profile.notificationsDesc}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--background-secondary)] cursor-pointer">
                                <span className="text-sm text-[var(--foreground)]">{t.profile.newFollowers}</span>
                                <input type="checkbox" className="toggle" defaultChecked />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--background-secondary)] cursor-pointer">
                                <span className="text-sm text-[var(--foreground)]">{t.profile.likesOnPosts}</span>
                                <input type="checkbox" className="toggle" defaultChecked />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--background-secondary)] cursor-pointer">
                                <span className="text-sm text-[var(--foreground)]">{t.profile.comments}</span>
                                <input type="checkbox" className="toggle" defaultChecked />
                            </label>
                        </div>
                    </Card>

                    {/* Seguridad */}
                    <Card className="p-5 mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                <Key className="w-5 h-5 text-[var(--brand-pink)]" />
                            </div>
                            <div>
                                <div className="font-medium text-[var(--foreground)]">{t.profile.security}</div>
                                <div className="text-xs text-[var(--foreground-tertiary)]">
                                    {t.profile.securityDesc}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Button className="w-full !bg-[var(--background-secondary)] !text-[var(--foreground)]">
                                {t.profile.changePassword}
                            </Button>
                            <Button className="w-full !bg-[var(--background-secondary)] !text-[var(--foreground)]">
                                {t.profile.twoFactor}
                            </Button>
                        </div>
                    </Card>

                    {/* Privacidad */}
                    <Card className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-[var(--brand-pink)]" />
                            </div>
                            <div>
                                <div className="font-medium text-[var(--foreground)]">{t.profile.privacy}</div>
                                <div className="text-xs text-[var(--foreground-tertiary)]">{t.profile.privacyDesc}</div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--background-secondary)] cursor-pointer">
                                <span className="text-sm text-[var(--foreground)]">{t.profile.privateProfile}</span>
                                <input type="checkbox" className="toggle" />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--background-secondary)] cursor-pointer">
                                <span className="text-sm text-[var(--foreground)]">{t.profile.showActivity}</span>
                                <input type="checkbox" className="toggle" defaultChecked />
                            </label>
                        </div>
                    </Card>
                </motion.div>

                {/* TU ESTILO */}
                {user.styleCompleted && (
                    <motion.div variants={itemVariants} className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider">
                                {t.profile.yourStyle}
                            </h2>
                            <Link
                                href="/onboarding/preferences"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--brand-pink)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                <Edit className="w-4 h-4" />
                                {t.common.edit}
                            </Link>
                        </div>
                        <Card className="p-5">
                            <div className="space-y-5">
                                {/* Info básica en grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {user.gender && (
                                        <div>
                                            <div className="text-xs text-[var(--foreground-tertiary)] mb-1">{t.profile.gender}</div>
                                            <div className="font-medium text-[var(--foreground)] capitalize">
                                                {user.gender}
                                            </div>
                                        </div>
                                    )}
                                    {user.ageRange && (
                                        <div>
                                            <div className="text-xs text-[var(--foreground-tertiary)] mb-1">{t.profile.age}</div>
                                            <div className="font-medium text-[var(--foreground)]">{user.ageRange}</div>
                                        </div>
                                    )}
                                    {(user.height || user.heightRange) && (
                                        <div>
                                            <div className="text-xs text-[var(--foreground-tertiary)] mb-1">{t.profile.height}</div>
                                            <div className="font-medium text-[var(--foreground)]">
                                                {user.height ? `${user.height} cm` : user.heightRange}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-xs text-[var(--foreground-tertiary)] mb-1">
                                            {t.profile.accessories}
                                        </div>
                                        <div className="font-medium text-[var(--foreground)]">
                                            {user.usesAccessories ? t.profile.yes : t.profile.minimalist}
                                        </div>
                                    </div>
                                </div>

                                {/* Estilos preferidos */}
                                {user.preferredStyles && user.preferredStyles.length > 0 && (
                                    <div>
                                        <div className="text-xs text-[var(--foreground-tertiary)] mb-2">
                                            {t.profile.preferredStyles}
                                        </div>
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
                                        <div className="text-xs text-[var(--foreground-tertiary)] mb-2">
                                            {t.profile.preferences}
                                        </div>
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

                {/* CUENTA */}
                <motion.div variants={itemVariants} className="mb-6">
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        {t.profile.account}
                    </h2>
                    <Card className="overflow-hidden">
                        {/* Cerrar sesión */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 p-4 border-b border-[var(--border-color)] cursor-pointer hover:bg-red-500/5 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-red-500" />
                            </div>
                            <span className="font-medium text-red-500 flex-1 text-left">{t.profile.logout}</span>
                        </button>

                        {/* Eliminar cuenta */}
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center gap-4 p-4 cursor-pointer hover:bg-red-500/5 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="font-medium text-red-500">{t.profile.deleteAccount}</div>
                                <div className="text-xs text-[var(--foreground-tertiary)]">
                                    {t.profile.deleteAccountDesc}
                                </div>
                            </div>
                        </button>
                    </Card>
                </motion.div>

                {/* Style Form Modal */}
                <AnimatePresence>
                    {showStyleForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                            onClick={() => setShowStyleForm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-[var(--card-bg)] rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
                                    {t.profile.editYourStyle}
                                </h3>
                                <p className="text-sm text-[var(--foreground-tertiary)] mb-6">
                                    {t.profile.editStyleDesc}
                                </p>
                                <div className="space-y-4">
                                    {/* Aquí irá el formulario de estilo */}
                                    <div className="text-center py-8">
                                        <p className="text-[var(--foreground-secondary)]">
                                            {t.profile.styleFormPlaceholder}
                                        </p>
                                        <p className="text-xs text-[var(--foreground-tertiary)] mt-2">
                                            {t.profile.toImplement}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setShowStyleForm(false)}
                                        className="w-full !bg-[var(--background-secondary)] !text-[var(--foreground)]"
                                    >
                                        {t.common.close}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-[var(--card-bg)] rounded-3xl p-6 max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                        <Trash2 className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                                        {t.profile.deleteAccountConfirm}
                                    </h3>
                                    <p className="text-[var(--foreground-tertiary)] text-sm">
                                        {t.profile.deleteAccountMessage}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 !bg-[var(--background-secondary)] !text-[var(--foreground)]"
                                    >
                                        {t.common.cancel}
                                    </Button>
                                    <Button
                                        onClick={handleDeleteAccount}
                                        className="flex-1 !bg-red-500 hover:!bg-red-600 !text-white"
                                    >
                                        {t.common.delete}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Version Footer */}
                <motion.div variants={itemVariants} className="text-center mt-6">
                    <div className="flex items-center justify-center gap-2 text-xs text-[var(--foreground-tertiary)]">
                        <Smartphone className="w-3 h-3" />
                        <span>Klozet v1.0.0</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
