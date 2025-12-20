'use client';

/**
 * User Store - State management for user subscription and profile
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, SubscriptionTier, UserPreferences } from '@/types';

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
}

const defaultUser: UserProfile = {
  id: '1',
  name: 'Guest User',
  email: 'guest@wardrobe.ai',
  subscriptionTier: SubscriptionTier.FREE,
  createdAt: new Date(),
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('wardrobe_user');
    const storedPreferences = localStorage.getItem('wardrobe_preferences');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(defaultUser);
    }
    
    if (storedPreferences) {
      setPreferences(JSON.parse(storedPreferences));
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Save user to localStorage whenever it changes
    if (user) {
      localStorage.setItem('wardrobe_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    // Save preferences to localStorage whenever they change
    localStorage.setItem('wardrobe_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const isPremium = () => {
    return user?.subscriptionTier === SubscriptionTier.PREMIUM;
  };

  const upgradeToPremiun = () => {
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
