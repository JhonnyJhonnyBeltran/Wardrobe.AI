'use client';

/**
 * Datos personales - Contexto §4F
 * Avatar, Nombre, Bio, Usuario
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, Button } from '@/components';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';

export default function PersonalSettingsPage() {
  const router = useRouter();
  const { user, refreshProfile } = useUser();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatar || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
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
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Avatar (URL)</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] outline-none focus:border-[var(--brand-pink)]"
            />
            {avatarUrl && (
              <div className="mt-2 w-16 h-16 rounded-full overflow-hidden bg-[var(--background-secondary)] border border-[var(--border-color)]">
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
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
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@usuario"
              className="w-full px-4 py-3 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] outline-none focus:border-[var(--brand-pink)]"
            />
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
          <Button onClick={handleSave} disabled={saving} className="w-full rounded-full py-3">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
