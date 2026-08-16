'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Users, Image as ImageIcon, UserPlus, Check } from 'lucide-react';
import PostCard, { type Post } from '@/components/Feed/PostCard';
import { EmptyState } from '@/components';
import { supabase } from '@/lib/supabase/client';

import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import Link from 'next/link';
import { useRef, useCallback } from 'react';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [userResults, setUserResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [pendingRequestIds, setPendingRequestIds] = useState<Set<string>>(new Set());
  const { user } = useUser();
  const { showModal } = useUiStore();

  // Pagination states
  const [postsLoadingMore, setPostsLoadingMore] = useState(false);
  const [usersLoadingMore, setUsersLoadingMore] = useState(false);
  const [postsHasMore, setPostsHasMore] = useState(true);
  const [usersHasMore, setUsersHasMore] = useState(true);

  const postsPageRef = useRef(0);
  const usersPageRef = useRef(0);
  const POSTS_PER_PAGE = 8;
  const USERS_PER_PAGE = 10;

  const postsObserverElement = useRef<HTMLDivElement | null>(null);
  const usersObserverElement = useRef<HTMLDivElement | null>(null);



  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  // Initial load 
  useEffect(() => {
    setLoading(true);
    if (debouncedQuery.trim()) {
      // Unified search - fetch both posts and users simultaneously
      const cleanQuery = debouncedQuery.trim();
      Promise.all([
        searchPosts(cleanQuery, false),
        searchUsers(cleanQuery, false)
      ]).finally(() => setLoading(false));
    } else {
      // Fetch default trending/popular posts when no query
      setUserResults([]);
      searchPosts('', false).finally(() => setLoading(false));
    }
  }, [debouncedQuery]);


  const searchUsers = useCallback(async (searchTerm: string, isLoadMore = false) => {
    const currentPage = isLoadMore ? usersPageRef.current + 1 : 0;
    const from = currentPage * USERS_PER_PAGE;
    const to = from + USERS_PER_PAGE - 1;

    try {
      if (isLoadMore) setUsersLoadingMore(true);
      let query = supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .range(from, to);

      if (user?.id) {
        query = query.neq('id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const newData = data || [];
      if (isLoadMore) {
        setUserResults(prev => [...prev, ...newData]);
      } else {
        setUserResults(newData);
      }

      // Update followingIds
      if (user && newData.length > 0) {
        const statuses = await import('@/lib/services/followService').then(m => m.getMyFollowStatusMap(user.id));
        setFollowingIds(prev => {
          const next = new Set(prev);
          newData.forEach((u: any) => {
            if (statuses[u.id] === 'accepted') {
              next.add(u.id);
            }
          });
          return next;
        });
      }

      setUsersHasMore(newData.length === USERS_PER_PAGE);
      usersPageRef.current = currentPage;
    } catch (error) {
      console.error('Error searching users:', error);
      if (!isLoadMore) setUserResults([]);
    } finally {
      if (isLoadMore) setUsersLoadingMore(false);
    }
  }, [user?.id]);

  // Follow/Unfollow user
  const handleFollow = async (targetUserId: string) => {
    if (!user) return;

    const isFollowing = followingIds.has(targetUserId);
    const isPending = pendingRequestIds.has(targetUserId);

    // Find the user in results to check if profile is private
    const targetUser = userResults.find(u => u.id === targetUserId);
    const isPrivate = false; // is_private column doesn't exist

    if (isFollowing) {
      showModal({
        title: 'Dejar de seguir',
        message: `¿Estás seguro que quieres dejar de seguir a @${targetUser?.username || 'este usuario'}?`,
        type: 'confirm',
        confirmText: 'Dejar de seguir',
        cancelText: 'Cancelar',
        onConfirm: async () => {
          try {
            await supabase
              .from('follows')
              .delete()
              .eq('follower_id', user.id)
              .eq('following_id', targetUserId);

            setFollowingIds(prev => {
              const next = new Set(prev);
              next.delete(targetUserId);
              return next;
            });
          } catch (error) {
            console.error('Error unfollowing:', error);
          }
        }
      });
      return;
    }

    try {
      if (isPending) {
        // Cancel follow request
        await supabase
          .from('follow_requests')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        setPendingRequestIds(prev => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
      } else {
        // Follow - check if profile is private
        if (isPrivate) {
          // Create follow request for private profile
          await supabase
            .from('follow_requests')
            .insert({
              follower_id: user.id,
              following_id: targetUserId,
              status: 'pending'
            } as any);

          setPendingRequestIds(prev => new Set(prev).add(targetUserId));
          alert('Solicitud de seguimiento enviada. El usuario debe aceptar tu solicitud.');
        } else {
          // Auto-follow public profile
          await supabase
            .from('follows')
            .insert({
              follower_id: user.id,
              following_id: targetUserId,
              status: 'accepted'
            } as any);

          setFollowingIds(prev => new Set(prev).add(targetUserId));
        }
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };

  const searchPosts = useCallback(async (searchTerm: string, isLoadMore = false) => {
    const currentPage = isLoadMore ? postsPageRef.current + 1 : 0;
    const from = currentPage * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    try {
      if (isLoadMore) setPostsLoadingMore(true);
      let data: any[] | null = null;

      if (!searchTerm.trim()) {
        // Default: Explore / Discovery Feed
        let postsQuery = supabase
          .from('posts')
          .select(`
                        id,
                        caption,
                        image_url,
                        created_at,
                        user_id,
                        style_ids,
                        profiles (
                            username,
                            avatar_url,
                            morphology,
                            colorimetry
                        ),
                        outfits (
                            name,
                            outfit_items (
                                clothing_items (
                                    image_url
                                )
                            )
                        ),
                        likes (count)
                    `);

        // We removed the strict .overlaps filter so the feed isn't empty if styles don't perfectly match.
        // The client-side sorting algorithm will still prioritize matches!

        const { data: recentData } = await postsQuery
          .order('created_at', { ascending: false })
          .range(from, to);

        if (recentData) {
          data = recentData.sort((a: any, b: any) => {
            let scoreA = 0;
            let scoreB = 0;

            // 1. Likes weight
            scoreA += (a.likes?.[0]?.count || 0) * 0.5;
            scoreB += (b.likes?.[0]?.count || 0) * 0.5;

            // 2. Morphology match
            if (user?.morphology && a.profiles?.morphology === user.morphology) scoreA += 5;
            if (user?.morphology && b.profiles?.morphology === user.morphology) scoreB += 5;

            // 3. Colorimetry match
            if (user?.colorimetry && a.profiles?.colorimetry === user.colorimetry) scoreA += 5;
            if (user?.colorimetry && b.profiles?.colorimetry === user.colorimetry) scoreB += 5;

            // 4. Style match (exact overlap count could give more points)
            if (user?.preferredStyles && a.style_ids) {
                const overlapA = a.style_ids.filter((s: string) => user.preferredStyles!.includes(s)).length;
                scoreA += overlapA * 2;
            }
            if (user?.preferredStyles && b.style_ids) {
                const overlapB = b.style_ids.filter((s: string) => user.preferredStyles!.includes(s)).length;
                scoreB += overlapB * 2;
            }

            return scoreB - scoreA;
          });
        }
      } else {
        // Search posts by caption (description)
        const { data: searchData } = await supabase
          .from('posts')
          .select(`
            id,
            caption,
            image_url,
            created_at,
            user_id,
            outfits (
                name,
                outfit_items (
                    clothing_items (
                        image_url
                    )
                )
            ),
            likes (count)
        `)
          .ilike('caption', `%${searchTerm}%`)
          .order('created_at', { ascending: false })
          .range(from, to);

        data = searchData;
      }

      if (data && data.length > 0) {
        // Fetch profiles manually
        const userIds = [...new Set(data.map(p => p.user_id))];
        let profilesMap: Record<string, any> = {};

        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);

          if (profilesData) {
            profilesData.forEach((p: any) => {
              profilesMap[p.id] = p;
            });
          }
        }

        const formattedPosts = data.map((item: any) => {
          let displayImage = item.image_url;
          let title = item.caption || 'Sin título';
          let authorName = 'Usuario';
          let authorAvatar = '/placeholder-avatar.png';
          let likesCount = 0;

          // Get profile from map
          const profile = profilesMap[item.user_id];
          if (profile) {
            authorName = profile.username;
            authorAvatar = profile.avatar_url;
          }

          likesCount = item.likes?.[0]?.count || 0;
          title = item.caption || item.outfits?.name || 'Sin título';

          if (!displayImage && item.outfits?.outfit_items?.length > 0) {
            const itemWithImage = item.outfits.outfit_items.find((oi: any) => oi.clothing_items?.image_url);
            if (itemWithImage) {
              displayImage = itemWithImage.clothing_items.image_url;
            }
          }

          return {
            id: item.id,
            imageUrl: displayImage,
            title: title,
            author: {
              name: authorName,
              avatar: authorAvatar
            },
            likes: likesCount,
            comments: 0, // Placeholder
            isLiked: false, // Placeholder
            user_id: item.user_id,
            description: item.caption // Added description
          };
        });

        if (isLoadMore) {
          setResults(prev => [...prev, ...formattedPosts]);
        } else {
          setResults(formattedPosts);
        }

        setPostsHasMore(data.length === POSTS_PER_PAGE);
        postsPageRef.current = currentPage;
      } else if (!isLoadMore) {
        setResults([]);
        setPostsHasMore(false);
      }

    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      if (isLoadMore) setPostsLoadingMore(false);
    }
  }, []);

  const loadMoreUsers = useCallback(() => {
    if (loading || usersLoadingMore || !usersHasMore) return;
    searchUsers(debouncedQuery, true);
  }, [loading, usersLoadingMore, usersHasMore, debouncedQuery, searchUsers]);

  const loadMorePosts = useCallback(() => {
    if (loading || postsLoadingMore || !postsHasMore) return;
    searchPosts(debouncedQuery, true);
  }, [loading, postsLoadingMore, postsHasMore, debouncedQuery, searchPosts]);

  // Infinite Scroll Observers
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === usersObserverElement.current && usersHasMore && !usersLoadingMore && !loading) {
            loadMoreUsers();
          } else if (entry.target === postsObserverElement.current && postsHasMore && !postsLoadingMore && !loading) {
            loadMorePosts();
          }
        }
      });
    }, { threshold: 0.1 });

    if (usersObserverElement.current) observer.observe(usersObserverElement.current);
    if (postsObserverElement.current) observer.observe(postsObserverElement.current);

    return () => observer.disconnect();
  }, [loadMoreUsers, loadMorePosts, usersHasMore, postsHasMore, usersLoadingMore, postsLoadingMore, loading]);

  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-[var(--background)] pb-24">
      {/* Floating Header */}
      <div className="fixed top-4 md:top-6 left-0 right-0 z-[4980] px-4 pointer-events-none flex justify-center">
        <div className="w-full max-w-2xl pointer-events-auto">
          <div className="relative w-full rounded-full bg-[var(--background)]/90 backdrop-blur-xl border border-[var(--border-color)] shadow-lg overflow-hidden transition-all duration-300 focus-within:shadow-xl focus-within:border-[var(--brand-pink)]">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-secondary)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar estilos, prendas, usuarios..."
              className="search-input-no-outline w-full bg-transparent py-4 pl-14 pr-12 text-base font-medium text-[var(--foreground)] placeholder-[var(--foreground-tertiary)]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-[var(--background-secondary)] rounded-full hover:scale-110 transition-transform"
              >
                <X className="w-4 h-4 text-[var(--foreground-secondary)]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-3 md:px-6 pt-24 sm:pt-28 pb-4 flex flex-col gap-6 sm:gap-8 min-w-0">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <>
            {/* NO RESULTS STATE */}
            {!loading && userResults.length === 0 && results.length === 0 && query && (
              <EmptyState
                icon={SearchIcon}
                title="Sin resultados"
                description={`No se encontraron resultados para "${query}"`}
                fullHeight={false}
              />
            )}

            {/* USER RESULTS */}
            {userResults.length > 0 && (
              <div className="space-y-3">
                {userResults.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden"
                  >
                    <Link href={`/profile/${user.username || user.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                      <img
                        src={user.avatar_url || '/placeholder-avatar.png'}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[var(--background)] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--foreground)] truncate">
                          {user.full_name || user.username}
                        </h3>
                        <p className="text-sm text-[var(--foreground-secondary)] truncate">
                          @{user.username}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleFollow(user.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-opacity flex-shrink-0 ${followingIds.has(user.id)
                        ? 'bg-[var(--background)] text-[var(--foreground)] border border-[var(--border-color)]'
                        : 'bg-[var(--brand-pink)] text-white hover:opacity-90'
                        }`}
                    >
                      {followingIds.has(user.id) ? 'Siguiendo' : 'Seguir'}
                    </button>
                  </div>
                ))}

                {/* Users Loading More Trigger */}
                {!loading && (
                  <div ref={usersObserverElement} className="flex justify-center py-2 h-8">
                    {usersLoadingMore && <div className="animate-spin w-5 h-5 border-2 border-[var(--brand-pink)] border-t-transparent rounded-full" />}
                  </div>
                )}
              </div>
            )}

            {/* POST RESULTS */}
            {query && results.length > 0 && (
              <div className="mt-2">
                <div className="masonry-grid">
                  {results.map(post => (
                    <div key={post.id} className="break-inside-avoid mb-6">
                      <PostCard post={post} hideSaveButton={true} />
                    </div>
                  ))}
                </div>

                {/* Posts Loading More Trigger (Search) */}
                {!loading && (
                  <div ref={postsObserverElement} className="flex justify-center py-6 h-12">
                    {postsLoadingMore && <div className="animate-spin w-6 h-6 border-2 border-[var(--brand-pink)] border-t-transparent rounded-full" />}
                  </div>
                )}
              </div>
            )}

            {/* Empty State / Initial Placeholders */}
            {!query && (
              <div className="space-y-6">
                {/* Título de sección si hay posts */}
                {results.length > 0 && (
                  <div className="mt-2">
                    <div className="masonry-grid">
                      {results.map(post => (
                        <div key={post.id} className="break-inside-avoid mb-6">
                          <PostCard post={post} hideSaveButton={true} />
                        </div>
                      ))}
                    </div>

                    {/* Posts Loading More Trigger (Trending) */}
                    {!loading && (
                      <div ref={postsObserverElement} className="flex justify-center py-6 h-12">
                        {postsLoadingMore && <div className="animate-spin w-6 h-6 border-2 border-[var(--brand-pink)] border-t-transparent rounded-full" />}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx global>{`
        .search-input-no-outline {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .search-input-no-outline:focus-visible,
        .search-input-no-outline:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .masonry-grid {
          column-count: 2;
          column-gap: 0.5rem;
        }
        @media (min-width: 768px) {
          .masonry-grid {
            column-count: 3;
            column-gap: 1rem;
          }
        }
        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: 4;
            column-gap: 1rem;
          }
        }
        @media (min-width: 1440px) {
          .masonry-grid {
            column-count: 5;
          }
        }
      `}</style>
    </div>
  );
}
