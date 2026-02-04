'use client';

/**
 * Inbox Page (Activity + Messages)
 * Replaces the old Messages page with a dual-purpose Notifications center.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Search, Heart, Send, X, UserPlus, MessageCircle, ChevronRight, UserCheck } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { useUnreadMessages } from '@/lib/hooks/useUnreadMessages';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConversationItem } from '@/components/ConversationItem';
import { Button } from '@/components';

// Types
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

interface FollowRequest {
  created_at: string;
  follower: Profile;
  follower_id: string;
}

interface LikeNotification {
  id: string;
  type: 'like_post';
  created_at: string;
  actor: Profile;
  post_image: string;
  post_id: string;
}

export default function InboxPage() {
  const { user } = useUser();
  const router = useRouter();
  const { setMessageRequestsCount } = useUiStore();

  // Unread messages logic
  const { onEnterMessagesPage } = useUnreadMessages({ autoFetch: true, enableRealtime: true });

  // Main Tabs: 'activity' | 'messages'
  const [activeTab, setActiveTab] = useState<'activity' | 'messages'>('activity');

  // Data State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [msgRequests, setMsgRequests] = useState<Conversation[]>([]);
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);

  // MOCK Likes Data
  const [likeNotifications, setLikeNotifications] = useState<LikeNotification[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Load
  useEffect(() => {
    onEnterMessagesPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchInboxData();
    subscribeToData();
    generateMockActivity();
  }, [user]);

  const generateMockActivity = () => {
    setLikeNotifications([
      {
        id: '1',
        type: 'like_post',
        created_at: new Date().toISOString(),
        actor: { id: 'mk1', username: 'sofi_fashion', full_name: 'Sofia Style', avatar_url: 'https://i.pravatar.cc/150?u=sofi' },
        post_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop',
        post_id: 'p1'
      },
      {
        id: '2',
        type: 'like_post',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        actor: { id: 'mk2', username: 'marcus_k', full_name: 'Marcus K.', avatar_url: 'https://i.pravatar.cc/150?u=marc' },
        post_image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop',
        post_id: 'p2'
      }
    ]);
  };

  const subscribeToData = () => {
    if (!user) return;
    const channel = supabase.channel('inbox-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => fetchInboxData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchInboxData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, () => fetchInboxData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const fetchInboxData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: convData } = await supabase
        .from('conversations' as any)
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (convData) {
        setConversations(await enrichConversations(convData, user.id));
      }

      const { data: reqData } = await supabase
        .from('conversations' as any)
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .eq('status', 'pending')
        .neq('initiated_by', user.id);

      if (reqData) {
        const enrichedReqs = await enrichConversations(reqData, user.id);
        setMsgRequests(enrichedReqs);
        setMessageRequestsCount(enrichedReqs.length);
      }

      const { data: flowData } = await supabase
        .from('follows')
        .select(`created_at, follower_id, follower:profiles!follower_id(*)`)
        .eq('following_id', user.id)
        .eq('status', 'pending');

      if (flowData) setFollowRequests(flowData as any[]);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const enrichConversations = async (convs: any[], currentUserId: string): Promise<Conversation[]> => {
    if (!convs.length) return [];
    const otherIds = convs.map(c => c.participant_1 === currentUserId ? c.participant_2 : c.participant_1);
    const { data: profiles } = await supabase.from('profiles').select('id,username,full_name,avatar_url').in('id', otherIds);
    const map = new Map((profiles as any[])?.map(p => [p.id, p]));
    return convs.map(c => ({
      ...c,
      other_user: map.get(c.participant_1 === currentUserId ? c.participant_2 : c.participant_1)
    }));
  };

  const handleAcceptFollow = async (followerId: string) => {
    await supabase.from('follows').update({ status: 'accepted' }).eq('follower_id', followerId).eq('following_id', user?.id);
    fetchInboxData();
  };

  const handleDeclineFollow = async (followerId: string) => {
    await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', user?.id);
    fetchInboxData();
  };

  const openChat = (userId: string) => router.push(`/messages/${userId}`);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs / 60000 < 1) return 'ahora';
    if (diffMs / 60000 < 60) return `${Math.floor(diffMs / 60000)} min`;
    if (diffMs / 3600000 < 24) return `${Math.floor(diffMs / 3600000)} h`;
    return date.toLocaleDateString();
  };

  // Drag Logic for Swipe Navigation
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    const swipeLeft = info.offset.x < -threshold;
    const swipeRight = info.offset.x > threshold;

    if (swipeRight) {
      // Trying to go LEFT (Previous)
      if (activeTab === 'messages') {
        setActiveTab('activity');
      } else {
        // If in Activity, go to Closet Page
        router.push('/closet');
      }
    } else if (swipeLeft) {
      // Trying to go RIGHT (Next)
      if (activeTab === 'activity') {
        setActiveTab('messages');
      } else {
        // If in Messages, go to Profile Page
        router.push('/profile');
      }
    }
  };


  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header Tabs - Increased Height, No Border, Sticky */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border-color)]">
        {/* Title Section */}
        <div className="pt-6 pb-2 px-4 max-w-md mx-auto border-b border-[var(--border-color)]">
          <h1 className="text-lg font-medium text-center text-[var(--foreground-secondary)]">Bandeja de entrada</h1>
        </div>

        {/* Tabs Section */}
        <div className="flex max-w-md mx-auto relative items-center">
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-4 text-[15px] font-bold transition-all relative ${activeTab === 'activity' ? 'text-[var(--brand-pink)]' : 'text-[var(--foreground-tertiary)]'
              }`}
          >
            Actividad
            {followRequests.length > 0 && (
              <span className="ml-1.5 w-1.5 h-1.5 inline-block bg-[#FF3040] rounded-full mb-0.5 align-middle" />
            )}
            {activeTab === 'activity' && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--brand-pink)] mx-12 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-4 text-[15px] font-bold transition-all relative ${activeTab === 'messages' ? 'text-[var(--brand-pink)]' : 'text-[var(--foreground-tertiary)]'
              }`}
          >
            Mensajes
            {activeTab === 'messages' && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--brand-pink)] mx-12 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Swipeable Content Area */}
      <motion.div
        className="max-w-md mx-auto touch-pan-y min-h-[50vh] overflow-hidden"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="wait" initial={false}>

          {/* --- ACTIVITY TAB --- */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 30 }}
              className="py-4"
            >
              {/* Follow Requests Section */}
              {followRequests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[15px] font-bold text-[var(--foreground)] mb-3 px-4">Solicitudes de seguimiento</h3>
                  <div className="divide-y divide-[var(--border-color)]/30">
                    {followRequests.map((req) => (
                      <div key={req.follower_id} className="flex items-center justify-between group px-4 py-4 hover:bg-[var(--background-secondary)]/30 transition-colors">
                        <Link href={`/profile/${req.follower_id}`} className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-[var(--background-secondary)] overflow-hidden border border-[var(--border-color)]">
                            {req.follower.avatar_url ? (
                              <img src={req.follower.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-[var(--foreground-secondary)]">
                                {req.follower.username[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[15px] font-semibold text-[var(--foreground)] truncate">{req.follower.username}</p>
                            <p className="text-sm text-[var(--foreground-secondary)] truncate">quiere seguirte</p>
                          </div>
                        </Link>
                        <div className="flex gap-2 pl-2">
                          <Button size="sm" onClick={() => handleAcceptFollow(req.follower_id)} className="h-9 px-5 text-sm font-semibold bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-sm hover:shadow-md transition-all rounded-xl">
                            Confirmar
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleDeclineFollow(req.follower_id)} className="h-9 w-9 p-0 flex items-center justify-center rounded-xl border border-[var(--border-color)] hover:bg-[var(--background-secondary)]">
                            <X className="w-5 h-5 text-[var(--foreground-secondary)]" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Likes & Interactions Section */}
              <div>
                <div className="flex items-center justify-between mb-3 px-4">
                  <h3 className="text-[15px] font-bold text-[var(--foreground)]">Esta semana</h3>
                </div>
                <div className="divide-y divide-[var(--border-color)]/30">
                  {likeNotifications.map((notif) => (
                    <div key={notif.id} className="flex items-start justify-between gap-3 group cursor-pointer hover:bg-[var(--background-secondary)]/30 px-4 py-4 transition-colors">
                      <div className="flex items-start gap-3 flex-1">
                        <Link href={`/profile/${notif.actor.id}`} className="w-12 h-12 rounded-full overflow-hidden bg-[var(--background-secondary)] flex-shrink-0 border border-[var(--border-color)]">
                          {notif.actor.avatar_url && <img src={notif.actor.avatar_url} className="w-full h-full object-cover" />}
                        </Link>
                        <div className="text-[15px] pt-1 leading-snug">
                          <span className="font-bold text-[var(--foreground)] hover:text-[var(--brand-pink)] transition-colors">{notif.actor.username}</span>
                          <span className="text-[var(--foreground-secondary)]"> le ha gustado tu publicación.</span>
                          <span className="text-[var(--foreground-tertiary)] text-xs ml-1 inline-block">{formatTimeAgo(notif.created_at)}</span>
                        </div>
                      </div>
                      <Link href={`/post/${notif.post_id}`} className="w-12 h-12 bg-[var(--background-secondary)] overflow-hidden flex-shrink-0 group-hover:opacity-90 transition-opacity">
                        <img src={notif.post_image} className="w-full h-full object-cover" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fallback empty Activity */}
              {followRequests.length === 0 && likeNotifications.length === 0 && (
                <div className="text-center py-12 text-[var(--foreground-tertiary)]">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-10" />
                  <p className="text-sm font-medium opacity-60">No tienes actividad reciente</p>
                </div>
              )}
            </motion.div>
          )}

          {/* --- MESSAGES TAB --- */}
          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 30 }}
              className="py-4 space-y-6"
            >
              {/* Search Bar - Integrated - Added padding x inside container */}
              <div className="relative px-4">
                <div className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-[var(--background-secondary)]/50 transition-all focus-within:ring-1 focus-within:ring-[var(--brand-pink)]/50 border border-transparent focus-within:border-[var(--brand-pink)]/30 focus-within:bg-[var(--background)]">
                  <Search className="w-4 h-4 text-[var(--foreground-tertiary)]" />
                  <input
                    type="text"
                    placeholder="Buscar mensajes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-[15px] outline-none text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)]"
                  />
                </div>
              </div>

              {/* Message Requests Entry */}
              {msgRequests.length > 0 && (
                <div className="px-4">
                  <Link href="/messages/requests" className="flex items-center justify-between p-5 -mx-2 hover:bg-[var(--background-secondary)]/30 rounded-2xl transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--background-secondary)] flex items-center justify-center border border-[var(--border-color)] group-hover:border-[var(--brand-pink)]/50 transition-colors">
                        <MessageCircle className="w-6 h-6 text-[var(--foreground-secondary)] group-hover:text-[var(--brand-pink)] transition-colors" />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[var(--foreground)] group-hover:text-[var(--brand-pink)] transition-colors">Solicitudes de mensajes</p>
                        <p className="text-sm text-[var(--foreground-tertiary)]">{msgRequests.length} pendientes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#FF3040] rounded-full shadow-sm" />
                      <ChevronRight className="w-5 h-5 text-[var(--foreground-tertiary)] group-hover:text-[var(--foreground)]" />
                    </div>
                  </Link>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-3 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Conversations List with Clean Dividers - Matching Activity Style */}
              {!loading && conversations.length > 0 && (
                <div className="divide-y divide-[var(--border-color)]/30 border-t border-[var(--border-color)]/30">
                  {conversations
                    .filter(c => c.other_user?.username.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((conv) => (
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

              {/* Empty State */}
              {!loading && conversations.length === 0 && (
                <div className="text-center py-16 px-4">
                  <div className="w-20 h-20 rounded-full bg-[var(--background-secondary)] flex items-center justify-center mx-auto mb-5 border border-[var(--border-color)]">
                    <Send className="w-9 h-9 text-[var(--foreground-tertiary)] ml-1 mt-1" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Tus mensajes</h3>
                  <p className="text-[15px] text-[var(--foreground-tertiary)] max-w-xs mx-auto leading-relaxed">Conecta con tus amigos y comparte tus outfits favoritos en privado.</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
