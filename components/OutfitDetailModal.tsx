import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, Briefcase, PartyPopper, Zap, Flower2, Snowflake, Circle, Layers, Sparkles, Trash2, Edit2, CalendarDays, Rocket, Info } from 'lucide-react';
import Link from 'next/link';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { Outfit } from '@/types/outfit';
import { createPortal } from 'react-dom';
import InteractiveOutfitViewer from './InteractiveOutfitViewer';

interface OutfitDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    outfit: Outfit;
    onDelete?: (id: string) => void;
    onToggleFavorite?: (id: string, currentStatus: boolean) => void;
    onItemClick?: (item: any) => void;
}

const styleConfig: Record<string, { icon: React.ReactNode; label: string }> = {
    'casual': { icon: <Circle className="w-4 h-4" />, label: 'Casual' },
    'formal': { icon: <Briefcase className="w-4 h-4" />, label: 'Formal' },
    'party': { icon: <PartyPopper className="w-4 h-4" />, label: 'Fiesta' },
    'sport': { icon: <Zap className="w-4 h-4" />, label: 'Deporte' },
    'date': { icon: <Heart className="w-4 h-4" />, label: 'Cita' },
    'business': { icon: <Briefcase className="w-4 h-4" />, label: 'Negocios' },
    'everyday': { icon: <Sparkles className="w-4 h-4" />, label: 'Diario' },
};

export function OutfitDetailModal({ isOpen, onClose, outfit, onDelete, onToggleFavorite, onItemClick }: OutfitDetailModalProps) {
    useBodyScrollLock(isOpen);
    const [selectedItemForDetail, setSelectedItemForDetail] = useState<any | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !outfit || !mounted) return null;

    const styleKey = outfit.occasion || outfit.style || 'everyday';
    const config = styleConfig[styleKey] || { icon: <Layers className="w-4 h-4" />, label: styleKey };

    // @ts-ignore
    const items = outfit.items || outfit.outfit_items || [];

    const getItemImage = (item: any) => item.imageUrl || item.image_url || item.clothing_items?.image_url;
    const getItemName = (item: any) => item.name || item.clothing_items?.name;
    const getItemBrand = (item: any) => item.brand || item.clothing_items?.brand;

    const handleItemClick = (clothing: any) => {
        // Open the bottom sheet instead of navigating
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
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 shadow-2xl backdrop-blur-sm z-[6015]"
                    />

                    {/* Modal Content Wrapper - Immersive on Mobile, Split on Desktop */}
                    <div className="fixed inset-0 z-[6020] flex items-end md:items-center justify-center md:p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="w-full h-[100dvh] md:h-[90vh] md:max-w-[1400px] bg-[var(--background)] md:rounded-[32px] flex flex-col md:flex-row overflow-hidden shadow-2xl relative md:border border-[var(--border-color)] pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button - Top Left on Mobile, Top Right on Desktop */}
                            <button
                                onClick={onClose}
                                className="absolute top-12 md:top-6 left-4 md:left-auto md:right-6 z-50 p-3 md:p-3 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-colors text-white"
                            >
                                <X className="w-6 h-6 md:w-5 md:h-5" />
                            </button>

                            {/* Left Column (Desktop) / Top Half (Mobile) */}
                            <div className="relative w-full h-[70dvh] md:h-auto md:w-[60%] md:flex-none bg-[#f8f9fa] dark:bg-[#111] z-0 flex flex-col items-stretch md:border-r border-b md:border-b-0 border-[var(--border-color)]">
                                <div className="absolute inset-0 w-full h-full">
                                    <InteractiveOutfitViewer
                                        outfit={outfit}
                                        onItemClick={setSelectedItemForDetail}
                                        className="w-full h-full"
                                        isMobileSticker={true}
                                        selectedItemId={selectedItemForDetail?.id}
                                    />
                                </div>
                            </div>

                            {/* Right Column (Desktop) / Bottom Half (Mobile) */}
                            <div className="relative z-10 w-full flex-1 md:h-auto flex flex-col pointer-events-auto bg-[var(--background)] overflow-y-auto custom-scrollbar pb-[calc(var(--tabbar-height)+20px)] md:pb-0">
                                {/* Inner container */}
                                <div className="w-full flex flex-col md:pb-10">
                                    {/* Outfit Info */}
                                    <div className="px-6 py-5">
                                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">{outfit.name || 'Outfit sin título'}</h2>
                                        
                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="flex items-center gap-3 p-3 bg-[var(--background-secondary)]/90 backdrop-blur-md md:bg-[var(--background-secondary)] rounded-2xl">
                                                <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center text-[var(--brand-pink)]">
                                                    {config.icon}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-[var(--foreground-tertiary)] uppercase font-bold tracking-wider">Ocasión</p>
                                                    <p className="text-sm font-bold text-[var(--foreground)] capitalize">{config.label}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-[var(--background-secondary)]/90 backdrop-blur-md md:bg-[var(--background-secondary)] rounded-2xl">
                                                <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center text-[var(--brand-pink)]">
                                                    <Layers className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-[var(--foreground-tertiary)] uppercase font-bold tracking-wider">Prendas</p>
                                                    <p className="text-sm font-bold text-[var(--foreground)]">{items.length}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 items-center">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => onToggleFavorite?.(outfit.id, !!outfit.favorite)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-all duration-300 border h-[52px] ${outfit.favorite
                                                    ? 'bg-[var(--brand-pink)] text-white border-transparent shadow-md shadow-[var(--brand-pink)]/20'
                                                    : 'bg-[var(--background-secondary)]/90 backdrop-blur-md text-[var(--brand-pink)] border-transparent hover:bg-pink-100'
                                                }`}
                                            >
                                                <Heart className={`w-5 h-5 transition-all ${outfit.favorite ? 'fill-white text-white' : 'text-[var(--brand-pink)]'}`} />
                                                <span className="text-center">{outfit.favorite ? 'Liked' : 'Like'}</span>
                                            </motion.button>

                                            <Link
                                                href={`/create?outfitId=${outfit.id}`}
                                                className="flex-1"
                                                onClick={onClose}
                                            >
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 bg-[var(--background-secondary)]/90 backdrop-blur-md text-[var(--foreground)] border border-transparent hover:bg-[var(--foreground)] hover:text-[var(--background)] h-[52px]"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                    <span className="text-center">Editar</span>
                                                </motion.button>
                                            </Link>

                                            {onDelete && (
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => onDelete(outfit.id)}
                                                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-medium transition-all duration-300 bg-red-500/10 backdrop-blur-md text-red-600 hover:bg-red-500/20 h-[52px]"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3. Items Breakdown (Desktop Only) */}
                                    <div className="px-6 mt-4 hidden md:block">
                                        <h3 className="font-bold text-lg text-[var(--foreground)] mb-4">Prendas de este look</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {items.map((item: any) => {
                                                const clothing = item.clothing_items || item.clothing_item || item;
                                                const img = getItemImage(item);
                                                if (!clothing || (!img && !clothing.name)) return null;

                                                return (
                                                    <div
                                                        key={clothing.id}
                                                        className="block group cursor-pointer"
                                                        onClick={() => handleItemClick(clothing)}
                                                    >
                                                        <div className="aspect-square bg-[var(--background-secondary)] rounded-2xl overflow-hidden relative mb-2">
                                                            {img ? (
                                                                <Image src={img} alt={getItemName(item) || 'Ropa'} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: clothing.color_hex || clothing.color || '#ccc' }}>👕</div>
                                                            )}
                                                        </div>
                                                        <p className="text-[13px] font-bold text-[var(--foreground)] truncate px-1">{getItemName(item)}</p>
                                                        <p className="text-[11px] text-[var(--foreground-secondary)] px-1">{getItemBrand(item) || 'Sin marca'}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
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
                                            className="absolute inset-0 bg-black/40 z-[6030]"
                                        />

                                        {/* MOBILE: Bottom Sheet with Sticker Effect */}
                                        <motion.div
                                            initial={{ y: "100%" }}
                                            animate={{ y: 0 }}
                                            exit={{ y: "100%" }}
                                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                            className="absolute bottom-0 left-0 right-0 z-[6040] bg-[var(--background)] rounded-t-3xl p-6 pt-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col items-center md:hidden"
                                        >
                                            {/* Close Button */}
                                            <button 
                                                onClick={handleCloseItemDetail}
                                                className="absolute top-4 right-4 p-2 bg-[var(--background-secondary)] rounded-full text-[var(--foreground-secondary)]"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>

                                            {/* Floating Sticker Image */}
                                            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-40 h-40">
                                                <div 
                                                    className="w-full h-full relative"
                                                    style={{ filter: 'drop-shadow(0 0 0 4px white) drop-shadow(0 8px 16px rgba(0,0,0,0.2))' }}
                                                >
                                                    <Image 
                                                        src={selectedItemForDetail.imageUrl || selectedItemForDetail.image_url} 
                                                        alt={selectedItemForDetail.name || 'Prenda'}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>

                                            {/* Item Info */}
                                            <div className="w-full text-center mt-8">
                                                <h3 className="text-xl font-bold text-[var(--foreground)]">{selectedItemForDetail.name || 'Prenda sin nombre'}</h3>
                                                <p className="text-[var(--foreground-secondary)] mt-1">{selectedItemForDetail.brand || 'Sin marca'}</p>
                                                
                                                <div className="mt-6 flex gap-3 w-full">
                                                    <Link 
                                                        href={`/closet?item=${selectedItemForDetail.id}`} 
                                                        onClick={onClose}
                                                        className="flex-1 bg-[var(--foreground)] text-[var(--background)] font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity text-center"
                                                    >
                                                        Ver en armario
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* DESKTOP: Standard Centered Modal */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[6040] bg-white dark:bg-[#1a1a1a] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl hidden md:block"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={handleCloseItemDetail}
                                                className="absolute top-3 right-3 p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
                                            >
                                                <X className="w-5 h-5 text-gray-900 dark:text-white" />
                                            </button>

                                            <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                {selectedItemForDetail.imageUrl || selectedItemForDetail.image_url ? (
                                                    <Image src={selectedItemForDetail.imageUrl || selectedItemForDetail.image_url} alt={selectedItemForDetail.name || 'Prenda'} fill className="object-contain p-4" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-6xl" style={{ backgroundColor: selectedItemForDetail.color_hex || selectedItemForDetail.color || '#ccc' }}>👕</div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedItemForDetail.name || 'Prenda'}</h3>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{selectedItemForDetail.brand || 'Sin marca'}</p>
                                                {selectedItemForDetail.category && (
                                                    <p className="text-sm text-gray-400 uppercase tracking-wider mt-2">{selectedItemForDetail.category}</p>
                                                )}

                                                <div className="flex flex-wrap items-center gap-2 mt-3 mb-6">
                                                    {(selectedItemForDetail.color || selectedItemForDetail.color_hex || selectedItemForDetail.colorHex) && (
                                                        <div className="flex items-center gap-2 p-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                                                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600" style={{ backgroundColor: selectedItemForDetail.color_hex || selectedItemForDetail.colorHex || selectedItemForDetail.color || '#ccc' }} />
                                                            <span className="text-[13px] font-medium text-gray-600 dark:text-gray-300 capitalize">{selectedItemForDetail.color || selectedItemForDetail.colorHex || selectedItemForDetail.color_hex || 'Color'}</span>
                                                        </div>
                                                    )}
                                                    {selectedItemForDetail.size && (
                                                        <div className="flex items-center gap-2 p-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                                                            <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Talla:</span>
                                                            <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.size}</span>
                                                        </div>
                                                    )}
                                                    {(selectedItemForDetail.brand || selectedItemForDetail.fabric) && (
                                                        <div className="flex items-center gap-2 p-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                                                            <span className="text-[13px] font-semibold text-gray-900 dark:text-white">
                                                                {selectedItemForDetail.brand}
                                                                {selectedItemForDetail.brand && selectedItemForDetail.fabric && ' • '}
                                                                {selectedItemForDetail.fabric}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <Link 
                                                    href={`/closet?item=${selectedItemForDetail.id}`} 
                                                    onClick={onClose}
                                                    className="block w-full bg-[var(--foreground)] text-[var(--background)] font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity text-center"
                                                >
                                                    Ver en armario
                                                </Link>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
