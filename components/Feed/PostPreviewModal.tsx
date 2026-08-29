'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, Layers, Loader2, ExternalLink, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface PostPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  initialImageUrl?: string | null;
  postTitle?: string;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
  hideSaveButton?: boolean;
}

export default function PostPreviewModal({
  isOpen,
  onClose,
  postId,
  initialImageUrl,
  postTitle,
  isSaved = false,
  onToggleSave,
  hideSaveButton = false,
}: PostPreviewModalProps) {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [postImage, setPostImage] = useState<string | null>(initialImageUrl || null);
  const [outfitImage, setOutfitImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSavedState, setIsSavedState] = useState<boolean>(isSaved);

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
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, outfitImage]);

  const handleCardClick = (e: React.MouseEvent) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 selection:bg-[var(--brand-pink)] selection:text-white">
          {/* Blurred Backdrop - Covers entire screen including navbars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            onClick={onClose}
          />

          {/* Modal Card with Spring Expand Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.82, y: 30 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            onClick={handleCardClick}
            className="relative z-10 w-full max-w-[340px] sm:max-w-[380px] aspect-[3/4] sm:aspect-[4/5] rounded-[36px] overflow-hidden shadow-[0_30px_90px_-15px_rgba(0,0,0,0.9)] border border-white/20 bg-[#121216] cursor-pointer group"
          >
            {/* Sliding Image Container */}
            <div className="relative w-full h-full overflow-hidden">
              <AnimatePresence initial={false} mode="wait">
                {activeSlide === 0 ? (
                  <motion.div
                    key="post-slide"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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

              {/* Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Top Status Pill */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="bg-black/50 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  {activeSlide === 0 ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                      <span className="text-xs font-semibold text-white tracking-wide">Publicación</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                      <span className="text-xs font-semibold text-white tracking-wide">Look Completo</span>
                    </>
                  )}
                </div>

                <div className="bg-black/50 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg text-white/90">
                  <span className="text-[11px] font-medium">Tocar para abrir</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {/* Bottom Pagination Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
                {outfitImage && (
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide(0);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeSlide === 0 ? 'bg-[var(--brand-pink)] w-5' : 'bg-white/40'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide(1);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeSlide === 1 ? 'bg-[var(--brand-pink)] w-5' : 'bg-white/40'
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Save Floating Pill Button */}
          {!hideSaveButton && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="relative z-20 mt-4"
            >
              <button
                type="button"
                onClick={handleQuickSave}
                className="bg-black hover:bg-neutral-900 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 px-7 py-3.5 rounded-full flex items-center gap-2.5 shadow-2xl backdrop-blur-xl border border-black/10 dark:border-white/20 active:scale-95 transition-all font-semibold text-sm tracking-wide"
              >
                <Bookmark className={`w-5 h-5 transition-colors ${isSavedState ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'text-white dark:text-black'}`} />
                <span>{isSavedState ? 'Guardado' : 'Guardar'}</span>
              </button>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
