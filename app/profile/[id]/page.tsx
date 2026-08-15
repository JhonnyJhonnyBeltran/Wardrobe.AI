'use client';

/**
 * Public Profile Page - View another user's profile
 * Styled exactly like "My Profile"
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/store/userStore';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/lib/supabase/client';
import * as followService from '@/lib/services/followService';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Grid3x3,
  UserPlus,
  UserMinus,
  Clock,
  MoreHorizontal,
  Send,
  Loader2,
  Lock
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
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [outfits, setOutfits] = useState<any[]>([]);
  const isMutual = isFollowedByMe && followStatus === 'accepted';

  // Stats
  const [profileStats, setProfileStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });
  const [posts, setPosts] = useState<any[]>([]);

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
      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      const followersCount = await followService.getFollowersCount(profileId);
      const followingCount = await followService.getFollowingCount(profileId);

      setProfileStats({
        posts: postCount || 0,
        followers: followersCount,
        following: followingCount
      });

      // 3. Fetch posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });

      setPosts(postsData || []);

      // 4. Check follow status
      if (currentUser) {
        const status = await followService.getFollowStatus(currentUser.id, profileId);
        setFollowStatus(status);
        setIsFollowedByMe(status === 'accepted');
        
        // 5. Check if user is blocked
        const blocked = await followService.isBlocked(currentUser.id, profileId);
        setIsBlocked(blocked);

        // 6. Fetch Outfits if mutual
        if (status === 'accepted') {
          // Check if it's mutual by getting if they follow us
          const mutualStatus = await followService.getFollowStatus(profileId, currentUser.id);
          setIsFollowedByMe(mutualStatus === 'accepted');

          if (mutualStatus === 'accepted') {
            const { data: outfitsData } = await supabase
              .from('outfits')
              .select('*')
              .eq('user_id', profileId)
              .order('created_at', { ascending: false });
            
            setOutfits(outfitsData || []);
          }
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
    setFollowStatus('accepted');
    setIsFollowedByMe(true);

    const result = await followService.followUser(currentUser.id, profileId);

    if (!result.success) {
      setFollowStatus('none');
      setIsFollowedByMe(false);
      console.error('Error following:', result.error);
    } else {
      // Update follower count
      setProfileStats(prev => ({
        ...prev,
        followers: prev.followers + 1
      }));
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || !profileId) return;

    // Optimistic update
    const previousStatus = followStatus;
    setFollowStatus('none');
    setIsFollowedByMe(false);

    const result = await followService.unfollowUser(currentUser.id, profileId);

    if (!result.success) {
      setFollowStatus(previousStatus);
      setIsFollowedByMe(previousStatus === 'accepted');
      console.error('Error unfollowing:', result.error);
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

  const handleBlock = async () => {
    if (!currentUser || !profileId) return;
    
    const confirmed = confirm('¿Estás seguro de que quieres bloquear a este usuario?');
    if (!confirmed) return;
    
    setIsBlocking(true);
    
    if (isBlocked) {
      // Unblock the user
      const result = await followService.unblockUser(currentUser.id, profileId);
      if (result.success) {
        setIsBlocked(false);
      } else {
        console.error('Error unblocking:', result.error);
      }
    } else {
      // Block the user
      const result = await followService.blockUser(currentUser.id, profileId);
      if (result.success) {
        setIsBlocked(true);
        // Navigate away after blocking
        router.push('/feed');
      } else {
        console.error('Error blocking:', result.error);
      }
    }
    
    setIsBlocking(false);
    setShowOptions(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-pink)]" />
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-[var(--background)] pb-24">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]/50">
          <div className="flex items-center justify-between px-4 h-14 w-full md:max-w-[70%] mx-auto">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-1 -ml-1 hover:bg-[var(--background-secondary)] rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-[var(--foreground)]" />
              </button>
              <span className="font-bold text-[var(--foreground)] truncate max-w-[200px] sm:max-w-[280px]">
                Usuario bloqueado
              </span>
            </div>
          </div>
        </header>

        <main className="w-full md:max-w-[70%] mx-auto flex flex-col items-center justify-center pt-32 px-4 text-center">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Has bloqueado a este usuario</h2>
          <p className="text-[var(--foreground-secondary)] mb-8 max-w-sm mx-auto">
            No puedes ver las publicaciones ni los outfits de los usuarios que has bloqueado. Ellos tampoco pueden ver tu perfil ni interactuar contigo.
          </p>
          <button
            onClick={handleBlock}
            disabled={isBlocking}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[var(--brand-pink)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {isBlocking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Desbloquear'}
          </button>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]/50">
        <div className="flex items-center justify-between px-4 h-14 w-full md:max-w-[70%] mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 -ml-1 hover:bg-[var(--background-secondary)] rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-[var(--foreground)]" />
            </button>
            <span className="font-bold text-[var(--foreground)] truncate max-w-[200px] sm:max-w-[280px]">
              {profile.username || 'Perfil'}
            </span>
          </div>
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 -mr-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors relative"
          >
            <MoreHorizontal className="w-6 h-6 text-[var(--foreground)]" />
            
            {showOptions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--background)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden">
                <button
                  onClick={handleBlock}
                  disabled={isBlocking}
                  className="w-full px-4 py-3 text-left text-sm font-semibold flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                   {isBlocking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isBlocked ? (
                    <>Desbloquear usuario</>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Bloquear usuario
                    </>
                  )}
                </button>
              </div>
            )}
          </button>
        </div>
      </header>

      <main className="w-full md:max-w-[70%] mx-auto">
        {/* Profile Info */}
        <div className="px-5 pt-6">
          <div className="flex items-center gap-8 mb-6">
            {/* Avatar - Exact Style */}
            <div className="w-24 h-24 rounded-full bg-gray-200 p-0.5 shadow-lg flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[var(--background)] p-0.5">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || ''}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center">
                    <span className="text-3xl md:text-4xl font-bold text-white">
                      {(profile.full_name || profile.username || '?')[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats - Exact Style */}
            <div className="flex-1 flex justify-around text-center">
              <div>
                <div className="font-bold text-lg">{profileStats.posts}</div>
                <div className="text-xs text-[var(--foreground-secondary)]">Posts</div>
              </div>
              <div>
                {isFollowedByMe ? (
                  <Link href={`/profile/${profileId}/follows?tab=followers`} className="block hover:opacity-80 transition-opacity">
                    <div className="font-bold text-lg">{profileStats.followers}</div>
                    <div className="text-xs text-[var(--foreground-secondary)]">{t.profile.followers || 'Seguidores'}</div>
                  </Link>
                ) : (
                  <div>
                    <div className="font-bold text-lg">{profileStats.followers}</div>
                    <div className="text-xs text-[var(--foreground-secondary)]">{t.profile.followers || 'Seguidores'}</div>
                  </div>
                )}
              </div>
              <div>
                {isFollowedByMe ? (
                  <Link href={`/profile/${profileId}/follows?tab=following`} className="block hover:opacity-80 transition-opacity">
                    <div className="font-bold text-lg">{profileStats.following}</div>
                    <div className="text-xs text-[var(--foreground-secondary)]">{t.profile.following || 'Seguidos'}</div>
                  </Link>
                ) : (
                  <div>
                    <div className="font-bold text-lg">{profileStats.following}</div>
                    <div className="text-xs text-[var(--foreground-secondary)]">{t.profile.following || 'Seguidos'}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pb-6 border-b border-[var(--border-color)]">
            <h2 className="font-bold text-sm">{profile.full_name || profile.username}</h2>
            {profile.bio && (
              <p className="text-sm text-[var(--foreground-secondary)] whitespace-pre-wrap mt-1">
                {profile.bio}
              </p>
            )}
            
            {/* Action Buttons - Similar to Edit Profile button style */}
            <div className="flex flex-wrap gap-2 mt-4">
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  Pendiente
                </button>
              ) : (
                <button
                  onClick={handleUnfollow}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors"
                >
                  Siguiendo
                </button>
              )}

              <button
                onClick={navigateToChat}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors"
              >
                Mensaje
              </button>
            </div>
          </div>
        </div>

        {/* Tabs - Exact Style */}
        <div className="sticky top-14 z-20 bg-[var(--background)]">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${activeTab === 'posts'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
                }`}
            >
              <Grid3x3 className={`w-6 h-6 ${activeTab === 'posts' ? 'text-[var(--brand-pink)]' : ''}`} />
            </button>
            {isMutual && (
              <button
                onClick={() => setActiveTab('outfits')}
                className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${activeTab === 'outfits'
                  ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                  : 'border-transparent text-[var(--foreground-tertiary)]'
                  }`}
              >
                <span className={`text-xl ${activeTab === 'outfits' ? '' : 'grayscale opacity-60'}`}>👗</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Grid - Exact Style */}
        <div className="min-h-[40vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'posts' ? (
              <motion.div
                key="posts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-0.5"
              >
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-4">
                      <Grid3x3 className="w-8 h-8 text-[var(--foreground-tertiary)]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Aún no hay publicaciones</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-0.5">
                    {posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/post/${post.id}`}
                        className="aspect-square bg-[var(--background-secondary)] relative block z-0 transition-all duration-300 hover:scale-[1.05] hover:z-10 hover:shadow-xl hover:rounded-md"
                      >
                        {post.image_url ? (
                          <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="outfits"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                {outfits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-5xl mb-4 grayscale opacity-60">👗</div>
                    <h3 className="text-lg font-semibold mb-2">No hay outfits</h3>
                    <p className="text-[var(--foreground-secondary)]">Este usuario aún no ha creado ningún outfit.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {outfits.map((outfit) => (
                      <Link
                        key={outfit.id}
                        href={`/outfit/${outfit.id}`}
                        className="bg-[var(--background-secondary)] rounded-2xl p-4 flex flex-col gap-2 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl group"
                      >
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[var(--background)] flex items-center justify-center border border-[var(--border-color)]">
                           {/* Simple Outfit preview with the first 4 items or a placeholder icon */}
                           {outfit.items && Array.isArray(outfit.items) && outfit.items.length > 0 ? (
                             <div className="w-full h-full relative">
                                <img src={outfit.items[0]?.image_url || '/placeholder.png'} alt="Outfit item" className="w-full h-full object-cover" />
                             </div>
                           ) : (
                             <span className="text-4xl group-hover:scale-110 transition-transform duration-300">👗</span>
                           )}
                        </div>
                        <h4 className="font-semibold text-sm truncate px-1 mt-1">{outfit.name || 'Outfit guardado'}</h4>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

