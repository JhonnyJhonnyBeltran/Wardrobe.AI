'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, X, Send } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import * as followService from '@/lib/services/followService';

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
    const [activeImage, setActiveImage] = useState(0); // 0: Real, 1: Outfit

    // Interaction States
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showMobileComments, setShowMobileComments] = useState(false);

    const commentInputRef = useRef<HTMLInputElement>(null);

    // Fetch Post Data
    useEffect(() => {
        if (!postId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Post Details
                const { data: postData, error: postError } = await supabase
                    .from('posts')
                    .select(`
                        id, caption, image_url, created_at, user_id,
                        profiles (id, username, avatar_url),
                        outfits (
                            id, name, 
                            outfit_items (
                                clothing_items (id, name, brand, image_url)
                            )
                        )
                    `)
                    .eq('id', postId as any)
                    .single();

                if (postError) throw postError;

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
                            avatar_url: c.profiles?.avatar_url || 'https://i.pravatar.cc/150?u=default'
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
            if (previousState) {
                await supabase.from('likes' as any).delete().eq('post_id', postId).eq('user_id', user.id);
            } else {
                await supabase.from('likes' as any).insert({ post_id: postId, user_id: user.id });
                // Notify Author (if not self)
                // @ts-ignore
                if (post.user_id !== user.id) {
                    await supabase.from('notifications' as any).insert({
                        // @ts-ignore
                        user_id: post.user_id,
                        actor_id: user.id,
                        type: 'like',
                        entity_id: postId
                    });
                }
            }
        } catch (error) {
            console.error(error);
            // Revert
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

        try {
            if (previousState) {
                await supabase.from('saves' as any).delete().eq('post_id', postId).eq('user_id', user.id);
            } else {
                await supabase.from('saves' as any).insert({ post_id: postId, user_id: user.id });
            }
        } catch (error) {
            console.error(error);
            setIsSaved(previousState);
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
                // Notify
                await supabase.from('notifications' as any).insert({
                    // @ts-ignore
                    user_id: post.user_id,
                    actor_id: user.id,
                    type: 'follow',
                    // Entity ID could be null or follower_id
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
            const { data, error } = await supabase
                .from('comments' as any)
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content: commentText
                })
                .select('*, profiles(username, avatar_url)')
                .single();

            if (error) throw error;

            // Update UI
            setComments(prev => [...prev, {
                id: data.id,
                content: data.content,
                created_at: data.created_at,
                user: {
                    id: user.id,
                    username: data.profiles?.username || user.username,
                    avatar_url: data.profiles?.avatar_url || user.avatar_url
                }
            }]);
            setNewComment('');

            // Handle Mentions & Notifications
            // 1. Notify Post Author
            // @ts-ignore
            if (post.user_id !== user.id) {
                await supabase.from('notifications' as any).insert({
                    // @ts-ignore
                    user_id: post.user_id,
                    actor_id: user.id,
                    type: 'comment',
                    entity_id: postId
                });
            }

            // 2. Parse Mentions (@username)
            const mentionRegex = /@(\w+)/g;
            const matches = commentText.match(mentionRegex);

            if (matches) {
                const usernames = matches.map(m => m.substring(1)); // Remove @
                // Find user IDs for these usernames
                const { data: mentionedUsers } = await supabase
                    .from('profiles')
                    .select('id, username')
                    .in('username', usernames);

                if (mentionedUsers && mentionedUsers.length > 0) {
                    const notifications = mentionedUsers
                        // @ts-ignore
                        .filter((u: any) => u.id !== user.id && u.id !== post.user_id) // Don't double notify author or self
                        .map((u: any) => ({
                            user_id: u.id,
                            actor_id: user.id,
                            type: 'mention',
                            entity_id: postId // Or comment ID if specialized
                        }));

                    if (notifications.length > 0) {
                        await supabase.from('notifications' as any).insert(notifications);
                    }
                }
            }

        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleBack = () => router.back();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="w-8 h-8 border-4 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!post) return <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">Publicación no encontrada</div>;

    // Determine images to show
    // 1. Main Post Image
    // 2. First Outfit Item Image (if available)
    const images: string[] = [];
    // @ts-ignore
    if (post.image_url) images.push(post.image_url);

    // @ts-ignore
    if (post.outfits?.outfit_items?.length > 0) {
        // Collect item images for carousel
        // @ts-ignore
        const itemImages = post.outfits.outfit_items
            .map((oi: any) => oi.clothing_items?.image_url)
            .filter(Boolean);

        if (itemImages.length > 0) {
            // Avoid duplication if post.image_url is same as first item (unlikely but possible)
            itemImages.forEach((img: string) => {
                if (!images.includes(img)) images.push(img);
            });
        }
    }
    const safeImages = images.length > 0 ? images : ['/placeholder.png'];
    const displayImage = safeImages[activeImage] || safeImages[0];

    // @ts-ignore
    const author = post.profiles || {};

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row h-screen overflow-hidden">
            {/* Desktop Close Button */}
            <button onClick={handleBack} className="fixed top-6 left-6 z-50 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white md:block hidden transition-transform hover:scale-110">
                <X className="w-6 h-6" />
            </button>

            {/* LEFT: Image Section */}
            <div className="w-full md:w-[50%] lg:w-[55%] h-[60vh] md:h-full relative flex items-center justify-center overflow-hidden bg-white dark:bg-[#111] md:rounded-r-3xl md:shadow-2xl z-10">
                {/* Mobile Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center md:hidden z-20">
                    <button onClick={handleBack} className="text-black dark:text-white p-2 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full"><ArrowLeft className="w-5 h-5" /></button>
                </div>

                <div className="relative w-full h-full">
                    <Image
                        src={displayImage}
                        alt="Post"
                        fill
                        className="object-contain"
                        priority
                    />

                    {/* Image Navigation Dots for multiple items */}
                    {safeImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {safeImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${activeImage === idx ? 'bg-[var(--brand-pink)] w-6' : 'bg-gray-300 dark:bg-gray-700 w-2 hover:bg-[var(--brand-pink)]/50'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Interaction Section (Desktop) / Bottom Section (Mobile) */}
            <div className={`md:w-[50%] lg:w-[45%] h-[40vh] md:h-full bg-[var(--background)] flex flex-col pt-4 md:pt-10 px-6 md:px-12 overflow-y-auto ${showMobileComments ? 'pb-32' : ''}`}>

                {/* INTERACTION ROW (Pinterest Style) */}
                <div className="flex flex-col gap-6 flex-shrink-0">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-6 text-[var(--foreground)]">
                            <button onClick={toggleLike} className="flex items-center gap-2 font-bold hover:opacity-80 transition-opacity">
                                <Heart className={`w-7 h-7 ${isLiked ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : ''}`} strokeWidth={2.5} />
                                <span className="text-lg">{likesCount}</span>
                            </button>
                            <button onClick={() => { if (window.innerWidth < 768) setShowMobileComments(true); else commentInputRef.current?.focus(); }} className="flex items-center gap-2 font-bold hover:opacity-80 transition-opacity">
                                <MessageCircle className="w-7 h-7" strokeWidth={2.5} />
                                <span className="text-lg">{comments.length}</span>
                            </button>
                            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity hidden sm:flex">
                                <Share2 className="w-7 h-7" strokeWidth={2.5} />
                            </button>
                            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <MoreHorizontal className="w-7 h-7" strokeWidth={2.5} />
                            </button>
                        </div>
                        <button onClick={toggleSave} className={`px-6 py-3 rounded-full font-bold text-white transition-colors text-lg ${isSaved ? 'bg-[var(--background-secondary)] text-[var(--foreground)]' : 'bg-[#FF3040] hover:bg-red-600'}`}>
                            {isSaved ? 'Guardado' : 'Guardar'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <Link href={`/profile/${author.id}`} className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-[var(--border-color)]">
                                <Image src={author.avatar_url || 'https://i.pravatar.cc/150'} alt={author.username} fill className="object-cover" />
                            </div>
                            <div>
                                <span className="font-bold text-[var(--foreground)] text-lg hover:underline">{author.username}</span>
                                {/* @ts-ignore */}
                                {post.outfits?.name && <p className="text-xs text-[var(--foreground-secondary)] line-clamp-1">{post.outfits.name}</p>}
                            </div>
                        </Link>
                        {/* @ts-ignore */}
                        {user?.id !== post.user_id && (
                            <button onClick={toggleFollow} className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${isFollowing ? 'bg-[var(--background-secondary)] text-[var(--foreground)]' : 'bg-gray-200 dark:bg-gray-800 text-[var(--foreground)] hover:bg-gray-300 dark:hover:bg-gray-700'}`}>
                                {isFollowing ? 'Siguiendo' : 'Seguir'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Caption (Title/Description) */}
                {/* @ts-ignore */}
                {post.caption && (
                    <div className="mt-6 mb-2">
                        {/* @ts-ignore */}
                        <h1 className="font-bold text-2xl text-[var(--foreground)] leading-tight whitespace-pre-wrap">{post.caption}</h1>
                    </div>
                )}

                {/* Desk-only comment display or Mobile-when-opened */}
                <div className={`mt-6 flex-1 flex flex-col overflow-hidden ${showMobileComments ? 'flex' : 'hidden md:flex'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-xl text-[var(--foreground)]">Comentarios</h2>
                        {showMobileComments && (
                            <button onClick={() => setShowMobileComments(false)} className="md:hidden p-2 bg-[var(--background-secondary)] rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-6">
                        {comments.length === 0 ? (
                            <div className="text-center py-10 text-[var(--foreground-tertiary)]">
                                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Sé el primero en comentar</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4">
                                    <Link href={`/profile/${comment.user.id}`} className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] overflow-hidden relative">
                                            <Image src={comment.user.avatar_url} alt={comment.user.username} fill className="object-cover" />
                                        </div>
                                    </Link>
                                    <div className="flex-1">
                                        <div className="flex gap-2 items-baseline">
                                            <Link href={`/profile/${comment.user.id}`} className="font-bold text-[var(--foreground)] text-[15px] hover:underline">
                                                {comment.user.username}
                                            </Link>
                                            <span className="text-[var(--foreground)] text-[15px] leading-tight">{comment.content}</span>
                                        </div>
                                        <div className="flex gap-4 mt-2 text-xs font-bold text-[var(--foreground-tertiary)]">
                                            <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                            <button className="hover:text-[var(--foreground-secondary)]">Responder</button>
                                        </div>
                                    </div>
                                    <button className="flex-shrink-0 self-start mt-1 cursor-pointer hover:opacity-70">
                                        <Heart className="w-4 h-4 text-[var(--foreground-tertiary)]" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Comment Input */}
                    <form onSubmit={handleAddComment} className={`bg-[var(--background)] py-4 backdrop-blur-md z-30 flex gap-3 items-center sticky bottom-0 ${showMobileComments ? 'md:relative' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative flex-shrink-0 border border-[var(--border-color)]">
                            <Image src={user?.avatar_url || 'https://i.pravatar.cc/150'} alt="Tú" fill className="object-cover" />
                        </div>
                        <div className="relative flex-1">
                            <input
                                ref={commentInputRef}
                                type="text"
                                placeholder="Añadir comentario..."
                                className="w-full bg-[var(--background-secondary)] rounded-full px-5 py-3.5 text-[15px] font-medium outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all placeholder:text-[var(--foreground-tertiary)]"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submittingComment}
                            className="p-3.5 bg-gray-200 dark:bg-gray-800 text-[var(--foreground)] rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    </form>
                </div>

                {/* Outfit Items Overview (placed dynamically at bottom on mobile unless comments open) */}
                {/* @ts-ignore */}
                {!showMobileComments && post.outfits?.outfit_items?.length > 0 && (
                    <div className="mt-8 space-y-4 pb-8">
                        <h3 className="font-bold text-lg text-[var(--foreground)]">Prendas usadas en este look</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {/* @ts-ignore */}
                            {post.outfits.outfit_items.map((item: any) => {
                                const clothing = item.clothing_items;
                                if (!clothing) return null;
                                return (
                                    <Link href={`/closet?item=${clothing.id}`} key={clothing.id} className="block group">
                                        <div className="aspect-square bg-gray-100 dark:bg-[#222] rounded-2xl overflow-hidden relative mb-2">
                                            <Image src={clothing.image_url || '/placeholder.png'} alt={clothing.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </div>
                                        <p className="text-[13px] font-bold text-[var(--foreground)] truncate px-1">{clothing.name}</p>
                                        <p className="text-[11px] text-[var(--foreground-secondary)] px-1">{clothing.brand || 'Sin marca'}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Comments overlay full sheet */}
            {showMobileComments && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden flex items-end">
                    <div className="w-full h-[80vh] bg-[var(--background)] rounded-t-3xl pt-2 px-0 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pb-2 pt-2 cursor-pointer" onClick={() => setShowMobileComments(false)}>
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        </div>

                        <div className="flex items-center justify-between px-6 mb-4">
                            <h2 className="font-bold text-xl text-[var(--foreground)]">Comentarios</h2>
                            <button onClick={() => setShowMobileComments(false)} className="p-2 bg-[var(--background-secondary)] rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Embed duplicated comment logic here to allow natural scrolling inside sheet */}
                        <div className="flex-1 overflow-y-auto space-y-6 px-6 custom-scrollbar pb-6 relative">
                            {comments.length === 0 ? (
                                <div className="text-center py-10 text-[var(--foreground-tertiary)]">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Sé el primero en comentar</p>
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4">
                                        <Link href={`/profile/${comment.user.id}`} className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] overflow-hidden relative">
                                                <Image src={comment.user.avatar_url} alt={comment.user.username} fill className="object-cover" />
                                            </div>
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex gap-2 items-baseline">
                                                <Link href={`/profile/${comment.user.id}`} className="font-bold text-[var(--foreground)] text-[15px] hover:underline">
                                                    {comment.user.username}
                                                </Link>
                                                <span className="text-[var(--foreground)] text-[15px] leading-tight">{comment.content}</span>
                                            </div>
                                            <div className="flex gap-4 mt-2 text-xs font-bold text-[var(--foreground-tertiary)]">
                                                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                                <button className="hover:text-[var(--foreground-secondary)]">Responder</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="bg-[var(--background)] py-4 backdrop-blur-md z-30 flex gap-3 items-center sticky bottom-0 border-t border-[var(--border-color)] px-6">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative flex-shrink-0 border border-[var(--border-color)]">
                                <Image src={user?.avatar_url || 'https://i.pravatar.cc/150'} alt="Tú" fill className="object-cover" />
                            </div>
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Añadir comentario..."
                                    className="w-full bg-[var(--background-secondary)] rounded-full px-5 py-3.5 text-[15px] font-medium outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all placeholder:text-[var(--foreground-tertiary)]"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newComment.trim() || submittingComment}
                                className="p-3.5 bg-[var(--brand-pink)] text-white rounded-full hover:bg-[var(--brand-pink-dark)] disabled:opacity-50 transition-colors shadow-[0_4px_10px_rgba(255,102,196,0.2)]"
                            >
                                <Send className="w-5 h-5 ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
