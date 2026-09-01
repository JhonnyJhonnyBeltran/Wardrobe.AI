'use client';

import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfiniteScrollFooterProps {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  hasItems: boolean;
  onRetry: () => void;
  endMessage?: string;
  errorMessage?: string;
  skeleton?: React.ReactNode;
}

export default function InfiniteScrollFooter({
  isLoading,
  isError,
  hasMore,
  hasItems,
  onRetry,
  endMessage = '¡Estás al día! No hay más resultados.',
  errorMessage = 'No se pudo cargar más contenido.',
  skeleton
}: InfiniteScrollFooterProps) {
  // If we don't have items yet and aren't loading, we usually show an EmptyState, not this footer.
  if (!hasItems && !isLoading && !isError) return null;

  return (
    <div className="w-full py-8 flex flex-col items-center justify-center min-h-[100px]">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full flex flex-col items-center gap-3"
          >
            {skeleton ? (
              skeleton
            ) : (
              <div className="w-full max-w-sm flex flex-col gap-3 opacity-60 animate-pulse">
                <div className="h-4 w-2/3 bg-[var(--background-secondary)] rounded-full overflow-hidden" />
                <div className="h-4 w-1/2 bg-[var(--background-secondary)] rounded-full overflow-hidden" />
              </div>
            )}
            <p className="text-xs font-medium text-[var(--foreground-secondary)] mt-2">Cargando más...</p>
          </motion.div>
        )}

        {isError && !isLoading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-3 bg-[var(--background-secondary)] px-6 py-4 rounded-2xl border border-[var(--border-color)]/50"
          >
            <p className="text-sm font-medium text-[var(--foreground)]">{errorMessage}</p>
            <button 
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-full text-xs font-bold text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </motion.div>
        )}

        {(!hasMore && hasItems && !isError && endMessage) && (
          <motion.div
            key="end-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex justify-center items-center py-4"
          >
            <p className="text-xs font-medium text-[var(--foreground-tertiary)] text-center">{endMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
