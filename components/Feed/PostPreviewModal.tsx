'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, Bookmark, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';

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

  // Auto-slide to outfit image after 3 seconds if available
  useEffect(() => {
    if (!isOpen || !outfitImage) return;

    const timer = setTimeout(() => {
      setActiveSlide(1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isOpen, outfitImage]);

  // Touch Swipe Handlers for smooth back and forth image exploration
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    hasSwiped.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distanceX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35;

    if (Math.abs(distanceX) > minSwipeDistance) {
      hasSwiped.current = true;
      if (distanceX > 0 && outfitImage) {
        // Deslizar a la izquierda: Ir al outfit
        setActiveSlide(1);
      } else if (distanceX < 0) {
        // Deslizar a la derecha: Volver a la foto del post
        setActiveSlide(0);
      }
    }
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
    setIsLikedState(!isLikedState);
    if (onToggleLike) {
      onToggleLike(e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 selection:bg-[var(--brand-pink)] selection:text-white">
          {/* Translucent Blurred Backdrop - Lets the page content and navbar show through blurred smoothly */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-xl dark:bg-black/50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          />

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
            onClick={handleCardClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative z-10 w-full max-w-[340px] sm:max-w-[380px] aspect-[3/4] sm:aspect-[4/5] rounded-[36px] overflow-hidden shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] border border-white/20 dark:border-white/15 bg-[#121216] cursor-pointer group"
          >
            {/* Sliding Image Container without foggy vignette */}
            <div className="relative w-full h-full overflow-hidden select-none">
              <AnimatePresence initial={false} mode="wait">
                {activeSlide === 0 ? (
                  <motion.div
                    key="post-slide"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -80 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {postImage ? (
                      <Image
                        src={postImage}
                        alt={postTitle || 'Post preview'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 90vw, 380px"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white/60">
                        {loading ? <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-pink)]" /> : 'Sin imagen'}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="outfit-slide"
                    initial={{ opacity: 0, x: 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {outfitImage ? (
                      <Image
                        src={outfitImage}
                        alt="Outfit preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 90vw, 380px"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white/60">
                        Look no disponible
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Pagination Dots */}
              {outfitImage && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide(0);
                      }}
                      className={`h-2 rounded-full transition-all ${
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
                      className={`h-2 rounded-full transition-all ${
                        activeSlide === 1 ? 'bg-[var(--brand-pink)] w-6' : 'bg-white/50 w-2 hover:bg-white'
                      }`}
                      aria-label="Ver foto del look"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Floating Action Buttons: Like & Save (Icon-only) */}
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="relative z-20 mt-4 flex items-center justify-center gap-3"
          >
            {/* Like Button */}
            <button
              type="button"
              onClick={handleQuickLike}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl border active:scale-90 transition-all duration-200",
                isLikedState
                  ? "bg-[var(--brand-pink)] text-white border-[var(--brand-pink)]/40 shadow-[0_4px_20px_rgba(236,72,153,0.45)]"
                  : "bg-black text-white hover:bg-neutral-900 border-black/10 dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:border-white/20"
              )}
              aria-label={isLikedState ? "Quitar me gusta" : "Me gusta"}
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isLikedState ? "fill-white text-white scale-110" : "text-white dark:text-black"
                )}
                strokeWidth={2.2}
              />
            </button>

            {/* Save Button (Icon-only) */}
            {!hideSaveButton && (
              <button
                type="button"
                onClick={handleQuickSave}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl border active:scale-90 transition-all duration-200",
                  isSavedState
                    ? "bg-[var(--brand-pink)] text-white border-[var(--brand-pink)]/40 shadow-[0_4px_20px_rgba(236,72,153,0.45)]"
                    : "bg-black text-white hover:bg-neutral-900 border-black/10 dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:border-white/20"
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
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
