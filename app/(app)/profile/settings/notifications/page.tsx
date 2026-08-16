'use client';

/**
 * Notifications Settings Page - Configuración de notificaciones
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Mail, Smartphone, Sparkles, ShoppingBag, MessageCircle } from 'lucide-react';
import { Card } from '@/components';
import { useRouter } from 'next/navigation';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-[var(--brand-pink)]' : 'bg-[var(--background-tertiary)]'
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
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <div className="font-medium text-[var(--foreground)]">{title}</div>
                    <div className="text-xs text-[var(--foreground-tertiary)]">{description}</div>
                </div>
            </div>
            <ToggleSwitch enabled={enabled} onChange={onChange} />
        </div>
    );
}

export default function NotificationsPage() {
    const router = useRouter();

    // Notification states
    const [notifications, setNotifications] = useState({
        push: true,
        email: false,
        newOutfits: true,
        styleRecommendations: true,
        newItems: false,
        chatMessages: true,
    });

    const updateNotification = (key: keyof typeof notifications) => (value: boolean) => {
        setNotifications(prev => ({ ...prev, [key]: value }));
        // TODO: Guardar en backend
    };

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-40 glass-strong border-b border-[var(--border-color)] px-4 py-3"
            >
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver
                    </button>
                    <h1 className="text-lg font-bold text-[var(--foreground)]">Notificaciones</h1>
                    <div className="w-20" />
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Tipo de notificación */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        Canales
                    </h2>
                    <Card className="px-5">
                        <NotificationOption
                            icon={<Smartphone className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Notificaciones push"
                            description="Recibe alertas en tu dispositivo"
                            enabled={notifications.push}
                            onChange={updateNotification('push')}
                        />
                        <NotificationOption
                            icon={<Mail className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Notificaciones por email"
                            description="Recibe resúmenes en tu correo"
                            enabled={notifications.email}
                            onChange={updateNotification('email')}
                        />
                    </Card>
                </motion.div>

                {/* Tipos de alertas */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        Alertas
                    </h2>
                    <Card className="px-5">
                        <NotificationOption
                            icon={<Sparkles className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Nuevos outfits"
                            description="Cuando tengas nuevas sugerencias de outfits"
                            enabled={notifications.newOutfits}
                            onChange={updateNotification('newOutfits')}
                        />
                        <NotificationOption
                            icon={<Bell className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Recomendaciones de estilo"
                            description="Tips personalizados de moda"
                            enabled={notifications.styleRecommendations}
                            onChange={updateNotification('styleRecommendations')}
                        />
                        <NotificationOption
                            icon={<ShoppingBag className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Nuevas prendas"
                            description="Cuando añadas nuevas prendas"
                            enabled={notifications.newItems}
                            onChange={updateNotification('newItems')}
                        />
                        <NotificationOption
                            icon={<MessageCircle className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Mensajes del chat"
                            description="Respuestas del asistente de moda"
                            enabled={notifications.chatMessages}
                            onChange={updateNotification('chatMessages')}
                        />
                    </Card>
                </motion.div>

                {/* Info Note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                        <p className="text-sm text-[var(--foreground-secondary)]">
                            💡 <strong>Nota:</strong> Puedes cambiar estas preferencias en cualquier momento. Las notificaciones push requieren permiso del navegador.
                        </p>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
