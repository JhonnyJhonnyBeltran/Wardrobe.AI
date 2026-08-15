'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, X, Plus, Trash2, Shirt, Search, Heart, Edit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store';
import { OutfitDetailModal } from '@/components/OutfitDetailModal';
import ProductModal from '@/components/ProductModal';
import OutfitCard from '@/components/OutfitCard';
import type { Outfit } from '@/types/outfit';
import { Button } from '@/components';
import { useUiStore } from '@/store/uiStore';

// Helper to format date as YYYY-MM-DD local time
const formatDateToSQL = (date: Date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

export default function OutfitCalendar() {
  const { user } = useUser();
  const { showModal, setTabBarHidden } = useUiStore();
  const [outfitSearchQuery, setOutfitSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  
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
            outfit_items (
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
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push({
          calendar_id: item.id,
          ...item.outfits,
          items: item.outfits.outfit_items.map((oi: any) => oi.clothing_item).filter(Boolean)
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

  const loadUserOutfits = async () => {
    if (!user || userOutfits.length > 0) return;
    setOutfitsLoading(true);
    try {
      const { data, error } = await supabase
        .from('outfits')
        .select(`
          *,
          outfit_items (
            clothing_item:clothing_items (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = (data || []).map((o: any) => ({
        ...o,
        createdAt: new Date(o.created_at),
        items: o.outfit_items.map((oi: any) => oi.clothing_item).filter(Boolean),
      }));
      setUserOutfits(formatted);
    } catch (err) {
      console.error('Error loading outfits for picker:', err);
    } finally {
      setOutfitsLoading(false);
    }
  };

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

  useEffect(() => {
    if (window.innerWidth < 768) {
      const hasModalOpen = !!selectedOutfitDetail || !!selectedItemDetail || showPicker || !!selectedDate;
      setTabBarHidden(hasModalOpen);
    }
    return () => {
      setTabBarHidden(false);
    };
  }, [selectedOutfitDetail, selectedItemDetail, showPicker, selectedDate, setTabBarHidden]);

  const handleAssignOutfit = async (outfitId: string) => {
    if (!user || !selectedDate) return;
    const dateStr = formatDateToSQL(selectedDate);
    
    try {
      if (outfitToSwap) {
        // Swap flow
        const { error } = await (supabase as any)
          .from('calendar_outfits')
          .update({ outfit_id: outfitId })
          .eq('id', outfitToSwap);
        
        if (error) throw error;
        setOutfitToSwap(null);
      } else {
        // Insert flow
        const { error } = await (supabase as any)
          .from('calendar_outfits')
          .insert({
            user_id: user.id,
            outfit_id: outfitId,
            date: dateStr
          });
          
        if (error) {
          if (error.code === '23505') {
              // Already assigned exactly this outfit
              setShowPicker(false);
              return;
          }
          throw error;
        }
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
    showModal({
      title: 'Quitar del calendario',
      message: '¿Quieres eliminar este outfit del día seleccionado?',
      type: 'confirm',
      confirmText: 'Quitar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          const { error } = await (supabase as any).from('calendar_outfits').delete().eq('id', calendarId);
          if (error) throw error;
          fetchCalendarData();
        } catch (err) {
          console.error('Error removing assignment:', err);
        }
      }
    });
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const getDayOutfits = (date: Date) => {
    const dateStr = formatDateToSQL(date);
    return calendarData[dateStr] || [];
  };

  // Day Modal Content
  const selectedDateStr = selectedDate ? formatDateToSQL(selectedDate) : '';
  const selectedDayOutfits = selectedDate ? getDayOutfits(selectedDate) : [];

  const todayOutfits = getDayOutfits(new Date());

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
                {todayOutfits.map((outfit) => (
                  <div key={`today-${outfit.calendar_id}`} className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-4 shadow-sm relative overflow-hidden flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div 
                      onClick={() => setSelectedOutfitDetail(outfit)}
                      className="cursor-pointer hover:opacity-90 transition-opacity shrink-0 flex items-center justify-center bg-[#f8f9fa] dark:bg-[#111] rounded-2xl border border-[var(--border-color)] overflow-hidden w-full aspect-[4/5] relative"
                    >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOutfitToSwap(outfit.calendar_id);
                            loadUserOutfits();
                            setShowPicker(true);
                          }}
                          className="absolute top-3 right-14 z-10 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-[var(--foreground)] rounded-full hover:bg-[var(--background-secondary)] transition-colors shadow-sm"
                          title="Cambiar outfit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAssignment(outfit.calendar_id);
                          }}
                          className="absolute top-3 right-3 z-10 p-2 bg-red-100/90 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                          title="Quitar de hoy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {outfit.image_url ? (
                          <img src={outfit.image_url} alt={outfit.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-[var(--foreground-tertiary)]">Sin foto</span>
                        )}
                    </div>
                    <div className="flex flex-col justify-center flex-1 text-center mt-2">
                      <h4 
                          className="font-bold text-[var(--foreground)] text-lg md:text-xl mb-1 cursor-pointer hover:text-[var(--brand-pink)] transition-colors"
                          onClick={() => setSelectedOutfitDetail(outfit)}
                      >
                          {outfit.name || 'Outfit sin nombre'}
                      </h4>
                      <p className="text-sm text-[var(--foreground-secondary)] mb-1">{outfit.items?.length || 0} prendas</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar Section */}
        <motion.div layout className="flex-1 w-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 bg-[var(--card-bg)] p-4 rounded-3xl shadow-sm border border-[var(--border-color)]">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground)] transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-[var(--foreground)] capitalize flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[var(--brand-pink)]" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground)] transition-colors">
              <ChevronRight className="w-6 h-6" />
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
              <div key={`empty-${i}`} className="aspect-square sm:aspect-[4/3] rounded-xl opacity-0" />
            ))}
            
            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
              const isToday = formatDateToSQL(dayDate) === formatDateToSQL(new Date());
              const dayOutfits = getDayOutfits(dayDate);
              const hasOutfits = dayOutfits.length > 0;
              
              return (
                <button
                  key={`day-${i}`}
                  onClick={() => setSelectedDate(dayDate)}
                  className={`relative aspect-square sm:aspect-[4/3] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-1 sm:p-2 transition-all ${
                    isToday 
                      ? 'bg-[var(--brand-pink)] text-white shadow-lg' 
                      : 'hover:bg-[var(--background-secondary)] text-[var(--foreground)]'
                  } ${hasOutfits && !isToday ? 'border-2 border-[var(--brand-pink)]/30' : 'border border-transparent'}`}
                >
                  <span className={`text-sm sm:text-base font-medium leading-none ${isToday ? 'font-bold' : ''}`}>
                    {i + 1}
                  </span>
                  
                  {/* Outfit Indicator */}
                  {hasOutfits && (
                    <div className="relative flex items-center justify-center">
                      <div className={`rounded-full shadow-sm p-1 sm:p-1.5 z-10 ${isToday ? 'bg-white text-[var(--brand-pink)]' : 'bg-[var(--brand-pink)] text-white'}`}>
                         <Shirt className={`w-3 h-3 sm:w-4 sm:h-4 ${isToday ? 'fill-current' : ''}`} />
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
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--background)] w-full max-w-lg md:max-w-4xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Handle for mobile */}
              <div className="w-full flex justify-center py-3 sm:hidden">
                <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full" />
              </div>

              <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between sticky top-0 bg-[var(--background)] z-10">
                <div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] capitalize">
                    {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    {selectedDayOutfits.length} outfit(s) asignado(s)
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {selectedDayOutfits.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarDays className="w-8 h-8 text-[var(--foreground-tertiary)]" />
                    </div>
                    <p className="text-[var(--foreground-secondary)]">No hay outfits planeados para este día.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedDayOutfits.map((outfit) => (
                      <div key={outfit.calendar_id} className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-4 shadow-sm relative overflow-hidden flex flex-col gap-4">
                        <div 
                            onClick={() => setSelectedOutfitDetail(outfit)}
                            className="cursor-pointer hover:opacity-90 transition-opacity shrink-0 flex items-center justify-center bg-[#f8f9fa] dark:bg-[#111] rounded-2xl border border-[var(--border-color)] overflow-hidden w-full aspect-[4/5] relative"
                        >
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOutfitToSwap(outfit.calendar_id);
                                loadUserOutfits();
                                setShowPicker(true);
                              }}
                              className="absolute top-3 right-14 z-10 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-[var(--foreground)] rounded-full hover:bg-[var(--background-secondary)] transition-colors shadow-sm"
                              title="Cambiar outfit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAssignment(outfit.calendar_id);
                              }}
                              className="absolute top-3 right-3 z-10 p-2 bg-red-100/90 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                              title="Quitar de hoy"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {outfit.image_url ? (
                                <img src={outfit.image_url} alt={outfit.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs text-[var(--foreground-tertiary)]">Sin foto</span>
                            )}
                        </div>
                        <div className="flex flex-col justify-center flex-1 text-center mt-2">
                            <h4 
                                className="font-bold text-[var(--foreground)] text-lg md:text-xl mb-1 cursor-pointer hover:text-[var(--brand-pink)] transition-colors"
                                onClick={() => setSelectedOutfitDetail(outfit)}
                            >
                                {outfit.name || 'Outfit sin nombre'}
                            </h4>
                            <p className="text-sm text-[var(--foreground-secondary)]">{outfit.items?.length || 0} prendas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-[var(--border-color)] bg-[var(--background)]">
                <Button 
                  onClick={() => {
                    loadUserOutfits();
                    setShowPicker(true);
                  }} 
                  className="w-full py-4 text-lg rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
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

      {/* Outfit Picker Modal */}
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
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--background)] w-full max-w-lg md:max-w-4xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
            <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center gap-4 bg-[var(--background)]/90 backdrop-blur-md sticky top-0 z-10 pt-safe-top">
              <button
                onClick={() => { setShowPicker(false); setOutfitToSwap(null); }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--background-secondary)] text-[var(--foreground)] transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">{outfitToSwap ? 'Cambiar Outfit' : 'Selecciona un Outfit'}</h3>
                  <p className="text-sm text-[var(--foreground-secondary)]">Para el {selectedDate?.toLocaleDateString()}</p>
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
                    className="w-full pl-12 pr-4 py-3 bg-[var(--background-secondary)] rounded-2xl text-[var(--foreground)] outline-none border border-transparent focus:border-[var(--brand-pink)]/30 transition-all placeholder-[var(--foreground-tertiary)] font-medium"
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
                    <div key={outfit.id} onClick={() => handleAssignOutfit(outfit.id)} className="cursor-pointer">
                        <OutfitCard
                          outfit={outfit}
                          index={0}
                          onClick={() => handleAssignOutfit(outfit.id)}
                          onEdit={() => {}}
                          onShare={() => {}}
                          onDelete={() => {}}
                          onToggleFavorite={toggleOutfitFavorite}
                        />
                    </div>
                  ))}
                </div>
              )}
              </div>
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
