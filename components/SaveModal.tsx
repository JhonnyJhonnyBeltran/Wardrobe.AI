'use client';

import { useState, useEffect } from 'react';
import { X, Folder, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '@/store/uiStore';
import Image from 'next/image';
import FolderPreview from '@/components/FolderPreview';

interface SaveFolder {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  preview_images?: string[];
}

export default function SaveModal() {
  const { folderModalPostId, closeFolderModal, showSaveToast } = useUiStore();
  const [folders, setFolders] = useState<SaveFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const isOpen = !!folderModalPostId;

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
    }
  }, [isOpen]);

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/save-folders');
      const data = await response.json();
      if (data.folders) {
        setFolders(data.folders);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const assignToFolder = async (folderId: string, folderName: string) => {
    if (!folderModalPostId) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/saves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: folderModalPostId,
          folder_id: folderId
        })
      });
      const data = await response.json();

      closeFolderModal();
      showSaveToast({ message: `Guardado en ${folderName}` });
    } catch (error) {
      console.error('Error saving post to folder:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAndAssign = async () => {
    if (!newFolderName.trim() || !folderModalPostId) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/save-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() })
      });
      const data = await response.json();

      if (data.folder) {
        setFolders([data.folder, ...folders]);
        await assignToFolder(data.folder.id, data.folder.name);
        setNewFolderName('');
        setShowCreateFolder(false);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeFolderModal}
        />

        {/* Modal / Bottom Sheet */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md bg-[var(--background)] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] md:max-h-[70vh] border border-[var(--border-color)] mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle (Mobile) */}
          <div className="w-full flex justify-center pt-3 pb-1 md:hidden" onClick={closeFolderModal}>
            <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] shrink-0">
            <h2 className="text-lg font-bold text-[var(--foreground)] w-full text-center">Guardar en...</h2>
            <button
              onClick={closeFolderModal}
              className="absolute right-4 p-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors hidden md:block"
            >
              <X className="w-5 h-5 text-[var(--foreground-secondary)]" />
            </button>
          </div>

          {/* Fixed Top Action: Create Folder */}
          <div className="p-4 border-b border-[var(--border-color)] shrink-0 bg-[var(--background)]">
            {showCreateFolder ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nombre de la carpeta"
                  className="flex-1 px-4 py-2.5 bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--brand-pink)]"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAssign()}
                />
                <button
                  onClick={handleCreateAndAssign}
                  disabled={isSaving || !newFolderName.trim()}
                  className="px-4 py-2.5 bg-[var(--brand-pink)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--brand-pink)]/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateFolder(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-transparent hover:bg-[var(--background-secondary)] rounded-xl transition-colors border border-[var(--border-color)] border-dashed"
              >
                <Plus className="w-5 h-5 text-[var(--foreground)]" />
                <span className="font-bold text-[var(--foreground)]">Crear nueva carpeta</span>
              </button>
            )}
          </div>

          {/* Scrollable Folders List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-pink)]" />
              </div>
            ) : folders.length === 0 ? (
              <div className="py-10 text-center text-[var(--foreground-secondary)]">
                <Folder className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No tienes carpetas aún</p>
              </div>
            ) : (
              folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => assignToFolder(folder.id, folder.name)}
                  disabled={isSaving}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl bg-transparent hover:bg-[var(--background-secondary)] transition-colors border border-transparent hover:border-[var(--border-color)] group"
                >
                  <div className="w-14 h-14 rounded-xl bg-[var(--background)] flex items-center justify-center shrink-0 border border-[var(--border-color)] overflow-hidden relative">
                    {folder.preview_images && folder.preview_images.length > 0 ? (
                      <FolderPreview images={folder.preview_images} />
                    ) : (
                      <Folder className="w-6 h-6 text-[var(--foreground-secondary)] group-hover:text-[var(--foreground)] transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-[var(--foreground)] text-[15px]">{folder.name}</h4>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
