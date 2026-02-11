'use client';

/**
 * Profile Page - Instagram Style (Social Only)
 * Perfil social limpio con avatar, estadísticas y pestañas
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/store/userStore';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/lib/supabase/client';
import * as followService from '@/lib/services/followService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Menu,
  Grid3x3,
  Bookmark,
  Plus,
  Shirt,
  Layers,
  UserCircle,
  Palette
} from 'lucide-react';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

// Simple Button Component Local
function Button({ className, children, ...props }: any) {
  return (
    <button
      className={`font-semibold rounded-lg transition-colors flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

type TabType = 'posts' | 'saved';

export default function ProfilePage() {
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  useSwipeNavigation();

  // Real data state
  const [profileStats, setProfileStats] = useState({
    outfits: 0,
    followers: 0,
    following: 0
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        if (!isUuid) {
          setProfileStats({ outfits: 0, followers: 0, following: 0 });
          setPosts([]);
          setSavedPosts([]);
          setIsLoading(false);
          return;
        }

        // 1. Fetch Stats
        const { count: outfitCount } = await supabase
          .from('outfits')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const followersCount = await followService.getFollowersCount(user.id);

        const followingCount = await followService.getFollowingCount(user.id);

        setProfileStats({
          outfits: outfitCount || 0,
          followers: followersCount,
          following: followingCount
        });

        // 2. Fetch Posts (My Posts)
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setPosts(postsData || []);

        // 3. Fetch SAVED Posts (Posts saved by user)
        // We join with posts table
        const { data: savesData } = await supabase
          .from('saves')
          .select(`
            id,
            created_at,
            post:posts (*)
          `)
          .eq('user_id', user.id)
          .not('post_id', 'is', null) // Only fetch saved posts, not outfits
          .order('created_at', { ascending: false });

        // Extract posts from the join
        const formattedSavedPosts = (savesData || [])
          .map((save: any) => save.post)
          .filter((post: any) => post !== null); // Ensure no nulls

        setSavedPosts(formattedSavedPosts);

      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header - Nuevo diseño: (+) a la izquierda, username centrado */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]/50 supports-[ios]:pt-safe-top">
        <div className="flex items-center justify-between px-4 h-14 w-full md:max-w-[60%] mx-auto">
          {/* Izquierda: Botón (+) para crear */}
          <div className="relative flex-shrink-0">
            <button
              className="p-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              aria-label="Crear"
            >
              <Plus className="w-6 h-6 text-[var(--foreground)]" />
            </button>
            <AnimatePresence>
              {showCreateMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                    onClick={() => setShowCreateMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-[var(--card-bg)] rounded-xl shadow-xl border border-[var(--border-color)] z-50 overflow-hidden"
                  >
                    <Link
                      href="/create"
                      onClick={() => setShowCreateMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--background-secondary)] transition-colors"
                    >
                      <Shirt className="w-5 h-5 text-[var(--brand-pink)]" />
                      <span className="text-sm font-medium">Nuevo Outfit</span>
                    </Link>
                    <Link
                      href="/create-post"
                      onClick={() => setShowCreateMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--background-secondary)] transition-colors border-t border-[var(--border-color)]"
                    >
                      <Layers className="w-5 h-5 text-[var(--brand-pink)]" />
                      <span className="text-sm font-medium">Nuevo Post</span>
                    </Link>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Centro: Username centrado */}
          <span className="font-bold text-[var(--foreground)] truncate max-w-[200px] sm:max-w-[280px] px-2">
            {user.username || user.name || user.email?.split('@')[0] || 'Perfil'}
          </span>

          {/* Derecha: Menú hamburguesa (Configuración) */}
          <Link
            href="/profile/settings"
            className="p-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors flex-shrink-0"
            aria-label="Configuración"
          >
            <Menu className="w-6 h-6 text-[var(--foreground)]" />
          </Link>
        </div>
      </header>

      <main className="w-full md:max-w-[60%] mx-auto">
        {/* Profile Info */}
        <div className="px-5 pt-6"> {/* Removed pb-6 to minimize space to tabs */}
          <div className="flex items-center gap-8 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gray-200 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-[var(--background)] p-0.5">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 flex justify-around text-center">
              <div>
                <div className="font-bold text-lg">{profileStats.outfits}</div>
                <div className="text-xs text-[var(--foreground-secondary)]">Outfits</div>
              </div>
              <div>
                <div className="font-bold text-lg">{profileStats.followers}</div>
                <div className="text-xs text-[var(--foreground-secondary)]">Seguidores</div>
              </div>
              <div>
                <div className="font-bold text-lg">{profileStats.following}</div>
                <div className="text-xs text-[var(--foreground-secondary)]">Seguidos</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="pb-6 border-b border-[var(--border-color)]">
            <h2 className="font-bold text-sm">{user.name}</h2>
            <p className="text-sm text-[var(--foreground-secondary)] whitespace-pre-wrap">{user.bio || 'Amante de la moda ✨'}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href="/profile/settings" className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors">
                <UserCircle className="w-4 h-4 text-[var(--brand-pink)]" />
                Editar perfil
              </Link>
              <Link href="/profile/preferences" className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors">
                <Palette className="w-4 h-4 text-[var(--brand-pink)]" />
                Editar preferencias
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-14 z-20 bg-[var(--background)]">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${activeTab === 'posts'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
                }`}
            >
              <Grid3x3 className={`w-6 h-6 ${activeTab === 'posts' ? 'text-[var(--brand-pink)]' : ''}`} />
              <span className="sr-only">Publicaciones</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${activeTab === 'saved'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
                }`}
            >
              <Bookmark className={`w-6 h-6 ${activeTab === 'saved' ? 'text-[var(--brand-pink)]' : ''}`} />
              <span className="sr-only">Guardados</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[40vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'posts' ? (
              <motion.div
                key="posts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-0.5"
              >
                {isLoading ? (
                  <div className="text-center py-10 text-[var(--foreground-tertiary)]">Cargando...</div>
                ) : posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-4">
                      <Grid3x3 className="w-8 h-8 text-[var(--foreground-tertiary)]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Aún no hay publicaciones</h3>
                    <p className="text-[var(--foreground-secondary)] text-sm max-w-xs mx-auto">
                      Comparte tus mejores outfits con la comunidad.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-0.5">
                    {posts.map((post) => (
                      <div key={post.id} className="aspect-square bg-[var(--background-secondary)] relative group cursor-pointer overflow-hidden">
                        <img src={post.image_url} alt="Post" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-0.5"
              >
                {isLoading ? (
                  <div className="text-center py-10 text-[var(--foreground-tertiary)]">Cargando...</div>
                ) : savedPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-4">
                      <Bookmark className="w-8 h-8 text-[var(--foreground-tertiary)]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No hay guardados</h3>
                    <p className="text-[var(--foreground-secondary)] text-sm max-w-xs mx-auto">
                      Guarda las publicaciones que te inspiren.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-0.5">
                    {savedPosts.map((post) => (
                      <div key={post.id} className="aspect-square bg-[var(--background-secondary)] relative group cursor-pointer overflow-hidden">
                        <img src={post.image_url} alt="Saved Post" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        {/* Optional visual indicator for saved items */}
                        <div className="absolute top-1 right-1 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Bookmark className="w-3 h-3 text-white fill-current" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
