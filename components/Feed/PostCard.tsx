'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

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

    // If no image, show text card
    if (!post.imageUrl) {
        return (
            <Link href={`/post/${post.id}`}>
                <div
                    className="break-inside-avoid mb-6 group relative rounded-2xl overflow-hidden bg-[var(--card-bg)] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer p-6 flex flex-col gap-4 border border-[var(--border-color)]"
                >
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                            <Image src={post.author.avatar || '/placeholder-avatar.png'} alt={post.author.name} fill className="object-cover" />
                        </div>
                        <span className="text-xs font-medium text-[var(--foreground-secondary)]">{post.author.name}</span>
                    </div>
                    <p className="text-[var(--foreground)] font-serif text-lg leading-relaxed line-clamp-4">
                        {post.title || post.description}
                    </p>
                    <div className="flex items-center gap-1 text-[var(--foreground-tertiary)] text-xs mt-auto">
                        <Heart className="w-3 h-3" />
                        <span>{post.likes}</span>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/post/${post.id}`}>
            <div
                className="break-inside-avoid mb-6 group relative rounded-2xl overflow-hidden bg-[var(--card-bg)] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative w-full">
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

                    {/* Minimal Info on Hover */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-2 text-white/90">
                            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/20">
                                <Image src={post.author.avatar || '/placeholder-avatar.png'} alt={post.author.name} fill className="object-cover" />
                            </div>
                            <span className="text-xs font-medium truncate max-w-[100px]">{post.author.name}</span>
                        </div>
                        {post.likes > 0 && (
                            <div className="flex items-center gap-1 text-white/90 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                <Heart className="w-3 h-3 fill-white/50" />
                                <span className="text-xs">{post.likes}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
