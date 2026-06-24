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
  FolderPlus,
  Folder,
  X,
  Plus,
  Trash2,
  Lock,
  Loader2
} from 'lucide-react';

import FolderPreview from '@/components/FolderPreview';
import { useUiStore } from '@/store/uiStore';

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

interface SaveFolder {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  preview_images?: string[];
}

export default function ProfilePage() {
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();
  const { openFolderModal, setCreateMenuOpen } = useUiStore();
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  // Folder state
  const [folders, setFolders] = useState<SaveFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<SaveFolder | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [savedPostsWithoutFolder, setSavedPostsWithoutFolder] = useState<any[]>([]);



  // Real data state
  const [profileStats, setProfileStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/save-folders');
      const data = await response.json();
      if (data.folders) {
        setFolders(data.folders);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  // Create folder
  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      const response = await fetch('/api/save-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() })
      });
      const data = await response.json();
      if (data.folder) {
        setFolders([{ ...data.folder, preview_posts: [] }, ...folders]);
        setNewFolderName('');
        setShowCreateFolder(false);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Delete folder
  const deleteFolder = async (folderId: string) => {
    if (!confirm('¿Eliminar esta carpeta?')) return;

    try {
      const response = await fetch(`/api/save-folders?id=${folderId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setFolders(folders.filter(f => f.id !== folderId));
        if (selectedFolder?.id === folderId) {
          setSelectedFolder(null);
        }
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        if (!isUuid) {
          setProfileStats({ posts: 0, followers: 0, following: 0 });
          setPosts([]);
          setSavedPosts([]);
          setIsLoading(false);
          return;
        }

        // 1. Fetch Stats
        const { count: postCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .abortSignal(controller.signal);

        const followersCount = await followService.getFollowersCount(user.id);
        const followingCount = await followService.getFollowingCount(user.id);

        if (isMounted) {
          setProfileStats({ posts: postCount || 0, followers: followersCount, following: followingCount });
        }

        // 2. Fetch Posts (My Posts)
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .abortSignal(controller.signal);

        if (isMounted) {
          setPosts(postsData || []);
        }

        // 3. Fetch SAVED Posts (Posts saved by user)
        const { data: savesData } = await supabase
          .from('saves')
          .select(`
            id,
            created_at,
            posts (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .abortSignal(controller.signal);

        // Extract posts from the join
        const formattedSavedPosts = (savesData || [])
          .map((save: any) => ({
            ...save.posts,
            save_id: save.id
          }))
          .filter((post: any) => post !== null);

        if (isMounted) {
          setSavedPosts(formattedSavedPosts);
        }

        // 4. Fetch folders
        await fetchFolders();

      } catch (error: any) {
        console.error('Error fetching profile:', error);
        if (error.name !== 'AbortError' && isMounted) {
          setProfileStats({ posts: 0, followers: 0, following: 0 });
          setPosts([]);
          setSavedPosts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfileData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [user]);

  // Fetch saved posts when folder is selected
  useEffect(() => {
    const fetchSavedData = async () => {
      if (!user || activeTab !== 'saved') return;

      try {
        if (selectedFolder) {
          // Get saves in a specific folder
          const response = await fetch(`/api/saves?folder_id=${selectedFolder.id}`);
          const data = await response.json();
          if (data.saves) {
            setSavedPosts(data.saves.map((save: any) => ({
              ...save.posts,
              save_id: save.id
            })));
          }
        } else {
          // Get all saves without folder
          const response = await fetch('/api/saves');
          const data = await response.json();
          if (data.saves) {
            setSavedPosts(data.saves.map((save: any) => ({
              ...save.posts,
              save_id: save.id
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching saved posts:', error);
      }
    };

    fetchSavedData();
  }, [selectedFolder, activeTab, user]);

  // Open save modal
  const handleSaveClick = (postId: string) => {
    openFolderModal(postId);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">

      {/* Create Folder Modal */}
      <AnimatePresence>
        {showCreateFolder && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => { setShowCreateFolder(false); setNewFolderName(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[var(--background)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-color)]/30"
            >
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
                <h2 className="text-lg font-bold">Nueva carpeta</h2>
                <button
                  onClick={() => { setShowCreateFolder(false); setNewFolderName(''); }}
                  className="p-2 -mr-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nombre de la carpeta"
                  className="w-full px-4 py-3 bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/50 transition-all font-medium"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && createFolder()}
                />
              </div>

              <div className="p-5 pt-0 flex gap-3">
                <button
                  onClick={() => { setShowCreateFolder(false); setNewFolderName(''); }}
                  className="flex-1 py-3 px-4 bg-[var(--background-secondary)] text-[var(--foreground)] rounded-xl font-medium transition-colors hover:bg-[var(--border-color)]"
                >
                  Cancelar
                </button>
                <button
                  onClick={createFolder}
                  disabled={isCreatingFolder || !newFolderName.trim()}
                  className="flex-1 py-3 px-4 bg-[var(--brand-pink)] text-white rounded-xl font-semibold disabled:opacity-50 hover:opacity-90 transition-colors flex items-center justify-center"
                >
                  {isCreatingFolder ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Crear'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]/50">
        <div className="flex items-center justify-between px-4 h-14 w-full md:max-w-[70%] mx-auto">
          {/* Left: Create Button */}
          <button
            onClick={() => setCreateMenuOpen(true)}
            className="p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors flex-shrink-0"
            aria-label="Crear publicación"
          >
            <Plus className="w-6 h-6 text-[var(--brand-pink)]" />
          </button>

          {/* Center: Username */}
          <div className="flex-1 flex justify-center items-center px-2">
            <span className="font-bold text-[var(--foreground)] truncate max-w-[180px] sm:max-w-[240px] text-center">
              {user.username || user.name || user.email?.split('@')[0] || 'Perfil'}
            </span>
          </div>

          {/* Right: Settings/Options Button */}
          <Link
            href="/profile/settings"
            className="p-2 -mr-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors flex-shrink-0"
            aria-label="Configuración"
          >
            <Menu className="w-6 h-6 text-[var(--foreground)]" />
          </Link>
        </div>
      </header>

      <main className="w-full md:max-w-[70%] mx-auto">
        {/* Profile Info */}
        <div className="px-5 pt-6">
          <div className="flex items-center gap-8 mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-[var(--background)] p-0.5">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 flex justify-around text-center">
              <div>
                <div className="font-bold text-lg">{profileStats.posts}</div>
                <div className="text-xs text-[var(--foreground-secondary)]">Posts</div>
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

          <div className="pb-6 border-b border-[var(--border-color)]">
            <h2 className="font-bold text-sm">{user.name}</h2>
            <p className="text-sm text-[var(--foreground-secondary)] whitespace-pre-wrap">{user.bio || 'Amante de la moda ✨'}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href="/profile/settings" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-pink)] text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                Editar perfil
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-14 z-20 bg-[var(--background)]">
          <div className="flex">
            <button
              onClick={() => { setActiveTab('posts'); setSelectedFolder(null); }}
              className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${activeTab === 'posts'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
                }`}
            >
              <Grid3x3 className={`w-6 h-6 ${activeTab === 'posts' ? 'text-[var(--brand-pink)]' : ''}`} />
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${activeTab === 'saved'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
                }`}
            >
              <Bookmark className={`w-6 h-6 ${activeTab === 'saved' ? 'text-[var(--brand-pink)]' : ''}`} />
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
                  <div className="flex flex-col items-center justify-center py-16 text-[var(--foreground-tertiary)]">
                     <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--brand-pink)]" />
                     <p className="font-medium animate-pulse tracking-wide">Cargando...</p>
                  </div>
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
                      <Link
                        key={post.id}
                        href={`/post/${post.id}`}
                        className="aspect-square bg-[var(--background-secondary)] relative group cursor-pointer overflow-hidden"
                      >
                        <img src={post.image_url} alt="Post" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      </Link>
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
              >
                {/* Folders Section with Previews */}
                <div className="p-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-[var(--foreground)]">Carpetas</h3>
                  </div>



                  {/* Folders Grid with 4-post preview */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Create Folder Placeholder - Always First */}
                    <button
                      onClick={() => setShowCreateFolder(true)}
                      className="aspect-square rounded-lg border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center gap-1 hover:border-[var(--brand-pink)] hover:bg-[var(--brand-pink)]/5 transition-colors"
                    >
                      <Plus className="w-8 h-8 text-[var(--brand-pink)]" />
                      <span className="text-xs text-[var(--brand-pink)] font-medium">Crear</span>
                    </button>

                    {/* Existing Folders */}
                    {folders.map((folder) => (
                      <div key={folder.id} className="relative">
                        <button
                          onClick={() => setSelectedFolder(selectedFolder?.id === folder.id ? null : folder)}
                          className={`w-full aspect-square rounded-lg overflow-hidden relative group ${selectedFolder?.id === folder.id ? 'ring-2 ring-[var(--brand-pink)]' : ''
                            }`}
                        >
                          {folder.preview_images && folder.preview_images.length > 0 ? (
                            <FolderPreview images={folder.preview_images} />
                          ) : (
                            <div className="w-full h-full bg-[var(--background-secondary)] flex items-center justify-center">
                              <Folder className="w-8 h-8 text-[var(--foreground-tertiary)]" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{folder.name}</span>
                          </div>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saved Posts without Folder */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-[var(--foreground)] mb-3">
                    {selectedFolder ? `${selectedFolder.name}` : 'Guardados'}
                  </h3>

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-[var(--foreground-tertiary)]">
                       <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--brand-pink)]" />
                       <p className="font-medium animate-pulse tracking-wide">Cargando...</p>
                    </div>
                  ) : savedPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-4">
                        <Bookmark className="w-8 h-8 text-[var(--foreground-tertiary)]" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No hay guardados</h3>
                      <p className="text-[var(--foreground-secondary)] text-sm max-w-xs mx-auto">
                        {selectedFolder
                          ? `No hay publicaciones en "${selectedFolder.name}"`
                          : 'Guarda las publicaciones que te inspiren.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-0.5">
                      {savedPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/post/${post.id}`}
                          className="aspect-square bg-[var(--background-secondary)] relative group cursor-pointer overflow-hidden"
                        >
                          <img src={post.image_url} alt="Saved Post" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                          <div className="absolute top-1 right-1 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Bookmark className="w-3 h-3 text-white fill-current" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
