'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Check, User } from 'lucide-react';
import { useUser } from '@/store/userStore';

interface AvatarUploaderProps {
  currentAvatar?: string;
  onSave: (avatarUrl: string) => void;
}

export default function AvatarUploader({ currentAvatar, onSave }: AvatarUploaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (previewUrl) {
      onSave(previewUrl);
      if (user) {
        setUser({ ...user, avatar: previewUrl });
      }
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(currentAvatar || null);
    setIsEditing(false);
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative group">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--background)] shadow-[var(--shadow-float-strong)] bg-[var(--surface)]">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--surface-secondary)] text-[var(--foreground-tertiary)]">
              <User className="w-12 h-12" />
            </div>
          )}
          
          {/* Overlay for editing */}
          <div 
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Edit Button (when not editing) */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[var(--brand-pink)] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <Camera className="w-5 h-5" />
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Action Buttons (when editing) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex gap-3 mt-4"
          >
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-secondary)] text-sm font-medium hover:bg-[var(--surface-secondary)] transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-pink)] text-white text-sm font-medium shadow-lg shadow-[var(--brand-pink)]/20 hover:brightness-110 transition-all"
            >
              <Check className="w-4 h-4" />
              Guardar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
