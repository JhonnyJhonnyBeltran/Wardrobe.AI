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

            } catch (error) {
                console.error('Error fetching post:', error);
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
            <div className="md:w-[60%] lg:w-[65%] h-[40vh] md:h-full bg-black relative flex items-center justify-center overflow-hidden">
                {/* Mobile Header */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center md:hidden z-20 bg-gradient-to-b from-black/60 to-transparent">
                    <button onClick={handleBack} className="text-white p-2"><ArrowLeft /></button>
                    <button className="text-white p-2"><MoreHorizontal /></button>
                </div>

                <div className="relative w-full h-full bg-black">
                    <Image
                        src={displayImage}
                        alt="Post"
                        fill
                        className="object-contain"
                        priority
                    />

                    {/* Image Navigation Dots */}
                    {safeImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {safeImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${activeImage === idx ? 'bg-white w-6' : 'bg-white/40 w-2 hover:bg-white/60'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Interaction Section */}
            <div className="md:w-[40%] lg:w-[35%] h-[60vh] md:h-full bg-[var(--background)] flex flex-col border-l border-[var(--border-color)]">

                {/* Header (User Info) */}
                <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between shadow-sm z-10">
                    <Link href={`/profile/${author.id}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-[var(--brand-pink)] p-[2px]">
                            <div className="w-full h-full rounded-full bg-[var(--background)] overflow-hidden">
                                <Image
                                    src={author.avatar_url || 'https://i.pravatar.cc/150?u=default'}
                                    alt={author.username || 'User'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--brand-pink)] transition-colors">{author.username}</p>
                            {/* @ts-ignore */}
                            {post.outfits?.name && <p className="text-xs text-[var(--foreground-secondary)] line-clamp-1">{post.outfits.name}</p>}
                        </div>
                    </Link>

                    {/* @ts-ignore */}
                    {user?.id !== post.user_id && (
                        <button
                            onClick={toggleFollow}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isFollowing
                                    ? 'bg-[var(--background-secondary)] text-[var(--foreground)]'
                                    : 'bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)]'
                                }`}
                        >
                            {isFollowing ? 'Siguiendo' : 'Seguir'}
                        </button>
                    )}
                </div>

                {/* Content: Caption & Comments */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

                    {/* Caption */}
                    {/* @ts-ignore */}
                    {post.caption && (
                        <div className="space-y-2 pb-4 border-b border-[var(--border-color)]/30">
                            <div className="flex gap-3">
                                <Link href={`/profile/${author.id}`} className="font-bold text-sm text-[var(--foreground)] hover:underline whitespace-nowrap">
                                    {author.username}
                                </Link>
                                <p className="text-[var(--foreground)] text-sm leading-relaxed whitespace-pre-wrap">
                                    {/* @ts-ignore */}
                                    {post.caption}
                                </p>
                            </div>
                            {/* @ts-ignore */}
                            <p className="text-xs text-[var(--foreground-tertiary)] uppercase">{new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                    )}

                    {/* Outfit Items (Grid) */}
                    {/* @ts-ignore */}
                    {post.outfits?.outfit_items?.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-bold text-xs text-[var(--foreground-secondary)] uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-4 bg-[var(--brand-pink)] rounded-full"></span>
                                Prendas del look
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {/* @ts-ignore */}
                                {post.outfits.outfit_items.map((item: any) => {
                                    const clothing = item.clothing_items;
                                    if (!clothing) return null;
                                    return (
                                        <Link href={`/closet?item=${clothing.id}`} key={clothing.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--background-secondary)] transition-colors group border border-transparent hover:border-[var(--border-color)]">
                                            <div className="w-10 h-10 bg-white rounded-lg overflow-hidden relative border border-[var(--border-color)]">
                                                <Image src={clothing.image_url || '/placeholder.png'} alt={clothing.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[var(--foreground)] truncate group-hover:text-[var(--brand-pink)] transition-colors">{clothing.name}</p>
                                                <p className="text-[10px] text-[var(--foreground-secondary)]">{clothing.brand || 'Sin marca'}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4 pt-2">
                        <p className="text-sm font-bold text-[var(--foreground)] sticky top-0 bg-[var(--background)] z-10 py-2">Comentarios ({comments.length})</p>

                        {comments.length === 0 ? (
                            <div className="text-center py-8 text-[var(--foreground-tertiary)] text-xs">
                                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                Sé el primero en comentar
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 group">
                                        <Link href={`/profile/${comment.user.id}`} className="min-w-[32px]">
                                            <div className="w-8 h-8 rounded-full bg-[var(--background-secondary)] overflow-hidden relative">
                                                <Image src={comment.user.avatar_url} alt={comment.user.username} fill className="object-cover" />
                                            </div>
                                        </Link>
                                        <div className="flex-1 space-y-1">
                                            <div className="text-sm">
                                                <Link href={`/profile/${comment.user.id}`} className="font-bold text-[var(--foreground)] mr-2 hover:underline">
                                                    {comment.user.username}
                                                </Link>
                                                <span className="text-[var(--foreground-secondary)]">{comment.content}</span>
                                            </div>
                                            <div className="flex gap-4 text-[10px] text-[var(--foreground-tertiary)]">
                                                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                                <button className="font-semibold hover:text-[var(--foreground-secondary)]">Responder</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer: Actions & Input */}
                <div className="p-4 border-t border-[var(--border-color)] bg-[var(--background)] supports-[backdrop-filter]:bg-[var(--background)]/80 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleLike}
                                className="group hover:scale-110 transition-transform"
                            >
                                <Heart className={`w-7 h-7 transition-colors ${isLiked ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'text-[var(--foreground)] group-hover:text-[var(--brand-pink)]'}`} />
                            </button>
                            <button
                                onClick={() => commentInputRef.current?.focus()}
                                className="group hover:scale-110 transition-transform"
                            >
                                <MessageCircle className="w-7 h-7 text-[var(--foreground)] group-hover:text-[var(--brand-purple)]" />
                            </button>
                            <button className="group hover:scale-110 transition-transform">
                                <Share2 className="w-7 h-7 text-[var(--foreground)] group-hover:text-blue-500" />
                            </button>
                        </div>
                        <button
                            onClick={toggleSave}
                            className="group hover:scale-110 transition-transform"
                        >
                            <Bookmark className={`w-7 h-7 transition-colors ${isSaved ? 'fill-[var(--foreground)] text-[var(--foreground)]' : 'text-[var(--foreground)] group-hover:text-yellow-500'}`} />
                        </button>
                    </div>

                    <div className="font-bold text-sm text-[var(--foreground)] mb-3 cursor-pointer hover:underline">
                        {likesCount} Me gusta
                    </div>

                    <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                        <div className="relative flex-1">
                            <input
                                ref={commentInputRef}
                                type="text"
                                placeholder={comments.length === 0 ? "Escribe el primer comentario..." : "Añade un comentario..."}
                                className="w-full bg-[var(--background-secondary)] rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/50 transition-all placeholder:text-[var(--foreground-tertiary)]"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button type="button" onClick={() => setNewComment(prev => prev + '@')} className="text-xs text-[var(--brand-pink)] font-bold hover:bg-[var(--brand-pink)]/10 px-1.5 py-0.5 rounded transition-colors">@</button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submittingComment}
                            className="p-3 bg-[var(--brand-pink)] text-white rounded-xl hover:bg-[var(--brand-pink-dark)] disabled:opacity-50 disabled:hover:bg-[var(--brand-pink)] transition-colors shadow-lg shadow-[var(--brand-pink)]/20"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
