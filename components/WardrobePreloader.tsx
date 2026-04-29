'use client';

/**
 * WardrobePreloader - Animación de apertura de armario al iniciar la app
 * Se muestra solo la primera vez que se abre la app para precargar el modelo IA
 * Incluye frases divertidas de carga y animación de puertas de armario mejorada
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '@/store';

const APP_PRELOAD_KEY = 'klozet_app_preloaded';

// Frases divertidas de carga relacionadas con moda/armario
const LOADING_PHRASES = [
  'Planchando la ropa…',
  'Recogiendo el armario…',
  'Organizando por colores…',
  'Combinando outfits…',
  'Eligiendo los zapatos…',
  'Doblando camisetas…',
  'Buscando ese calcetín perdido…',
  'Colgando los vestidos…',
  'Preparando tu estilo…',
  'Abrochando botones…',
];  

const WardrobePreloader = () => {
  const { user, isLoading: userLoading } = useUser();
  const [visible, setVisible] = useState<boolean | null>(null);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const preloadStarted = useRef(false);
  const minTimeElapsed = useRef(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Only show for logged-in users on first visit
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (userLoading) return; // Wait for auth to resolve
    if (!user) {
      setVisible(false);
      return;
    }
    const hasPreloaded = localStorage.getItem(APP_PRELOAD_KEY);
    if (hasPreloaded) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [user, userLoading]);

  // Simulated progress bar — advances slowly, caps at 85% until model ready
  useEffect(() => {
    if (!visible) return;
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) {
          if (progressInterval.current) clearInterval(progressInterval.current);
          return 85;
        }
        // Slow down as it approaches 85%
        const increment = Math.max(0.5, (85 - prev) * 0.06);
        return Math.min(85, prev + increment);
      });
    }, 100);
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [visible]);

  // Rotate loading phrases
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % LOADING_PHRASES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [visible]);

  // Try to complete: open doors and fade out
  const tryComplete = useCallback(() => {
    if (!modelReady.current || !minTimeElapsed.current) return;
    // Fill progress to 100%
    if (progressInterval.current) clearInterval(progressInterval.current);
    setProgress(100);
    // Small delay to show 100%, then open doors
    setTimeout(() => {
      setDoorsOpen(true);
      // After doors open animation, fade out
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setVisible(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem(APP_PRELOAD_KEY, 'true');
          }
        }, 600);
      }, 2000);
    }, 400);
  }, []);

  // Minimum display time (2.5s) to appreciate the animation
  // OPTIMIZED: Removed AI model preloading - models are now loaded on-demand by SmartModelPreloader
  useEffect(() => {
    if (!visible) return;

    // Fail-safe: ensure preloader is removed after 5 seconds no matter what
    const failSafeTimer = setTimeout(() => {
      if (visible) {
        console.warn('[Preloader] Fail-safe triggered, removing preloader.');
        setVisible(false);
      }
    }, 5000);

    const timer = setTimeout(() => {
      minTimeElapsed.current = true;
      tryComplete();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(failSafeTimer);
    };
  }, [visible, tryComplete]);

  if (visible === null || visible === false) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="wardrobe-preloader-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: fadeOut ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ backgroundColor: doorsOpen ? 'transparent' : undefined }}
        >
          {/* Contenedor de puertas */}
          <div className="wardrobe-preloader-doors">
            {/* Puerta Izquierda */}
            <motion.div
              className="wardrobe-preloader-door wardrobe-preloader-door-left"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: doorsOpen ? -105 : 0 }}
              transition={{
                duration: 1.8,
                delay: doorsOpen ? 0.2 : 0,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <div className="wardrobe-preloader-door-inner">
                <div className="wardrobe-preloader-door-line wardrobe-preloader-door-line-top" />
                <Image
                  src="/klozet-logo-extended.png"
                  alt="Klozet"
                  width={160}
                  height={64}
                  style={{ width: '45%', height: 'auto' }}
                  className="object-contain"
                  priority
                />
                <div className="wardrobe-preloader-door-accent" />
                <div className="wardrobe-preloader-door-line wardrobe-preloader-door-line-bottom" />
              </div>
              <motion.div
                className="wardrobe-preloader-handle wardrobe-preloader-handle-left"
                animate={{ opacity: doorsOpen ? 0 : 1 }}
                transition={{ duration: 0.3, delay: doorsOpen ? 0.5 : 0 }}
              />
            </motion.div>

            {/* Puerta Derecha */}
            <motion.div
              className="wardrobe-preloader-door wardrobe-preloader-door-right"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: doorsOpen ? 105 : 0 }}
              transition={{
                duration: 1.8,
                delay: doorsOpen ? 0.2 : 0,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <div className="wardrobe-preloader-door-inner">
                <div className="wardrobe-preloader-door-line wardrobe-preloader-door-line-top" />
                <Image
                  src="/klozet-logo-dark-extended.png"
                  alt="Klozet"
                  width={160}
                  height={64}
                  style={{ width: '45%', height: 'auto' }}
                  className="object-contain"
                  priority
                />
                <div className="wardrobe-preloader-door-accent" />
                <div className="wardrobe-preloader-door-line wardrobe-preloader-door-line-bottom" />
              </div>
              <motion.div
                className="wardrobe-preloader-handle wardrobe-preloader-handle-right"
                animate={{ opacity: doorsOpen ? 0 : 1 }}
                transition={{ duration: 0.3, delay: doorsOpen ? 0.5 : 0 }}
              />
            </motion.div>
          </div>

          {/* Indicador de carga mejorado */}
          {!doorsOpen && (
            <motion.div
              className="wardrobe-preloader-status"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {/* Hanger spinner */}
              <div className="wardrobe-preloader-spinner">
                <motion.svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--brand-pink)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Hanger icon */}
                  <path d="M12 2a2 2 0 0 0-2 2c0 .74.4 1.39 1 1.73V7l-7 5h16l-7-5V5.73c.6-.34 1-.99 1-1.73a2 2 0 0 0-2-2z" />
                  <path d="M2 12h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2z" />
                </motion.svg>
              </div>

              {/* Barra de progreso */}
              <div className="wardrobe-preloader-bar">
                <motion.div
                  className="wardrobe-preloader-bar-fill"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>

              {/* Frase rotatoria */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentPhrase}
                  className="wardrobe-preloader-phrase"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                >
                  {LOADING_PHRASES[currentPhrase]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WardrobePreloader;
