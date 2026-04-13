'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

export default function SystemModal() {
    const { modal, closeModal } = useUiStore();
    
    // Add scroll lock
    useBodyScrollLock(!!modal);

    if (!modal) return null;

    const { title, message, type, onConfirm, onCancel, confirmText = 'Aceptar', cancelText = 'Cancelar' } = modal;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-12 h-12 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-12 h-12 text-red-500" />;
            case 'warning':
            case 'confirm':
                return <AlertTriangle className="w-12 h-12 text-amber-500" />;
            default:
                return <Info className="w-12 h-12 text-blue-500" />;
        }
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        closeModal();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        closeModal();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={handleCancel}
            >
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[var(--background)] border border-[var(--border-color)] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="p-6 flex flex-col items-center text-center">
                        <div className="mb-4 p-3 rounded-full bg-[var(--background-secondary)] shadow-sm">
                            {getIcon()}
                        </div>

                        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                            {title}
                        </h3>

                        <p className="text-[var(--foreground-secondary)] text-sm mb-6 leading-relaxed">
                            {message}
                        </p>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            {(type === 'confirm' || onCancel) && (
                                <Button
                                    variant="secondary"
                                    onClick={handleCancel}
                                    className="w-full"
                                >
                                    {cancelText}
                                </Button>
                            )}

                            <Button
                                variant={type === 'error' ? 'destructive' : 'primary'}
                                onClick={handleConfirm}
                                className={type !== 'confirm' && !onCancel ? "col-span-2 w-full" : "w-full"}
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
