'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search as SearchIcon, X, Users, Image as ImageIcon, UserPlus, Check, Clock, Trash2, Sparkles } from 'lucide-react';
import PostCard, { type Post } from '@/components/Feed/PostCard';
import SponsoredAdCard from '@/components/Feed/SponsoredAdCard';
import { EmptyState, InfiniteScrollFooter, PullToRefresh, SkeletonSearch, SkeletonUserList } from '@/components';
import { supabase } from '@/lib/supabase/client';

import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { useSearchStore, SearchUserProfile } from '@/store/searchStore';
import { useSearchHistory } from '@/lib/hooks';
import { likeManager } from '@/lib/services/likeManager';
import { interestManager } from '@/lib/services/interestManager';
import Link from 'next/link';

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
                            age_range,
                            gender
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

            // 0. Recency Boost (Priority to newly published posts: up to 18 pts)
            scoreA += interestManager.calculateRecencyScore(a.created_at);
            scoreB += interestManager.calculateRecencyScore(b.created_at);

            // 0.1 Interaction & Clicked Style Interest (up to 10 pts)
            scoreA += interestManager.getStyleInterestBonus(a.style_ids);
            scoreB += interestManager.getStyleInterestBonus(b.style_ids);

            // 0.2 Author Interest bonus (up to 6 pts)
            scoreA += interestManager.getAuthorInterestBonus(a.user_id);
            scoreB += interestManager.getAuthorInterestBonus(b.user_id);

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

            // 4.2 Gender Affinity: Same gender (+7), Unisex / Neutral (+3.5)
            if (user?.gender) {
              const normalizeGender = (g?: string) => {
                if (!g) return '';
                const s = g.toLowerCase();
                if (s.includes('man') || s.includes('men') || s.includes('hombre') || s.includes('masculin') || s === 'male') return 'male';
                if (s.includes('woman') || s.includes('women') || s.includes('mujer') || s.includes('femenin') || s === 'female') return 'female';
                if (s.includes('unisex') || s.includes('mixto') || s.includes('neutral') || s.includes('all')) return 'unisex';
                return s;
              };

              const viewerGender = normalizeGender(user.gender);
              const genderA = normalizeGender(a.profiles?.gender);
              const genderB = normalizeGender(b.profiles?.gender);

              if (genderA === viewerGender) {
                scoreA += 7;
              } else if (genderA === 'unisex' || viewerGender === 'unisex') {
                scoreA += 3.5;
              }

              if (genderB === viewerGender) {
                scoreB += 7;
              } else if (genderB === 'unisex' || viewerGender === 'unisex') {
                scoreB += 3.5;
              }
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
        // Deep multi-entity search via /api/search (captions, outfit names, brands, garments, categories)
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=${POSTS_PER_PAGE}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const searchJson = await response.json();
        
        if (isLoadMore) {
          setResults(prev => [...prev, ...(searchJson.posts || [])]);
        } else {
          setResults(searchJson.posts || []);
        }

        if (searchJson.users && searchJson.users.length > 0 && !isLoadMore) {
          setUserResults(searchJson.users);
        }

        setPostsHasMore(Boolean(searchJson.hasMore));
        postsPageRef.current = currentPage;
        return;
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
            isLiked: likeManager.getPendingState(item.id) !== undefined ? likeManager.getPendingState(item.id) : likedPostIds.has(item.id),
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

  // Dynamic Recommendation Chips based on:
  // 1. User's latest search history (recent searches)
  // 2. User's preferred styles & style recommendations from profile
  // 3. Trending fashion tags & categories
  const recommendationChips = useMemo(() => {
    const chips: { text: string; isHistory?: boolean; isPreferred?: boolean }[] = [];
    const seen = new Set<string>();

    // 1. Add recent search history first (up to 4 terms)
    if (Array.isArray(history)) {
      history.slice(0, 4).forEach(term => {
        const trimmed = term.trim();
        if (trimmed && !seen.has(trimmed.toLowerCase())) {
          seen.add(trimmed.toLowerCase());
          chips.push({ text: trimmed, isHistory: true });
        }
      });
    }

    // 2. Add recommendations based on user's preferred styles from profile
    const styleNamesMap: Record<string, string> = {
      'streetwear': 'Streetwear',
      'old-money': 'Old Money',
      'casual-moderno': 'Casual',
      'minimalista': 'Minimalista',
      'vintage-retro': 'Vintage',
      'clean-look': 'Clean Look',
      'techwear': 'Techwear',
      'y2k': 'Y2K',
      'dark-academia': 'Dark Academia',
      'cottagecore': 'Cottagecore',
      'gorpcore': 'Gorpcore',
      'party-noche': 'Fiesta'
    };

    if (Array.isArray(user?.preferredStyles)) {
      user.preferredStyles.slice(0, 3).forEach(styleKey => {
        const name = styleNamesMap[styleKey] || styleKey;
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          chips.push({ text: name, isPreferred: true });
        }
      });
    }

    // 3. Add default curated categories / popular brands
    const defaultPopular = [
      'Sudaderas',
      'Scuffers',
      'Zapatos',
      'Chaquetas',
      'Pantalones',
      'Nike',
      'Blazer',
      'Oversized',
      'Zara',
      'Accesorios'
    ];

    defaultPopular.forEach(tag => {
      if (!seen.has(tag.toLowerCase())) {
        seen.add(tag.toLowerCase());
        chips.push({ text: tag });
      }
    });

    return chips;
  }, [history, user?.preferredStyles]);

  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-[var(--background)] pb-24">
      {/* Sticky Header with Search Bar and Dynamic Recommendation Chips */}
      <div className="sticky top-0 z-30 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border-color)]/30 pb-3 pt-3 px-3 sm:px-4 md:px-6 shadow-sm">
        <div className="max-w-2xl mx-auto flex flex-col gap-2.5">
          {/* Search Bar */}
          <div className="relative w-full rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm overflow-hidden transition-all duration-300 focus-within:shadow-md focus-within:border-[var(--brand-pink)]">
            <SearchIcon className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-[var(--foreground-secondary)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              placeholder="Buscar marcas (Scuffers, Nike), prendas, estilos..."
              className="search-input-no-outline w-full bg-transparent py-3 sm:py-3.5 pl-11 sm:pl-14 pr-12 text-sm sm:text-base font-medium text-[var(--foreground)] placeholder-[var(--foreground-tertiary)]"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setDebouncedQuery('');
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-[var(--background-secondary)] rounded-full hover:scale-110 transition-transform"
                aria-label="Borrar búsqueda"
              >
                <X className="w-3.5 h-3.5 text-[var(--foreground-secondary)]" />
              </button>
            )}
          </div>

          {/* Horizontally Scrollable Dynamic Recommendation Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
            {recommendationChips.map((chip) => {
              const isSelected = query.toLowerCase() === chip.text.toLowerCase();
              return (
                <button
                  key={chip.text}
                  onClick={() => {
                    if (isSelected) {
                      setQuery('');
                      setDebouncedQuery('');
                    } else {
                      setQuery(chip.text);
                      setDebouncedQuery(chip.text);
                      addSearch(chip.text);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--brand-pink)] text-white border-[var(--brand-pink)] shadow-sm'
                      : chip.isHistory
                      ? 'bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)] hover:border-[var(--brand-pink)]/40 hover:bg-[var(--card-bg)]'
                      : 'bg-[var(--card-bg)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] border-[var(--border-color)] hover:border-[var(--brand-pink)]/40 active:scale-95'
                  }`}
                >
                  {chip.isHistory && <Clock className="w-3 h-3 text-[var(--brand-pink)] shrink-0" />}
                  {chip.isPreferred && !chip.isHistory && <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />}
                  <span>{chip.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search Content with inline Pull-to-Refresh above results */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="w-full max-w-7xl mx-auto px-3 md:px-6 pt-4 sm:pt-6 pb-6 flex flex-col gap-6 min-w-0">
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
                    endMessage=""
                  />
                </div>
              </div>
            )}

            {/* POST RESULTS */}
            {query && results.length > 0 && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-medium text-[var(--foreground-secondary)]">
                    {results.length} {results.length === 1 ? 'publicación' : 'publicaciones'} encontradas
                  </span>
                </div>
                <div className="masonry-grid">
                  {results.map(post => (
                    <div key={post.id} className="break-inside-avoid mb-4 sm:mb-6">
                      <PostCard post={post} />
                    </div>
                  ))}
                  {/* Skeleton Cards for infinite loading */}
                  {postsLoadingMore && (
                    [...Array(3)].map((_, i) => (
                      <div key={`skeleton-${i}`} className="break-inside-avoid mb-4 sm:mb-6">
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
                    endMessage=""
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
                      {results.map((post, index) => (
                        <div key={post.id} className="break-inside-avoid mb-6">
                          <PostCard post={post} />
                          {(index + 1) % 10 === 0 && (
                            <div key={`search-sponsored-ad-${index}`} className="mt-6">
                              <SponsoredAdCard index={index} />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Skeleton Cards for infinite loading */}
                      {postsLoadingMore && (
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
                        endMessage=""
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </PullToRefresh>

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
