/**
 * Background Removal Module
 * Optimized wrapper for @imgly/background-removal
 * Uses Web Worker for non-blocking processing
 */

import { removeBackground, type Config } from '@imgly/background-removal';
import type { ProcessingQuality, ProgressCallback } from './types';
import { MODEL_CONFIGS } from './config';

/** Cache for loaded models to avoid reloading */
let modelLoadedQuality: ProcessingQuality | null = null;

/**
 * Removes background from an image using AI
 * Uses Web Worker to prevent UI blocking
 */
export async function removeImageBackground(
    inputBlob: Blob,
    quality: ProcessingQuality = 'fast',
    onProgress?: ProgressCallback,
    abortSignal?: AbortSignal
): Promise<Blob> {
    const modelConfig = MODEL_CONFIGS[quality];
    
    onProgress?.('loading-model', 0, 'Cargando modelo IA...');

    const result = await performBackgroundRemoval(
        inputBlob,
        modelConfig,
        onProgress,
        abortSignal
    );
    
    modelLoadedQuality = quality;
    return result;
}

/**
 * Internal function to perform the actual background removal
 * Uses proxyToWorker to run in Web Worker and prevent UI blocking
 */
async function performBackgroundRemoval(
    inputBlob: Blob,
    modelConfig: { name: string; publicPath: string },
    onProgress?: ProgressCallback,
    abortSignal?: AbortSignal
): Promise<Blob> {
    // Track progress stages
    let lastProgressUpdate = 0;
    
    try {
        // Use fp16 model for better quality
        const config: Config = {
            model: 'isnet_fp16', // Always use best model
            publicPath: modelConfig.publicPath,
            debug: false,
            // CRITICAL: Run in Web Worker to prevent UI blocking
            proxyToWorker: true,
            progress: (key: string, current: number, total: number) => {
                // Throttle progress updates to avoid excessive re-renders
                const now = Date.now();
                if (now - lastProgressUpdate < 50) return;
                lastProgressUpdate = now;

                const progress = Math.round((current / total) * 100);
                
                if (key.includes('fetch') || key.includes('load')) {
                    onProgress?.('loading-model', progress, 'Descargando modelo...');
                } else if (key.includes('inference') || key.includes('process')) {
                    onProgress?.('removing-background', progress, 'Procesando imagen...');
                }
            },
            output: {
                format: 'image/png',
                quality: 1.0, // Maximum quality
            },
        };

        const result = await removeBackground(inputBlob, config);

        // Check if aborted during processing
        if (abortSignal?.aborted) {
            throw new Error('Processing cancelled');
        }

        onProgress?.('removing-background', 100, 'Fondo eliminado');
        return result;
    } catch (error) {
        onProgress?.('error', 0, 'Error al eliminar fondo');
        throw error;
    }
}

/**
 * Preloads the AI model in the background
 * Call this on app initialization for instant processing later
 * Simplified: just run minimal inference to trigger model download
 */
export async function preloadModel(quality: ProcessingQuality = 'fast'): Promise<void> {
    if (modelLoadedQuality === quality) {
        return;
    }
    
    // Create a tiny 1x1 image to trigger model loading
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#808080'; // Gray pixel
    ctx.fillRect(0, 0, 1, 1);
    
    return new Promise((resolve) => {
        // Safety timeout - resolve after 20 seconds no matter what
        const safetyTimeout = setTimeout(() => {
            resolve();
        }, 20000);
        
        canvas.toBlob(async (blob) => {
            if (!blob) {
                clearTimeout(safetyTimeout);
                resolve();
                return;
            }

            try {
                await removeImageBackground(blob, quality);
                modelLoadedQuality = quality;
            } catch {
                // Ignore errors during preload
            }
            clearTimeout(safetyTimeout);
            resolve();
        }, 'image/png');
    });
}

/**
 * Checks if a model is already loaded
 */
export function isModelLoaded(quality?: ProcessingQuality): boolean {
    if (!quality) return modelLoadedQuality !== null;
    return modelLoadedQuality === quality;
}
