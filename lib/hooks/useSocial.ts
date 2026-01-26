
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_following?: boolean; // Derived state
  follow_status?: 'pending' | 'accepted' | 'none'; // Derived state
};

export type FollowRequest = {
  follower_id: string;
  created_at: string;
  follower: Profile; // Joined data
};

export function useSocial() {
  const { user } = useUser();
  const { setRequestsCount } = useUiStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search users by username or full name
  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) return [];
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;

      // Filter out current user
      return data.filter(p => p.id !== user?.id) as Profile[];
    } catch (err: any) {
      console.error('Error searching users:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check availability of a username
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) return false;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .eq('username', username)
        .maybeSingle();

      if (error) return false; // Error real
      if (data) return false; // Encontrado = ocupado
      return true; // No encontrado (data null) = disponible
    } catch (err) {
      console.error('Error checking username:', err);
      return false;
    }
  }, []);

  // Check availability of an email
  const checkEmailAvailability = useCallback(async (email: string) => {
    // Basic validation
    if (!email || !email.includes('@') || email.length < 5) return false;

    try {
      // Use RPC to check if email exists in DB
      const { data, error } = await supabase.rpc('check_email_exists', {
        email_to_check: email
      });

      if (error) throw error;

      // If data is true (exists), then it is NOT available (return false)
      // If data is false (does not exist), then it IS available (return true)
      return !data;
    } catch (err) {
      console.error('Error checking email:', err);
      // In case of error, we might want to fail safe or block.
      // Usually blocking is safer to prevent errors during signup.
      return false;
    }
  }, []);

  // Follow a user
  const followUser = useCallback(async (targetId: string) => {
    if (!user) return false;
    setLoading(true);

    try {
      // Use upsert with ignoreDuplicates to prevent unique constraint errors if already following
      const { error } = await supabase
        .from('follows')
        .upsert({
          follower_id: user.id,
          following_id: targetId,
          status: 'pending' // Default to pending
        }, {
          onConflict: 'follower_id, following_id',
          ignoreDuplicates: true
        });

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error following user:', JSON.stringify(err, null, 2));
      setError(err.message || 'Error al seguir usuario');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Unfollow a user
  const unfollowUser = useCallback(async (targetId: string) => {
    if (!user) return false;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error unfollowing user:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get pending follower requests (people wanting to follow ME)
  const getPendingRequests = useCallback(async () => {
    if (!user) return [];
    setLoading(true);

    try {
      // 1. Fetch pending follows
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select(`follower_id, created_at`)
        .eq('following_id', user.id)
        .eq('status', 'pending');

      if (followsError) throw followsError;
      if (!followsData || followsData.length === 0) return [];

      // 2. Fetch profiles for those followers
      const followerIds = followsData.map((f: any) => f.follower_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', followerIds);

      if (profilesError) throw profilesError;

      // 3. Map back together
      const profilesMap = new Map(profilesData?.map((p: any) => [p.id, p]));

      const requests = followsData.map((item: any) => {
        const profile = profilesMap.get(item.follower_id);
        if (!profile) return null; // Should not happen if data consistency is good

        return {
          follower_id: item.follower_id,
          created_at: item.created_at,
          follower: profile
        };
      }).filter(Boolean) as FollowRequest[];

      return requests;

    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get pending outgoing requests (people I want to follow)
  const getOutgoingRequests = useCallback(async () => {
    if (!user) return [];
    setLoading(true);

    try {
      // 1. Fetch pending follows
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select(`following_id, created_at`)
        .eq('follower_id', user.id)
        .eq('status', 'pending');

      if (followsError) throw followsError;
      if (!followsData || followsData.length === 0) return [];

      // 2. Fetch profiles for those I am trying to follow
      const followingIds = followsData.map((f: any) => f.following_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', followingIds);

      if (profilesError) throw profilesError;

      // 3. Map back together
      const profilesMap = new Map(profilesData?.map((p: any) => [p.id, p]));

      const requests = followsData.map((item: any) => {
        const profile = profilesMap.get(item.following_id);
        if (!profile) return null;

        return {
          following_id: item.following_id, // Note: different key than Incoming
          created_at: item.created_at,
          following: profile               // Note: different key than Incoming
        };
      }).filter(Boolean) as any[]; // Using any[] for simplicity or define OutgoingRequest type

      return requests;

    } catch (err: any) {
      console.error('Error fetching outgoing requests:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshCount = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.id)
      .eq('status', 'pending');
    setRequestsCount(count || 0);
  }, [user, setRequestsCount]);

  // Accept follow request
  const acceptRequest = useCallback(async (followerId: string) => {
    if (!user) return false;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('follows')
        .update({ status: 'accepted' })
        .eq('follower_id', followerId)
        .eq('following_id', user.id); // Validar que somos el target

      if (error) throw error;
      refreshCount();
      return true;
    } catch (err: any) {
      console.error('Error accepting request:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, refreshCount]);

  // Decline/Remove follow request
  const removeRequest = useCallback(async (followerId: string) => {
    if (!user) return false;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', user.id);

      if (error) throw error;
      refreshCount();
      return true;
    } catch (err: any) {
      console.error('Error removing request:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, refreshCount]);

  // Update Main User Profile (Username/Bio)
  const updateProfile = useCallback(async (updates: { username?: string, bio?: string, full_name?: string }) => {
    if (!user) return false;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    searchUsers,
    checkUsernameAvailability,
    checkEmailAvailability,
    followUser,
    unfollowUser,
    getPendingRequests,
    acceptRequest,
    removeRequest,
    getOutgoingRequests,
    updateProfile
  };
}
