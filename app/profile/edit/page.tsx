'use client';

/**
 * Edit Profile Page - Editar información del perfil y avatar
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Save, Camera, Edit2, AtSign, AlignLeft, Check, AlertCircle } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, Button } from '@/components';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useSocial } from '@/lib/hooks/useSocial';

export default function EditProfilePage() {
  const { user: authUser } = useAuth();
  const { user, setUser } = useUser();
  const { checkUsernameAvailability } = useSocial();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  // Using user.email is fine, if not we could fetch from authUser.email
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Username validation state
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [originalUsername, setOriginalUsername] = useState('');

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    if (user && authUser) {
      setName(user.name);
      setEmail(user.email || authUser.email || '');

      // Fetch full profile data (username, bio)
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('username, bio')
          .eq('id', authUser.id)
          .single();

        if (data) {
          setUsername(data.username || '');
          setOriginalUsername(data.username || '');
          setBio(data.bio || '');
        }
      };

      fetchProfile();
    }
  }, [user, authUser]);

  // Username Availability Check Debounce
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setIsUsernameAvailable(null);
        return;
      }

      if (username === originalUsername) {
        setIsUsernameAvailable(true);
        return;
      }

      setIsCheckingUsername(true);
      const available = await checkUsernameAvailability(username);
      setIsUsernameAvailable(available);
      setIsCheckingUsername(false);
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username, originalUsername, checkUsernameAvailability]);


  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setAvatarFile(file);
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      // 1. Delete old avatar if exists (optional cleanup)
      if (user?.avatar) {
        try {
          // Extract filename from URL
          const oldUrl = new URL(user.avatar);
          const oldPath = oldUrl.pathname.split('/').pop();
          if (oldPath) {
            await supabase.storage.from('avatars').remove([oldPath]);
          }
        } catch (e) {
          // Ignore errors when deleting old avatar
          console.log('Could not delete old avatar:', e);
        }
      }

      // 2. Upload new avatar with user ID as filename
      const fileExt = avatarFile.name.split('.').pop() || 'jpg';
      const fileName = `${userId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          upsert: true, // Overwrite if exists
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Error al subir la imagen: ${uploadError.message}`);
      }

      // 3. Get public URL with timestamp to avoid cache
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const urlWithCache = `${data.publicUrl}?t=${Date.now()}`;
      
      return urlWithCache;
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!authUser) return;
    if (isUsernameAvailable === false) {
      setMessage('Error: El nombre de usuario no es válido o ya existe');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      let avatarUrl = user?.avatar;

      // 1. Upload new avatar if selected
      if (avatarFile) {
        const url = await uploadAvatar(authUser.id);
        if (url) avatarUrl = url;
      }

      // 2. Update Profile in DB (New Table)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          full_name: name,
          username: username || null, // Allow null if empty
          bio: bio || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error('El nombre de usuario ya está en uso. Elige otro.');
        }
        throw error;
      }

      // 2.5 Sync with Legacy 'users' table just in case (optional but safe)
      await supabase.from('users').update({
        name: name,
        avatar: avatarUrl
      }).eq('id', authUser.id);

      // 3. Update local store
      if (user) {
        setUser({
          ...user,
          name,
          avatar: avatarUrl,
        });
      }

      setMessage('Perfil actualizado correctamente');

      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (error: any) {
      console.error('Update error:', error);
      setMessage(error.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass-strong border-b border-[var(--border-color)] px-4 py-3"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-lg font-bold text-[var(--foreground)]">Editar Perfil</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">
              Información Personal
            </h2>

            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--background-secondary)] shadow-lg relative bg-[var(--background-secondary)]">
                  {/* Avatar Preview */}
                  {(avatarPreview || user?.avatar) ? (
                    <img
                      src={avatarPreview || user?.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--brand-pink)] flex items-center justify-center text-4xl font-bold text-white">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Edit Icon Badge */}
                <div className="absolute bottom-1 right-1 bg-[var(--brand-pink)] p-2 rounded-full border-2 border-[var(--card-bg)] shadow-sm">
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <p className="text-sm text-[var(--foreground-secondary)] mt-3">
                Toca para cambiar la foto
              </p>
            </div>

            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                  />
                </div>
              </div>

              {/* Username Field - Unique */}
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                  Nombre de usuario (único)
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} // Restrict chars
                    placeholder="usuario_ejemplo"
                    className={`w-full pl-11 pr-10 py-3 rounded-2xl bg-[var(--background-secondary)] border text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 ${isUsernameAvailable === false
                      ? 'border-red-500 focus:ring-red-500'
                      : isUsernameAvailable === true
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-[var(--border-color)] focus:ring-[var(--brand-pink)]'
                      }`}
                  />
                  {/* Status Icon */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isCheckingUsername ? (
                      <div className="w-4 h-4 border-2 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin" />
                    ) : isUsernameAvailable === true ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : isUsernameAvailable === false ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {isUsernameAvailable === false && (
                  <p className="text-xs text-red-500 mt-1 ml-1">nombre de usuario no disponible</p>
                )}
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                  Biografía
                </label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-4 w-5 h-5 text-[var(--foreground-tertiary)]" />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuéntanos sobre ti..."
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] resize-none"
                  />
                </div>
              </div>


              {/* Email Field (Read Only) */}
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--background-tertiary)] border border-[var(--border-color)] text-[var(--foreground-secondary)] cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-[var(--foreground-tertiary)] mt-2">
                  El email no se puede cambiar
                </p>
              </div>

              {/* Message */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl ${message.includes('Error') || message.includes('uso')
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-green-500/10 text-green-500'
                    }`}
                >
                  {message}
                </motion.div>
              )}

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={loading || !name.trim() || (isUsernameAvailable === false)}
                className="w-full"
                glow
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
