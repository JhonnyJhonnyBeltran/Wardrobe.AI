'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Search, UserPlus, UserCheck, X, Clock, Users, Image as ImageIcon } from 'lucide-react';
import { useSocial, Profile } from '@/lib/hooks/useSocial';
import { Card, Button } from '@/components';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

interface Post {
  id: string;
  user_id: string;
  caption: string;
  image_url?: string;
  created_at: string;
  user: {
    full_name: string;
    username: string;
    avatar_url?: string;
  };
}

export default function SearchPage() {
  const { user } = useUser();
  const router = useRouter();
  const { searchUsers, followUser, unfollowUser } = useSocial();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [userResults, setUserResults] = useState<Profile[]>([]);
  const [postResults, setPostResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Cache of my following status: { [userId]: 'accepted' | 'pending' | null }
  const [myFollows, setMyFollows] = useState<Record<string, string>>({});

  // Real-time listener for MY outgoing actions (rejections/acceptances from others)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('search-page-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const targetId = payload.old.following_id;
            setMyFollows(prev => {
              const next = { ...prev };
              delete next[targetId];
              return next;
            });
          } else if (payload.eventType === 'UPDATE') {
            const targetId = payload.new.following_id;
            setMyFollows(prev => ({ ...prev, [targetId]: payload.new.status }));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    // Initial fetch of my follows
    const fetchMyFollows = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('follows')
        .select('following_id, status')
        .eq('follower_id', user.id);

      if (data) {
        const map: Record<string, string> = {};
        (data as any[]).forEach((f: any) => { map[f.following_id] = f.status; });
        setMyFollows(map);
      }
    };
    fetchMyFollows();
  }, [user]);

  // Fuzzy search helper - simple implementation
  const fuzzyMatch = (str: string, pattern: string): boolean => {
    const cleanStr = str.toLowerCase();
    const cleanPattern = pattern.toLowerCase();

    if (cleanStr.includes(cleanPattern)) return true;

    let patternIdx = 0;
    for (let i = 0; i < cleanStr.length && patternIdx < cleanPattern.length; i++) {
      if (cleanStr[i] === cleanPattern[patternIdx]) {
        patternIdx++;
      }
    }
    return patternIdx === cleanPattern.length;
  };

  // Handle Search & Initial Load
  useEffect(() => {
    const fetchContent = async () => {
      // 1. If empty query, fetch Explore Feed (random/trending)
      if (searchQuery.length < 2) {
        setIsSearching(searchQuery.length > 0); // Only show loading if user is typing 1 char

        // Fetch random/recent posts for explore feed
        const { data: posts } = await supabase
          .from('posts')
          .select(`
              id, user_id, caption, image_url, created_at,
              user:profiles!posts_user_id_fkey(full_name, username, avatar_url)
            `)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(21); // 3x7 grid

        setPostResults(posts as Post[] || []);
        setUserResults([]); // Clear users when not searching specific
        setIsSearching(false);
        return;
      }

      // 2. Perform Active Search
      setIsSearching(true);
      try {
        // Search Users
        const results = await searchUsers(searchQuery);
        setUserResults(results);

        // Search Posts
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            id, user_id, caption, image_url, created_at,
            user:profiles!posts_user_id_fkey(full_name, username, avatar_url)
          `)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(50);

        const filteredPosts = (posts || [])
          .filter((p: any) => fuzzyMatch(p.caption || '', searchQuery))
          .slice(0, 15);

        setPostResults(filteredPosts as Post[]);

      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchContent, 400); // 400ms debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleFollow = async (id: string) => {
    // Optimistic Update
    setMyFollows(prev => ({ ...prev, [id]: 'pending' }));

    const success = await followUser(id);
    if (!success) {
      // Revert if failed
      setMyFollows(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleCancelRequest = async (targetId: string) => {
    await unfollowUser(targetId);
    setMyFollows(prev => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
  };

  const hasResults = userResults.length > 0 || postResults.length > 0;

  // Swipe Navigation
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      // Swipe Left -> Next (Closet)
      router.push('/closet');
    } else if (info.offset.x > threshold) {
      // Swipe Right -> Prev (Feed/Home)
      router.push('/feed');
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[var(--background)] pb-24 md:pb-8 pt-6 px-4 touch-pan-y"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.05}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-2xl mx-auto">

        {/* Search Input Only - Sticky */}
        <div className="sticky top-0 z-50 bg-[var(--background)]/95 backdrop-blur-md pt-6 pb-2 -mx-4 px-4 mb-4 transition-all">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
            <input
              type="text"
              placeholder="Buscar por nombre o @usuario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-100 dark:bg-zinc-800 border-none focus:ring-0 focus:bg-gray-200 dark:focus:bg-zinc-700 transition-all outline-none text-sm font-medium placeholder:text-gray-400 text-[var(--foreground)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>


        {/* Results or Empty State */}
        <AnimatePresence mode="wait">
          {searchQuery.length < 2 && !isSearching ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-[var(--brand-pink)]" />
              </div>
              <p className="text-[var(--foreground-secondary)] font-medium mb-1 text-lg">
                Comienza a buscar
              </p>
              <p className="text-sm text-[var(--foreground-tertiary)] max-w-xs mx-auto">
                Encuentra usuarios por nombre o @usuario, o busca tus outfits favoritos.
              </p>
            </motion.div>
          ) : isSearching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 text-[var(--foreground-tertiary)]"
            >
              <div className="w-8 h-8 border-3 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Buscando...
            </motion.div>
          ) : !hasResults ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-12"
            >
              <p className="text-[var(--foreground-secondary)] font-medium mb-1">No se encontraron resultados</p>
              <p className="text-sm text-[var(--foreground-tertiary)]">Intenta con otra búsqueda</p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Users Section */}
              {userResults.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2 px-1">
                    Personas
                  </h2>
                  <div className="space-y-3">
                    {userResults.map((profile) => {
                      const status = myFollows[profile.id];
                      const isPending = status === 'pending';
                      const isFollowing = status === 'accepted';

                      return (
                        <Card key={profile.id} className="p-3 flex items-center justify-between hover:bg-[var(--background-secondary)]/50 transition-all border-[var(--border-color)] shadow-sm">
                          <Link href={`/profile/${profile.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--brand-pink)] to-orange-500 p-[2px] flex-shrink-0">
                              <div className="w-full h-full rounded-full bg-[var(--card-bg)] overflow-hidden">
                                {profile.avatar_url ? (
                                  <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-[var(--background-secondary)] text-lg font-bold">
                                    {(profile.full_name || '?')[0]}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-[var(--foreground)] truncate text-sm">
                                {profile.full_name}
                              </h3>
                              <p className="text-xs text-[var(--foreground-tertiary)] truncate">
                                @{profile.username}
                              </p>
                            </div>
                          </Link>

                          {isPending ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 px-4 text-xs font-medium hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 group transition-all"
                              onClick={() => handleCancelRequest(profile.id)}
                            >
                              <span className="group-hover:hidden">Pendiente</span>
                              <span className="hidden group-hover:inline">Cancelar</span>
                            </Button>
                          ) : isFollowing ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 px-4 text-xs font-medium bg-[var(--background-secondary)] text-[var(--foreground)]"
                            >
                              Siguiendo
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleFollow(profile.id)}
                              className="h-8 px-5 text-xs font-medium bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-md shadow-[var(--brand-pink)]/20 active:scale-95 transition-all"
                            >
                              Seguir
                            </Button>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Posts Section */}
              {postResults.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2 px-1">
                    Explorar Outfits
                  </h2>
                  <div className="grid grid-cols-3 gap-3 md:gap-6 box-border">
                    {postResults.map((post) => (
                      <Link
                        key={post.id}
                        href={`/post/${post.id}`}
                        className="relative aspect-square overflow-hidden bg-[var(--background-secondary)] group cursor-pointer md:rounded-xl"
                      >
                        {post.image_url ? (
                          <img
                            src={post.image_url}
                            alt={post.caption}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            👗
                          </div>
                        )}
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div >
  );
}
