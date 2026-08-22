'use client';

/**
 * User Store - State management for user subscription and profile
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, SubscriptionTier, UserPreferences } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

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
  togglePremium: (enable?: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  
  const userIdRef = useRef<string | null>(null);
  // Track if we had a cached user on startup — prevents false redirects to /auth
  // when Supabase INITIAL_SESSION is slow or temporarily fails in production.
  const hadCachedUserRef = useRef(false);

  // Instant Hydration from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedUser = localStorage.getItem('wardrobe_user_profile');
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
          setUser(parsed);
          userIdRef.current = parsed.id;
          hadCachedUserRef.current = true; // Mark that we had a cached session
          setIsLoading(false);
          console.log('[UserStore] Instantly hydrated user from cache');
        }
      } catch (e) {
        console.error('[UserStore] Failed to parse cached user', e);
      }
    }
  }, []);

  // Sync user state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('wardrobe_user_profile', JSON.stringify(user));
      }
      // We removed the aggressive `else if (!isLoading)` cache clear here.
      // Cache is now ONLY cleared explicitly on SIGNED_OUT to preserve sessions.
    }
  }, [user, isLoading]);

  // Fetch full user profile from DB (no arbitrary timeouts)
  const fetchUserProfile = useCallback(async (authUser: SupabaseUser) => {
    try {
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
      const name = profile?.full_name || legacyProfile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
      const avatar = profile?.avatar_url || legacyProfile?.avatar || authUser.user_metadata?.avatar_url;
      const username = profile?.username;

      // Get subscription tier from profile or legacy
      const subscriptionTier = (profile?.subscription_tier || legacyProfile?.subscription_tier || 'free') as SubscriptionTier;

      // Style preferences
      const styleSource = profile || legacyProfile || {};

      setUser((prev) => ({
        id: authUser.id,
        email: authUser.email || '',
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
        age: styleSource.age,
        ageRange: styleSource.age_range,
        gender: styleSource.gender,
        height: styleSource.height,
        heightRange: styleSource.height_range,
        preferredStyles: styleSource.preferred_styles,
        usesAccessories: styleSource.uses_accessories,
        visualStylePreferences: styleSource.visual_style_preferences,
        styleCompleted: styleSource.style_completed || false,
        isPrivate: styleSource.is_private || false,
        notificationSettings: styleSource.notification_settings || { push: true, email: true },
      }));
    } catch (error) {
      console.error('[UserStore] Error fetching extended user profile from DB:', error);
      // We do not set user to null here. The optimistic user remains.
    }
  }, []);

  const handleSession = useCallback(async (session: Session | null, event: string) => {
    if (session?.user) {
      const isNewUser = session.user.id !== userIdRef.current;
      userIdRef.current = session.user.id;

      // Only fetch heavy DB profile on initial load or sign in
      const needsProfileFetch = isNewUser || event === 'INITIAL_SESSION' || event === 'SIGNED_IN';
      
      // Only show loading spinner if we don't already have user data (truly new user).
      // This prevents the app from showing a spinner during SPA navigation
      // or when the token refreshes silently in the background.
      if (needsProfileFetch && isNewUser && !hadCachedUserRef.current) {
        setIsLoading(true);
      }

      // Optimistic Hydration: Immediately set user basic info to unblock UI
      setUser((prev) => {
        if (prev && prev.id === session.user.id) return prev; // Keep existing data if just refreshing
        return {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          username: undefined,
          avatar: session.user.user_metadata?.avatar_url,
          subscriptionTier: SubscriptionTier.FREE,
          createdAt: new Date(session.user.created_at || Date.now()),
          styleCompleted: false,
          isPrivate: false,
          notificationSettings: { push: true, email: true },
        };
      });

      if (needsProfileFetch) {
        await fetchUserProfile(session.user);
      }

      setIsLoading(false);
    } else {
      // If there is no session (whether SIGNED_OUT, INITIAL_SESSION, or failed TOKEN_REFRESHED)
      // we must ensure the app doesn't get stuck loading forever.
      setIsLoading(false);
      
      // If we got SIGNED_OUT or initialized without a session, force a refresh and clear state completely
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED' || (event === 'INITIAL_SESSION' && !session)) {
        userIdRef.current = null;
        setUser(null);
        if (typeof window !== 'undefined') localStorage.removeItem('wardrobe_user_profile');
        if (event !== 'INITIAL_SESSION') {
          router.refresh();
        } else {
          // Only redirect on INITIAL_SESSION with no session if there was NO cached user.
          // If there WAS a cached user, it means the token might be refreshing — don't kick
          // the user out. The middleware + Supabase client will handle real expired sessions.
          if (typeof window !== 'undefined' && !hadCachedUserRef.current) {
            const publicRoutes = ['/login', '/', '/terms', '/privacy'];
            const isPublicRoute = publicRoutes.includes(window.location.pathname) || window.location.pathname.startsWith('/auth') || window.location.pathname.startsWith('/onboarding');
            if (!isPublicRoute) {
              router.push('/auth');
            }
          }
        }
      }
    }
  }, [fetchUserProfile, router]);

  useEffect(() => {
    let isMounted = true;

    // Supabase native auth listener.
    // This will synchronously fire INITIAL_SESSION if a session exists in localStorage.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      if (!isMounted) return;
      console.log(`[UserStore] Supabase Auth event: ${event}`);
      handleSession(session, event);
    });

    // Fallback: Just in case INITIAL_SESSION fails to fire due to a bug in Supabase client
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        console.warn('[UserStore] Auth listener fallback timeout. Forcing loading false.');
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [handleSession]);

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

  const refreshProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetchUserProfile(user);
    }
  }, [fetchUserProfile]);

  const isPremium = useCallback(() => {
    return user?.subscriptionTier === SubscriptionTier.PREMIUM;
  }, [user]);

  const upgradeToPremiun = useCallback(() => {
    setUser((prev) => prev ? { ...prev, subscriptionTier: SubscriptionTier.PREMIUM } : null);
  }, []);

  const togglePremium = useCallback(async (enable?: boolean) => {
    if (!user) return;
    const shouldBePremium = enable !== undefined ? enable : user.subscriptionTier !== SubscriptionTier.PREMIUM;
    const newTier = shouldBePremium ? SubscriptionTier.PREMIUM : SubscriptionTier.FREE;

    // Optimistic UI update
    setUser(prev => prev ? { ...prev, subscriptionTier: newTier } : null);

    try {
      await supabase
        .from('profiles')
        .update({ 
          subscription_tier: newTier,
          is_premium: shouldBePremium 
        } as any)
        .eq('id', user.id);
    } catch (err) {
      console.warn('[UserStore] Could not persist subscription tier to DB:', err);
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    setUser,
    preferences,
    setPreferences,
    isLoading,
    isPremium,
    upgradeToPremiun,
    togglePremium,
    refreshProfile
  }), [user, preferences, isLoading, isPremium, upgradeToPremiun, togglePremium, refreshProfile]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
