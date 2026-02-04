'use client';

/**
 * Followers/Following List Page
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserMinus, UserPlus, UserCheck, Clock } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

interface FollowUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

type ListType = 'followers' | 'following';

export default function FollowListPage() {
  const { user: currentUser } = useUser();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const profileId = params.id as string;
  const initialTab = (searchParams.get('tab') as ListType) || 'followers';

  const [activeTab, setActiveTab] = useState<ListType>(initialTab);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState('');

  // Track my follow status for each user
  const [myFollowStatus, setMyFollowStatus] = useState<Record<string, 'none' | 'pending' | 'accepted'>>({});

  const isOwnProfile = currentUser?.id === profileId;

  useEffect(() => {
    fetchData();
  }, [profileId, currentUser]);

  const fetchData = async () => {
    if (!profileId) return;
    setLoading(true);

    try {
      // Get profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', profileId)
        .single();

      if (profile) {
        const p = profile as any;
        setProfileName(p.full_name || p.username || '');
      }

      // Fetch followers
      const { data: followersData } = await supabase
        .from('follows')
        .select(`
          follower:profiles!follower_id(id, username, full_name, avatar_url)
        `)
        .eq('following_id', profileId)
        .eq('status', 'accepted');

      if (followersData) {
        setFollowers(followersData.map((f: any) => f.follower).filter(Boolean));
      }

      // Fetch following
      const { data: followingData } = await supabase
        .from('follows')
        .select(`
          following:profiles!following_id(id, username, full_name, avatar_url)
        `)
        .eq('follower_id', profileId)
        .eq('status', 'accepted');

      if (followingData) {
        setFollowing(followingData.map((f: any) => f.following).filter(Boolean));
      }

      // Get my follow statuses
      if (currentUser) {
        const { data: myFollows } = await supabase
          .from('follows')
          .select('following_id, status')
          .eq('follower_id', currentUser.id);

        if (myFollows) {
          const statusMap: Record<string, 'none' | 'pending' | 'accepted'> = {};
          (myFollows as any[]).forEach((f: any) => {
            statusMap[f.following_id] = f.status as 'pending' | 'accepted';
          });
          setMyFollowStatus(statusMap);
        }
      }
    } catch (error) {
      console.error('Error fetching follow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!currentUser) return;

    setMyFollowStatus(prev => ({ ...prev, [userId]: 'pending' }));

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: currentUser.id,
        following_id: userId,
        status: 'pending'
      } as any);

    if (error) {
      setMyFollowStatus(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!currentUser) return;

    const previousStatus = myFollowStatus[userId];
    setMyFollowStatus(prev => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });

    // If unfollowing from own following list, also remove from UI
    if (isOwnProfile && activeTab === 'following') {
      setFollowing(prev => prev.filter(u => u.id !== userId));
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUser.id)
      .eq('following_id', userId);

    if (error) {
      setMyFollowStatus(prev => ({ ...prev, [userId]: previousStatus }));
      if (isOwnProfile && activeTab === 'following') {
        fetchData(); // Refetch to restore
      }
    }
  };

  const handleRemoveFollower = async (followerId: string) => {
    if (!currentUser) return;

    // Remove from UI optimistically
    setFollowers(prev => prev.filter(u => u.id !== followerId));

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', currentUser.id);

    if (error) {
      fetchData(); // Refetch to restore
    }
  };

  const currentList = activeTab === 'followers' ? followers : following;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-[var(--border-color)]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-6 h-6 text-[var(--foreground)]" />
          </button>
          <h1 className="text-lg font-bold text-[var(--foreground)]">
            {profileName}
          </h1>
        </div>

        {/* Tabs */}
        <div className="max-w-lg mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('followers')}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${activeTab === 'followers'
                ? 'text-[var(--brand-pink)] border-b-2 border-[var(--brand-pink)]'
                : 'text-[var(--foreground-tertiary)]'
                }`}
            >
              Seguidores ({followers.length})
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${activeTab === 'following'
                ? 'text-[var(--brand-pink)] border-b-2 border-[var(--brand-pink)]'
                : 'text-[var(--foreground-tertiary)]'
                }`}
            >
              Siguiendo ({following.length})
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-12 text-[var(--foreground-tertiary)]">
            {activeTab === 'followers' ? 'Sin seguidores' : 'No sigue a nadie'}
          </div>
        ) : (
          <div className="space-y-2">
            {currentList.map((user) => {
              const status = myFollowStatus[user.id];
              const isMe = user.id === currentUser?.id;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
                >
                  <Link
                    href={isMe ? '/profile' : `/profile/${user.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-[var(--background-secondary)] overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--foreground-secondary)] font-bold">
                          {(user.full_name || user.username || '?')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)] text-sm truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-[var(--foreground-tertiary)] truncate">
                        {user.full_name}
                      </p>
                    </div>
                  </Link>

                  {/* Actions */}
                  {!isMe && (
                    <div className="flex gap-2">
                      {/* Follow/Unfollow button */}
                      {status === 'accepted' ? (
                        <button
                          onClick={() => handleUnfollow(user.id)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--brand-pink)]/5 text-[var(--brand-pink)] text-xs font-semibold border border-[var(--brand-pink)]/20 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Siguiendo
                        </button>
                      ) : status === 'pending' ? (
                        <button
                          onClick={() => handleUnfollow(user.id)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--background-secondary)] text-[var(--foreground-tertiary)] text-xs font-semibold border border-[var(--border-color)] hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Clock className="w-3 h-3 inline mr-1" />
                          Pendiente
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollow(user.id)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--brand-pink)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          Seguir
                        </button>
                      )}

                      {/* Remove follower (only on own profile, followers tab) */}
                      {isOwnProfile && activeTab === 'followers' && (
                        <button
                          onClick={() => handleRemoveFollower(user.id)}
                          className="p-1.5 rounded-lg text-[var(--foreground-tertiary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Eliminar seguidor"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
