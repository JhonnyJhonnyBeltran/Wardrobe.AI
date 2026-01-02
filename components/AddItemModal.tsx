'use client';

/**
 * Add Item Modal - Complete form for adding clothing items
 * Allows full details OR just quick add
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Link as LinkIcon, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button, Card } from '@/components';
import type { ClothingItemData } from '@/data/mockData';
import { removeBackgroundRembg } from '@/services/backgroundRemoval';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: Partial<ClothingItemData>) => void;
}

export default function AddItemModal({ isOpen, onClose, onAdd }: AddItemModalProps) {
    const [mode, setMode] = useState<'quick' | 'complete'>('quick');
    const [inputMethod, setInputMethod] = useState<'upload' | 'url'>('upload');
    const [image, setImage] = useState<string | null>(null);
    const [url, setUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        type: 'top' as const,
        color: '',
        colorHex: '#000000',
        price: '',
        size: '',
        reference: '',
        fabric: '',
        season: 'spring' as const,
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);

        try {
            // Try to remove background using rembg service
            const result = await removeBackgroundRembg(file);

            if (result.success) {
                setImage(result.imageUrl);
            } else {
                // Fallback to original image if rembg fails
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImage(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            console.error('Background removal failed:', error);
            // Fallback to original
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUrlImport = async () => {
        if (!url) return;
        setIsProcessing(true);

        try {
            const response = await fetch('/api/scrape-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error('Server returned non-JSON response:', text);
                throw new Error('Server returned non-JSON response. Check server logs.');
            }

            console.log('Scraping result:', data);

            if (data.success) {
                const { name, imageUrl, price, type, brand } = data.data;
                
                if (imageUrl) setImage(imageUrl);
                
                setFormData(prev => ({
                    ...prev,
                    name: name || prev.name,
                    price: price || prev.price,
                    type: type || prev.type,
                    brand: brand || prev.brand,
                }));
                setMode('complete'); // Switch to complete mode to review details
            } else {
                console.error('Scraping failed:', data.error);
                // Handle error (maybe show a toast)
            }
        } catch (error) {
            console.error('Import failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = () => {
        const newItem: Partial<ClothingItemData> = {
            id: Date.now().toString(),
            imageUrl: image || '',
            isFavorite: false,
            ...formData,
        };
        onAdd(newItem);
        onClose();
        // Reset form
        setImage(null);
        setUrl('');
        setFormData({
            name: '',
            brand: '',
            type: 'top',
            color: '',
            colorHex: '#000000',
            price: '',
            size: '',
            reference: '',
            fabric: '',
            season: 'spring',
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[60] flex items-end md:items-center justify-center p-0 md:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full md:max-w-lg bg-[var(--background)] rounded-t-3xl md:rounded-3xl max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-[var(--background)] border-b border-[var(--border-color)] p-4 flex items-center justify-between z-10">
                        <h2 className="text-lg font-bold text-[var(--foreground)]">Añadir Prenda</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-[var(--background-secondary)] flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Mode Toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode('quick')}
                                className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${mode === 'quick'
                                    ? 'bg-[var(--brand-pink)] text-white'
                                    : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)]'
                                    }`}
                            >
                                Rápido
                            </button>
                            <button
                                onClick={() => setMode('complete')}
                                className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${mode === 'complete'
                                    ? 'bg-[var(--brand-pink)] text-white'
                                    : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)]'
                                    }`}
                            >
                                Completo
                            </button>
                        </div>

                        {/* Input Method Tabs */}
                        <div className="flex border-b border-[var(--border-color)]">
                            <button
                                onClick={() => setInputMethod('upload')}
                                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${inputMethod === 'upload'
                                    ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                                    : 'border-transparent text-[var(--foreground-tertiary)]'
                                    }`}
                            >
                                Subir Foto
                            </button>
                            <button
                                onClick={() => setInputMethod('url')}
                                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${inputMethod === 'url'
                                    ? 'border-[var(--brand-pink)] text-[var(--foreground)]'
                                    : 'border-transparent text-[var(--foreground-tertiary)]'
                                    }`}
                            >
                                Importar URL
                            </button>
                        </div>

                        {/* Image Input Area */}
                        <div className="min-h-[150px]">
                            {inputMethod === 'upload' ? (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--foreground)] mb-2">
                                        Foto de la prenda
                                    </label>
                                    <div className="flex gap-2">
                                        <label className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <div className="aspect-square rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:border-[var(--brand-pink)] transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-[var(--background-secondary)] relative overflow-hidden">
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="w-8 h-8 text-[var(--brand-pink)] animate-spin" />
                                                        <span className="text-xs text-[var(--brand-pink)] font-semibold">Procesando...</span>
                                                    </>
                                                ) : image ? (
                                                    <img src={image} alt="Preview" className="w-full h-full object-contain p-2 bg-white" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-[var(--foreground-tertiary)]" />
                                                        <span className="text-xs text-[var(--foreground-tertiary)]">Subir foto</span>
                                                    </>
                                                )}
                                            </div>
                                        </label>

                                        <div className="flex flex-col gap-2">
                                            <button className="w-20 aspect-square rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1 hover:bg-[var(--background-tertiary)] transition-colors">
                                                <Camera className="w-6 h-6 text-[var(--foreground-tertiary)]" />
                                                <span className="text-[9px] text-[var(--foreground-tertiary)]">Cámara</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-[var(--foreground)]">
                                        Enlace del producto
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://zara.com/..."
                                            className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] text-sm"
                                        />
                                        <button
                                            onClick={handleUrlImport}
                                            disabled={!url || isProcessing}
                                            className="px-4 rounded-2xl bg-[var(--brand-pink)] text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    
                                    {/* Preview Area for URL */}
                                    <div className="aspect-video rounded-2xl border border-[var(--border-color)] bg-[var(--background-secondary)] flex items-center justify-center overflow-hidden relative">
                                        {image ? (
                                            <img src={image} alt="Preview" className="w-full h-full object-contain bg-white" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <LinkIcon className="w-8 h-8 text-[var(--foreground-tertiary)] mx-auto mb-2" />
                                                <p className="text-xs text-[var(--foreground-tertiary)]">
                                                    Pega una URL para previsualizar
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Basic Info (Always shown) */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                    Tipo
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                >
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="dress">Vestido</option>
                                    <option value="outerwear">Abrigo</option>
                                    <option value="shoes">Zapatos</option>
                                    <option value="accessories">Accesorios</option>
                                </select>
                            </div>
                        </div>

                        {/* Complete Mode Fields */}
                        {mode === 'complete' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="ej: Blazer Oversize"
                                        className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                        Marca
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        placeholder="ej: Zara"
                                        className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                            Precio
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="ej: 49.99€"
                                            className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                            Talla
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.size}
                                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                            placeholder="ej: M"
                                            className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                        Referencia
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.reference}
                                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                        placeholder="ej: 1234567890"
                                        className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                        Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            placeholder="ej: Beige"
                                            className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                        />
                                        <input
                                            type="color"
                                            value={formData.colorHex}
                                            onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                                            className="w-16 h-11 rounded-2xl border border-[var(--border-color)] cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                        Tejido
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fabric}
                                        onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                                        placeholder="ej: Algodón"
                                        className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                        Temporada
                                    </label>
                                    <select
                                        value={formData.season}
                                        onChange={(e) => setFormData({ ...formData, season: e.target.value as any })}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                    >
                                        <option value="spring">Primavera</option>
                                        <option value="summer">Verano</option>
                                        <option value="autumn">Otoño</option>
                                        <option value="winter">Invierno</option>
                                    </select>
                                </div>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={!image}
                            className="w-full"
                            glow={!!image}
                        >
                            <Check className="w-5 h-5 mr-2" />
                            Añadir Prenda
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
