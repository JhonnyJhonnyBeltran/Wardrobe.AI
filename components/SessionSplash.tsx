'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LogoExtended from '@/components/LogoExtended';
import { useRouter } from 'next/navigation';

interface SessionSplashProps {
  isLoading: boolean;
  onComplete?: () => void;
  text?: string;
  subtext?: string;
}

export default function SessionSplash({ isLoading, onComplete, text, subtext }: SessionSplashProps) {
  const [show, setShow] = useState(true);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
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
    }
  }, [isLoading, onComplete]);

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
          
          {(text || subtext) && !animatingOut && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2 }}
              className="mt-12 text-center flex flex-col items-center gap-3"
            >
              <div className="w-5 h-5 border-2 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin mb-2" />
              {text && <p className="text-sm font-bold text-[var(--foreground)] tracking-wide">{text}</p>}
              {subtext && <p className="text-xs text-[var(--foreground-secondary)]">{subtext}</p>}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
