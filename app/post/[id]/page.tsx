'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, MoreVertical, X, Send, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import * as followService from '@/lib/services/followService';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import Avatar from '@/components/Avatar';
import { useUiStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveOutfitViewer from '@/components/InteractiveOutfitViewer';
import ProductModal from '@/components/ProductModal';
import { haptics } from '@/lib/haptic';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user: {
        id: string;
        username: string;
        avatar_url: string;
    };
}

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const postId = params.id as string;

    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);

    // Interaction States
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showMobileComments, setShowMobileComments] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showSwipeHint, setShowSwipeHint] = useState(true);
    const [showOptions, setShowOptions] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ id: string, username: string } | null>(null);
    const [showHeartAnim, setShowHeartAnim] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const { showSaveToast, openFolderModal, setTabBarHidden, showModal } = useUiStore();

    // Sync mobile comments and item drawer visibility with global TabBar state
    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            const hasOverlayOpen = showMobileComments || !!selectedItem;
            
            if (isMobile) {
                setTabBarHidden(hasOverlayOpen);
            } else {
                setTabBarHidden(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            setTabBarHidden(false);
        };
    }, [showMobileComments, selectedItem, setTabBarHidden]);

    useBodyScrollLock(!!selectedItem);

    const commentInputRef = useRef<HTMLInputElement>(null);

    // Fetch Post Data
    useEffect(() => {
        if (!postId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                console.log('[PostDetail] Fetching data for post:', postId);

                // 1. Fetch Post Details
                const { data: postData, error: postError } = await supabase
                    .from('posts')
                    .select(`
                        id, caption, image_url, created_at, user_id, likes_count, comments_count,
                        profiles (id, username, avatar_url),
                        outfits (
                            id, name, image_url,
                            outfit_items (
                                position_x,
                                position_y,
                                scale,
                                rotation,
                                layer_order,
                                clothing_items (id, name, brand, image_url, color, color_hex, category, size, reference)
                            )
                        )
                    `)
                    .eq('id', postId as any)
                    .single();

                if (postError) {
                    console.error('[PostDetail] Post fetch error:', postError);
                    throw postError;
                }

                let likeRes: any = { data: [] }, saveRes: any = { data: [] }, followStatus = null;

                if (user) {
                    console.log('[PostDetail] Checking interactions for user:', user.id);
                    // 2. Fetch Interaction Status (Parallel)
                    const [l, s, f] = await Promise.all([
                        supabase.from('likes' as any).select('user_id').eq('post_id', postId).eq('user_id', user.id),
                        supabase.from('saves' as any).select('user_id').eq('post_id', postId).eq('user_id', user.id),
                        // @ts-ignore
                        followService.getFollowStatus(user.id, postData.user_id),
                    ]);
                    likeRes = l;
                    saveRes = s;
                    followStatus = f;
                    console.log('[PostDetail] Interaction results:', { 
                        liked: l.data && (l.data as any[]).length > 0,
                        saved: s.data && (s.data as any[]).length > 0,
                        likesError: l.error ? { message: l.error.message, details: l.error.details, code: l.error.code } : null,
                        savesError: s.error ? { message: s.error.message, details: s.error.details, code: s.error.code } : null
                    });
                } else {
                    console.log('[PostDetail] No user session found for interaction check');
                }

                // Comments
                const { data: commentsData } = await supabase
                    .from('comments' as any)
                    .select('id, content, created_at, user_id, profiles(id, username, avatar_url)')
                    .eq('post_id', postId)
                    .order('created_at', { ascending: true });

                setPost(postData);
                setIsLiked(likeRes.data && (likeRes.data as any[]).length > 0);
                setIsSaved(saveRes.data && (saveRes.data as any[]).length > 0);
                setIsFollowing(followStatus === 'accepted');
                setLikesCount((postData as any)?.likes_count || 0);

                // Format comments
                if (commentsData) {
                    setComments(commentsData.map((c: any) => ({
                        id: c.id,
                        content: c.content,
                        created_at: c.created_at,
                        user: {
                            id: c.profiles?.id,
                            username: c.profiles?.username || 'Usuario',
                            avatar_url: c.profiles?.avatar_url || null
                        }
                    })));
                }

            } catch (error: any) {
                console.error('Error fetching post:', error?.message || error?.details || JSON.stringify(error));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postId, user?.id]);


    // Build Slides Array
    const getSlides = useCallback(() => {
        const slides: { type: 'photo' | 'outfit'; url?: string; outfit?: any }[] = [];
        
        // 1. Photo Slide
        if (post?.image_url) {
            slides.push({ type: 'photo', url: post.image_url });
        }
        
        // 2. Outfit Slide
        if (post?.outfits) {
            const outfitData = Array.isArray(post.outfits) ? post.outfits[0] : post.outfits;
            if (outfitData) {
                slides.push({ type: 'outfit', outfit: outfitData });
            }
        }
        
        // Fallback
        if (slides.length === 0) {
            slides.push({ type: 'photo', url: '/placeholder.png' });
        }
        
        return slides;
    }, [post]);

    const slides = getSlides();
    const currentSlide = slides[activeSlide] || slides[0];
    
    // Normalize author data
    const authorRaw = post?.profiles;
    const author = Array.isArray(authorRaw) ? authorRaw[0] : (authorRaw || {});

    // Handle Interactions
    const toggleLike = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        const previousState = isLiked;
        const previousCount = likesCount;

        // Optimistic Update
        setIsLiked(!previousState);
        setLikesCount(previousState ? previousCount - 1 : previousCount + 1);

        try {
            let error = null;
            if (previousState) {
                const { error: deleteError } = await (supabase.from('likes') as any)
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', user.id);
                error = deleteError;
            } else {
                const { error: insertError } = await (supabase.from('likes') as any)
                    .insert({ post_id: postId, user_id: user.id });
                error = insertError;

                // Notify Author (if not self and insert succeeded)
                if (!insertError && (post as any)?.user_id !== user.id) {
                    try {
                        await (supabase.from('notifications') as any).insert({
                            user_id: (post as any).user_id,
                            actor_id: user.id,
                            type: 'like',
                            entity_id: postId
                        });
                    } catch (notificationError) {
                        console.error('Notification error:', notificationError);
                    }
                }
            }

            if (error) {
                console.error('Like error:', error);
                throw error;
            }

            // Sync total likes count in the 'posts' table for efficient popularity sorting
            const newCount = previousState ? Math.max(0, (post?.likes_count || 0) - 1) : (post?.likes_count || 0) + 1;
            await (supabase.from('posts') as any)
                .update({ likes_count: newCount })
                .eq('id', postId);

            router.refresh();
        } catch (error) {
            console.error('toggleLike error:', error);
            setIsLiked(previousState);
            setLikesCount(previousCount);
        }
    };

    const toggleSave = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        const previousState = isSaved;
        setIsSaved(!previousState);

        if (!previousState) {
            // Optimistic Quick Save
            showSaveToast({
                message: "Guardado",
                actionLabel: "Añadir a carpeta",
                onAction: () => openFolderModal(postId)
            });

            try {
                const res = await fetch('/api/saves', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ post_id: postId })
                });
                if (!res.ok) throw new Error('Failed to save');
                // router.refresh(); // Optional: depend on user behavior
            } catch (error) {
                console.error('Error saving:', error);
                setIsSaved(previousState); // Revert
            }
        } else {
            // Unsave
            try {
                const res = await fetch(`/api/saves?post_id=${postId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to unsave');
                // router.refresh();
            } catch (error) {
                console.error('Error unsaving:', error);
                setIsSaved(previousState); // Revert
            }
        }
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Klozet',
                    text: 'Mira esta publicación en Klozet',
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                showSaveToast({ message: "Enlace copiado", actionLabel: "" });
            }
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const toggleFollow = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        // @ts-ignore
        if (user.id === post.user_id) return;

        const previousState = isFollowing;
        setIsFollowing(!previousState);

        try {
            if (previousState) {
                // @ts-ignore
                await followService.unfollowUser(post.user_id);
            } else {
                // @ts-ignore
                await followService.followUser(post.user_id);
                await (supabase.from('notifications') as any).insert({
                    // @ts-ignore
                    user_id: post.user_id,
                    actor_id: user.id,
                    type: 'follow'
                });
            }
        } catch (error) {
            console.error(error);
            setIsFollowing(previousState);
        }
    };

    // Handle Comments
    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || submittingComment) return;

        setSubmittingComment(true);
        const commentText = newComment.trim();

        try {
            // @ts-ignore
            const { data, error } = await (supabase.from('comments') as any)
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content: commentText
                })
                .select('id, content, created_at')
                .single();

            if (error) throw error;

            setComments(prev => [...prev, {
                id: data.id,
                content: data.content,
                created_at: data.created_at,
                user: {
                    id: user.id,
                    username: user.username || 'Usuario',
                    avatar_url: user.avatar || ''
                }
            }]);
            setNewComment('');

            // @ts-ignore
            if (post.user_id !== user.id) {
                await (supabase.from('notifications') as any).insert({
                    // @ts-ignore
                    user_id: post.user_id,
                    actor_id: user.id,
                    type: 'comment',
                    entity_id: postId
                });
            }

            // Sync total comments count in the 'posts' table
            const newCommentCount = (post?.comments_count || 0) + 1;
            await (supabase.from('posts') as any)
                .update({ comments_count: newCommentCount })
                .eq('id', postId);

        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmittingComment(false);
        }
    };
    
    // Deletion and Editing handlers
    const handleDeletePost = async () => {
        if (!user || user.id !== post.user_id) return;
        
        setDeleting(true);
        setShowOptions(false);
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);
                
            if (error) throw error;
            
            showSaveToast({ message: "Publicación eliminada", actionLabel: "" });
            router.push('/profile');
        } catch (error) {
            console.error('Error deleting post:', error);
            showModal({
                title: 'Error',
                message: 'Error al eliminar la publicación. Por favor, inténtalo de nuevo.',
                type: 'error'
            });
        } finally {
            setDeleting(false);
        }
    };
    
    const handleEditPost = () => {
        router.push(`/create-post?postId=${postId}`);
    };

    const handleBack = () => {
        if (window.history.length > 2) {
            router.back();
        } else {
            router.push('/feed');
        }
    };

    // Loading state
    if (loading) return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col">
            {/* Header Skeleton */}
            <div className="h-16 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            {/* Image Skeleton */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
        </div>
    );

    if (!post) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-gray-900 dark:text-white">Publicación no encontrada</div>;

    return (
        <div className="min-h-screen w-full bg-white dark:bg-black flex flex-col">
            {/* HEADER - White background like /profile */}
            <header className="sticky top-0 z-50 w-full max-w-[1400px] mx-auto bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 h-16 flex items-center justify-between px-4">
                {/* Left: Back Button */}
                <button onClick={handleBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                </button>

                {/* Center: Username - smaller and profile photo */}
                <Link href={`/profile/${author.id}`} className="flex items-center gap-2 flex-1 ml-2">
                    <Avatar src={author.avatar_url || null} alt={author.username || 'Usuario'} size="sm" />
                    <span className="font-semibold text-[15px] text-gray-900 dark:text-white truncate">{author.username}</span>
                </Link>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 relative">
                    {/* Follow button (if not own post) */}
                    {/* @ts-ignore */}
                    {user?.id !== post.user_id ? (
                        <button onClick={toggleFollow} className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)]'}`}>
                            {isFollowing ? 'Siguiendo' : 'Seguir'}
                        </button>
                    ) : (
                        <div className="relative">
                            <button 
                                onClick={() => setShowOptions(!showOptions)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <MoreVertical className="w-6 h-6 text-gray-900 dark:text-white" />
                            </button>
                            
                            <AnimatePresence>
                                {showOptions && (
                                    <>
                                        {/* Backdrop to close menu */}
                                        <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={() => setShowOptions(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 overflow-hidden"
                                        >
                                            <button
                                                onClick={handleEditPost}
                                                className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Editar publicación
                                            </button>
                                            <button
                                                onClick={handleDeletePost}
                                                disabled={deleting}
                                                className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {deleting ? 'Borrando...' : 'Borrar publicación'}
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </header>

            {/* Desktop Container */}
            <div className="flex flex-col md:flex-row w-full max-w-[1400px] mx-auto flex-1 md:h-[calc(100vh-64px)] md:justify-center">

            {/* IMAGE CAROUSEL - Swipeable with Framer Motion */}
            <div className="relative w-full h-auto min-h-[50vh] md:w-auto md:max-w-[calc(100%-400px)] md:h-[calc(100vh-64px)] bg-white md:bg-gray-50 dark:bg-black dark:md:bg-[#0a0a0a] flex-shrink-0 overflow-hidden flex items-center justify-center">
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={activeSlide}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = offset.x;
                            if (swipe < -50 && activeSlide < slides.length - 1) {
                                setActiveSlide(activeSlide + 1);
                                setShowSwipeHint(false);
                            } else if (swipe > 50 && activeSlide > 0) {
                                setActiveSlide(activeSlide - 1);
                                setShowSwipeHint(false);
                            }
                        }}
                        className="w-full h-full md:w-auto md:h-full relative cursor-grab active:cursor-grabbing flex items-center justify-center"
                        onDoubleClick={() => {
                            if (!isLiked) toggleLike();
                            setShowHeartAnim(true);
                            setTimeout(() => setShowHeartAnim(false), 1000);
                            haptics.selection();
                        }}
                    >
                        <AnimatePresence>
                            {showHeartAnim && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1.5, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", damping: 15 }}
                                    className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                                >
                                    <Heart className="w-32 h-32 text-white fill-white drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {currentSlide.type === 'photo' ? (
                            <Image
                                src={currentSlide.url || '/placeholder.png'}
                                alt="Post"
                                width={1200}
                                height={1200}
                                className="w-full h-auto md:w-auto md:h-full max-h-[85vh] md:max-h-[calc(100vh-64px)] object-contain"
                                priority
                                draggable={false}
                            />
                        ) : (
                            <div className="w-full aspect-[3/4] md:w-auto md:h-full md:aspect-[3/4] max-h-[85vh] md:max-h-[calc(100vh-64px)] relative bg-[#f8f9fa] dark:bg-[#111]">
                                <InteractiveOutfitViewer 
                                    outfit={currentSlide.outfit} 
                                    onItemClick={(item) => setSelectedItem(item)}
                                    className="w-full h-full absolute inset-0"
                                    isMobileSticker={true}
                                />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Swipe Hint Indicator (Overlay) */}
                {showSwipeHint && slides.length > 1 && activeSlide === 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: [0, 1, 1, 0], x: [20, -20, -20, 20] }}
                        transition={{ repeat: Infinity, duration: 2, times: [0, 0.2, 0.8, 1] }}
                        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
                    >
                        <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold shadow-xl border border-white/10 flex items-center gap-2">
                            <span>Desliza para ver el look</span>
                            <ChevronRight className="w-4 h-4 animate-bounce-x" />
                        </div>
                    </motion.div>
                )}

                {/* Navigation Arrows & Dots Indicator */}
                {slides.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveSlide(prev => prev === 0 ? slides.length - 1 : prev - 1); setShowSwipeHint(false); }}
                            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white dark:bg-black/70 dark:hover:bg-black items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-30 transition-all duration-300 hover:scale-110 active:scale-95 group/btn"
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white group-hover/btn:-translate-x-0.5 transition-transform" />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveSlide(prev => prev === slides.length - 1 ? 0 : prev + 1); setShowSwipeHint(false); }}
                            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white dark:bg-black/70 dark:hover:bg-black items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-30 transition-all duration-300 hover:scale-110 active:scale-95 group/btn"
                            aria-label="Siguiente"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-900 dark:text-white group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>

                        {/* Dots indicator - refined with morphing effect */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30 bg-black/20 backdrop-blur-md px-3 py-2 rounded-full border border-white/5">
                            {slides.map((_, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setActiveSlide(idx); setShowSwipeHint(false); }}
                                    animate={{
                                        scale: activeSlide === idx ? 1.2 : 1,
                                        width: activeSlide === idx ? 20 : 8,
                                        backgroundColor: activeSlide === idx ? '#FF66C4' : 'rgba(255,255,255,0.4)'
                                    }}
                                    className="h-2 rounded-full cursor-pointer transition-colors"
                                    aria-label={`View slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* RIGHT COLUMN: Actions, Details, Comments */}
            <div className="flex flex-col w-full min-w-0 md:w-[400px] lg:w-[450px] md:h-[calc(100vh-64px)] bg-white dark:bg-black overflow-x-hidden pb-[72px] md:pb-0 border-l border-gray-100 dark:border-gray-800 flex-shrink-0">
                {/* ACTION BAR - Below image */}
                <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-5">
                        <button onClick={toggleLike} className="flex items-center gap-1.5 font-bold hover:opacity-70 transition-opacity">
                            <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'text-gray-900 dark:text-white'}`} strokeWidth={2.5} />
                            <span className="text-[15px] text-gray-900 dark:text-white">{likesCount}</span>
                        </button>
                        <button 
                            onClick={() => {
                                if (activeSlide !== 0) {
                                    setActiveSlide(0);
                                    setShowSwipeHint(false);
                                }
                                if (window.innerWidth < 768) {
                                    setShowMobileComments(true);
                                } else {
                                    setTimeout(() => {
                                        commentInputRef.current?.focus();
                                    }, 100);
                                }
                            }} 
                            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                        >
                            <MessageCircle className="w-6 h-6 text-gray-900 dark:text-white" strokeWidth={2.5} />
                            {comments.length > 0 && <span className="text-[15px] text-gray-900 dark:text-white">{comments.length}</span>}
                        </button>
                        <button onClick={handleShare} className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                            <Share2 className="w-6 h-6 text-gray-900 dark:text-white" strokeWidth={2.5} />
                        </button>
                    </div>
                    <button onClick={toggleSave} className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <Bookmark className={`w-7 h-7 transition-colors duration-200 ${isSaved ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'text-gray-900 dark:text-white'}`} strokeWidth={isSaved ? 2 : 2.5} />
                    </button>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                {/* Caption - h6 instead of h3 */}
                {/* @ts-ignore */}
                {post.caption && (
                    <div className="px-4 py-4 w-full">
                        <h6 className="text-[14px] text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed break-words break-all">{post.caption}</h6>
                    </div>
                )}

                {/* OUTFIT ITEMS SECTION - Only show when on outfit slide */}
                {currentSlide.type === 'outfit' && (
                    <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-[15px] text-gray-900 dark:text-white mb-4">Prendas del look</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {/* @ts-ignore */}
                            {currentSlide.outfit?.outfit_items.map((item: any) => {
                                const clothing = item.clothing_items;
                                if (!clothing) return null;
                                return (
                                    <button
                                        key={clothing.id}
                                        onClick={() => setSelectedItem(clothing)}
                                        className="block group text-left w-full"
                                    >
                                        <div className="aspect-square bg-gray-100 dark:bg-[#222] rounded-xl overflow-hidden relative mb-2">
                                            <Image
                                                src={clothing.image_url || '/placeholder.png'}
                                                alt={clothing.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">{clothing.name}</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{clothing.brand || 'Sin marca'}</p>
                                        {clothing.color && (
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div
                                                    className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600"
                                                    style={{ backgroundColor: clothing.color_hex || clothing.color }}
                                                />
                                                <span className="text-[10px] text-gray-400 capitalize">{clothing.color}</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* COMMENTS SECTION - Below description */}
                {currentSlide.type !== 'outfit' && (
                    <>
                        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="font-bold text-[15px] text-gray-900 dark:text-white mb-4">Comentarios ({comments.length})</h3>

                            {comments.length === 0 ? (
                                <div className="text-center py-6 text-gray-400">
                                    <p className="text-sm">Sé el primero en comentar.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <Link href={`/profile/${comment.user.id}`} className="flex-shrink-0">
                                                <Avatar src={comment.user.avatar_url || null} alt={comment.user.username} size="sm" />
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex gap-2 items-baseline flex-wrap">
                                                    <Link href={`/profile/${comment.user.id}`} className="font-bold text-[14px] text-gray-900 dark:text-white hover:underline">
                                                        {comment.user.username}
                                                    </Link>
                                                    <span className="text-[14px] text-gray-900 dark:text-white break-words">{comment.content}</span>
                                                </div>
                                                <div className="flex gap-3 mt-1 text-[11px] font-medium text-gray-400">
                                                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                                    <button className="hover:text-gray-600">Responder</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Add Comment Input - Hidden on mobile, sticky bottom on desktop */}
            {currentSlide.type !== 'outfit' && (
                <form onSubmit={handleAddComment} className="hidden md:flex px-4 py-4 border-t border-gray-100 dark:border-gray-800 gap-3 items-center md:sticky md:bottom-0 bg-white dark:bg-black flex-shrink-0 w-full z-10">
                    <Avatar src={user?.avatar || null} alt="Tú" size="sm" />
                    <div className="flex-1">
                        <input
                            ref={commentInputRef}
                            type="text"
                            placeholder="Añadir comentario..."
                            className="w-full bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newComment.trim() || submittingComment}
                        className="text-[var(--brand-pink)] font-bold text-sm hover:text-[var(--brand-pink-dark)] disabled:opacity-50 transition-colors"
                    >
                        Publicar
                    </button>
                </form>
            )}

            </div> {/* End Right Column */}
            </div> {/* End Desktop Container */}

            {/* Mobile Comments Overlay */}
            {showMobileComments && (
                <div className="fixed inset-0 bg-black/50 z-[100] md:hidden flex items-end">
                    <div className="w-full h-[80vh] bg-white dark:bg-black rounded-t-3xl pt-2 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pb-2 cursor-pointer" onClick={() => setShowMobileComments(false)}>
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        </div>

                        <div className="flex items-center justify-between px-6 mb-4">
                            <h2 className="font-bold text-xl text-gray-900 dark:text-white">Comentarios</h2>
                            <button onClick={() => setShowMobileComments(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <X className="w-5 h-5 text-gray-900 dark:text-white" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6">
                            {comments.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Sé el primero en comentar</p>
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <Link href={`/profile/${comment.user.id}`} className="flex-shrink-0">
                                            <Avatar src={comment.user.avatar_url || null} alt={comment.user.username} size="md" />
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex gap-2 items-baseline">
                                                <Link href={`/profile/${comment.user.id}`} className="font-bold text-[15px] text-gray-900 dark:text-white hover:underline">
                                                    {comment.user.username}
                                                </Link>
                                                <span className="text-[15px] text-gray-900 dark:text-white leading-tight break-words">{comment.content}</span>
                                            </div>
                                            <div className="flex gap-4 mt-1 text-xs font-medium text-gray-400">
                                                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                                <button className="hover:text-gray-600">Responder</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Comment Input in Overlay - Sticky at bottom */}
                        <form 
                            onSubmit={handleAddComment} 
                            className="pb-8 pt-4 flex gap-3 items-center border-t border-gray-100 dark:border-gray-800 px-6 bg-white dark:bg-black"
                        >
                            <Avatar src={user?.avatar || null} alt="Tú" size="md" />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Añadir comentario..."
                                    className="w-full bg-gray-100 dark:bg-gray-800 rounded-full px-5 py-3.5 text-[15px] text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newComment.trim() || submittingComment}
                                className="p-3.5 bg-[var(--brand-pink)] text-white rounded-full hover:bg-[var(--brand-pink-dark)] disabled:opacity-50 transition-colors shadow-lg shadow-[var(--brand-pink)]/20"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Garment Detail Modal */}
            <ProductModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                item={selectedItem ? ({
                    id: selectedItem.id,
                    name: selectedItem.name,
                    brand: selectedItem.brand,
                    price: selectedItem.price,
                    imageUrl: selectedItem.image_url || selectedItem.imageUrl,
                    sourceUrl: selectedItem.source_url || selectedItem.sourceUrl,
                    category: selectedItem.category,
                    color: selectedItem.color,
                    colorHex: selectedItem.color_hex || selectedItem.colorHex,
                    size: selectedItem.size
                } as any) : null}
            />
        </div>
    );
}
