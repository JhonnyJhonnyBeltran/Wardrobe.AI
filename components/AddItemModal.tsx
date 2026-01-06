'use client';

/**
 * Add Item Modal - Complete form for adding clothing items
 * Allows full details OR just quick add
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Link as LinkIcon, Check, ArrowRight, Loader2, RotateCw, RotateCcw, Wand2 } from 'lucide-react';
import { Button, Card, AdvisorModal } from '@/components';
import type { ClothingItem } from '@/types/clothing';
import { processClothingImage } from '@/lib/imageProcessing';

const PROCESSING_MESSAGES = [
    'Analizando imagen...',
    'Quitando fondo...',
    'Detectando bordes...',
    'Recortando imagen...',
    'Enderezando prenda...',
    'Centrando objeto...',
    'Optimizando resultado...',
];

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

/**
 * Convierte nombre de color a hex aproximado
 */
const colorNameToHex = (colorName: string): string => {
    const name = colorName.toLowerCase().trim();
    
    const colorMap: { [key: string]: string } = {
        // Negros y grises
        'negro': '#000000',
        'gris oscuro': '#404040',
        'gris': '#808080',
        'gris claro': '#C0C0C0',
        'blanco roto': '#F5F5DC',
        'blanco': '#FFFFFF',
        
        // Marrones y tierra
        'marrón oscuro': '#3E2723',
        'marrón': '#795548',
        'beige': '#D4C4B0',
        'crema': '#FFFDD0',
        'arena': '#C2B280',
        
        // Rojos
        'rojo oscuro': '#8B0000',
        'rojo': '#FF0000',
        'rosa oscuro': '#C71585',
        'rosa': '#FFC0CB',
        'rosa claro': '#FFB6C1',
        
        // Naranjas
        'naranja oscuro': '#FF8C00',
        'naranja': '#FF6B35',
        'durazno': '#FFE5B4',
        
        // Amarillos
        'amarillo oscuro': '#B8860B',
        'amarillo': '#FFEB3B',
        'amarillo claro': '#FFFF99',
        
        // Verdes
        'verde oscuro': '#006400',
        'verde oliva': '#808000',
        'verde': '#4CAF50',
        'verde claro': '#90EE90',
        'verde menta': '#98FF98',
        
        // Azules y cianes
        'turquesa oscuro': '#008B8B',
        'turquesa': '#40E0D0',
        'aguamarina': '#7FFFD4',
        'azul marino': '#000080',
        'azul': '#2196F3',
        'azul claro': '#ADD8E6',
        'celeste': '#87CEEB',
        'cian': '#00BCD4',
        
        // Morados
        'morado oscuro': '#4A148C',
        'morado': '#9C27B0',
        'violeta': '#8A2BE2',
        'lila': '#C8A2C8',
        
        // Magentas
        'magenta oscuro': '#8B008B',
        'magenta': '#FF00FF',
        'fucsia': '#FF00FF',
    };
    
    // Buscar coincidencia exacta
    if (colorMap[name]) {
        return colorMap[name];
    }
    
    // Buscar coincidencia parcial
    for (const [key, value] of Object.entries(colorMap)) {
        if (name.includes(key) || key.includes(name)) {
            return value;
        }
    }
    
    // Si no encuentra, mantener el hex actual
    return '';
};

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

    // Check local storage on mount


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

    // Efecto para rotar mensajes durante el procesamiento
    useEffect(() => {
        if (!isProcessing) {
            setCurrentMessageIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
        }, 1500); // Cambia el mensaje cada 1.5 segundos

        return () => clearInterval(interval);
    }, [isProcessing]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Editing mode setup
                setMode('complete');
                setMode('complete');
                setImage(initialData.imageUrl || null);

                // If it was AI processed, the current imageUrl is the processed one
                if (initialData.isAiProcessed) {
                    setProcessedImage(initialData.imageUrl || null);
                    // Use stored original or fallback to current (though logic implies original is different)
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
                    price: (initialData as any).price || '',
                    size: (initialData as any).size || '',
                    reference: (initialData as any).reference || '',
                    fabric: (initialData as any).fabric || '',
                    season: (initialData.season?.[0] as any) || 'spring',
                });
            } else {
                // Add mode reset
                setMode('quick');
                setMode('quick');
                setImage(null);
                setOriginalImage(null);
                setProcessedImage(null);
                setSelectedFile(null);
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
            // Si falla, mantener la imagen original
        } finally {
            setIsProcessing(false);
        }
    };

    const handleManualProcess = async () => {
        // If we have a processed image and we are currently showing it, revert to original
        if (processedImage && image === processedImage) {
            if (originalImage) setImage(originalImage);
            return;
        }

        // If we have a processed image but showing original, switch to processed
        if (processedImage && image === originalImage) {
            setImage(processedImage);
            return;
        }

        if (!selectedFile && !image) return;

        setIsProcessing(true);
        try {
            // Process image in browser (remove background + normalize)
            const source = selectedFile || image; // Use file if available, otherwise image URL (from import)

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
                // We don't update selectedFile here, so the user could potentially re-process the original if we kept it? 
                // But generally we just update the view. 
                // If we want to allow 'undo', we might need to store originalImage separately.
            }
        } catch (error) {
            console.error('Manual processing failed:', error);
        } finally {
            setIsProcessing(false);
        }
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

    const handleColorNameChange = (name: string) => {
        const hex = colorNameToHex(name);
        if (hex) {
            setFormData({ ...formData, color: name, colorHex: hex });
        } else {
            setFormData({ ...formData, color: name });
        }
    };

    const rotateImage = (degrees: number) => {
        if (!image) return;

        // Crear un canvas para rotar la imagen realmente
        const img = new Image();
        img.src = image;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Calcular nuevas dimensiones según la rotación
            const radians = (degrees * Math.PI) / 180;
            const sin = Math.abs(Math.sin(radians));
            const cos = Math.abs(Math.cos(radians));

            canvas.width = img.width * cos + img.height * sin;
            canvas.height = img.width * sin + img.height * cos;

            // Mover el origen al centro del canvas
            ctx.translate(canvas.width / 2, canvas.height / 2);

            // Rotar
            ctx.rotate(radians);

            // Dibujar la imagen centrada
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            // Convertir a blob y actualizar la imagen
            canvas.toBlob((blob) => {
                if (blob) {
                    const newImageUrl = URL.createObjectURL(blob);

                    // Update whichever state is currently active
                    if (processedImage && image === processedImage) {
                        setProcessedImage(newImageUrl);
                        setImage(newImageUrl);
                    } else {
                        // Assume it's the original image
                        setOriginalImage(newImageUrl);
                        setImage(newImageUrl);
                    }

                    // Clean up old blob if needed - be careful not to revoke if it's still being used by the other state
                    // logic here is simplified: we just create new blobs. Browser cleans up eventually or we can track strictly.
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

                if (imageUrl) {
                    setImage(imageUrl);
                    setOriginalImage(imageUrl);
                    setProcessedImage(null);
                    setSelectedFile(null); // Clear any previous file
                }

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

    const handleSubmit = async () => {
        // No permitir guardar mientras se procesa
        if (isProcessing) {
            console.log('Aún procesando imagen, espera...');
            return;
        }

        // Build payload: only include images if they have changed or did not exist
        const shouldUpdateImage = !initialData || image !== initialData.imageUrl;
        const shouldUpdateOriginalImage = !initialData || originalImage !== initialData.originalImageUrl;

        const payload: Partial<ClothingItem> = {
            id: initialData?.id, // Preserve ID if editing
            name: formData.name || 'Nueva prenda',
            category: (formData.type as any) || 'top',
            color: formData.color || 'Por definir',
            brand: formData.brand || undefined,
            season: [formData.season as any] || [],
            isAiProcessed: !!processedImage && image === processedImage,
            // cast properties that might not be in ClothingItem interface but we want to save
            ...({
                colorHex: formData.colorHex || '#808080',
                price: formData.price,
                size: formData.size,
                reference: formData.reference,
                fabric: formData.fabric,
            } as any)
        };

        // Only include image fields if they changed (don't send undefined to avoid overwriting)
        if (shouldUpdateImage && image) {
            payload.imageUrl = image;
        }
        if (shouldUpdateOriginalImage && originalImage) {
            payload.originalImageUrl = originalImage;
        }

        await onAdd(payload);
        onClose();
        // Reset handled by useEffect on next open, but nice to clean up:
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

                        {/* Input Method Tabs - Hide when editing as we already have image */}
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
                                            onChange={(e) => handleColorNameChange(e.target.value)}
                                            placeholder="ej: Beige"
                                            className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                        />
                                        <input
                                            type="color"
                                            value={formData.colorHex}
                                            onChange={(e) => handleColorPickerChange(e.target.value)}
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
