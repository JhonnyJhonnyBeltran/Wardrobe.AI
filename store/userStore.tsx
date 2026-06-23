'use client';

/**
 * User Store - State management for user subscription and profile
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  const userIdRef = useRef<string | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

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
        
        // 2.5 Fallback by email for unlinked identities
        if (!legacyProfile && authUser.email) {
          const { data: emailLp } = await supabase
            .from('users')
            .select('*')
            .eq('email', authUser.email)
            .limit(1)
            .maybeSingle();
          legacyProfile = emailLp as any;
        }
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

  // Helper to persist login status hint
  const updateLoginHint = (isLoggedIn: boolean) => {
    if (typeof window !== 'undefined') {
      if (isLoggedIn) {
        localStorage.setItem('klozet_was_logged_in', 'true');
      } else {
        localStorage.removeItem('klozet_was_logged_in');
      }
    }
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserProfile(session.user);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let authResolved = false;
    
    // Safety timeout: ensure loading state is cleared after a maximum of 8s
    // to prevent getting stuck if auth fails to resolve
    const safetyTimeout = setTimeout(() => {
      if (!isMounted || authResolved) return;
      
      console.warn('[UserStore] Auth resolution timed out.');
      
      // If we were supposed to be logged in but auth is stuck, 
      // a hard refresh might clear some browser/supabase cache issues.
      const wasLoggedIn = localStorage.getItem('klozet_was_logged_in') === 'true';
      const hasReloaded = sessionStorage.getItem('klozet_recovery_reload') === 'true';
      
      if (wasLoggedIn && !hasReloaded) {
        console.log('[UserStore] Stuck while authenticated. Triggering safe recovery reload...');
        sessionStorage.setItem('klozet_recovery_reload', 'true');
        window.location.reload();
        return;
      }

      setIsLoading(false);
    }, 8000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          userIdRef.current = session.user.id;
          updateLoginHint(true);
          await fetchUserProfile(session.user);
        } else {
          if (isMounted) {
            setUser(null);
            updateLoginHint(false);
          }
        }
      } catch (error) {
        console.error('[UserStore] Session check error:', error);
      } finally {
        if (isMounted) {
          authResolved = true;
          setIsLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log(`[UserStore] Auth event: ${event}`);

      if (session?.user) {
        // If it's a completely new user signing in, block UI to load profile fully
        if (session.user.id !== userIdRef.current) {
          userIdRef.current = session.user.id;
          setIsLoading(true);
          await fetchUserProfile(session.user);
          authResolved = true;
          setIsLoading(false);
          clearTimeout(safetyTimeout);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // If it's the SAME user just refreshing their token (e.g. after being away), 
          // fetch silently to avoid infinite loading screens blocking the UI!
          console.log('[UserStore] Silently refreshing profile on session tick');
          fetchUserProfile(session.user);
        } else {
          authResolved = true;
          setIsLoading(false);
          clearTimeout(safetyTimeout);
        }
      } else {
        userIdRef.current = null;
        setUser(null);
        updateLoginHint(false);
        authResolved = true;
        setIsLoading(false);
        clearTimeout(safetyTimeout);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
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
