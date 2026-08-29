'use client';

/**
 * Notifications Settings Page - Configuración real de notificaciones
 */

import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Mail, Smartphone, Heart, MessageCircle, UserPlus, Sparkles, Check, Send } from 'lucide-react';
import { Card } from '@/components';
import { useRouter } from 'next/navigation';
import { useNotificationSettingsStore, NotificationSettings } from '@/store/notificationSettingsStore';
import { sendSystemNotification, requestSystemNotificationPermission } from '@/lib/notifications/desktopNotification';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useUser } from '@/store/userStore';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
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
        <div className="flex items-center justify-between py-4 border-b border-[var(--border-color)] last:border-b-0">
            <div className="flex items-center gap-3 pr-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>
                <div>
                    <div className="font-semibold text-sm text-[var(--foreground)]">{title}</div>
                    <div className="text-xs text-[var(--foreground-secondary)]">{description}</div>
                </div>
            </div>
            <ToggleSwitch enabled={enabled} onChange={onChange} />
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
                toast.success('¡Notificación enviada a tu centro de notificaciones!');
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
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3"
            >
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors p-1 cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Volver</span>
                    </button>
                    <h1 className="text-base font-bold text-[var(--foreground)]">Notificaciones</h1>
                    <div className="w-14" />
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Popups en pantalla y escritorio */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <h2 className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-3 px-1">
                        Notificaciones de Sistema (Escritorio y Móvil)
                    </h2>
                    <Card className="px-5 divide-y divide-[var(--border-color)]">
                        <NotificationOption
                            icon={<Smartphone className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Notificaciones de Escritorio y Móvil (Push)"
                            description="Recibe avisos en la bandeja de notificaciones de tu ordenador o teléfono"
                            enabled={settings.popupToasts}
                            onChange={handleTogglePopups}
                        />
                        <div className="py-3 flex items-center justify-between">
                            <span className="text-xs text-[var(--foreground-tertiary)]">
                                Comprueba cómo se ve una notificación en tu sistema
                            </span>
                            <button
                                type="button"
                                onClick={handleTestNotification}
                                disabled={isTesting}
                                className="px-3.5 py-1.5 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--brand-pink)]/15 text-[var(--foreground)] hover:text-[var(--brand-pink)] border border-[var(--border-color)] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
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
                    <Card className="px-5 divide-y divide-[var(--border-color)]">
                        <NotificationOption
                            icon={<UserPlus className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Seguidores"
                            description="Nuevos seguidores y solicitudes de amistad"
                            enabled={settings.follows}
                            onChange={(val) => handleUpdate('follows', val)}
                        />
                        <NotificationOption
                            icon={<Heart className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Me gusta"
                            description="Reacciones y likes en tus looks compartidos"
                            enabled={settings.likes}
                            onChange={(val) => handleUpdate('likes', val)}
                        />
                        <NotificationOption
                            icon={<MessageCircle className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Comentarios"
                            description="Comentarios y respuestas en tus publicaciones"
                            enabled={settings.comments}
                            onChange={(val) => handleUpdate('comments', val)}
                        />
                        <NotificationOption
                            icon={<Bell className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Mensajes directos"
                            description="Avisos de nuevos chats y conversaciones privadas"
                            enabled={settings.messages}
                            onChange={(val) => handleUpdate('messages', val)}
                        />
                        <NotificationOption
                            icon={<Sparkles className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Recordatorios y Asesora Kloe"
                            description="Sugerencias de looks diarios y consejos de estilismo"
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
                    <Card className="px-5">
                        <NotificationOption
                            icon={<Mail className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Novedades por email"
                            description="Recibe resúmenes de actividad y noticias en tu correo"
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
                            <strong>Nota de actividad:</strong> Aunque desactives los avisos emergentes (pop-ups), toda la actividad de me gustas, comentarios y seguidores seguirá llegando a tu pestaña de actividad (corazón) dentro de la app.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
