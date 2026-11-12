'use client';

import { Plus, X, Image as ImageIcon, Shirt, Layers } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { triggerHaptic } from '@/lib/haptic';
import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';

export default function FloatingCreateButton() {
    const pathname = usePathname();
    const router = useRouter();
    const { isCreateMenuOpen, setCreateMenuOpen, toggleCreateMenu } = useUiStore();

    // Close on route change
    useEffect(() => {
        setCreateMenuOpen(false);
    }, [pathname, setCreateMenuOpen]);

    // Only show on feed and profile paths
    if (pathname !== '/feed' && !pathname.startsWith('/profile')) return null;

    const isFeed = pathname === '/feed';

    const handleToggle = () => {
        triggerHaptic('medium');
        toggleCreateMenu();
    };

    const handleActionClick = (path: string) => {
        triggerHaptic('light');
        setCreateMenuOpen(false);
        router.push(path);
    };

    // Actions arranged for bottom-to-top progressive cascade
    const actions = [
        { id: 'post', label: 'Nuevo Post', icon: ImageIcon, path: '/create-post' },
        { id: 'outfit', label: 'Nuevo Outfit', icon: Layers, path: '/create' },
        { id: 'item', label: 'Nueva Prenda', icon: Shirt, path: '/closet?action=new-item' },
    ];

    // Cascading spring animation (~1s total duration feel)
    const containerVariants: Variants = {
        hidden: { 
            opacity: 0, 
            transition: { 
                staggerChildren: 0.08, 
                staggerDirection: -1 
            } 
        },
        visible: { 
            opacity: 1, 
            transition: { 
                delayChildren: 0.08,
                staggerChildren: 0.25 // Cascada lenta ~1s
            } 
        }
    };

    const itemVariants: Variants = {
        hidden: { 
            opacity: 0, 
            y: 40, 
            scale: 0.4,
            transition: {
                duration: 0.2,
                ease: "easeIn"
            }
        },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { 
                type: "spring" as const, 
                stiffness: 150, 
                damping: 16, 
                mass: 0.9,
                duration: 0.75
            } 
        }
    };

    return (
        <>
            {/* Transparent click-outside area (NO BLUR, NO DARKENING) */}
            {isCreateMenuOpen && (
                <div
                    onClick={() => setCreateMenuOpen(false)}
                    className="fixed inset-0 z-40 bg-transparent"
                />
            )}

            {/* Speed Dial (Desktop + Mobile /feed adapted above TabBar) */}
            <div
                className={`${
                    isFeed
                        ? 'flex fixed bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] right-4 md:bottom-10 md:right-16 z-[5010]'
                        : 'hidden md:flex fixed bottom-24 md:bottom-10 right-12 md:right-16 z-50'
                } flex-col items-end pointer-events-none`}
            >
                
                {/* Cascade Options */}
                <AnimatePresence>
                    {isCreateMenuOpen && (
                        <motion.div
                            className="flex flex-col items-end gap-3 md:gap-3.5 mb-3 md:mb-3.5 origin-bottom pointer-events-auto"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            {actions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <motion.button
                                        key={action.id}
                                        variants={itemVariants}
                                        onClick={() => handleActionClick(action.path)}
                                        className="group h-11 md:h-12 px-4 md:px-5 rounded-full bg-[var(--brand-pink)] flex items-center justify-center gap-2.5 text-white shadow-lg shadow-[var(--brand-pink)]/35 hover:shadow-[0_0_22px_rgba(255,102,196,0.5)] transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20 select-none pointer-events-auto"
                                    >
                                        <Icon className="w-4.5 h-4.5 md:w-5 md:h-5 flex-shrink-0" strokeWidth={2.4} />
                                        <span className="text-sm font-bold whitespace-nowrap">
                                            {action.label}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Trigger Button - Hides when open, replaced by close button */}
                <AnimatePresence mode="wait">
                    {!isCreateMenuOpen ? (
                        <motion.button
                            key="fab-open"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleToggle}
                            className="w-[52px] h-[52px] md:w-14 md:h-14 rounded-full bg-[var(--brand-pink)] flex items-center justify-center text-white shadow-2xl shadow-[var(--brand-pink)]/35 cursor-pointer overflow-hidden z-20 transition-all hover:scale-105 active:scale-95 pointer-events-auto"
                            aria-label="Crear nuevo"
                        >
                            <Plus className="w-6.5 h-6.5 md:w-7 md:h-7" strokeWidth={2.5} />
                        </motion.button>
                    ) : (
                        <motion.button
                            key="fab-close"
                            initial={{ scale: 0.4, opacity: 0, rotate: -90 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleToggle}
                            className="w-[52px] h-[52px] md:w-14 md:h-14 rounded-full bg-[var(--brand-pink)] border border-white/20 flex items-center justify-center text-white shadow-xl shadow-[var(--brand-pink)]/35 cursor-pointer hover:scale-105 active:scale-95 transition-all pointer-events-auto"
                            aria-label="Cerrar opciones"
                        >
                            <X className="w-6.5 h-6.5 md:w-7 md:h-7" strokeWidth={2.4} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Bottom Sheet Modal (solo rutas distintas a /feed, ej. /profile) */}
            <AnimatePresence>
                {!isFeed && isCreateMenuOpen && (
                    <motion.div
                        className="fixed inset-0 z-[5990] flex flex-col justify-end items-center md:hidden pb-[110px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setCreateMenuOpen(false)}
                        />

                        {/* Sheet */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative w-[calc(100%-32px)] max-w-sm bg-[var(--card-bg)] pt-2 pb-safe shadow-2xl border border-[var(--border-color)] overflow-hidden rounded-3xl mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full mx-auto my-3" />
                            <div className="px-4 pb-[calc(var(--tabbar-height)+32px)]">
                                <h3 className="text-lg font-bold text-center text-[var(--foreground)] mb-5">Crear Nuevo</h3>
                                <div className="space-y-3">
                                    {actions.map((action) => {
                                        const Icon = action.icon;
                                        return (
                                            <button
                                                key={action.id}
                                                onClick={() => handleActionClick(action.path)}
                                                className="w-full bg-[var(--brand-pink)] text-white hover:opacity-95 p-3.5 rounded-full flex items-center justify-center gap-3 shadow-lg shadow-[var(--brand-pink)]/25 border border-white/20 active:scale-[0.98] transition-all cursor-pointer font-bold text-sm"
                                            >
                                                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.3} />
                                                <span className="font-bold text-sm text-white">
                                                    {action.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}


