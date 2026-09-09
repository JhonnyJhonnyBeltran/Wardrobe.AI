'use client';

/**
 * useAddItemForm Hook
 * Manages all form state and logic for AddItemModal
 * Follows Single Responsibility Principle - only handles form logic
 */

import { useState, useEffect, useCallback } from 'react';
import { processClothingImage, type ProcessingStage, STAGE_MESSAGES } from '@/lib/imageProcessing';
import { extractDominantColor, hexToRgb, rgbToColorName } from '@/lib/utils/colorUtils';
import { DEFAULT_FORM_DATA } from '../constants';
import { useUiStore } from '@/store/uiStore';
import { normalizeBrand } from '@/lib/utils/string';
import type { ItemFormData, FormMode, InputMethod, BatchItem } from '../types';
import type { ClothingItem } from '@/types/clothing';

interface UseAddItemFormProps {
    isOpen: boolean;
    initialData?: ClothingItem;
    isEditing?: boolean;
}

interface UseAddItemFormReturn {
    // Form state
    mode: FormMode;
    setMode: (mode: FormMode) => void;
    formData: ItemFormData;
    setFormData: React.Dispatch<React.SetStateAction<ItemFormData>>;

    // Image state
    image: string | null;
    originalImage: string | null;
    processedImage: string | null;
    selectedFile: File | null;

    // Batch state
    batchItems: BatchItem[];
    setBatchItems: React.Dispatch<React.SetStateAction<BatchItem[]>>;
    currentBatchIndex: number;
    setCurrentBatchIndex: React.Dispatch<React.SetStateAction<number>>;
    updateBatchItemFormData: (index: number, partialData: Partial<ItemFormData>) => void;
    removeBatchItem: (index: number) => void;
    buildBatchPayloads: () => Partial<ClothingItem>[];

    // Processing state
    isProcessing: boolean;
    processingStage: ProcessingStage;
    processingMessage: string;

    // Handlers
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleManualProcess: () => Promise<void>;
    handleColorSelect: (colorOption: { name: string; hex: string }) => void;
    handleColorPickerChange: (hex: string) => void;

    // Submit
    buildPayload: () => Partial<ClothingItem>;
    resetForm: () => void;
    error: string | null;
    setError: (error: string | null) => void;
}

export function useAddItemForm({
    isOpen,
    initialData,
    isEditing = false,
}: UseAddItemFormProps): UseAddItemFormReturn {
    // Form mode state
    const [mode, setMode] = useState<FormMode>('quick');

    // Form data state
    const [formData, setFormData] = useState<ItemFormData>(DEFAULT_FORM_DATA);

    // Image state
    const [image, setImage] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Batch items state
    const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
    const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

    // Error state
    const [error, setError] = useState<string | null>(null);

    // Processing state - now with stage-based tracking
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');

    // Progress callback for real-time updates
    const handleProgress = useCallback((stage: ProcessingStage, _progress: number, _message?: string) => {
        setProcessingStage(stage);
    }, []);

    // Reset form to initial state
    const resetForm = useCallback(() => {
        setMode('quick');
        setImage(null);
        setOriginalImage(null);
        setProcessedImage(null);
        setSelectedFile(null);
        setFormData(DEFAULT_FORM_DATA);
        setBatchItems([]);
        setCurrentBatchIndex(0);
        setError(null);
    }, []);

    // Helper to update individual batch item
    const updateBatchItemFormData = useCallback((index: number, partialData: Partial<ItemFormData>) => {
        setBatchItems(prev => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index] = {
                    ...updated[index],
                    formData: {
                        ...updated[index].formData,
                        ...partialData,
                    }
                };
            }
            return updated;
        });
    }, []);

    // Helper to remove item from batch
    const removeBatchItem = useCallback((index: number) => {
        setBatchItems(prev => {
            const next = prev.filter((_, idx) => idx !== index);
            if (next.length === 0) {
                resetForm();
            } else if (currentBatchIndex >= next.length) {
                setCurrentBatchIndex(Math.max(0, next.length - 1));
            }
            return next;
        });
    }, [currentBatchIndex, resetForm]);

    // Downscale image to lightweight JPEG (max 800px, < 80KB) for instant Gemini Vision response
    const optimizeImageForVision = useCallback((dataUrl: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = document.createElement('img');
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                const maxDim = 800;
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = Math.round((h * maxDim) / w);
                        w = maxDim;
                    } else {
                        w = Math.round((w * maxDim) / h);
                        h = maxDim;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, w);
                canvas.height = Math.max(1, h);
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                } else {
                    resolve(dataUrl);
                }
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    }, []);

    // Initialize form when modal opens
    useEffect(() => {
        if (!isOpen) return;

        if (isEditing && initialData) {
            // ── Edit mode: always load the item's stored data ──
            setMode('complete');

            // Image state
            setImage(initialData.imageUrl || null);
            if (initialData.isAiProcessed) {
                setProcessedImage(initialData.imageUrl || null);
                setOriginalImage(initialData.originalImageUrl || initialData.imageUrl || null);
            } else {
                setProcessedImage(null);
                setOriginalImage(initialData.imageUrl || initialData.originalImageUrl || null);
            }

            // Form data – always from initialData in edit mode
            setFormData({
                name: initialData.name || '',
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
            setBatchItems([]);
            setCurrentBatchIndex(0);
        } else {
            // ── Create mode: restore from pending store or start fresh ──
            const pendingItem = useUiStore.getState().pendingUploadItem;
            if (pendingItem) {
                if (pendingItem.batchItems && pendingItem.batchItems.length > 0) {
                    setBatchItems(pendingItem.batchItems);
                    setCurrentBatchIndex(0);
                    const first = pendingItem.batchItems[0];
                    setFormData(first?.formData || DEFAULT_FORM_DATA);
                    setImage(first?.image || first?.originalImage || null);
                    setOriginalImage(first?.originalImage || null);
                    setProcessedImage(first?.processedImage || null);
                } else {
                    setFormData(pendingItem.formData || DEFAULT_FORM_DATA);
                    setImage(pendingItem.image || null);
                    setOriginalImage(pendingItem.originalImage || null);
                    setProcessedImage(pendingItem.processedImage || null);
                    setBatchItems([]);
                    setCurrentBatchIndex(0);
                }
            } else {
                resetForm();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isEditing, initialData]);

    // Process a single file with background removal + Gemini vision with automatic retry
    const processSingleFile = useCallback(async (file: File, initialDataUrl: string) => {
        const visionBase64 = await optimizeImageForVision(initialDataUrl);

        // Start AI classification in background
        const analyzePromise = fetch('/api/analyze-clothing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: visionBase64 })
        })
        .then(res => res.ok ? res.json() : null)
        .catch(err => {
            console.warn('[AddItemForm] AI classification fallback:', err);
            return null;
        });

        // Background removal with retry mechanism (up to 2 attempts)
        let processResult: any = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                processResult = await processClothingImage(
                    file,
                    {
                        normalize: true,
                        canvasWidth: 1200,
                        canvasHeight: 1500,
                        quality: 'quality',
                        transparentBackground: true,
                    }
                );
                if (processResult && processResult.success && processResult.imageUrl) {
                    break;
                }
            } catch (err) {
                console.warn(`[AddItemForm] Background removal attempt ${attempt} failed:`, err);
                if (attempt < 2) {
                    await new Promise(r => setTimeout(r, 300));
                }
            }
        }

        try {
            const aiAnalysis = await analyzePromise;

            let detectedColor = aiAnalysis?.color;
            let detectedColorHex = aiAnalysis?.colorHex;

            if (!detectedColor || !detectedColorHex) {
                try {
                    const dom = await extractDominantColor(processResult?.imageUrl || initialDataUrl);
                    if (dom && dom.name) {
                        detectedColor = detectedColor || dom.name;
                        detectedColorHex = detectedColorHex || dom.hex;
                    }
                } catch (e) {
                    console.warn('Dominant color fallback error:', e);
                }
            }

            const detectedType = aiAnalysis?.category || 'top';
            let detectedName = aiAnalysis?.name;
            if (!detectedName || detectedName.trim() === '') {
                const categoryLabels: Record<string, string> = {
                    top: 'Camiseta',
                    shirt: 'Camisa',
                    sweater: 'Jersey',
                    hoodie: 'Sudadera',
                    jacket: 'Chaqueta',
                    outerwear: 'Abrigo',
                    bottom: 'Pantalón',
                    shorts: 'Shorts',
                    skirt: 'Falda',
                    dress: 'Vestido',
                    shoes: 'Calzado',
                    bag: 'Bolso',
                    accessory: 'Accesorio',
                    other: 'Prenda',
                };
                const catName = categoryLabels[detectedType] || 'Prenda';
                detectedName = detectedColor ? `${catName} ${detectedColor}` : catName;
            }

            return {
                processedImage: processResult && processResult.success && processResult.imageUrl ? processResult.imageUrl : null,
                aiAnalysis: {
                    ...aiAnalysis,
                    name: detectedName,
                    category: detectedType,
                    color: detectedColor,
                    colorHex: detectedColorHex,
                },
                detectedName,
                detectedType,
                detectedColor: detectedColor || 'Negro',
                detectedColorHex: detectedColorHex || '#121212',
                isInappropriate: !!aiAnalysis?.isInappropriate,
                inappropriateReason: aiAnalysis?.inappropriateReason,
            };
        } catch (err) {
            console.error('[AddItemForm] AI / Image analysis failed:', err);
            return {
                processedImage: processResult && processResult.success && processResult.imageUrl ? processResult.imageUrl : null,
                aiAnalysis: null,
                detectedName: 'Nueva prenda',
                detectedType: 'top',
                detectedColor: 'Negro',
                detectedColorHex: '#121212',
                isInappropriate: false,
            };
        }
    }, [optimizeImageForVision]);

    // Handle image file upload (supports single or up to 20 files)
    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawFiles = e.target.files;
        if (!rawFiles || rawFiles.length === 0) return;

        const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif', 'image/gif'];
        const files: File[] = [];

        for (let i = 0; i < rawFiles.length; i++) {
            const file = rawFiles[i];
            const isImg = file.type ? validMimeTypes.includes(file.type.toLowerCase()) : file.name.match(/\.(jpe?g|png|webp|heic|heif|avif|gif)$/i);
            if (isImg) {
                files.push(file);
            }
        }

        if (files.length === 0) {
            setError('El formato de foto que has subido es incorrecto. Por favor, sube imágenes en formato JPG, PNG, WEBP o HEIC.');
            e.target.value = '';
            return;
        }

        // ── Case A: Multiple Files (Batch Upload up to 20) ──
        if (files.length > 1) {
            const selectedBatch = files.slice(0, 20);
            setIsProcessing(true);
            setProcessingStage('compressing');
            setError(null);

            // Read all images as Data URLs in parallel
            const initialItems: BatchItem[] = await Promise.all(
                selectedBatch.map(async (file, idx) => {
                    const dataUrl = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve((reader.result as string) || '');
                        reader.onerror = () => resolve('');
                        reader.readAsDataURL(file);
                    });

                    return {
                        id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
                        originalImage: dataUrl,
                        image: dataUrl,
                        selectedFile: file,
                        isProcessing: true,
                        processingMessage: 'Analizando con IA...',
                        formData: {
                            ...DEFAULT_FORM_DATA,
                            name: `Prenda ${idx + 1}`,
                        },
                    };
                })
            );

            setBatchItems(initialItems);
            setCurrentBatchIndex(0);

            // Process items concurrently in chunks of 2 to balance memory and speed
            const chunkSize = 2;
            for (let i = 0; i < initialItems.length; i += chunkSize) {
                const chunk = initialItems.slice(i, i + chunkSize);
                await Promise.allSettled(
                    chunk.map(async (batchItem, chunkIdx) => {
                        const itemIndex = i + chunkIdx;
                        const file = batchItem.selectedFile;
                        if (!file) return;

                        const result = await processSingleFile(file, batchItem.originalImage);

                        setBatchItems(prev => {
                            const updated = [...prev];
                            if (updated[itemIndex]) {
                                const currentItem = updated[itemIndex];
                                const hasCustomName = currentItem.formData.name && 
                                    currentItem.formData.name !== DEFAULT_FORM_DATA.name && 
                                    !currentItem.formData.name.startsWith('Prenda ');

                                updated[itemIndex] = {
                                    ...currentItem,
                                    image: result.processedImage || currentItem.originalImage,
                                    processedImage: result.processedImage,
                                    isProcessing: false,
                                    processingMessage: '',
                                    formData: {
                                        ...currentItem.formData,
                                        name: hasCustomName 
                                            ? currentItem.formData.name 
                                            : (result.detectedName || `Prenda ${itemIndex + 1}`),
                                        type: result.detectedType || currentItem.formData.type || 'top',
                                        color: result.detectedColor || currentItem.formData.color || 'Negro',
                                        colorHex: result.detectedColorHex || currentItem.formData.colorHex || '#121212',
                                        fabric: result.aiAnalysis?.fabric || currentItem.formData.fabric || 'Algodón',
                                        season: result.aiAnalysis?.season || currentItem.formData.season || 'all-season',
                                    },
                                    error: result.isInappropriate 
                                        ? (result.inappropriateReason || 'Contenido inapropiado detectado.') 
                                        : null,
                                };
                            }
                            return updated;
                        });
                    })
                );
            }

            setIsProcessing(false);
            setProcessingStage('complete');
            e.target.value = '';
            return;
        }

        // ── Case B: Single File (Normal View) ──
        const file = files[0];
        setSelectedFile(file);
        setBatchItems([]);
        setCurrentBatchIndex(0);

        let originalDataUrl: string;
        try {
            originalDataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result) resolve(reader.result as string);
                    else reject(new Error('Invalid image result'));
                };
                reader.onerror = () => reject(new Error('Read error'));
                reader.readAsDataURL(file);
            });
        } catch {
            setError('El formato de foto que has subido es incorrecto o no se pudo leer el archivo.');
            e.target.value = '';
            return;
        }

        setOriginalImage(originalDataUrl);
        setImage(originalDataUrl);

        setIsProcessing(true);
        setProcessingStage('compressing');
        setError(null);

        // Delay to allow UI render
        await new Promise<void>(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(resolve, 100);
                });
            });
        });

        const result = await processSingleFile(file, originalDataUrl);

        if (result.isInappropriate) {
            setImage(null);
            setOriginalImage(null);
            setProcessedImage(null);
            setSelectedFile(null);
            setProcessingStage('error');
            setError(
                result.inappropriateReason || 
                '⚠️ Imagen no permitida: Hemos eliminado la imagen porque contiene contenido inapropiado que no cumple con las normas de la comunidad.'
            );
            setIsProcessing(false);
            return;
        }

        if (result.processedImage) {
            setProcessedImage(result.processedImage);
            setImage(result.processedImage);
        }

        setFormData(prev => ({
            ...prev,
            name: result.detectedName || prev.name || 'Nueva prenda',
            type: result.detectedType || prev.type || 'top',
            color: result.detectedColor || prev.color || 'Negro',
            colorHex: result.detectedColorHex || prev.colorHex || '#121212',
            fabric: result.aiAnalysis?.fabric || prev.fabric || 'Algodón',
            season: result.aiAnalysis?.season || prev.season || 'all-season',
        }));

        setProcessingStage('complete');
        setIsProcessing(false);
        e.target.value = '';
    }, [optimizeImageForVision, processSingleFile, resetForm]);

    // Handle manual AI processing toggle
    const handleManualProcess = useCallback(async () => {
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
        setProcessingStage('compressing');

        try {
            const source = selectedFile || image;

            if (!source) {
                setIsProcessing(false);
                return;
            }

            const result = await processClothingImage(
                source,
                {
                    normalize: true,
                    canvasWidth: 1200,
                    canvasHeight: 1500,
                    quality: 'quality',
                    transparentBackground: true,
                },
                handleProgress
            );

            if (result.success && result.imageUrl) {
                setProcessedImage(result.imageUrl);
                setImage(result.imageUrl);
                setProcessingStage('complete');
            } else {
                setProcessingStage('error');
            }
        } catch (error) {
            console.error('Manual processing failed:', error);
            setProcessingStage('error');
        } finally {
            setIsProcessing(false);
        }
    }, [processedImage, image, originalImage, selectedFile, handleProgress]);

    // Handle color selection from swatches
    const handleColorSelect = useCallback((colorOption: { name: string; hex: string }) => {
        setFormData(prev => ({ ...prev, color: colorOption.name, colorHex: colorOption.hex }));
    }, []);

    // Handle custom color picker change
    const handleColorPickerChange = useCallback((hex: string) => {
        const rgb = hexToRgb(hex);
        if (rgb) {
            const colorName = rgbToColorName(rgb.r, rgb.g, rgb.b);
            setFormData(prev => ({ ...prev, colorHex: hex, color: colorName }));
        } else {
            setFormData(prev => ({ ...prev, colorHex: hex }));
        }
    }, []);

    // Build single payload for submission
    const buildPayload = useCallback((): Partial<ClothingItem> => {
        const shouldUpdateImage = !initialData || image !== initialData.imageUrl;
        const shouldUpdateOriginalImage = !initialData || originalImage !== initialData.originalImageUrl;

        const payload: Partial<ClothingItem> = {
            id: initialData?.id,
            name: formData.name || 'Nueva prenda',
            category: (formData.type as any) || 'top',
            color: formData.color || 'Por definir',
            brand: formData.brand ? normalizeBrand(formData.brand) : undefined,
            season: formData.season ? [formData.season as any] : [],
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

        return payload;
    }, [initialData, image, originalImage, processedImage, formData]);

    // Build payload list for batch items
    const buildBatchPayloads = useCallback((): Partial<ClothingItem>[] => {
        return batchItems
            .filter(item => !item.error && (item.image || item.originalImage))
            .map((item, idx) => ({
                name: item.formData.name?.trim() || `Prenda ${idx + 1}`,
                category: (item.formData.type as any) || 'top',
                color: item.formData.color || 'Por definir',
                brand: item.formData.brand ? normalizeBrand(item.formData.brand) : undefined,
                season: item.formData.season ? [item.formData.season as any] : [],
                isAiProcessed: !!item.processedImage && item.image === item.processedImage,
                imageUrl: item.image || item.originalImage,
                originalImageUrl: item.originalImage,
                ...({
                    colorHex: item.formData.colorHex || '#808080',
                    size: item.formData.size,
                    reference: item.formData.reference,
                    fabric: item.formData.fabric,
                    sourceUrl: item.formData.sourceUrl || undefined,
                } as any)
            }));
    }, [batchItems]);

    return {
        // Form state
        mode,
        setMode,
        formData,
        setFormData,

        // Image state
        image,
        originalImage,
        processedImage,
        selectedFile,

        // Batch state
        batchItems,
        setBatchItems,
        currentBatchIndex,
        setCurrentBatchIndex,
        updateBatchItemFormData,
        removeBatchItem,
        buildBatchPayloads,

        // Processing state
        isProcessing,
        processingStage,
        processingMessage: STAGE_MESSAGES[processingStage] || '',

        // Handlers
        handleImageUpload,
        handleManualProcess,
        handleColorSelect,
        handleColorPickerChange,

        // Submit
        buildPayload,
        resetForm,
        error,
        setError,
    };
}
