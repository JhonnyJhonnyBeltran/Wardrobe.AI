'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const { user } = useUser();

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('search_history' as any)
        .select('query')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setHistory(data.map(item => item.query));
      }
    } catch (e) {
      console.error('Error loading search history:', e);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addSearch = useCallback(async (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm || !user) return;

    // Optimistic update
    setHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== cleanTerm.toLowerCase());
      return [cleanTerm, ...filtered].slice(0, 20);
    });

    try {
      // Upsert to avoid unique constraint violation and update created_at
      await supabase
        .from('search_history' as any)
        .upsert({
          user_id: user.id,
          query: cleanTerm,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, query'
        });
    } catch (e) {
      console.error('Error saving search history:', e);
    }
  }, [user]);

  const removeSearch = useCallback(async (term: string) => {
    if (!user) return;
    
    // Optimistic update
    setHistory(prev => prev.filter(item => item !== term));

    try {
      await supabase
        .from('search_history' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('query', term);
    } catch (e) {
      console.error('Error removing search history:', e);
    }
  }, [user]);

  const clearHistory = useCallback(async () => {
    if (!user) return;
    
    // Optimistic update
    setHistory([]);

    try {
      await supabase
        .from('search_history' as any)
        .delete()
        .eq('user_id', user.id);
    } catch (e) {
      console.error('Error clearing search history:', e);
    }
  }, [user]);

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory
  };
}
