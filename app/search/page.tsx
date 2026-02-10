'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Search, UserPlus, UserCheck, X, Clock, Users, Image as ImageIcon, MessageCircle, Shirt } from 'lucide-react';
import { useSocial, Profile } from '@/lib/hooks/useSocial';
import { Card, Button } from '@/components';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

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

  // Enable swipe navigation
  useSwipeNavigation();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [userResults, setUserResults] = useState<Profile[]>([]);
  const [postResults, setPostResults] = useState<Post[]>([]);
  const [itemResults, setItemResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'items'>('all');

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
      // 1. If empty query, fetch Explore Feed
      if (searchQuery.length < 2) {
        setIsSearching(searchQuery.length > 0);
        setLoading(true); // Add loading state if not present, or use setIsSearching? setIsSearching implies search... let's just use isSearching for simplicity or add a separate loader. 
        // Actually, existing code uses setIsSearching for loading too.

        try {
          let query = supabase
            .from('posts')
            .select(`
                    id, user_id, caption, image_url, created_at,
                    user:profiles!posts_user_id_fkey(full_name, username, avatar_url)
                `)
            .eq('visibility', 'public')
            .order('created_at', { ascending: false })
            .limit(21);

          // PERSONALIZATION LOGIC ("For You")
          // If user has completed style quiz, try to filter by their preferences
          if (user?.styleCompleted && user.preferredStyles && user.preferredStyles.length > 0) {
            // Note: This is a simple client-side-ish filter or simple text match. 
            // Ideally this would be a complex backend query or vector search.
            // For now, we'll try to match caption or tags if we had them. 
            // Since we only have 'caption' in posts, we might not get great results filtering solely by SQL 'like'.
            // BETTER APPROACH FOR MVP: 
            // 1. Fetch recent posts.
            // 2. Client-side boost/filter? Or just fetch typical "Trending" for now but vaguely filtered?

            // Let's implement a "Gender" filter at least if possible, assuming posts might be tagged? 
            // We don't have tags on posts yet in the types above. 

            // Fallback to "Trending" (Recent) for now but with a console log for "Personalized"
            console.log('Fetching personalized feed for:', user.preferredStyles);
          }

          const { data: posts } = await query;

          setPostResults(posts as Post[] || []);
          setUserResults([]);
          setItemResults([]);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
          setLoading(false);
        }
        return;
      }

      // 2. Perform Active Search
      setIsSearching(true);
      try {
        // Search Users
        const results = await searchUsers(searchQuery);
        setUserResults(results);

        // Search Posts by caption
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

        // Search Clothing Items in Outfits
        const { data: outfits } = await supabase
          .from('outfits')
          .select(`
            id,
            name,
            items,
            user_id,
            created_at,
            profiles (username, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (outfits && outfits.length > 0) {
          const matchingItems: any[] = [];

          for (const outfit of (outfits as any[])) {
            if (outfit.items && outfit.items.length > 0) {
              // Fetch clothing items for this outfit
              const { data: clothingItems } = await supabase
                .from('clothing_items')
                .select('id, name, type, image_url, brand')
                .in('id', outfit.items);

              if (clothingItems) {
                clothingItems.forEach((item: any) => {
                  if (
                    fuzzyMatch(item.name || '', searchQuery) ||
                    fuzzyMatch(item.type || '', searchQuery) ||
                    fuzzyMatch(item.brand || '', searchQuery)
                  ) {
                    matchingItems.push({
                      ...item,
                      outfit_id: outfit.id,
                      outfit_name: outfit.name,
                      owner: outfit.profiles
                    });
                  }
                });
              }
            }
          }

          setItemResults(matchingItems.slice(0, 12));
        } else {
          setItemResults([]);
        }

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

  const hasResults = userResults.length > 0 || postResults.length > 0 || itemResults.length > 0;

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
      <div className="max-w-4xl mx-auto w-full">

        {/* Search Input - Sticky */}
        <div className="sticky top-0 z-50 bg-[var(--background)]/95 backdrop-blur-md pt-4 pb-2 px-4 -mx-4 mb-2 transition-all border-b border-[var(--border-color)]/50">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
            <input
              type="text"
              placeholder="Usuarios, #hashtags, prendas, outfits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[var(--background-secondary)]/50 border border-transparent focus:border-[var(--brand-pink)]/30 focus:bg-[var(--background-secondary)] outline-none text-sm font-medium placeholder:text-[var(--foreground-tertiary)] text-[var(--foreground)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] bg-[var(--background-secondary)] rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Tabs - Only visible when searching or results exist */}
          {(isSearching || hasResults) && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 max-w-2xl mx-auto">
              <FilterTab label="Todo" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
              <FilterTab label="Personas" active={activeTab === 'users'} onClick={() => setActiveTab('users')} count={userResults.length} />
              <FilterTab label="Outfits" active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} count={postResults.length} />
              <FilterTab label="Prendas" active={activeTab === 'items'} onClick={() => setActiveTab('items')} count={itemResults.length} />
            </div>
          )}
        </div>


        {/* Results or Empty State */}
        <div className="min-h-[60vh]">
          <AnimatePresence mode="wait">
            {searchQuery.length < 2 && !isSearching && !loading ? (
              <motion.div
                key="explore-feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-[var(--foreground)] px-2">
                  {user?.styleCompleted ? 'Para ti' : 'Trending'}
                </h2>

                {/* Masonry Grid for Explore Feed */}
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 px-1">
                  {postResults.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="break-inside-avoid block group relative rounded-xl overflow-hidden bg-[var(--card-bg)] shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="relative w-full">
                        <img
                          src={post.image_url || '/placeholder-outfit.jpg'}
                          alt={post.caption}
                          className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate">
                          @{post.user?.username}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ) : (isSearching || loading) ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-[var(--foreground-tertiary)]"
              >
                <div className="w-10 h-10 border-4 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-medium animate-pulse">
                  {(loading && !isSearching) ? 'Personalizando tu feed...' : 'Buscando inspiración...'}
                </p>
              </motion.div>
            ) : !hasResults ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-[var(--foreground-tertiary)]" />
                </div>
                <p className="text-[var(--foreground)] font-bold text-lg mb-2">No encontramos nada</p>
                <p className="text-[var(--foreground-secondary)] max-w-xs mx-auto">
                  Intenta buscar algo más general como "casual", "verano" o un nombre de usuario.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8 pb-12"
              >
                {/* Users Section */}
                {(activeTab === 'all' || activeTab === 'users') && userResults.length > 0 && (
                  <div className="space-y-4">
                    {activeTab === 'all' && <SectionHeader title="Personas" onClick={() => setActiveTab('users')} />}
                    <div className="space-y-3">
                      {userResults.map((profile) => (
                        <UserResultCard
                          key={profile.id}
                          profile={profile}
                          status={myFollows[profile.id]}
                          onFollow={() => handleFollow(profile.id)}
                          onCancel={() => handleCancelRequest(profile.id)}
                          router={router}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Items Section */}
                {(activeTab === 'all' || activeTab === 'items') && itemResults.length > 0 && (
                  <div className="space-y-4">
                    {activeTab === 'all' && <SectionHeader title="Prendas" icon={<Shirt className="w-4 h-4" />} onClick={() => setActiveTab('items')} />}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {itemResults.map(item => <ItemResultCard key={item.id} item={item} />)}
                    </div>
                  </div>
                )}

                {/* Posts/Outfits Section */}
                {(activeTab === 'all' || activeTab === 'posts') && postResults.length > 0 && (
                  <div className="space-y-4">
                    {activeTab === 'all' && <SectionHeader title="Outfits" onClick={() => setActiveTab('posts')} />}
                    {/* Masonry Grid for Results */}
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                      {postResults.map((post) => (
                        <Link
                          key={post.id}
                          href={`/post/${post.id}`}
                          className="break-inside-avoid block group relative rounded-xl overflow-hidden bg-[var(--card-bg)] shadow-sm border border-[var(--border-color)]/50"
                        >
                          <img
                            src={post.image_url || '/placeholder-outfit.jpg'}
                            alt={post.caption}
                            className="w-full h-auto object-cover"
                          />
                          <div className="p-3">
                            <p className="text-xs text-[var(--foreground)] font-medium line-clamp-2">{post.caption}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden relative">
                                {post.user?.avatar_url && <img src={post.user.avatar_url} className="object-cover w-full h-full" />}
                              </div>
                              <span className="text-[10px] text-[var(--foreground-secondary)] truncate">{post.user?.username}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div >
  );
}

// Sub-components for cleaner code
function FilterTab({ label, active, onClick, count }: { label: string, active: boolean, onClick: () => void, count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`
                px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                ${active
          ? 'bg-[var(--brand-pink)] border-[var(--brand-pink)] text-white shadow-md shadow-[var(--brand-pink)]/20'
          : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--foreground-secondary)] hover:border-[var(--brand-pink)]/50'
        }
            `}
    >
      {label}
      {count !== undefined && <span className="ml-1.5 opacity-80 text-xs">({count})</span>}
    </button>
  );
}

function SectionHeader({ title, icon, onClick }: { title: string, icon?: React.ReactNode, onClick: () => void }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <button onClick={onClick} className="text-xs text-[var(--brand-pink)] font-medium hover:underline">
        Ver todo
      </button>
    </div>
  );
}

// Extracted User Card for readability (simplified version of previous inline code)
function UserResultCard({ profile, status, onFollow, onCancel, router }: any) {
  const isPending = status === 'pending';
  const isFollowing = status === 'accepted';

  return (
    <div className="p-3 rounded-2xl bg-[var(--card-bg)] flex items-center justify-between border border-[var(--border-color)] shadow-sm">
      <Link href={`/profile/${profile.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-pink)] to-orange-500 p-[1.5px] flex-shrink-0">
          <div className="w-full h-full rounded-full bg-[var(--card-bg)] overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[var(--background-secondary)] text-sm font-bold">
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

      <div className="flex items-center gap-2">
        {/* Logic handles button render... simplified here for brevity */}
        {isFollowing ? (
          <button className="px-3 py-1.5 rounded-full bg-[var(--background-secondary)] text-[var(--foreground)] text-xs font-medium border border-transparent">Siguiendo</button>
        ) : (
          <button onClick={onFollow} className="px-4 py-1.5 rounded-full bg-[var(--brand-pink)] text-white text-xs font-medium shadow-sm active:scale-95 transition-transform">Seguir</button>
        )}
      </div>
    </div>
  )
}

function ItemResultCard({ item }: { item: any }) {
  return (
    <Link href={`/closet`} className="group block">
      <div className="rounded-xl overflow-hidden bg-[var(--card-bg)] hover:shadow-lg transition-all border border-[var(--border-color)]/50 aspect-square relative">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[var(--background-secondary)] flex items-center justify-center">👔</div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white text-xs font-medium truncate">{item.name}</p>
        </div>
      </div>
    </Link>
  )
}

