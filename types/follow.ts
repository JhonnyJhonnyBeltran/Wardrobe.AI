/**
 * Follow system types
 * 
 * Table schema: follows
 * - follower_id  UUID (PK composite)
 * - following_id UUID (PK composite)
 * - status       TEXT ('pending' | 'accepted')
 * - created_at   TIMESTAMPTZ
 * 
 * NOTE: No `id` column exists. Primary key is (follower_id, following_id).
 */

/** Possible statuses stored in the DB */
export type FollowStatus = 'pending' | 'accepted';

/** Follow status including the "no relationship" case (UI-level) */
export type FollowDisplayStatus = FollowStatus | 'none';

/** A row from the `follows` table */
export interface FollowRecord {
  follower_id: string;
  following_id: string;
  status: FollowStatus;
  created_at: string;
}

/** Composite key used to uniquely identify a follow relationship */
export interface FollowKey {
  follower_id: string;
  following_id: string;
}

/** Data needed to insert a follow */
export type FollowInsert = {
  follower_id: string;
  following_id: string;
  status?: FollowStatus;
};

/** Profile shape returned when joining follow with profiles */
export interface FollowProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

/** Incoming follow request with joined profile data */
export interface FollowRequest {
  follower_id: string;
  created_at: string;
  follower: FollowProfile;
}

/** Outgoing follow request with joined profile data */
export interface OutgoingFollowRequest {
  following_id: string;
  created_at: string;
  following: FollowProfile;
}

/** Map of user IDs to their follow status (for batch lookups) */
export type FollowStatusMap = Record<string, FollowDisplayStatus>;

/** Generates a deterministic unique ID from a follow composite key */
export function buildFollowCompositeId(key: FollowKey): string {
  return `${key.follower_id}::${key.following_id}`;
}
