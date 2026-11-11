'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, MapPin, Smartphone, Sun, Moon, Crown, Check, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import IosWidgetPreview from '@/components/IosWidgetPreview';
import KloeMascot from '@/components/KloeMascot';
import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { haptics } from '@/lib/haptic';

const WEATHER_CACHE_KEY = 'klozet_calendar_weather';

export default function WidgetsPage() {
  const router = useRouter();
  const { user, isPremium } = useUser();
  const { openPremiumModal } = useUiStore();

  const [city, setCity] = useState('Madrid');
  const [cityInput, setCityInput] = useState('Madrid');
  const [temp, setTemp] = useState<number | null>(21);
  const [realOutfit, setRealOutfit] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [previewState, setPreviewState] = useState<'live' | 'empty'>('live');
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');

  const loadWidgetSnapshot = useCallback(async (requestedCity?: string) => {
    setLoading(true);
    try {
      let targetCity = requestedCity?.trim() || '';
      if (!targetCity && typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(WEATHER_CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed?.city) targetCity = parsed.city;
          }
        } catch {}
      }

      const d = new Date();
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const qs = new URLSearchParams({ date: localDate });
      if (targetCity) qs.set('city', targetCity);

      const res = await fetch(`/api/widgets/today?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.city) {
          setCity(data.city);
          setCityInput(data.city);
        }
        if (typeof data.temp === 'number') {
          setTemp(data.temp);
        }
        setRealOutfit(data.outfit || null);
      }
    } catch (err) {
      console.warn('[WidgetsPage] Snapshot error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWidgetSnapshot();
  }, [loadWidgetSnapshot, user?.id]);

  const effectiveOutfit = previewState === 'empty' ? null : realOutfit;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-28">
      {/* Apple Glass Header */}
      <header className="sticky top-0 z-30 apple-glass-bar border-b border-[var(--border-color)]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="touch-target-44 flex items-center justify-center -ml-2 text-[var(--foreground)] hover:text-[var(--brand-pink)] transition-colors cursor-pointer"
            aria-label="Volver"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-base font-bold text-[var(--foreground)] tracking-tight">
            Widgets de iOS
          </span>
          <button
            type="button"
            onClick={() => loadWidgetSnapshot(city)}
            className="touch-target-44 flex items-center justify-center -mr-2 text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] transition-colors cursor-pointer"
            aria-label="Actualizar widget"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[var(--brand-pink)]' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Top Intro Card */}
        <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <KloeMascot mood="happy" size="md" variant="pink" interactive />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                  Tu Armario en la Pantalla de Inicio
                </h1>
              </div>
              <p className="text-xs text-[var(--foreground-secondary)] mt-0.5 leading-relaxed">
                Tu outfit de hoy con temperatura y ciudad en formato cuadrado o alargado para iPhone y iPad.
              </p>
            </div>
          </div>

          {!isPremium() ? (
            <button
              type="button"
              onClick={() => {
                try { haptics.tap(); } catch {}
                openPremiumModal('yearly');
              }}
              className="shrink-0 h-11 px-5 rounded-full bg-[var(--brand-pink)] text-white text-xs font-bold shadow-md shadow-[var(--brand-pink)]/30 hover:opacity-95 active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Desbloquear Widgets</span>
            </button>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[var(--brand-pink)]/12 text-[var(--brand-pink)] text-xs font-bold">
              <Check className="w-3.5 h-3.5 stroke-[2.6]" />
              <span>Klozet Pro activo</span>
            </span>
          )}
        </div>

        {/* Controls Bar: City + State + Theme */}
        <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (cityInput.trim()) loadWidgetSnapshot(cityInput);
            }}
            className="flex items-center gap-2 flex-1"
          >
            <div className="relative flex-1">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-pink)]" />
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Ciudad para el widget..."
                className="w-full pl-9 pr-3 py-2 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] focus:border-[var(--brand-pink)] text-sm text-[var(--foreground)] outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-9 px-4 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] text-xs font-semibold text-[var(--foreground)] border border-[var(--border-color)] transition-colors cursor-pointer shrink-0"
            >
              Aplicar
            </button>
          </form>

          <div className="flex items-center gap-2 justify-between sm:justify-end">
            {/* State toggle */}
            <div className="inline-flex rounded-full p-1 bg-[var(--background-secondary)] border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setPreviewState('live')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  previewState === 'live'
                    ? 'bg-[var(--brand-pink)] text-white shadow-xs'
                    : 'text-[var(--foreground-secondary)]'
                }`}
              >
                {realOutfit ? 'Con outfit' : 'Real'}
              </button>
              <button
                type="button"
                onClick={() => setPreviewState('empty')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  previewState === 'empty'
                    ? 'bg-[var(--brand-pink)] text-white shadow-xs'
                    : 'text-[var(--foreground-secondary)]'
                }`}
              >
                Sin outfit
              </button>
            </div>

            {/* Light/Dark widget preview toggle */}
            <div className="inline-flex rounded-full p-1 bg-[var(--background-secondary)] border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setAppearance('light')}
                aria-label="Modo claro"
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  appearance === 'light'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-[var(--foreground-tertiary)]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAppearance('dark')}
                aria-label="Modo oscuro"
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  appearance === 'dark'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-[var(--foreground-tertiary)]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Widget Formats Showcase: Square (2x2) + Wide / Alargado (4x2) */}
        <div
          className={`rounded-[32px] border border-[var(--border-color)] p-6 sm:p-8 flex flex-col items-center gap-8 transition-colors ${
            appearance === 'dark'
              ? 'bg-[#0D0D10]'
              : 'bg-[#F2F2F7] dark:bg-[#141418]'
          }`}
        >
          {/* Wide / Alargado (systemMedium) */}
          <div className="w-full flex flex-col items-center gap-2.5">
            <span className="text-[11px] font-semibold text-[var(--foreground-tertiary)] uppercase tracking-wider">
              Formato Alargado (4×2)
            </span>
            <IosWidgetPreview
              size="wide"
              city={city}
              temp={temp}
              outfit={effectiveOutfit}
              appearance={appearance}
            />
          </div>

          {/* Square (systemSmall) */}
          <div className="w-full flex flex-col items-center gap-2.5">
            <span className="text-[11px] font-semibold text-[var(--foreground-tertiary)] uppercase tracking-wider">
              Formato Cuadrado (2×2)
            </span>
            <IosWidgetPreview
              size="square"
              city={city}
              temp={temp}
              outfit={effectiveOutfit}
              appearance={appearance}
            />
          </div>
        </div>

        {/* Install Guide Card */}
        <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[var(--brand-pink)]" />
            <h2 className="text-sm font-bold text-[var(--foreground)]">
              Cómo añadirlo en iPhone (App iOS)
            </h2>
          </div>
          <ol className="text-xs text-[var(--foreground-secondary)] space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Mantén pulsado un espacio vacío en la pantalla de inicio de tu iPhone.</li>
            <li>Toca el botón <strong>+</strong> arriba a la izquierda y busca <strong>Klozet</strong>.</li>
            <li>Elige tamaño <strong>Cuadrado</strong> o <strong>Alargado</strong> y pulsa <strong>Añadir widget</strong>.</li>
          </ol>
          {!realOutfit && (
            <div className="pt-1">
              <Link
                href="/closet?tab=calendar"
                className="text-xs font-bold text-[var(--brand-pink)] hover:underline"
              >
                Asignar un outfit a hoy en tu calendario →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
