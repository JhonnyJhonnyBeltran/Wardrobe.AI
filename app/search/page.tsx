'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, UserCheck, X, Clock, Users } from 'lucide-react';
import { useSocial, Profile, FollowRequest } from '@/lib/hooks/useSocial';
import { Card, Button } from '@/components';
import { useUiStore } from '@/store/uiStore';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

type Tab = 'search' | 'requests';
type RequestTab = 'incoming' | 'outgoing';

export default function SearchPage() {
  const { user } = useUser();
  const { searchUsers, followUser, unfollowUser, getPendingRequests, getOutgoingRequests, acceptRequest, removeRequest } = useSocial();
  const { requestsCount } = useUiStore();

  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [requestTab, setRequestTab] = useState<RequestTab>('incoming');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Requests State
  const [incomingRequests, setIncomingRequests] = useState<FollowRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);

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
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${user.id}` // Things *I* requested
        },
        (payload) => {
          // If someone deleted my request (rejected me) or I unfollowed
          if (payload.eventType === 'DELETE') {
            const targetId = payload.old.following_id;
            setMyFollows(prev => {
              const next = { ...prev };
              delete next[targetId];
              return next;
            });
            // Also refresh outgoing list if relevant
            loadRequests();
          }
          // If request accepted
          else if (payload.eventType === 'UPDATE') {
            const targetId = payload.new.following_id;
            setMyFollows(prev => ({ ...prev, [targetId]: payload.new.status }));
            loadRequests();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Real-time listener for INCOMING requests (people wanting to follow ME)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('search-page-incoming')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${user.id}`
        },
        () => {
          console.log('[SearchPage] Incoming request changed, reloading...');
          loadRequests();
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

  // Load appropriate requests when tab changes
  useEffect(() => {
    loadRequests();
  }, [user, requestTab]); // Reload when tab changes

  const loadRequests = async () => {
    if (requestTab === 'incoming') {
      const reqs = await getPendingRequests();
      setIncomingRequests(reqs);

      // Also fetch outgoing to have the count for badge, if we are in this tab
      const out = await getOutgoingRequests();
      setOutgoingRequests(out);
    } else {
      const out = await getOutgoingRequests();
      setOutgoingRequests(out);
      // Fetch incoming for badge
      const reqs = await getPendingRequests();
      setIncomingRequests(reqs);
    }
  };

  // Handle Search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleFollow = async (id: string) => {
    // Optimistic Update
    setMyFollows(prev => ({ ...prev, [id]: 'pending' }));

    const success = await followUser(id);
    if (success) {
      setSearchResults(prev => prev.map(p =>
        p.id === id ? { ...p, follow_status: 'pending' } : p
      ));
      loadRequests();
    } else {
      // Revert if failed
      setMyFollows(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleAccept = async (followerId: string) => {
    await acceptRequest(followerId);
    loadRequests();
  };

  const handleReject = async (followerId: string) => {
    await removeRequest(followerId);
    loadRequests();
  };

  const handleCancelRequest = async (targetId: string) => {
    await unfollowUser(targetId);
    setMyFollows(prev => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
    loadRequests();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8 pt-6 px-4">
      <div className="max-w-md mx-auto">
        {/* Main Tabs */}
        <div className="flex p-1 bg-[var(--background-secondary)] rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'search'
              ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)]'
              }`}
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all relative ${activeTab === 'requests'
              ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)]'
              }`}
          >
            <Users className="w-4 h-4" />
            Solicitudes
            {requestsCount > 0 && (
              <span className="absolute top-2 right-2 md:top-2 md:right-8 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'search' ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Search Input */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o @usuario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[var(--background-secondary)] border-none focus:ring-2 focus:ring-[var(--brand-pink)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all"
                />
              </div>

              {/* Results List */}
              <div className="space-y-3">
                {isSearching ? (
                  <div className="text-center py-8 text-[var(--foreground-tertiary)]">
                    Buscando...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((profile) => {
                    // Check local optimistic state first
                    const status = myFollows[profile.id];
                    // Fallback to profile state if no local interaction yet
                    const isPending = status === 'pending';
                    const isFollowing = status === 'accepted' || profile.is_following; // Simplification

                    return (
                      <Card key={profile.id} className="p-4 flex items-center justify-between">
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
                            <h3 className="font-semibold text-[var(--foreground)] truncate">
                              {profile.full_name}
                            </h3>
                            <p className="text-sm text-[var(--foreground-tertiary)] truncate">
                              @{profile.username}
                            </p>
                          </div>
                        </Link>

                        {isPending ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="px-3 md:px-4 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 group flex-shrink-0"
                            onClick={() => handleCancelRequest(profile.id)}
                          >
                            <Clock className="w-4 h-4 mr-1 md:mr-2" />
                            <span className="hidden md:inline mr-2">Pendiente</span>
                            <X className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        ) : status === 'accepted' ? (
                          <Button size="sm" variant="secondary" className="px-3 md:px-4 flex-shrink-0">
                            <UserCheck className="w-4 h-4 mr-1 md:mr-2" />
                            <span className="hidden md:inline">Siguiendo</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleFollow(profile.id)}
                            className="px-3 md:px-4 bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white border-none flex-shrink-0"
                          >
                            <UserPlus className="w-4 h-4 mr-1 md:mr-2" />
                            <span className="hidden md:inline">Seguir</span>
                          </Button>
                        )}
                      </Card>
                    );
                  })
                ) : searchQuery.length > 1 ? (
                  <div className="text-center py-12">
                    <p className="text-[var(--foreground-tertiary)]">No se encontraron usuarios</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-[var(--foreground-tertiary)]/50 mb-3" />
                    <p className="text-[var(--foreground-secondary)] font-medium">Busca amigos para seguir</p>
                    <p className="text-sm text-[var(--foreground-tertiary)]">Encuentra usuarios por nombre o @usuario</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Request Sub-tabs */}
              <div className="flex gap-4 border-b border-[var(--border-color)] mb-4">
                <button
                  onClick={() => setRequestTab('incoming')}
                  className={`pb-2 text-sm font-semibold transition-colors relative flex items-center gap-2 ${requestTab === 'incoming'
                    ? 'text-[var(--brand-pink)]'
                    : 'text-[var(--foreground-tertiary)]'
                    }`}
                >
                  Recibidas
                  {requestsCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                      {requestsCount}
                    </span>
                  )}
                  {requestTab === 'incoming' && (
                    <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-pink)]" layoutId="reqTab" />
                  )}
                </button>
                <button
                  onClick={() => setRequestTab('outgoing')}
                  className={`pb-2 text-sm font-semibold transition-colors relative flex items-center gap-2 ${requestTab === 'outgoing'
                    ? 'text-[var(--brand-pink)]'
                    : 'text-[var(--foreground-tertiary)]'
                    }`}
                >
                  Enviadas
                  {outgoingRequests.length > 0 && (
                    <span className="bg-[var(--background-tertiary)] text-[var(--foreground-tertiary)] text-[10px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                      {outgoingRequests.length}
                    </span>
                  )}
                  {requestTab === 'outgoing' && (
                    <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-pink)]" layoutId="reqTab" />
                  )}
                </button>
              </div>

              {requestTab === 'incoming' ? (
                // Incoming Requests List
                <div className="space-y-3">
                  {incomingRequests.length > 0 ? (
                    incomingRequests.map((req) => (
                      <Card key={`${req.follower_id}-${req.created_at}`} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                              {req.follower.avatar_url && (
                                <img src={req.follower.avatar_url} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-[var(--foreground)]">{req.follower.full_name}</h4>
                              <p className="text-xs text-[var(--foreground-tertiary)]">@{req.follower.username}</p>
                            </div>
                          </div>
                          <span className="text-xs text-[var(--foreground-tertiary)]">
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-[var(--brand-pink)] text-white border-none"
                            onClick={() => handleAccept(req.follower_id)}
                          >
                            Aceptar
                          </Button>
                          <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => handleReject(req.follower_id)}
                          >
                            Rechazar
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 text-[var(--foreground-tertiary)]">
                      No tienes solicitudes pendientes
                    </div>
                  )}
                </div>
              ) : (
                // Outgoing Requests List
                <div className="space-y-3">
                  {outgoingRequests.length > 0 ? (
                    outgoingRequests.map((req) => (
                      <Card key={`${req.following_id}-${req.created_at}`} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                            {req.following.avatar_url && (
                              <img src={req.following.avatar_url} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[var(--foreground)]">{req.following.full_name}</h4>
                            <p className="text-xs text-[var(--foreground-tertiary)]">@{req.following.username}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleCancelRequest(req.following_id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 text-[var(--foreground-tertiary)]">
                      No has enviado solicitudes pendientes
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
