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
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
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
    supabase.auth.getSession().then(({ data: { session } }) => {
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
    // Fetch user profile from database
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    // Si el usuario no existe en la BD, cerrar sesión
    if (error || !profile) {
      await supabase.auth.signOut();
      setUserStore(null);
      setUser(null);
      return;
    }

    setUserStore({
      id: authUser.id,
      email: authUser.email!,
      name: profile?.name || authUser.user_metadata?.name || authUser.email!.split('@')[0],
      avatar: profile?.avatar || authUser.user_metadata?.avatar_url,
      // Perfil de estilo
      ageRange: profile.age_range,
      gender: profile.gender,
      height: profile.height,
      heightRange: profile.height_range,
      preferredStyles: profile.preferred_styles,
      usesAccessories: profile.uses_accessories,
      visualStylePreferences: profile.visual_style_preferences,
      styleCompleted: profile.style_completed || false,
    });
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
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
