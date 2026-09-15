import { supabase } from '@/lib/supabase/client';
import { useMessageStore } from '@/store/messageStore';

export async function deleteConversationForUser(partnerId: string, currentUserId: string): Promise<boolean> {
  if (!partnerId || !currentUserId) return false;

  try {
    // 1. Local storage timestamp update to hide immediately and prevent clock skew
    try {
      const deletedChatsStr = localStorage.getItem('deleted_chats');
      const deletedChats = deletedChatsStr ? JSON.parse(deletedChatsStr) : {};
      deletedChats[partnerId] = Date.now() + 1000;
      localStorage.setItem('deleted_chats', JSON.stringify(deletedChats));
    } catch {}

    // 2. Update Zustand store
    useMessageStore.getState().removeConversation(partnerId);

    // 3. Dispatch global custom event for instant cross-component UI update (Desktop layout, mobile page, etc.)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('klozet:conversation_deleted', {
          detail: { partnerId, currentUserId }
        })
      );
    }

    // 4. Call server API route with auth token
    let token: string | undefined;
    try {
      const session = (await supabase.auth.getSession()).data.session;
      token = session?.access_token;
    } catch {}

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/messages/conversation?target_user_id=${encodeURIComponent(partnerId)}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      console.warn('[messageService] Server API deletion returned non-ok status:', response.status);
    }

    // 5. Also attempt direct client delete as fallback if permitted
    try {
      await supabase
        .from('messages')
        .delete()
        .eq('sender_id', currentUserId)
        .eq('receiver_id', partnerId);
    } catch {}

    // 6. Sync unread count
    useMessageStore.getState().syncUnreadCount(currentUserId);

    return true;
  } catch (error) {
    console.error('[messageService] Error deleting conversation:', error);
    return false;
  }
}
