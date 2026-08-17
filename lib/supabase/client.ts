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

const COOKIE_OPTIONS = {
  name: 'wardrobe-auth',
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
  sameSite: 'lax' as const,
};

// Ensure a strict singleton pattern across the entire browser session,
// even if Next.js re-evaluates this module during SPA navigation chunks.
// This prevents multiple GoTrue instances from broadcasting conflicting auth events.
const getSupabaseBrowserClient = () => {
  if (typeof window === 'undefined') {
    // SSR: create a fresh client per request (no singleton needed server-side)
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookieOptions: COOKIE_OPTIONS,
    });
  }

  // Client-side: persist the singleton on the window object
  if (!(window as any)._klozetSupabaseClient) {
    (window as any)._klozetSupabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookieOptions: COOKIE_OPTIONS,
    });
  }

  return (window as any)._klozetSupabaseClient;
};

export const supabase = getSupabaseBrowserClient();
