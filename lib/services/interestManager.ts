/**
 * Interest & Interaction Manager for Klozet
 * Tracks user interactions (views, clicks, style exploration) and provides
 * affinity + recency scoring for Search and Feed recommendation engines.
 */

const STORAGE_KEYS = {
  POST_INTERACTIONS: 'klozet_post_interactions',
  STYLE_INTEREST: 'klozet_style_interest',
  AUTHOR_INTEREST: 'klozet_author_interest',
};

interface PostInteraction {
  count: number;
  lastInteractedAt: number;
}

class InterestManager {
  private postInteractions: Record<string, PostInteraction> = {};
  private styleInterests: Record<string, number> = {};
  private authorInterests: Record<string, number> = {};
  private isHydrated = false;

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    if (typeof window === 'undefined') return;
    try {
      const posts = localStorage.getItem(STORAGE_KEYS.POST_INTERACTIONS);
      if (posts) this.postInteractions = JSON.parse(posts);

      const styles = localStorage.getItem(STORAGE_KEYS.STYLE_INTEREST);
      if (styles) this.styleInterests = JSON.parse(styles);

      const authors = localStorage.getItem(STORAGE_KEYS.AUTHOR_INTEREST);
      if (authors) this.authorInterests = JSON.parse(authors);

      this.isHydrated = true;
    } catch (e) {
      console.warn('[InterestManager] Failed to hydrate:', e);
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.POST_INTERACTIONS, JSON.stringify(this.postInteractions));
      localStorage.setItem(STORAGE_KEYS.STYLE_INTEREST, JSON.stringify(this.styleInterests));
      localStorage.setItem(STORAGE_KEYS.AUTHOR_INTEREST, JSON.stringify(this.authorInterests));
    } catch {}
  }

  /**
   * Record when user clicks or views a post detail
   */
  public recordPostInteraction(postId: string, authorId?: string | null, styleIds?: string[] | null) {
    if (!this.isHydrated) this.hydrate();
    if (!postId) return;

    const now = Date.now();
    const current = this.postInteractions[postId] || { count: 0, lastInteractedAt: now };
    this.postInteractions[postId] = {
      count: current.count + 1,
      lastInteractedAt: now,
    };

    // Track style interest
    if (Array.isArray(styleIds)) {
      styleIds.forEach((style) => {
        if (style) {
          this.styleInterests[style] = (this.styleInterests[style] || 0) + 1.5;
        }
      });
    }

    // Track author interest
    if (authorId) {
      this.authorInterests[authorId] = (this.authorInterests[authorId] || 0) + 1;
    }

    this.persist();
  }

  /**
   * Get interaction bonus for styles
   */
  public getStyleInterestBonus(styleIds?: string[] | null): number {
    if (!this.isHydrated) this.hydrate();
    if (!Array.isArray(styleIds) || styleIds.length === 0) return 0;

    let bonus = 0;
    styleIds.forEach((style) => {
      const interest = this.styleInterests[style] || 0;
      if (interest > 0) {
        bonus += Math.min(interest * 1.5, 6);
      }
    });
    return Math.min(bonus, 10);
  }

  /**
   * Get interaction bonus for post author
   */
  public getAuthorInterestBonus(authorId?: string | null): number {
    if (!this.isHydrated) this.hydrate();
    if (!authorId) return 0;
    const count = this.authorInterests[authorId] || 0;
    return Math.min(count * 2, 6);
  }

  /**
   * Calculate recency boost score based on publish date
   */
  public calculateRecencyScore(createdAt?: string | Date | null): number {
    if (!createdAt) return 0;
    const postTime = new Date(createdAt).getTime();
    if (isNaN(postTime)) return 0;

    const ageHours = (Date.now() - postTime) / (1000 * 60 * 60);

    if (ageHours <= 6) return 18;
    if (ageHours <= 12) return 15;
    if (ageHours <= 24) return 12;
    if (ageHours <= 48) return 9;
    if (ageHours <= 96) return 6;
    if (ageHours <= 168) return 3;
    if (ageHours <= 336) return 1;
    return 0;
  }
}

export const interestManager = new InterestManager();
