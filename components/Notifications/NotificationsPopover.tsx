'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationList from './NotificationList';

interface NotificationsPopoverProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationsPopover({ isOpen, onClose }: NotificationsPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={popoverRef}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-0 left-[72px] h-screen w-[400px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl z-[60] flex flex-col"
                >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-10 shrink-0">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notificaciones</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x text-gray-500"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0">
                        <NotificationList compact onClose={onClose} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
