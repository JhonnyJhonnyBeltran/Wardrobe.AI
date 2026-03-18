/**
 * SavePostModal - Modal para guardar posts en carpetas
 * Permite seleccionar carpeta existente o crear nueva
 */
'use client';

import { useState, useEffect } from 'react';
import { X, Folder, Plus, Check, ChevronRight, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';

interface SavePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onSaved?: () => void;
}

interface Folder {
  id: string;
  name: string;
  post_count?: number;
}

export default function SavePostModal({ isOpen, onClose, postId, onSaved }: SavePostModalProps) {
  const { user } = useUser();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedQuick, setSavedQuick] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchFolders();
    }
  }, [isOpen, user]);

  const fetchFolders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get saved posts folders - you'd need a saves_folders table
      // For now, we'll create a simple structure
      const { data, error } = await (supabase.from('saved_posts') as any)
        .select('folder_name')
        .eq('user_id', user.id);
      
      if (error) throw error;

      // Group by folder and count
      const folderMap = new Map<string, number>();
      (data || []).forEach((item: any) => {
        const folder = item.folder_name || 'Guardados';
        folderMap.set(folder, (folderMap.get(folder) || 0) + 1);
      });

      const folderList: Folder[] = [];
      folderMap.forEach((count, name) => {
        folderList.push({ id: name, name, post_count: count });
      });

      // Always add "Guardados" (Saved) as default if not exists
      if (!folderList.find(f => f.name === 'Guardados')) {
        folderList.unshift({ id: 'default', name: 'Guardados', post_count: 0 });
      }

      setFolders(folderList);
    } catch (error) {
      console.error('Error fetching folders:', error);
      // Default folder
      setFolders([{ id: 'default', name: 'Guardados', post_count: 0 }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (folderName?: string) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await (supabase.from('saved_posts') as any)
        .insert({
          post_id: postId,
          user_id: user.id,
          folder_name: folderName || 'Guardados'
        });

      if (error) {
        // If already saved, just mark as success
        if (error.code === '23505') {
          console.log('Post already saved');
        } else {
          throw error;
        }
      }

      setSavedQuick(true);
      setTimeout(() => {
        onSaved?.();
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !user) return;
    
    setSaving(true);
    try {
      const { error } = await (supabase.from('saved_posts') as any)
        .insert({
          post_id: postId,
          user_id: user.id,
          folder_name: newFolderName.trim()
        });

      if (error && error.code !== '23505') {
        throw error;
      }

      setNewFolderName('');
      setIsCreating(false);
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[var(--background)] rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Guardar post</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[var(--foreground-secondary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {savedQuick ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-[var(--foreground)] font-medium">¡Guardado!</p>
            </div>
          ) : loading ? (
            <div className="py-8 text-center text-[var(--foreground-secondary)]">
              Cargando...
            </div>
          ) : (
            <>
              {/* Quick Save Option */}
              <button
                onClick={() => handleSave('Guardados')}
                disabled={saving}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors mb-2"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-[var(--brand-pink)]" fill="currentColor" />
                </div>
                <span className="flex-1 text-left text-[var(--foreground)] font-medium">Guardar</span>
                <ChevronRight className="w-4 h-4 text-[var(--foreground-secondary)]" />
              </button>

              {/* Folders List */}
              <div className="space-y-1 mb-4">
                {folders.filter(f => f.name !== 'Guardados').map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id === 'default' ? 'Guardados' : folder.name)}
                    disabled={saving}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      selectedFolder === folder.name 
                        ? 'bg-[var(--brand-pink)]/10 border border-[var(--brand-pink)]' 
                        : 'hover:bg-[var(--background-secondary)]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
                      <Folder className="w-5 h-5 text-[var(--foreground-secondary)]" />
                    </div>
                    <span className="flex-1 text-left text-[var(--foreground)]">{folder.name}</span>
                    {folder.post_count !== undefined && folder.post_count > 0 && (
                      <span className="text-xs text-[var(--foreground-secondary)]">{folder.post_count}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Selected Folder Action */}
              {selectedFolder && (
                <button
                  onClick={() => handleSave(selectedFolder)}
                  disabled={saving}
                  className="w-full py-3 bg-[var(--brand-pink)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : `Guardar en "${selectedFolder}"`}
                </button>
              )}

              {/* Create New Folder */}
              {isCreating ? (
                <div className="mt-4 p-3 bg-[var(--background-secondary)] rounded-xl">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nombre de la carpeta"
                    className="w-full bg-transparent border-none outline-none text-[var(--foreground)] placeholder:text-[var(--foreground-secondary)]"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="flex-1 py-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim() || saving}
                      className="flex-1 py-2 bg-[var(--brand-pink)] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      Crear
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors mt-2"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
                    <Plus className="w-5 h-5 text-[var(--foreground-secondary)]" />
                  </div>
                  <span className="text-[var(--foreground-secondary)]">Crear carpeta nueva</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
