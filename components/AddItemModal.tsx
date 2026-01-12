'use client';

/**
 * Add Item Modal - Complete form for adding clothing items
 * Features:
 * - Quick add with just an image
 * - Complete mode with all details
 * - Dropdowns with predefined options + custom input
 * - AI-powered image processing
 * - Color detection from images
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Link as LinkIcon, Check, ArrowRight, Loader2, RotateCw, RotateCcw, Wand2, ChevronDown } from 'lucide-react';
import { Button, Card, AdvisorModal } from '@/components';
import type { ClothingItem } from '@/types/clothing';
import { processClothingImage } from '@/lib/imageProcessing';

// ============================================================================
// CONSTANTS - Predefined options for dropdowns
// ============================================================================

const PROCESSING_MESSAGES = [
    'Analizando imagen...',
    'Quitando fondo...',
    'Detectando bordes...',
    'Recortando imagen...',
    'Enderezando prenda...',
    'Centrando objeto...',
    'Optimizando resultado...',
];

// Marcas populares predefinidas
const BRAND_OPTIONS = [
    'Zara',
    'Mango',
    'H&M',
    'Pull&Bear',
    'Bershka',
    'Stradivarius',
    'Massimo Dutti',
    'COS',
    'Uniqlo',
    'Nike',
    'Adidas',
    'Levi\'s',
    'Tommy Hilfiger',
    'Calvin Klein',
    'Primark',
    'ASOS',
    'Shein',
    'Otra marca',
];

// Tallas predefinidas
const SIZE_OPTIONS = [
    'XXS',
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    'XXXL',
    '34',
    '36',
    '38',
    '40',
    '42',
    '44',
    '46',
    'Única',
    'Otra talla',
];

// Tejidos comunes
const FABRIC_OPTIONS = [
    'Algodón',
    'Poliéster',
    'Lana',
    'Seda',
    'Lino',
    'Denim',
    'Cuero',
    'Piel sintética',
    'Viscosa',
    'Nylon',
    'Terciopelo',
    'Punto',
    'Tweed',
    'Pana',
    'Lycra/Elastano',
    'Cashmere',
    'Otro tejido',
];

// Colores predefinidos
const COLOR_OPTIONS = [
    { name: 'Negro', hex: '#000000' },
    { name: 'Blanco', hex: '#FFFFFF' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Beige', hex: '#D4C4B0' },
    { name: 'Marrón', hex: '#795548' },
    { name: 'Azul marino', hex: '#000080' },
    { name: 'Azul', hex: '#2196F3' },
    { name: 'Celeste', hex: '#87CEEB' },
    { name: 'Rojo', hex: '#FF0000' },
    { name: 'Rosa', hex: '#FFC0CB' },
    { name: 'Verde', hex: '#4CAF50' },
    { name: 'Amarillo', hex: '#FFEB3B' },
    { name: 'Naranja', hex: '#FF6B35' },
    { name: 'Morado', hex: '#9C27B0' },
    { name: 'Crema', hex: '#FFFDD0' },
];

// Tipos de prenda
const TYPE_OPTIONS = [
    { value: 'top', label: 'Top / Camiseta' },
    { value: 'bottom', label: 'Pantalón / Falda' },
    { value: 'dress', label: 'Vestido / Mono' },
    { value: 'outerwear', label: 'Abrigo / Chaqueta' },
    { value: 'shoes', label: 'Zapatos / Calzado' },
    { value: 'accessories', label: 'Accesorios' },
    { value: 'swimwear', label: 'Bañador / Bikini' },
    { value: 'sportswear', label: 'Ropa deportiva' },
];

// Temporadas
const SEASON_OPTIONS = [
    { value: 'spring', label: '🌸 Primavera' },
    { value: 'summer', label: '☀️ Verano' },
    { value: 'autumn', label: '🍂 Otoño' },
    { value: 'winter', label: '❄️ Invierno' },
    { value: 'all-season', label: '📅 Todo el año' },
];

// ============================================================================
// CUSTOM DROPDOWN COMPONENT - Fully styled, no native select
// ============================================================================

interface DropdownWithCustomProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    customOptionLabel?: string;
}

function DropdownWithCustom({
    label,
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    customOptionLabel = 'Otro...'
}: DropdownWithCustomProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const [customValue, setCustomValue] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Check if current value is custom (not in options)
    useEffect(() => {
        if (value && !options.includes(value) && value !== customOptionLabel) {
            setIsCustom(true);
            setCustomValue(value);
        }
    }, [value, options, customOptionLabel]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelectOption = (selectedValue: string) => {
        if (selectedValue === customOptionLabel || selectedValue === 'Otra marca' || selectedValue === 'Otra talla' || selectedValue === 'Otro tejido') {
            setIsCustom(true);
            setCustomValue('');
            onChange('');
        } else {
            setIsCustom(false);
            onChange(selectedValue);
        }
        setIsOpen(false);
    };

    const handleCustomChange = (customVal: string) => {
        setCustomValue(customVal);
        onChange(customVal);
    };

    const displayValue = value || placeholder;

    return (
        <div ref={dropdownRef} className="relative">
            <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                {label}
            </label>
            {isCustom ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customValue}
                        onChange={(e) => handleCustomChange(e.target.value)}
                        placeholder={`Introducir ${label.toLowerCase()}...`}
                        className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] text-sm"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setIsCustom(false);
                            setCustomValue('');
                            onChange('');
                        }}
                        className="px-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <>
                    {/* Dropdown Trigger */}
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border text-left flex items-center justify-between cursor-pointer transition-all text-sm ${isOpen
                            ? 'border-[var(--brand-pink)] ring-2 ring-[var(--brand-pink)]/20'
                            : 'border-[var(--border-color)] hover:border-[var(--brand-pink)]/50'
                            }`}
                    >
                        <span className={value ? 'text-[var(--foreground)]' : 'text-[var(--foreground-tertiary)]'}>
                            {displayValue}
                        </span>
                        <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-5 h-5 text-[var(--foreground-tertiary)]" />
                        </motion.div>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute z-50 w-full mt-2 py-2 rounded-2xl bg-[var(--background)] border border-[var(--border-color)] shadow-xl shadow-black/20 max-h-[200px] overflow-y-auto"
                                style={{
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                }}
                            >
                                {/* Placeholder option */}
                                <button
                                    type="button"
                                    onClick={() => handleSelectOption('')}
                                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${!value
                                        ? 'bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] font-medium'
                                        : 'text-[var(--foreground-tertiary)] hover:bg-[var(--background-tertiary)]'
                                        }`}
                                >
                                    {placeholder}
                                </button>

                                {/* Options */}
                                {options.map((option, index) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleSelectOption(option)}
                                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${value === option
                                            ? 'bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] font-medium'
                                            : 'text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}

// ============================================================================
// CUSTOM SELECT COMPONENT - For value/label options (Type, Season, etc.)
// ============================================================================

interface SelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
}

function CustomSelect({ label, value, onChange, options }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    // Get current display label
    const currentOption = options.find(opt => opt.value === value);
    const displayLabel = currentOption?.label || 'Seleccionar...';

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={selectRef} className="relative">
            <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                {label}
            </label>

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border text-left flex items-center justify-between cursor-pointer transition-all text-sm ${isOpen
                    ? 'border-[var(--brand-pink)] ring-2 ring-[var(--brand-pink)]/20'
                    : 'border-[var(--border-color)] hover:border-[var(--brand-pink)]/50'
                    }`}
            >
                <span className="text-[var(--foreground)]">
                    {displayLabel}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-[var(--foreground-tertiary)]" />
                </motion.div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute z-50 w-full mt-2 py-2 rounded-2xl bg-[var(--background)] border border-[var(--border-color)] shadow-xl shadow-black/20 max-h-[200px] overflow-y-auto"
                        style={{
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                        }}
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${value === option.value
                                    ? 'bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] font-medium'
                                    : 'text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================================
// COLOR UTILITY FUNCTIONS
// ============================================================================

/**
 * Extrae el color dominante de una imagen
 */
const extractDominantColor = (imageUrl: string): Promise<{ hex: string; name: string }> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve({ hex: '#000000', name: 'Negro' });
                return;
            }

            // Reducir tamaño para análisis más rápido
            const size = 100;
            canvas.width = size;
            canvas.height = size;
            ctx.drawImage(img, 0, 0, size, size);

            const imageData = ctx.getImageData(0, 0, size, size);
            const data = imageData.data;
            const colorCount: { [key: string]: number } = {};

            // Contar colores (ignorando píxeles transparentes y muy oscuros/claros)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                // Ignorar píxeles transparentes o casi transparentes
                if (a < 50) continue;

                // Ignorar blancos puros y negros puros (probablemente fondo)
                const brightness = (r + g + b) / 3;
                if (brightness > 240 || brightness < 15) continue;

                // Reducir precisión para agrupar colores similares
                const rr = Math.round(r / 10) * 10;
                const gg = Math.round(g / 10) * 10;
                const bb = Math.round(b / 10) * 10;

                const key = `${rr},${gg},${bb}`;
                colorCount[key] = (colorCount[key] || 0) + 1;
            }

            // Encontrar el color más común
            let dominantColor = { r: 0, g: 0, b: 0 };
            let maxCount = 0;

            for (const [color, count] of Object.entries(colorCount)) {
                if (count > maxCount) {
                    maxCount = count;
                    const [r, g, b] = color.split(',').map(Number);
                    dominantColor = { r, g, b };
                }
            }

            // Convertir a hex
            const hex = `#${dominantColor.r.toString(16).padStart(2, '0')}${dominantColor.g.toString(16).padStart(2, '0')}${dominantColor.b.toString(16).padStart(2, '0')}`;
            const name = rgbToColorName(dominantColor.r, dominantColor.g, dominantColor.b);

            resolve({ hex, name });
        };

        img.onerror = () => {
            resolve({ hex: '#000000', name: 'Negro' });
        };
    });
};

/**
 * Convierte RGB a nombre de color aproximado (mejorado)
 */
const rgbToColorName = (r: number, g: number, b: number): string => {
    const hsl = rgbToHsl(r, g, b);
    const h = hsl.h;
    const s = hsl.s;
    const l = hsl.l;

    // Colores acromáticos (baja saturación)
    if (s < 10) {
        if (l < 15) return 'Negro';
        if (l < 30) return 'Gris oscuro';
        if (l < 50) return 'Gris';
        if (l < 70) return 'Gris claro';
        if (l < 90) return 'Blanco roto';
        return 'Blanco';
    }

    // Colores marrones y tierra (baja saturación + matiz cálido)
    if (s < 30) {
        if (h >= 20 && h < 60) {
            if (l < 30) return 'Marrón oscuro';
            if (l < 50) return 'Marrón';
            if (l < 65) return 'Beige';
            if (l < 80) return 'Crema';
            return 'Arena';
        }
    }

    // Colores beige/tierra con más saturación
    if (h >= 20 && h < 50 && s >= 30 && s < 50) {
        if (l < 40) return 'Marrón';
        if (l < 60) return 'Beige';
        if (l < 75) return 'Arena';
        return 'Crema';
    }

    // Colores cromáticos (saturación media-alta)
    // Rojos
    if ((h >= 345 || h < 15) && s >= 30) {
        if (l < 35) return 'Rojo oscuro';
        if (l < 65) return 'Rojo';
        if (l < 85) return 'Rosa';
        return 'Rosa claro';
    }

    // Naranjas y tierras
    if (h >= 15 && h < 45 && s >= 50) {
        if (l < 40) return 'Naranja oscuro';
        if (l < 70) return 'Naranja';
        return 'Durazno';
    }

    // Amarillos
    if (h >= 45 && h < 70) {
        if (s < 40) {
            if (l < 60) return 'Beige';
            return 'Crema';
        }
        if (l < 35) return 'Amarillo oscuro';
        if (l < 70) return 'Amarillo';
        return 'Amarillo claro';
    }

    // Verdes
    if (h >= 70 && h < 170) {
        if (l < 25) return 'Verde oscuro';
        if (h < 85 && s < 50) return 'Verde oliva';
        if (l < 50) return 'Verde';
        if (l < 75) return 'Verde claro';
        return 'Verde menta';
    }

    // Cianes y turquesas
    if (h >= 170 && h < 200) {
        if (l < 40) return 'Turquesa oscuro';
        if (l < 70) return 'Turquesa';
        return 'Aguamarina';
    }

    // Azules
    if (h >= 200 && h < 260) {
        if (l < 30) return 'Azul marino';
        if (l < 50) return 'Azul';
        if (l < 70) return 'Azul claro';
        return 'Celeste';
    }

    // Violetas y púrpuras
    if (h >= 260 && h < 290) {
        if (l < 40) return 'Morado oscuro';
        if (l < 65) return 'Morado';
        if (l < 80) return 'Violeta';
        return 'Lila';
    }

    // Magentas y fucsia
    if (h >= 290 && h < 330) {
        if (l < 40) return 'Magenta oscuro';
        if (l < 70) return 'Fucsia';
        return 'Rosa';
    }

    // Rosas
    if (h >= 330 && h < 345) {
        if (l < 50) return 'Rosa oscuro';
        if (l < 75) return 'Rosa';
        return 'Rosa claro';
    }

    return 'Multicolor';
};

/**
 * Convierte RGB a HSL
 */
const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
};

/**
 * Convierte Hex a RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: Partial<ClothingItem>) => void | Promise<void>;
    initialData?: ClothingItem;
    isEditing?: boolean;
}

export default function AddItemModal({ isOpen, onClose, onAdd, initialData, isEditing = false }: AddItemModalProps) {
    const [mode, setMode] = useState<'quick' | 'complete'>('quick');
    const [inputMethod, setInputMethod] = useState<'upload' | 'url'>('upload');
    const [image, setImage] = useState<string | null>(null);
    const [url, setUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [showAdvisor, setShowAdvisor] = useState(false);

    // Estado para múltiples imágenes de scraping
    const [availableImages, setAvailableImages] = useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        type: 'top' as string,
        color: '',
        colorHex: '#000000',
        size: '',
        reference: '',
        fabric: '',
        season: 'spring' as string,
        sourceUrl: '' as string,
    });

    // Efecto para rotar mensajes durante el procesamiento
    useEffect(() => {
        if (!isProcessing) {
            setCurrentMessageIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
        }, 1500);

        return () => clearInterval(interval);
    }, [isProcessing]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Editing mode setup
                setMode('complete');
                setImage(initialData.imageUrl || null);

                if (initialData.isAiProcessed) {
                    setProcessedImage(initialData.imageUrl || null);
                    setOriginalImage(initialData.originalImageUrl || initialData.imageUrl || null);
                } else {
                    setProcessedImage(null);
                    setOriginalImage(initialData.imageUrl || initialData.originalImageUrl || null);
                }

                setFormData({
                    name: initialData.name,
                    brand: initialData.brand || '',
                    type: (initialData.category as any) || 'top',
                    color: initialData.color || '',
                    colorHex: (initialData as any).colorHex || '#000000',
                    size: (initialData as any).size || '',
                    reference: (initialData as any).reference || '',
                    fabric: (initialData as any).fabric || '',
                    season: (initialData.season?.[0] as any) || 'spring',
                    sourceUrl: (initialData as any).sourceUrl || '',
                });
            } else {
                // Add mode reset
                setMode('quick');
                setImage(null);
                setOriginalImage(null);
                setProcessedImage(null);
                setSelectedFile(null);
                setAvailableImages([]);
                setSelectedImageIndex(null);
                setFormData({
                    name: '',
                    brand: '',
                    type: 'top',
                    color: '',
                    colorHex: '#000000',
                    size: '',
                    reference: '',
                    fabric: '',
                    season: 'spring',
                    sourceUrl: '',
                });
            }
        }
    }, [isOpen, initialData]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setIsProcessing(true);
        setCurrentMessageIndex(0);

        try {
            // Cargar imagen original primero
            const originalDataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            setOriginalImage(originalDataUrl);
            setImage(originalDataUrl);

            // Procesar automáticamente con IA
            const processResult = await processClothingImage(file, {
                normalize: true,
                canvasWidth: 800,
                canvasHeight: 1000,
                quality: 'medium',
            });

            if (processResult.success && processResult.imageUrl) {
                setProcessedImage(processResult.imageUrl);
                setImage(processResult.imageUrl);

                // Detectar color dominante de la imagen procesada
                try {
                    const dominantColor = await extractDominantColor(processResult.imageUrl);
                    setFormData(prev => ({
                        ...prev,
                        color: dominantColor.name,
                        colorHex: dominantColor.hex
                    }));
                } catch (colorError) {
                    console.warn('Failed to extract dominant color:', colorError);
                }
            } else {
                console.warn('Processing failed, keeping original:', processResult.error);
            }
        } catch (error) {
            console.error('Image processing failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleManualProcess = async () => {
        if (processedImage && image === processedImage) {
            if (originalImage) setImage(originalImage);
            return;
        }

        if (processedImage && image === originalImage) {
            setImage(processedImage);
            return;
        }

        if (!selectedFile && !image) return;

        setIsProcessing(true);
        try {
            const source = selectedFile || image;

            if (!source) {
                setIsProcessing(false);
                return;
            }

            const result = await processClothingImage(source, {
                normalize: true,
                canvasWidth: 800,
                canvasHeight: 1000,
                quality: 'medium',
            });

            if (result.success && result.imageUrl) {
                setProcessedImage(result.imageUrl);
                setImage(result.imageUrl);
            }
        } catch (error) {
            console.error('Manual processing failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleColorSelect = (colorOption: { name: string; hex: string }) => {
        setFormData({ ...formData, color: colorOption.name, colorHex: colorOption.hex });
    };

    const handleColorPickerChange = (hex: string) => {
        const rgb = hexToRgb(hex);
        if (rgb) {
            const colorName = rgbToColorName(rgb.r, rgb.g, rgb.b);
            setFormData({ ...formData, colorHex: hex, color: colorName });
        } else {
            setFormData({ ...formData, colorHex: hex });
        }
    };

    const rotateImage = (degrees: number) => {
        if (!image) return;

        const img = new Image();
        img.src = image;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const radians = (degrees * Math.PI) / 180;
            const sin = Math.abs(Math.sin(radians));
            const cos = Math.abs(Math.cos(radians));

            canvas.width = img.width * cos + img.height * sin;
            canvas.height = img.width * sin + img.height * cos;

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(radians);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            canvas.toBlob((blob) => {
                if (blob) {
                    const newImageUrl = URL.createObjectURL(blob);

                    if (processedImage && image === processedImage) {
                        setProcessedImage(newImageUrl);
                        setImage(newImageUrl);
                    } else {
                        setOriginalImage(newImageUrl);
                        setImage(newImageUrl);
                    }
                }
            }, 'image/png');
        };
    };

    const handleAdvisorConfirm = () => {
        handleManualProcess();
        setShowAdvisor(false);
    };

    const handleUrlImport = async () => {
        if (!url) return;
        setIsProcessing(true);
        setAvailableImages([]);
        setSelectedImageIndex(null);

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
                const { name, images, type, brand, url: productUrl } = data.data;

                // Guardar todas las imágenes disponibles
                if (images && images.length > 0) {
                    setAvailableImages(images);
                    // No seleccionar automáticamente, dejar que el usuario elija
                }

                setFormData(prev => ({
                    ...prev,
                    name: name || prev.name,
                    type: type || prev.type,
                    brand: brand || prev.brand,
                    sourceUrl: productUrl || url, // Guardar la URL del producto original
                }));
                setMode('complete');
            } else {
                console.error('Scraping failed:', data.error);
            }
        } catch (error) {
            console.error('Import failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Función para seleccionar una imagen y procesarla automáticamente
    const handleImageSelection = async (imageUrl: string, index: number) => {
        setSelectedImageIndex(index);
        setOriginalImage(imageUrl);
        setIsProcessing(true);
        setCurrentMessageIndex(0);

        try {
            // Aplicar borrado de fondo automáticamente
            const result = await processClothingImage(imageUrl, {
                normalize: true,
                canvasWidth: 800,
                canvasHeight: 1000,
                quality: 'medium',
            });

            if (result.success && result.imageUrl) {
                setProcessedImage(result.imageUrl);
                setImage(result.imageUrl);

                // Detectar color dominante
                try {
                    const dominantColor = await extractDominantColor(result.imageUrl);
                    setFormData(prev => ({
                        ...prev,
                        color: dominantColor.name,
                        colorHex: dominantColor.hex
                    }));
                } catch (colorError) {
                    console.warn('Failed to extract dominant color:', colorError);
                }
            } else {
                // Si falla el procesamiento, usar la imagen original
                console.warn('Processing failed, keeping original:', result.error);
                setImage(imageUrl);
            }
        } catch (error) {
            console.error('Image processing failed:', error);
            setImage(imageUrl);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async () => {
        if (isProcessing) {
            console.log('Aún procesando imagen, espera...');
            return;
        }

        const shouldUpdateImage = !initialData || image !== initialData.imageUrl;
        const shouldUpdateOriginalImage = !initialData || originalImage !== initialData.originalImageUrl;

        const payload: Partial<ClothingItem> = {
            id: initialData?.id,
            name: formData.name || 'Nueva prenda',
            category: (formData.type as any) || 'top',
            color: formData.color || 'Por definir',
            brand: formData.brand || undefined,
            season: [formData.season as any] || [],
            isAiProcessed: !!processedImage && image === processedImage,
            ...({
                colorHex: formData.colorHex || '#808080',
                size: formData.size,
                reference: formData.reference,
                fabric: formData.fabric,
                sourceUrl: formData.sourceUrl || undefined,
            } as any)
        };

        if (shouldUpdateImage && image) {
            payload.imageUrl = image;
        }
        if (shouldUpdateOriginalImage && originalImage) {
            payload.originalImageUrl = originalImage;
        }

        await onAdd(payload);
        onClose();

        if (!initialData) {
            setImage(null);
            setOriginalImage(null);
            setProcessedImage(null);
            setSelectedFile(null);
            setUrl('');
        }
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
                        <h2 className="text-lg font-bold text-[var(--foreground)]">
                            {isEditing ? 'Editar Prenda' : 'Añadir Prenda'}
                        </h2>
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
                        {!isEditing && (
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
                        )}

                        {/* Image Input Area */}
                        <div className="min-h-[150px]">
                            {inputMethod === 'upload' || isEditing ? (
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
                                                        <span className="text-xs text-[var(--brand-pink)] font-semibold animate-pulse">
                                                            {PROCESSING_MESSAGES[currentMessageIndex]}
                                                        </span>
                                                    </>
                                                ) : image ? (
                                                    <img
                                                        src={image}
                                                        alt="Preview"
                                                        className="w-full h-full object-contain p-2 bg-white"
                                                    />
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-[var(--foreground-tertiary)]" />
                                                        <span className="text-xs text-[var(--foreground-tertiary)]">Subir foto</span>
                                                    </>
                                                )}
                                            </div>
                                        </label>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                type="button"
                                                className="w-20 aspect-square rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1 hover:bg-[var(--background-tertiary)] transition-colors"
                                            >
                                                <Camera className="w-6 h-6 text-[var(--foreground-tertiary)]" />
                                                <span className="text-[9px] text-[var(--foreground-tertiary)]">Cámara</span>
                                            </button>

                                            {image && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => rotateImage(90)}
                                                        className="w-20 aspect-square rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1 hover:bg-[var(--background-tertiary)] transition-colors"
                                                    >
                                                        <RotateCw className="w-6 h-6 text-[var(--foreground-tertiary)]" />
                                                        <span className="text-[9px] text-[var(--foreground-tertiary)]">Girar →</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => rotateImage(-90)}
                                                        className="w-20 aspect-square rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1 hover:bg-[var(--background-tertiary)] transition-colors"
                                                    >
                                                        <RotateCcw className="w-6 h-6 text-[var(--foreground-tertiary)]" />
                                                        <span className="text-[9px] text-[var(--foreground-tertiary)]">Girar ←</span>
                                                    </button>
                                                </>
                                            )}
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

                                    {/* Selector de imágenes múltiples */}
                                    {availableImages.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-[var(--foreground)]">
                                                    Selecciona una imagen ({availableImages.length} disponibles)
                                                </span>
                                                {selectedImageIndex !== null && (
                                                    <span className="text-xs text-[var(--brand-pink)] font-semibold">
                                                        ✓ Imagen {selectedImageIndex + 1} seleccionada
                                                    </span>
                                                )}
                                            </div>

                                            {/* Grid de imágenes para seleccionar */}
                                            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
                                                {availableImages.map((imgUrl, index) => (
                                                    <motion.button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleImageSelection(imgUrl, index)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === index
                                                            ? 'border-[var(--brand-pink)] ring-2 ring-[var(--brand-pink)]/30'
                                                            : 'border-[var(--border-color)] hover:border-[var(--brand-pink)]/50'
                                                            }`}
                                                    >
                                                        <img
                                                            src={imgUrl}
                                                            alt={`Imagen ${index + 1}`}
                                                            className="w-full h-full object-cover bg-white"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                        {selectedImageIndex === index && (
                                                            <div className="absolute inset-0 bg-[var(--brand-pink)]/20 flex items-center justify-center">
                                                                <div className="w-6 h-6 rounded-full bg-[var(--brand-pink)] flex items-center justify-center">
                                                                    <Check className="w-4 h-4 text-white" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.button>
                                                ))}
                                            </div>

                                            {/* Vista previa de imagen procesada */}
                                            {image && (
                                                <div className="mt-3">
                                                    <span className="text-xs font-bold text-[var(--foreground)] mb-2 block">
                                                        Vista previa (fondo eliminado)
                                                    </span>
                                                    <div className="aspect-square max-w-[200px] mx-auto rounded-2xl border border-[var(--border-color)] bg-white overflow-hidden relative">
                                                        {isProcessing ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                                <Loader2 className="w-8 h-8 text-[var(--brand-pink)] animate-spin" />
                                                                <span className="text-xs text-[var(--brand-pink)] font-semibold animate-pulse">
                                                                    {PROCESSING_MESSAGES[currentMessageIndex]}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <img src={image} alt="Preview" className="w-full h-full object-contain p-2" />
                                                        )}
                                                    </div>
                                                    {/* Botones de rotación para modo URL */}
                                                    <div className="flex justify-center gap-2 mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => rotateImage(-90)}
                                                            disabled={isProcessing}
                                                            className="px-3 py-2 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex items-center gap-1 hover:bg-[var(--background-tertiary)] transition-colors disabled:opacity-50"
                                                        >
                                                            <RotateCcw className="w-4 h-4 text-[var(--foreground-tertiary)]" />
                                                            <span className="text-xs text-[var(--foreground-secondary)]">Girar ←</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => rotateImage(90)}
                                                            disabled={isProcessing}
                                                            className="px-3 py-2 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex items-center gap-1 hover:bg-[var(--background-tertiary)] transition-colors disabled:opacity-50"
                                                        >
                                                            <RotateCw className="w-4 h-4 text-[var(--foreground-tertiary)]" />
                                                            <span className="text-xs text-[var(--foreground-secondary)]">Girar →</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Estado vacío cuando no hay imágenes */
                                        <div className="aspect-video rounded-2xl border border-[var(--border-color)] bg-[var(--background-secondary)] flex items-center justify-center overflow-hidden relative">
                                            {isProcessing ? (
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Loader2 className="w-8 h-8 text-[var(--brand-pink)] animate-spin" />
                                                    <span className="text-xs text-[var(--brand-pink)] font-semibold">
                                                        Buscando imágenes...
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <LinkIcon className="w-8 h-8 text-[var(--foreground-tertiary)] mx-auto mb-2" />
                                                    <p className="text-xs text-[var(--foreground-tertiary)]">
                                                        Pega una URL para ver las imágenes disponibles
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Basic Info - Type Selector */}
                        <div className="space-y-3">
                            <CustomSelect
                                label="Tipo de prenda"
                                value={formData.type}
                                onChange={(value) => setFormData({ ...formData, type: value })}
                                options={TYPE_OPTIONS}
                            />
                        </div>

                        {/* Complete Mode Fields */}
                        {mode === 'complete' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                            >
                                {/* Nombre */}
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

                                {/* Marca - Dropdown with custom */}
                                <DropdownWithCustom
                                    label="Marca"
                                    value={formData.brand}
                                    onChange={(value) => setFormData({ ...formData, brand: value })}
                                    options={BRAND_OPTIONS}
                                    placeholder="Seleccionar marca..."
                                />

                                {/* Talla y Referencia en grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <DropdownWithCustom
                                        label="Talla"
                                        value={formData.size}
                                        onChange={(value) => setFormData({ ...formData, size: value })}
                                        options={SIZE_OPTIONS}
                                        placeholder="Seleccionar..."
                                    />

                                    <div>
                                        <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                            Referencia
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.reference}
                                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                            placeholder="Opcional"
                                            className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                        />
                                    </div>
                                </div>

                                {/* Color - Visual selector */}
                                <div>
                                    <label className="block text-xs font-bold text-[var(--foreground)] mb-2">
                                        Color
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {COLOR_OPTIONS.map((colorOption) => (
                                            <button
                                                key={colorOption.name}
                                                type="button"
                                                onClick={() => handleColorSelect(colorOption)}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === colorOption.name
                                                    ? 'border-[var(--brand-pink)] scale-110 ring-2 ring-[var(--brand-pink)]/30'
                                                    : 'border-[var(--border-color)] hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: colorOption.hex }}
                                                title={colorOption.name}
                                            />
                                        ))}
                                        <input
                                            type="color"
                                            value={formData.colorHex}
                                            onChange={(e) => handleColorPickerChange(e.target.value)}
                                            className="w-8 h-8 rounded-full border border-[var(--border-color)] cursor-pointer"
                                            title="Color personalizado"
                                        />
                                    </div>
                                    {formData.color && (
                                        <p className="text-xs text-[var(--foreground-secondary)]">
                                            Color seleccionado: <strong>{formData.color}</strong>
                                        </p>
                                    )}
                                </div>

                                {/* Tejido - Dropdown with custom */}
                                <DropdownWithCustom
                                    label="Tejido"
                                    value={formData.fabric}
                                    onChange={(value) => setFormData({ ...formData, fabric: value })}
                                    options={FABRIC_OPTIONS}
                                    placeholder="Seleccionar tejido..."
                                />

                                {/* Temporada */}
                                <CustomSelect
                                    label="Temporada"
                                    value={formData.season}
                                    onChange={(value) => setFormData({ ...formData, season: value })}
                                    options={SEASON_OPTIONS}
                                />
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={!image || isProcessing}
                            className="w-full"
                            glow={!!image && !isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Procesando imagen...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5 mr-2" />
                                    {isEditing ? 'Guardar Cambios' : 'Añadir Prenda'}
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>


            <AdvisorModal
                key="advisor-modal"
                isOpen={showAdvisor}
                onClose={() => setShowAdvisor(false)}
                onConfirm={handleAdvisorConfirm}
            />
        </AnimatePresence >
    );
}
