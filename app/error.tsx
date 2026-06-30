'use client';

import { useEffect, useState } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isChunkError, setIsChunkError] = useState(false);

  useEffect(() => {
    // Check if the error is related to failing to load a chunk (common after deployments or long periods of inactivity)
    const errorString = (error.message || error.toString()).toLowerCase();
    
    // Patterns that indicate a Next.js chunk failed to load
    const isChunkLoadError = 
      errorString.includes('chunkloaderror') || 
      errorString.includes('failed to fetch dynamically imported module') ||
      errorString.includes('loading chunk') ||
      errorString.includes('fetch failed') ||
      errorString.includes('network error');
      
    if (isChunkLoadError) {
      console.warn('Chunk load error detected, reloading page automatically...', error);
      setIsChunkError(true);
      // Force a full page reload to get the new chunks from the server
      window.location.reload();
      return;
    }
    
    // Log other errors
    console.error('Unhandled application error:', error);
  }, [error]);

  if (isChunkError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <div className="w-8 h-8 border-4 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold mb-2">Actualizando aplicación...</h2>
        <p className="text-gray-500">Por favor, espera un momento.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Algo ha salido mal</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        Ha ocurrido un error inesperado. Si el problema persiste, intenta recargar la página.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:opacity-80 transition-opacity"
        >
          Recargar página
        </button>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-[var(--brand-pink)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[var(--brand-pink)]/20"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
