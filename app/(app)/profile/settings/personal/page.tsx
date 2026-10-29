'use client';

/**
 * Datos personales y Perfil Físico ("Dinos cómo eres") - Contexto §4F
 * Avatar, Nombre, Bio, Usuario + Altura, Tipo de cuerpo, Color de ojos y Color de pelo
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Camera, Loader2, CheckCircle, XCircle, Ruler, Eye, Palette, User, Check } from 'lucide-react';
import { Button } from '@/components';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import { useSocial } from '@/lib/hooks/useSocial';
import {
  BODY_TYPES_BY_GENDER,
  EYE_COLOR_OPTIONS,
  HAIR_COLOR_OPTIONS,
} from '@/components/AvatarCalibrationModal';
import { toast } from 'sonner';

const MAX_BIO_LENGTH = 300;

export default function PersonalSettingsPage() {
  const router = useRouter();
  const { user, setUser, refreshProfile } = useUser();
  const { checkUsernameAvailability } = useSocial();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Physical Profile ("Dinos cómo eres")
  const [gender, setGender] = useState<'woman' | 'man' | 'other'>('woman');
  const [height, setHeight] = useState<number>(170);
  const [bodyType, setBodyType] = useState<string>('reloj_de_arena');
  const [eyeColor, setEyeColor] = useState<string>('marron_oscuro');
  const [hairColor, setHairColor] = useState<string>('castano_oscuro');

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

      const g =
        user.gender === 'man' || (user.gender as any) === 'men'
          ? 'man'
          : user.gender === 'other' || (user.gender as any) === 'unisex'
          ? 'other'
          : 'woman';
      setGender(g);
      if (user.height) setHeight(Number(user.height));
      if (user.bodyType || user.morphology) setBodyType(user.bodyType || user.morphology || 'reloj_de_arena');
      if (user.eyeColor) setEyeColor(user.eyeColor);
      if (user.hairColor) setHairColor(user.hairColor);
    }
  }, [user]);

  const currentBodyOptions = BODY_TYPES_BY_GENDER[gender] || BODY_TYPES_BY_GENDER.woman;

  useEffect(() => {
    const validIds = currentBodyOptions.map((o) => o.id);
    if (!validIds.includes(bodyType)) {
      setBodyType(currentBodyOptions[0].id);
    }
  }, [gender]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(val);
    setIsUsernameAvailable(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

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
      toast.error('El nombre de usuario no está disponible');
      return;
    }

    if (bio.length > MAX_BIO_LENGTH) {
      toast.error(`La biografía no puede superar los ${MAX_BIO_LENGTH} caracteres`);
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = user.avatar;

      if (avatarFile) {
        const url = await uploadAvatar(user.id);
        if (url) avatarUrl = url;
      }

      const physicalProfilePayload = {
        gender,
        height,
        body_type: bodyType,
        eye_color: eyeColor,
        hair_color: hairColor,
        updated_at: new Date().toISOString(),
      };

      const currentNotifPrefs = (user.notificationSettings as any) || {};
      const updatedNotifPrefs = {
        ...currentNotifPrefs,
        physical_profile: physicalProfilePayload,
      };

      const fullPayload: Record<string, any> = {
        full_name: fullName || null,
        username: username || null,
        bio: bio.trim().slice(0, MAX_BIO_LENGTH) || null,
        avatar_url: avatarUrl || null,
        gender,
        height,
        body_shape: bodyType,
        morphology: bodyType,
        notification_preferences: updatedNotifPrefs,
        updated_at: new Date().toISOString(),
      };

      let { error } = await (supabase as any)
        .from('profiles')
        .update(fullPayload)
        .eq('id', user.id);

      if (error) {
        const fallback = await (supabase as any)
          .from('profiles')
          .update({
            full_name: fullName || null,
            username: username || null,
            bio: bio.trim().slice(0, MAX_BIO_LENGTH) || null,
            avatar_url: avatarUrl || null,
            gender,
            notification_preferences: updatedNotifPrefs,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        error = fallback.error;
      }

      if (error) throw error;

      if (typeof window !== 'undefined' && user.id) {
        localStorage.setItem(`wardrobe_physical_profile_${user.id}`, JSON.stringify(physicalProfilePayload));
      }

      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: fullName || prev.name,
              username: username || prev.username,
              bio: bio.trim().slice(0, MAX_BIO_LENGTH) || undefined,
              avatar: avatarUrl || prev.avatar,
              gender,
              height,
              bodyType,
              morphology: bodyType,
              eyeColor,
              hairColor,
            }
          : null
      );

      await refreshProfile();
      toast.success('Perfil y rasgos físicos actualizados');
      router.push('/profile/settings');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'No se pudo guardar. Inténtalo de nuevo.');
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
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 h-14 apple-glass-bar px-4 flex items-center justify-between pt-safe md:hidden">
        <Link
          href="/profile/settings"
          className="touch-target-44 flex items-center justify-center -ml-2 text-[var(--foreground)] hover:text-[var(--brand-pink)] transition-colors"
          aria-label="Volver"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)] absolute left-1/2 -translate-x-1/2 select-none">
          Datos personales
        </h1>
        <div className="w-10" />
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 md:py-8 space-y-6">
        {/* Desktop Top Header */}
        <div className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-color)] relative">
          <Link href="/profile/settings">
            <button
              className="p-2 -ml-2 rounded-full text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors cursor-pointer"
              aria-label="Volver a configuración"
              title="Volver a configuración"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] absolute left-1/2 -translate-x-1/2 select-none">
            Datos personales
          </h1>
          <div className="w-10" />
        </div>

        {/* 1. Identidad y Avatar */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
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
              className="w-full px-4 py-3 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] outline-none focus:border-[var(--foreground-tertiary)]"
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
                    : 'border-[var(--border-color)] focus:border-[var(--foreground-tertiary)]'
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">Bio</label>
              <span className={`text-xs ${bio.length >= MAX_BIO_LENGTH ? 'text-red-500 font-bold' : 'text-[var(--foreground-tertiary)]'}`}>
                {bio.length}/{MAX_BIO_LENGTH}
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
              maxLength={MAX_BIO_LENGTH}
              placeholder="Cuéntanos sobre tu estilo..."
              rows={3}
              className="w-full px-4 py-3 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] outline-none focus:border-[var(--foreground-tertiary)] resize-none"
            />
          </div>
        </div>

        {/* 2. Dinos cómo eres (Perfil Físico para Kloe) */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-semibold mb-2">
              <User className="w-3.5 h-3.5" />
              <span>Perfil físico para Kloe</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Dinos cómo eres
            </h2>
            <p className="text-xs text-[var(--foreground-secondary)] mt-1">
              Kloe usa estos datos para adaptar proporciones, cortes y armonía de color a ti sin necesidad de fotos faciales.
            </p>
          </div>

          {/* Chica / Chico / Unisex */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground-secondary)] mb-2">
              ¿Cómo te defines?
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'woman', label: 'Chica' },
                { id: 'man', label: 'Chico' },
                { id: 'other', label: 'Unisex' },
              ].map((g) => {
                const active = gender === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGender(g.id as 'woman' | 'man' | 'other')}
                    className={`py-2.5 px-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer border ${
                      active
                        ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                        : 'bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)]'
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Altura */}
          <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--foreground-secondary)] flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-[var(--brand-pink)]" />
                Altura
              </span>
              <span className="text-xl font-bold text-[var(--foreground)] font-display tabular-nums">
                {height} <span className="text-xs font-normal text-[var(--foreground-secondary)]">cm</span>
              </span>
            </div>
            <input
              type="range"
              min={145}
              max={210}
              step={1}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-[var(--brand-pink)] cursor-pointer h-2 rounded-lg"
            />
          </div>

          {/* Tipo de cuerpo */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground-secondary)] mb-2">
              Tipo de cuerpo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentBodyOptions.map((opt) => {
                const active = bodyType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBodyType(opt.id)}
                    className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      active
                        ? 'bg-[var(--brand-pink)]/10 border-[var(--brand-pink)] text-[var(--foreground)]'
                        : 'bg-[var(--background-secondary)] border-[var(--border-color)] text-[var(--foreground)]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-[11px] text-[var(--foreground-secondary)] mt-0.5 leading-snug">{opt.desc}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                        active
                          ? 'bg-[var(--brand-pink)] border-[var(--brand-pink)] text-white'
                          : 'border-[var(--border-color)]'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color de ojos */}
          <div>
            <label className="text-xs font-semibold text-[var(--foreground-secondary)] mb-2 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[var(--brand-pink)]" />
              Color de ojos
            </label>
            <div className="flex flex-wrap gap-2">
              {EYE_COLOR_OPTIONS.map((eye) => {
                const active = eyeColor === eye.id;
                return (
                  <button
                    key={eye.id}
                    type="button"
                    onClick={() => setEyeColor(eye.id)}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                      active
                        ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                        : 'bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)]'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: eye.swatch }} />
                    <span>{eye.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color de pelo */}
          <div>
            <label className="text-xs font-semibold text-[var(--foreground-secondary)] mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[var(--brand-pink)]" />
              Color de pelo
            </label>
            <div className="flex flex-wrap gap-2">
              {HAIR_COLOR_OPTIONS.map((hair) => {
                const active = hairColor === hair.id;
                return (
                  <button
                    key={hair.id}
                    type="button"
                    onClick={() => setHairColor(hair.id)}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                      active
                        ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                        : 'bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)]'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: hair.swatch }} />
                    <span>{hair.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || (usernameChanged && isUsernameAvailable === false)}
            className="w-full rounded-full py-3.5"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
