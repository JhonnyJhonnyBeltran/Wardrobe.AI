'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import { useUiStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptic';

export interface Post {
    id: string;
    imageUrl: string | null;
    title: string;
    author: {
        name: string;
        avatar: string;
    };
    likes: number;
    comments: number;
    isLiked?: boolean;
    isSaved?: boolean;
    description?: string; // Add description for text-only posts
    isSuggested?: boolean; // Indicate if post is a recommendation
}

interface PostCardProps {
    post: Post;
    onClick?: () => void;
    hideSaveButton?: boolean;
}

/**
 * PostCard - Minimalista estilo Pinterest via User Request.
 * Sin botones visibles. Clic navega al detalle.
 */
export default function PostCard({ post, onClick, hideSaveButton = false }: PostCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isSavedState, setIsSavedState] = useState(post.isSaved || false);
    const [isLongPressing, setIsLongPressing] = useState(false);
    const { showSaveToast, openFolderModal, triggerRefetch } = useUiStore();
    const router = useRouter();

    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsSavedState(post.isSaved || false);
    }, [post.isSaved]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (hideSaveButton) return;
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        longPressTimer.current = setTimeout(() => {
            haptics.heavy();
            setIsLongPressing(true);
        }, 500); // 500ms to trigger long press
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const handleTouchMove = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const handleNavigation = (e: React.MouseEvent) => {
        if (isLongPressing) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        if (onClick) {
            onClick();
        } else {
            router.push(`/post/${post.id}`);
        }
    };

    const toggleQuickSave = async (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLongPressing) {
            setIsLongPressing(false); // Close overlay after saving in mobile
        }

        const previousState = isSavedState;
        setIsSavedState(!previousState);

        if (!previousState) {
            // Optimistic save
            showSaveToast({
                message: "Guardado",
                actionLabel: "Añadir a carpeta",
                onAction: () => openFolderModal(post.id)
            });

            try {
                const res = await fetch('/api/saves', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ post_id: post.id })
                });
                if (!res.ok) throw new Error('Save failed');
                triggerRefetch();
            } catch (err) {
                console.error(err);
                setIsSavedState(previousState);
            }
        } else {
            // Unsave
            try {
                const res = await fetch(`/api/saves?post_id=${post.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Unsave failed');
                triggerRefetch();
            } catch (err) {
                console.error(err);
                setIsSavedState(previousState);
            }
        }
    };

    // If no image, show text card
    if (!post.imageUrl) {
        return (
            <div onClick={handleNavigation} className="block w-full h-full outline-none">
                <div
                    className="group relative rounded-2xl overflow-hidden bg-[var(--card-bg)] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer p-6 flex flex-col gap-4 border border-[var(--border-color)] h-full w-full"
                >
                    <div className="flex items-center gap-2">
                        <Avatar src={post.author.avatar || null} alt={post.author.name} size="sm" />
                        <span className="text-xs font-medium text-[var(--foreground-secondary)]">{post.author.name}</span>
                    </div>
                    <p className="text-[var(--foreground)] font-serif text-lg leading-relaxed line-clamp-4">
                        {post.title || post.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs mt-auto">
                        <Heart className={cn("w-3 h-3 transition-colors", post.isLiked ? "fill-[var(--brand-pink)] text-[var(--brand-pink)]" : "text-[var(--foreground-tertiary)]")} />
                        <span className={cn(post.isLiked ? "text-[var(--brand-pink)] font-medium" : "text-[var(--foreground-tertiary)]")}>{post.likes}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <AnimatePresence>
                {isLongPressing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[6010]"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsLongPressing(false);
                        }}
                    />
                )}
            </AnimatePresence>

            <motion.div
                onClick={handleNavigation}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                animate={isLongPressing ? { scale: 1.05, y: -20, zIndex: 6020 } : { scale: 1, y: 0, zIndex: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn("w-full h-full relative z-10", isLongPressing ? "z-[6020]" : "")}
            >
                <div
                    className="group relative rounded-2xl overflow-hidden bg-[var(--card-bg)] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full w-full"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="relative w-full h-full flex flex-col pointer-events-none">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            width={500}
                            height={600}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                        {post.isSuggested && (
                            <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full border border-white/30 flex items-center gap-1 shadow-sm">
                                <span className="text-[10px] font-semibold text-white tracking-wide uppercase">Para ti</span>
                            </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-2 text-white/90">
                                <Avatar src={post.author.avatar || null} alt={post.author.name} size="xs" className="border border-white/20" />
                                <span className="text-xs font-medium truncate max-w-[100px]">{post.author.name}</span>
                            </div>
                            {(post.likes > 0 || post.isLiked) && (
                                <div className="flex items-center gap-1 text-white/90 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/5">
                                    <Heart className={cn("w-3 h-3 transition-colors", post.isLiked ? "fill-[var(--brand-pink)] text-[var(--brand-pink)]" : "fill-white/50 text-white/50")} />
                                    <span className={cn("text-xs font-medium", post.isLiked && "text-[var(--brand-pink)]")}>{post.likes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {!hideSaveButton && (
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-3 right-3 hidden md:block z-[40]"
                                >
                                    <button
                                        onClick={toggleQuickSave}
                                        className="bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--border-color)] p-2.5 rounded-full hover:scale-105 hover:shadow-lg transition-all"
                                    >
                                        <Bookmark className={cn("w-5 h-5", isSavedState ? "fill-[var(--brand-pink)] text-[var(--brand-pink)]" : "text-[var(--foreground)]")} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

                {!hideSaveButton && (
                    <AnimatePresence>
                        {isLongPressing && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-max bg-[#1c1c1c] text-white px-5 py-3 rounded-full flex items-center justify-center gap-2 shadow-2xl z-[6030]"
                            >
                                <button
                                    onClick={toggleQuickSave}
                                    className="flex items-center gap-2"
                                >
                                    <Bookmark className={cn("w-5 h-5", isSavedState ? "fill-[var(--brand-pink)] text-[var(--brand-pink)]" : "text-white")} />
                                    <span className="font-medium text-sm">{isSavedState ? "Guardado" : "Guardar"}</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </motion.div>
        </>
    );
}
