'use client';

import { useState, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface NewMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectUser: (userId: string) => void;
    currentUserId?: string;
}

export function NewMessageModal({ isOpen, onClose, onSelectUser, currentUserId }: NewMessageModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);

    // Fetch potential users (e.g., following) on mount
    useEffect(() => {
        if (isOpen && currentUserId) {
            fetchSuggestedUsers();
        }
    }, [isOpen, currentUserId]);

    // Search users
    useEffect(() => {
        const searchUsers = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url')
                    .ilike('username', `%${query}%`)
                    .neq('id', currentUserId)
                    .limit(10);

                setResults(data || []);
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeout);
    }, [query, currentUserId]);

    const fetchSuggestedUsers = async () => {
        if (!currentUserId) return;
        try {
            // Fetch users I follow
            const { data: follows } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', currentUserId)
                .eq('status', 'accepted')
                .limit(10);

            if (follows && follows.length > 0) {
                const ids = follows.map((f: any) => f.following_id);
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url')
                    .in('id', ids);
                setRecentUsers(profiles || []);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    if (!isOpen) return null;

    const displayUsers = query ? results : recentUsers;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[var(--card-bg)] w-full max-w-md rounded-2xl shadow-xl border border-[var(--border-color)] overflow-hidden flex flex-col max-h-[80vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                        <button onClick={onClose} className="p-1 hover:bg-[var(--background-secondary)] rounded-full transition-colors">
                            <X className="w-6 h-6 text-[var(--foreground)]" />
                        </button>
                        <h2 className="text-lg font-bold text-[var(--foreground)]">Nuevo Mensaje</h2>
                        <div className="w-8" />
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-[var(--border-color)]">
                        <div className="relative">
                            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Para:</h3>
                            <div className="flex flex-wrap gap-2">
                                <input
                                    type="text"
                                    placeholder="Buscar usuario..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-transparent outline-none text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)]"
                                    autoFocus
                                />
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : displayUsers.length === 0 ? (
                            <div className="text-center py-10 text-[var(--foreground-tertiary)]">
                                {query ? 'No se encontraron usuarios' : 'Busca un usuario para chatear'}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {displayUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => onSelectUser(user.id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[var(--background-secondary)] overflow-hidden relative border border-[var(--border-color)]">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[var(--foreground-tertiary)]">
                                                    <User className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-[var(--foreground)] text-sm">{user.username}</p>
                                            <p className="text-xs text-[var(--foreground-secondary)]">{user.full_name}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
