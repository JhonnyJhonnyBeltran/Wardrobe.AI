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
import { useLanguageStore, SUPPORTED_LANGUAGES } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
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
    Edit,
    ChevronRight,
    HelpCircle,
    LayoutGrid,
    Crown,
    Calendar,
    ExternalLink,
    X,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { resetRevenueCatUser } from '@/lib/revenuecat/client';
import FeedbackModal from '@/components/FeedbackModal';
import { useNotificationSettingsStore } from '@/store/notificationSettingsStore';
import { useSearchStore } from '@/store/searchStore';
import { useRealtimeStore } from '@/store/realtimeStore';
import { useUiStore } from '@/store/uiStore';

export default function SettingsPage() {
    const { user, setUser, isPremium } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();
    const { theme, themePreference, setTheme } = useTheme();
    const { openPremiumModal } = useUiStore();
    const isPro = isPremium();
    const { language, setLanguage } = useLanguageStore();
    const { t } = useTranslation();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isOpeningPortal, setIsOpeningPortal] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [styleNames, setStyleNames] = useState<Record<string, string>>({});

    const handleOpenStripePortal = async () => {
        setIsOpeningPortal(true);
        try {
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.info(data.error || 'No hay sesión de Stripe activa para esta cuenta');
            }
        } catch (err) {
            toast.error('Error al abrir el portal de Stripe');
        } finally {
            setIsOpeningPortal(false);
        }
    };

    const formatNextPaymentDate = () => {
        if (!isPro) return null;
        if (user?.subscriptionPeriodEnd) {
            try {
                const date = new Date(user.subscriptionPeriodEnd);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                }
            } catch {}
        }
        const base = user?.createdAt ? new Date(user.createdAt) : new Date();
        const nextYear = new Date(base.getTime() + 365 * 24 * 60 * 60 * 1000);
        return nextYear.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };
    
    // Privacy and notification states
    const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
    const { settings: notifSettings, updateSetting: updateNotifSetting, loadFromDatabase: loadNotifFromDb } = useNotificationSettingsStore();
    
    // Password state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        const fetchStyles = async () => {
            const map: Record<string, string> = {
                'casual': 'Casual',
                'street': 'Streetwear',
                'elegant': 'Elegante',
                'boho': 'Boho Chic',
                'minimal': 'Minimalista',
                'vintage': 'Vintage',
                'sporty': 'Deportivo'
            };

            try {
                const { data, error } = await supabase
                    .from('style_options')
                    .select('id, slug, name');
                
                if (data && !error) {
                    data.forEach((style: {id: string; slug?: string; name: string}) => {
                        if (style.id) map[style.id] = style.name;
                        if (style.slug) map[style.slug] = style.name;
                    });
                }
            } catch (err) {
                console.error('Error fetching style names:', err);
            }
            setStyleNames(map);
        };
        if (user) {
            fetchStyles();
            setIsPrivate(user.isPrivate || false);
            if (user.id) {
                loadNotifFromDb(user.id);
            }
        }
    }, [user, loadNotifFromDb]);

    const handleLogout = async () => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch {}
        }
        setUser(null);
        await signOut().catch(() => {});
        window.location.replace('/auth?mode=login');
    };

    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const handleDeleteAccount = async () => {
        if (deleteInput.trim().toLowerCase() !== 'confirmar') return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No se pudo verificar la sesión.');

            const res = await fetch('/api/user/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ userId: user?.id })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Error al eliminar la cuenta');
            }

            await resetRevenueCatUser().catch(() => {});

            try {
                useSearchStore.getState().resetSearch();
                useRealtimeStore.getState().reset();
            } catch (e) {
                console.warn('Error resetting client stores:', e);
            }

            setUser(null);

            if (typeof window !== 'undefined') {
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                } catch (e) {
                    console.warn('Error clearing storage:', e);
                }
            }

            await signOut().catch(() => {});
            toast.success('Cuenta eliminada permanentemente');
            window.location.replace('/auth');
        } catch (error: any) {
            console.error('Error deleting account:', error);
            setDeleteError(error?.message || 'Hubo un error al eliminar tu cuenta.');
        } finally {
            setIsDeleting(false);
        }
    };

    const [oldPassword, setOldPassword] = useState('');

    const handleUpdatePassword = async () => {
        setPasswordError(null);
        setPasswordSuccess(false);
        if (!oldPassword) {
            setPasswordError('Por favor, introduce tu contraseña actual');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }
        setIsUpdatingPassword(true);
        try {
            if (!user?.email) throw new Error('No se encontró el email del usuario');
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: oldPassword
            });
            
            if (signInError) {
                throw new Error('La contraseña actual es incorrecta');
            }

            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) throw updateError;
            
            setPasswordSuccess(true);
            setTimeout(() => {
                setShowPasswordModal(false);
                setNewPassword('');
                setOldPassword('');
                setPasswordSuccess(false);
            }, 1200);
        } catch (error: any) {
            console.error('Error updating password:', error);
            setPasswordError(error.message || 'Error al actualizar la contraseña');
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

    if (!user) return null;

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
            {/* Mobile Top Header */}
            <header className="sticky top-0 z-30 min-h-14 apple-glass-bar px-4 flex items-center justify-between pt-safe md:hidden">
                <Link
                    href="/profile"
                    className="touch-target-44 flex items-center justify-center -ml-2 text-[var(--foreground)] hover:text-[var(--brand-pink)] transition-colors"
                    aria-label="Volver"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)] absolute left-1/2 -translate-x-1/2 select-none">
                    Configuración
                </h1>
                <div className="w-10" />
            </header>

            <motion.div
                className="max-w-4xl mx-auto px-4 py-4 md:py-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Desktop Top Header */}
                <motion.div variants={itemVariants} className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-color)] relative">
                    <Link
                        href="/profile"
                        className="p-2 -ml-2 rounded-full text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors cursor-pointer"
                        aria-label="Volver al perfil"
                        title="Volver al perfil"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] absolute left-1/2 -translate-x-1/2 select-none">
                        Configuración
                    </h1>
                    <div className="w-10" />
                </motion.div>

                {/* CONFIGURACIÓN - Contexto §4F: Datos personales (Avatar, Nombre, Bio, Usuario) */}
                <motion.div variants={itemVariants} className="mb-6">
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        {t.profile.configuration}
                    </h2>

                    {/* Suscripción Klozet Pro */}
                    <Card className="p-5 mb-4 overflow-hidden border border-[var(--border-color)]">
                        <div className="flex items-center justify-between gap-4">
                            {/* Kloe Mascot Icon + PRO underneath */}
                            <div className="flex flex-col items-center justify-center shrink-0 w-12">
                                <div className="w-11 h-11 relative flex items-center justify-center">
                                    <img
                                        src="/kloe-blink-open.png"
                                        alt="Kloe"
                                        className="w-11 h-11 object-contain select-none drop-shadow-sm"
                                    />
                                </div>
                                <span className="text-[10px] font-black tracking-widest text-[var(--brand-pink)] uppercase mt-0.5 leading-none select-none">
                                    PRO
                                </span>
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-base text-[var(--foreground)] tracking-tight">
                                        {isPro ? 'Klozet Pro' : 'Klozet Estándar'}
                                    </span>
                                    {isPro && !user?.isWithinGracePeriod && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Activo
                                        </span>
                                    )}
                                    {user?.isWithinGracePeriod && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                            Periodo de gracia ({user.graceDaysRemaining ?? 1}d)
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-[var(--foreground-secondary)] mt-0.5 leading-relaxed">
                                    {isPro 
                                        ? 'Consultas ilimitadas con Kloe, análisis de fotos y calendario completo'
                                        : 'Desbloquea estilista Kloe ilimitada, fotos y calendario'}
                                </p>
                            </div>

                            {/* Right action */}
                            {!isPro ? (
                                <button
                                    onClick={() => openPremiumModal('yearly')}
                                    className="px-4 py-2 rounded-full kz-pink-surface border border-white/25 text-white text-xs font-bold shrink-0 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer shadow-sm"
                                >
                                    Mejorar
                                </button>
                            ) : (
                                <Link
                                    href="/premium"
                                    className="flex items-center gap-1 text-xs font-semibold text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] px-3.5 py-1.5 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] hover:border-[var(--brand-pink)] transition-all shrink-0 cursor-pointer"
                                    title="Ver ventajas"
                                >
                                    <span>Ventajas</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            )}
                        </div>

                        {/* Alerta de Periodo de Gracia */}
                        {user?.isWithinGracePeriod && (
                            <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
                                <span className="text-amber-700 dark:text-amber-300">
                                    ⚠️ Tu renovación no pudo procesarse. Tienes <strong>{user.graceDaysRemaining} día{user.graceDaysRemaining === 1 ? '' : 's'}</strong> de gracia para actualizar tu tarjeta antes de que se desactive Klozet Pro.
                                </span>
                                <button
                                    type="button"
                                    onClick={handleOpenStripePortal}
                                    className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-sm self-start sm:self-auto"
                                >
                                    Actualizar tarjeta
                                </button>
                            </div>
                        )}

                        {/* Debajo del banner de Klozet Pro: Fecha del siguiente pago y gestión */}
                        {isPro && (
                            <div className="mt-4 pt-3.5 border-t border-[var(--border-color)]/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                                <div className="flex items-center gap-2 text-xs text-[var(--foreground-secondary)]">
                                    <Calendar className="w-3.5 h-3.5 text-[var(--brand-pink)] shrink-0" />
                                    <span className="text-[var(--foreground-tertiary)]">Próximo cobro:</span>
                                    <span className="font-semibold text-[var(--foreground)]">
                                        {formatNextPaymentDate()}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowCancelModal(true)}
                                    className="text-xs font-medium text-[var(--foreground-tertiary)] hover:text-red-500 transition-colors text-left sm:text-right cursor-pointer underline underline-offset-2"
                                >
                                    Gestionar o cancelar suscripción
                                </button>
                            </div>
                        )}
                    </Card>

                    <Link href="/profile/settings/personal">
                        <Card className="p-5 mb-4 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                    <Edit className="w-5 h-5 text-[var(--brand-pink)]" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-[var(--foreground)]">Datos personales y cómo eres</div>
                                    <div className="text-xs text-[var(--foreground-tertiary)]">Avatar, nombre, bio, altura, tipo de cuerpo, ojos y pelo</div>
                                </div>
                                <ChevronLeft className="w-5 h-5 text-[var(--foreground-tertiary)] rotate-180" />
                            </div>
                        </Card>
                    </Link>

                    {/* Ajustes generales */}
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

                        <div className="space-y-4 mb-4">
                            <div>
                                <div className="text-sm font-medium text-[var(--foreground)] mb-2">{t.profile.theme}</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTheme('auto')}
                                        className={`flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${themePreference === 'auto'
                                            ? 'bg-[var(--brand-pink)] text-white'
                                            : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                                            }`}
                                    >
                                        <Smartphone className="w-4 h-4" />
                                        Auto
                                    </button>
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${themePreference === 'light'
                                            ? 'bg-[var(--brand-pink)] text-white'
                                            : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                                            }`}
                                    >
                                        <Sun className="w-4 h-4" />
                                        {t.profile.light}
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${themePreference === 'dark'
                                            ? 'bg-[var(--brand-pink)] text-white'
                                            : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                                            }`}
                                    >
                                        <Moon className="w-4 h-4" />
                                        {t.profile.dark}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-[var(--foreground)] mb-2.5 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-[var(--brand-pink)]" />
                                    {t.profile.language}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {SUPPORTED_LANGUAGES.map((lang) => {
                                        const isSelected = language === lang.code;
                                        return (
                                            <button
                                                key={lang.code}
                                                type="button"
                                                onClick={() => {
                                                    setLanguage(lang.code, user?.id);
                                                    toast.success(`${lang.flag} ${lang.nativeName}`);
                                                }}
                                                className={`min-h-[44px] px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-2 border cursor-pointer active:scale-[0.98] ${isSelected
                                                    ? 'bg-[var(--brand-pink)] text-white border-[var(--brand-pink)] shadow-md shadow-[var(--brand-pink)]/20'
                                                    : 'bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)] hover:bg-[var(--background-tertiary)]'
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="text-base" role="img" aria-label={lang.name}>{lang.flag}</span>
                                                    <span>{lang.nativeName}</span>
                                                </span>
                                                {isSelected && (
                                                    <span className="w-2 h-2 rounded-full bg-white shadow-xs shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Notificaciones */}
                    <Card className="p-5 mb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
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
                            <Link
                                href="/profile/settings/notifications"
                                className="text-xs font-semibold text-[var(--brand-pink)] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                Ver todas
                                <ChevronLeft className="w-4 h-4 rotate-180" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--background-secondary)] cursor-pointer">
                                <span className="text-sm text-[var(--foreground)]">{t.profile.newFollowers}</span>
                                <div
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${notifSettings.follows ? 'bg-[var(--brand-pink)]' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    onClick={() => updateNotifSetting('follows', !notifSettings.follows, user?.id)}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${notifSettings.follows ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--background-secondary)] cursor-pointer">
                                <span className="text-sm text-[var(--foreground)]">{t.profile.likesOnPosts}</span>
                                <div
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${notifSettings.likes ? 'bg-[var(--brand-pink)]' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    onClick={() => updateNotifSetting('likes', !notifSettings.likes, user?.id)}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${notifSettings.likes ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--background-secondary)] cursor-pointer">
                                <span className="text-sm text-[var(--foreground)]">{t.profile.comments}</span>
                                <div
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${notifSettings.comments ? 'bg-[var(--brand-pink)]' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    onClick={() => updateNotifSetting('comments', !notifSettings.comments, user?.id)}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${notifSettings.comments ? 'translate-x-6' : 'translate-x-0'}`} />
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
                <motion.div variants={itemVariants} className="mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider">
                            Tu Estilo
                        </h2>
                        <Link
                            href="/onboarding/preferences?from=settings&step=styles"
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--brand-pink)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Editar estilo</span>
                        </Link>
                    </div>
                    <Card className="p-5">
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-[var(--foreground-tertiary)] mb-1">
                                    {t.profile.accessories}
                                </div>
                                <div className="font-medium text-sm text-[var(--foreground)]">
                                    {user.accessoriesStyle === 'minimalista' ? 'Minimalista' :
                                     user.accessoriesStyle === 'clasico' ? 'Clásico / Elegante' :
                                     user.accessoriesStyle === 'llamativo' ? 'Statement / Llamativo' :
                                     user.accessoriesStyle === 'urbano' ? 'Urbano / Streetwear' :
                                     user.accessoriesStyle === 'ninguno' ? 'Sin accesorios' :
                                     user.usesAccessories ? 'Minimalista' : 'Sin accesorios'}
                                </div>
                            </div>

                            {user.preferredStyles && user.preferredStyles.length > 0 ? (
                                <div>
                                    <div className="text-xs text-[var(--foreground-tertiary)] mb-2">
                                        {t.profile.preferredStyles}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {user.preferredStyles.map((style, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-medium"
                                            >
                                                {styleNames[style] || style}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-[var(--foreground-tertiary)]">
                                    Todavía no has elegido tus estilos preferidos. Pulsa Editar estilo para definirlos.
                                </p>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* SOPORTE Y REPORTES */}
                <motion.div variants={itemVariants} className="mb-6">
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        Soporte y Ayuda
                    </h2>
                    <Card className="overflow-hidden divide-y divide-[var(--border-color)]">
                        <button
                            type="button"
                            onClick={() => setShowFeedbackModal(true)}
                            className="w-full flex items-center gap-4 p-4 cursor-pointer hover:bg-[var(--background-secondary)] transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center shrink-0">
                                <HelpCircle className="w-5 h-5 text-[var(--brand-pink)]" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-[var(--foreground)]">Reportar un problema o sugerencia</div>
                                <div className="text-xs text-[var(--foreground-tertiary)]">
                                    Envía comentarios o avisa de cualquier fallo directamente al equipo
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[var(--foreground-tertiary)] shrink-0" />
                        </button>
                    </Card>
                </motion.div>

                {/* CUENTA */}
                <motion.div variants={itemVariants} className="mb-6">
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        {t.profile.account}
                    </h2>
                    <Card className="overflow-hidden">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 p-4 border-b border-[var(--border-color)] cursor-pointer hover:bg-red-500/5 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-red-500" />
                            </div>
                            <span className="font-medium text-red-500 flex-1 text-left">{t.profile.logout}</span>
                        </button>

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

                {/* Password Modal */}
                <AnimatePresence>
                    {showPasswordModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[6100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                            onClick={() => setShowPasswordModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-[var(--card-bg)] rounded-3xl p-6 max-w-md w-full border border-[var(--border-color)] shadow-2xl max-h-[90dvh] overflow-y-auto no-scrollbar"
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
                                        Introduce tu contraseña actual y la nueva contraseña (mínimo 6 caracteres).
                                    </p>
                                    <div className="space-y-3">
                                        <input 
                                            type="password" 
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder="Contraseña actual" 
                                            className="w-full bg-[var(--background-secondary)] text-[var(--foreground)] px-4 py-3 rounded-xl border border-[var(--border-color)] focus:border-[var(--foreground-tertiary)] outline-none"
                                        />
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Nueva contraseña" 
                                            className="w-full bg-[var(--background-secondary)] text-[var(--foreground)] px-4 py-3 rounded-xl border border-[var(--border-color)] focus:border-[var(--foreground-tertiary)] outline-none"
                                        />
                                    </div>

                                    {passwordError && (
                                        <p className="text-red-500 text-xs mt-3">{passwordError}</p>
                                    )}
                                    {passwordSuccess && (
                                        <p className="text-green-500 text-xs mt-3 font-semibold">¡Contraseña actualizada correctamente!</p>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            setPasswordError(null);
                                            setPasswordSuccess(false);
                                        }}
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
                            className="fixed inset-0 z-[6100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-[var(--card-bg)] rounded-3xl p-6 max-w-md w-full border border-[var(--border-color)] shadow-2xl max-h-[90dvh] overflow-y-auto no-scrollbar"
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
                                    {deleteError && (
                                        <p className="text-red-500 text-xs mt-3">{deleteError}</p>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setDeleteError(null);
                                        }}
                                        className="flex-1 !bg-[var(--background-secondary)] !text-[var(--foreground)]"
                                    >
                                        {t.common.cancel}
                                    </Button>
                                    <Button
                                        onClick={handleDeleteAccount}
                                        disabled={deleteInput.trim().toLowerCase() !== 'confirmar' || isDeleting}
                                        className="flex-1 !bg-red-500 hover:!bg-red-600 !text-white disabled:opacity-50"
                                    >
                                        {isDeleting ? 'Eliminando...' : t.common.delete}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <FeedbackModal 
                    isOpen={showFeedbackModal} 
                    onClose={() => setShowFeedbackModal(false)} 
                />

                {/* Modal: Cómo gestionar o cancelar la suscripción */}
                <AnimatePresence>
                    {showCancelModal && (
                        <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setShowCancelModal(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 16 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 16 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto no-scrollbar bg-[var(--card-bg)] rounded-3xl shadow-2xl border border-[var(--border-color)] p-6"
                            >
                                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]/60 mb-5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center font-bold">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                                                Gestionar o cancelar suscripción
                                            </h3>
                                            <p className="text-xs text-[var(--foreground-tertiary)]">
                                                Klozet Pro
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="w-8 h-8 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors cursor-pointer"
                                        aria-label="Cerrar"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4 text-left">
                                    <div className="p-4 rounded-2xl bg-[var(--background-secondary)]/80 border border-[var(--border-color)]/60">
                                        <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                                            <span>Pagos por Web (Stripe / Tarjeta)</span>
                                        </h4>
                                        <p className="text-xs text-[var(--foreground-secondary)] leading-relaxed mb-3">
                                            Si te suscribiste por web con tarjeta, Apple Pay o Google Pay, puedes cancelar o cambiar de plan en el portal de Stripe:
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleOpenStripePortal}
                                            disabled={isOpeningPortal}
                                            className="w-full py-2.5 px-4 rounded-full bg-[var(--brand-pink)] text-white text-xs font-bold hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            {isOpeningPortal ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Conectando con Stripe...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    <span>Abrir portal de suscripción en Stripe</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-[var(--background-secondary)]/80 border border-[var(--border-color)]/60">
                                        <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Smartphone className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                                            <span>Pagos en Móvil (iPhone / Android)</span>
                                        </h4>
                                        <div className="space-y-2 text-xs text-[var(--foreground-secondary)] leading-relaxed">
                                            <p>
                                                <strong className="text-[var(--foreground)]">En iPhone:</strong> Ve a <em>Ajustes &gt; Tu Nombre &gt; Suscripciones &gt; Klozet &gt; Cancelar suscripción</em>.
                                            </p>
                                            <p>
                                                <strong className="text-[var(--foreground)]">En Android:</strong> Abre <em>Google Play &gt; Perfil &gt; Pagos y suscripciones &gt; Cancelar</em>.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-[11px] text-[var(--foreground-tertiary)] bg-zinc-500/5 p-3 rounded-xl border border-zinc-500/10 leading-relaxed">
                                        💡 <strong>Importante:</strong> Al cancelar, mantienes todos los beneficios de Klozet Pro hasta {formatNextPaymentDate() || 'el fin del periodo'} sin cobros adicionales.
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowCancelModal(false)}
                                        className="w-full py-3 px-4 rounded-full bg-[var(--background-secondary)] text-[var(--foreground)] text-xs font-semibold hover:bg-[var(--border-color)] transition-colors cursor-pointer"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Version & Legal Footer */}
                <motion.div variants={itemVariants} className="text-center mt-8 pb-4">
                    <p className="text-[11px] text-[var(--foreground-tertiary)] mb-3 leading-relaxed">
                        Al usar Klozet, aceptas nuestros <br className="sm:hidden" />
                        <Link href="/terms" className="underline hover:text-[var(--foreground)] transition-colors">Términos de Servicio</Link> y <Link href="/privacy" className="underline hover:text-[var(--foreground)] transition-colors">Política de Privacidad</Link>.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-[var(--foreground-tertiary)]">
                        <Smartphone className="w-3 h-3" />
                        <span>Klozet v1.0.0</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
