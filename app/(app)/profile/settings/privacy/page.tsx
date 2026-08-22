'use client';

/**
 * Privacy Settings Page - Configuración de privacidad
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Database, Share2, Download, FileText } from 'lucide-react';
import { Card, Button } from '@/components';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';

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
    const { t } = useTranslation();
    const { user } = useUser();

    // Privacy settings
    const [privacy, setPrivacy] = useState({
        isPrivate: false,
        shareAnalytics: true,
        personalizedRecommendations: true,
        saveHistory: true,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        const fetchPrivacy = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('is_private')
                .eq('id', user.id)
                .maybeSingle();

            if (data) {
                setPrivacy(prev => ({
                    ...prev,
                    isPrivate: Boolean((data as any).is_private)
                }));
            }
        };
        fetchPrivacy();
    }, [user?.id]);

    const updatePrivacy = (key: keyof typeof privacy) => async (value: boolean) => {
        setPrivacy(prev => ({ ...prev, [key]: value }));
        
        if (key === 'isPrivate' && user?.id) {
            try {
                setIsSaving(true);
                await supabase
                    .from('profiles')
                    .update({ is_private: value } as any)
                    .eq('id', user.id);
            } catch (err) {
                console.error('Error updating privacy:', err);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleDownloadData = () => {
        alert('Preparando descarga de tus datos...');
    };

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3"
            >
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {t.privacyPage.back}
                    </button>
                    <h1 className="text-lg font-bold text-[var(--foreground)]">{t.privacyPage.title}</h1>
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
                        Visibilidad de la cuenta
                    </h2>
                    <Card className="px-5">
                        <PrivacyOption
                            icon={<Eye className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title="Cuenta privada"
                            description="Solo las personas que apruebes podrán ver tus publicaciones, outfits y seguidores"
                            enabled={privacy.isPrivate}
                            onChange={updatePrivacy('isPrivate')}
                        />
                        <PrivacyOption
                            icon={<Share2 className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title={t.privacyPage.shareAnalytics}
                            description={t.privacyPage.shareAnalyticsDesc}
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
                        {t.privacyPage.dataAndPersonalization}
                    </h2>
                    <Card className="px-5">
                        <PrivacyOption
                            icon={<Shield className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title={t.privacyPage.personalizedRecommendations}
                            description={t.privacyPage.personalizedRecommendationsDesc}
                            enabled={privacy.personalizedRecommendations}
                            onChange={updatePrivacy('personalizedRecommendations')}
                        />
                        <PrivacyOption
                            icon={<Database className="w-5 h-5 text-[var(--brand-pink)]" />}
                            title={t.privacyPage.saveHistory}
                            description={t.privacyPage.saveHistoryDesc}
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
                        {t.privacyPage.yourData}
                    </h2>
                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                    <Download className="w-5 h-5 text-[var(--brand-pink)]" />
                                </div>
                                <div>
                                    <div className="font-medium text-[var(--foreground)]">{t.privacyPage.downloadData}</div>
                                    <div className="text-xs text-[var(--foreground-tertiary)]">
                                        {t.privacyPage.downloadDataDesc}
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleDownloadData}>
                                {t.privacyPage.download}
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
                        {t.privacyPage.legal}
                    </h2>
                    <Card className="overflow-hidden">
                        <a
                            href="/privacy-policy"
                            className="flex items-center gap-3 p-4 border-b border-[var(--border-color)] hover:bg-[var(--card-hover)] transition-colors"
                        >
                            <FileText className="w-5 h-5 text-[var(--brand-pink)]" />
                            <span className="font-medium text-[var(--foreground)]">{t.privacyPage.privacyPolicy}</span>
                        </a>
                        <a
                            href="/terms"
                            className="flex items-center gap-3 p-4 hover:bg-[var(--card-hover)] transition-colors"
                        >
                            <FileText className="w-5 h-5 text-[var(--brand-pink)]" />
                            <span className="font-medium text-[var(--foreground)]">{t.privacyPage.termsConditions}</span>
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
                            {t.privacyPage.gdprMessage}
                        </p>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
