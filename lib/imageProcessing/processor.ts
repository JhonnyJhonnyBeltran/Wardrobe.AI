/**
 * Main Image Processor
 * Orchestrates the complete image processing pipeline
 * Optimized for non-blocking UI with yielding to browser
 */

import type { 
    ProcessingOptions, 
    ProcessingResult, 
    ProgressCallback,
    ProcessingQuality 
} from './types';
import { 
    DEFAULT_PROCESSING_OPTIONS, 
    MAX_PROCESSING_TIME_MS 
} from './config';
import { 
    compressImage, 
    toBlob, 
    validateImage, 
    needsCompression 
} from './imageCompression';
import { removeImageBackground } from './backgroundRemoval';
import { normalizeImage } from './imageNormalization';

/**
 * Yields control to the browser to prevent UI blocking
 * Uses requestAnimationFrame for smooth UI updates
 */
const yieldToBrowser = (): Promise<void> => {
    return new Promise((resolve) => {
        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(() => setTimeout(resolve, 0));
        } else {
            setTimeout(resolve, 0);
        }
    });
};

/**
 * Main processing function - processes a clothing image
 * Complete pipeline: compress → remove background → normalize
 * Guaranteed to complete or timeout within MAX_PROCESSING_TIME_MS
 */
export async function processClothingImage(
    input: File | Blob | string,
    options: ProcessingOptions = {},
    onProgress?: ProgressCallback,
    abortSignal?: AbortSignal
): Promise<ProcessingResult> {
    const startTime = Date.now();
    const opts = { ...DEFAULT_PROCESSING_OPTIONS, ...options };
    
    // Create timeout controller
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
        timeoutController.abort();
    }, opts.timeout || MAX_PROCESSING_TIME_MS);

    // Combine abort signals
    const combinedAbort = () => {
        return abortSignal?.aborted || timeoutController.signal.aborted;
    };

    try {
        onProgress?.('compressing', 0, 'Preparando imagen...');
        
        // Yield to browser to ensure UI updates
        await yieldToBrowser();

        // Step 1: Convert input to Blob
        let inputBlob = await toBlob(input);
        
        if (combinedAbort()) {
            throw new Error('Processing cancelled');
        }
        
        await yieldToBrowser();

        // Step 2: Validate image
        const validation = validateImage(inputBlob);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // Step 3: Compress if needed (critical for speed)
        if (needsCompression(inputBlob)) {
            onProgress?.('compressing', 30, 'Comprimiendo imagen...');
            await yieldToBrowser();
            const compressed = await compressImage(inputBlob, opts.quality || 'fast');
            inputBlob = compressed.blob;
            console.log(`[Processing] Compressed: ${compressed.originalSize} → ${compressed.compressedSize} (${compressed.compressionRatio.toFixed(1)}x)`);
        }

        if (combinedAbort()) {
            throw new Error('Processing cancelled');
        }
        
        await yieldToBrowser();

        // Step 4: Remove background (unless skipped)
        let processedBlob: Blob;
        
        if (opts.skipBackgroundRemoval) {
            processedBlob = inputBlob;
            onProgress?.('removing-background', 100, 'Omitiendo remoción de fondo...');
        } else {
            onProgress?.('removing-background', 0, 'Eliminando fondo...');
            await yieldToBrowser();
            processedBlob = await removeImageBackground(
                inputBlob,
                opts.quality || 'fast',
                onProgress,
                timeoutController.signal
            );
        }

        if (combinedAbort()) {
            throw new Error('Processing cancelled');
        }
        
        await yieldToBrowser();

        // Step 5: Normalize image (crop, center, scale)
        let finalBlob: Blob;
        let finalUrl: string;

        if (opts.normalize) {
            onProgress?.('normalizing', 0, 'Normalizando imagen...');
            await yieldToBrowser();
            const normalized = await normalizeImage(
                processedBlob,
                opts.canvasWidth,
                opts.canvasHeight
            );
            finalBlob = normalized.blob;
            finalUrl = normalized.url;
            onProgress?.('normalizing', 100, 'Normalización completa');
        } else {
            // Convert blob to data URL without normalization
            finalBlob = processedBlob;
            finalUrl = await blobToDataUrl(processedBlob);
        }

        // Clear timeout
        clearTimeout(timeoutId);
        
        await yieldToBrowser();

        const processingTime = Date.now() - startTime;
        console.log(`[Processing] Complete in ${processingTime}ms`);

        onProgress?.('complete', 100, '¡Procesamiento completo!');

        return {
            success: true,
            imageUrl: finalUrl,
            blob: finalBlob,
            processingTime,
        };

    } catch (error) {
        clearTimeout(timeoutId);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('[Processing] Error:', errorMessage);
        
        onProgress?.('error', 0, errorMessage);

        return {
            success: false,
            error: errorMessage,
            processingTime: Date.now() - startTime,
        };
    }
}

/**
 * Simplified function for background removal only
 */
export async function removeBackgroundOnly(
    input: File | Blob | string,
    quality: ProcessingQuality = 'fast'
): Promise<ProcessingResult> {
    return processClothingImage(input, {
        normalize: false,
        quality,
        skipBackgroundRemoval: false,
    });
}

/**
 * Quick processing with minimal options
 */
export async function quickProcess(
    input: File | Blob | string
): Promise<ProcessingResult> {
    return processClothingImage(input, {
        quality: 'fast',
        normalize: true,
    });
}

/**
 * Helper: Convert Blob to data URL
 */
async function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
