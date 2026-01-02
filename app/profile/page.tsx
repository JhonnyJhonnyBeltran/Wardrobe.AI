'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Grid3x3, Bookmark, Camera, Heart, MessageCircle, Plus, FolderPlus, Sparkles, Ruler, Palette, X } from 'lucide-react';
import { mockSocialPosts, type SocialPost } from '@/data/mockData';
import Link from 'next/link';
import { useUser } from '@/store/userStore';
import AvatarUploader from '@/components/SmartProfile/AvatarUploader';
import MorphologyQuiz, { BodyType } from '@/components/SmartProfile/MorphologyQuiz';
import ColorimetryAnalyzer, { Season } from '@/components/SmartProfile/ColorimetryAnalyzer';
import { Card } from '@/components';

type Tab = 'posts' | 'saved' | 'smart-profile';

interface Folder {
  id: string;
  name: string;
  posts: SocialPost[];
  isPrivate: boolean;
}

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [showSettings, setShowSettings] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Quiz states
  const [activeQuiz, setActiveQuiz] = useState<'morphology' | 'colorimetry' | null>(null);

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

  const handleAvatarSave = (url: string) => {
    if (user) {
      setUser({ ...user, avatar: url });
    }
  };

  const handleMorphologyComplete = (bodyType: BodyType) => {
    if (user) {
      setUser({ ...user, morphology: bodyType });
    }
    setActiveQuiz(null);
  };

  const handleColorimetryComplete = (season: Season) => {
    if (user) {
      setUser({ ...user, colorimetry: season });
    }
    setActiveQuiz(null);
  };

  if (!user) return null; // Or loading state

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
           <AvatarUploader currentAvatar={user.avatar} onSave={handleAvatarSave} />
        </div>

        {/* Info */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">{user.name}</h1>
          <p className="text-sm text-[var(--foreground-tertiary)] mb-3">@{user.name.toLowerCase().replace(/\s/g, '')}</p>

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
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-color)] mb-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${activeTab === 'posts'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
              }`}
          >
            <Grid3x3 className="w-5 h-5" />
            <span className="text-sm font-semibold hidden md:inline">Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('smart-profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${activeTab === 'smart-profile'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
              }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold hidden md:inline">Smart Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${activeTab === 'saved'
                ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground-tertiary)]'
              }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-sm font-semibold hidden md:inline">Guardados</span>
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
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
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          )}

          {activeTab === 'smart-profile' && (
            <motion.div
              key="smart-profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Paper Doll Preview (Placeholder) */}
              <Card className="p-6 flex flex-col items-center text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-pink-dark)]" />
                 <h3 className="text-lg font-bold mb-2">Tu Avatar Digital</h3>
                 <p className="text-sm text-[var(--foreground-tertiary)] mb-4">
                   Visualiza tus outfits en tu modelo virtual personalizado.
                 </p>
                 <div className="w-32 h-48 bg-[var(--surface-secondary)] rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-[var(--border-color)]">
                    <span className="text-xs text-[var(--foreground-tertiary)]">Paper Doll<br/>Coming Soon</span>
                 </div>
                 <button className="text-xs font-semibold text-[var(--brand-pink)]">
                   Personalizar medidas
                 </button>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Morphology Card */}
                <Card className="p-6 relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {user.morphology && (
                      <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold">
                        Completado
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-1">Morfología</h3>
                  <p className="text-sm text-[var(--foreground-tertiary)] mb-4">
                    {user.morphology 
                      ? `Tu tipo de cuerpo es: ${user.morphology}`
                      : "Descubre tu tipo de cuerpo y qué cortes te favorecen."}
                  </p>
                  <button 
                    onClick={() => setActiveQuiz('morphology')}
                    className="w-full py-2 rounded-xl bg-[var(--surface-secondary)] text-sm font-semibold hover:bg-[var(--surface-tertiary)] transition-colors"
                  >
                    {user.morphology ? 'Ver análisis' : 'Iniciar test'}
                  </button>
                </Card>

                {/* Colorimetry Card */}
                <Card className="p-6 relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    {user.colorimetry && (
                      <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold">
                        Completado
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-1">Colorimetría</h3>
                  <p className="text-sm text-[var(--foreground-tertiary)] mb-4">
                    {user.colorimetry 
                      ? `Tu estación es: ${user.colorimetry}`
                      : "Encuentra tu paleta de colores ideal."}
                  </p>
                  <button 
                    onClick={() => setActiveQuiz('colorimetry')}
                    className="w-full py-2 rounded-xl bg-[var(--surface-secondary)] text-sm font-semibold hover:bg-[var(--surface-tertiary)] transition-colors"
                  >
                    {user.colorimetry ? 'Ver paleta' : 'Iniciar análisis'}
                  </button>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'saved' && (
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

      {/* Quiz Modal */}
      <AnimatePresence>
        {activeQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--background)] z-50 overflow-y-auto"
          >
            <div className="p-4">
              <button 
                onClick={() => setActiveQuiz(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="mt-8 max-w-2xl mx-auto">
                {activeQuiz === 'morphology' && (
                  <MorphologyQuiz onComplete={handleMorphologyComplete} />
                )}
                {activeQuiz === 'colorimetry' && (
                  <ColorimetryAnalyzer onComplete={handleColorimetryComplete} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {/* ... other settings ... */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
