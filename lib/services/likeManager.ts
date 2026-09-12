'use client';

import { useFeedStore } from '@/store/feedStore';
import { useSearchStore } from '@/store/searchStore';

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
   * then debounces the database write by 5 seconds.
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
      if (entry.currentLiked) {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
          method: 'DELETE'
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
    this.pending.forEach((entry, postId) => {
      clearTimeout(entry.timeoutId);
      if (entry.currentLiked !== entry.initialLiked) {
        const url = entry.currentLiked ? '/api/likes' : `/api/likes?post_id=${postId}`;
        const method = entry.currentLiked ? 'POST' : 'DELETE';
        try {
          fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: entry.currentLiked ? JSON.stringify({ post_id: postId }) : undefined,
            keepalive: true
          }).catch(() => {});
        } catch {}
      }
    });
    this.pending.clear();
  }

  /**
   * Checks if a post has a pending like state
   */
  public getPendingState(postId: string): boolean | undefined {
    return this.pending.get(postId)?.currentLiked;
  }
}

export const likeManager = new LikeManager();
