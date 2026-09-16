'use client';

/**
 * Notifications Settings Page - Configuración real de notificaciones
 */

import { motion } from 'framer-motion';
import { ChevronLeft, Bell, Mail, Smartphone, Heart, MessageCircle, UserPlus, Check, Send } from 'lucide-react';
import { Card } from '@/components';
import { useRouter } from 'next/navigation';
import { useNotificationSettingsStore, NotificationSettings } from '@/store/notificationSettingsStore';
import { sendSystemNotification, requestSystemNotificationPermission } from '@/lib/notifications/desktopNotification';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useUser } from '@/store/userStore';
import Image from 'next/image';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${
                enabled ? 'bg-[var(--brand-pink)]' : 'bg-[var(--background-tertiary)]'
            }`}
        >
            <motion.div
                className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md"
                animate={{ x: enabled ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </button>
    );
}

interface NotificationOptionProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

function NotificationOption({ icon, title, description, enabled, onChange }: NotificationOptionProps) {
    return (
        <div className="flex items-center justify-between py-3.5 sm:py-4 gap-3 border-b border-[var(--border-color)] last:border-b-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-[var(--foreground)] truncate sm:whitespace-normal">{title}</div>
                    <div className="text-xs text-[var(--foreground-secondary)] line-clamp-2 leading-tight mt-0.5">{description}</div>
                </div>
            </div>
            <div className="shrink-0 pl-1">
                <ToggleSwitch enabled={enabled} onChange={onChange} />
            </div>
        </div>
    );
}

export default function NotificationsPage() {
    const router = useRouter();
    const { user } = useUser();
    const { settings, updateSetting, loadFromDatabase, isSaving } = useNotificationSettingsStore();
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadFromDatabase(user.id);
        }
    }, [user?.id, loadFromDatabase]);

    const handleTogglePopups = async (enabled: boolean) => {
        await updateSetting('popupToasts', enabled, user?.id);
        if (enabled) {
            const permission = await requestSystemNotificationPermission();
            if (permission === 'granted') {
                toast.success('Notificaciones de escritorio y móvil activadas');
            } else if (permission === 'denied') {
                toast.error('Has bloqueado las notificaciones en tu navegador o dispositivo');
            }
        }
    };

    const handleTestNotification = async () => {
        setIsTesting(true);
        const permission = await requestSystemNotificationPermission();
        if (permission === 'granted') {
            const sent = await sendSystemNotification({
                title: 'Klozet',
                body: '✨ ¡Notificación de prueba recibida con éxito en tu dispositivo!',
                icon: '/klozet-logo-dark.png',
                data: { url: '/notifications' }
            });
            if (sent) {
                toast.success('¡Notificación enviada a tu dispositivo!');
            } else {
                toast.info('Revisa los permisos de notificación de tu navegador.');
            }
        } else {
            toast.error('Activa los permisos de notificación en tu navegador/móvil');
        }
        setIsTesting(false);
    };

    const handleUpdate = (key: keyof NotificationSettings, val: boolean) => {
        updateSetting(key, val, user?.id);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
            {/* Mobile Header (Normalized h-14 apple-glass-bar) */}
            <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 apple-glass-bar pt-safe">
                <button
                    onClick={() => router.back()}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--border-color)] transition-colors cursor-pointer shrink-0"
                    aria-label="Volver"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)] absolute left-1/2 -translate-x-1/2 pointer-events-none">
                    Notificaciones
                </h1>
                <div className="w-9 shrink-0" />
            </div>

            {/* Container matching Profile standard */}
            <div className="max-w-4xl mx-auto px-4 py-4 md:py-8 space-y-6">
                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between mb-6 relative">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors shadow-xs cursor-pointer shrink-0"
                        aria-label="Volver"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--foreground)] absolute left-1/2 -translate-x-1/2">
                        Notificaciones
                    </h1>
                    <div className="w-10 shrink-0" />
                </div>

                {/* Popups en pantalla y escritorio */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <h2 className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-3 px-1">
                        Avisos del Sistema
                    </h2>
                    <Card className="px-4 sm:px-5 divide-y divide-[var(--border-color)]">
                        <NotificationOption
                            icon={<Smartphone className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Avisos Push (Sistema)"
                            description="Avisos en tu teléfono y ordenador"
                            enabled={settings.popupToasts}
                            onChange={handleTogglePopups}
                        />
                        <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="text-xs text-[var(--foreground-tertiary)]">
                                Comprueba cómo se visualiza una notificación en tu sistema
                            </span>
                            <button
                                type="button"
                                onClick={handleTestNotification}
                                disabled={isTesting}
                                className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--brand-pink)]/15 text-[var(--foreground)] hover:text-[var(--brand-pink)] border border-[var(--border-color)] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                            >
                                <Send className="w-3.5 h-3.5" />
                                Probar notificación
                            </button>
                        </div>
                    </Card>
                </motion.div>

                {/* Tipos de actividad */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-3 px-1">
                        Actividad y Comunidad
                    </h2>
                    <Card className="px-4 sm:px-5 divide-y divide-[var(--border-color)]">
                        <NotificationOption
                            icon={<UserPlus className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Seguidores"
                            description="Nuevos seguidores y solicitudes"
                            enabled={settings.follows}
                            onChange={(val) => handleUpdate('follows', val)}
                        />
                        <NotificationOption
                            icon={<Heart className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Me gusta"
                            description="Likes y reacciones en tus looks"
                            enabled={settings.likes}
                            onChange={(val) => handleUpdate('likes', val)}
                        />
                        <NotificationOption
                            icon={<MessageCircle className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Comentarios"
                            description="Comentarios y respuestas a tus fotos"
                            enabled={settings.comments}
                            onChange={(val) => handleUpdate('comments', val)}
                        />
                        <NotificationOption
                            icon={<Bell className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Mensajes directos"
                            description="Avisos de chats y conversaciones"
                            enabled={settings.messages}
                            onChange={(val) => handleUpdate('messages', val)}
                        />
                        <NotificationOption
                            icon={
                                <div className="relative w-6 h-6 flex items-center justify-center">
                                    <Image src="/kloe-logo-large.png" alt="Kloe" width={22} height={22} className="object-contain" />
                                </div>
                            }
                            title="Recordatorios y Kloe"
                            description="Sugerencias diarias de looks y estilismo"
                            enabled={settings.reminders}
                            onChange={(val) => handleUpdate('reminders', val)}
                        />
                    </Card>
                </motion.div>

                {/* Email */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h2 className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-3 px-1">
                        Correo Electrónico
                    </h2>
                    <Card className="px-4 sm:px-5">
                        <NotificationOption
                            icon={<Mail className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Novedades por email"
                            description="Resúmenes periódicos en tu correo"
                            enabled={settings.email}
                            onChange={(val) => handleUpdate('email', val)}
                        />
                    </Card>
                </motion.div>

                {/* Info Note */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="p-4 bg-[var(--background-secondary)]/60 rounded-2xl border border-[var(--border-color)] flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs text-[var(--foreground-secondary)] leading-relaxed">
                            <strong>Centro de actividad:</strong> Aunque desactives los avisos emergentes (pop-ups), toda la actividad de me gustas, comentarios y seguidores seguirá registrada en tu pestaña de actividad (corazón) dentro de la app.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
