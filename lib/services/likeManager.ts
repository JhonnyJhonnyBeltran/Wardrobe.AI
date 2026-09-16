'use client';

import { useFeedStore } from '@/store/feedStore';
import { useSearchStore } from '@/store/searchStore';
import { supabase } from '@/lib/supabase/client';

class LikeManager {
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushAll();
      });
    }
  }

  /**
   * Toggles the like state for a post.
   * Immediately updates Zustand feed & search stores optimistically,
   * then persists the database write instantly without debounce lag.
   */
  public toggleLike(
    postId: string,
    currentLiked: boolean,
    currentCount: number = 0
  ): { isLiked: boolean; likesCount: number } {
    const nextLiked = !currentLiked;
    const nextCount = Math.max(0, currentLiked ? currentCount - 1 : currentCount + 1);

    // 1. Instant optimistic update across stores
    try {
      useFeedStore.getState().updatePostLike(postId, nextLiked, nextCount);
      useSearchStore.getState().updatePostLike(postId, nextLiked, nextCount);
    } catch (e) {
      console.warn('[LikeManager] Error updating stores:', e);
    }

    // 2. Direct immediate execution with keepalive
    this.executeLikeToggle(postId, nextLiked);

    return { isLiked: nextLiked, likesCount: nextCount };
  }

  private async executeLikeToggle(postId: string, nextLiked: boolean): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const userId = session?.user?.id;

      // Guaranteed direct client write if user is authenticated
      if (userId) {
        if (nextLiked) {
          supabase.from('likes' as any).upsert(
            { post_id: postId, user_id: userId },
            { onConflict: 'post_id,user_id' }
          ).then(() => {}).catch(() => {});
        } else {
          supabase.from('likes' as any).delete()
            .eq('post_id', postId)
            .eq('user_id', userId)
            .then(() => {}).catch(() => {});
        }
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (nextLiked) {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers,
          body: JSON.stringify({ post_id: postId }),
          keepalive: true
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.likes_count === 'number') {
            useFeedStore.getState().updatePostLike(postId, true, data.likes_count);
            useSearchStore.getState().updatePostLike(postId, true, data.likes_count);
          }
        }
      } else {
        const res = await fetch(`/api/likes?post_id=${postId}`, {
          method: 'DELETE',
          headers,
          keepalive: true
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.likes_count === 'number') {
            useFeedStore.getState().updatePostLike(postId, false, data.likes_count);
            useSearchStore.getState().updatePostLike(postId, false, data.likes_count);
          }
        }
      }
    } catch (err) {
      console.error(`[LikeManager] Error persisting like for post ${postId}:`, err);
    }
  }

  /**
   * Flush operations
   */
  public flushAll(): void {
    // Immediate execution guarantees no delayed operations
  }

  /**
   * Checks if a post has a pending like state
   */
  public getPendingState(postId: string): boolean | undefined {
    return undefined;
  }
}

export const likeManager = new LikeManager();
