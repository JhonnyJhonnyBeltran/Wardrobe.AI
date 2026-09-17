'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Camera, 
  Layers, 
  Calendar, 
  Bot, 
  Share2, 
  Search, 
  UploadCloud, 
  ShoppingBag, 
  Sun, 
  CheckCircle2, 
  Trophy 
} from 'lucide-react';
import { useTourStore, TOUR_STEPS, TourStepId } from '@/store/tourStore';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useUser } from '@/store/userStore';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

const STEP_ICONS: Record<TourStepId, React.ElementType> = {
  upload_clothes: Camera,
  create_outfit: Layers,
  schedule_outfit: Calendar,
  talk_to_kloe: Bot,
  create_post: Share2,
  explore_like: Search
};

export default function GuidedTourModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { items } = useWardrobeStore();

  const {
    currentUserId,
    isOpen,
    hasStartedTour,
    currentStepIndex,
    completedSteps,
    isDismissed,
    showCelebration,
    celebrationTitle,
    celebrationMessage,
    celebrationNextUrl,
    initUserTour,
    startNewUserTour,
    openTour,
    closeTour,
    dismissTour,
    nextStep,
    prevStep,
    goToStep,
    markStepComplete,
    hideCelebration
  } = useTourStore();

  // Initialize tour state isolated per authenticated user
  useEffect(() => {
    if (user?.id) {
      initUserTour(user.id);
    }
  }, [user?.id, initUserTour]);

  // Auto-start tour when redirected from onboarding with ?startTour=true
  useEffect(() => {
    if (!user?.id) return;
    const isStartTourParam = searchParams.get('startTour') === 'true';

    if (isStartTourParam) {
      startNewUserTour(user.id);
      // Clean query parameter from URL so it doesn't re-trigger on refresh/navigation
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('startTour');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      } catch (e) {
        console.warn('Could not clean startTour query param:', e);
      }
    }
  }, [searchParams, user?.id, startNewUserTour]);

  // Auto-detect completed real actions (Only pop celebration if actively on tour)
  useEffect(() => {
    if (!user) return;

    // Check items count for upload_clothes (>= 2 items)
    if (items.length >= 2 && !completedSteps.includes('upload_clothes')) {
      const isActivelyOnTour = hasStartedTour && !isDismissed;
      markStepComplete('upload_clothes', '¡Has subido tus primeras prendas al armario!', isActivelyOnTour);
    }
  }, [items.length, user, completedSteps, hasStartedTour, isDismissed, markStepComplete]);

  // Auto-hide celebration after 4 seconds
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        hideCelebration();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [showCelebration, hideCelebration]);

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const StepIcon = currentStep ? (STEP_ICONS[currentStep.id] || Sparkles) : Sparkles;
  const isCurrentCompleted = currentStep ? completedSteps.includes(currentStep.id) : false;
  const progressPercent = Math.round(((completedSteps.length) / TOUR_STEPS.length) * 100);
  const isTourActive = hasStartedTour && !isDismissed && completedSteps.length < TOUR_STEPS.length;

  const handleAction = () => {
    if (!currentStep) return;
    closeTour();
    router.push(currentStep.actionUrl);
  };

  const handleCelebrationContinue = () => {
    hideCelebration();
    if (celebrationNextUrl) {
      router.push(celebrationNextUrl);
    } else {
      openTour();
    }
  };

  return (
    <>
      {/* Tour Modal */}
      <AnimatePresence>
        {isOpen && currentStep && (
          <div className="fixed inset-0 z-[6500] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={closeTour}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Header */}
              <div className="p-5 sm:p-6 pb-4 border-b border-[var(--border-color)]/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center font-bold text-xs">
                    {currentStepIndex + 1}/{TOUR_STEPS.length}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-pink)]">
                      Tour de Inicio Rápido
                    </span>
                    <h3 className="text-sm font-semibold text-[var(--foreground)] leading-tight">
                      {currentStep.subtitle}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={dismissTour}
                    className="text-xs text-[var(--foreground-tertiary)] hover:text-red-500 px-2 py-1 rounded-lg hover:bg-[var(--background-secondary)] transition-colors font-medium"
                    title="Saltar y cerrar el tour definitivamente"
                  >
                    Saltar tour
                  </button>
                  <button
                    onClick={closeTour}
                    className="p-1.5 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    aria-label="Minimizar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stepper Progress Indicator */}
              <div className="px-5 sm:px-6 pt-3">
                <div className="flex items-center gap-1.5 w-full">
                  {TOUR_STEPS.map((s, idx) => {
                    const isDone = completedSteps.includes(s.id);
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <button
                        key={s.id}
                        onClick={() => goToStep(idx)}
                        className="flex-1 h-1.5 rounded-full transition-all duration-300 relative group overflow-hidden"
                      >
                        <div
                          className={`h-full w-full rounded-full transition-all ${
                            isCurrent
                              ? 'bg-[var(--brand-pink)]'
                              : isDone
                              ? 'bg-emerald-500'
                              : 'bg-[var(--border-color)]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                {/* Step Icon & Main Header */}
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    isCurrentCompleted
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] border border-[var(--brand-pink)]/20'
                  }`}>
                    {isCurrentCompleted ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : (
                      <StepIcon className="w-7 h-7" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[var(--foreground)] leading-tight">
                        {currentStep.title}
                      </h2>
                    </div>
                    <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                      {currentStep.description}
                    </p>
                  </div>
                </div>

                {/* Special Photographic Advice Box for Step 1 (upload_clothes) */}
                {currentStep.id === 'upload_clothes' && currentStep.tips && (
                  <div className="bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>{currentStep.tipTitle}</span>
                    </div>

                    <div className="space-y-2.5 text-xs sm:text-[13px] text-[var(--foreground-secondary)] leading-relaxed">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-400/10 text-amber-500 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                        <p><strong className="text-[var(--foreground)]">Luz natural directa:</strong> Haz la foto cerca de una ventana o con buena iluminación para captar los tonos reales de la prenda.</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-purple-400/10 text-purple-500 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                        <p><strong className="text-[var(--foreground)]">Fondo liso y plano:</strong> Extiende la prenda sobre la cama o mesa, o cuélgala en una percha contra una pared neutra.</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-pink-400/10 text-[var(--brand-pink)] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                        <p><strong className="text-[var(--foreground)]">O fotos de tiendas online:</strong> Puedes subir fotos guardadas de webs (Zara, ASOS, Nike, Mango) y la IA eliminará el fondo automáticamente.</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-color)]/50 flex items-center justify-between text-xs">
                      <span className="text-[var(--foreground-tertiary)] font-medium">Prendas en tu armario:</span>
                      <span className="font-bold text-[var(--brand-pink)] tabular-nums">{items.length} / 2 recomendadas</span>
                    </div>
                  </div>
                )}

                {/* Quick overview of all steps checklist */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {TOUR_STEPS.map((s, idx) => {
                    const isDone = completedSteps.includes(s.id);
                    const isCur = idx === currentStepIndex;

                    return (
                      <button
                        key={s.id}
                        onClick={() => goToStep(idx)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                          isCur
                            ? 'bg-[var(--brand-pink)]/10 border-[var(--brand-pink)] text-[var(--foreground)]'
                            : isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-[var(--background-secondary)]/40 border-[var(--border-color)]/40 text-[var(--foreground-tertiary)] hover:border-[var(--border-color)]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          isDone ? 'bg-emerald-500 text-white' : 'border border-[var(--border-color)]'
                        }`}>
                          {isDone && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-medium truncate">{s.shortTitle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="p-5 sm:p-6 pt-3 border-t border-[var(--border-color)]/40 bg-[var(--background-secondary)]/30 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="p-3 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--border-color)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--foreground)] transition-colors shrink-0"
                  aria-label="Paso anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleAction}
                  className="flex-1 py-3 px-5 rounded-xl bg-[var(--brand-pink)] text-white font-semibold text-sm hover:opacity-90 active:scale-98 transition-all shadow-lg shadow-[var(--brand-pink)]/25 flex items-center justify-center gap-2"
                >
                  <span>{currentStep.actionText}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={currentStepIndex === TOUR_STEPS.length - 1}
                  className="p-3 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--border-color)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--foreground)] transition-colors shrink-0"
                  aria-label="Siguiente paso"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Tour Guide Widget (Pill) while tour is active */}
      <AnimatePresence>
        {isTourActive && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] md:bottom-6 right-4 md:right-6 z-[4500]"
          >
            <button
              onClick={openTour}
              className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--brand-pink)]/40 shadow-xl shadow-[var(--brand-pink)]/15 hover:border-[var(--brand-pink)] transition-all group active:scale-95"
            >
              <div className="w-7 h-7 rounded-full bg-[var(--brand-pink)] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentStepIndex + 1}/{TOUR_STEPS.length}
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--brand-pink)] block leading-tight">
                  Guía Activa
                </span>
                <span className="text-xs font-semibold text-[var(--foreground)] block leading-tight truncate max-w-[150px] sm:max-w-[200px]">
                  {currentStep.shortTitle}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--brand-pink)] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duolingo Style Success Celebration Toast */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="fixed bottom-[calc(80px+env(safe-area-inset-bottom,0px))] md:bottom-8 left-1/2 -translate-x-1/2 z-[7000] w-[92vw] max-w-md bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3.5 border border-emerald-400/40"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold leading-tight">{celebrationTitle}</h4>
              <p className="text-xs text-white/90 truncate mt-0.5">{celebrationMessage}</p>
            </div>
            <button
              onClick={handleCelebrationContinue}
              className="px-3 py-1.5 rounded-lg bg-white text-emerald-700 font-bold text-xs hover:bg-emerald-50 transition-colors shrink-0"
            >
              Continuar
            </button>
            <button
              onClick={hideCelebration}
              className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
