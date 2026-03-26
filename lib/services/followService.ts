/**
 * Follow Service — Centralized data access layer for the `follows` table.
 *
 * Every Supabase query related to the follows table MUST go through this
 * service to guarantee:
 *   1. Correct column usage (no `id` column — composite PK).
 *   2. Consistent typing via `@/types/follow`.
 *   3. Single source of truth for query logic.
 *
 * Table schema:
 *   follower_id  UUID  (PK part 1)
 *   following_id UUID  (PK part 2)
 *   status       TEXT  ('accepted') - Direct follow, no pending
 *   created_at   TIMESTAMPTZ
 */

import { supabase } from '@/lib/supabase/client';
import type {
  FollowRecord,
  FollowStatus,
  FollowDisplayStatus,
  FollowProfile,
  FollowRequest,
  OutgoingFollowRequest,
  FollowStatusMap,
} from '@/types/follow';

// ─── Constants ───────────────────────────────────────────────────────────────
const TABLE = 'follows' as const;
const BLOCKED_TABLE = 'blocked_users' as const;

const PROFILE_JOIN_COLUMNS = 'id, username, full_name, avatar_url' as const;

// ─── Helper types for Supabase row shapes ────────────────────────────────────
interface FollowRow {
  follower_id: string;
  following_id: string;
  status: string;
  created_at: string;
}

interface ProfileRow {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

// ─── Core CRUD ───────────────────────────────────────────────────────────────

/**
 * Create a follow relationship directly (no approval needed).
 * Uses upsert with `ignoreDuplicates` to prevent constraint violations.
 */
export async function followUser(
  followerId: string,
  followingId: string,
  status: FollowStatus = 'accepted',
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { follower_id: followerId, following_id: followingId, status } as never,
      { onConflict: 'follower_id,following_id', ignoreDuplicates: true },
    );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Remove a follow relationship entirely. */
export async function unfollowUser(
  followerId: string,
  followingId: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Update the status of an existing follow row.
 * Note: With direct follow, this is mainly for backwards compatibility.
 */
export async function updateFollowStatus(
  followerId: string,
  followingId: string,
  status: FollowStatus,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLE)
    .update({ status } as never)
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─── Single-row queries ──────────────────────────────────────────────────────

/** Get the follow status between two users. Returns 'none' if no row exists. */
export async function getFollowStatus(
  followerId: string,
  followingId: string,
): Promise<FollowDisplayStatus> {
  const { data } = await supabase
    .from(TABLE)
    .select('status')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  const row = data as FollowRow | null;
  return (row?.status as FollowStatus) ?? 'none';
}

/** Check if two users mutually follow each other (both accepted). */
export async function checkMutualFollow(
  userId1: string,
  userId2: string,
): Promise<boolean> {
  const { data: a } = await supabase
    .from(TABLE)
    .select('follower_id')
    .eq('follower_id', userId1)
    .eq('following_id', userId2)
    .eq('status', 'accepted')
    .maybeSingle();

  if (!a) return false;

  const { data: b } = await supabase
    .from(TABLE)
    .select('follower_id')
    .eq('follower_id', userId2)
    .eq('following_id', userId1)
    .eq('status', 'accepted')
    .maybeSingle();

  return !!b;
}

// ─── Count queries ───────────────────────────────────────────────────────────

/** Count users that follow `userId` (all are 'accepted'). */
export async function getFollowersCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)
    .eq('status', 'accepted');

  return count ?? 0;
}

/** Count users that `userId` follows (all are 'accepted'). */
export async function getFollowingCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)
    .eq('status', 'accepted');

  return count ?? 0;
}

/** Count pending incoming follow requests - NOTE: No longer used with direct follow. */
export async function getPendingRequestsCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)
    .eq('status', 'pending');

  return count ?? 0;
}

// ─── List queries ────────────────────────────────────────────────────────────

/**
 * Fetch followers of `userId` (all are 'accepted') with joined profile data.
 */
export async function getFollowers(userId: string): Promise<FollowProfile[]> {
  const { data } = await supabase
    .from(TABLE)
    .select(`follower:profiles!follower_id(${PROFILE_JOIN_COLUMNS})`)
    .eq('following_id', userId)
    .eq('status', 'accepted');

  if (!data) return [];
  return (data as Array<{ follower: FollowProfile }>).map((f) => f.follower).filter(Boolean);
}

/**
 * Fetch users that `userId` follows (all are 'accepted') with joined profile data.
 */
export async function getFollowing(userId: string): Promise<FollowProfile[]> {
  const { data } = await supabase
    .from(TABLE)
    .select(`following:profiles!following_id(${PROFILE_JOIN_COLUMNS})`)
    .eq('follower_id', userId)
    .eq('status', 'accepted');

  if (!data) return [];
  return (data as Array<{ following: FollowProfile }>).map((f) => f.following).filter(Boolean);
}

/**
 * Pending incoming requests - NOTE: No longer used with direct follow.
 * Kept for backwards compatibility.
 */
export async function getPendingRequests(userId: string): Promise<FollowRequest[]> {
  // Step 1: fetch pending rows
  const { data: followsData, error } = await supabase
    .from(TABLE)
    .select('follower_id, created_at')
    .eq('following_id', userId)
    .eq('status', 'pending');

  if (error || !followsData?.length) return [];

  // Step 2: fetch profiles for follower_ids
  const rows = followsData as FollowRow[];
  const ids = rows.map((f) => f.follower_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select(PROFILE_JOIN_COLUMNS)
    .in('id', ids);

  if (!profiles) return [];

  const profilesMap = new Map((profiles as ProfileRow[]).map((p) => [p.id, p]));

  return rows
    .map((row) => {
      const profile = profilesMap.get(row.follower_id);
      if (!profile) return null;
      return {
        follower_id: row.follower_id,
        created_at: row.created_at,
        follower: profile as FollowProfile,
      } satisfies FollowRequest;
    })
    .filter(Boolean) as FollowRequest[];
}

/**
 * Pending outgoing requests - NOTE: No longer used with direct follow.
 * Kept for backwards compatibility.
 */
export async function getOutgoingRequests(userId: string): Promise<OutgoingFollowRequest[]> {
  const { data: followsData, error } = await supabase
    .from(TABLE)
    .select('following_id, created_at')
    .eq('follower_id', userId)
    .eq('status', 'pending');

  if (error || !followsData?.length) return [];

  const rows = followsData as FollowRow[];
  const ids = rows.map((f) => f.following_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select(PROFILE_JOIN_COLUMNS)
    .in('id', ids);

  if (!profiles) return [];

  const profilesMap = new Map((profiles as ProfileRow[]).map((p) => [p.id, p]));

  return rows
    .map((row) => {
      const profile = profilesMap.get(row.following_id);
      if (!profile) return null;
      return {
        following_id: row.following_id,
        created_at: row.created_at,
        following: profile as FollowProfile,
      } satisfies OutgoingFollowRequest;
    })
    .filter(Boolean) as OutgoingFollowRequest[];
}

/**
 * Build a map of follow statuses for all outgoing follows of `userId`.
 * With direct follow, this will always be 'accepted' or 'none'.
 */
export async function getMyFollowStatusMap(userId: string): Promise<FollowStatusMap> {
  const { data } = await supabase
    .from(TABLE)
    .select('following_id, status')
    .eq('follower_id', userId);

  if (!data) return {};

  const map: FollowStatusMap = {};
  (data as FollowRow[]).forEach((f) => {
    map[f.following_id] = f.status as FollowDisplayStatus;
  });
  return map;
}

/**
 * Fetch recent follow activity for notification display.
 * Returns rows with joined follower profile (no `id` column).
 */
export async function getRecentFollowActivity(
  userId: string,
  limit = 10,
): Promise<Array<FollowRecord & { follower: FollowProfile }>> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      follower_id,
      following_id,
      status,
      created_at,
      follower:profiles!follower_id(${PROFILE_JOIN_COLUMNS})
    `)
    .eq('following_id', userId)
    .neq('follower_id', userId)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as unknown as Array<FollowRecord & { follower: FollowProfile }>;
}

// ─── Block/Unblock Functions ───────────────────────────────────────────────────

/**
 * Block a user. Creates a blocked_users record and removes any follow relationship.
 */
export async function blockUser(
  blockerId: string,
  blockedId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, remove any follow relationship
    await supabase
      .from(TABLE)
      .delete()
      .eq('follower_id', blockerId)
      .eq('following_id', blockedId);

    await supabase
      .from(TABLE)
      .delete()
      .eq('follower_id', blockedId)
      .eq('following_id', blockerId);

    // Then, create the block record
    const { error } = await supabase
      .from(BLOCKED_TABLE)
      .upsert(
        { blocker_id: blockerId, blocked_id: blockedId } as never,
        { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true },
      );

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Unblock a user. Removes the blocked_users record.
 */
export async function unblockUser(
  blockerId: string,
  blockedId: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(BLOCKED_TABLE)
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Check if a user is blocked by the current user.
 */
export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(BLOCKED_TABLE)
    .select('*')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle();

  if (error) {
    // console.error('Error checking block status:', error);
    return false;
  }

  return !!data;
}
