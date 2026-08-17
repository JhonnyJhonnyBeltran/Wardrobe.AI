'use client';

/**
 * Datos personales - Contexto §4F
 * Avatar, Nombre, Bio, Usuario
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Camera, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, Button } from '@/components';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import { useSocial } from '@/lib/hooks/useSocial';

export default function PersonalSettingsPage() {
  const router = useRouter();
  const { user, refreshProfile } = useUser();
  const { checkUsernameAvailability } = useSocial();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Username availability
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(val);
    setIsUsernameAvailable(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Skip check if it's the same as current username
    if (val === user?.username) {
      return;
    }

    if (val.length < 3) return;

    debounceRef.current = setTimeout(async () => {
      setIsCheckingUsername(true);
      const available = await checkUsernameAvailability(val);
      setIsCheckingUsername(false);
      setIsUsernameAvailable(available);
    }, 600);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setAvatarFile(file);
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      if (user?.avatar) {
        try {
          const oldUrl = new URL(user.avatar);
          const oldPath = oldUrl.pathname.split('/').pop();
          if (oldPath) {
            await supabase.storage.from('avatars').remove([oldPath]);
          }
        } catch (e) {
          console.log('Could not delete old avatar:', e);
        }
      }

      const fileExt = avatarFile.name.split('.').pop() || 'jpg';
      const fileName = `${userId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Error al subir la imagen: ${uploadError.message}`);
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const urlWithCache = `${data.publicUrl}?t=${Date.now()}`;
      
      return urlWithCache;
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (username !== user.username && isUsernameAvailable === false) {
      alert('El nombre de usuario no está disponible');
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = user.avatar;

      if (avatarFile) {
        const url = await uploadAvatar(user.id);
        if (url) avatarUrl = url;
      }

      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: fullName || null,
          username: username || null,
          bio: bio || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      router.push('/profile/settings');
    } catch (e) {
      console.error(e);
      alert('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const usernameChanged = username !== (user.username || '');
  const usernameError = usernameChanged && isUsernameAvailable === false;
  const usernameOk = usernameChanged && isUsernameAvailable === true;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
          <Link
            href="/profile/settings"
            className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </Link>
          <h1 className="text-lg font-bold text-[var(--foreground)]">Datos personales</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-5 space-y-4">
          <div className="flex flex-col items-center mb-4">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--background-secondary)] shadow-lg relative bg-[var(--background-secondary)]">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--brand-pink)] flex items-center justify-center text-4xl font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute bottom-1 right-1 bg-[var(--brand-pink)] p-2 rounded-full border-2 border-[var(--card-bg)] shadow-sm">
                <Camera className="w-4 h-4 text-white" />
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

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Nombre</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] outline-none focus:border-[var(--brand-pink)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Usuario</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="@usuario"
                className={`w-full px-4 py-3 pr-10 bg-[var(--background-secondary)] rounded-xl border text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] outline-none transition-colors ${
                  usernameError
                    ? 'border-red-500 focus:border-red-500'
                    : usernameOk
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-[var(--border-color)] focus:border-[var(--brand-pink)]'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingUsername && (
                  <Loader2 className="w-4 h-4 text-[var(--foreground-tertiary)] animate-spin" />
                )}
                {!isCheckingUsername && usernameOk && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {!isCheckingUsername && usernameError && (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            {usernameError && (
              <p className="text-red-500 text-xs mt-1.5 ml-1">Este nombre de usuario ya está en uso</p>
            )}
            {usernameOk && (
              <p className="text-green-500 text-xs mt-1.5 ml-1">¡Nombre de usuario disponible!</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos sobre tu estilo..."
              rows={3}
              className="w-full px-4 py-3 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] outline-none focus:border-[var(--brand-pink)] resize-none"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || (usernameChanged && isUsernameAvailable === false)}
            className="w-full rounded-full py-3"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
