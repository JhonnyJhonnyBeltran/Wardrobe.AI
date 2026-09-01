'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Users, Image as ImageIcon, UserPlus, Check, Clock, Trash2 } from 'lucide-react';
import PostCard, { type Post } from '@/components/Feed/PostCard';
import { EmptyState, InfiniteScrollFooter, PullToRefresh, SkeletonSearch, SkeletonUserList } from '@/components';
import { supabase } from '@/lib/supabase/client';

import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { useSearchStore, SearchUserProfile } from '@/store/searchStore';
import { useSearchHistory } from '@/lib/hooks';
import Link from 'next/link';
import { useRef, useCallback } from 'react';

type UserProfile = SearchUserProfile;

export default function SearchPage() {
  const {
    query,
    debouncedQuery,
    results,
    userResults,
    explorePosts,
    loading,
    postsHasMore,
    usersHasMore,
    hasInitialLoaded,
    setQuery,
    setDebouncedQuery,
    setResults,
    setUserResults,
    setExplorePosts,
    setLoading,
    setPostsHasMore,
    setUsersHasMore,
    setHasInitialLoaded
  } = useSearchStore();

  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [pendingRequestIds, setPendingRequestIds] = useState<Set<string>>(new Set());
  const { user } = useUser();
  const { showModal } = useUiStore();

  // Pagination states
  const [postsLoadingMore, setPostsLoadingMore] = useState(false);
  const [usersLoadingMore, setUsersLoadingMore] = useState(false);
  const [postsLoadError, setPostsLoadError] = useState(false);
  const [usersLoadError, setUsersLoadError] = useState(false);

  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();

  const postsPageRef = useRef(0);
  const usersPageRef = useRef(0);
  const POSTS_PER_PAGE = 40;
  const USERS_PER_PAGE = 20;

  const postsObserverElement = useRef<HTMLDivElement | null>(null);
  const usersObserverElement = useRef<HTMLDivElement | null>(null);

  // Debounce query for typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(handler);
  }, [query, setDebouncedQuery]);

  // Handle explicit search submission (save to history)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      addSearch(query);
      setDebouncedQuery(query);
    }
  };

  // Refresh handler for pull to refresh
  const handleRefresh = async () => {
    postsPageRef.current = 0;
    usersPageRef.current = 0;
    if (debouncedQuery.trim()) {
      await Promise.all([
        searchPosts(debouncedQuery.trim(), false),
        searchUsers(debouncedQuery.trim(), false)
      ]);
    } else {
      await searchPosts('', false);
    }
  };

  // Initial load with SWR in-memory caching
  useEffect(() => {
    if (debouncedQuery.trim()) {
      // If we don't have results yet, show loading
      if (results.length === 0) {
        setLoading(true);
      }
      const cleanQuery = debouncedQuery.trim();
      Promise.all([
        searchPosts(cleanQuery, false),
        searchUsers(cleanQuery, false)
      ]).finally(() => setLoading(false));
    } else {
      // If we already have explorePosts cached, display them instantly!
      if (explorePosts.length > 0) {
        setResults(explorePosts);
        setLoading(false);
        // Only background revalidate silently if data is older than 2.5 minutes
        const { lastFetchedAt } = useSearchStore.getState();
        if (Date.now() - lastFetchedAt > 150000) {
          searchPosts('', false);
        }
      } else {
        setLoading(true);
        searchPosts('', false).finally(() => {
          setLoading(false);
          setHasInitialLoaded(true);
        });
      }
      setUserResults([]);
    }
  }, [debouncedQuery]);


  const searchUsers = useCallback(async (searchTerm: string, isLoadMore = false) => {
    const currentPage = isLoadMore ? usersPageRef.current + 1 : 0;
    const from = currentPage * USERS_PER_PAGE;
    const to = from + USERS_PER_PAGE - 1;

    try {
      setUsersLoadError(false);
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
      if (!isLoadMore) {
        setUserResults([]);
      }
      setUsersLoadError(true);
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
      setPostsLoadError(false);
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
                            colorimetry,
                            age,
                            age_range
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

        // Dynamic Like Style Affinity: extract styles from posts the user recently liked
        let recentLikedStylesMap: Record<string, number> = {};
        if (user?.id) {
          try {
            const { data: recentLikesData } = await supabase
              .from('likes')
              .select('post_id, posts (style_ids)')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(30);

            if (recentLikesData && recentLikesData.length > 0) {
              recentLikesData.forEach((item: any) => {
                const sIds = item.posts?.style_ids;
                if (Array.isArray(sIds)) {
                  sIds.forEach((s: string) => {
                    recentLikedStylesMap[s] = (recentLikedStylesMap[s] || 0) + 1;
                  });
                }
              });
            }
          } catch (e) {
            console.warn('Could not fetch dynamic like style affinities:', e);
          }
        }

        const { data: recentData } = await postsQuery
          .order('created_at', { ascending: false })
          .range(from, to);

        if (recentData) {
          const getApproxAge = (p?: { age?: number; age_range?: string } | null): number | null => {
            if (!p) return null;
            if (typeof p.age === 'number' && p.age > 0) return p.age;
            if (p.age_range === 'under_18') return 16;
            if (p.age_range === '18_24' || p.age_range === '18-24') return 21;
            if (p.age_range === '25_34' || p.age_range === '25-34') return 29;
            if (p.age_range === '35_44' || p.age_range === '35-44') return 39;
            if (p.age_range === '45_plus' || p.age_range === '45-54' || p.age_range === '55+') return 52;
            return null;
          };

          const viewerAge = user?.age || (user?.ageRange ? getApproxAge({ age_range: user.ageRange }) : null);

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

            // 4. Style match (onboarding preferences)
            if (user?.preferredStyles && a.style_ids) {
                const overlapA = a.style_ids.filter((s: string) => user.preferredStyles!.includes(s)).length;
                scoreA += overlapA * 3;
            }
            if (user?.preferredStyles && b.style_ids) {
                const overlapB = b.style_ids.filter((s: string) => user.preferredStyles!.includes(s)).length;
                scoreB += overlapB * 3;
            }

            // 4.1 Dynamic Like Style Affinity (Styles from recently liked posts)
            if (a.style_ids && Object.keys(recentLikedStylesMap).length > 0) {
              a.style_ids.forEach((s: string) => {
                if (recentLikedStylesMap[s]) {
                  scoreA += Math.min(recentLikedStylesMap[s] * 2.5, 8);
                }
              });
            }
            if (b.style_ids && Object.keys(recentLikedStylesMap).length > 0) {
              b.style_ids.forEach((s: string) => {
                if (recentLikedStylesMap[s]) {
                  scoreB += Math.min(recentLikedStylesMap[s] * 2.5, 8);
                }
              });
            }

            // 5. Age match / affinity (similar age groups get higher recommendation scores)
            if (viewerAge) {
              const ageA = getApproxAge(a.profiles);
              const ageB = getApproxAge(b.profiles);

              if (ageA) {
                const diffA = Math.abs(viewerAge - ageA);
                if (diffA <= 3) scoreA += 6;
                else if (diffA <= 6) scoreA += 4;
                else if (diffA <= 10) scoreA += 2;
              }
              if (ageB) {
                const diffB = Math.abs(viewerAge - ageB);
                if (diffB <= 3) scoreB += 6;
                else if (diffB <= 6) scoreB += 4;
                else if (diffB <= 10) scoreB += 2;
              }
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
            style_ids,
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

        // Check which posts the current user has liked and saved
        let likedPostIds = new Set<string>();
        let savedPostIds = new Set<string>();

        if (user?.id) {
          const postIds = data.map((p: any) => p.id);
          const [likesRes, savesRes] = await Promise.all([
            supabase.from('likes' as any).select('post_id').eq('user_id', user.id).in('post_id', postIds),
            supabase.from('saves' as any).select('post_id').eq('user_id', user.id).in('post_id', postIds)
          ]);
          if (likesRes.data) {
            (likesRes.data as any[]).forEach((l: any) => likedPostIds.add(l.post_id));
          }
          if (savesRes.data) {
            (savesRes.data as any[]).forEach((s: any) => savedPostIds.add(s.post_id));
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
            comments: 0,
            isLiked: likedPostIds.has(item.id),
            isSaved: savedPostIds.has(item.id),
            user_id: item.user_id,
            description: item.caption
          };
        });

        if (isLoadMore) {
          setResults(prev => [...prev, ...formattedPosts]);
          if (!searchTerm.trim()) {
            setExplorePosts(prev => [...prev, ...formattedPosts]);
          }
        } else {
          setResults(formattedPosts);
          if (!searchTerm.trim()) {
            setExplorePosts(formattedPosts);
          }
        }

        setPostsHasMore(data.length === POSTS_PER_PAGE);
        postsPageRef.current = currentPage;
      } else if (!isLoadMore) {
        setResults([]);
        setPostsHasMore(false);
      }

    } catch (error) {
      console.error('Error searching:', error);
      if (!isLoadMore) {
        setResults([]);
      }
      setPostsLoadError(true);
    } finally {
      if (isLoadMore) setPostsLoadingMore(false);
    }
  }, []);

  const loadMoreUsers = useCallback(() => {
    if (loading || usersLoadingMore || !usersHasMore || usersLoadError) return;
    searchUsers(debouncedQuery, true);
  }, [loading, usersLoadingMore, usersHasMore, usersLoadError, debouncedQuery, searchUsers]);

  const loadMorePosts = useCallback(() => {
    if (loading || postsLoadingMore || !postsHasMore || postsLoadError) return;
    searchPosts(debouncedQuery, true);
  }, [loading, postsLoadingMore, postsHasMore, postsLoadError, debouncedQuery, searchPosts]);

  // Infinite Scroll Observers
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === usersObserverElement.current && usersHasMore && !usersLoadingMore && !loading && !usersLoadError) {
            loadMoreUsers();
          } else if (entry.target === postsObserverElement.current && postsHasMore && !postsLoadingMore && !loading && !postsLoadError) {
            loadMorePosts();
          }
        }
      });
    }, { threshold: 0.1 });

    if (usersObserverElement.current) observer.observe(usersObserverElement.current);
    if (postsObserverElement.current) observer.observe(postsObserverElement.current);

    return () => observer.disconnect();
  }, [loadMoreUsers, loadMorePosts, usersHasMore, postsHasMore, usersLoadingMore, postsLoadingMore, loading, usersLoadError, postsLoadError]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
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
          query ? (
            <SkeletonUserList count={6} />
          ) : (
            <SkeletonSearch count={8} />
          )
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
                <div ref={usersObserverElement}>
                  <InfiniteScrollFooter
                    isLoading={usersLoadingMore}
                    isError={usersLoadError}
                    hasMore={usersHasMore}
                    hasItems={userResults.length > 0}
                    onRetry={() => loadMoreUsers()}
                    endMessage="No hay más usuarios."
                  />
                </div>
              </div>
            )}

            {/* POST RESULTS */}
            {query && results.length > 0 && (
              <div className="mt-2">
                <div className="masonry-grid">
                  {results.map(post => (
                    <div key={post.id} className="break-inside-avoid mb-6">
                      <PostCard post={post} />
                    </div>
                  ))}
                  {/* Skeleton Cards for infinite loading illusion or actual loading */}
                  {(postsLoadingMore || (!postsHasMore && results.length >= 8)) && (
                    [...Array(3)].map((_, i) => (
                      <div key={`skeleton-${i}`} className="break-inside-avoid mb-6">
                        <div className="rounded-2xl overflow-hidden bg-[var(--background-secondary)] animate-pulse" style={{ height: [180, 220, 240][i % 3] }} />
                      </div>
                    ))
                  )}
                </div>

                {/* Posts Loading More Trigger */}
                <div ref={postsObserverElement}>
                  <InfiniteScrollFooter
                    isLoading={postsLoadingMore}
                    isError={postsLoadError}
                    hasMore={postsHasMore}
                    hasItems={results.length > 0}
                    onRetry={() => loadMorePosts()}
                    skeleton={<SkeletonSearch count={2} className="py-2" />}
                  />
                </div>
              </div>
            )}

            {/* Empty State / Initial Placeholders */}
            {!query && (
              <div className="space-y-8">
                
                {/* Search History */}
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-sm font-semibold text-[var(--foreground)]">Recientes</h3>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-[var(--brand-pink)] hover:text-[var(--brand-pink-dark)] font-medium transition-colors"
                      >
                        Borrar todo
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {history.map((term, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--background-secondary)] text-sm text-[var(--foreground)] hover:bg-[var(--border-color)] transition-colors cursor-pointer group"
                          onClick={() => {
                            setQuery(term);
                            setDebouncedQuery(term);
                          }}
                        >
                          <Clock className="w-3.5 h-3.5 text-[var(--foreground-secondary)]" />
                          <span>{term}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSearch(term);
                            }}
                            className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] p-0.5 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Título de sección si hay posts */}
                {results.length > 0 && (
                  <div className="mt-2">
                    <div className="masonry-grid">
                      {results.map(post => (
                        <div key={post.id} className="break-inside-avoid mb-6">
                          <PostCard post={post} />
                        </div>
                      ))}
                      
                      {/* Skeleton Cards for infinite loading illusion or actual loading */}
                      {(postsLoadingMore || (!postsHasMore && results.length >= 8)) && (
                        [...Array(3)].map((_, i) => (
                          <div key={`skeleton-explore-${i}`} className="break-inside-avoid mb-6">
                            <div className="rounded-2xl overflow-hidden bg-[var(--background-secondary)] animate-pulse" style={{ height: [180, 220, 240][i % 3] }} />
                          </div>
                        ))
                      )}
                    </div>

                    {/* Posts Loading More Trigger (Trending) */}
                    <div ref={postsObserverElement}>
                      <InfiniteScrollFooter
                        isLoading={postsLoadingMore}
                        isError={postsLoadError}
                        hasMore={postsHasMore}
                        hasItems={results.length > 0}
                        onRetry={() => loadMorePosts()}
                        skeleton={<SkeletonSearch count={2} className="py-2" />}
                      />
                    </div>
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
    </PullToRefresh>
  );
}
