'use client';

/**
 * Privacy Settings Page - Configuración de privacidad
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Database, Share2, Download, FileText } from 'lucide-react';
import { Card, Button } from '@/components';
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

interface PrivacyOptionProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

function PrivacyOption({ icon, title, description, enabled, onChange }: PrivacyOptionProps) {
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

export default function PrivacyPage() {
    const router = useRouter();

    // Privacy settings
    const [privacy, setPrivacy] = useState({
        publicProfile: false,
        shareAnalytics: true,
        personalizedRecommendations: true,
        saveHistory: true,
    });

    const updatePrivacy = (key: keyof typeof privacy) => (value: boolean) => {
        setPrivacy(prev => ({ ...prev, [key]: value }));
        // TODO: Guardar en backend
    };

    const handleDownloadData = () => {
        // TODO: Implementar descarga de datos
        alert('Preparando descarga de tus datos...');
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
                    <h1 className="text-lg font-bold text-[var(--foreground)]">Privacidad</h1>
                    <div className="w-20" />
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Visibilidad */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        Visibilidad
                    </h2>
                    <Card className="px-5">
                        <PrivacyOption
                            icon={<Eye className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Perfil público"
                            description="Permite que otros vean tu perfil"
                            enabled={privacy.publicProfile}
                            onChange={updatePrivacy('publicProfile')}
                        />
                        <PrivacyOption
                            icon={<Share2 className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Compartir analíticas"
                            description="Ayúdanos a mejorar compartiendo datos anónimos"
                            enabled={privacy.shareAnalytics}
                            onChange={updatePrivacy('shareAnalytics')}
                        />
                    </Card>
                </motion.div>

                {/* Datos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        Datos y Personalización
                    </h2>
                    <Card className="px-5">
                        <PrivacyOption
                            icon={<Shield className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Recomendaciones personalizadas"
                            description="Usa tu historial para mejorar sugerencias"
                            enabled={privacy.personalizedRecommendations}
                            onChange={updatePrivacy('personalizedRecommendations')}
                        />
                        <PrivacyOption
                            icon={<Database className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Guardar historial"
                            description="Mantén un registro de tus outfits generados"
                            enabled={privacy.saveHistory}
                            onChange={updatePrivacy('saveHistory')}
                        />
                    </Card>
                </motion.div>

                {/* Tus datos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        Tus Datos
                    </h2>
                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                    <Download className="w-5 h-5 text-[var(--brand-pink)]" />
                                </div>
                                <div>
                                    <div className="font-medium text-[var(--foreground)]">Descargar mis datos</div>
                                    <div className="text-xs text-[var(--foreground-tertiary)]">
                                        Obtén una copia de toda tu información
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleDownloadData}>
                                Descargar
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Legal Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        Legal
                    </h2>
                    <Card className="overflow-hidden">
                        <a
                            href="/privacy-policy"
                            className="flex items-center gap-3 p-4 border-b border-[var(--border-color)] hover:bg-[var(--card-hover)] transition-colors"
                        >
                            <FileText className="w-5 h-5 text-[var(--brand-pink)]" />
                            <span className="font-medium text-[var(--foreground)]">Política de Privacidad</span>
                        </a>
                        <a
                            href="/terms"
                            className="flex items-center gap-3 p-4 hover:bg-[var(--card-hover)] transition-colors"
                        >
                            <FileText className="w-5 h-5 text-[var(--brand-pink)]" />
                            <span className="font-medium text-[var(--foreground)]">Términos y Condiciones</span>
                        </a>
                    </Card>
                </motion.div>

                {/* GDPR Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                        <p className="text-sm text-[var(--foreground-secondary)]">
                            🔒 <strong>Tu privacidad es importante.</strong> Cumplimos con GDPR y otras regulaciones de protección de datos. Tus datos nunca se venden a terceros.
                        </p>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
