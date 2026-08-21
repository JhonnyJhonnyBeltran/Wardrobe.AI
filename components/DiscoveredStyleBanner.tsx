'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import { haptics } from '@/lib/haptic';

const STYLE_NAMES_MAP: Record<string, string> = {
    'casual-moderno': 'Casual Moderno',
    'streetwear': 'Streetwear',
    'elegante-clasico': 'Elegante / Clásico',
    'old-money': 'Old Money / Quiet Luxury',
    'minimalista': 'Minimalista',
    'deportivo-athleisure': 'Deportivo / Athleisure',
    'boho-chic': 'Boho Chic',
    'y2k': 'Y2K',
    'techwear': 'Techwear',
    'business-casual': 'Business Casual',
    'grunge-rockero': 'Grunge / Rockero',
    'vintage-retro': 'Vintage / Retro',
    'preppy': 'Preppy',
    'goth-dark': 'Goth / Dark',
    'cottagecore': 'Cottagecore',
    'skater': 'Skater',
    'indie-alternative': 'Indie / Alternative',
    'acubi': 'Acubi Style',
    'coquette': 'Coquette',
    'cyberpunk': 'Cyberpunk / Futurista',
    'urbano-latino': 'Urbano',
    'bloquecore': 'Blokecore'
};

export default function DiscoveredStyleBanner() {
    const { user, setUser, refreshProfile } = useUser();
    const [suggestedStyle, setSuggestedStyle] = useState<{ slug: string; name: string; count: number } | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (!user?.id) return;

        const checkDiscoveredStyles = async () => {
            try {
                // Fetch user's recent 30 likes with style tags
                const { data: likesData, error } = await supabase
                    .from('likes')
                    .select('post_id, posts (style_ids)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(30);

                if (error || !likesData) return;

                const styleFrequency: Record<string, number> = {};
                const currentPreferred = new Set(user.preferredStyles || []);

                likesData.forEach((item: any) => {
                    const sIds = item.posts?.style_ids;
                    if (Array.isArray(sIds)) {
                        sIds.forEach((slug: string) => {
                            if (!currentPreferred.has(slug)) {
                                styleFrequency[slug] = (styleFrequency[slug] || 0) + 1;
                            }
                        });
                    }
                });

                // Find the unselected style with the highest recent likes (min 3 likes)
                let bestMatch: { slug: string; count: number } | null = null;
                Object.entries(styleFrequency).forEach(([slug, count]) => {
                    if (count >= 3 && (!bestMatch || count > bestMatch.count)) {
                        // Check if user has already dismissed this specific suggestion in localStorage
                        const dismissedKey = `dismissed_style_banner_${user.id}_${slug}`;
                        if (typeof window !== 'undefined' && localStorage.getItem(dismissedKey)) {
                            return;
                        }
                        bestMatch = { slug, count };
                    }
                });

                if (bestMatch) {
                    const matchSlug = (bestMatch as { slug: string; count: number }).slug;
                    const styleName = STYLE_NAMES_MAP[matchSlug] || matchSlug.replace(/-/g, ' ').toUpperCase();
                    setSuggestedStyle({
                        slug: matchSlug,
                        name: styleName,
                        count: (bestMatch as { slug: string; count: number }).count
                    });
                }
            } catch (err) {
                console.warn('Error checking discovered styles:', err);
            }
        };

        checkDiscoveredStyles();
    }, [user?.id, user?.preferredStyles]);

    const handleAddStyle = async () => {
        if (!user || !suggestedStyle) return;
        haptics.success();
        setIsAdding(true);

        try {
            const updatedStyles = Array.from(new Set([...(user.preferredStyles || []), suggestedStyle.slug]));

            // Update in Supabase profiles
            const { error } = await supabase
                .from('profiles')
                .update({ preferred_styles: updatedStyles })
                .eq('id', user.id);

            if (error) throw error;

            // Update local user state
            setUser(prev => prev ? { ...prev, preferredStyles: updatedStyles } : null);
            setIsAdded(true);

            setTimeout(() => {
                setIsDismissed(true);
                if (refreshProfile) refreshProfile();
            }, 1500);

        } catch (err) {
            console.error('Error adding discovered style to profile:', err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDismiss = () => {
        haptics.tap();
        if (suggestedStyle && user?.id && typeof window !== 'undefined') {
            localStorage.setItem(`dismissed_style_banner_${user.id}_${suggestedStyle.slug}`, 'true');
        }
        setIsDismissed(true);
    };

    if (!suggestedStyle || isDismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="w-full mb-6 p-4 rounded-2xl md:rounded-3xl bg-[var(--card-bg)]/80 dark:bg-[#181818]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-lg relative overflow-hidden"
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--brand-pink)]/10 dark:bg-[var(--brand-pink)]/20 border border-[var(--brand-pink)]/20 flex items-center justify-center shrink-0 text-[var(--brand-pink)]">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--brand-pink)]">Gusto detectado</span>
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">
                                Te interesa <span className="text-[var(--brand-pink)] font-bold">{suggestedStyle.name}</span> últimamente
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleAddStyle}
                            disabled={isAdding || isAdded}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                                isAdded
                                    ? 'bg-green-500 text-white'
                                    : 'bg-[var(--brand-pink)] text-white hover:opacity-90 active:scale-95'
                            }`}
                        >
                            {isAdded ? (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Añadido</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{isAdding ? 'Guardando...' : 'Añadir'}</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDismiss}
                            className="p-1.5 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
                            aria-label="Cerrar sugerencia"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
