'use client';

/**
 * AppLayout - Responsive layout with TabBar and Sidebar
 */

import React, { ReactNode, useEffect } from 'react';
import TabBar from './TabBar';
import Sidebar from './Sidebar';
import AuthGuard from './AuthGuard';
import FloatingCreateButton from './FloatingCreateButton';
import SaveModal from './SaveModal';
import { useUiStore } from '@/store/uiStore';
import { UploadCloud, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { pendingUploadItem, clearPendingUploadItem, showModal, saveToast, hideSaveToast, isSelectionMode } = useUiStore();

  useEffect(() => {
    if (saveToast) {
      const timer = setTimeout(() => {
        hideSaveToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveToast, hideSaveToast]);

  const handleCancelPending = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    showModal({
      title: '¿Cancelar subida?',
      message: 'Se perderán los datos de la prenda que estabas añadiendo. ¿Estás seguro?',
      type: 'warning',
      confirmText: 'Sí, cancelar',
      cancelText: 'Seguir editando',
      onConfirm: () => {
        clearPendingUploadItem();
      }
    });
  };

  const pathname = usePathname();
  const { isTabBarHidden: storeTabBarHidden } = useUiStore();
  
  const hideTabBar =
    storeTabBarHidden ||
    pathname.startsWith('/messages') ||
    pathname === '/create' ||
    pathname.startsWith('/profile/settings');

  return (
    <div className="flex min-h-[100dvh] bg-[var(--background)] overflow-x-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className={`flex-1 relative ${hideTabBar ? 'pb-0' : 'pb-28 md:pb-0'}`}>
        <AuthGuard>
          {children}
        </AuthGuard>
      </main>

      {/* Mobile TabBar */}
      <TabBar />

      {/* Floating Create Button (Desktop only) */}
      <FloatingCreateButton />

      {/* Floating Pending Upload Bubble */}
      <AnimatePresence>
        {pendingUploadItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              bottom: isSelectionMode ? 'calc(var(--tabbar-height) + 112px)' : 'calc(var(--tabbar-height) + 24px)'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed md:bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-24 z-[4990] shadow-xl flex items-center bg-[var(--background)] border-2 border-[var(--brand-pink)] rounded-full overflow-hidden pb-safe transition-[bottom] duration-300"
          >
            <Link
              href="/closet?action=new-item"
              className="flex items-center gap-2 px-4 py-2.5 text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
            >
              <UploadCloud className="w-5 h-5 text-[var(--brand-pink)] animate-pulse" />
              <span className="font-semibold text-sm">Prenda Pendiente</span>
            </Link>
            <button
              onClick={handleCancelPending}
              className="p-3 border-l text-[var(--foreground-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border-[var(--border-color)] transition-colors"
              title="Cancelar subida"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Modals */}
      <SaveModal />

      {/* Global Save Toast */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              bottom: isSelectionMode ? 'calc(var(--tabbar-height) + 84px)' : 'calc(var(--tabbar-height) + 16px)'
            }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed left-4 right-4 md:left-auto md:right-8 md:bottom-24 md:w-80 bg-[#1a1a1a] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center justify-between gap-4 px-5 py-3.5 z-[4995] transition-[bottom] duration-300 pb-safe"
          >
            <span className="text-white font-medium text-sm">{saveToast.message}</span>
            {saveToast.actionLabel && (
              <button
                onClick={() => {
                  saveToast.onAction?.();
                  hideSaveToast();
                }}
                className="text-[var(--brand-pink)] font-bold text-sm tracking-wide hover:text-pink-400 transition-colors bg-[var(--brand-pink)]/10 px-4 py-1.5 rounded-full"
              >
                {saveToast.actionLabel}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
