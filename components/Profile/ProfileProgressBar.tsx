'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ChevronDown, ChevronUp, Plus, Camera, Layers, Bot, Share2, HelpCircle } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useProfileStore } from '@/store/profileStore';
import { useTourStore } from '@/store/tourStore';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ProfileProgressBar() {
  const { user } = useUser();
  const { items } = useWardrobeStore();
  const { profileStats, posts } = useProfileStore();
  const { openTour, completedSteps, markStepComplete, completeTour } = useTourStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const isEthan = useMemo(() => {
    if (!user) return false;
    return Boolean(
      user.email?.toLowerCase().includes('ethan') ||
      user.username?.toLowerCase() === 'ethan' ||
      (user as any)?.isEthanUser
    );
  }, [user]);

  // Check if Kloe has been used from local storage
  const hasKloeFromStorage = useMemo(() => {
    if (typeof window === 'undefined' || !user?.id) return false;
    try {
      const raw = localStorage.getItem(`kloe_conversations_${user.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.some((c: any) => c.messages && c.messages.length > 0)) {
          return true;
        }
      }
      const trialRaw = localStorage.getItem(`kloe_trial_used_${user.id}`);
      if (trialRaw && parseInt(trialRaw, 10) > 0) return true;
    } catch {}
    return false;
  }, [user?.id]);

  const hasKloeFromProfile = Boolean(
    (user as any)?.notification_preferences?.kloe_conversations?.length > 0 ||
    ((user as any)?.kloe_trial_messages_used && (user as any).kloe_trial_messages_used > 0) ||
    ((user as any)?.trial_messages_used && (user as any).trial_messages_used > 0) ||
    ((user?.kloeTrialMessagesUsed ?? 0) > 0)
  );

  // Cached & live milestone flags backed by database queries
  const [realMilestones, setRealMilestones] = useState<{
    hasOutfit: boolean;
    hasPost: boolean;
    hasKloe: boolean;
  }>(() => {
    if (typeof window === 'undefined' || !user?.id) {
      return { hasOutfit: false, hasPost: false, hasKloe: false };
    }
    if (isEthan) {
      return { hasOutfit: true, hasPost: true, hasKloe: true };
    }
    try {
      const raw = localStorage.getItem(`klozet_user_milestones_${user.id}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { hasOutfit: false, hasPost: false, hasKloe: false };
  });

  // Query Supabase for real account data (outfits, posts, kloe conversations)
  useEffect(() => {
    if (!user?.id) return;

    if (isEthan) {
      setRealMilestones({ hasOutfit: true, hasPost: true, hasKloe: true });
      try {
        localStorage.setItem(`klozet_user_milestones_${user.id}`, JSON.stringify({ hasOutfit: true, hasPost: true, hasKloe: true }));
      } catch {}
      return;
    }

    // If already marked as completed in localStorage, skip DB overhead
    if (typeof window !== 'undefined' && localStorage.getItem(`klozet_tour_completed_${user.id}`) === 'true') {
      setRealMilestones({ hasOutfit: true, hasPost: true, hasKloe: true });
      return;
    }

    let isMounted = true;
    const fetchRealData = async () => {
      try {
        const [outfitsRes, postsRes, profileRes] = await Promise.all([
          supabase.from('outfits').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('profiles').select('notification_preferences, kloe_trial_messages_used').eq('id', user.id).maybeSingle()
        ]);

        if (!isMounted) return;

        const outfitOk = (outfitsRes.count ?? 0) > 0;
        const postOk = (postsRes.count ?? 0) > 0;
        const notifs = (profileRes.data as any)?.notification_preferences;
        const kloeOk = (profileRes.data?.kloe_trial_messages_used ?? 0) > 0 ||
          Boolean(Array.isArray(notifs?.kloe_conversations) && notifs.kloe_conversations.length > 0) ||
          hasKloeFromStorage ||
          hasKloeFromProfile;

        setRealMilestones(prev => {
          const next = {
            hasOutfit: prev.hasOutfit || outfitOk,
            hasPost: prev.hasPost || postOk,
            hasKloe: prev.hasKloe || kloeOk
          };
          try {
            localStorage.setItem(`klozet_user_milestones_${user.id}`, JSON.stringify(next));
          } catch {}
          return next;
        });
      } catch (err) {
        console.warn('[ProfileProgressBar] Error fetching milestone counts:', err);
      }
    };

    fetchRealData();
    return () => { isMounted = false; };
  }, [user?.id, isEthan, hasKloeFromStorage, hasKloeFromProfile]);

  // Calculate completeness breakdown (100% clean sum)
  const hasStyle = Boolean(
    isEthan ||
    user?.styleCompleted ||
    (user?.preferredStyles && user.preferredStyles.length > 0) ||
    user?.age ||
    user?.gender
  );
  const hasAvatar = Boolean(isEthan || (user?.avatar && !user.avatar.includes('placeholder')));
  const has2Items = Boolean(isEthan || items.length >= 2);
  const hasOutfit = Boolean(
    isEthan ||
    realMilestones.hasOutfit ||
    completedSteps.includes('create_outfit') ||
    profileStats.posts > 0
  );
  const hasKloe = Boolean(
    isEthan ||
    realMilestones.hasKloe ||
    completedSteps.includes('talk_to_kloe') ||
    hasKloeFromStorage ||
    hasKloeFromProfile
  );
  const hasPost = Boolean(
    isEthan ||
    realMilestones.hasPost ||
    completedSteps.includes('create_post') ||
    posts.length > 0 ||
    profileStats.posts > 0
  );

  // Sync to tourStore automatically
  useEffect(() => {
    if (!user?.id) return;
    const store = useTourStore.getState();
    if (hasStyle && !completedSteps.includes('style_preferences')) {
      store.markStepComplete('style_preferences', undefined, false);
    }
    if (hasAvatar && !completedSteps.includes('avatar')) {
      store.markStepComplete('avatar', undefined, false);
    }
    if (has2Items && !completedSteps.includes('upload_clothes')) {
      store.markStepComplete('upload_clothes', undefined, false);
    }
    if (hasOutfit && !completedSteps.includes('create_outfit')) {
      store.markStepComplete('create_outfit', undefined, false);
    }
    if (hasKloe && !completedSteps.includes('talk_to_kloe')) {
      store.markStepComplete('talk_to_kloe', undefined, false);
    }
    if (hasPost && !completedSteps.includes('create_post')) {
      store.markStepComplete('create_post', undefined, false);
    }
  }, [user?.id, hasStyle, hasAvatar, has2Items, hasOutfit, hasKloe, hasPost, completedSteps]);

  if (!user) return null;

  // Check if account has already permanently completed the tutorial
  if (typeof window !== 'undefined' && user?.id) {
    if (localStorage.getItem(`klozet_tour_completed_${user.id}`) === 'true') {
      return null;
    }
  }

  let score = 0;
  if (hasStyle) score += 20;
  if (hasAvatar) score += 15;
  if (has2Items) score += 25;
  if (hasOutfit) score += 15;
  if (hasKloe) score += 10;
  if (hasPost) score += 15;

  const totalPercent = Math.min(100, score);

  // If 100% complete, mark completed forever and do not render (disappears completely and never returns)
  if (totalPercent >= 100) {
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(`klozet_tour_completed_${user.id}`, 'true');
      completeTour(user.id);
    }
    return null;
  }

  // Dynamic status text matching the exact missing milestone
  let statusMessage = '';
  if (!hasStyle) {
    statusMessage = `Nivel de estilo al ${totalPercent}% · Define tus vibes de moda`;
  } else if (!hasAvatar) {
    statusMessage = `Nivel de estilo al ${totalPercent}% · Sube tu mejor foto de perfil`;
  } else if (!has2Items) {
    const needed = Math.max(1, 2 - items.length);
    statusMessage = `Nivel de estilo al ${totalPercent}% · Sube ${needed} prenda${needed > 1 ? 's' : ''} más para combinar`;
  } else if (!hasOutfit) {
    statusMessage = `Nivel de estilo al ${totalPercent}% · Monta tu primer fit en el lienzo`;
  } else if (!hasKloe) {
    statusMessage = `Nivel de estilo al ${totalPercent}% · Pídele estilismo a Kloe`;
  } else if (!hasPost) {
    statusMessage = `Nivel de estilo al ${totalPercent}% · Sube tu primer fit a la comunidad`;
  } else {
    statusMessage = `Nivel de estilo al ${totalPercent}% · Caza nuevas tendencias`;
  }

  return (
    <div className="w-full my-3">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-2xl p-4 shadow-sm transition-all hover:border-[var(--border-color)]">
        {/* Header with percentage & toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-pink)]">
                  Nivel de estilo
                </span>
                <span className="text-xs font-semibold text-[var(--foreground)] tabular-nums">
                  {totalPercent}%
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-secondary)] font-medium truncate mt-0.5">
                {statusMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => openTour()}
              className="text-xs text-[var(--foreground-tertiary)] hover:text-[var(--brand-pink)] p-1.5 rounded-lg hover:bg-[var(--background-secondary)] transition-colors cursor-pointer"
              title="Abrir ruta de estilo"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] transition-colors cursor-pointer"
              aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress Bar Track: Solid Brand Color (NO gradient) */}
        <div className="w-full h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden mt-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-[var(--brand-pink)] shadow-[0_0_10px_rgba(255,45,120,0.3)]"
          />
        </div>

        {/* Expandable Checklist */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden pt-4 mt-3 border-t border-[var(--border-color)]/40 space-y-2.5"
            >
              {/* Task 1: Preferences */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    hasStyle ? 'bg-emerald-500 text-white' : 'border border-[var(--border-color)]'
                  }`}>
                    {hasStyle && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </div>
                  <span className={hasStyle ? 'text-[var(--foreground)] font-medium' : 'text-[var(--foreground-secondary)]'}>
                    Estilo y preferencias seleccionadas
                  </span>
                </div>
                {!hasStyle && (
                  <Link href="/onboarding/preferences" className="text-[var(--brand-pink)] font-semibold hover:underline">
                    Completar
                  </Link>
                )}
              </div>

              {/* Task 2: Avatar */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    hasAvatar ? 'bg-emerald-500 text-white' : 'border border-[var(--border-color)]'
                  }`}>
                    {hasAvatar && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </div>
                  <span className={hasAvatar ? 'text-[var(--foreground)] font-medium' : 'text-[var(--foreground-secondary)]'}>
                    Foto de perfil personalizada
                  </span>
                </div>
                {!hasAvatar && (
                  <Link href="/profile/edit" className="text-[var(--brand-pink)] font-semibold hover:underline">
                    Añadir foto
                  </Link>
                )}
              </div>

              {/* Task 3: Clothes */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    has2Items ? 'bg-emerald-500 text-white' : 'border border-[var(--border-color)]'
                  }`}>
                    {has2Items && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </div>
                  <span className={has2Items ? 'text-[var(--foreground)] font-medium' : 'text-[var(--foreground-secondary)]'}>
                    Añadir al menos 2 prendas al armario ({items.length}/2)
                  </span>
                </div>
                {!has2Items && (
                  <Link href="/closet?action=new-item" className="text-[var(--brand-pink)] font-semibold hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    <span>Subir prenda</span>
                  </Link>
                )}
              </div>

              {/* Task 4: Outfit on Canvas */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    hasOutfit ? 'bg-emerald-500 text-white' : 'border border-[var(--border-color)]'
                  }`}>
                    {hasOutfit && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </div>
                  <span className={hasOutfit ? 'text-[var(--foreground)] font-medium' : 'text-[var(--foreground-secondary)]'}>
                    Crear un outfit en el lienzo
                  </span>
                </div>
                {!hasOutfit && (
                  <Link href="/create" className="text-[var(--brand-pink)] font-semibold hover:underline">
                    Ir al lienzo
                  </Link>
                )}
              </div>

              {/* Task 5: Talk to Kloe */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    hasKloe ? 'bg-emerald-500 text-white' : 'border border-[var(--border-color)]'
                  }`}>
                    {hasKloe && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </div>
                  <span className={hasKloe ? 'text-[var(--foreground)] font-medium' : 'text-[var(--foreground-secondary)]'}>
                    Consultar asesoría y estilo con Kloe
                  </span>
                </div>
                {!hasKloe && (
                  <Link href="/closet/kloe" className="text-[var(--brand-pink)] font-semibold hover:underline">
                    Probar Kloe
                  </Link>
                )}
              </div>

              {/* Task 6: Community Post */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    hasPost ? 'bg-emerald-500 text-white' : 'border border-[var(--border-color)]'
                  }`}>
                    {hasPost && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </div>
                  <span className={hasPost ? 'text-[var(--foreground)] font-medium' : 'text-[var(--foreground-secondary)]'}>
                    Publicar un look en la comunidad
                  </span>
                </div>
                {!hasPost && (
                  <Link href="/create-post" className="text-[var(--brand-pink)] font-semibold hover:underline">
                    Publicar
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
