'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Bookmark, Share2, Send } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function PostCard({ post, onClick }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [isSaved, setIsSaved] = useState(post.isSaved || false);
    const [likeCount, setLikeCount] = useState(post.likes);

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLiked) {
            setLikeCount(prev => prev - 1);
        } else {
            setLikeCount(prev => prev + 1);
        }
        setIsLiked(!isLiked);
        // TODO: Call API to toggle like
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaved(!isSaved);
        // TODO: Call API to toggle save
    };

    return (
        <div onClick={onClick} className="break-inside-avoid mb-4 group relative rounded-2xl overflow-hidden bg-[var(--card-bg)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="relative w-full">
                {/* Helper for aspect ratio - simple auto height */}
                <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={500}
                    height={600}
                    className="w-full h-auto object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />

                {/* Overlay Gradient (visible on hover) */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top Right Save Button */}
                <button
                    onClick={handleSave}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 
            ${isSaved ? 'bg-[var(--brand-pink)] text-white' : 'bg-black/30 text-white hover:bg-black/50'}
            opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
          `}
                >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
            </div>

            <div className="p-3">
                <h3 className="font-semibold text-sm text-[var(--foreground)] truncate">{post.title}</h3>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <div className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-200">
                            <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
                        </div>
                        <span className="text-xs text-[var(--foreground-secondary)] truncate max-w-[80px]">{post.author.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={handleLike} className="flex items-center gap-1 group/like">
                            <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-[#FF3040] text-[#FF3040]' : 'text-[var(--foreground-tertiary)] group-hover/like:text-[var(--foreground)]'}`} />
                            <span className="text-xs text-[var(--foreground-tertiary)]">{likeCount}</span>
                        </button>

                        <button onClick={(e) => {
                            e.stopPropagation();
                            // Share Logic: Navigate to messages with post context
                            const shareData = encodeURIComponent(JSON.stringify({
                                type: 'post',
                                id: post.id,
                                title: post.title,
                                image: post.imageUrl
                            }));
                            window.location.href = `/messages?share_post=${shareData}`;
                        }} className="flex items-center gap-1 group/share">
                            <Send className="w-4 h-4 text-[var(--foreground-tertiary)] group-hover/share:text-[var(--foreground)] -rotate-45 translate-y-[1px] translate-x-[1px]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
