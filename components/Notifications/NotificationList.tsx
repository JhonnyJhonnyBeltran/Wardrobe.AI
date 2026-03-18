'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, UserPlus, X, BellOff } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useRealtimeStore } from '@/store/realtimeStore';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { getRecentFollowActivity, followUser, unfollowUser, getMyFollowStatusMap, getFollowStatus } from '@/lib/services/followService';
import { LogoMark, Avatar } from '@/components';
import Link from 'next/link';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { useRouter } from 'next/navigation';

// Types
export interface Notification {
    id: string;
    type: 'like' | 'follow' | 'system';
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
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const markActivityAsViewed = useRealtimeStore(state => state.markActivityAsViewed);
    const { items: wardrobeItems } = useWardrobe(); // For Create Outfit check
    const [followMap, setFollowMap] = useState<Record<string, string>>({}); // Track follow status
    const router = useRouter();

    useEffect(() => {
        // Clear badge when component is mounted (viewed)
        markActivityAsViewed();
    }, [markActivityAsViewed]);

    // Fetch Follow Status Map on mount
    useEffect(() => {
        if (user?.id) {
            getMyFollowStatusMap(user.id).then((map) => {
                // Convert FollowDisplayStatus to string for simplicity in map
                const simplifiedMap: Record<string, string> = {};
                Object.entries(map).forEach(([key, val]) => simplifiedMap[key] = val);
                setFollowMap(simplifiedMap);
            });
        }
    }, [user?.id]);


    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchNotifications = async () => {
            // Always start loading when effect runs
            if (isMounted) setLoading(true);

            if (!user) {
                if (isMounted) setLoading(false);
                return;
            };

            const realNotifications: Notification[] = [];
            const now = new Date();

            // 1. System Notification - Every 9 days logic
            const lastMsgDate = localStorage.getItem('last_klozet_msg_date');
            const dismissedMsgId = localStorage.getItem('dismissed_system_msg_id');
            const nineDaysMs = 9 * 24 * 60 * 60 * 1000;
            const currentSystemMsgId = `sys-${Math.floor(now.getTime() / nineDaysMs)}`;

            let shouldShowSystemMsg = false;
            if (dismissedMsgId !== currentSystemMsgId) {
                if (!lastMsgDate) {
                    shouldShowSystemMsg = true;
                } else {
                    const last = new Date(lastMsgDate);
                    if (now.getTime() - last.getTime() > nineDaysMs) {
                        shouldShowSystemMsg = true;
                    }
                }
            }

            if (shouldShowSystemMsg) {
                realNotifications.push({
                    id: currentSystemMsgId,
                    type: 'system',
                    content: '¡Hola! Han pasado unos días. ¿Qué tal si subes tu outfit de hoy o le pides consejo a Kloe?',
                    time: 'Justo ahora',
                    timestamp: now.getTime(),
                    actor: { id: 'system', username: 'klozet', name: 'Klozet', avatar: '' }
                });
            }

            // 2. Fetch Follows (Real Data)
            try {
                const follows = await getRecentFollowActivity(user.id, 10);

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
                            time: new Date(f.created_at).toLocaleDateString(),
                            timestamp: new Date(f.created_at).getTime(),
                        });
                    });
                }

                // 3. Fetch Likes (Real Data)
                const { data: myPosts } = await supabase
                    .from('posts')
                    .select('id')
                    .eq('user_id', user.id);

                if (myPosts && myPosts.length > 0) {
                    const myPostIds = myPosts.map((p: any) => p.id);
                    const { data: likes } = await supabase
                        .from('likes')
                        .select(`
                  user_id, post_id, created_at,
                  user:user_id(id, full_name, username, avatar_url),
                  post:post_id(image_url)
               `)
                        .in('post_id', myPostIds)
                        .order('created_at', { ascending: false })
                        .limit(10);

                    if (likes) {
                        likes.forEach((l: any) => {
                            realNotifications.push({
                                id: `like_${l.user_id}_${l.post_id}`,
                                type: 'like',
                                actor: {
                                    id: l.user_id,
                                    username: l.user?.username || '',
                                    name: l.user?.full_name || l.user?.username || 'Usuario',
                                    avatar: l.user?.avatar_url || null
                                },
                                time: new Date(l.created_at).toLocaleDateString(),
                                timestamp: new Date(l.created_at).getTime(),
                                image: l.post?.image_url,
                                postId: l.post_id
                            });
                        });
                    }
                }

            } catch (err) {
                console.error("Error fetching activity", err);
            } finally {
                if (isMounted) setLoading(false);
            }

            // Sort by time (newest first)
            if (isMounted) {
                setNotifications(realNotifications.sort((a, b) => b.timestamp - a.timestamp));
            }
        };

        fetchNotifications();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [user]);

    const handleDismissSystem = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent triggering the main click
        localStorage.setItem('dismissed_system_msg_id', id);
        localStorage.setItem('last_klozet_msg_date', new Date().toISOString());
        setNotifications(prev => prev.filter(n => n.id !== id));
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
    const isEmpty = notifications.length === 0;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--brand-pink)] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 min-h-[50vh]">
                <div className="w-16 h-16 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-[var(--foreground-tertiary)]">
                    <BellOff className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg font-medium text-[var(--foreground)]">Estás al día</p>
                <p className="text-sm text-[var(--foreground-tertiary)]">No tienes notificaciones nuevas</p>
            </div>
        );
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

            {/* Seguidos */}
            {activityNotifications.filter(n => n.type === 'follow').length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">Seguidos</h2>
                    <div className="space-y-4">
                        {activityNotifications.filter(n => n.type === 'follow').map((notif) => (
                            <div key={notif.id} className="flex items-center gap-3 group">
                                <Link href={`/profile/${notif.actor!.id}`} className="relative" onClick={onClose}>
                                    <Avatar src={notif.actor?.avatar || null} alt={notif.actor!.name} size="md" />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[var(--background)] flex items-center justify-center text-white bg-[var(--brand-pink)]">
                                        <UserPlus className="w-2.5 h-2.5" />
                                    </div>
                                </Link>
                                <div className="flex-1 text-sm">
                                    <Link href={`/profile/${notif.actor!.id}`} onClick={onClose} className="font-semibold text-[var(--foreground)] hover:underline">
                                        {notif.actor!.name}
                                    </Link>
                                    <span className="text-[var(--foreground-secondary)]"> comenzó a seguirte.</span>
                                    <span className="text-[var(--foreground-tertiary)] text-xs ml-2 block sm:inline">{notif.time}</span>
                                </div>
                                <button
                                    onClick={() => handleFollow(notif.actor!.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap
                      ${(followMap[notif.actor!.id] === 'accepted' || followMap[notif.actor!.id] === 'pending')
                                            ? 'bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border-color)]'
                                            : 'bg-[var(--foreground)] text-[var(--background)]'}`}
                                >
                                    {followMap[notif.actor!.id] === 'accepted' ? 'Siguiendo' :
                                        followMap[notif.actor!.id] === 'pending' ? 'Solicitado' : 'Seguir'}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Likes */}
            {activityNotifications.filter(n => n.type === 'like').length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">Likes</h2>
                    <div className="space-y-4">
                        {activityNotifications.filter(n => n.type === 'like').map((notif) => (
                            <div key={notif.id} className="flex items-center gap-3 group">
                                <Link href={`/profile/${notif.actor!.id}`} className="relative" onClick={onClose}>
                                    <Avatar src={notif.actor?.avatar || null} alt={notif.actor!.name} size="md" />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[var(--background)] flex items-center justify-center text-white bg-[#FF3040]">
                                        <Heart className="w-2.5 h-2.5 fill-current" />
                                    </div>
                                </Link>
                                <div className="flex-1 text-sm">
                                    <Link href={`/profile/${notif.actor!.id}`} onClick={onClose} className="font-semibold text-[var(--foreground)] hover:underline">
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
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
