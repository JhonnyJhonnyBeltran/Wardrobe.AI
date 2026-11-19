'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Camera, 
  Layers, 
  Calendar, 
  Share2, 
  Search, 
  Plus, 
  CheckCircle2, 
  Trophy,
  Sparkles
} from 'lucide-react';
import KloeMascot from '@/components/KloeMascot';
import { useTourStore, TOUR_STEPS, TourStepId, calculateTourProgress } from '@/store/tourStore';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useProfileStore } from '@/store/profileStore';
import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const KloeStepIcon = () => <KloeMascot mood="happy" size="sm" />;

const STEP_ICONS: Record<TourStepId, React.ElementType> = {
  style_preferences: Palette,
  avatar: Camera,
  upload_clothes: Plus,
  create_outfit: Layers,
  talk_to_kloe: KloeStepIcon,
  create_post: Share2,
  schedule_outfit: Calendar,
  explore_like: Search
};

export default function GuidedTourModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { items } = useWardrobeStore();
  const hasKloeAttachments = useUiStore((s) => s.hasKloeAttachments);

  const {
    isOpen,
    hasStartedTour,
    currentStepIndex,
    completedSteps,
    isDismissed,
    isCompleted,
    showCelebration,
    celebrationTitle,
    celebrationMessage,
    celebrationNextUrl,
    initUserTour,
    startNewUserTour,
    openTour,
    closeTour,
    nextStep,
    prevStep,
    goToStep,
    markStepComplete,
    setStepStatus,
    hideCelebration
  } = useTourStore();

  // Real account metrics state (Prendas, Outfits, Mensajes con Kloe, Posts)
  const [stats, setStats] = useState({
    clothesCount: 0,
    outfitsCount: 0,
    messagesCount: 0,
    postsCount: 0,
    hasLoaded: false
  });

  // Initialize tour state isolated per authenticated user
  useEffect(() => {
    if (user?.id) {
      initUserTour(user.id);
    }
  }, [user?.id, initUserTour]);

  // Helper to extract message counts from local storage
  const calculateLocalMessages = (userId: string) => {
    let count = 0;
    try {
      const raw = localStorage.getItem(`kloe_conversations_${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const conv of parsed) {
            if (Array.isArray(conv.messages)) {
              count += conv.messages.filter((m: any) => m.role === 'user').length;
            }
          }
        }
      }
      const trial = localStorage.getItem(`kloe_trial_used_${userId}`);
      if (trial) {
        const val = parseInt(trial, 10);
        if (!isNaN(val) && val > count) count = val;
      }
    } catch {}
    return count;
  };

  // Fetch real account metrics directly from Supabase and active stores
  const fetchTourStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [itemsRes, outfitsRes, postsRes, profileRes] = await Promise.all([
        supabase.from('items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('outfits').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('profiles').select('notification_preferences, kloe_trial_messages_used').eq('id', user.id).maybeSingle()
      ]);

      const liveItems = items.length;
      const dbItems = itemsRes.count ?? 0;
      const finalClothes = Math.max(dbItems, liveItems);

      const dbOutfits = outfitsRes.count ?? 0;
      const liveOutfits = (useWardrobeStore.getState() as any).outfits?.length || 0;
      const finalOutfits = Math.max(dbOutfits, liveOutfits);

      const dbPosts = postsRes.count ?? 0;
      const livePosts = useProfileStore.getState().posts?.length || 0;
      const liveProfileStatsPosts = useProfileStore.getState().profileStats?.posts || 0;
      const finalPosts = Math.max(dbPosts, livePosts, liveProfileStatsPosts);

      let finalMessages = calculateLocalMessages(user.id);
      if (profileRes.data) {
        const trialUsed = (profileRes.data as any).kloe_trial_messages_used || 0;
        if (trialUsed > finalMessages) finalMessages = trialUsed;

        const notifs = (profileRes.data as any).notification_preferences;
        if (notifs && Array.isArray(notifs.kloe_conversations)) {
          let remoteUserMsgs = 0;
          for (const conv of notifs.kloe_conversations) {
            if (Array.isArray(conv.messages)) {
              remoteUserMsgs += conv.messages.filter((m: any) => m.role === 'user').length;
            }
          }
          if (remoteUserMsgs > finalMessages) finalMessages = remoteUserMsgs;
        }
      }

      setStats({
        clothesCount: finalClothes,
        outfitsCount: finalOutfits,
        messagesCount: finalMessages,
        postsCount: finalPosts,
        hasLoaded: true
      });
    } catch (err) {
      console.warn('[GuidedTourModal] Error fetching tour stats:', err);
    }
  }, [user?.id, items.length]);

  // Refetch when modal opens or route changes
  useEffect(() => {
    if (user?.id) {
      fetchTourStats();
    }
  }, [user?.id, isOpen, pathname, fetchTourStats]);

  const hasStyle = Boolean(
    user?.styleCompleted ||
    (user?.preferredStyles && user.preferredStyles.length > 0) ||
    user?.age ||
    user?.gender
  );
  const hasAvatar = Boolean(user?.avatar && !user.avatar.includes('placeholder'));

  // Sync completion status accurately based on real user data
  useEffect(() => {
    if (!user?.id || !stats.hasLoaded) return;

    setStepStatus('upload_clothes', stats.clothesCount >= 3);
    setStepStatus('create_outfit', stats.outfitsCount >= 1);
    setStepStatus('talk_to_kloe', stats.messagesCount >= 1);
    setStepStatus('create_post', stats.postsCount >= 1);
    setStepStatus('style_preferences', hasStyle);
    setStepStatus('avatar', hasAvatar);
  }, [user?.id, stats, hasStyle, hasAvatar, setStepStatus]);

  const totalPercent = calculateTourProgress(completedSteps);
  const completedCount = completedSteps.filter(id => TOUR_STEPS.some(s => s.id === id)).length;
  const isTourCompleted = Boolean(
    isCompleted || 
    completedCount >= TOUR_STEPS.length || 
    totalPercent >= 100 ||
    (typeof window !== 'undefined' && user?.id && localStorage.getItem(`klozet_tour_completed_${user.id}`) === 'true')
  );

  // Auto-start tour when redirected from onboarding with ?startTour=true
  useEffect(() => {
    if (!user?.id) return;
    const isStartTourParam = searchParams.get('startTour') === 'true';

    if (isStartTourParam) {
      if (!isTourCompleted && !isDismissed) {
        startNewUserTour(user.id);
      }
      // Clean query parameter from URL so it doesn't re-trigger on refresh/navigation
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('startTour');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      } catch (e) {
        console.warn('Could not clean startTour query param:', e);
      }
    }
  }, [searchParams, user?.id, startNewUserTour, isTourCompleted, isDismissed]);

  // Auto-hide celebration after 4.5 seconds
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        hideCelebration();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [showCelebration, hideCelebration]);

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const StepIcon = currentStep ? (STEP_ICONS[currentStep.id] || Palette) : Palette;
  const isCurrentCompleted = currentStep ? completedSteps.includes(currentStep.id) : false;
  const isTourActive = hasStartedTour && !isDismissed && !isTourCompleted;

  const handleAction = () => {
    if (!currentStep) return;
    closeTour();
    router.push(currentStep.actionUrl);
  };

  const getActionButtonText = () => {
    if (!currentStep) return '';
    if (isCurrentCompleted) {
      switch (currentStep.id) {
        case 'upload_clothes': return 'Añadir más prendas';
        case 'create_outfit': return 'Crear otro outfit';
        case 'talk_to_kloe': return 'Seguir hablando con Kloe';
        case 'create_post': return 'Crear otra publicación';
        case 'style_preferences': return 'Editar estilos';
        case 'avatar': return 'Cambiar foto de perfil';
        default: return currentStep.actionText;
      }
    }
    return currentStep.actionText;
  };

  const getStepMetricBadge = (stepId: TourStepId) => {
    switch (stepId) {
      case 'upload_clothes':
        return `${stats.clothesCount}/3`;
      case 'create_outfit':
        return `${stats.outfitsCount}/1`;
      case 'talk_to_kloe':
        return `${stats.messagesCount}/1`;
      case 'create_post':
        return `${stats.postsCount}/1`;
      case 'style_preferences':
        return hasStyle ? '1/1' : '0/1';
      case 'avatar':
        return hasAvatar ? '1/1' : '0/1';
      default:
        return '';
    }
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
              <div className="p-5 sm:p-6 pb-4 border-b border-[var(--border-color)]/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)] text-white flex items-center justify-center font-bold text-xs shrink-0 tabular-nums shadow-sm shadow-[var(--brand-pink)]/25">
                    {currentStepIndex + 1}/{TOUR_STEPS.length}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-pink)] block leading-tight">
                      Primeros pasos
                    </span>
                    <h3 className="text-sm font-semibold text-[var(--foreground)] leading-tight mt-0.5 truncate">
                      {completedCount} de {TOUR_STEPS.length} completados · {currentStep.subtitle}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={closeTour}
                  className="p-1.5 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer shrink-0"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
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
                        className="flex-1 h-1.5 rounded-full transition-all duration-300 relative group overflow-hidden cursor-pointer"
                        title={`${s.shortTitle} (${isDone ? 'Completado' : 'Pendiente'})`}
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

                {/* Dynamic Step Progress & Real Data Metrics Card */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 space-y-3">
                  {currentStep.id === 'upload_clothes' && (
                    <>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-[var(--brand-pink)]" />
                          <span>Prendas en tu armario</span>
                        </div>
                        <span className={`tabular-nums font-bold ${stats.clothesCount >= 3 ? 'text-emerald-500' : 'text-[var(--brand-pink)]'}`}>
                          {stats.clothesCount} / 3 recomendadas
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)]/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stats.clothesCount >= 3 ? 'bg-emerald-500' : 'bg-[var(--brand-pink)]'
                          }`}
                          style={{ width: `${Math.min(100, Math.round((stats.clothesCount / 3) * 100))}%` }}
                        />
                      </div>

                      <div className="space-y-2 text-xs sm:text-[13px] text-[var(--foreground-secondary)] leading-relaxed">
                        <p>
                          {stats.clothesCount >= 3 ? (
                            <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              ¡Completado! Tienes {stats.clothesCount} prendas subidas y listas para combinar.
                            </span>
                          ) : stats.clothesCount > 0 ? (
                            <span>
                              Tienes <strong className="text-[var(--foreground)]">{stats.clothesCount} prenda{stats.clothesCount > 1 ? 's' : ''}</strong> subida{stats.clothesCount > 1 ? 's' : ''}. Te faltan <strong className="text-[var(--brand-pink)]">{3 - stats.clothesCount}</strong> para alcanzar el mínimo recomendado.
                            </span>
                          ) : (
                            <span>Sube fotos reales o capturas de tiendas. Recortamos el fondo automáticamente para dejarlas limpias.</span>
                          )}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-color)]/50 flex items-center justify-between text-xs">
                        <span className="text-[var(--foreground-tertiary)] font-medium">Estado real en tu cuenta:</span>
                        <span className={`font-bold ${stats.clothesCount >= 3 ? 'text-emerald-500' : 'text-[var(--brand-pink)]'}`}>
                          {stats.clothesCount >= 3 ? `${stats.clothesCount} prendas subidas` : `${stats.clothesCount} de 3 prendas`}
                        </span>
                      </div>
                    </>
                  )}

                  {currentStep.id === 'create_outfit' && (
                    <>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[var(--brand-pink)]" />
                          <span>Outfits en tu armario</span>
                        </div>
                        <span className={`tabular-nums font-bold ${stats.outfitsCount >= 1 ? 'text-emerald-500' : 'text-[var(--brand-pink)]'}`}>
                          {stats.outfitsCount} / 1 look
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)]/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stats.outfitsCount >= 1 ? 'bg-emerald-500' : 'bg-[var(--brand-pink)]'
                          }`}
                          style={{ width: `${stats.outfitsCount >= 1 ? 100 : 0}%` }}
                        />
                      </div>

                      <div className="space-y-2 text-xs sm:text-[13px] text-[var(--foreground-secondary)] leading-relaxed">
                        <p>
                          {stats.outfitsCount >= 1 ? (
                            <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              ¡Completado! Ya has guardado {stats.outfitsCount} outfit{stats.outfitsCount > 1 ? 's' : ''} en tu armario.
                            </span>
                          ) : (
                            <span>Combina tus prendas en el lienzo interactivo, añade capas y guarda tu primer look en el armario o en el calendario.</span>
                          )}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-color)]/50 flex items-center justify-between text-xs">
                        <span className="text-[var(--foreground-tertiary)] font-medium">Estado real en tu cuenta:</span>
                        <span className={`font-bold ${stats.outfitsCount >= 1 ? 'text-emerald-500' : 'text-[var(--brand-pink)]'}`}>
                          {stats.outfitsCount >= 1 ? `${stats.outfitsCount} outfit${stats.outfitsCount > 1 ? 's' : ''} guardado${stats.outfitsCount > 1 ? 's' : ''}` : '0 outfits creados'}
                        </span>
                      </div>
                    </>
                  )}

                  {currentStep.id === 'talk_to_kloe' && (
                    <>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[var(--brand-pink)]" />
                          <span>Mensajes con Kloe</span>
                        </div>
                        <span className={`tabular-nums font-bold ${stats.messagesCount >= 1 ? 'text-emerald-500' : 'text-[var(--brand-pink)]'}`}>
                          {stats.messagesCount} / 1 mensaje
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)]/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stats.messagesCount >= 1 ? 'bg-emerald-500' : 'bg-[var(--brand-pink)]'
                          }`}
                          style={{ width: `${stats.messagesCount >= 1 ? 100 : 0}%` }}
                        />
                      </div>

                      <div className="space-y-2 text-xs sm:text-[13px] text-[var(--foreground-secondary)] leading-relaxed">
                        <p>
                          {stats.messagesCount >= 1 ? (
                            <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              ¡Completado! Has interactuado {stats.messagesCount} vez/veces con Kloe.
                            </span>
                          ) : (
                            <span>Pídele a Kloe que te arme un look con tu propia ropa: &ldquo;¿Qué me pongo hoy para salir?&rdquo; o &ldquo;Combina mis prendas&rdquo;.</span>
                          )}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-color)]/50 flex items-center justify-between text-xs">
                        <span className="text-[var(--foreground-tertiary)] font-medium">Estado real en tu cuenta:</span>
                        <span className={`font-bold ${stats.messagesCount >= 1 ? 'text-emerald-500' : 'text-[var(--brand-pink)]'}`}>
                          {stats.messagesCount >= 1 ? `${stats.messagesCount} mensaje${stats.messagesCount > 1 ? 's' : ''} enviado${stats.messagesCount > 1 ? 's' : ''}` : '0 mensajes enviados'}
                        </span>
                      </div>
                    </>
                  )}

                  {currentStep.id === 'create_post' && (
                    <>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-[var(--brand-pink)]" />
                          <span>Publicaciones en el feed</span>
                        </div>
                        <span className={`tabular-nums font-bold ${stats.postsCount >= 1 ? 'text-emerald-500' : 'text-[var(--brand-pink)]'}`}>
                          {stats.postsCount} / 1 post
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)]/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stats.postsCount >= 1 ? 'bg-emerald-500' : 'bg-[var(--brand-pink)]'
                          }`}
                          style={{ width: `${stats.postsCount >= 1 ? 100 : 0}%` }}
                        />
                      </div>

                      <div className="space-y-2 text-xs sm:text-[13px] text-[var(--foreground-secondary)] leading-relaxed">
                        <p>
                          {stats.postsCount >= 1 ? (
                            <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              ¡Completado! Ya has compartido {stats.postsCount} publicación{stats.postsCount > 1 ? 'es' : ''} en el feed.
                            </span>
                          ) : (
                            <span>Sube una foto de tu look al feed comunitario, etiqueta tus prendas y comparte tu estilo con otros usuarios.</span>
                          )}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-color)]/50 flex items-center justify-between text-xs">
                        <span className="text-[var(--foreground-tertiary)] font-medium">Estado real en tu cuenta:</span>
                        <span className={`font-bold ${stats.postsCount >= 1 ? 'text-emerald-500' : 'text-[var(--brand-pink)]'}`}>
                          {stats.postsCount >= 1 ? `${stats.postsCount} publicación${stats.postsCount > 1 ? 'es' : ''} en tu perfil` : '0 publicaciones en tu perfil'}
                        </span>
                      </div>
                    </>
                  )}

                  {currentStep.id === 'style_preferences' && (
                    <>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-[var(--brand-pink)]" />
                          <span>Tus gustos y estilos</span>
                        </div>
                        <span className={`tabular-nums font-bold ${hasStyle ? 'text-emerald-500' : 'text-[var(--brand-pink)]'}`}>
                          {hasStyle ? '1 / 1' : '0 / 1'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)]/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            hasStyle ? 'bg-emerald-500' : 'bg-[var(--brand-pink)]'
                          }`}
                          style={{ width: `${hasStyle ? 100 : 0}%` }}
                        />
                      </div>

                      <div className="space-y-2 text-xs sm:text-[13px] text-[var(--foreground-secondary)] leading-relaxed">
                        <p>
                          {hasStyle ? (
                            <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              ¡Completado! Tus estilos preferidos están configurados y afinan las recomendaciones.
                            </span>
                          ) : (
                            <span>Elige los estilos de moda que más te gusten para personalizar el feed y el criterio de Kloe.</span>
                          )}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-color)]/50 flex items-center justify-between text-xs">
                        <span className="text-[var(--foreground-tertiary)] font-medium">Estado real en tu cuenta:</span>
                        <span className={`font-bold ${hasStyle ? 'text-emerald-500' : 'text-[var(--brand-pink)]'}`}>
                          {hasStyle ? 'Estilos definidos' : 'Pendiente de definir'}
                        </span>
                      </div>
                    </>
                  )}

                  {currentStep.id === 'avatar' && (
                    <>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-[var(--brand-pink)]" />
                          <span>Foto de perfil</span>
                        </div>
                        <span className={`tabular-nums font-bold ${hasAvatar ? 'text-emerald-500' : 'text-[var(--brand-pink)]'}`}>
                          {hasAvatar ? '1 / 1' : '0 / 1'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)]/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            hasAvatar ? 'bg-emerald-500' : 'bg-[var(--brand-pink)]'
                          }`}
                          style={{ width: `${hasAvatar ? 100 : 0}%` }}
                        />
                      </div>

                      <div className="space-y-2 text-xs sm:text-[13px] text-[var(--foreground-secondary)] leading-relaxed">
                        <p>
                          {hasAvatar ? (
                            <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              ¡Completado! Tu foto de perfil personalizada está activa.
                            </span>
                          ) : (
                            <span>Añade una foto de perfil para que tus amigos y la comunidad te reconozcan fácilmente.</span>
                          )}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-color)]/50 flex items-center justify-between text-xs">
                        <span className="text-[var(--foreground-tertiary)] font-medium">Estado real en tu cuenta:</span>
                        <span className={`font-bold ${hasAvatar ? 'text-emerald-500' : 'text-[var(--brand-pink)]'}`}>
                          {hasAvatar ? 'Foto de perfil activa' : 'Avatar pendiente'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Quick overview of all 6 steps checklist matching ProfileProgressBar */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {TOUR_STEPS.map((s, idx) => {
                    const isDone = completedSteps.includes(s.id);
                    const isCur = idx === currentStepIndex;

                    return (
                      <button
                        key={s.id}
                        onClick={() => goToStep(idx)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isCur
                            ? 'bg-[var(--brand-pink)]/10 border-[var(--brand-pink)] text-[var(--foreground)] ring-1 ring-[var(--brand-pink)]/40'
                            : isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-[var(--background-secondary)]/40 border-[var(--border-color)]/40 text-[var(--foreground-tertiary)] hover:border-[var(--border-color)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isDone ? 'bg-emerald-500 text-white' : 'border border-[var(--border-color)]'
                          }`}>
                            {isDone && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                          </div>
                          <span className="text-xs font-medium truncate">{s.shortTitle}</span>
                        </div>
                        <span className={`text-[10px] font-bold tabular-nums shrink-0 ml-1.5 ${
                          isDone ? 'text-emerald-500' : 'text-[var(--foreground-tertiary)]'
                        }`}>
                          {getStepMetricBadge(s.id)}
                        </span>
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
                  className="w-11 h-11 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] hover:border-[var(--brand-pink)]/40 hover:text-[var(--brand-pink)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--foreground)] transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
                  aria-label="Paso anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleAction}
                  className="flex-1 h-11 px-5 rounded-full kz-pink-surface border border-white/25 shadow-[0_6px_20px_rgba(255,102,196,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer touch-manipulation select-none"
                >
                  <span>{getActionButtonText()}</span>
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={currentStepIndex === TOUR_STEPS.length - 1}
                  className="w-11 h-11 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] hover:border-[var(--brand-pink)]/40 hover:text-[var(--brand-pink)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--foreground)] transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
                  aria-label="Siguiente paso"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Tour Guide Widget (Pill) while tour is active (hidden on /closet, /profile, and /closet/kloe when attachments move it inline) */}
      <AnimatePresence>
        {isTourActive && !isOpen && pathname !== '/closet' && !pathname.startsWith('/profile') && !(pathname.startsWith('/closet/kloe') && hasKloeAttachments) && (() => {
          const isKloePage = pathname.startsWith('/closet/kloe');
          const isFeedPage = pathname === '/feed';

          const containerClass = isFeedPage
            ? 'fixed top-[calc(env(safe-area-inset-top,0px)+14px)] left-4 right-4 flex justify-center md:justify-end md:top-auto md:left-auto md:bottom-6 md:right-36 z-[4500] pointer-events-none'
            : isKloePage
            ? 'fixed bottom-[calc(154px+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(162px+env(safe-area-inset-bottom,0px))] md:bottom-[92px] left-4 right-4 md:left-[72px] flex justify-center z-[4500] pointer-events-none'
            : 'fixed bottom-[calc(94px+env(safe-area-inset-bottom,0px))] left-4 right-4 flex justify-center md:justify-end md:left-auto md:bottom-6 md:right-6 z-[4500] pointer-events-none';

          return (
            <motion.div
              initial={{ opacity: 0, y: isFeedPage ? -20 : 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: isFeedPage ? -20 : 24, scale: 0.95 }}
              className={containerClass}
            >
              <button
                onClick={openTour}
                className={
                  isKloePage
                    ? 'pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--brand-pink)]/40 shadow-lg shadow-[var(--brand-pink)]/15 hover:border-[var(--brand-pink)] transition-all group active:scale-95 cursor-pointer'
                    : 'pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--brand-pink)]/40 shadow-xl shadow-[var(--brand-pink)]/15 hover:border-[var(--brand-pink)] transition-all group active:scale-95 cursor-pointer'
                }
              >
                <div
                  className={
                    isKloePage
                      ? 'w-5.5 h-5.5 rounded-full bg-[var(--brand-pink)] text-white flex items-center justify-center font-bold text-[10px] shrink-0 tabular-nums'
                      : 'w-7 h-7 rounded-full bg-[var(--brand-pink)] text-white flex items-center justify-center font-bold text-xs shrink-0 tabular-nums'
                  }
                >
                  {currentStepIndex + 1}/{TOUR_STEPS.length}
                </div>
                <div className="text-left">
                  <span
                    className={
                      isKloePage
                        ? 'text-[9px] uppercase tracking-wider font-bold text-[var(--brand-pink)] block leading-none'
                        : 'text-[10px] uppercase tracking-wider font-bold text-[var(--brand-pink)] block leading-tight'
                    }
                  >
                    Primeros pasos
                  </span>
                  <span
                    className={
                      isKloePage
                        ? 'text-[11px] font-semibold text-[var(--foreground)] block leading-tight mt-0.5 truncate max-w-[130px] sm:max-w-[170px]'
                        : 'text-xs font-semibold text-[var(--foreground)] block leading-tight truncate max-w-[150px] sm:max-w-[200px]'
                    }
                  >
                    {currentStep.shortTitle}
                  </span>
                </div>
                <ChevronRight
                  className={
                    isKloePage
                      ? 'w-3.5 h-3.5 text-[var(--brand-pink)] group-hover:translate-x-0.5 transition-transform shrink-0'
                      : 'w-4 h-4 text-[var(--brand-pink)] group-hover:translate-x-0.5 transition-transform shrink-0'
                  }
                />
              </button>
            </motion.div>
          );
        })()}
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
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold leading-tight">{celebrationTitle}</h4>
              <p className="text-xs text-white/90 truncate mt-0.5">{celebrationMessage}</p>
            </div>
            <button
              onClick={handleCelebrationContinue}
              className="px-3.5 py-1.5 rounded-full bg-white text-emerald-700 font-bold text-xs hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
            >
              Continuar
            </button>
            <button
              onClick={hideCelebration}
              className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
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
