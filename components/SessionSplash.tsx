'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LogoExtended from '@/components/LogoExtended';
import { useRouter } from 'next/navigation';
import { Button } from '@/components';

interface SessionSplashProps {
  isLoading: boolean;
  onComplete?: () => void;
  text?: string;
  subtext?: string;
}

export default function SessionSplash({ isLoading, onComplete, text, subtext }: SessionSplashProps) {
  const [show, setShow] = useState(true);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    let stuckTimer: NodeJS.Timeout;
    
    if (!isLoading) {
      setIsStuck(false);
      setAnimatingOut(true);
      // Wait for exit animation to complete
      const timer = setTimeout(() => {
        setShow(false);
        if (onComplete) {
          onComplete();
        }
      }, 500); // Wait 500ms for the animation before unmounting/routing
      return () => clearTimeout(timer);
    } else {
      setAnimatingOut(false);
      setShow(true);
      
      // Safety net: If stuck loading for 6 seconds, show fallback UI
      stuckTimer = setTimeout(() => {
        setIsStuck(true);
      }, 6000);
      
      return () => clearTimeout(stuckTimer);
    }
  }, [isLoading, onComplete]);

  const handleForceReload = () => {
    // Optionally trigger a hard browser reload to clear out stale connections
    sessionStorage.setItem('klozet_recovery_reload', 'true');
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--background)]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: animatingOut ? 5 : [1, 1.05, 1], 
              opacity: animatingOut ? 0 : 1,
            }}
            transition={{ 
              scale: animatingOut ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] } : { duration: 3, repeat: Infinity, ease: "easeInOut" },
              opacity: animatingOut ? { duration: 0.4, ease: 'easeOut', delay: 0.1 } : { duration: 0.5 }
            }}
            className="flex flex-col items-center origin-center"
          >
            <LogoExtended size="xl" />
          </motion.div>
          
          {(text || subtext || isStuck) && !animatingOut && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2 }}
              className="mt-12 text-center flex flex-col items-center gap-3 px-6"
            >
              {!isStuck ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin mb-2" />
                  {text && <p className="text-sm font-bold text-[var(--foreground)] tracking-wide">{text}</p>}
                  {subtext && <p className="text-xs text-[var(--foreground-secondary)]">{subtext}</p>}
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500">
                  <p className="text-sm font-bold text-[var(--foreground)] tracking-wide">
                    La conexión va lenta
                  </p>
                  <p className="text-xs text-[var(--foreground-secondary)] max-w-xs text-center mb-1">
                    Estamos teniendo problemas para conectar. Puedes intentar recargar la página.
                  </p>
                  <Button onClick={handleForceReload} className="px-6 py-2 text-sm shadow-sm rounded-full">
                    Recargar
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
