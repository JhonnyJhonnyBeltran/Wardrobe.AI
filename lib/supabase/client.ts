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

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // Override the patched Next.js fetch to avoid SPA navigation deadlocks
    fetch: typeof window !== 'undefined' ? window.fetch.bind(window) : fetch,
  },
});
