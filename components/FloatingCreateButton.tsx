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

    // Only show on feed and the root of profile, hide on other paths
    if (pathname !== '/feed' && !pathname.startsWith('/profile')) return null;

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

            {/* Desktop Speed Dial - Shifted to the left (right-12 md:right-16) */}
            <div className="hidden md:flex fixed bottom-24 md:bottom-10 right-12 md:right-16 z-50 flex-col items-end pointer-events-none">
                
                {/* Cascade Options (Desktop) */}
                <AnimatePresence>
                    {isCreateMenuOpen && (
                        <motion.div
                            className="flex flex-col items-end gap-3.5 mb-3.5 origin-bottom pointer-events-auto"
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
                                        className="group flex items-center gap-3.5 cursor-pointer focus:outline-none"
                                    >
                                        {/* Label Tag (No blur) */}
                                        <span className="px-4 py-2 bg-[var(--card-bg)] text-[var(--foreground)] text-sm font-bold rounded-2xl shadow-xl border border-[var(--border-color)] group-hover:border-[var(--brand-pink)] group-hover:text-[var(--brand-pink)] transition-colors select-none">
                                            {action.label}
                                        </span>
                                        {/* Option Bubble - Exactly 56px (w-14 h-14) with 28px (w-7 h-7) Icon */}
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-black text-white dark:bg-white dark:text-black shadow-2xl border border-white/15 dark:border-black/15 transition-transform group-hover:scale-110 group-active:scale-95 group-hover:shadow-[0_10px_25px_rgba(255,45,120,0.35)]">
                                            <Icon className="w-7 h-7" strokeWidth={2.2} />
                                        </div>
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
                            className="w-14 h-14 rounded-full bg-[var(--brand-pink)] flex items-center justify-center text-white shadow-2xl shadow-[var(--brand-pink)]/35 cursor-pointer overflow-hidden z-20 transition-all hover:scale-105 pointer-events-auto"
                            aria-label="Crear nuevo"
                        >
                            <Plus className="w-7 h-7" strokeWidth={2.5} />
                        </motion.button>
                    ) : (
                        <motion.button
                            key="fab-close"
                            initial={{ scale: 0.4, opacity: 0, rotate: -90 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleToggle}
                            className="w-14 h-14 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--foreground)] shadow-xl cursor-pointer hover:scale-105 hover:text-red-500 transition-all pointer-events-auto"
                            aria-label="Cerrar opciones"
                        >
                            <X className="w-7 h-7" strokeWidth={2.2} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Bottom Sheet Modal */}
            <AnimatePresence>
                {isCreateMenuOpen && (
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
                                <h3 className="text-xl font-bold text-center text-[var(--foreground)] mb-6">Crear Nuevo</h3>
                                <div className="space-y-3">
                                    {actions.map((action) => {
                                        const Icon = action.icon;
                                        return (
                                            <button
                                                key={action.id}
                                                onClick={() => handleActionClick(action.path)}
                                                className="w-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity p-4 rounded-2xl flex items-center gap-4 shadow-md border border-white/10 dark:border-black/10 active:scale-[0.98]"
                                            >
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white dark:bg-black/10 dark:text-black">
                                                    <Icon className="w-6 h-6" strokeWidth={2.2} />
                                                </div>
                                                <span className="font-semibold text-base text-white dark:text-black">
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


