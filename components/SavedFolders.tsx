'use client';

/**
 * SavedFolders - Component for managing saved posts and outfits in folders
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder as FolderIcon, Plus, MoreVertical, Edit2, Trash2, Lock, Globe } from 'lucide-react';
import { Button, Card } from '@/components';
import type { Folder } from '@/types/social';

interface SavedFoldersProps {
    folders: Folder[];
    onCreateFolder: (name: string, isPrivate: boolean) => void;
    onDeleteFolder: (folderId: string) => void;
    onRenameFolder: (folderId: string, newName: string) => void;
    onSelectFolder: (folderId: string) => void;
}

export default function SavedFolders({
    folders,
    onCreateFolder,
    onDeleteFolder,
    onRenameFolder,
    onSelectFolder,
}: SavedFoldersProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderPrivate, setNewFolderPrivate] = useState(true);
    const [editingFolder, setEditingFolder] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            onCreateFolder(newFolderName, newFolderPrivate);
            setNewFolderName('');
            setNewFolderPrivate(true);
            setShowCreateModal(false);
        }
    };

    const handleRenameFolder = (folderId: string) => {
        if (editName.trim()) {
            onRenameFolder(folderId, editName);
            setEditingFolder(null);
            setEditName('');
        }
    };

    const startEditing = (folder: Folder) => {
        setEditingFolder(folder.id);
        setEditName(folder.name);
        setMenuOpen(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--foreground)]">Mis Carpetas</h2>
                    <p className="text-sm text-[var(--foreground-tertiary)] mt-1">
                        Organiza tus posts y outfits favoritos
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Nueva Carpeta
                </Button>
            </div>

            {/* Folders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder) => (
                    <motion.div
                        key={folder.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <Card className="p-0 overflow-hidden hover-lift cursor-pointer group">
                            {/* Cover Image */}
                            <div
                                className="h-40 bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)] flex items-center justify-center relative"
                                onClick={() => onSelectFolder(folder.id)}
                            >
                                {folder.coverImage ? (
                                    <img
                                        src={folder.coverImage}
                                        alt={folder.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FolderIcon className="w-16 h-16 text-[var(--foreground-tertiary)] opacity-30" />
                                )}

                                {/* Privacy indicator */}
                                <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm flex items-center gap-1">
                                    {folder.isPrivate ? (
                                        <>
                                            <Lock className="w-3 h-3 text-white" />
                                            <span className="text-xs text-white">Privado</span>
                                        </>
                                    ) : (
                                        <>
                                            <Globe className="w-3 h-3 text-white" />
                                            <span className="text-xs text-white">Público</span>
                                        </>
                                    )}
                                </div>

                                {/* Menu button */}
                                <div className="absolute top-3 right-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen(menuOpen === folder.id ? null : folder.id);
                                        }}
                                        className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4 text-white" />
                                    </button>

                                    {/* Dropdown menu */}
                                    {menuOpen === folder.id && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute right-0 mt-2 w-40 bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-float-strong)] border border-[var(--border-color)] overflow-hidden z-10"
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(folder);
                                                }}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--background-secondary)] transition-colors text-left"
                                            >
                                                <Edit2 className="w-4 h-4 text-[var(--foreground-secondary)]" />
                                                <span className="text-sm text-[var(--foreground)]">Renombrar</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('¿Eliminar esta carpeta?')) {
                                                        onDeleteFolder(folder.id);
                                                    }
                                                    setMenuOpen(null);
                                                }}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                <span className="text-sm text-red-500">Eliminar</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Folder Info */}
                            <div className="p-4" onClick={() => onSelectFolder(folder.id)}>
                                {editingFolder === folder.id ? (
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRenameFolder(folder.id);
                                                if (e.key === 'Escape') setEditingFolder(null);
                                            }}
                                            className="flex-1 px-3 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                            autoFocus
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => handleRenameFolder(folder.id)}
                                            className="!px-3"
                                        >
                                            ✓
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-semibold text-[var(--foreground)] mb-1 line-clamp-1">
                                            {folder.name}
                                        </h3>
                                        <p className="text-sm text-[var(--foreground-tertiary)]">
                                            {folder.savedPosts.length + folder.savedOutfits.length} elementos
                                        </p>
                                    </>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}

                {/* Empty state */}
                {folders.length === 0 && (
                    <div className="col-span-full">
                        <Card className="p-12 text-center">
                            <FolderIcon className="w-16 h-16 text-[var(--foreground-tertiary)] mx-auto mb-4 opacity-30" />
                            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                                No tienes carpetas aún
                            </h3>
                            <p className="text-[var(--foreground-tertiary)] mb-6">
                                Crea tu primera carpeta para organizar tus posts favoritos
                            </p>
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="w-5 h-5 mr-2" />
                                Crear Carpeta
                            </Button>
                        </Card>
                    </div>
                )}
            </div>

            {/* Create Folder Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-md"
                        >
                            <Card className="p-6">
                                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
                                    Nueva Carpeta
                                </h3>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                                            Nombre de la carpeta
                                        </label>
                                        <input
                                            type="text"
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                            placeholder="Ej: Looks de invierno"
                                            className="w-full px-4 py-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-3">
                                            Privacidad
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setNewFolderPrivate(true)}
                                                className={`p-4 rounded-2xl border-2 transition-all ${newFolderPrivate
                                                        ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5'
                                                        : 'border-[var(--border-color)]'
                                                    }`}
                                            >
                                                <Lock className="w-5 h-5 mx-auto mb-2 text-[var(--foreground-secondary)]" />
                                                <div className="text-sm font-medium text-[var(--foreground)]">Privado</div>
                                            </button>
                                            <button
                                                onClick={() => setNewFolderPrivate(false)}
                                                className={`p-4 rounded-2xl border-2 transition-all ${!newFolderPrivate
                                                        ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5'
                                                        : 'border-[var(--border-color)]'
                                                    }`}
                                            >
                                                <Globe className="w-5 h-5 mx-auto mb-2 text-[var(--foreground-secondary)]" />
                                                <div className="text-sm font-medium text-[var(--foreground)]">Público</div>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setNewFolderName('');
                                            setNewFolderPrivate(true);
                                        }}
                                        className="flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleCreateFolder}
                                        disabled={!newFolderName.trim()}
                                        className="flex-1"
                                        glow
                                    >
                                        Crear
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
