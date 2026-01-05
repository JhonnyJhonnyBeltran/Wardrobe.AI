'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components';

interface AdvisorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function AdvisorModal({ isOpen, onClose, onConfirm }: AdvisorModalProps) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleConfirm = () => {
        if (dontShowAgain) {
            localStorage.setItem('advisor_processed_img_hidden', 'true');
        }
        onConfirm();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[var(--background)] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)]"
                >
                    <div className="p-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-[var(--brand-pink)]" />
                        </div>

                        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                            Consejo para mejores resultados
                        </h3>

                        <p className="text-sm text-[var(--foreground-secondary)] mb-6 leading-relaxed">
                            Para que el procesamiento inteligente funcione correctamente, asegúrate de:
                        </p>

                        <ul className="text-xs text-left text-[var(--foreground-secondary)] space-y-3 mb-6 bg-[var(--background-secondary)] p-4 rounded-xl w-full">
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--brand-pink)]">•</span>
                                Usar un fondo claro y uniforme (preferiblemente blanco).
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--brand-pink)]">•</span>
                                Tener buena iluminación natural.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--brand-pink)]">•</span>
                                Evitar sombras fuertes sobre la prenda.
                            </li>
                        </ul>

                        <div className="flex items-center gap-2 mb-6 w-full justify-start pl-2">
                            <input
                                type="checkbox"
                                id="dontShow"
                                checked={dontShowAgain}
                                onChange={(e) => setDontShowAgain(e.target.checked)}
                                className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--brand-pink)] focus:ring-[var(--brand-pink)]"
                            />
                            <label htmlFor="dontShow" className="text-xs text-[var(--foreground-tertiary)] select-none cursor-pointer">
                                No volver a mostrar este mensaje
                            </label>
                        </div>

                        <div className="flex gap-3 w-full">
                            <Button
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                className="flex-1"
                            >
                                Entendido
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
