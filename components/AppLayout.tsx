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
    clearPendingUploadItem();
  };

  const pathname = usePathname();
  const { isTabBarHidden: storeTabBarHidden } = useUiStore();
  
  const hideTabBar =
    storeTabBarHidden ||
    pathname.startsWith('/messages') ||
    pathname === '/create' ||
    pathname.startsWith('/profile/settings');

  return (
    <div className="flex min-h-[100dvh] bg-[var(--background)]">
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
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              bottom: isSelectionMode ? 'calc(var(--tabbar-height) + 112px)' : 'calc(var(--tabbar-height) + 20px)'
            }}
            className="fixed left-1/2 -translate-x-1/2 w-[92vw] max-w-md sm:max-w-lg bg-[var(--card-bg)]/95 backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] p-2.5 sm:p-3 flex items-center justify-between gap-3 z-[4990] transition-[bottom] duration-300"
          >
            <Link
              href="/closet?action=new-item"
              className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-85 transition-opacity"
            >
              {(() => {
                const displayImg = pendingUploadItem.processedImage || 
                  pendingUploadItem.image || 
                  pendingUploadItem.originalImage || 
                  (pendingUploadItem.batchItems?.[0]?.image || pendingUploadItem.batchItems?.[0]?.originalImage);

                if (displayImg) {
                  return (
                    <div className="w-12 h-12 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                      <img
                        src={displayImg}
                        alt={pendingUploadItem.formData?.name || pendingUploadItem.name || 'Prenda'}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  );
                }
                return (
                  <div className="w-12 h-12 rounded-xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center flex-shrink-0">
                    <UploadCloud className="w-6 h-6 animate-pulse" />
                  </div>
                );
              })()}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--brand-pink)] animate-ping" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-pink)]">
                    {pendingUploadItem.batchItems && pendingUploadItem.batchItems.length > 1
                      ? `Subida múltiple (${pendingUploadItem.batchItems.length})`
                      : 'Subida pendiente'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[var(--foreground)] truncate mt-0.5">
                  {pendingUploadItem.name || pendingUploadItem.formData?.name || (pendingUploadItem.batchItems?.length ? `${pendingUploadItem.batchItems.length} prendas en lote` : 'Prenda en progreso')}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/closet?action=new-item"
                className="px-3.5 py-2 bg-[var(--brand-pink)] hover:bg-[var(--brand-pink)]/90 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Continuar</span>
              </Link>
              <button
                onClick={handleCancelPending}
                className="p-2 rounded-xl text-[var(--foreground-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-90 transition-all"
                title="Descartar subida pendiente"
                aria-label="Descartar subida pendiente"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Modals */}
      <SaveModal />

      {/* Global Save Toast */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            style={{
              bottom: isSelectionMode ? 'calc(var(--tabbar-height) + 84px)' : 'calc(var(--tabbar-height) + 16px)'
            }}
            className="fixed left-0 right-0 mx-auto md:left-[72px] w-max bg-[var(--background)] border border-[var(--border-color)] rounded-full shadow-lg flex items-center justify-center gap-3 px-6 py-3 z-[4995] transition-[bottom] duration-300"
          >
            <span className="text-[var(--foreground)] font-medium text-sm">{saveToast.message}</span>
            {saveToast.actionLabel && (
              <button
                onClick={() => {
                  saveToast.onAction?.();
                  hideSaveToast();
                }}
                className="text-[var(--brand-pink)] font-bold text-sm tracking-wide hover:text-pink-400 transition-colors"
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
