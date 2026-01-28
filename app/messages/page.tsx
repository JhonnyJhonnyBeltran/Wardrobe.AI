'use client';

/**
 * Messages Page - Instagram-style messaging interface
 * Features:
 * - Clean search bar
 * - Tabs: Messages / Requests
 * - Suggestions from followed users  
 * - Recent conversations list
 * - Real-time updates
 * - Unread message indicators (Instagram-style)
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, X, Camera } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { useUnreadMessages } from '@/lib/hooks/useUnreadMessages';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AvatarWithStatus } from '@/components/OnlineIndicator';
import { ConversationItem } from '@/components/ConversationItem';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  status: 'active' | 'pending' | 'restricted';
  initiated_by: string;
  last_message_text: string | null;
  last_message_at: string | null;
  last_message_sender: string | null;
  other_user?: Profile;
}

export default function MessagesPage() {
  const { user } = useUser();
  const router = useRouter();
  const { setMessageRequestsCount } = useUiStore();
  
  // Unread messages hook - handles badge visibility and read state
  const { onEnterMessagesPage, hasUnread } = useUnreadMessages({ autoFetch: true, enableRealtime: true });

  // State
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<Conversation[]>([]);
  const [followedUsers, setFollowedUsers] = useState<Profile[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [requestsCount, setRequestsCount] = useState(0);

  // Hide badge when entering messages page (Instagram behavior) - only on mount
  useEffect(() => {
    onEnterMessagesPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data on mount
  useEffect(() => {
    if (!user) return;
    fetchData();
    subscribeToMessages();
  }, [user]);

  // Subscribe to real-time message updates
  const subscribeToMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel('messages-page-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_1=eq.${user.id}`
      }, () => {
        fetchData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_2=eq.${user.id}`
      }, () => {
        fetchData();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Fetch conversations (active ones)
      const { data: convData, error: convError } = await supabase
        .from('conversations' as any)
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      // 2. Fetch message requests (pending where I didn't initiate)
      const { data: reqData, error: reqError } = await supabase
        .from('conversations' as any)
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .eq('status', 'pending')
        .neq('initiated_by', user.id);

      // 3. Fetch followed users for suggestions
      const { data: followsData } = await supabase
        .from('follows')
        .select(`
          following_id,
          following:profiles!following_id(id, username, full_name, avatar_url)
        `)
        .eq('follower_id', user.id)
        .eq('status', 'accepted');

      // Process conversations
      if (convData && !convError) {
        const convWithProfiles = await enrichConversationsWithProfiles(convData as any[], user.id);
        setConversations(convWithProfiles);
      }

      // Process requests
      if (reqData && !reqError) {
        const reqWithProfiles = await enrichConversationsWithProfiles(reqData as any[], user.id);
        setRequests(reqWithProfiles);
        setRequestsCount(reqWithProfiles.length);
        setMessageRequestsCount(reqWithProfiles.length);
      }

      // Process followed users
      if (followsData) {
        const users = followsData
          .map((f: any) => f.following)
          .filter((u: any) => u !== null) as Profile[];
        setFollowedUsers(users);
      }
    } catch (error) {
      console.error('Error fetching messages data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to add user profiles to conversations
  const enrichConversationsWithProfiles = async (convs: any[], currentUserId: string): Promise<Conversation[]> => {
    if (!convs || convs.length === 0) return [];

    const otherUserIds = convs.map((c: any) =>
      c.participant_1 === currentUserId ? c.participant_2 : c.participant_1
    );

    if (otherUserIds.length === 0) return convs;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', otherUserIds);

    const profileMap = new Map((profiles as Profile[] || []).map(p => [p.id, p]));

    return convs.map((c: any) => ({
      ...c,
      other_user: profileMap.get(
        c.participant_1 === currentUserId ? c.participant_2 : c.participant_1
      )
    })) as Conversation[];
  };

  // Search users
  useEffect(() => {
    if (!searchQuery.trim() || !isSearchFocused) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      const query = searchQuery.toLowerCase().replace('@', '');
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .neq('id', user?.id || '')
        .limit(10);

      setSearchResults((data as Profile[]) || []);
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isSearchFocused, user?.id]);

  // Navigate to chat
  const openChat = (userId: string) => {
    router.push(`/messages/${userId}`);
  };

  // Format time ago
  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} h`;
    if (diffDays < 7) return `${diffDays} d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Filtered suggestions (followed users not in existing conversations)
  const suggestions = useMemo(() => {
    const conversationUserIds = new Set(conversations.map(c => c.other_user?.id));
    return followedUsers.filter(u => !conversationUserIds.has(u.id));
  }, [followedUsers, conversations]);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-[var(--border-color)]">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-[var(--foreground)] text-center">
            Bandeja de entrada
          </h1>
        </div>
      </div>

      {/* Search Bar - Clean design */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="relative">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] transition-all duration-200">
            <Search className="w-5 h-5 text-[var(--foreground-tertiary)]" />
            <input
              type="text"
              placeholder="Buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="flex-1 bg-transparent text-[var(--foreground)] placeholder-[var(--foreground-tertiary)] outline-none text-sm"
            />
            {(searchQuery || isSearchFocused) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Active View */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-lg mx-auto px-4 py-4"
          >
            {/* Suggestions Section */}
            {!searchQuery && suggestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Sugerencias</h3>
                <div className="space-y-1">
                  {suggestions.slice(0, 5).map((suggestedUser) => (
                    <button
                      key={suggestedUser.id}
                      onClick={() => openChat(suggestedUser.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-[var(--background-tertiary)] overflow-hidden flex-shrink-0">
                        {suggestedUser.avatar_url ? (
                          <img src={suggestedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--foreground-secondary)] font-bold text-lg">
                            {(suggestedUser.full_name || suggestedUser.username || '?')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-[var(--foreground)] text-sm">
                          {suggestedUser.full_name || suggestedUser.username}
                        </p>
                        <p className="text-xs text-[var(--foreground-tertiary)]">
                          @{suggestedUser.username}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty suggestions hint */}
            {!searchQuery && suggestions.length === 0 && followedUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--foreground-tertiary)]">
                  Sigue a personas para verlas aquí
                </p>
              </div>
            )}

            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Resultados</h3>
                <div className="space-y-1">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => openChat(result.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-[var(--background-tertiary)] overflow-hidden flex-shrink-0">
                        {result.avatar_url ? (
                          <img src={result.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--foreground-secondary)] font-bold text-lg">
                            {(result.full_name || result.username || '?')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-[var(--foreground)] text-sm">
                          {result.full_name || result.username}
                        </p>
                        <p className="text-xs text-[var(--foreground-tertiary)]">
                          @{result.username}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty Search */}
            {searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8 text-[var(--foreground-tertiary)]">
                <p className="text-sm">No se encontraron usuarios</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs & Content (when not searching) */}
      {!isSearchFocused && (
        <>
          {/* Tabs */}
          <div className="max-w-lg mx-auto px-4 mt-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 py-3 text-sm font-semibold transition-all duration-200 ${activeTab === 'messages'
                  ? 'text-[var(--foreground)] border-b-2 border-[var(--foreground)]'
                  : 'text-[var(--foreground-tertiary)]'
                  }`}
              >
                Mensajes
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-3 text-sm font-semibold transition-all duration-200 relative ${activeTab === 'requests'
                  ? 'text-[var(--foreground)] border-b-2 border-[var(--foreground)]'
                  : 'text-[var(--foreground-tertiary)]'
                  }`}
              >
                Solicitudes
                {requestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                    {requestsCount > 9 ? '9+' : requestsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="max-w-lg mx-auto px-4 py-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[var(--background-secondary)] flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-[var(--foreground-tertiary)] -rotate-45" />
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-1">
                    Tus mensajes
                  </h3>
                  <p className="text-sm text-[var(--foreground-tertiary)] max-w-xs mx-auto">
                    Envía mensajes privados a tus amigos
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversationId={conv.id}
                      otherUser={conv.other_user}
                      lastMessageText={conv.last_message_text}
                      lastMessageAt={conv.last_message_at}
                      lastMessageSender={conv.last_message_sender}
                      currentUserId={user?.id || ''}
                      onClick={() => conv.other_user && openChat(conv.other_user.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="max-w-lg mx-auto px-4 py-4">
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[var(--background-secondary)] flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-[var(--foreground-tertiary)] -rotate-45" />
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-1">
                    No hay solicitudes de mensajes
                  </h3>
                  <p className="text-sm text-[var(--foreground-tertiary)] max-w-xs mx-auto">
                    No tienes ninguna solicitud de mensaje.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {requests.map((req) => (
                    <Link
                      key={req.id}
                      href={`/messages/${req.other_user?.id}?request=true`}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
                    >
                      <div className="w-14 h-14 rounded-full bg-[var(--background-tertiary)] overflow-hidden flex-shrink-0">
                        {req.other_user?.avatar_url ? (
                          <img src={req.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--foreground-secondary)] font-bold text-xl">
                            {(req.other_user?.full_name || req.other_user?.username || '?')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-semibold text-[var(--foreground)] text-sm truncate">
                          {req.other_user?.full_name || req.other_user?.username}
                        </p>
                        <p className="text-xs text-[var(--foreground-tertiary)] truncate">
                          Quiere enviarte un mensaje
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
