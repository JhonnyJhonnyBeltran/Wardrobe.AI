'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Grid3x3, Bookmark, Camera, Heart, MessageCircle, Plus, FolderPlus } from 'lucide-react';
import { currentUser, mockSocialPosts, type SocialPost } from '@/data/mockData';
import Link from 'next/link';

type Tab = 'posts' | 'saved';

interface Folder {
  id: string;
  name: string;
  posts: SocialPost[];
  isPrivate: boolean;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [showSettings, setShowSettings] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: '1',
      name: 'Favoritos',
      posts: mockSocialPosts.filter(p => p.isSaved),
      isPrivate: false,
    },
  ]);

  const myPosts = mockSocialPosts.slice(0, 3);

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName,
      posts: [],
      isPrivate: true,
    };
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setShowNewFolder(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 pt-4"
      >
        {/* Cover */}
        <div className="relative h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--brand-pink)]/20 to-[var(--brand-pink-dark)]/20 mb-4">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&h=400&fit=crop')] bg-cover bg-center opacity-30" />
        </div>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-8 right-8 w-10 h-10 rounded-full glass-strong flex items-center justify-center shadow-lg z-10"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="relative -mt-16 mb-4 flex justify-center">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-28 h-28 rounded-full border-4 border-[var(--background)] shadow-[var(--shadow-float-strong)]"
            />
            <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[var(--brand-pink)] flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">{currentUser.name}</h1>
          <p className="text-sm text-[var(--foreground-tertiary)] mb-3">{currentUser.username}</p>

          <div className="flex justify-center gap-6 mb-4">
            <div>
              <p className="text-xl font-bold">{myPosts.length}</p>
              <p className="text-xs text-[var(--foreground-tertiary)]">Posts</p>
            </div>
            <div>
              <p className="text-xl font-bold">234</p>
              <p className="text-xs text-[var(--foreground-tertiary)]">Seguidores</p>
            </div>
            <div>
              <p className="text-xl font-bold">180</p>
              <p className="text-xs text-[var(--foreground-tertiary)]">Siguiendo</p>
            </div>
          </div>

          <button className="px-6 py-2 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm font-semibold">
            Editar Perfil
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${activeTab === 'posts'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
              }`}
          >
            <Grid3x3 className="w-5 h-5" />
            <span className="text-sm font-semibold">Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${activeTab === 'saved'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
              }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-sm font-semibold">Guardados</span>
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'posts' ? (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-3 gap-2"
            >
              {myPosts.map((post, index) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="aspect-square rounded-2xl overflow-hidden bg-[var(--background-secondary)] relative group cursor-pointer"
                  >
                    <img
                      src={post.images.outfit}
                      alt={post.outfit.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-4 text-white">
                        <div className="flex items-center gap-1">
                          <Heart className="w-5 h-5 fill-white" />
                          <span className="text-sm font-bold">{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-5 h-5 fill-white" />
                          <span className="text-sm font-bold">{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Folders */}
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-3">Carpetas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* New Folder */}
                  {showNewFolder ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="aspect-square rounded-2xl bg-[var(--background-secondary)] p-3 flex flex-col gap-2"
                    >
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                        placeholder="Nombre"
                        autoFocus
                        className="flex-1 px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border-color)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={createFolder}
                          className="flex-1 py-2 rounded-xl bg-[var(--brand-pink)] text-white text-xs font-semibold"
                        >
                          Crear
                        </button>
                        <button
                          onClick={() => {
                            setShowNewFolder(false);
                            setNewFolderName('');
                          }}
                          className="px-3 py-2 rounded-xl bg-[var(--background-tertiary)] text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setShowNewFolder(true)}
                      className="aspect-square rounded-2xl bg-[var(--background-secondary)] border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center gap-2 hover:border-[var(--brand-pink)] transition-colors"
                    >
                      <FolderPlus className="w-8 h-8 text-[var(--brand-pink)]" />
                      <p className="text-xs font-semibold">Nueva</p>
                    </button>
                  )}

                  {folders.map((folder) => (
                    <Link key={folder.id} href={`/folder/${folder.id}`}>
                      <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--background-secondary)] relative cursor-pointer group">
                        {folder.posts.length > 0 ? (
                          <>
                            <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                              {folder.posts.slice(0, 4).map((post, i) => (
                                <img
                                  key={i}
                                  src={post.images.outfit}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ))}
                            </div>
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                              <p className="text-sm font-bold text-white">{folder.name}</p>
                              <p className="text-xs text-white/80">{folder.posts.length} posts</p>
                              {folder.isPrivate && <p className="text-[10px] text-white/60 mt-1">🔒 Privado</p>}
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <Bookmark className="w-8 h-8 text-[var(--foreground-tertiary)] mb-2" />
                            <p className="text-sm font-bold">{folder.name}</p>
                            <p className="text-xs text-[var(--foreground-tertiary)]">Vacía</p>
                            {folder.isPrivate && <p className="text-[10px] text-[var(--foreground-tertiary)] mt-1">🔒</p>}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-[var(--background)] z-50 shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-[var(--background-secondary)] flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <button className="w-full text-left px-4 py-3 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors">
                  <p className="font-semibold text-sm">Smart Profile</p>
                  <p className="text-xs text-[var(--foreground-tertiary)]">Morfología y colorimetría</p>
                </button>

                <button className="w-full text-left px-4 py-3 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors">
                  <p className="font-semibold text-sm">Privacidad</p>
                  <p className="text-xs text-[var(--foreground-tertiary)]">Control de cuenta</p>
                </button>

                <button className="w-full text-left px-4 py-3 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors">
                  <p className="font-semibold text-sm">Notificaciones</p>
                  <p className="text-xs text-[var(--foreground-tertiary)]">Alertas</p>
                </button>

                <button className="w-full text-left px-4 py-3 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors">
                  <p className="font-semibold text-sm">Premium</p>
                  <p className="text-xs text-[var(--brand-pink)]">Desbloquea todo</p>
                </button>

                <div className="border-t border-[var(--border-color)] my-4" />

                <button className="w-full text-left px-4 py-3 rounded-2xl hover:bg-red-500/10 transition-colors">
                  <p className="font-semibold text-sm text-red-500">Cerrar sesión</p>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}