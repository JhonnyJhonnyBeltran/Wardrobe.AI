'use client';

import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, ExternalLink, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { Post } from './PostCard';
import { Button } from '@/components';

interface GarmentModalProps {
    post: Post | null;
    isOpen: boolean;
    onClose: () => void;
}

const SWIPE_CLOSE_THRESHOLD = 80;

// Mock Garments - Just items, no prices
const MOCK_GARMENTS = [
    { id: 'g1', name: 'Camiseta de Algodón', brand: 'Básico', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200' },
    { id: 'g2', name: 'Chaqueta Denim', brand: 'Vintage', image: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=200' },
    { id: 'g3', name: 'Sneakers Blancas', brand: 'Deportivo', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
];

export default function OutfitDetailsModal({ post, isOpen, onClose }: GarmentModalProps) {
    if (!isOpen || !post) return null;

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        if (info.offset.y > SWIPE_CLOSE_THRESHOLD || info.velocity.y > 300) onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content - Contexto §6C: Swipe down to close */}
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={{ top: 0, bottom: 0.5 }}
                    onDragEnd={handleDragEnd}
                    className="relative z-10 w-full md:max-w-4xl h-[85vh] md:h-[80vh] bg-[var(--background)] rounded-t-[32px] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
                >
                    {/* Close Button Mobile */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md md:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Image Section */}
                    <div className="relative w-full md:w-1/2 h-1/2 md:h-full bg-black">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                            <h2 className="text-white text-2xl font-bold">{post.title}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <Image
                                    src={post.author.avatar}
                                    alt={post.author.name}
                                    width={24}
                                    height={24}
                                    className="rounded-full border border-white/50"
                                />
                                <span className="text-white/90 text-sm">por {post.author.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details / Garments Section */}
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[var(--background)]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-[var(--foreground-secondary)]" />
                                Prendas del Outfit
                            </h3>
                            {/* Close Button Desktop */}
                            <button
                                onClick={onClose}
                                className="hidden md:block p-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-[var(--foreground-secondary)]" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {MOCK_GARMENTS.map((garment) => (
                                <div key={garment.id} className="flex gap-4 p-3 rounded-2xl border border-[var(--border-color)] transition-colors group bg-[var(--card-bg)]">
                                    <div className="relative w-24 h-24 flex-shrink-0 bg-[var(--background-secondary)] rounded-xl overflow-hidden">
                                        <Image
                                            src={garment.image}
                                            alt={garment.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <span className="text-xs text-[var(--foreground-tertiary)] font-medium uppercase tracking-wider">{garment.brand}</span>
                                        <h4 className="font-semibold text-[var(--foreground)] mb-1">{garment.name}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-[var(--background-secondary)]/50 rounded-2xl text-center">
                            <p className="text-sm text-[var(--foreground-secondary)]">
                                ¿Te gusta este estilo?
                            </p>
                            <Button className="w-full mt-3" glow>
                                Guardar en mi armario
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
