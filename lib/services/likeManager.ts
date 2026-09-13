'use client';

import { useFeedStore } from '@/store/feedStore';
import { useSearchStore } from '@/store/searchStore';
import { supabase } from '@/lib/supabase/client';

interface PendingEntry {
  postId: string;
  initialLiked: boolean;
  currentLiked: boolean;
  timeoutId: NodeJS.Timeout;
}

class LikeManager {
  private pending: Map<string, PendingEntry> = new Map();

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
   * then debounces the database write.
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

    // 2. Debounce management (300ms for spam protection without delaying navigation sync)
    const existing = this.pending.get(postId);

    if (existing) {
      clearTimeout(existing.timeoutId);
      existing.currentLiked = nextLiked;

      // If user toggled back to original state, we can cancel the DB operation
      if (existing.currentLiked === existing.initialLiked) {
        this.pending.delete(postId);
        return { isLiked: nextLiked, likesCount: nextCount };
      }

      // Re-arm timer with 300ms delay
      existing.timeoutId = setTimeout(() => {
        this.commit(postId);
      }, 300);
    } else {
      const timeoutId = setTimeout(() => {
        this.commit(postId);
      }, 300);

      this.pending.set(postId, {
        postId,
        initialLiked: currentLiked,
        currentLiked: nextLiked,
        timeoutId
      });
    }

    return { isLiked: nextLiked, likesCount: nextCount };
  }

  /**
   * Commit a single pending post like to backend
   */
  public async commit(postId: string): Promise<void> {
    const entry = this.pending.get(postId);
    if (!entry) return;

    this.pending.delete(postId);

    if (entry.currentLiked === entry.initialLiked) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const userId = session?.user?.id;

      // Guaranteed direct client write if user is authenticated
      if (userId) {
        if (entry.currentLiked) {
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

      if (entry.currentLiked) {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers,
          body: JSON.stringify({ post_id: postId })
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
          headers
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
   * Immediately commits all pending operations
   */
  public flushAll(): void {
    if (this.pending.size === 0) return;

    const entries = Array.from(this.pending.entries());
    this.pending.clear();

    entries.forEach(([postId, entry]) => {
      clearTimeout(entry.timeoutId);
      if (entry.currentLiked !== entry.initialLiked) {
        supabase.auth.getSession().then((res: any) => {
          const session = res?.data?.session;
          const token = session?.access_token;
          const userId = session?.user?.id;

          if (userId) {
            if (entry.currentLiked) {
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

          const url = entry.currentLiked ? '/api/likes' : `/api/likes?post_id=${postId}`;
          const method = entry.currentLiked ? 'POST' : 'DELETE';
          try {
            fetch(url, {
              method,
              headers,
              body: entry.currentLiked ? JSON.stringify({ post_id: postId }) : undefined,
              keepalive: true
            }).catch(() => {});
          } catch {}
        }).catch(() => {});
      }
    });
  }

  /**
   * Checks if a post has a pending like state
   */
  public getPendingState(postId: string): boolean | undefined {
    return this.pending.get(postId)?.currentLiked;
  }
}

export const likeManager = new LikeManager();
