'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Check, AlertCircle, Loader2, Ruler, Eye, Palette } from 'lucide-react';
import { useUser } from '@/store/userStore';

interface AvatarCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalibrationComplete?: () => void;
}

export const BODY_TYPES_BY_GENDER: Record<string, { id: string; label: string; desc: string }[]> = {
  woman: [
    { id: 'reloj_de_arena', label: 'Reloj de arena', desc: 'Hombros y caderas equilibrados con cintura definida' },
    { id: 'caderas_anchas', label: 'Caderas más anchas', desc: 'Caderas marcadas y hombros más estrechos (Pera)' },
    { id: 'atletica', label: 'Atlética / Definida', desc: 'Complexión tonificada y hombros estructurados' },
    { id: 'esbelta', label: 'Esbelta / Recta', desc: 'Silueta alargada con proporciones lineales' },
    { id: 'curvy', label: 'Curvy / Redondeada', desc: 'Curvas suaves y volumen central equilibrado' },
  ],
  man: [
    { id: 'atletico', label: 'Atlético / En V', desc: 'Espalda y hombros más anchos que la cintura' },
    { id: 'abombado', label: 'Más abombado / Robusto', desc: 'Complexión fuerte o volumen en la zona media' },
    { id: 'delgado', label: 'Delgado / Esbelto', desc: 'Complexión ligera y silueta alargada' },
    { id: 'espalda_ancha', label: 'Espalda ancha / Trapezoidal', desc: 'Estructura superior amplia y proporcionada' },
    { id: 'recto', label: 'Recto / Equilibrado', desc: 'Hombros, torso y caderas alineados' },
  ],
  other: [
    { id: 'recto', label: 'Recto / Equilibrado', desc: 'Proporciones lineales entre hombros y cadera' },
    { id: 'atletico', label: 'Atlético / Definido', desc: 'Estructura tonificada con hombros marcados' },
    { id: 'caderas_anchas', label: 'Caderas más anchas', desc: 'Mayor volumen en la parte inferior' },
    { id: 'abombado', label: 'Más abombado / Curvy', desc: 'Líneas redondeadas o estructura amplia' },
    { id: 'esbelto', label: 'Delgado / Esbelto', desc: 'Silueta ligera y estilizada' },
  ],
};

export const EYE_COLOR_OPTIONS = [
  { id: 'marron_oscuro', label: 'Marrón oscuro', swatch: '#3B2314' },
  { id: 'marron_claro', label: 'Avellana / Miel', swatch: '#8B5A2B' },
  { id: 'verde', label: 'Verde', swatch: '#4E7A51' },
  { id: 'azul', label: 'Azul', swatch: '#4A7C9B' },
  { id: 'gris', label: 'Gris', swatch: '#7A868E' },
  { id: 'negro', label: 'Negro', swatch: '#1A1A1A' },
];

export const HAIR_COLOR_OPTIONS = [
  { id: 'negro', label: 'Negro', swatch: '#18181B' },
  { id: 'castano_oscuro', label: 'Castaño oscuro', swatch: '#3F271D' },
  { id: 'castano_claro', label: 'Castaño claro', swatch: '#7C5238' },
  { id: 'rubio', label: 'Rubio', swatch: '#D8B26E' },
  { id: 'pelirrojo', label: 'Pelirrojo / Cobrizo', swatch: '#A5432A' },
  { id: 'gris_platino', label: 'Gris / Platino', swatch: '#C4C7CE' },
  { id: 'otro', label: 'Otro / Fantasía', swatch: '#FF66C4' },
];

export default function AvatarCalibrationModal({
  isOpen,
  onClose,
  onCalibrationComplete,
}: AvatarCalibrationModalProps) {
  const { user, setUser, refreshProfile } = useUser();

  const [gender, setGender] = useState<'woman' | 'man' | 'other'>('woman');
  const [height, setHeight] = useState<number>(170);
  const [bodyType, setBodyType] = useState<string>('reloj_de_arena');
  const [eyeColor, setEyeColor] = useState<string>('marron_oscuro');
  const [hairColor, setHairColor] = useState<string>('castano_oscuro');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cacheKey = user?.id ? `wardrobe_physical_profile_${user.id}` : null;

  useEffect(() => {
    if (!isOpen) return;

    // 1. Hydrate from userStore first
    const initialGender =
      user?.gender === 'man' || (user?.gender as any) === 'men'
        ? 'man'
        : user?.gender === 'other' || (user?.gender as any) === 'unisex'
        ? 'other'
        : 'woman';

    setGender(initialGender);
    if (user?.height) setHeight(Number(user.height));
    if (user?.bodyType || user?.morphology) setBodyType(user.bodyType || user.morphology || '');
    if (user?.eyeColor) setEyeColor(user.eyeColor);
    if (user?.hairColor) setHairColor(user.hairColor);

    // 2. Hydrate from localStorage cache if available
    if (cacheKey) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.gender) setGender(parsed.gender === 'men' ? 'man' : parsed.gender === 'women' ? 'woman' : parsed.gender);
          if (parsed.height) setHeight(Number(parsed.height));
          if (parsed.body_type) setBodyType(parsed.body_type);
          if (parsed.eye_color) setEyeColor(parsed.eye_color);
          if (parsed.hair_color) setHairColor(parsed.hair_color);
        }
      } catch {}
    }

    // 3. Fetch latest from API
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/avatar-calibration');
        if (res.ok) {
          const json = await res.json();
          const p = json.physical_profile;
          if (p) {
            const normG = p.gender === 'men' ? 'man' : p.gender === 'women' ? 'woman' : (p.gender || initialGender);
            setGender(normG);
            if (p.height) setHeight(Number(p.height));
            if (p.body_type) setBodyType(p.body_type);
            if (p.eye_color) setEyeColor(p.eye_color);
            if (p.hair_color) setHairColor(p.hair_color);
          }
        }
      } catch {}
    };
    fetchProfile();
  }, [isOpen, user?.id, cacheKey]);

  const currentBodyOptions = BODY_TYPES_BY_GENDER[gender] || BODY_TYPES_BY_GENDER.woman;

  // Ensure valid bodyType when switching gender
  useEffect(() => {
    const validIds = currentBodyOptions.map((o) => o.id);
    if (!validIds.includes(bodyType)) {
      setBodyType(currentBodyOptions[0].id);
    }
  }, [gender]);

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        gender,
        height,
        body_type: bodyType,
        eye_color: eyeColor,
        hair_color: hairColor,
      };

      if (cacheKey) {
        localStorage.setItem(cacheKey, JSON.stringify(payload));
      }

      const res = await fetch('/api/user/avatar-calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo guardar tu perfil físico');
      }

      setUser((prev) =>
        prev
          ? {
              ...prev,
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

      setSuccessMsg('Perfil físico actualizado');
      if (onCalibrationComplete) {
        onCalibrationComplete();
      }
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar tu perfil');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--background)] rounded-[2rem] shadow-2xl border border-[var(--border-color)] p-6 z-10 no-scrollbar"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-semibold mb-2.5">
              <User className="w-3.5 h-3.5" />
              <span>Perfil Físico para Kloe</span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Dinos cómo eres
            </h2>
            <p className="text-xs text-[var(--foreground-secondary)] mt-1 leading-relaxed">
              Sin fotos faciales ni biometría. Kloe usa estos datos para acertar con los cortes, tiros, proporciones y colores que mejor te sientan.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* 1. Chica / Chico / Unisex */}
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground-secondary)] mb-2">
                1. ¿Cómo te defines?
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
                      className={`py-3 px-4 rounded-2xl text-sm font-semibold transition-all cursor-pointer border ${
                        active
                          ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-sm'
                          : 'bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)] hover:border-[var(--foreground-tertiary)]'
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Altura (cm) */}
            <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--foreground-secondary)] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                  2. Tu altura
                </span>
                <span className="text-xl font-bold text-[var(--foreground)] font-display">
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
              <div className="flex justify-between text-[11px] text-[var(--foreground-tertiary)] mt-1">
                <span>145 cm</span>
                <span>175 cm</span>
                <span>210 cm</span>
              </div>
            </div>

            {/* 3. Tipo de cuerpo */}
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground-secondary)] mb-2">
                3. Tipo de cuerpo y proporciones
              </label>
              <div className="space-y-2">
                {currentBodyOptions.map((opt) => {
                  const active = bodyType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBodyType(opt.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        active
                          ? 'bg-[var(--brand-pink)]/10 border-[var(--brand-pink)] text-[var(--foreground)]'
                          : 'bg-[var(--background-secondary)] border-[var(--border-color)] text-[var(--foreground)] hover:border-[var(--foreground-tertiary)]'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold">{opt.label}</div>
                        <div className="text-xs text-[var(--foreground-secondary)] mt-0.5">{opt.desc}</div>
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

            {/* 4. Color de ojos */}
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground-secondary)] mb-2 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                4. Color de ojos
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
                          ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-sm'
                          : 'bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)] hover:border-[var(--foreground-tertiary)]'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: eye.swatch }}
                      />
                      <span>{eye.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Color de pelo */}
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground-secondary)] mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                5. Color de pelo
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
                          ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-sm'
                          : 'bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)] hover:border-[var(--foreground-tertiary)]'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: hair.swatch }}
                      />
                      <span>{hair.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex gap-3 mt-7">
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 px-5 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex-1 py-3.5 rounded-full bg-[var(--brand-pink)] text-white font-bold text-sm hover:opacity-95 transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Guardar cómo soy</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
