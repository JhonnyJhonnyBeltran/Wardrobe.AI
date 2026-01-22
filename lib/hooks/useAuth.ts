/**
 * useAuth Hook
 * Maneja autenticación con Supabase
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: SupabaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string, username?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser: setUserStore } = useUser();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Session init error:', error.message);
        if (error.message.includes('Refresh Token')) {
          supabase.auth.signOut(); // Clear invalid tokens
        }
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        updateUserStore(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        updateUserStore(session.user);
      } else {
        setUserStore(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateUserStore = async (authUser: SupabaseUser) => {
    // 1. Try to fetch from 'profiles' (Social/New table)
    const { data: profileResult } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    let profile = profileResult as any;

    // 2. Try to fetch from 'users' (Legacy table) if needed
    let legacyProfile = null;
    if (!profile) {
      const { data: lp } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      legacyProfile = lp as any;
    }

    // 3. Construct user object
    // Priority: Profile (New) -> Users (Old) -> Auth Metadata -> Email
    const name = profile?.full_name || legacyProfile?.name || authUser.user_metadata?.name || authUser.email!.split('@')[0];
    const avatar = profile?.avatar_url || legacyProfile?.avatar || authUser.user_metadata?.avatar_url;
    const username = profile?.username;
    const bio = profile?.bio;

    // Style preferences might be in either, mostly likely legacy 'users' for now unless migrated
    const styleSource = profile || legacyProfile || {};

    setUserStore({
      id: authUser.id,
      email: authUser.email!,
      name: name,
      username: username,
      bio: bio,
      avatar: avatar,
      subscriptionTier: (styleSource.subscription_tier as any) || 'free',
      createdAt: new Date(authUser.created_at || Date.now()),

      // Style Profile
      ageRange: styleSource.age_range,
      gender: styleSource.gender,
      height: styleSource.height,
      heightRange: styleSource.height_range,
      preferredStyles: styleSource.preferred_styles,
      usesAccessories: styleSource.uses_accessories,
      visualStylePreferences: styleSource.visual_style_preferences,
      styleCompleted: styleSource.style_completed || false,
    });
  };

  const signUp = async (email: string, password: string, name?: string, username?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
            username: username,
          },
        },
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserStore(null);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };
}
