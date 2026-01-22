'use client';

/**
 * Messages List - Select a user to chat with
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageCircle } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { Card } from '@/components';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function MessagesPage() {
  const { user } = useUser();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;

      // Fetch people I follow
      // ideally we only chat with mutuals, but let's allow chatting with anyone I follow for now
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          following:profiles!following_id(id, username, full_name, avatar_url)
        `)
        .eq('follower_id', user.id)
        .eq('status', 'accepted');

      if (data) {
        setFriends(data.map((f: any) => f.following));
      }
      setLoading(false);
    };

    fetchFriends();
  }, [user]);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Mensajes</h1>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-[var(--foreground-tertiary)] py-8">Cargando...</div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 mx-auto text-[var(--foreground-tertiary)] mb-4" />
              <p className="text-[var(--foreground-secondary)]">No tienes contactos aún.</p>
              <p className="text-sm text-[var(--foreground-tertiary)]">Sigue a personas para chatear con ellas.</p>
              <Link href="/feed" className="text-[var(--brand-pink)] font-semibold mt-4 block">Buscar usuarios</Link>
            </div>
          ) : (
            friends.map((friend) => (
              <Link href={`/messages/${friend.id}`} key={friend.id}>
                <Card className="p-4 flex items-center gap-4 hover:bg-[var(--background-secondary)] transition-colors cursor-pointer mb-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--background-tertiary)] overflow-hidden flex-shrink-0">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[var(--foreground-secondary)]">
                        {(friend.full_name || friend.username || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--foreground)] truncate">
                      {friend.full_name || friend.username}
                    </p>
                    <p className="text-xs text-[var(--foreground-tertiary)] truncate">
                      @{friend.username || 'usuario'}
                    </p>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
