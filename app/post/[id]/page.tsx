'use client';

/**
 * Post Detail Page with Chat
 * Shows outfit details + comments/chat
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Bookmark, Send, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockSocialPosts, mockUsers } from '@/data/mockData';
import Link from 'next/link';

interface Comment {
    id: string;
    user: typeof mockUsers[0];
    text: string;
    createdAt: Date;
    likes: number;
    isLiked: boolean;
}

const mockComments: Comment[] = [
    {
        id: '1',
        user: mockUsers[1],
        text: '¡Me encanta este look! 😍',
        createdAt: new Date(2025, 11, 28, 10, 30),
        likes: 12,
        isLiked: false,
    },
    {
        id: '2',
        user: mockUsers[2],
        text: '¿De dónde es la camisa?',
        createdAt: new Date(2025, 11, 28, 11, 15),
        likes: 3,
        isLiked: true,
    },
    {
        id: '3',
        user: mockUsers[3],
        text: 'Perfecta combinación 💕',
        createdAt: new Date(2025, 11, 28, 14, 20),
        likes: 8,
        isLiked: false,
    },
];

export default function PostPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [post] = useState(mockSocialPosts[0]); // In real app, fetch by params.id
    const [comments, setComments] = useState<Comment[]>(mockComments);
    const [newComment, setNewComment] = useState('');
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [isSaved, setIsSaved] = useState(post.isSaved);
    const [likes, setLikes] = useState(post.likes);
    const [currentImage, setCurrentImage] = useState(0);

    const handleSendComment = () => {
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now().toString(),
            user: mockUsers[0], // Current user
            text: newComment,
            createdAt: new Date(),
            likes: 0,
            isLiked: false,
        };

        setComments([...comments, comment]);
        setNewComment('');
    };

    const toggleLike = () => {
        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
    };

    const toggleCommentLike = (commentId: string) => {
        setComments(comments.map(c =>
            c.id === commentId
                ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
                : c
        ));
    };

    const images = [post.images.outfit, post.images.items];

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-40 glass-strong border-b border-[var(--border-color)] px-4 py-3"
            >
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <button onClick={() => router.back()} className="flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold text-sm">Volver</span>
                    </button>
                    <button>
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            <div className="max-w-2xl mx-auto">
                {/* Post Content */}
                <div className="px-4 pt-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4">
                        <img
                            src={post.user.avatar}
                            alt={post.user.name}
                            className="w-12 h-12 rounded-full border-2 border-[var(--brand-pink)]"
                        />
                        <div className="flex-1">
                            <p className="font-bold text-sm text-[var(--foreground)]">{post.user.name}</p>
                            <p className="text-xs text-[var(--foreground-tertiary)]">{post.user.username}</p>
                        </div>
                        <button className="px-4 py-2 rounded-full bg-[var(--brand-pink)] text-white text-sm font-semibold">
                            Seguir
                        </button>
                    </div>

                    {/* Images */}
                    <div className="relative mb-4">
                        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-[var(--background-secondary)]">
                            <motion.div
                                key={currentImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setCurrentImage(currentImage === 0 ? 1 : 0)}
                                className="w-full h-full cursor-pointer"
                            >
                                <img
                                    src={images[currentImage]}
                                    alt={post.outfit.name}
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImage(idx);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImage ? 'bg-white w-6' : 'bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Label */}
                            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full glass-strong">
                                <span className="text-xs font-bold">
                                    {currentImage === 0 ? 'Outfit' : 'Prendas'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mb-4">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleLike}
                            className="flex items-center gap-1.5"
                        >
                            <Heart
                                className={`w-6 h-6 transition-colors ${isLiked
                                        ? 'fill-[var(--brand-pink)] stroke-[var(--brand-pink)]'
                                        : 'stroke-[var(--foreground)]'
                                    }`}
                            />
                            <span className="text-sm font-semibold">{likes}</span>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsSaved(!isSaved)}
                            className="ml-auto"
                        >
                            <Bookmark
                                className={`w-6 h-6 transition-colors ${isSaved
                                        ? 'fill-[var(--brand-pink)] stroke-[var(--brand-pink)]'
                                        : 'stroke-[var(--foreground)]'
                                    }`}
                            />
                        </motion.button>
                    </div>

                    {/* Caption */}
                    <div className="mb-4">
                        <p className="text-sm text-[var(--foreground)]">
                            <span className="font-bold">{post.user.username}</span> {post.caption}
                        </p>
                        <p className="text-xs text-[var(--foreground-tertiary)] mt-1">{post.outfit.name}</p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[var(--border-color)] mb-4" />

                    {/* Comments Header */}
                    <p className="text-sm font-bold text-[var(--foreground)] mb-4">
                        Comentarios ({comments.length})
                    </p>

                    {/* Comments */}
                    <div className="space-y-4 mb-4">
                        {comments.map((comment, index) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex gap-3"
                            >
                                <img
                                    src={comment.user.avatar}
                                    alt={comment.user.name}
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <div className="bg-[var(--background-secondary)] rounded-2xl px-4 py-2">
                                        <p className="font-bold text-sm text-[var(--foreground)]">{comment.user.username}</p>
                                        <p className="text-sm text-[var(--foreground)]">{comment.text}</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 px-4">
                                        <button
                                            onClick={() => toggleCommentLike(comment.id)}
                                            className={`text-xs font-semibold ${comment.isLiked ? 'text-[var(--brand-pink)]' : 'text-[var(--foreground-tertiary)]'
                                                }`}
                                        >
                                            {comment.likes > 0 && `${comment.likes} `}Me gusta
                                        </button>
                                        <button className="text-xs font-semibold text-[var(--foreground-tertiary)]">
                                            Responder
                                        </button>
                                        <span className="text-xs text-[var(--foreground-tertiary)] ml-auto">
                                            {formatTime(comment.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comment Input (Fixed) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--background)] border-t border-[var(--border-color)] p-4 pb-safe">
                <div className="max-w-2xl mx-auto flex gap-3 items-center">
                    <img
                        src={mockUsers[0].avatar}
                        alt="You"
                        className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                            placeholder="Añade un comentario..."
                            className="w-full px-4 py-2.5 pr-12 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                        />
                        <button
                            onClick={handleSendComment}
                            disabled={!newComment.trim()}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center ${newComment.trim()
                                    ? 'bg-[var(--brand-pink)] text-white'
                                    : 'bg-[var(--background-tertiary)] text-[var(--foreground-tertiary)]'
                                }`}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return 'Ahora';
}
