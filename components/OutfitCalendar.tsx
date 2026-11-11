'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, X, Plus, Trash2, Shirt, Search, Heart, Edit2, Sun, Cloud, CloudRain, CloudSnow, MapPin, ArrowLeftRight } from 'lucide-react';
import type { DailyWeatherEntry, WeatherCondition } from '@/app/api/weather/route';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store';
import { OutfitDetailModal } from '@/components/OutfitDetailModal';
import ProductModal from '@/components/ProductModal';
import OutfitCard from '@/components/OutfitCard';
import InteractiveOutfitViewer from '@/components/InteractiveOutfitViewer';
import type { Outfit } from '@/types/outfit';
import { Button } from '@/components';
import { useUiStore } from '@/store/uiStore';
import { useTourStore } from '@/store/tourStore';

// Helper to format date as YYYY-MM-DD in exact local calendar timezone
const formatDateToSQL = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const WEATHER_CACHE_KEY = 'klozet_calendar_weather';

function WeatherIcon({
  condition,
  className = 'w-4 h-4',
  onPink = false,
}: {
  condition: WeatherCondition;
  className?: string;
  onPink?: boolean;
}) {
  switch (condition) {
    case 'snow':
      return <CloudSnow className={`${className} ${onPink ? 'text-white' : 'text-sky-400'}`} />;
    case 'rain':
      return <CloudRain className={`${className} ${onPink ? 'text-white' : 'text-blue-500'}`} />;
    case 'cloudy':
      return <Cloud className={`${className} ${onPink ? 'text-white/95' : 'text-zinc-400'}`} />;
    case 'sunny':
    default:
      return <Sun className={`${className} ${onPink ? 'text-white' : 'text-amber-500'}`} />;
  }
}

export default function OutfitCalendar() {
  const { user } = useUser();
  const { showModal, setTabBarHidden } = useUiStore();
  const [outfitSearchQuery, setOutfitSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  // Weather & city state
  const [weatherCity, setWeatherCity] = useState('');
  const [weatherDays, setWeatherDays] = useState<Record<string, DailyWeatherEntry>>({});
  const [showCityModal, setShowCityModal] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  
  // Modals state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const dayDragControls = useDragControls();
  const pickerDragControls = useDragControls();
  
  // Details Modals state
  const [selectedOutfitDetail, setSelectedOutfitDetail] = useState<Outfit | null>(null);
  const [selectedItemDetail, setSelectedItemDetail] = useState<any | null>(null);
  
  // Data for picker
  const [userOutfits, setUserOutfits] = useState<Outfit[]>([]);
  const [outfitsLoading, setOutfitsLoading] = useState(false);
  const [outfitToSwap, setOutfitToSwap] = useState<string | null>(null);

  // Derive calendar grid
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const fetchCalendarData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data, error } = await (supabase as any)
        .from('calendar_outfits')
        .select(`
          id,
          date,
          outfits (
            id,
            name,
            image_url,
            favorite,
            occasion,
            season,
            outfit_items (
              position_x,
              position_y,
              scale,
              rotation,
              layer_order,
              clothing_item:clothing_items (*)
            )
          )
        `)
        .eq('user_id', user.id)
        .gte('date', formatDateToSQL(startOfMonth))
        .lte('date', formatDateToSQL(endOfMonth));

      if (error) throw error;

      // Group by date
      const grouped: Record<string, any[]> = {};
      data?.forEach((item: any) => {
        const d = item.date; // YYYY-MM-DD
        const o = item.outfits;
        if (!o) return;
        if (!grouped[d]) grouped[d] = [];
        const mappedItems = (o.outfit_items || [])
          .filter((oi: any) => oi.clothing_item)
          .map((oi: any) => ({
            ...oi.clothing_item,
            clothing_item: oi.clothing_item,
            clothing_items: oi.clothing_item,
            position_x: oi.position_x,
            position_y: oi.position_y,
            scale: oi.scale,
            rotation: oi.rotation,
            layer_order: oi.layer_order,
          }));
        grouped[d].push({
          calendar_id: item.id,
          ...o,
          items: mappedItems,
          outfit_items: mappedItems,
        });
      });
      setCalendarData(grouped);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, currentDate]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const loadUserOutfits = useCallback(async () => {
    if (!user || userOutfits.length > 0) return;
    setOutfitsLoading(true);
    try {
      const { data, error } = await supabase
        .from('outfits')
        .select(`
          *,
          outfit_items (
            position_x,
            position_y,
            scale,
            rotation,
            layer_order,
            clothing_item:clothing_items (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = (data || []).map((o: any) => {
        const mappedItems = (o.outfit_items || [])
          .filter((oi: any) => oi.clothing_item)
          .map((oi: any) => ({
            ...oi.clothing_item,
            clothing_item: oi.clothing_item,
            clothing_items: oi.clothing_item,
            position_x: oi.position_x,
            position_y: oi.position_y,
            scale: oi.scale,
            rotation: oi.rotation,
            layer_order: oi.layer_order,
          }));
        return {
          ...o,
          createdAt: new Date(o.created_at),
          items: mappedItems,
          outfit_items: mappedItems,
        };
      });
      setUserOutfits(formatted);
    } catch (err) {
      console.error('Error loading outfits for picker:', err);
    } finally {
      setOutfitsLoading(false);
    }
  }, [user, userOutfits.length]);

  const handleAddToday = useCallback(() => {
    setSelectedDate(new Date());
    loadUserOutfits();
    setShowPicker(true);
  }, [loadUserOutfits]);

  useEffect(() => {
    const onAddToday = () => {
      handleAddToday();
    };
    window.addEventListener('klozet:calendar_add_today', onAddToday);
    return () => {
      window.removeEventListener('klozet:calendar_add_today', onAddToday);
    };
  }, [handleAddToday]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const filteredPickerOutfits = useMemo(() => {
    let filtered = userOutfits;
    if (showFavoritesOnly) {
        filtered = filtered.filter(o => o.favorite);
    }
    if (outfitSearchQuery.trim()) {
        const q = outfitSearchQuery.toLowerCase();
        filtered = filtered.filter(o => o.name?.toLowerCase().includes(q));
    }
    return filtered;
  }, [userOutfits, outfitSearchQuery, showFavoritesOnly]);

  const toggleOutfitFavorite = async (outfit: Outfit, currentFav: boolean) => {
    const newFav = !currentFav;
    setUserOutfits(prev => prev.map(o => o.id === outfit.id ? { ...o, favorite: newFav } : o));
    
    try {
        const { error } = await (supabase as any)
            .from('outfits')
            .update({ favorite: newFav })
            .eq('id', outfit.id);
            
        if (error) throw error;
    } catch (err) {
        console.error('Error toggling favorite:', err);
        // Revert on error
        setUserOutfits(prev => prev.map(o => o.id === outfit.id ? { ...o, favorite: currentFav } : o));
    }
  };

  const fetchWeatherUrl = useCallback(async (url: string, fallbackLabel?: string) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data?.days || Object.keys(data.days).length === 0) {
        if (fallbackLabel !== undefined) {
          setWeatherError(data?.error || 'No encontramos esa ciudad.');
        }
        return false;
      }
      const resolvedCity = data.city || fallbackLabel || 'Madrid';
      const resolvedDays = data.days || {};
      setWeatherCity(resolvedCity);
      setWeatherDays(resolvedDays);
      try {
        localStorage.setItem(
          WEATHER_CACHE_KEY,
          JSON.stringify({ city: resolvedCity, days: resolvedDays, updatedAt: Date.now() })
        );
      } catch {}
      return true;
    } catch {
      if (fallbackLabel !== undefined) {
        setWeatherError('Error de conexión al consultar el tiempo.');
      }
      return false;
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const fetchWeather = useCallback(async (cityName: string) => {
    const clean = cityName.trim();
    if (!clean) return false;
    return fetchWeatherUrl(`/api/weather?city=${encodeURIComponent(clean)}`, clean);
  }, [fetchWeatherUrl]);

  const fetchWeatherByLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setWeatherError('Tu navegador no permite detectar la ubicación.');
      return;
    }
    setWeatherLoading(true);
    setWeatherError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const ok = await fetchWeatherUrl(`/api/weather?lat=${latitude}&lon=${longitude}`, 'Tu ubicación');
        if (ok) setShowCityModal(false);
      },
      () => {
        setWeatherLoading(false);
        setWeatherError('Permiso de ubicación denegado. Escribe tu ciudad manualmente.');
      },
      { timeout: 8000 }
    );
  }, [fetchWeatherUrl]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const todayKey = formatDateToSQL(new Date());
    try {
      const raw = localStorage.getItem(WEATHER_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.city) {
          setWeatherCity(parsed.city);
          if (parsed.days && Object.keys(parsed.days).length > 0) {
            setWeatherDays(parsed.days);
          }
          const age = Date.now() - (parsed.updatedAt || 0);
          const hasToday = Boolean(parsed.days && parsed.days[todayKey]);
          if (!hasToday || age > 30 * 60 * 1000) {
            fetchWeather(parsed.city);
          }
          return;
        }
      }
    } catch {}
    // First visit with no saved city: auto-load city forecast (Vercel IP city or Madrid fallback)
    fetchWeatherUrl('/api/weather?auto=1');
  }, [fetchWeather, fetchWeatherUrl]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      const hasModalOpen = !!selectedOutfitDetail || !!selectedItemDetail || showPicker || !!selectedDate || showCityModal;
      setTabBarHidden(hasModalOpen);
    }
    return () => {
      setTabBarHidden(false);
    };
  }, [selectedOutfitDetail, selectedItemDetail, showPicker, selectedDate, showCityModal, setTabBarHidden]);

  const handleAssignOutfit = async (outfitId: string) => {
    if (!user || !selectedDate) return;
    const dateStr = formatDateToSQL(selectedDate);
    
    try {
      // Check if already assigned on this date
      const alreadyAssigned = (calendarData[dateStr] || []).some(
        (item: any) => item.id === outfitId || item.calendar_id === outfitId
      );

      if (outfitToSwap) {
        // Swap flow
        if (alreadyAssigned) {
          // If the target outfit is already in this date, simply remove the old one being swapped
          await (supabase as any)
            .from('calendar_outfits')
            .delete()
            .eq('id', outfitToSwap);
        } else {
          const { error } = await (supabase as any)
            .from('calendar_outfits')
            .update({ outfit_id: outfitId })
            .eq('id', outfitToSwap);
          
          if (error && error.code !== '23505') throw error;
        }
        setOutfitToSwap(null);
      } else {
        if (alreadyAssigned) {
          setShowPicker(false);
          return;
        }

        // Upsert flow with ignoreDuplicates to avoid HTTP 409 Conflict
        const { error } = await (supabase as any)
          .from('calendar_outfits')
          .upsert(
            {
              user_id: user.id,
              outfit_id: outfitId,
              date: dateStr
            },
            {
              onConflict: 'user_id,date,outfit_id',
              ignoreDuplicates: true
            }
          );
          
        if (error && error.code !== '23505') {
          throw error;
        }
      }
      
      // Guided tour real-time trigger
      try {
        useTourStore.getState().markStepComplete('schedule_outfit', '¡Has planificado tu outfit en el calendario!', true);
      } catch (tourErr) {
        console.warn('[OutfitCalendar] Error updating tour step:', tourErr);
      }

      // Refresh
      fetchCalendarData();
      setShowPicker(false);
    } catch (err) {
      console.error('Error assigning outfit:', err);
      // Use toast or SystemModal instead of native alert
      showModal({
        title: 'Error',
        message: 'No se pudo asignar el outfit.',
        type: 'error',
      });
    }
  };

  const handleRemoveAssignment = async (calendarId: string) => {
    try {
      const { error } = await (supabase as any).from('calendar_outfits').delete().eq('id', calendarId);
      if (error) throw error;
      fetchCalendarData();
    } catch (err) {
      console.error('Error removing assignment:', err);
      showModal({
        title: 'Error',
        message: 'No se pudo quitar el outfit.',
        type: 'error',
      });
    }
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const getDayOutfits = (date: Date) => {
    const dateStr = formatDateToSQL(date);
    return calendarData[dateStr] || [];
  };

  // Day Modal Content
  const todayStr = formatDateToSQL(new Date());
  const todayWeather = weatherDays[todayStr];
  const selectedDateStr = selectedDate ? formatDateToSQL(selectedDate) : '';
  const selectedDayOutfits = selectedDate ? getDayOutfits(selectedDate) : [];
  const selectedDayWeather = selectedDateStr ? weatherDays[selectedDateStr] : undefined;

  const todayOutfits = getDayOutfits(new Date());

  const renderAssignedOutfitCard = (outfit: any, singleInModal = false) => (
    <div
      key={`${singleInModal ? 'modal' : 'cal'}-${outfit.calendar_id}`}
      onClick={() => setSelectedOutfitDetail(outfit)}
      className={`group relative overflow-hidden rounded-[20px] kz-surface-card hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 select-none cursor-pointer ${
        singleInModal ? 'w-full max-w-[320px] mx-auto' : 'w-full'
      }`}
    >
      <div className="relative w-full aspect-[4/5] bg-white overflow-hidden">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOutfitToSwap(outfit.calendar_id);
              loadUserOutfits();
              setShowPicker(true);
            }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-black/[0.06] text-zinc-700 hover:text-[var(--brand-pink)] flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            title="Cambiar outfit"
            aria-label="Cambiar outfit"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveAssignment(outfit.calendar_id);
            }}
            className="w-8 h-8 rounded-full bg-red-50/95 backdrop-blur-sm border border-red-200/70 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            title="Quitar de este día"
            aria-label="Quitar de este día"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <InteractiveOutfitViewer
          outfit={outfit}
          disableInteraction={true}
          className="w-full h-full"
        />

        {/* Hover-only black outfit name directly over clean canvas (matches Outfits tab) */}
        <div className="absolute inset-x-0 bottom-2.5 px-3 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center">
          <p
            data-no-translate={outfit.name ? 'true' : undefined}
            className="text-xs font-semibold text-zinc-900 truncate [text-shadow:0_1px_3px_rgba(255,255,255,0.95)]"
          >
            {outfit.name || 'Look sin título'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col pt-2 pb-12">
      <div className="px-4 max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Today's Outfit Highlight */}
        <AnimatePresence mode="popLayout">
          {todayOutfits.length > 0 && (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9, width: '100%' }}
              animate={{ opacity: 1, scale: 1, width: '100%' }}
              exit={{ opacity: 0, scale: 0.9, width: 0 }}
              className="lg:w-1/3 lg:max-w-sm shrink-0 w-full mb-8 lg:mb-0"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[var(--foreground)] text-xl flex items-center gap-2">
                  <Shirt className="w-6 h-6 text-[var(--brand-pink)]" />
                  Outfit de Hoy
                </h3>
                <Button onClick={() => setSelectedDate(new Date())} variant="outline" size="sm" className="rounded-full border-[var(--brand-pink)] text-[var(--brand-pink)] hover:bg-[var(--brand-pink)] hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4 mr-1" />
                  Modificar
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {todayOutfits.map((outfit) => renderAssignedOutfitCard(outfit))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar Section */}
        <motion.div layout className="flex-1 w-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 bg-[var(--card-bg)] p-4 rounded-3xl shadow-sm border border-[var(--border-color)]">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground)] transition-colors cursor-pointer">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-[var(--foreground)] capitalize flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[var(--brand-pink)]" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground)] transition-colors cursor-pointer">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* City Weather Trigger below Month */}
          <div className="flex items-center justify-center mb-4">
            <button
              type="button"
              onClick={() => {
                setCityInput(weatherCity);
                setWeatherError(null);
                setShowCityModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--brand-pink)]/45 text-xs font-semibold text-[var(--foreground)] shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-[var(--brand-pink)] shrink-0" />
              {weatherCity ? (
                <>
                  <span>{weatherCity}</span>
                  {todayWeather && (
                    <>
                      <span className="text-[var(--foreground-tertiary)]">·</span>
                      <WeatherIcon condition={todayWeather.condition} className="w-3.5 h-3.5" />
                      <span className="tabular-nums">{todayWeather.temp}°</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-[var(--foreground-secondary)]">Añadir ciudad</span>
              )}
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-[var(--card-bg)] rounded-3xl p-4 sm:p-6 shadow-sm border border-[var(--border-color)]">
          {/* Days Header */}
          <div className="grid grid-cols-7 mb-4">
            {dayNames.map((day, i) => (
              <div key={i} className="text-center text-xs sm:text-sm font-semibold text-[var(--foreground-tertiary)] uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty Offset Days */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[66px] sm:aspect-[4/3] rounded-xl opacity-0" />
            ))}
            
            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
              const dayDateStr = formatDateToSQL(dayDate);
              const isToday = dayDateStr === todayStr;
              const dayOutfits = getDayOutfits(dayDate);
              const hasOutfits = dayOutfits.length > 0;
              const dayWeather = weatherDays[dayDateStr];
              
              return (
                <button
                  key={`day-${i}`}
                  onClick={() => setSelectedDate(dayDate)}
                  className={`relative min-h-[66px] sm:aspect-[4/3] rounded-xl sm:rounded-2xl flex flex-col items-center justify-start gap-0.5 sm:gap-1 py-1.5 px-1 sm:p-2 transition-all cursor-pointer ${
                    isToday 
                      ? 'bg-[var(--brand-pink)] text-white shadow-lg' 
                      : 'hover:bg-[var(--background-secondary)] text-[var(--foreground)]'
                  } ${hasOutfits && !isToday ? 'border-2 border-[var(--brand-pink)]/30' : 'border border-transparent'}`}
                >
                  <span className={`text-sm sm:text-base font-medium leading-none ${isToday ? 'font-bold' : ''}`}>
                    {i + 1}
                  </span>

                  {/* Weather Icon + Temperature below number */}
                  {dayWeather && (
                    <div className="flex items-center justify-center gap-0.5 leading-none mt-0.5">
                      <WeatherIcon
                        condition={dayWeather.condition}
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
                        onPink={isToday}
                      />
                      <span className={`text-[10px] sm:text-[11px] font-medium tabular-nums ${isToday ? 'text-white/95' : 'text-[var(--foreground-secondary)]'}`}>
                        {dayWeather.temp}°
                      </span>
                    </div>
                  )}
                  
                  {/* Outfit Indicator */}
                  {hasOutfits && (
                    <div className="relative flex items-center justify-center mt-0.5">
                      <div className={`rounded-full shadow-sm p-1 sm:p-1.5 z-10 ${isToday ? 'bg-white text-[var(--brand-pink)]' : 'bg-[var(--brand-pink)] text-white'}`}>
                         <Shirt className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${isToday ? 'fill-current' : ''}`} />
                      </div>
                      {dayOutfits.length > 1 && (
                        <div className={`absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[11px] font-bold z-20 shadow-sm border border-white dark:border-[#111] ${isToday ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-[var(--foreground)] text-[var(--background)]'}`}>
                          {dayOutfits.length}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {/* Mobile Button below Calendar */}
          <div className="mt-4 sm:hidden">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedDate(new Date());
                loadUserOutfits();
                setShowPicker(true);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-[var(--brand-pink)] text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-pink)]/35 hover:shadow-[0_0_22px_rgba(255,102,196,0.5)] active:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              Añadir outfit para hoy
            </motion.button>
          </div>
        </div>
        </motion.div>
      </div>


      {/* Day Details Modal */}
      <AnimatePresence>
        {selectedDate && !showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              drag="y"
              dragControls={dayDragControls}
              dragListener={false}
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.45 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 90 || info.velocity.y > 420) {
                  setSelectedDate(null);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-[var(--background)] w-full ${selectedDayOutfits.length > 1 ? 'max-w-xl md:max-w-2xl' : 'max-w-md'} rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden`}
            >
              {/* Drag Zone: Top Edge Handle + Header */}
              <div
                onPointerDown={(e) => dayDragControls.start(e)}
                className="touch-none cursor-grab active:cursor-grabbing sticky top-0 bg-[var(--background)] z-10 border-b border-[var(--border-color)]"
              >
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full" />
                </div>

                <div className="px-6 py-3.5 sm:py-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[var(--foreground)] capitalize">
                    {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setSelectedDate(null)}
                    aria-label="Cerrar"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {selectedDayOutfits.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarDays className="w-8 h-8 text-[var(--foreground-tertiary)]" />
                    </div>
                    <p className="text-[var(--foreground-secondary)]">No hay outfits planeados para este día.</p>
                  </div>
                ) : (
                  <div className={`grid ${selectedDayOutfits.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                    {selectedDayOutfits.map((outfit) => renderAssignedOutfitCard(outfit, selectedDayOutfits.length === 1))}
                  </div>
                )}

                {/* Weather Forecast + City below */}
                <div className="mt-5 pt-4 border-t border-[var(--border-color)]/60 flex flex-col items-center justify-center text-center gap-1">
                  {selectedDayWeather ? (
                    <>
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                        <WeatherIcon condition={selectedDayWeather.condition} className="w-4 h-4" />
                        <span className="tabular-nums">{selectedDayWeather.temp}°</span>
                        <span className="text-[var(--foreground-secondary)] font-normal">· {selectedDayWeather.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCityInput(weatherCity);
                          setWeatherError(null);
                          setShowCityModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-[var(--foreground-tertiary)] hover:text-[var(--brand-pink)] transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{weatherCity}</span>
                      </button>
                    </>
                  ) : weatherCity ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCityInput(weatherCity);
                        setWeatherError(null);
                        setShowCityModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground-tertiary)] hover:text-[var(--brand-pink)] transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{weatherCity} · Previsión no disponible para esta fecha</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCityInput('');
                        setWeatherError(null);
                        setShowCityModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                      <span>Añadir ciudad para ver el tiempo</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-[var(--border-color)] bg-[var(--background)]">
                <Button 
                  onClick={() => {
                    loadUserOutfits();
                    setShowPicker(true);
                  }} 
                  className="w-full py-4 text-lg rounded-2xl flex items-center justify-center gap-2 shadow-[var(--brand-pink)]/35 hover:shadow-[0_0_22px_rgba(255,102,196,0.5)]"
                >
                  {selectedDayOutfits.length > 0 ? (
                    <>
                      <Plus className="w-5 h-5" />
                      Añadir otro Outfit
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Asignar un Outfit
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outfit Picker Modal - Taller + Drag-down from top edge */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => { setShowPicker(false); setOutfitToSwap(null); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              drag="y"
              dragControls={pickerDragControls}
              dragListener={false}
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.45 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 90 || info.velocity.y > 420) {
                  setShowPicker(false);
                  setOutfitToSwap(null);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--background)] w-full max-w-lg md:max-w-4xl rounded-t-3xl sm:rounded-3xl h-[88dvh] sm:h-[84vh] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Drag Zone: Top Edge Handle + Picker Header */}
              <div
                onPointerDown={(e) => pickerDragControls.start(e)}
                className="touch-none cursor-grab active:cursor-grabbing bg-[var(--background)]/95 backdrop-blur-md sticky top-0 z-10 border-b border-[var(--border-color)]"
              >
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full" />
                </div>

                <div className="px-6 py-3.5 sm:py-4 flex items-center gap-4">
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => { setShowPicker(false); setOutfitToSwap(null); }}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--background-secondary)] text-[var(--foreground)] transition-colors cursor-pointer"
                    aria-label="Volver"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--foreground)]">{outfitToSwap ? 'Cambiar Outfit' : 'Selecciona un Outfit'}</h3>
                    <p className="text-sm text-[var(--foreground-secondary)]">Para el {selectedDate?.toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-6 flex items-center gap-3 relative">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                  <input
                    type="text"
                    placeholder="Buscar outfit..."
                    value={outfitSearchQuery}
                    onChange={(e) => setOutfitSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[var(--background-secondary)] rounded-2xl text-[var(--foreground)] outline-none border border-transparent focus:border-[var(--border-color)] transition-all placeholder-[var(--foreground-tertiary)] font-medium"
                  />
                </div>
                <button 
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`p-3 rounded-2xl flex-shrink-0 transition-colors border ${showFavoritesOnly ? 'bg-[var(--brand-pink)]/10 border-[var(--brand-pink)]/30' : 'bg-[var(--background-secondary)] border-transparent'}`}
                >
                    <Heart className={`w-5 h-5 transition-colors ${showFavoritesOnly ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'text-[var(--foreground-secondary)]'}`} />
                </button>
              </div>

              {outfitsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-pink)]"></div>
                </div>
              ) : userOutfits.length === 0 ? (
                <div className="text-center py-12 px-4">
                    <p className="text-[var(--foreground-secondary)] text-lg mb-4">Aún no tienes outfits guardados.</p>
                    <p className="text-[var(--foreground-tertiary)] mb-6">Crea uno en la pestaña de Outfits primero.</p>
                </div>
              ) : filteredPickerOutfits.length === 0 ? (
                <div className="text-center py-12 px-4">
                    <p className="text-[var(--foreground-secondary)] text-lg mb-4">No se encontraron outfits.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredPickerOutfits.map(outfit => (
                    <OutfitCard
                      key={outfit.id}
                      outfit={outfit}
                      index={0}
                      onClick={() => handleAssignOutfit(outfit.id)}
                      onEdit={() => {}}
                      onShare={() => {}}
                      onDelete={() => {}}
                      onToggleFavorite={toggleOutfitFavorite}
                    />
                  ))}
                </div>
              )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small City Weather Modal */}
      <AnimatePresence>
        {showCityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6060] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCityModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[var(--background)] border border-[var(--border-color)] rounded-3xl p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--brand-pink)]" />
                  <h3 className="text-base font-bold text-[var(--foreground)]">Tu ciudad</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCityModal(false)}
                  aria-label="Cerrar"
                  className="w-8 h-8 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!cityInput.trim() || weatherLoading) return;
                  const ok = await fetchWeather(cityInput);
                  if (ok) setShowCityModal(false);
                }}
                className="space-y-3"
              >
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => {
                      setCityInput(e.target.value);
                      if (weatherError) setWeatherError(null);
                    }}
                    placeholder="Ej. Madrid, Barcelona, París..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] focus:border-[var(--brand-pink)] text-base sm:text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] outline-none transition-colors"
                  />
                </div>

                {weatherError && (
                  <p className="text-xs text-red-500 font-medium px-1">{weatherError}</p>
                )}

                <button
                  type="submit"
                  disabled={!cityInput.trim() || weatherLoading}
                  className="w-full py-2.5 rounded-full bg-[var(--brand-pink)] text-white text-sm font-bold shadow-md shadow-[var(--brand-pink)]/20 disabled:opacity-50 cursor-pointer transition-opacity flex items-center justify-center gap-2"
                >
                  {weatherLoading ? 'Consultando...' : 'Ver previsión'}
                </button>

                <button
                  type="button"
                  disabled={weatherLoading}
                  onClick={fetchWeatherByLocation}
                  className="w-full py-2 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <MapPin className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                  <span>Usar mi ubicación actual</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    {/* Modals for details */}
    {selectedOutfitDetail && (
        <OutfitDetailModal
            isOpen={!!selectedOutfitDetail}
            onClose={() => setSelectedOutfitDetail(null)}
            outfit={selectedOutfitDetail}
            onToggleFavorite={() => {}} // Could be wired up later if needed
            onDelete={() => {}} // Same
            onItemClick={(item) => setSelectedItemDetail(item)}
        />
    )}

    {selectedItemDetail && (
        <ProductModal
            isOpen={!!selectedItemDetail}
            onClose={() => setSelectedItemDetail(null)}
            item={selectedItemDetail}
            onFavoriteToggle={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
        />
    )}
    </div>
  );
}
