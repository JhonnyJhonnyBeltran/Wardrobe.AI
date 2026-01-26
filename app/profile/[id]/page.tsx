'use client';

/**
 * Public Profile Page - View another user's profile
 */

import { motion } from 'framer-motion';
import { useUser } from '@/store/userStore';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Grid3x3,
  Shirt,
  Heart,
  MessageCircle,
  UserPlus,
  UserCheck,
  UserMinus,
  Clock,
  MoreHorizontal,
  Send
} from 'lucide-react';

type TabType = 'posts' | 'outfits';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio?: string;
}

export default function PublicProfilePage() {
  const { user: currentUser } = useUser();
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [isFollowedByMe, setIsFollowedByMe] = useState(false);

  // Stats
  const [profileStats, setProfileStats] = useState({
    outfits: 0,
    followers: 0,
    following: 0
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [outfits, setOutfits] = useState<any[]>([]);

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === profileId;

  useEffect(() => {
    if (isOwnProfile) {
      router.replace('/profile');
      return;
    }
    fetchProfileData();
  }, [profileId, currentUser]);

  const fetchProfileData = async () => {
    if (!profileId) return;

    try {
      setIsLoading(true);

      // 1. Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError || !profileData) {
        router.push('/404');
        return;
      }

      setProfile(profileData);

      // 2. Fetch stats
      const { count: outfitCount } = await supabase
        .from('outfits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId)
        .eq('is_public', true);

      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileId)
        .eq('status', 'accepted');

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileId)
        .eq('status', 'accepted');

      setProfileStats({
        outfits: outfitCount || 0,
        followers: followersCount || 0,
        following: followingCount || 0
      });

      // 3. Fetch posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });

      setPosts(postsData || []);

      // 4. Fetch public outfits
      const { data: outfitsData } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', profileId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      setOutfits(outfitsData || []);

      // 5. Check follow status
      if (currentUser) {
        const { data: followData } = await supabase
          .from('follows')
          .select('status')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileId)
          .single();

        if (followData) {
          setFollowStatus(followData.status as 'pending' | 'accepted');
          setIsFollowedByMe(followData.status === 'accepted');
        }
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !profileId) return;

    // Optimistic update
    setFollowStatus('pending');

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: currentUser.id,
        following_id: profileId,
        status: 'pending'
      });

    if (error) {
      setFollowStatus('none');
      console.error('Error following:', error);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || !profileId) return;

    // Optimistic update
    const previousStatus = followStatus;
    setFollowStatus('none');
    setIsFollowedByMe(false);

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUser.id)
      .eq('following_id', profileId);

    if (error) {
      setFollowStatus(previousStatus);
      setIsFollowedByMe(previousStatus === 'accepted');
      console.error('Error unfollowing:', error);
    } else {
      // Update follower count
      setProfileStats(prev => ({
        ...prev,
        followers: Math.max(0, prev.followers - 1)
      }));
    }
  };

  const navigateToChat = () => {
    router.push(`/messages/${profileId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1">
              <ArrowLeft className="w-6 h-6 text-[var(--foreground)]" />
            </button>
            <h1 className="text-lg font-bold text-[var(--foreground)]">
              @{profile.username}
            </h1>
          </div>
          <button className="p-2">
            <MoreHorizontal className="w-5 h-5 text-[var(--foreground)]" />
          </button>
        </div>
      </div>

      <motion.div
        className="max-w-4xl mx-auto px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Profile Header */}
        <div className="mb-6">
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] p-[3px] shadow-lg flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[var(--card-bg)] flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || ''}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] bg-clip-text text-transparent">
                    {(profile.full_name || profile.username || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 pt-1">
              <div className="flex justify-around items-center mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--foreground)]">
                    {profileStats.outfits}
                  </div>
                  <div className="text-xs text-[var(--foreground-tertiary)]">
                    {t.profile.outfits}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--foreground)]">
                    {profileStats.followers}
                  </div>
                  <div className="text-xs text-[var(--foreground-tertiary)]">
                    {t.profile.followers}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--foreground)]">
                    {profileStats.following}
                  </div>
                  <div className="text-xs text-[var(--foreground-tertiary)]">
                    {t.profile.following}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mb-4">
            <h2 className="font-bold text-[var(--foreground)] text-sm">
              {profile.full_name || profile.username}
            </h2>
            {profile.bio && (
              <p className="text-sm text-[var(--foreground-secondary)] whitespace-pre-wrap mt-1">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {followStatus === 'none' ? (
              <button
                onClick={handleFollow}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-pink)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <UserPlus className="w-4 h-4" />
                Seguir
              </button>
            ) : followStatus === 'pending' ? (
              <button
                onClick={handleUnfollow}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--background-secondary)] text-[var(--foreground)] font-semibold text-sm border border-[var(--border-color)] hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-900/20 transition-colors"
              >
                <Clock className="w-4 h-4" />
                Pendiente
              </button>
            ) : (
              <button
                onClick={handleUnfollow}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--background-secondary)] text-[var(--foreground)] font-semibold text-sm border border-[var(--border-color)] hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-900/20 transition-colors"
              >
                <UserMinus className="w-4 h-4" />
                Dejar de seguir
              </button>
            )}

            <button
              onClick={navigateToChat}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--background-secondary)] text-[var(--foreground)] font-semibold text-sm border border-[var(--border-color)] hover:bg-[var(--background-tertiary)] transition-colors"
            >
              <Send className="w-4 h-4 -rotate-45" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-[var(--border-color)] mb-6">
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
        </div>

        {/* Content Grid */}
        {activeTab === 'posts' ? (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {posts.length === 0 ? (
              <div className="col-span-3 text-center py-16">
                <Grid3x3 className="w-12 h-12 mx-auto mb-4 text-[var(--foreground-tertiary)]" />
                <p className="text-[var(--foreground-secondary)]">Sin publicaciones</p>
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
                    <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1 text-white">
                      <Heart className="w-5 h-5 fill-white" />
                      <span className="font-semibold">{post.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white">
                      <MessageCircle className="w-5 h-5 fill-white" />
                      <span className="font-semibold">{post.comments || 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {outfits.length === 0 ? (
              <div className="col-span-3 text-center py-16">
                <Shirt className="w-12 h-12 mx-auto mb-4 text-[var(--foreground-tertiary)]" />
                <p className="text-[var(--foreground-secondary)]">Sin outfits públicos</p>
              </div>
            ) : (
              outfits.map((outfit) => (
                <motion.div
                  key={outfit.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-square bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)] rounded-lg overflow-hidden cursor-pointer group"
                >
                  {outfit.image_url ? (
                    <img src={outfit.image_url} alt={outfit.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">👔</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-semibold text-sm px-2 text-center">{outfit.name}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
