'use client';

/**
 * Home - Social Feed (Friends' Outfits)
 * Now with 2 images per post (swipeable)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Plus } from 'lucide-react';
import { mockSocialPosts, type SocialPost } from '@/data/mockData';
import Link from 'next/link';
import { Logo } from '@/components';

export default function Home() {
  const [posts, setPosts] = useState<SocialPost[]>(mockSocialPosts);
  const [currentImages, setCurrentImages] = useState<Record<string, number>>({}); //Track which image is showing per post

  const handleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
  };

  const toggleImage = (postId: string) => {
    setCurrentImages(prev => ({
      ...prev,
      [postId]: prev[postId] === 1 ? 0 : 1,
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass-strong border-b border-[var(--border-color)] px-4 py-3"
      >
        <div className="flex items-center justify-center max-w-2xl mx-auto">
          <Logo size="md" />
        </div>
      </motion.div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-8">
        {posts.map((post, index) => {
          const currentImageIndex = currentImages[post.id] || 0;
          const images = [post.images.outfit, post.images.items];

          return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3"
            >
              {/* User Info */}
              <div className="flex items-center gap-3">
                <img
                  src={post.user.avatar}
                  alt={post.user.name}
                  className="w-10 h-10 rounded-full border-2 border-[var(--brand-pink)]"
                />
                <div className="flex-1">
                  <p className="font-bold text-sm text-[var(--foreground)]">{post.user.name}</p>
                  <p className="text-xs text-[var(--foreground-tertiary)]">{post.user.username}</p>
                </div>
                {!post.user.isFriend && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] font-semibold">
                    Amiga de amiga
                  </span>
                )}
              </div>

              {/* Outfit Images (Swipeable) */}
              <div className="relative">
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-[var(--background-secondary)] cursor-pointer group">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => toggleImage(post.id)}
                    className="w-full h-full"
                  >
                    <img
                      src={images[currentImageIndex]}
                      alt={currentImageIndex === 0 ? post.outfit.name : 'Prendas del outfit'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </motion.div>

                  {/* Image indicator dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImages(prev => ({ ...prev, [post.id]: idx }));
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex
                          ? 'bg-white w-6'
                          : 'bg-white/50'
                          }`}
                      />
                    ))}
                  </div>

                  {/* Image label */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full glass-strong">
                    <span className="text-xs font-bold text-[var(--foreground)]">
                      {currentImageIndex === 0 ? 'Outfit' : 'Prendas'}
                    </span>
                  </div>

                  {/* Tap instruction (first time) */}
                  {!currentImages[post.id] && index === 0 && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ delay: 2, duration: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none"
                    >
                      <div className="px-4 py-2 rounded-full bg-white/90 text-black text-sm font-semibold">
                        Toca para ver las prendas
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5"
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${post.isLiked
                      ? 'fill-[var(--brand-pink)] stroke-[var(--brand-pink)]'
                      : 'stroke-[var(--foreground)]'
                      }`}
                  />
                  <span className="text-sm font-semibold text-[var(--foreground)]">{post.likes}</span>
                </motion.button>

                <Link href={`/post/${post.id}`} className="flex items-center gap-1.5">
                  <MessageCircle className="w-6 h-6 stroke-[var(--foreground)]" />
                  <span className="text-sm font-semibold text-[var(--foreground)]">{post.comments}</span>
                </Link>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSave(post.id)}
                  className="ml-auto"
                >
                  <Bookmark
                    className={`w-6 h-6 transition-colors ${post.isSaved
                      ? 'fill-[var(--brand-pink)] stroke-[var(--brand-pink)]'
                      : 'stroke-[var(--foreground)]'
                      }`}
                  />
                </motion.button>
              </div>

              {/* Caption */}
              {post.caption && (
                <p className="text-sm text-[var(--foreground)]">
                  <span className="font-bold">{post.user.username}</span>{' '}
                  {post.caption}
                </p>
              )}
            </motion.article>
          );
        })}
      </div>

      {/* Floating Create Button */}
      <Link href="/create">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-20 md:bottom-8 right-4 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center shadow-[var(--shadow-float-strong)] z-50"
        >
          <Plus className="w-8 h-8 text-white" strokeWidth={3} />
        </motion.button>
      </Link>
    </div>
  );
}
