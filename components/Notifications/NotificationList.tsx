'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useRealtimeStore } from '@/store/realtimeStore';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { getRecentFollowActivity, followUser, unfollowUser, getMyFollowStatusMap, getFollowStatus } from '@/lib/services/followService';
import { getSmartSuggestions } from '@/lib/services/suggestionService';
import { LogoMark, Avatar, InfiniteScrollFooter } from '@/components';
import Link from 'next/link';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { useRouter } from 'next/navigation';

// Types
export interface Notification {
    id: string;
    type: 'like' | 'follow' | 'system' | 'comment';
    actor?: {
        id: string;
        username: string;
        name: string;
        avatar: string;
    };
    content?: string;
    time: string;
    timestamp: number; // For sorting
    image?: string; // For liked posts
    postId?: string; // For linking to post
}

interface NotificationListProps {
    compact?: boolean;
    onClose?: () => void;
}

export default function NotificationList({ compact = false, onClose }: NotificationListProps) {
    const { user } = useUser();
    const [fetchedNotifications, setFetchedNotifications] = useState<Notification[]>([]);
    const realtimeNotifications = useRealtimeStore(state => state.notifications);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [lastViewedAt, setLastViewedAt] = useState<number>(0);
    
    const pageRef = useRef(0);
    const NOTIFS_PER_PAGE = 10;
    const observerElement = useRef<HTMLDivElement | null>(null);
    // Use a ref to ensure we only capture/mark once on mount, regardless of re-renders
    const hasMarkedViewedRef = useRef(false);

    // Merge fetched and realtime notifications
    const notifications = Array.from(new Map(
        [...realtimeNotifications, ...fetchedNotifications].map((item: any) => [item.id, item])
    ).values()).sort((a: any, b: any) => {
        const timeA = a.timestamp || new Date(a.created_at).getTime() || 0;
        const timeB = b.timestamp || new Date(b.created_at).getTime() || 0;
        return timeB - timeA;
    });

    const NotificationSkeleton = () => (
        <div className="flex items-start gap-4 p-4 rounded-3xl bg-[var(--background)]/50 border border-[var(--border-color)]/30 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-[var(--background-secondary)] shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--background-secondary)] rounded w-3/4" />
                <div className="h-3 bg-[var(--background-secondary)] rounded w-1/2" />
            </div>
        </div>
    );
    const markActivityAsViewed = useRealtimeStore(state => state.markActivityAsViewed);
    const { items: wardrobeItems } = useWardrobe(); // For Create Outfit check
    const [followMap, setFollowMap] = useState<Record<string, string>>({}); // Track follow status
    const router = useRouter();

    // Fetch Follow Status Map on mount
    useEffect(() => {
        if (user?.id) {
            getMyFollowStatusMap(user.id).then((map) => {
                const simplifiedMap: Record<string, string> = {};
                Object.entries(map).forEach(([key, val]) => simplifiedMap[key] = val);
                setFollowMap(simplifiedMap);
            });
        }
        // IMPORTANT: Only capture last_viewed_activity once per mount.
        // If we do this on every user change, we race with re-renders caused by profile
        // hydration and end up overwriting the timestamp with "now" before notifications are shown.
        if (!hasMarkedViewedRef.current && typeof window !== 'undefined') {
            hasMarkedViewedRef.current = true;
            const lv = localStorage.getItem('last_viewed_activity');
            if (lv) {
                setLastViewedAt(new Date(lv).getTime());
            }
            // Mark as viewed AFTER capturing the old timestamp into state.
            // Use a small delay so the state is committed before we update localStorage.
            setTimeout(() => {
                markActivityAsViewed(new Date().toISOString());
            }, 100);
        }
    }, [user?.id, markActivityAsViewed]);


    const fetchNotifications = async (isLoadMore = false) => {
        const currentPage = isLoadMore ? pageRef.current + 1 : 0;
        const from = currentPage * NOTIFS_PER_PAGE;
        const to = from + NOTIFS_PER_PAGE - 1;

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        setLoadError(false);

        if (!user?.id) {
            setLoading(false);
            setLoadingMore(false);
            return;
        }

        const realNotifications: Notification[] = [];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

        // Helper to get relative time safely
        const getTimeAgo = (dateString: string) => {
            const time = new Date(dateString).getTime();
            const now = Date.now();
            const diffInSeconds = Math.floor((now - time) / 1000);
            
            if (diffInSeconds <= 0) return 'Justo ahora';
            
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
            
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
            
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 30) return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
            
            const diffInMonths = Math.floor(diffInDays / 30);
            if (diffInMonths < 12) return `hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
            
            const diffInYears = Math.floor(diffInDays / 365);
            return `hace ${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`;
        };

        // 1. Obtener sugerencias inteligentes (Solo primera página)
        if (currentPage === 0) {
            const smartSuggestions = await getSmartSuggestions(user.id);
            realNotifications.push(...smartSuggestions);
        }

        try {
            // 2. Fetch Follows (Real Data limitadas a 30 días)
            const { data: followsData } = await supabase
                .from('follows')
                .select('*, follower:follower_id(*)')
                .eq('following_id', user.id)
                .gte('created_at', thirtyDaysAgoISO)
                .order('created_at', { ascending: false })
                .range(from, to);

            const follows = followsData || [];

            if (follows.length > 0) {
                follows.forEach((f: any) => {
                    realNotifications.push({
                        id: `follow_${f.follower_id}::${f.following_id}`,
                        type: 'follow',
                        actor: {
                            id: f.follower_id,
                            username: f.follower?.username || '',
                            name: f.follower?.full_name || f.follower?.username || 'Usuario',
                            avatar: f.follower?.avatar_url || null
                        },
                        time: getTimeAgo(f.created_at),
                        timestamp: new Date(f.created_at).getTime(),
                    });
                });
            }

            // 3. Fetch Likes & Comments
            const { data: myPosts } = await supabase
                .from('posts')
                .select('id')
                .eq('user_id', user.id);

            if (myPosts && myPosts.length > 0) {
                const myPostIds = myPosts.map((p: any) => p.id);
                // LIKES
                const { data: likes } = await supabase
                    .from('likes')
                    .select(`
              user_id, post_id, created_at,
              user:user_id(id, full_name, username, avatar_url),
              post:post_id(image_url)
           `)
                    .in('post_id', myPostIds)
                    .neq('user_id', user.id) // Avoid self-likes
                    .gte('created_at', thirtyDaysAgoISO)
                    .order('created_at', { ascending: false })
                    .range(from, to);

                if (likes) {
                    likes.forEach((l: any) => {
                        realNotifications.push({
                            id: `like_${l.user_id}_${l.post_id}_${l.created_at}`,
                            type: 'like',
                            actor: {
                                id: l.user_id,
                                username: l.user?.username || '',
                                name: l.user?.full_name || l.user?.username || 'Usuario',
                                avatar: l.user?.avatar_url || null
                            },
                            time: getTimeAgo(l.created_at),
                            timestamp: new Date(l.created_at).getTime(),
                            image: l.post?.image_url,
                            postId: l.post_id
                        });
                    });
                }

                // COMMENTS
                const { data: comments } = await supabase
                    .from('comments' as any)
                    .select(`
              id, user_id, post_id, created_at, content,
              user:user_id(id, full_name, username, avatar_url),
              post:post_id(image_url)
           `)
                    .in('post_id', myPostIds)
                    .neq('user_id', user.id) // Avoid self-comments
                    .gte('created_at', thirtyDaysAgoISO)
                    .order('created_at', { ascending: false })
                    .range(from, to);

                if (comments) {
                    comments.forEach((c: any) => {
                        realNotifications.push({
                            id: `comment_${c.id}`,
                            type: 'comment',
                            actor: {
                                id: c.user_id,
                                username: c.user?.username || '',
                                name: c.user?.full_name || c.user?.username || 'Usuario',
                                avatar: c.user?.avatar_url || null
                            },
                            content: c.content,
                            time: getTimeAgo(c.created_at),
                            timestamp: new Date(c.created_at).getTime(),
                            image: c.post?.image_url,
                            postId: c.post_id
                        });
                    });
                }
            }

        } catch (err) {
            console.error("Error fetching activity", err);
            setLoadError(true);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }

        if (!loadError) {
            const newFetched = realNotifications;
            
            if (isLoadMore) {
                setFetchedNotifications(prev => {
                    const all = [...prev, ...newFetched];
                    return Array.from(new Map(all.map(item => [item.id, item])).values())
                        .sort((a, b) => b.timestamp - a.timestamp);
                });
            } else {
                const sortedNotifications = newFetched.sort((a, b) => b.timestamp - a.timestamp);
                setFetchedNotifications(sortedNotifications);
            }

            setHasMore(newFetched.length > 0);
            if (newFetched.length > 0) {
                pageRef.current = currentPage;
            }
        }
    };

    useEffect(() => {
        fetchNotifications(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const loadMoreNotifications = () => {
        if (loading || loadingMore || !hasMore || loadError) return;
        fetchNotifications(true);
    };

    // Observers
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loadingMore && !loading && !loadError) {
                loadMoreNotifications();
            }
        }, { threshold: 0.1 });

        if (observerElement.current) observer.observe(observerElement.current);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, loading, loadError]);

    const handleDismissSystem = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent triggering the main click
        localStorage.setItem('dismissed_system_msg_id', id);
        localStorage.setItem('last_klozet_msg_date', new Date().toISOString());
        setFetchedNotifications(prev => prev.filter(n => n.id !== id));
    };


    // Handler for System Notification Click -> Create Outfit
    const handleSystemClick = () => {
        if (!wardrobeItems || wardrobeItems.length === 0) {
            // Simple alert for now, could be a toast
            alert('Añade prendas a tu armario antes de crear outfits');
            return;
        }
        if (onClose) onClose();
        router.push('/create');
    };

    // Handler for Follow/Unfollow - Direct follow (no pending)
    const handleFollow = async (targetId: string) => {
        if (!user) return;
        const currentStatus = followMap[targetId];
        const isFollowing = currentStatus === 'accepted';

        // Optimistic Update - Follow directly
        const newMap = { ...followMap };
        if (isFollowing) {
            delete newMap[targetId]; // Will unfollow
        } else {
            newMap[targetId] = 'accepted'; // Direct follow
        }
        setFollowMap(newMap);

        try {
            if (isFollowing) {
                await unfollowUser(user.id, targetId);
            } else {
                await followUser(user.id, targetId);
            }
            // Verify status
            const realStatus = await getFollowStatus(user.id, targetId);
            setFollowMap(prev => ({ ...prev, [targetId]: realStatus }));
        } catch (err) {
            console.error("Follow failed", err);
            // Revert
            setFollowMap(followMap);
        }
    };

    const hasSystem = notifications.some(n => n.type === 'system');
    const activityNotifications = notifications.filter(n => n.type !== 'system');

    if (loading) {
        return (
            <div className={`space-y-4 flex-1 w-full ${compact ? 'p-2' : 'p-4'}`}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <NotificationSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-8 flex-1 ${compact ? 'p-2' : 'p-4'}`}>
            {/* Automated System Messages (Top Priority) */}
            <AnimatePresence>
                {hasSystem && (
                    <section className="space-y-3">
                        <h2 className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">Recordatorios</h2>
                        {notifications.filter(n => n.type === 'system').map(notif => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                                onClick={handleSystemClick}
                                className={`relative p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--brand-pink)]/20 flex items-start gap-4 pr-10 cursor-pointer hover:bg-[var(--background-secondary)]/80 transition-colors
                   ${(!wardrobeItems || wardrobeItems.length === 0) ? 'opacity-90' : ''}`}
                            >
                                <button
                                    onClick={(e) => handleDismissSystem(e, notif.id)}
                                    className="absolute top-2 right-2 p-1 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                                    <LogoMark size="sm" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] text-sm">Consejo de Estilo</h3>
                                    <p className="text-sm text-[var(--foreground-secondary)] mt-1">{notif.content}</p>
                                </div>
                            </motion.div>
                        ))}
                    </section>
                )}
            </AnimatePresence>

            {/* Actividad Reciente */}
            {activityNotifications.length > 0 && (
                <section className="space-y-4">
                    <div className="space-y-4">
                        {activityNotifications.map((notif) => {
                            const isNew = notif.timestamp > lastViewedAt;
                            const bgClass = isNew ? "bg-[var(--brand-pink)]/10" : "";
                            
                            if (notif.type === 'follow') {
                                return (
                                    <div key={notif.id} className={`flex items-center gap-3 group p-3 rounded-2xl transition-colors ${bgClass}`}>
                                        <Link href={`/profile/${notif.actor!.username || notif.actor!.id}`} className="relative shrink-0" onClick={onClose}>
                                            <Avatar src={notif.actor?.avatar || null} alt={notif.actor!.name} size="md" />
                                        </Link>
                                        <div className="flex-1 text-sm min-w-0">
                                            <Link href={`/profile/${notif.actor!.username || notif.actor!.id}`} onClick={onClose} className="font-semibold text-[var(--foreground)] hover:underline truncate">
                                                {notif.actor!.name}
                                            </Link>
                                            <span className="text-[var(--foreground-secondary)]"> comenzó a seguirte.</span>
                                            <span className="text-[var(--foreground-tertiary)] text-xs ml-2 block sm:inline">{notif.time}</span>
                                        </div>
                                        <button
                                            onClick={() => handleFollow(notif.actor!.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity shrink-0
                                                ${(followMap[notif.actor!.id] === 'accepted' || followMap[notif.actor!.id] === 'pending')
                                                    ? 'bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border-color)]'
                                                    : 'bg-[var(--brand-pink)] text-white'}`}
                                        >
                                            {followMap[notif.actor!.id] === 'accepted' ? 'Siguiendo' :
                                                followMap[notif.actor!.id] === 'pending' ? 'Solicitado' : 'Seguir'}
                                        </button>
                                    </div>
                                );
                            }
                            
                            if (notif.type === 'like') {
                                return (
                                    <div key={notif.id} className={`flex items-center gap-3 group p-3 rounded-2xl transition-colors ${bgClass}`}>
                                        <Link href={`/profile/${notif.actor!.username || notif.actor!.id}`} className="relative shrink-0" onClick={onClose}>
                                            <Avatar src={notif.actor?.avatar || null} alt={notif.actor!.name} size="md" />
                                        </Link>
                                        <div className="flex-1 text-sm min-w-0">
                                            <Link href={`/profile/${notif.actor!.username || notif.actor!.id}`} onClick={onClose} className="font-semibold text-[var(--foreground)] hover:underline truncate">
                                                {notif.actor!.name}
                                            </Link>
                                            <span className="text-[var(--foreground-secondary)]"> le gustó tu post.</span>
                                            <span className="text-[var(--foreground-tertiary)] text-xs ml-2 block sm:inline">{notif.time}</span>
                                        </div>
                                        {notif.image && (
                                            <Link href={`/post/${notif.postId}`} onClick={onClose} className="w-10 h-10 rounded-md overflow-hidden relative border border-[var(--border-color)] hover:opacity-80 transition-opacity shrink-0">
                                                <Image src={notif.image} alt="Post" fill className="object-cover" />
                                            </Link>
                                        )}
                                    </div>
                                );
                            }

                            if (notif.type === 'comment') {
                                return (
                                    <div key={notif.id} className={`flex items-center gap-3 group p-3 rounded-2xl transition-colors ${bgClass}`}>
                                        <Link href={`/profile/${notif.actor!.username || notif.actor!.id}`} className="relative shrink-0" onClick={onClose}>
                                            <Avatar src={notif.actor?.avatar || null} alt={notif.actor!.name} size="md" />
                                        </Link>
                                        <div className="flex-1 text-sm min-w-0">
                                            <Link href={`/profile/${notif.actor!.username || notif.actor!.id}`} onClick={onClose} className="font-semibold text-[var(--foreground)] hover:underline truncate">
                                                {notif.actor!.name}
                                            </Link>
                                            <span className="text-[var(--foreground-secondary)] text-wrap break-words"> comentó: "{notif.content}"</span>
                                            <span className="text-[var(--foreground-tertiary)] text-xs ml-2 block sm:inline">{notif.time}</span>
                                        </div>
                                        {notif.image && (
                                            <Link href={`/post/${notif.postId}`} onClick={onClose} className="w-10 h-10 rounded-md overflow-hidden relative border border-[var(--border-color)] hover:opacity-80 transition-opacity shrink-0">
                                                <Image src={notif.image} alt="Post" fill className="object-cover" />
                                            </Link>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </section>
            )}

            {/* Infinite Scroll Footer */}
            <div ref={observerElement}>
                <InfiniteScrollFooter
                    isLoading={loadingMore}
                    isError={loadError}
                    hasMore={hasMore}
                    hasItems={activityNotifications.length > 0}
                    onRetry={loadMoreNotifications}
                    endMessage="Estás al día con tus notificaciones"
                />
            </div>
        </div>
    );
}
