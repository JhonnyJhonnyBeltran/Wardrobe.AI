'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import { useUiStore } from '@/store/uiStore';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptic';
import PostPreviewModal from './PostPreviewModal';

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
    description?: string;
    isSuggested?: boolean;
}

interface PostCardProps {
    post: Post;
    onClick?: () => void;
    hideSaveButton?: boolean;
}

export default function PostCard({ post, onClick, hideSaveButton = false }: PostCardProps) {
    const { user } = useUser();
    const [isHovered, setIsHovered] = useState(false);
    const [isSavedState, setIsSavedState] = useState(post.isSaved || false);
    const [isLikedState, setIsLikedState] = useState(post.isLiked || false);
    const [likesCountState, setLikesCountState] = useState(post.likes || 0);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const { showSaveToast, openFolderModal, triggerRefetch } = useUiStore();
    const router = useRouter();

    const cardRef = useRef<HTMLDivElement>(null);
    const [sourceRect, setSourceRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const isLongPressedRef = useRef(false);

    useEffect(() => {
        setIsSavedState(post.isSaved || false);
    }, [post.isSaved]);

    useEffect(() => {
        setIsLikedState(post.isLiked || false);
        setLikesCountState(post.likes || 0);
    }, [post.isLiked, post.likes]);

    const handleTouchStart = () => {
        isLongPressedRef.current = false;
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        longPressTimer.current = setTimeout(() => {
            isLongPressedRef.current = true;
            if (cardRef.current) {
                const rect = cardRef.current.getBoundingClientRect();
                setSourceRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                });
            }
            try {
                haptics.heavy();
            } catch {}
            setShowPreviewModal(true);
        }, 450);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        setTimeout(() => {
            isLongPressedRef.current = false;
        }, 150);
    };

    const handleTouchMove = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const handleNavigation = (e: React.MouseEvent) => {
        if (isLongPressedRef.current) {
            isLongPressedRef.current = false;
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

        const previousState = isSavedState;
        setIsSavedState(!previousState);

        if (!previousState) {
            showSaveToast({
                message: "Guardado",
                actionLabel: "Añadir a carpeta",
                onAction: () => {
                    setShowPreviewModal(false);
                    openFolderModal(post.id);
                }
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

    const toggleQuickLike = async (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push('/login');
            return;
        }

        try {
            haptics.tap();
        } catch {}

        const previousState = isLikedState;
        const previousCount = likesCountState;

        setIsLikedState(!previousState);
        setLikesCountState(Math.max(0, previousState ? previousCount - 1 : previousCount + 1));

        try {
            if (previousState) {
                const { error } = await (supabase.from('likes') as any)
                    .delete()
                    .eq('post_id', post.id)
                    .eq('user_id', user.id);
                if (error) throw error;
            } else {
                const { error } = await (supabase.from('likes') as any)
                    .insert({ post_id: post.id, user_id: user.id });
                if (error) throw error;

                // Notify Author if not self
                const authorId = (post as any)?.author_id || (post as any)?.user_id;
                if (authorId && authorId !== user.id) {
                    try {
                        await (supabase.from('notifications') as any).insert({
                            user_id: authorId,
                            actor_id: user.id,
                            type: 'like',
                            entity_id: post.id,
                            read: false
                        });
                    } catch {}
                }
            }
            triggerRefetch();
        } catch (err) {
            console.error('Error toggling like:', err);
            setIsLikedState(previousState);
            setLikesCountState(previousCount);
        }
    };

    // If no image, show text card
    if (!post.imageUrl) {
        return (
            <div onClick={handleNavigation} className="block w-full h-full outline-none">
                <div className="group relative rounded-2xl overflow-hidden bg-[var(--card-bg)] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer p-6 flex flex-col gap-4 border border-[var(--border-color)] h-full w-full">
                    <div className="hidden md:flex items-center gap-2">
                        <Avatar src={post.author.avatar || null} alt={post.author.name} size="sm" />
                        <span className="text-xs font-medium text-[var(--foreground-secondary)]">{post.author.name}</span>
                    </div>
                    <p className="text-[var(--foreground)] font-serif text-lg leading-relaxed line-clamp-4">
                        {post.title || post.description}
                    </p>
                    <div className="hidden md:flex items-center gap-1 text-xs mt-auto">
                        <Heart className={cn("w-3.5 h-3.5 transition-colors", isLikedState ? "fill-[var(--brand-pink)] text-[var(--brand-pink)]" : "text-[var(--foreground-tertiary)]")} />
                        <span className={cn(isLikedState ? "text-[var(--brand-pink)] font-semibold" : "text-[var(--foreground-tertiary)]")}>{likesCountState}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <motion.div
                ref={cardRef}
                onClick={handleNavigation}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onTouchCancel={handleTouchEnd}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-full h-full relative z-10"
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

                        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                        {post.isSuggested && (
                            <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full border border-white/30 flex items-center gap-1 shadow-sm">
                                <span className="text-[10px] font-semibold text-white tracking-wide uppercase">Para ti</span>
                            </div>
                        )}

                        <div className={cn(
                            "absolute bottom-3 left-3 right-3 hidden md:flex items-center justify-between transition-opacity duration-300",
                            isLikedState ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                            <div className="flex items-center gap-2">
                                <Avatar src={post.author.avatar || null} alt={post.author.name} size="sm" />
                                <span className="text-xs font-semibold text-white truncate max-w-[120px] drop-shadow-md">{post.author.name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-white text-xs drop-shadow-md">
                                <Heart className={cn("w-4 h-4 transition-colors", isLikedState ? "fill-[var(--brand-pink)] text-[var(--brand-pink)]" : "text-white")} />
                                <span>{likesCountState}</span>
                            </div>
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
            </motion.div>

            {/* Fullscreen Mobile Long-Press Preview Modal */}
            <PostPreviewModal
                isOpen={showPreviewModal}
                onClose={() => {
                    setShowPreviewModal(false);
                    isLongPressedRef.current = false;
                }}
                postId={post.id}
                initialImageUrl={post.imageUrl}
                postTitle={post.title}
                isSaved={isSavedState}
                onToggleSave={toggleQuickSave}
                isLiked={isLikedState}
                onToggleLike={toggleQuickLike}
                hideSaveButton={hideSaveButton}
                sourceRect={sourceRect}
            />
        </>
    );
}
