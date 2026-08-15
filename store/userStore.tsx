'use client';

/**
 * User Store - State management for user subscription and profile
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, SubscriptionTier, UserPreferences } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserState {
  user: UserProfile | null;
  preferences: UserPreferences;
  isLoading: boolean;
}

interface UserContextType extends UserState {
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setPreferences: (preferences: UserPreferences) => void;
  isPremium: () => boolean;
  upgradeToPremiun: () => void;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userState, setUserState] = useState<UserProfile | null>(null);

  // Use a custom setUser that also syncs to localStorage
  const setUser = useCallback((action: React.SetStateAction<UserProfile | null>) => {
    setUserState(prevState => {
      const newUser = typeof action === 'function' ? action(prevState) : action;
      if (typeof window !== 'undefined') {
        if (newUser) {
          localStorage.setItem('klozet_user_cache', JSON.stringify(newUser));
        } else {
          localStorage.removeItem('klozet_user_cache');
        }
      }
      return newUser;
    });
  }, []);

  const user = userState;

  // Hydrate from cache immediately on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('klozet_user_cache');
        if (cached) {
          const parsedUser = JSON.parse(cached);
          if (parsedUser.createdAt) parsedUser.createdAt = new Date(parsedUser.createdAt);
          setUserState(parsedUser);
          userIdRef.current = parsedUser.id;
          setIsLoading(false); // We have a cached user, no need to show loading skeleton
        }
      } catch (e) {
        console.error('Error parsing user cache', e);
      }
    }
  }, []);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const userIdRef = useRef<string | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  // Fetch user profile from DB
  const fetchUserProfile = useCallback(async (authUser: SupabaseUser) => {
    try {
      // Wrapper promise to enforce a maximum execution time (e.g. 10s)
      const fetchPromise = (async () => {
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
      })();

      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('fetchUserProfile timeout reached')), 3000)
      );

      await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback: If DB fetch fails, at least populate with authUser so app doesn't hang in unauthorized state
      // (Using userState here to avoid stale closures, but we're in a callback so we just check if it's currently null)
      setUser((prevUser) => {
        if (!prevUser) {
          return {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            username: undefined,
            avatar: authUser.user_metadata?.avatar_url,
            subscriptionTier: SubscriptionTier.FREE,
            createdAt: new Date(authUser.created_at || Date.now()),
            styleCompleted: false,
          };
        }
        return prevUser;
      });
    }
  }, []);

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

  const refreshProfile = useCallback(async () => {
    try {
      // ALWAYS use getUser() to validate session on the server, but with a timeout
      const getUserPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<{data: {user: null}}>((resolve) => 
        setTimeout(() => {
          console.warn('[UserStore] refreshProfile supabase.auth.getUser() timed out');
          resolve({ data: { user: null } });
        }, 3000)
      );

      const { data: { user } } = await Promise.race([getUserPromise, timeoutPromise]);
      
      if (user) {
        // Also race the fetchUserProfile
        const fetchPromise = fetchUserProfile(user);
        const fetchTimeout = new Promise<void>((resolve) => 
          setTimeout(() => {
            console.warn('[UserStore] refreshProfile fetchUserProfile timed out');
            resolve();
          }, 3000)
        );
        await Promise.race([fetchPromise, fetchTimeout]);
      }
    } catch (err) {
      console.error('[UserStore] Error in refreshProfile:', err);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    let isMounted = true;
    
    const isFetchingRef = { current: false };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (!isMounted) return;
      
      let eventSafetyTimeout: NodeJS.Timeout | null = null;
      
      console.log(`[UserStore] Auth event: ${event}`);

      try {
        if (session?.user) {
          // If it's a new user signing in or initial load
          if (session.user.id !== userIdRef.current || event === 'INITIAL_SESSION') {
            userIdRef.current = session.user.id;
            updateLoginHint(true);
            
            // Only show global loading state for initial load or new sign in
            if (event !== 'TOKEN_REFRESHED') {
              setIsLoading(true);
              // Start a timeout specifically for this fetch attempt
              eventSafetyTimeout = setTimeout(() => {
                if (isMounted) {
                  console.warn(`[UserStore] Fetch timeout reached for event ${event}.`);
                  setIsLoading(false);
                }
              }, 3000);
            }
            
            isFetchingRef.current = true;
            await fetchUserProfile(session.user);
            isFetchingRef.current = false;
            
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Silent refresh if the same user just renewed their token
            console.log('[UserStore] Silently refreshing profile on session tick');
            isFetchingRef.current = true;
            await fetchUserProfile(session.user);
            isFetchingRef.current = false;
          }
        } else {
          // No user session (SIGNED_OUT, or INITIAL_SESSION without a valid token)
          if (userIdRef.current !== null || user !== null) {
            console.log('[UserStore] User logged out or session expired');
            userIdRef.current = null;
            setUser(null);
            router.refresh(); // Sync Server Components when logged out
          }
          updateLoginHint(false);
        }
      } finally {
        setIsLoading(false);
        if (eventSafetyTimeout) {
          clearTimeout(eventSafetyTimeout);
        }
      }
    });

    // Global fallback: If onAuthStateChange never resolves INITIAL_SESSION for some reason, don't hang forever
    const globalMountTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(prev => {
          if (prev) console.warn('[UserStore] Global mount timeout reached. Forcing isLoading to false.');
          return false;
        });
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(globalMountTimeout);
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

  const isPremium = useCallback(() => {
    return user?.subscriptionTier === SubscriptionTier.PREMIUM;
  }, [user]);

  const upgradeToPremiun = useCallback(() => {
    // This is just a client-side mock for now, realistically this would trigger a payment flow
    if (user) {
      setUser({
        ...user,
        subscriptionTier: SubscriptionTier.PREMIUM,
      });
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    user,
    preferences,
    isLoading,
    setUser,
    setPreferences,
    isPremium,
    upgradeToPremiun,
    refreshProfile,
  }), [user, preferences, isLoading, isPremium, upgradeToPremiun, refreshProfile]);

  return (
    <UserContext.Provider value={contextValue}>
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
