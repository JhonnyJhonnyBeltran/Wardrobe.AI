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

    // Slow, luxurious ~1s total cascade variants
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
                delayChildren: 0.12,
                staggerChildren: 0.22 // Cascada lenta de ~1s total
            } 
        }
    };

    const itemVariants: Variants = {
        hidden: { 
            opacity: 0, 
            y: 35, 
            x: 10,
            scale: 0.6 
        },
        visible: { 
            opacity: 1, 
            y: 0, 
            x: 0,
            scale: 1,
            transition: { 
                type: "spring" as const, 
                stiffness: 170, 
                damping: 18, 
                mass: 0.85 
            } 
        }
    };

    return (
        <>
            {/* Click-outside backdrop when menu is open */}
            <AnimatePresence>
                {isCreateMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setCreateMenuOpen(false)}
                        className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px]"
                    />
                )}
            </AnimatePresence>

            {/* Desktop Speed Dial - Shifted slightly more to the left (right-10 md:right-14) */}
            <div className="hidden md:flex fixed bottom-24 md:bottom-10 right-10 md:right-14 z-50 flex-col items-end pointer-events-none">
                
                {/* Cascade Options (Desktop) */}
                <AnimatePresence>
                    {isCreateMenuOpen && (
                        <motion.div
                            className="flex flex-col items-end gap-3.5 mb-4 origin-bottom pointer-events-auto"
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
                                        {/* Label Tag */}
                                        <span className="px-4 py-2 bg-[var(--card-bg)]/95 dark:bg-[#18181f]/95 text-[var(--foreground)] text-sm font-bold rounded-2xl shadow-xl border border-[var(--border-color)] group-hover:border-[var(--brand-pink)] group-hover:text-[var(--brand-pink)] transition-all">
                                            {action.label}
                                        </span>
                                        {/* Option Bubble - Exactly 56px (w-14 h-14) with 28px (w-7 h-7) Icon */}
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-black text-white dark:bg-white dark:text-black shadow-2xl border border-white/15 dark:border-black/15 transition-all group-hover:scale-110 group-active:scale-95 group-hover:shadow-[0_10px_25px_rgba(255,45,120,0.35)]">
                                            <Icon className="w-7 h-7" strokeWidth={2.2} />
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Trigger Button (+ / X) */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggle}
                    className="w-14 h-14 rounded-full bg-[var(--brand-pink)] flex items-center justify-center text-white shadow-2xl shadow-[var(--brand-pink)]/35 cursor-pointer overflow-hidden z-20 transition-all hover:scale-105 pointer-events-auto"
                    aria-label={isCreateMenuOpen ? "Cerrar menú de creación" : "Crear nuevo"}
                >
                    <motion.div
                        animate={{ rotate: isCreateMenuOpen ? 135 : 0 }}
                        transition={{ type: "spring", stiffness: 280, damping: 20 }}
                    >
                        <Plus className="w-7 h-7" strokeWidth={2.5} />
                    </motion.div>
                </motion.button>
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
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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

