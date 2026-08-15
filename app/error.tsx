'use client';

import { useEffect, useState } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    console.error('Unhandled application error:', error);
    
    // Prevent infinite reload loops
    const now = Date.now();
    const lastReload = parseInt(sessionStorage.getItem('error_reload_time') || '0');
    const reloadCount = parseInt(sessionStorage.getItem('error_reload_count') || '0');

    let newCount = 1;
    // If the last reload was less than 10 seconds ago, it's a loop
    if (now - lastReload < 10000) {
      newCount = reloadCount + 1;
    }

    sessionStorage.setItem('error_reload_time', now.toString());
    sessionStorage.setItem('error_reload_count', newCount.toString());

    // Only auto-reload up to 2 times in a row
    if (newCount <= 2) {
      console.warn('Auto-reloading page to recover from error...', error);
      setIsReloading(true);
      window.location.reload();
    }
  }, [error]);

  if (isReloading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <div className="w-8 h-8 border-4 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold mb-2">Recargando aplicación...</h2>
        <p className="text-gray-500">Hemos detectado un problema y estamos intentando solucionarlo.</p>
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
        Ha ocurrido un error persistente. Si el problema continúa, contacta a soporte.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:opacity-80 transition-opacity"
        >
          Forzar recarga
        </button>
        <button
          onClick={() => {
            sessionStorage.removeItem('error_reload_time');
            sessionStorage.removeItem('error_reload_count');
            reset();
          }}
          className="px-6 py-2.5 bg-[var(--brand-pink)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[var(--brand-pink)]/20"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
