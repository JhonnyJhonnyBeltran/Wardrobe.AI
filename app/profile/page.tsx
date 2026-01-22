'use client';

/**
 * Profile Page - Instagram Style (Social Only)
 * Perfil social limpio con avatar, estadísticas y pestañas
 */

import { motion } from 'framer-motion';
import { useUser } from '@/store/userStore';
import { Card } from '@/components';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Settings,
  Menu,
  Grid3x3,
  Shirt,
  Heart,
  MessageCircle
} from 'lucide-react';

type TabType = 'posts' | 'outfits';

export default function ProfilePage() {
  const { user } = useUser();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  // Real data state
  const [profileStats, setProfileStats] = useState({
    outfits: 0,
    followers: 0,
    following: 0
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [outfits, setOutfits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Only fetch if we have a valid UUID 
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        if (!isUuid) {
          setProfileStats({ outfits: 0, followers: 0, following: 0 });
          setPosts([]);
          setOutfits([]);
          setIsLoading(false);
          return;
        }

        // 1. Fetch Stats
        const { count: outfitCount } = await supabase
          .from('outfits')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id)
          .eq('status', 'accepted');

        const { count: followingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id)
          .eq('status', 'accepted');

        setProfileStats({
          outfits: outfitCount || 0,
          followers: followersCount || 0,
          following: followingCount || 0
        });

        // 2. Fetch Posts
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setPosts(postsData || []);

        // 3. Fetch Outfits
        const { data: outfitsData } = await supabase
          .from('outfits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setOutfits(outfitsData || []);

      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (!user) return null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      <motion.div
        className="max-w-4xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Header - Instagram Style */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] p-[3px] shadow-lg">
                  <div className="w-full h-full rounded-full bg-[var(--card-bg)] flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] bg-clip-text text-transparent">
                        {user.name[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side: Name, Settings, Stats */}
            <div className="flex-1 min-w-0 pt-1">
              {/* Name & Settings Row - Aligned with top of avatar */}
              <div className="flex items-center justify-between mb-3 pl-1">
                <h1 className="text-xl md:text-2xl font-bold text-[var(--foreground)] truncate mr-2 py-1">
                  {user.username ? `@${user.username}` : user.name}
                </h1>
                <Link href="/profile/settings">
                  <button className="p-2 -mr-2 rounded-full hover:bg-[var(--background-secondary)] transition-colors text-[var(--foreground-secondary)]">
                    <Menu className="w-6 h-6" />
                  </button>
                </Link>
              </div>

              {/* Stats - Below name */}
              <div className="flex justify-between items-center pr-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--foreground)] leading-tight">
                    {profileStats.outfits}
                  </div>
                  <div className="text-xs text-[var(--foreground-tertiary)]">
                    {t.profile.outfits}
                  </div>
                </div>
                <button className="text-center hover:opacity-80 transition-opacity">
                  <div className="text-lg font-bold text-[var(--foreground)] leading-tight">
                    {profileStats.followers}
                  </div>
                  <div className="text-xs text-[var(--foreground-tertiary)]">
                    {t.profile.followers}
                  </div>
                </button>
                <button className="text-center hover:opacity-80 transition-opacity">
                  <div className="text-lg font-bold text-[var(--foreground)] leading-tight">
                    {profileStats.following}
                  </div>
                  <div className="text-xs text-[var(--foreground-tertiary)]">
                    {t.profile.following}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="px-1 mb-4">
            <h2 className="font-bold text-[var(--foreground)] text-sm">{user.name}</h2>
            {user.bio && (
              <p className="text-sm text-[var(--foreground-secondary)] whitespace-pre-wrap mt-1 leading-snug">
                {user.bio}
              </p>
            )}
            {!user.bio && (
              <p className="text-sm text-[var(--foreground-tertiary)] italic mt-1">
                Sin biografía
              </p>
            )}
          </div>

          {/* Action Button */}
          <Link href="/profile/edit" className="block">
            <button className="w-full px-4 py-1.5 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] text-sm font-semibold text-[var(--foreground)] transition-colors border border-[var(--border-color)]">
              Editar
            </button>
          </Link>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="border-t border-[var(--border-color)] mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 border-t-2 transition-colors ${activeTab === 'posts'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
                }`}
            >
              <Grid3x3 className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">{t.profile.posts}</span>
            </button>
            <button
              onClick={() => setActiveTab('outfits')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 border-t-2 transition-colors ${activeTab === 'outfits'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
                }`}
            >
              <Shirt className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">{t.profile.outfits}</span>
            </button>
          </div>
        </motion.div>

        {/* Content Grid */}
        <motion.div variants={itemVariants}>
          {activeTab === 'posts' ? (
            // Posts Grid
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {posts.length === 0 ? (
                <div className="col-span-3 text-center py-16">
                  <Grid3x3 className="w-12 h-12 mx-auto mb-4 text-[var(--foreground-tertiary)]" />
                  <p className="text-[var(--foreground-secondary)] font-medium mb-2">
                    {t.profile.noPostsYet}
                  </p>
                  <p className="text-sm text-[var(--foreground-tertiary)]">
                    {t.profile.shareOutfits}
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <motion.div
                    key={post.id}
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-square bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)] rounded-lg overflow-hidden cursor-pointer group"
                  >
                    {post.image_url ? (
                      <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        👗
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1 text-white">
                        <Heart className="w-5 h-5 fill-white" />
                        <span className="font-semibold">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <MessageCircle className="w-5 h-5 fill-white" />
                        <span className="font-semibold">{post.comments}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            // Outfits Grid
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {outfits.length === 0 ? (
                <div className="col-span-3 text-center py-16">
                  <Shirt className="w-12 h-12 mx-auto mb-4 text-[var(--foreground-tertiary)]" />
                  <p className="text-[var(--foreground-secondary)] font-medium mb-2">
                    {t.profile.noPublicOutfits}
                  </p>
                  <p className="text-sm text-[var(--foreground-tertiary)] mb-4">
                    {t.profile.markOutfitsPublic}
                  </p>
                  <Link href="/closet">
                    <button className="px-6 py-2 rounded-full bg-[var(--brand-pink)] text-white font-semibold hover:opacity-90 transition-opacity">
                      {t.profile.goToCloset}
                    </button>
                  </Link>
                </div>
              ) : (
                outfits.map((outfit) => (
                  <motion.div
                    key={outfit.id}
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-square bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)] rounded-lg overflow-hidden cursor-pointer group"
                  >
                    {outfit.image_url ? (
                      <img
                        src={outfit.image_url}
                        alt={outfit.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        👔
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-semibold text-sm px-2 text-center">
                        {outfit.name}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
