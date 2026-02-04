'use client';

/**
 * useAddItemForm Hook
 * Manages all form state and logic for AddItemModal
 * Follows Single Responsibility Principle - only handles form logic
 */

import { useState, useEffect, useCallback } from 'react';
import { processClothingImage } from '@/lib/imageProcessing';
import { extractDominantColor, hexToRgb, rgbToColorName } from '@/lib/utils/colorUtils';
import { DEFAULT_FORM_DATA, PROCESSING_MESSAGES } from '../constants';
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
    currentMessageIndex: number;
    processingMessage: string;

    // Handlers
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleManualProcess: () => Promise<void>;
    handleColorSelect: (colorOption: { name: string; hex: string }) => void;
    handleColorPickerChange: (hex: string) => void;
    rotateImage: (degrees: number) => void;

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

    // Processing state
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // Rotate processing messages
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

    // Initialize form when modal opens
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
                resetForm();
            }
        }
    }, [isOpen, initialData]);

    // Reset form to initial state
    const resetForm = useCallback(() => {
        setMode('quick');
        setImage(null);
        setOriginalImage(null);
        setProcessedImage(null);
        setSelectedFile(null);
        setFormData(DEFAULT_FORM_DATA);
    }, []);

    // Handle image file upload
    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setIsProcessing(true);
        setCurrentMessageIndex(0);
        setError(null);

        try {
            // Load original image first
            const originalDataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            setOriginalImage(originalDataUrl);
            setImage(originalDataUrl);

            // Process with AI
            const processResult = await processClothingImage(file, {
                normalize: true,
                canvasWidth: 800,
                canvasHeight: 1000,
                quality: 'medium',
                transparentBackground: true,
            });

            if (processResult.success && processResult.imageUrl) {
                setProcessedImage(processResult.imageUrl);
                setImage(processResult.imageUrl);

                // Detect dominant color
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
                if (processResult.error) {
                    setError(processResult.error);
                }
            }
        } catch (error) {
            console.error('Image processing failed:', error);
            setError(error instanceof Error ? error.message : 'Error al procesar la imagen');
        } finally {
            setIsProcessing(false);
        }
    }, []);

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
                transparentBackground: true,
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
    }, [processedImage, image, originalImage, selectedFile]);

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

    // Rotate the current image
    const rotateImage = useCallback((degrees: number) => {
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
    }, [image, processedImage]);

    // Build the payload for submission
    const buildPayload = useCallback((): Partial<ClothingItem> => {
        const shouldUpdateImage = !initialData || image !== initialData.imageUrl;
        const shouldUpdateOriginalImage = !initialData || originalImage !== initialData.originalImageUrl;

        const payload: Partial<ClothingItem> = {
            id: initialData?.id,
            name: formData.name || 'Nueva prenda',
            category: (formData.type as any) || 'top',
            color: formData.color || 'Por definir',
            brand: formData.brand || undefined,
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
        currentMessageIndex,
        processingMessage: PROCESSING_MESSAGES[currentMessageIndex],

        // Handlers
        handleImageUpload,
        handleManualProcess,
        handleColorSelect,
        handleColorPickerChange,
        rotateImage,

        // Submit
        buildPayload,
        resetForm,
        error,
        setError,
    };
}
