'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Bookmark, Send } from 'lucide-react';
import { hapticLight } from '@/lib/utils/haptic';

export interface Post {
    id: string;
    imageUrl: string;
    title: string;
    author: {
        name: string;
        avatar: string;
    };
    likes: number;
    comments: number;
    isLiked?: boolean;
    isSaved?: boolean;
}

interface PostCardProps {
    post: Post;
    onClick?: () => void;
}

/**
 * PostCard - Contexto §6B: Solo foto en grid. Botones sobre imagen con blur (cristal).
 * Like activo = Klozet Pink. Border radius pronunciado (rounded-xl / 16px).
 */
export default function PostCard({ post, onClick }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [isSaved, setIsSaved] = useState(post.isSaved || false);
    const [likeCount, setLikeCount] = useState(post.likes);

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        hapticLight();
        if (isLiked) setLikeCount(prev => prev - 1);
        else setLikeCount(prev => prev + 1);
        setIsLiked(!isLiked);
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        hapticLight();
        setIsSaved(!isSaved);
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareData = encodeURIComponent(JSON.stringify({
            type: 'post',
            id: post.id,
            title: post.title,
            image: post.imageUrl
        }));
        window.location.href = `/messages?share_post=${shareData}`;
    };

    return (
        <div
            onClick={onClick}
            className="break-inside-avoid mb-4 group relative rounded-xl overflow-hidden bg-[var(--card-bg)] shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
        >
            {/* Solo imagen en grid - Contexto: limpieza de metadatos */}
            <div className="relative w-full">
                <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={500}
                    height={600}
                    className="w-full h-auto object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />

                {/* Botones sobre imagen: blur (cristal) - Contexto §6B */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-md border border-white/30 dark:border-white/10">
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-1 text-[var(--foreground)]"
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : ''}`} />
                            <span className="text-xs font-medium tabular-nums">{likeCount}</span>
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 pointer-events-auto
                        ${isSaved
                            ? 'bg-[var(--brand-pink)] text-white'
                            : 'bg-white/70 dark:bg-black/50 backdrop-blur-md border border-white/30 dark:border-white/10 text-[var(--foreground)] hover:bg-white/90 dark:hover:bg-black/70'
                        }`}
                >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>

                <button
                    onClick={handleShare}
                    className="absolute top-2.5 right-14 p-2 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-md border border-white/30 dark:border-white/10 text-[var(--foreground)] hover:bg-white/90 dark:hover:bg-black/70 transition-all duration-200 pointer-events-auto"
                >
                    <Send className="w-4 h-4 -rotate-45 translate-y-[1px] translate-x-[1px]" />
                </button>
            </div>
        </div>
    );
}
