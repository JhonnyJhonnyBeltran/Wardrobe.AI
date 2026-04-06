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
import type { ItemFormData, FormMode, InputMethod } from '../types';
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
        } else {
            // ── Create mode: restore from pending store or start fresh ──
            const pendingItem = useUiStore.getState().pendingUploadItem;
            if (pendingItem) {
                setFormData(pendingItem.formData || DEFAULT_FORM_DATA);
                setImage(pendingItem.image || null);
                setOriginalImage(pendingItem.originalImage || null);
                setProcessedImage(pendingItem.processedImage || null);
            } else {
                resetForm();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isEditing, initialData]);

    // Handle image file upload - optimized for non-blocking UI
    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        // Load original image first - show immediately for instant feedback
        const originalDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        setOriginalImage(originalDataUrl);
        setImage(originalDataUrl);

        // Set processing state AFTER showing the image
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

        try {
            const processResult = await processClothingImage(
                file,
                {
                    normalize: true,
                    canvasWidth: 1200,
                    canvasHeight: 1500,
                    quality: 'quality',
                    transparentBackground: true,
                },
                handleProgress
            );

            if (processResult.success && processResult.imageUrl) {
                await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

                setProcessedImage(processResult.imageUrl);
                setImage(processResult.imageUrl);
                setProcessingStage('complete');

                setTimeout(async () => {
                    try {
                        const dominantColor = await extractDominantColor(processResult.imageUrl!);
                        setFormData(prev => ({
                            ...prev,
                            color: dominantColor.name,
                            colorHex: dominantColor.hex
                        }));
                    } catch (colorError) {
                        console.warn('Failed to extract dominant color:', colorError);
                    }
                }, 50);
            } else {
                setProcessingStage('error');
                if (processResult.error) {
                    setError(processResult.error);
                }
            }
        } catch (error) {
            console.error('Image processing failed:', error);
            setProcessingStage('error');
            setError(error instanceof Error ? error.message : 'Error al procesar la imagen');
        } finally {
            await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
            setIsProcessing(false);
        }
    }, [handleProgress]);

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

    // Build the payload for submission
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
