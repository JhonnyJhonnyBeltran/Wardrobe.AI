'use client';

/**
 * OutfitDetailModal - Maximized Canvas Outfit Detail View
 * - Canvas alargado al máximo para visualización completa del look.
 * - Sin notch ni borde superior intrusivo.
 * - Iconos de visibilidad actualizados: LockOpen (candado abierto para público) y Lock (candado cerrado para privado).
 * - Sección "Prendas de este look" eliminada según solicitud.
 * - Acciones claras: Editar en lienzo, Publicar en feed, Instagram Story, Alternar candado y Eliminar.
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Heart, 
    Instagram,
    Send, 
    Briefcase, 
    PartyPopper, 
    Zap, 
    Flower2, 
    Snowflake, 
    Layers, 
    Trash2, 
    Edit2, 
    Lock,
    LockOpen,
    Coffee,
    Crown,
    Flame,
    Palmtree,
    Moon,
    Sun,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { Outfit } from '@/types/outfit';
import { createPortal } from 'react-dom';
import InteractiveOutfitViewer from './InteractiveOutfitViewer';
import ExportStoryModal from './ExportStoryModal';
import { triggerHaptic } from '@/lib/haptic';

interface OutfitDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    outfit: Outfit;
    onDelete?: (id: string) => void;
    onToggleFavorite?: (outfit: Outfit, currentStatus: boolean) => void;
    onItemClick?: (item: any) => void;
    onToggleVisibility?: (outfit: Outfit) => void;
}

const styleConfig: Record<string, { icon: React.ReactNode; label: string }> = {
    'everyday': { icon: <Sun className="w-3.5 h-3.5" />, label: 'Diario' },
    'casual': { icon: <Coffee className="w-3.5 h-3.5" />, label: 'Casual' },
    'streetwear': { icon: <Flame className="w-3.5 h-3.5" />, label: 'Streetwear' },
    'business': { icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Negocios' },
    'formal': { icon: <Crown className="w-3.5 h-3.5" />, label: 'Formal' },
    'party': { icon: <PartyPopper className="w-3.5 h-3.5" />, label: 'Fiesta' },
    'date': { icon: <Heart className="w-3.5 h-3.5" />, label: 'Cita' },
    'sport': { icon: <Zap className="w-3.5 h-3.5" />, label: 'Deporte' },
    'vacation': { icon: <Palmtree className="w-3.5 h-3.5" />, label: 'Vacaciones' },
    'evening': { icon: <Moon className="w-3.5 h-3.5" />, label: 'Noche' },
    'wedding': { icon: <Crown className="w-3.5 h-3.5" />, label: 'Boda' },
    'beach': { icon: <Sun className="w-3.5 h-3.5" />, label: 'Playa' },
    'winter': { icon: <Snowflake className="w-3.5 h-3.5" />, label: 'Invierno' },
    'summer': { icon: <Sun className="w-3.5 h-3.5" />, label: 'Verano' },
};

export function OutfitDetailModal({ 
    isOpen, 
    onClose, 
    outfit, 
    onDelete, 
    onToggleFavorite, 
    onItemClick, 
    onToggleVisibility 
}: OutfitDetailModalProps) {
    useBodyScrollLock(isOpen);
    const [selectedItemForDetail, setSelectedItemForDetail] = useState<any | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !outfit || !mounted) return null;

    const styleKey = (outfit.occasion || outfit.style || 'everyday').toLowerCase();
    const config = styleConfig[styleKey] || { icon: <Layers className="w-3.5 h-3.5" />, label: outfit.occasion || outfit.style || 'Estilo' };

    // @ts-ignore
    const items = outfit.items || outfit.outfit_items || [];

    const getItemImage = (item: any) => 
        item.imageUrl || item.image_url || item.clothing_items?.image_url || item.clothing_item?.image_url;
    const getItemName = (item: any) => 
        item.name || item.clothing_items?.name || item.clothing_item?.name;
    const getItemBrand = (item: any) => 
        item.brand || item.clothing_items?.brand || item.clothing_item?.brand;
    const getItemCategory = (item: any) => 
        item.category || item.clothing_items?.category || item.clothing_item?.category;

    const handleItemClick = (clothing: any) => {
        triggerHaptic('light');
        setSelectedItemForDetail(clothing);
    };

    const handleCloseItemDetail = () => {
        setSelectedItemForDetail(null);
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="outfit-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[6015]"
                    />

                    {/* Modal Content Wrapper */}
                    <motion.div
                        key="outfit-wrapper"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ 
                            type: 'spring',
                            damping: 28,
                            stiffness: 340,
                        }}
                        className="fixed inset-0 z-[6020] flex items-end md:items-center justify-center px-3 sm:px-6 pb-[calc(var(--tabbar-height)+8px)] md:pb-0 pointer-events-none"
                    >
                        <motion.div
                            className="w-full max-w-md md:max-w-[1040px] h-[82vh] max-h-[calc(100dvh-var(--tabbar-height)-16px)] md:h-[84vh] bg-[var(--background)] rounded-[32px] md:rounded-[36px] flex flex-col md:flex-row overflow-hidden shadow-2xl relative border border-[var(--border-color)] pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Top Right Controls (Favorite + Close) */}
                            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-30 flex items-center gap-2">
                                {onToggleFavorite && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                          triggerHaptic('light');
                                          onToggleFavorite(outfit, outfit.favorite ?? false);
                                        }}
                                        className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-[var(--brand-pink,#FF66C4)] transition-all shadow-xs cursor-pointer active:scale-90"
                                        aria-label="Marcar como favorito"
                                    >
                                        <Heart
                                            className={`w-4 h-4 transition-colors ${
                                                outfit.favorite ? 'fill-[var(--brand-pink,#FF66C4)] text-[var(--brand-pink,#FF66C4)]' : 'fill-none'
                                            }`}
                                        />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        triggerHaptic('light');
                                        onClose();
                                    }}
                                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all shadow-xs cursor-pointer active:scale-90"
                                    aria-label="Cerrar modal"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Maximized Canvas Stage (Left Column in Desktop / Expanded Full-Flex in Mobile) */}
                            <div className="relative w-full flex-1 min-h-0 md:h-full md:w-[58%] shrink bg-gradient-to-b from-[#f9fafb] to-[#f3f4f6] dark:from-[#131316] dark:to-[#0c0c0e] z-0 flex flex-col items-center justify-center md:border-r border-[var(--border-color)] overflow-hidden">
                                <div className="absolute inset-0 w-full h-full">
                                    <InteractiveOutfitViewer
                                        outfit={outfit}
                                        onItemClick={setSelectedItemForDetail}
                                        className="w-full h-full"
                                        isMobileSticker={true}
                                        selectedItemId={selectedItemForDetail?.id}
                                        isActive={isOpen}
                                    />
                                </div>
                                <div className="absolute bottom-2.5 inset-x-0 flex justify-center pointer-events-none">
                                    <span className="text-[10px] tracking-wider uppercase font-semibold text-zinc-400 dark:text-zinc-500 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
                                        Toca una prenda para ver detalles
                                    </span>
                                </div>
                            </div>

                            {/* Bottom Info Section (Clean & Compact) */}
                            <div className="relative z-10 w-full shrink-0 md:flex-1 md:shrink flex flex-col justify-between bg-[var(--background)] p-4 sm:p-5 md:p-8 md:pt-14 gap-4 md:gap-6 border-t border-[var(--border-color)]/60 md:border-t-0 md:overflow-y-auto">
                                {/* Title & Metadata Tags */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {outfit.occasion && config && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/5 dark:border-white/5">
                                                {config.icon}
                                                {config.label}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/5">
                                            <Layers className="w-3 h-3 text-[var(--brand-pink,#FF66C4)]" />
                                            {items.length} {items.length === 1 ? 'prenda' : 'prendas'}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/5">
                                            {outfit.is_public ? (
                                                <>
                                                    <LockOpen className="w-3 h-3 text-[var(--brand-pink,#FF66C4)]" />
                                                    Público
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-3 h-3 text-zinc-400" />
                                                    Privado
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight leading-tight mt-0.5">
                                        {outfit.name || 'Outfit sin título'}
                                    </h2>
                                </div>

                                {/* Action Hierarchy (Editar + Publicar + Story + Candado + Eliminar) */}
                                <div className="flex flex-col gap-2.5 md:gap-3 md:mt-auto">
                                    {/* Primary Row: Editar en lienzo + Publicar */}
                                    <div className="flex items-center gap-2.5">
                                        <Link
                                            href={`/create?outfitId=${outfit.id}`}
                                            className="flex-1"
                                            onClick={onClose}
                                        >
                                            <button
                                                type="button"
                                                className="w-full h-11 px-4 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
                                            >
                                                <Edit2 className="w-4 h-4 shrink-0" />
                                                <span className="truncate">Editar look</span>
                                            </button>
                                        </Link>

                                        <Link
                                            href={`/create-post?outfitId=${outfit.id}`}
                                            className="flex-1"
                                            onClick={onClose}
                                        >
                                            <button
                                                type="button"
                                                className="w-full h-11 px-4 rounded-2xl bg-[var(--brand-pink,#FF66C4)]/10 text-[var(--brand-pink,#FF66C4)] border border-[var(--brand-pink,#FF66C4)]/20 hover:bg-[var(--brand-pink,#FF66C4)]/15 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
                                            >
                                                <Send className="w-4 h-4 shrink-0" />
                                                <span className="truncate">Publicar</span>
                                            </button>
                                        </Link>
                                    </div>

                                    {/* Secondary Row: Story (Instagram) + Visibilidad (Candado Abierto/Cerrado) + Eliminar */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                triggerHaptic('light');
                                                setShowExportModal(true);
                                            }}
                                            className="flex-1 h-9 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-black/5 dark:border-white/5 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                                            title="Exportar a Instagram Stories"
                                        >
                                            <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                                            <span>Story</span>
                                        </button>

                                        {onToggleVisibility && !(outfit.posts && outfit.posts.length > 0) && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    triggerHaptic('light');
                                                    onToggleVisibility(outfit);
                                                }}
                                                className="h-9 px-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-black/5 dark:border-white/5 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                                                title={outfit.is_public ? 'Hacer privado (cerrar candado)' : 'Hacer público (abrir candado)'}
                                            >
                                                {outfit.is_public ? (
                                                    <>
                                                        <LockOpen className="w-3.5 h-3.5 text-[var(--brand-pink,#FF66C4)] shrink-0" />
                                                        <span className="text-xs">Público</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                                        <span className="text-xs">Privado</span>
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {onDelete && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    triggerHaptic('medium');
                                                    onDelete(outfit.id);
                                                }}
                                                className="h-9 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-500 border border-red-500/20 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                                                title="Eliminar outfit"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                                <span className="hidden sm:inline">Eliminar</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                    
                    {/* Item Detail (Mobile: Bottom Sheet, Desktop: Standard Modal) */}
                    <AnimatePresence>
                        {selectedItemForDetail && (
                            <>
                                {/* Inner Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={handleCloseItemDetail}
                                    className="fixed inset-0 bg-black/50 z-[6030] backdrop-blur-xs"
                                />

                                {/* MOBILE: Bottom Sheet with Sticker Effect */}
                                <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="fixed bottom-0 left-0 right-0 z-[6040] bg-[var(--background)] rounded-t-[32px] p-6 pt-16 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-[var(--border-color)] flex flex-col items-center justify-between min-h-[44vh] md:hidden pointer-events-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button 
                                        type="button"
                                        onClick={handleCloseItemDetail}
                                        className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-44 h-44 pointer-events-none">
                                        <div className="w-full h-full relative" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.18))' }}>
                                            <Image 
                                                src={selectedItemForDetail.imageUrl || selectedItemForDetail.image_url} 
                                                alt={selectedItemForDetail.name || 'Prenda'} 
                                                fill 
                                                className="object-contain" 
                                            />
                                        </div>
                                    </div>

                                    <div className="w-full text-center flex-1 flex flex-col justify-between mt-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-[var(--foreground)]">{selectedItemForDetail.name || 'Prenda'}</h3>
                                            <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm font-medium">{selectedItemForDetail.brand || 'Sin marca'}</p>
                                            
                                            {selectedItemForDetail.category && (
                                                <p className="text-xs text-zinc-400 uppercase tracking-wider mt-3 font-semibold">{selectedItemForDetail.category}</p>
                                            )}

                                            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 mb-2">
                                                {(selectedItemForDetail.color || selectedItemForDetail.color_hex || selectedItemForDetail.colorHex) && (
                                                    <div className="flex items-center gap-2 py-1.5 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-fit">
                                                        <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-600 shadow-2xs" style={{ backgroundColor: selectedItemForDetail.color_hex || selectedItemForDetail.colorHex || selectedItemForDetail.color || '#ccc' }} />
                                                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">{selectedItemForDetail.color || selectedItemForDetail.colorHex || selectedItemForDetail.color_hex || 'Color'}</span>
                                                    </div>
                                                )}
                                                {selectedItemForDetail.size && (
                                                    <div className="flex items-center gap-1.5 py-1.5 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-fit">
                                                        <span className="text-xs font-medium text-zinc-500">Talla:</span>
                                                        <span className="text-xs font-bold text-[var(--foreground)]">{selectedItemForDetail.size}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {(selectedItemForDetail.source_url || selectedItemForDetail.sourceUrl) && (
                                            <div className="mt-6 w-full">
                                                <a 
                                                    href={selectedItemForDetail.source_url || selectedItemForDetail.sourceUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="w-full bg-[var(--foreground)] text-[var(--background)] font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md text-sm"
                                                >
                                                    <span>Enlace a la tienda</span>
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* DESKTOP: Centered Preview Modal */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[6040] bg-[var(--background)] rounded-3xl max-w-sm w-[90%] p-5 space-y-4 shadow-2xl border border-[var(--border-color)] pointer-events-auto hidden md:block"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        type="button"
                                        onClick={handleCloseItemDetail}
                                        className="absolute top-3 right-3 p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors z-10 cursor-pointer"
                                    >
                                        <X className="w-5 h-5 text-[var(--foreground)]" />
                                    </button>

                                    <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                        {selectedItemForDetail.imageUrl || selectedItemForDetail.image_url ? (
                                            <Image 
                                                src={selectedItemForDetail.imageUrl || selectedItemForDetail.image_url} 
                                                alt={selectedItemForDetail.name || 'Prenda'} 
                                                fill 
                                                className="object-contain p-4" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl" style={{ backgroundColor: selectedItemForDetail.color_hex || selectedItemForDetail.color || '#ccc' }}>👕</div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--foreground)]">{selectedItemForDetail.name || 'Prenda'}</h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">{selectedItemForDetail.brand || 'Sin marca'}</p>
                                        {selectedItemForDetail.category && (
                                            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-2 font-semibold">{selectedItemForDetail.category}</p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-2 mt-3 mb-4">
                                            {(selectedItemForDetail.color || selectedItemForDetail.color_hex || selectedItemForDetail.colorHex) && (
                                                <div className="flex items-center gap-2 py-1.5 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit">
                                                    <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-600" style={{ backgroundColor: selectedItemForDetail.color_hex || selectedItemForDetail.colorHex || selectedItemForDetail.color || '#ccc' }} />
                                                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">{selectedItemForDetail.color || selectedItemForDetail.colorHex || selectedItemForDetail.color_hex || 'Color'}</span>
                                                </div>
                                            )}
                                            {selectedItemForDetail.size && (
                                                <div className="flex items-center gap-1.5 py-1.5 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit">
                                                    <span className="text-xs font-medium text-zinc-500">Talla:</span>
                                                    <span className="text-xs font-semibold text-[var(--foreground)]">{selectedItemForDetail.size}</span>
                                                </div>
                                            )}
                                        </div>

                                        {(selectedItemForDetail.source_url || selectedItemForDetail.sourceUrl) && (
                                            <a 
                                                href={selectedItemForDetail.source_url || selectedItemForDetail.sourceUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="w-full bg-[var(--foreground)] text-[var(--background)] font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md text-sm mt-4"
                                            >
                                                <span>Ver en la web</span>
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Export Story Modal (Instagram Stories) */}
                    <ExportStoryModal
                        isOpen={showExportModal}
                        onClose={() => setShowExportModal(false)}
                        title={outfit.name || 'Outfit'}
                        items={items.map((it: any) => {
                            const c = it.clothing_items || it.clothing_item || it;
                            return {
                                id: c.id,
                                name: getItemName(it) || 'Prenda',
                                imageUrl: getItemImage(it) || '',
                                brand: getItemBrand(it),
                                category: getItemCategory(it),
                            };
                        })}
                        coverImageUrl={(outfit as any).image_url || (outfit as any).imageUrl}
                        occasion={config?.label}
                        season={outfit.season}
                    />
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
