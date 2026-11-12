'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTourStore, TOUR_STEPS, calculateTourProgress } from '@/store/tourStore';
import { useUser } from '@/store/userStore';

interface KloeInlineTourPillProps {
  compact?: boolean;
}

/**
 * Inline onboarding pill rendered to the right of Kloe's attachment cards strip
 * when garments, posts, or images are attached so it never collides with them.
 * Collapses to `{N}/6` + `>` whenever horizontal space is tight.
 */
export default function KloeInlineTourPill({ compact = false }: KloeInlineTourPillProps) {
  const { user } = useUser();
  const {
    isOpen,
    hasStartedTour,
    currentStepIndex,
    completedSteps,
    isDismissed,
    isCompleted,
    openTour,
  } = useTourStore();

  const totalPercent = calculateTourProgress(completedSteps);
  const completedCount = completedSteps.filter((id) => TOUR_STEPS.some((s) => s.id === id)).length;
  const isTourCompleted = Boolean(
    isCompleted ||
      completedCount >= TOUR_STEPS.length ||
      totalPercent >= 100 ||
      (typeof window !== 'undefined' &&
        user?.id &&
        localStorage.getItem(`klozet_tour_completed_${user.id}`) === 'true')
  );

  const isTourActive = hasStartedTour && !isDismissed && !isTourCompleted;
  if (!isTourActive || isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];

  if (compact) {
    return (
      <button
        type="button"
        onClick={openTour}
        aria-label="Abrir primeros pasos"
        className="pointer-events-auto shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--brand-pink)]/40 shadow-lg shadow-[var(--brand-pink)]/15 hover:border-[var(--brand-pink)] transition-all group active:scale-95 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-[var(--brand-pink)] text-white flex items-center justify-center font-bold text-[10px] shrink-0 tabular-nums">
          {currentStepIndex + 1}/{TOUR_STEPS.length}
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--brand-pink)] group-hover:translate-x-0.5 transition-transform shrink-0" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openTour}
      className="pointer-events-auto shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--brand-pink)]/40 shadow-lg shadow-[var(--brand-pink)]/15 hover:border-[var(--brand-pink)] transition-all group active:scale-95 cursor-pointer"
    >
      <div className="w-5.5 h-5.5 rounded-full bg-[var(--brand-pink)] text-white flex items-center justify-center font-bold text-[10px] shrink-0 tabular-nums">
        {currentStepIndex + 1}/{TOUR_STEPS.length}
      </div>
      <div className="text-left">
        <span className="text-[9px] uppercase tracking-wider font-bold text-[var(--brand-pink)] block leading-none">
          Primeros pasos
        </span>
        <span className="text-[11px] font-semibold text-[var(--foreground)] block leading-tight mt-0.5 truncate max-w-[130px]">
          {currentStep.shortTitle}
        </span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-[var(--brand-pink)] group-hover:translate-x-0.5 transition-transform shrink-0" />
    </button>
  );
}
