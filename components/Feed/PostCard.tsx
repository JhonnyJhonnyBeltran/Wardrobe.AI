'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import { useUiStore } from '@/store/uiStore';

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
}

interface PostCardProps {
    post: Post;
    onClick?: () => void;
}

/**
 * PostCard - Minimalista estilo Pinterest via User Request.
 * Sin botones visibles. Clic navega al detalle.
 */
export default function PostCard({ post, onClick }: PostCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isSavedState, setIsSavedState] = useState(post.isSaved || false);
    const { showSaveToast, openFolderModal } = useUiStore();

    const toggleQuickSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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
            } catch (err) {
                console.error(err);
                setIsSavedState(previousState);
            }
        } else {
            // Unsave
            try {
                const res = await fetch(`/api/saves?post_id=${post.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Unsave failed');
            } catch (err) {
                console.error(err);
                setIsSavedState(previousState);
            }
        }
    };

    // If no image, show text card
    if (!post.imageUrl) {
        return (
            <Link href={`/post/${post.id}`}>
                <div
                    className="break-inside-avoid mb-6 group relative rounded-2xl overflow-hidden bg-[var(--card-bg)] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer p-6 flex flex-col gap-4 border border-[var(--border-color)]"
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
            </Link>
        );
    }

    return (
        <Link href={`/post/${post.id}`}>
            <div
                className="break-inside-avoid mb-6 group relative rounded-2xl overflow-hidden bg-[var(--card-bg)] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative w-full h-full flex flex-col">
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={500}
                        height={600}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    />

                    {/* Gradient Overlay - Always visible for text readability or removed if user wants clean */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                    {/* Add Save Quick Action to PostCard */}
                    <button
                        onClick={toggleQuickSave}
                        className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 ${isSavedState ? 'bg-[var(--brand-pink)] shadow-[var(--brand-pink)]/40 opacity-100' : 'bg-black/40 hover:bg-black/60 opacity-0'
                            }`}
                    >
                        <Bookmark className={`w-5 h-5 ${isSavedState ? 'fill-white text-white' : 'text-white'}`} strokeWidth={isSavedState ? 2 : 2.5} />
                    </button>

                    {/* Minimal Info on Hover */}
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
            </div>
        </Link>
    );
}
