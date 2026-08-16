'use client';

/**
 * Settings Page - Configuración completa en una sola página
 * Todas las opciones expandidas sin navegación
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/store/userStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
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
    const [deleteInput, setDeleteInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showStyleForm, setShowStyleForm] = useState(false);
    const [styleNames, setStyleNames] = useState<Record<string, string>>({});
    
    // Privacy and notification states
    const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
    const [notifications, setNotifications] = useState(user?.notificationSettings || { push: true, email: true, comments: true, followers: true, likes: true });
    
    // Password state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        const fetchStyles = async () => {
            const allStyleIds = [
                ...(user?.preferredStyles || []),
                ...(user?.visualStylePreferences || [])
            ];
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const validUuids = allStyleIds.filter(id => uuidRegex.test(id));
            
            // Map de soporte para IDs antiguos pre-DB
            const map: Record<string, string> = {
                'casual': 'Casual',
                'street': 'Streetwear',
                'elegant': 'Elegante',
                'boho': 'Boho Chic',
                'minimal': 'Minimalista',
                'vintage': 'Vintage',
                'sporty': 'Deportivo'
            };

            if (validUuids.length > 0) {
                try {
                    const { data, error } = await supabase
                        .from('style_options')
                        .select('id, name')
                        .in('id', validUuids);
                    
                    if (data && !error) {
                        data.forEach((style: {id: string; name: string}) => {
                            map[style.id] = style.name;
                        });
                    }
                } catch (err) {
                    console.error('Error fetching style names:', err);
                }
            }
            setStyleNames(map);
        };
        if (user) {
            fetchStyles();
            setIsPrivate(user.isPrivate || false);
            setNotifications(user.notificationSettings || { push: true, email: true, comments: true, followers: true, likes: true });
        }
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        router.push('/auth');
    };

    const handleDeleteAccount = async () => {
        if (deleteInput.toLowerCase() !== 'confirmar') return;
        setIsDeleting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No session');
            
            const res = await fetch('/api/user/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ userId: user?.id })
            });
            
            if (!res.ok) throw new Error('Error al eliminar');
            
            await signOut();
            router.push('/auth');
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Hubo un error al eliminar tu cuenta.');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        setIsUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            alert('Contraseña actualizada correctamente');
            setShowPasswordModal(false);
            setNewPassword('');
        } catch (error: any) {
            console.error('Error updating password:', error);
            alert('Error al actualizar la contraseña: ' + error.message);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const togglePrivacy = async () => {
        const newVal = !isPrivate;
        setIsPrivate(newVal);
        try {
            await supabase.from('profiles').update({ is_private: newVal }).eq('id', user?.id);
        } catch (err) {
            console.error(err);
            setIsPrivate(!newVal);
        }
    };

    const toggleNotification = async (key: string) => {
        const newVal = { ...notifications, [key]: !notifications[key] };
        setNotifications(newVal);
        try {
            await supabase.from('profiles').update({ notification_settings: newVal }).eq('id', user?.id);
        } catch (err) {
            console.error(err);
            setNotifications(notifications);
        }
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
                                <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${notifications.followers ? 'bg-[var(--brand-pink)]' : 'bg-gray-300 dark:bg-gray-700'}`} onClick={() => toggleNotification('followers')}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${notifications.followers ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--background-secondary)] cursor-pointer">
                                <span className="text-sm text-[var(--foreground)]">{t.profile.likesOnPosts}</span>
                                <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${notifications.likes ? 'bg-[var(--brand-pink)]' : 'bg-gray-300 dark:bg-gray-700'}`} onClick={() => toggleNotification('likes')}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${notifications.likes ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--background-secondary)] cursor-pointer">
                                <span className="text-sm text-[var(--foreground)]">{t.profile.comments}</span>
                                <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${notifications.comments ? 'bg-[var(--brand-pink)]' : 'bg-gray-300 dark:bg-gray-700'}`} onClick={() => toggleNotification('comments')}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${notifications.comments ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
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
                            <Button 
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full !bg-[var(--background-secondary)] !text-[var(--foreground)]"
                            >
                                {t.profile.changePassword}
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
                                <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${isPrivate ? 'bg-[var(--brand-pink)]' : 'bg-gray-300 dark:bg-gray-700'}`} onClick={togglePrivacy}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
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
                                                    {styleNames[style] || style}
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
                                                    {styleNames[pref] || pref}
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

                {/* Password Modal */}
                <AnimatePresence>
                    {showPasswordModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                            onClick={() => setShowPasswordModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-[var(--card-bg)] rounded-3xl p-6 max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center mx-auto mb-4">
                                        <Key className="w-8 h-8 text-[var(--brand-pink)]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                                        Cambiar Contraseña
                                    </h3>
                                    <p className="text-[var(--foreground-tertiary)] text-sm mb-4">
                                        Introduce tu nueva contraseña (mínimo 6 caracteres).
                                    </p>
                                    <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Nueva contraseña" 
                                        className="w-full bg-[var(--background-secondary)] text-[var(--foreground)] px-4 py-3 rounded-xl border border-[var(--border-color)] focus:border-[var(--brand-pink)] outline-none"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 !bg-[var(--background-secondary)] !text-[var(--foreground)]"
                                    >
                                        {t.common.cancel}
                                    </Button>
                                    <Button
                                        onClick={handleUpdatePassword}
                                        disabled={isUpdatingPassword}
                                        className="flex-1 !bg-[var(--brand-pink)] !text-white disabled:opacity-50"
                                    >
                                        {isUpdatingPassword ? 'Guardando...' : 'Guardar'}
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
                                    <p className="text-[var(--foreground-tertiary)] text-sm mb-4">
                                        Esta acción no se puede deshacer. Por favor, escribe <strong>confirmar</strong> para eliminar tu cuenta y todos tus datos asociados.
                                    </p>
                                    <input 
                                        type="text" 
                                        value={deleteInput}
                                        onChange={(e) => setDeleteInput(e.target.value)}
                                        placeholder="Escribe confirmar" 
                                        className="w-full bg-[var(--background-secondary)] text-[var(--foreground)] px-4 py-3 rounded-xl border border-[var(--border-color)] focus:border-red-500 outline-none"
                                    />
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
                                        disabled={deleteInput.toLowerCase() !== 'confirmar' || isDeleting}
                                        className="flex-1 !bg-red-500 hover:!bg-red-600 !text-white disabled:opacity-50"
                                    >
                                        {isDeleting ? 'Eliminando...' : t.common.delete}
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
