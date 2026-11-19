'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, Bookmark, Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import LikeBurstOverlay, { useLikeBurst } from '@/components/LikeBurstOverlay';

interface PostPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  initialImageUrl?: string | null;
  postTitle?: string;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
  isLiked?: boolean;
  onToggleLike?: (e: React.MouseEvent) => void;
  hideSaveButton?: boolean;
  sourceRect?: { top: number; left: number; width: number; height: number } | null;
}

export default function PostPreviewModal({
  isOpen,
  onClose,
  postId,
  initialImageUrl,
  postTitle,
  isSaved = false,
  onToggleSave,
  isLiked = false,
  onToggleLike,
  hideSaveButton = false,
  sourceRect = null,
}: PostPreviewModalProps) {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [postImage, setPostImage] = useState<string | null>(initialImageUrl || null);
  const [outfitImage, setOutfitImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSavedState, setIsSavedState] = useState<boolean>(isSaved);
  const [isLikedState, setIsLikedState] = useState<boolean>(isLiked);
  const { burst: likeBurst, triggerBurst: triggerLikeBurst } = useLikeBurst();
  const lastTapRef = useRef<number>(0);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const hasSwiped = useRef<boolean>(false);

  // Compute fluid launch animation originating from the clicked post card
  const getInitialOrigin = () => {
    if (!sourceRect || typeof window === 'undefined') {
      return { x: 0, y: 30, scale: 0.85, opacity: 0 };
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const targetWidth = Math.min(340, windowWidth - 32);

    const targetCenterX = windowWidth / 2;
    const targetCenterY = windowHeight / 2;

    const sourceCenterX = sourceRect.left + sourceRect.width / 2;
    const sourceCenterY = sourceRect.top + sourceRect.height / 2;

    const deltaX = sourceCenterX - targetCenterX;
    const deltaY = sourceCenterY - targetCenterY;
    const initialScale = Math.max(0.35, Math.min(0.9, sourceRect.width / targetWidth));

    return {
      x: deltaX,
      y: deltaY,
      scale: initialScale,
      opacity: 0.4,
    };
  };

  useEffect(() => {
    setIsSavedState(isSaved);
  }, [isSaved]);

  useEffect(() => {
    setIsLikedState(isLiked);
  }, [isLiked]);

  // Fetch complete post & linked outfit from database on open
  useEffect(() => {
    if (!isOpen || !postId) return;

    let isMounted = true;
    setActiveSlide(0);
    setLoading(true);

    const fetchPostAndOutfit = async () => {
      try {
        const { data: postData } = await supabase
          .from('posts')
          .select(`
            id, image_url, outfit_id,
            outfits ( id, name, image_url )
          `)
          .eq('id', postId)
          .maybeSingle();

        if (!isMounted) return;

        const resolvedPostImage = postData?.image_url || initialImageUrl || null;
        setPostImage(resolvedPostImage);

        let resolvedOutfitImage: string | null = null;
        if (postData?.outfits && (postData.outfits as any).image_url) {
          resolvedOutfitImage = (postData.outfits as any).image_url;
        } else if (postData?.outfit_id) {
          // Fallback: check outfit_items
          const { data: outfitItems } = await supabase
            .from('outfit_items')
            .select('clothing_items(image_url)')
            .eq('outfit_id', postData.outfit_id)
            .limit(1);

          if (outfitItems && outfitItems.length > 0) {
            resolvedOutfitImage = (outfitItems[0] as any)?.clothing_items?.image_url || null;
          }
        }

        setOutfitImage(resolvedOutfitImage);
      } catch (err) {
        console.error('[PostPreviewModal] Error fetching post preview:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPostAndOutfit();

    return () => {
      isMounted = false;
    };
  }, [isOpen, postId, initialImageUrl]);

  // Keyboard shortcut to close (ESC)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Touch Swipe Handlers for smooth back and forth image exploration & swipe-down to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = e.targetTouches[0].clientX;
    hasSwiped.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    if (touchStartY.current !== null) {
      const currentY = e.targetTouches[0].clientY;
      const diffY = currentY - touchStartY.current;
      if (diffY > 60) {
        hasSwiped.current = true;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distanceX = touchStartX.current - touchEndX.current;
      const minSwipeDistance = 30;

      if (Math.abs(distanceX) > minSwipeDistance) {
        hasSwiped.current = true;
        if (distanceX > 0 && outfitImage) {
          // Swiped left -> show outfit
          setActiveSlide(1);
        } else if (distanceX < 0) {
          // Swiped right -> show post
          setActiveSlide(0);
        }
        touchStartX.current = null;
        touchEndX.current = null;
        touchStartY.current = null;
        return;
      }
    }

    // Swipe down to dismiss
    if (touchStartY.current !== null) {
      const currentY = e.changedTouches?.[0]?.clientY ?? null;
      if (currentY !== null && currentY - touchStartY.current > 70) {
        hasSwiped.current = true;
        touchStartX.current = null;
        touchEndX.current = null;
        touchStartY.current = null;
        onClose();
        return;
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;

    // Support double-tap to like on touchscreen preview
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      lastTapRef.current = 0;
      hasSwiped.current = true; // prevent card tap navigation
      triggerLikeBurst();
      if (!isLikedState) {
        setIsLikedState(true);
        onToggleLike?.(e as unknown as React.MouseEvent);
      }
      return;
    }
    lastTapRef.current = now;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (hasSwiped.current) {
      hasSwiped.current = false;
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    onClose();
    router.push(`/post/${postId}`);
  };

  const handleQuickSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsSavedState(!isSavedState);
    if (onToggleSave) {
      onToggleSave(e);
    }
  };

  const handleQuickLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const nextLiked = !isLikedState;
    setIsLikedState(nextLiked);
    if (nextLiked) {
      triggerLikeBurst();
    }
    if (onToggleLike) {
      onToggleLike(e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 selection:bg-[var(--brand-pink)] selection:text-white"
          onClick={onClose}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {/* Translucent Blurred Backdrop - Tap outside closes immediately */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-xl dark:bg-black/65 cursor-pointer"
            onClick={onClose}
          />

          {/* Close button in top right for instant touch dismiss */}
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.90 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            aria-label="Cerrar vista previa"
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-colors cursor-pointer select-none touch-manipulation"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>

          {/* Modal Card with Spring Expand Animation from Post Card Position */}
          <motion.div
            initial={getInitialOrigin()}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={getInitialOrigin()}
            transition={{
              type: 'spring',
              stiffness: 340,
              damping: 28,
              mass: 0.8,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative z-10 w-full max-w-[340px] sm:max-w-[380px] aspect-[3/4] sm:aspect-[4/5] rounded-[36px] overflow-hidden shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] border border-white/20 dark:border-white/15 bg-[#121216] cursor-pointer group"
          >
            {/* Sliding Image Container */}
            <div
              onDoubleClick={(e) => {
                e.stopPropagation();
                triggerLikeBurst();
                if (!isLikedState) {
                  setIsLikedState(true);
                  onToggleLike?.(e);
                }
              }}
              className="relative w-full h-full overflow-hidden select-none"
            >
              <LikeBurstOverlay burst={likeBurst} size="lg" />

              {/* Smooth interactive horizontal sliding track */}
              <motion.div
                className="flex w-full h-full"
                animate={{ x: activeSlide === 0 ? '0%' : '-100%' }}
                transition={{ type: 'spring', stiffness: 360, damping: 32, mass: 0.8 }}
              >
                {/* Slide 0: Post Photo */}
                <div className="w-full h-full flex-shrink-0 relative">
                  {postImage ? (
                    <Image
                      src={postImage}
                      alt={postTitle || 'Post preview'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                      quality={85}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white/60">
                      {loading ? <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-pink)]" /> : 'Sin imagen'}
                    </div>
                  )}
                </div>

                {/* Slide 1: Outfit Photo */}
                {outfitImage && (
                  <div className="w-full h-full flex-shrink-0 relative">
                    <Image
                      src={outfitImage}
                      alt="Outfit preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                      quality={85}
                      priority
                    />
                  </div>
                )}
              </motion.div>

              {/* Bottom Pagination Dots */}
              {outfitImage && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 pointer-events-auto">
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide(0);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeSlide === 0 ? 'bg-[var(--brand-pink)] w-6' : 'bg-white/50 w-2 hover:bg-white'
                      }`}
                      aria-label="Ver foto de la publicación"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide(1);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeSlide === 1 ? 'bg-[var(--brand-pink)] w-6' : 'bg-white/50 w-2 hover:bg-white'
                      }`}
                      aria-label="Ver foto del look"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Floating Action Buttons: Like & Save */}
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ delay: 0.08, duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="relative z-20 mt-4 flex items-center justify-center gap-3"
          >
            {/* Like Button */}
            <motion.button
              type="button"
              onClick={handleQuickLike}
              whileTap={{ scaleX: 1.08, scaleY: 0.90 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-colors cursor-pointer select-none touch-manipulation",
                isLikedState
                  ? "bg-[var(--brand-pink)] text-white border-white/20 shadow-[0_8px_24px_rgba(255,102,196,0.45),inset_0_1px_0_rgba(255,255,255,0.4)]"
                  : "bg-black/90 text-white hover:bg-black border-white/15 dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]"
              )}
              aria-label={isLikedState ? "Quitar me gusta" : "Me gusta"}
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isLikedState ? "fill-white text-white scale-110" : "text-white dark:text-black"
                )}
                strokeWidth={isLikedState ? 0 : 2.2}
              />
            </motion.button>

            {/* Save Button */}
            {!hideSaveButton && (
              <motion.button
                type="button"
                onClick={handleQuickSave}
                whileTap={{ scaleX: 1.08, scaleY: 0.90 }}
                transition={{ type: "spring", stiffness: 600, damping: 20 }}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-colors cursor-pointer select-none touch-manipulation",
                  isSavedState
                    ? "bg-[var(--brand-pink)] text-white border-white/20 shadow-[0_8px_24px_rgba(255,102,196,0.45),inset_0_1px_0_rgba(255,255,255,0.4)]"
                    : "bg-black/90 text-white hover:bg-black border-white/15 dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]"
                )}
                aria-label={isSavedState ? "Guardado" : "Guardar"}
              >
                <Bookmark
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isSavedState ? "fill-white text-white scale-110" : "text-white dark:text-black"
                  )}
                  strokeWidth={2.2}
                />
              </motion.button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
