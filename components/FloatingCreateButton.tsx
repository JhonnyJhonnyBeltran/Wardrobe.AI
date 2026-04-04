'use client';

import { Plus, X, Image as ImageIcon, Shirt, Layers } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { triggerHaptic } from '@/lib/haptic';
import { useState, useEffect } from 'react';
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

    const actions = [
        { id: 'post', label: 'Nuevo Post', icon: ImageIcon, path: '/create-post', color: 'bg-blue-500' },
        { id: 'outfit', label: 'Nuevo Outfit', icon: Layers, path: '/create', color: 'bg-purple-500' },
        { id: 'item', label: 'Nueva Prenda', icon: Shirt, path: '/closet?action=new-item', color: 'bg-pink-400' },
    ];

    // Animation variants for desktop speed dial
    const containerVariants = {
        hidden: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10, scale: 0.8 },
        visible: { opacity: 1, y: 0, scale: 1 }
    };

    return (
        <>
            {/* Desktop Speed Dial + Mobile FAB Wrapper - Oculto en el Feed por User Request */}
            {(pathname !== '/feed' && !pathname.startsWith('/profile')) && (
                <div className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-50 flex flex-col items-end">
                    {/* Desktop Bubbles */}
                    <AnimatePresence>
                        {isCreateMenuOpen && (
                            <motion.div
                                className="hidden md:flex flex-col items-end gap-3 mb-4 origin-bottom"
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
                                            className="group flex items-center gap-3"
                                        >
                                            <span className="px-3 py-1.5 bg-[var(--card-bg)] text-[var(--foreground)] text-sm font-semibold rounded-lg shadow-md border border-[var(--border-color)] opacity-0 group-hover:opacity-100 transition-opacity">
                                                {action.label}
                                            </span>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 ${action.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main FAB Trigger */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleToggle}
                        className="w-14 h-14 rounded-full bg-[var(--brand-pink)] flex items-center justify-center text-white shadow-xl shadow-[var(--brand-pink)]/30 cursor-pointer overflow-hidden z-20 transition-all hover:bg-[var(--brand-pink-dark)]"
                    >
                        <motion.div
                            animate={{ rotate: isCreateMenuOpen ? 45 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Plus className="w-7 h-7" strokeWidth={2.5} />
                        </motion.div>
                    </motion.button>
                </div>
            )}

            {/* Mobile Bottom Sheet Modal */}
            <AnimatePresence>
                {isCreateMenuOpen && (
                    <motion.div
                        className={`fixed inset-0 z-[60] flex flex-col justify-end ${pathname.startsWith('/profile') ? 'md:items-center' : 'md:hidden'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setCreateMenuOpen(false)}
                        />

                        {/* Sheet */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`relative w-full bg-[var(--card-bg)] pt-2 pb-safe shadow-2xl border border-[var(--border-color)] overflow-hidden ${pathname.startsWith('/profile') ? 'md:max-w-md rounded-3xl md:mb-8' : 'rounded-3xl mb-[85px] mx-4 w-[calc(100%-32px)]'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full mx-auto my-3" />
                            <div className="px-4 pb-12">
                                <h3 className="text-xl font-bold text-center text-[var(--foreground)] mb-6">Crear Nuevo</h3>
                                <div className="space-y-3">
                                    {actions.map((action) => {
                                        const Icon = action.icon;
                                        return (
                                            <button
                                                key={action.id}
                                                onClick={() => handleActionClick(action.path)}
                                                className="w-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] transition-colors p-4 rounded-2xl flex items-center gap-4"
                                            >
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${action.color}`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <span className="text-[var(--foreground)] font-semibold text-lg">
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
