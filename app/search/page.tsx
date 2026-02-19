'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Users, Image as ImageIcon } from 'lucide-react';
import PostCard, { type Post } from '@/components/Feed/PostCard';
import { supabase } from '@/lib/supabase/client';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import Link from 'next/link';

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

  // Enable swipe navigation
  useSwipeNavigation();

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      setLoading(true);
      // Unified search - fetch both posts and users simultaneously
      Promise.all([
        searchPosts(debouncedQuery),
        searchUsers(debouncedQuery)
      ]).finally(() => setLoading(false));
    } else {
      setResults([]);
      setUserResults([]);
      setLoading(false);
    }
  }, [debouncedQuery]);


  const searchUsers = async (searchTerm: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          bio
        `)
        .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .order('username')
        .limit(20);

      if (error) throw error;

      setUserResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const searchPosts = async (searchTerm: string) => {
    try {
      let data: any[] | null = null;
      let error: any = null;

      if (!searchTerm.trim()) {
        // Default: Show recent posts if no query
        const { data: recentData, error: recentError } = await supabase
          .from('posts')
          .select(`
                        id,
                        caption,
                        image_url,
                        created_at,
                        user_id,
                        profiles (
                            username,
                            avatar_url
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
                    `)
          .order('created_at', { ascending: false })
          .limit(20);

        data = recentData;
        error = recentError;

      } else {
        // Standard search using ilike on caption
        const { data: searchData, error: searchError } = await supabase
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
          .limit(20);

        data = searchData;
        error = searchError;
      }

      if (error) throw error;

      if (data) {
        // Fetch profiles manually
        const userIds = [...new Set(data.map(p => p.user_id))];
        let profilesMap: Record<string, any> = {};

        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);

          if (profilesData) {
            profilesData.forEach(p => {
              profilesMap[p.id] = p;
            });
          }
        }

        const formattedPosts = data.map((item: any) => {
          let displayImage = item.image_url;
          let title = item.caption || 'Sin título';
          let authorName = 'Usuario';
          let authorAvatar = 'https://i.pravatar.cc/150?u=default';
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
        setResults(formattedPosts);
      }

    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar personas o posts..."
              className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 pl-10 pr-10 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500/20"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full"
              >
                <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <>
            {/* NO RESULTS STATE */}
            {!loading && userResults.length === 0 && results.length === 0 && query && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No se encontraron resultados para "{query}"</p>
              </div>
            )}

            {/* PEOPLE RESULTS SECTION */}
            {userResults.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1 flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-500" />
                  Personas
                </h2>
                <div className="space-y-3">
                  {userResults.map(user => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-4 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-pink-500/30 transition-colors"
                    >
                      <img
                        src={user.avatar_url || 'https://i.pravatar.cc/150?u=default'}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {user.full_name || user.username}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{user.bio}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* POST RESULTS SECTION */}
            {results.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-pink-500" />
                  Posts
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {results.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State / Initial Placeholders */}
            {!query && (
              <div className="text-center py-20 opacity-50">
                <div className="flex justify-center mb-4">
                  <SearchIcon className="w-16 h-16 text-gray-300 dark:text-gray-700" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">Busca usuarios, amigos y outfits</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
