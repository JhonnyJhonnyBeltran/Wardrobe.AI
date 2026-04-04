'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, X, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import * as followService from '@/lib/services/followService';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import Avatar from '@/components/Avatar';
import { useUiStore } from '@/store/uiStore';

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
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);

    // Interaction States
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showMobileComments, setShowMobileComments] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);

    const { showSaveToast, openFolderModal } = useUiStore();

    // For Outfit Item details modal
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    useBodyScrollLock(!!selectedItem);

    const commentInputRef = useRef<HTMLInputElement>(null);
    const slideRef = useRef<HTMLDivElement>(null);

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
                        id, caption, image_url, created_at, user_id,
                        profiles (id, username, avatar_url),
                        outfits (
                            id, name, image_url,
                            outfit_items (
                                clothing_items (id, name, brand, image_url, color, category, size, reference)
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
                    // 2. Fetch Interaction Status (Parallel)
                    const [l, s, f] = await Promise.all([
                        supabase.from('likes' as any).select('id').eq('post_id', postId).eq('user_id', user.id),
                        supabase.from('saves' as any).select('id').eq('post_id', postId).eq('user_id', user.id),
                        // @ts-ignore
                        followService.getFollowStatus(user.id, postData.user_id),
                    ]);
                    likeRes = l;
                    saveRes = s;
                    followStatus = f;
                }

                // Comments
                const { data: commentsData } = await supabase
                    .from('comments' as any)
                    .select('id, content, created_at, user_id, profiles(id, username, avatar_url)')
                    .eq('post_id', postId)
                    .order('created_at', { ascending: true });

                // 3. Get Total Likes
                const { count: totalLikes } = await supabase
                    .from('likes' as any)
                    .select('id', { count: 'exact', head: true })
                    .eq('post_id', postId);

                setPost(postData);
                setIsLiked(likeRes.data && likeRes.data.length > 0);
                setIsSaved(saveRes.data && saveRes.data.length > 0);
                setIsFollowing(followStatus === 'accepted');
                setLikesCount(totalLikes || 0);

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
    }, [postId, user]);

    // Handle swipe/drag for carousel
    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDragging(true);
        setDragStart('touches' in e ? e.touches[0].clientX : e.clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDragging) return;
        const endX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
        const diff = dragStart - endX;

        if (Math.abs(diff) > 50) {
            const slides = getSlides();
            if (diff > 0) {
                // Swipe left - next
                setActiveSlide(prev => Math.min(prev + 1, slides.length - 1));
            } else {
                // Swipe right - prev
                setActiveSlide(prev => Math.max(prev - 1, 0));
            }
        }
        setIsDragging(false);
    };

    // Build Slides Array
    const getSlides = useCallback(() => {
        const slides: { type: 'photo' | 'outfit'; url?: string; outfit?: any }[] = [];
        // @ts-ignore
        if (post?.image_url) slides.push({ type: 'photo', url: post.image_url });
        // @ts-ignore
        if (post?.outfits) {
            slides.push({ type: 'outfit', outfit: post.outfits });
        }
        if (slides.length === 0) slides.push({ type: 'photo', url: '/placeholder.png' });
        return slides;
    }, [post]);

    const slides = getSlides();
    const currentSlide = slides[activeSlide] || slides[0];
    // @ts-ignore
    const author = post?.profiles || {};

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
                if (!insertError && post?.user_id !== user.id) {
                    await (supabase.from('notifications') as any).insert({
                        user_id: post.user_id,
                        actor_id: user.id,
                        type: 'like',
                        entity_id: postId
                    }).catch(console.error);
                }
            }

            if (error) {
                console.error('Like error:', error);
                throw error;
            }

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
                    title: 'Wardrobe.AI',
                    text: 'Mira esta publicación en Wardrobe.AI',
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

        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleBack = () => router.back();

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
            <header className="sticky top-0 z-50 w-full max-w-[1000px] mx-auto bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 h-16 flex items-center justify-between px-4">
                {/* Left: Back Button */}
                <button onClick={handleBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                </button>

                {/* Center: Username - smaller and profile photo */}
                <Link href={`/profile/${author.id}`} className="flex items-center gap-2 flex-1 ml-2">
                    <Avatar src={author.avatar_url || null} alt={author.username || 'Usuario'} size="sm" />
                    <span className="font-semibold text-[15px] text-gray-900 dark:text-white truncate">{author.username}</span>
                </Link>

                {/* Right: Follow button (if not own post) */}
                <div className="flex items-center">
                    {/* @ts-ignore */}
                    {user?.id !== post.user_id && (
                        <button onClick={toggleFollow} className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)]'}`}>
                            {isFollowing ? 'Siguiendo' : 'Seguir'}
                        </button>
                    )}
                </div>
            </header>

            {/* Desktop Container */}
            <div className="flex flex-col md:flex-row w-full max-w-[1000px] mx-auto flex-1 md:h-[calc(100vh-64px)]">

            {/* IMAGE CAROUSEL - Swipeable */}
            <div
                ref={slideRef}
                className="relative w-full aspect-[4/5] md:aspect-auto md:w-[60%] md:h-[calc(100vh-64px)] bg-white md:bg-gray-50 dark:bg-black dark:md:bg-[#0a0a0a] cursor-grab active:cursor-grabbing border-r-0 md:border-r border-gray-100 dark:border-gray-800 flex-shrink-0"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onMouseLeave={() => setIsDragging(false)}
            >
                {currentSlide.type === 'photo' ? (
                    <Image
                        src={currentSlide.url || '/placeholder.png'}
                        alt="Post"
                        fill
                        className="object-contain"
                        priority
                    />
                ) : (
                    /* Outfit Preview - Like /closet OutfitCard */
                    <div className="w-full h-full relative bg-white dark:bg-[#111]">
                        {/* @ts-ignore */}
                        {(currentSlide.outfit?.imageUrl || currentSlide.outfit?.image_url) ? (
                            <Image
                                // @ts-ignore
                                src={currentSlide.outfit.imageUrl || currentSlide.outfit.image_url}
                                alt="Outfit Presentation"
                                fill
                                className="object-contain"
                                priority
                            />
                        ) : (
                            /* Fallback: Grid of items like OutfitCard */
                            <div className="w-full h-full grid grid-cols-2 gap-[1px] bg-gray-200 dark:bg-gray-700">
                                {/* @ts-ignore */}
                                {(currentSlide.outfit?.outfit_items || []).slice(0, 4).map((item: any, i: number) => {
                                    const clothing = item.clothing_items;
                                    return (
                                        <div key={i} className="relative bg-white dark:bg-[#222] overflow-hidden aspect-square">
                                            {clothing?.image_url ? (
                                                <Image src={clothing.image_url} alt={clothing.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: clothing?.color || '#ccc' }}>👕</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation Arrows - Left */}
                {slides.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveSlide(prev => prev === 0 ? slides.length - 1 : prev - 1); }}
                            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white dark:bg-black/60 dark:hover:bg-black items-center justify-center shadow-lg z-10 transition-all"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                        </button>

                        {/* Navigation Arrows - Right */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveSlide(prev => prev === slides.length - 1 ? 0 : prev + 1); }}
                            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white dark:bg-black/60 dark:hover:bg-black items-center justify-center shadow-lg z-10 transition-all"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-900 dark:text-white" />
                        </button>

                        {/* Dots indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setActiveSlide(idx); }}
                                    className={`rounded-full transition-all duration-300 ${activeSlide === idx ? 'bg-[var(--brand-pink)] w-4 h-1.5' : 'bg-gray-300 dark:bg-gray-600/60 w-1.5 h-1.5'}`}
                                    aria-label={`View slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* RIGHT COLUMN: Actions, Details, Comments */}
            <div className="flex flex-col w-full min-w-0 md:w-[40%] md:h-[calc(100vh-64px)] bg-white dark:bg-black overflow-x-hidden pb-[72px] md:pb-0">
                {/* ACTION BAR - Below image */}
                <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-5">
                        <button onClick={toggleLike} className="flex items-center gap-1.5 font-bold hover:opacity-70 transition-opacity">
                            <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'text-gray-900 dark:text-white'}`} strokeWidth={2.5} />
                            <span className="text-[15px] text-gray-900 dark:text-white">{likesCount}</span>
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
                                                    style={{ backgroundColor: clothing.color }}
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

            {/* Add Comment Input - Always visible at bottom of scroll inside right col */}
            {currentSlide.type !== 'outfit' && (
                <form onSubmit={handleAddComment} className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 items-center sticky bottom-[64px] md:bottom-0 bg-white dark:bg-black flex-shrink-0 w-full z-10">
                    <Avatar src={user?.avatar || null} alt="Tú" size="sm" />
                    <div className="flex-1">
                        <input
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

                        <form onSubmit={handleAddComment} className="py-4 flex gap-3 items-center border-t border-gray-100 dark:border-gray-800 px-6">
                            <Avatar src={user?.avatar || null} alt="Tú" size="md" />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Añadir comentario..."
                                    className="w-full bg-gray-100 dark:bg-gray-800 rounded-full px-5 py-3.5 text-[15px] text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newComment.trim() || submittingComment}
                                className="p-3.5 bg-[var(--brand-pink)] text-white rounded-full hover:bg-[var(--brand-pink-dark)] disabled:opacity-50 transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Garment Detail Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="bg-white dark:bg-[#1a1a1a] rounded-t-3xl md:rounded-3xl max-w-md w-full p-6 space-y-4 mb-0 md:mb-0 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5 text-gray-900 dark:text-white" />
                        </button>

                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {selectedItem.image_url ? (
                                <Image src={selectedItem.image_url} alt={selectedItem.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl" style={{ backgroundColor: selectedItem.color || '#ccc' }}>👕</div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedItem.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{selectedItem.brand || 'Sin marca'}</p>
                            {selectedItem.category && (
                                <p className="text-sm text-gray-400 uppercase tracking-wider mt-2">{selectedItem.category}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                {selectedItem.color && (
                                    <div className="flex items-center gap-2 p-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                                        <div
                                            className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600"
                                            style={{ backgroundColor: selectedItem.color }}
                                        />
                                        <span className="text-[13px] font-medium text-gray-600 dark:text-gray-300 capitalize">{selectedItem.color}</span>
                                    </div>
                                )}
                                {selectedItem.size && (
                                    <div className="flex items-center gap-2 p-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                                        <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Talla:</span>
                                        <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{selectedItem.size}</span>
                                    </div>
                                )}
                                {selectedItem.reference && (
                                    <div className="flex items-center gap-2 p-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                                        <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Ref:</span>
                                        <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{selectedItem.reference}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
