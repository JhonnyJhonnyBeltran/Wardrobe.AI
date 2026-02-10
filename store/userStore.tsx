'use client';

/**
 * User Store - State management for user subscription and profile
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, SubscriptionTier, UserPreferences } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserState {
  user: UserProfile | null;
  preferences: UserPreferences;
  isLoading: boolean;
}

interface UserContextType extends UserState {
  setUser: (user: UserProfile | null) => void;
  setPreferences: (preferences: UserPreferences) => void;
  isPremium: () => boolean;
  upgradeToPremiun: () => void;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({});

  // Fetch user profile from DB
  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      // 1. Try to fetch from 'profiles' (Social/New table)
      const { data: profileResult, error: profileError } = await supabase
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

      // Get subscription tier from profile or legacy
      const subscriptionTier = (profile?.subscription_tier || legacyProfile?.subscription_tier || 'free') as SubscriptionTier;

      // Style preferences
      // Check both tables, prefer 'profiles'
      const styleSource = profile || legacyProfile || {};

      setUser({
        id: authUser.id,
        email: authUser.email!,
        name: name,
        username: username,
        bio: profile?.bio,
        avatar: avatar,
        subscriptionTier: subscriptionTier,
        createdAt: new Date(authUser.created_at || Date.now()),

        // Morph/Color
        morphology: styleSource.morphology,
        colorimetry: styleSource.colorimetry,

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

    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserProfile(session.user);
    }
  };

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Only fetch if user ID changed or we don't have a user yet
        // OR simply fetch every time to be safe/fresh
        // To avoid loops/over-fetching, we can check IDs. 
        // But simply calling fetchUserProfile is usually fine on auth state change.
        if (session.user.id !== user?.id) {
          await fetchUserProfile(session.user);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Preferences (Local Only for now, or could be DB)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPreferences = localStorage.getItem('wardrobe_preferences');
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wardrobe_preferences', JSON.stringify(preferences));
    }
  }, [preferences]);

  const isPremium = () => {
    return user?.subscriptionTier === SubscriptionTier.PREMIUM;
  };

  const upgradeToPremiun = () => {
    // This is just a client-side mock for now, realistically this would trigger a payment flow
    if (user) {
      setUser({
        ...user,
        subscriptionTier: SubscriptionTier.PREMIUM,
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        preferences,
        isLoading,
        setUser,
        setPreferences,
        isPremium,
        upgradeToPremiun,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
