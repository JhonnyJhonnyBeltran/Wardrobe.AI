/**
 * Supabase Client Configuration
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

// Ensure a strict singleton pattern across the entire browser session,
// even if Next.js re-evaluates this module during SPA navigation chunks.
// This prevents multiple GoTrue instances from broadcasting conflicting auth events.
const getSupabaseBrowserClient = () => {
  if (typeof window === 'undefined') {
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'wardrobe_auth_token',
      },
      cookieOptions: {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'lax'
      },
      global: {
        // Use native fetch to avoid Next.js router fetch patching deadlocks
        fetch: (url, options) => {
          const fetcher = window.fetch;
          return fetcher(url, options);
        }
      },
    });
  }

  // Use window to persist the instance
  if (!(window as any)._klozetSupabaseClient) {
    (window as any)._klozetSupabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'wardrobe_auth_token',
      },
      cookieOptions: {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'lax'
      },
      global: {
        fetch: (url, options) => {
          const fetcher = window.fetch;
          return fetcher(url, options);
        }
      },
    });
  }

  return (window as any)._klozetSupabaseClient;
};

export const supabase = getSupabaseBrowserClient();
