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
import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Settings,
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

import { Avatar, Button as UiButton, OutfitCard, EmptyState, Skeleton, SkeletonProfile, SkeletonProfileGrid, DiscoveredStyleBanner, AvatarModal, PullToRefresh } from '@/components';
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

import { useProfileStore, SaveFolder } from '@/store/profileStore';

type TabType = 'posts' | 'saved';

export default function ProfilePage() {
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();
  const { openFolderModal, setCreateMenuOpen, refetchTrigger } = useUiStore();
  
  // Connect to persistent in-memory Profile Store
  const {
    posts,
    savedPosts,
    folders,
    profileStats,
    selectedFolder,
    activeTab,
    isLoading,
    postsHasMore,
    savedHasMore,
    loadingMorePosts,
    loadingMoreSaved,
    setActiveTab,
    setSelectedFolder,
    setFolders,
    setSavedPosts,
    fetchProfileData,
    fetchMorePosts,
    fetchMoreSavedPosts,
    fetchFolders
  } = useProfileStore();

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<SaveFolder | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const postsObserverRef = useRef<HTMLDivElement | null>(null);
  const savedObserverRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll for posts tab (loads 40 more)
  useEffect(() => {
    if (!postsHasMore || loadingMorePosts || activeTab !== 'posts' || !user?.id) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchMorePosts(user.id);
      }
    }, { threshold: 0.1 });
    if (postsObserverRef.current) observer.observe(postsObserverRef.current);
    return () => observer.disconnect();
  }, [postsHasMore, loadingMorePosts, activeTab, user?.id, fetchMorePosts]);

  // Infinite scroll for saved tab (loads 40 more)
  useEffect(() => {
    if (!savedHasMore || loadingMoreSaved || activeTab !== 'saved' || !user?.id) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchMoreSavedPosts(user.id);
      }
    }, { threshold: 0.1 });
    if (savedObserverRef.current) observer.observe(savedObserverRef.current);
    return () => observer.disconnect();
  }, [savedHasMore, loadingMoreSaved, activeTab, user?.id, fetchMoreSavedPosts]);

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

  // Confirm and Delete folder
  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    setIsDeletingFolder(true);
    try {
      const response = await fetch(`/api/save-folders?id=${folderToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setFolders((prev: SaveFolder[]) => prev.filter((f: SaveFolder) => f.id !== folderToDelete.id));
        if (selectedFolder?.id === folderToDelete.id) {
          setSelectedFolder(null);
          setSavedPosts([]);
        }
        setFolderToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    } finally {
      setIsDeletingFolder(false);
    }
  };

  // Initial mount: load data into store if not already cached
  useEffect(() => {
    if (user?.id) {
      fetchProfileData(user.id);
    }
  }, [user?.id, refetchTrigger, fetchProfileData]);

  // Fetch saved posts when folder is selected
  useEffect(() => {
    const fetchSavedData = async () => {
      if (!user || activeTab !== 'saved') return;

      try {
        if (selectedFolder) {
          // Get saves in a specific folder
          const response = await fetch(`/api/saves?folder_id=${selectedFolder.id}&t=${Date.now()}`);
          const data = await response.json();
          if (data.saves) {
            setSavedPosts(data.saves.map((save: any) => ({
              ...save.posts,
              save_id: save.id
            })));
          }
        } else {
          // Get all saves without folder
          const response = await fetch(`/api/saves?t=${Date.now()}`);
          const data = await response.json();
          if (data.saves) {
            setSavedPosts(data.saves.map((save: any) => ({
              ...save.posts,
              save_id: save.id
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching saved data:', error);
      }
    };

    fetchSavedData();
  }, [selectedFolder, user, activeTab, refetchTrigger]);

  // Open save modal
  const handleSaveClick = (postId: string) => {
    openFolderModal(postId);
  };

  if (!user) return (
    <div className="flex h-screen bg-[var(--background)]">
      <main className="flex-1 w-full max-w-[600px] mx-auto bg-[var(--background)] min-h-screen relative border-x border-[var(--border-color)] pb-20 md:pb-0">
        <SkeletonProfile />
      </main>
    </div>
  );

  return (
    <PullToRefresh onRefresh={async () => { if (user?.id) await fetchProfileData(user.id, true); }}>
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

      {/* Delete Folder Confirmation Modal with Warning */}
      <AnimatePresence>
        {folderToDelete && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isDeletingFolder && setFolderToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[var(--card-bg)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-color)] p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>

              <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">
                ¿Eliminar carpeta &ldquo;{folderToDelete.name}&rdquo;?
              </h2>

              <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Todas las publicaciones guardadas en esta carpeta se borrarán definitivamente de tus guardados. Esta acción no se puede deshacer.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFolderToDelete(null)}
                  disabled={isDeletingFolder}
                  className="flex-1 py-3 px-4 bg-[var(--background-secondary)] text-[var(--foreground)] rounded-xl font-medium transition-colors hover:bg-[var(--border-color)] disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteFolder}
                  disabled={isDeletingFolder}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-semibold transition-all hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95"
                >
                  {isDeletingFolder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Borrando...</span>
                    </>
                  ) : (
                    <span>Eliminar</span>
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
            className="md:hidden p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors flex-shrink-0"
            aria-label="Crear publicación"
          >
            <Plus className="w-6 h-6 text-[var(--brand-pink)]" />
          </button>
          {/* Spacer for desktop to keep the title centered */}
          <div className="hidden md:block w-10 flex-shrink-0 -ml-2"></div>

          {/* Center: Username */}
          <div className="flex-1 flex justify-center items-center px-2">
            <span className="font-bold text-[var(--foreground)] truncate max-w-[180px] sm:max-w-[240px] text-center">
              {user.username || user.name || user.email?.split('@')[0] || 'Perfil'}
            </span>
          </div>

          {/* Right: Settings/Options Button */}
          <Link
            href="/profile/settings"
            className="group p-2 -mr-2 rounded-full transition-colors flex-shrink-0 text-[var(--foreground)] hover:bg-[var(--background-secondary)] md:hover:bg-transparent"
            aria-label="Configuración"
          >
            <Settings className="w-6 h-6 transition-all duration-300 group-hover:text-[var(--brand-pink)] group-hover:fill-[var(--brand-pink)]" />
          </Link>
        </div>
      </header>

      <main className="w-full md:max-w-[70%] mx-auto">
        {/* Profile Info */}
        <div className="px-5 pt-6">
          <div className="flex items-center gap-8 mb-6">
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="w-24 h-24 rounded-full overflow-hidden hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group shrink-0"
              title="Ver foto de perfil"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity"
              />
            </button>

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
            <p className="text-sm text-[var(--foreground-secondary)] whitespace-pre-wrap">{user.bio || 'Amante de la moda'}</p>
            <div className="flex flex-wrap gap-2 mt-4 mb-4">
              <Link href="/profile/settings" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-pink)] text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                Editar perfil
              </Link>
            </div>

            {/* Smart Taste Discovery Banner */}
            <DiscoveredStyleBanner />
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
        <div className="min-h-[40vh] relative z-0 hover:z-40">
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
                {isLoading && posts.length === 0 ? (
                  <SkeletonProfileGrid count={9} />
                ) : posts.length === 0 ? (
                  <EmptyState
                    icon={Grid3x3}
                    title="Aún no hay publicaciones"
                    description="Comparte tus mejores outfits con la comunidad."
                    fullHeight={false}
                  />
                ) : (
                  <div className="grid grid-cols-3 gap-0.5">
                    {posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/post/${post.id}`}
                        className="aspect-square bg-[var(--background-secondary)] relative block z-0 hover:z-40 transition-all duration-300 hover:scale-[1.05] hover:shadow-xl hover:rounded-md"
                      >
                        <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                      </Link>
                    ))}
                    {postsHasMore && (
                      <div ref={postsObserverRef} className="col-span-3">
                        {loadingMorePosts && <SkeletonProfileGrid count={3} />}
                      </div>
                    )}
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
                {/* Folders Section */}
                <div className="p-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-[var(--foreground)]">Carpetas</h3>
                    {/* Botón texto */}
                    <button
                      onClick={() => setShowCreateFolder(true)}
                      className="text-[var(--brand-pink)] hover:text-[var(--brand-pink)]/80 transition-colors text-sm font-semibold"
                    >
                      {folders.length === 0 ? 'Crear carpeta' : 'Añadir carpeta'}
                    </button>
                  </div>

                  {/* Folders Pills */}
                  <div className="flex flex-wrap gap-2">
                    {/* Existing Folders */}
                    {folders.map((folder) => (
                      <div key={folder.id} className="relative group">
                        <button
                          onClick={() => setSelectedFolder(selectedFolder?.id === folder.id ? null : folder)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium ${
                            selectedFolder?.id === folder.id 
                              ? 'bg-[var(--brand-pink)] text-white shadow-md' 
                              : 'bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--background-secondary)]/80'
                          }`}
                        >
                          <Folder className="w-4 h-4" />
                          <span className="truncate max-w-[150px]">{folder.name}</span>
                        </button>
                        
                        {/* Botón X para eliminar con confirmación */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderToDelete(folder);
                          }}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-600 rounded-full shadow-md opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all z-10 text-white hover:scale-110 active:scale-95"
                          title={`Eliminar carpeta ${folder.name}`}
                          aria-label={`Eliminar carpeta ${folder.name}`}
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saved Posts Section */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-[var(--foreground)]">
                      {selectedFolder ? `${selectedFolder.name}` : 'Guardados'}
                    </h3>
                    {selectedFolder && (
                      <button
                        onClick={() => setFolderToDelete(selectedFolder)}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar carpeta</span>
                      </button>
                    )}
                  </div>

                  {isLoading && savedPosts.length === 0 ? (
                    <SkeletonProfileGrid count={9} />
                  ) : savedPosts.length === 0 ? (
                    <EmptyState
                      icon={Bookmark}
                      title="No hay guardados"
                      description={selectedFolder ? `No hay publicaciones en "${selectedFolder.name}"` : 'Guarda las publicaciones que te inspiren.'}
                      fullHeight={false}
                    />
                  ) : (
                    <div className="grid grid-cols-3 gap-0.5">
                      {savedPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/post/${post.id}`}
                          className="aspect-square bg-[var(--background-secondary)] relative block z-0 hover:z-40 transition-all duration-300 hover:scale-[1.05] hover:shadow-xl hover:rounded-md group"
                        >
                          <img src={post.image_url} alt="Saved Post" className="w-full h-full object-cover" />
                          <div className="absolute top-1 right-1 bg-black/50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Bookmark className="w-3.5 h-3.5 text-white fill-current" />
                          </div>
                        </Link>
                      ))}
                      {savedHasMore && (
                        <div ref={savedObserverRef} className="col-span-3">
                          {loadingMoreSaved && <SkeletonProfileGrid count={3} />}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Fullscreen Avatar Modal */}
      <AvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        src={user?.avatar || null}
        name={user?.name || undefined}
        username={user?.username || undefined}
      />
      </div>
    </PullToRefresh>
  );
}
