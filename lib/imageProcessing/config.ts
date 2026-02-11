/**
 * Image Processing Configuration
 * Centralized configuration for optimal performance
 */

import type { ProcessingQuality, ModelConfig } from './types';

/** Maximum processing time before timeout (20 seconds for quality model) */
export const MAX_PROCESSING_TIME_MS = 20000;

/** Default canvas dimensions (larger for better quality) */
export const DEFAULT_CANVAS_WIDTH = 1200;
export const DEFAULT_CANVAS_HEIGHT = 1500;

/** Maximum image dimension before pre-compression */
export const MAX_INPUT_DIMENSION = 1400;

/** Maximum file size before aggressive compression (2MB) */
export const MAX_INPUT_SIZE_BYTES = 2 * 1024 * 1024;

/** Concurrent processing limit */
export const MAX_CONCURRENT_PROCESSING = 2;

/** Model CDN base URL */
export const MODEL_CDN_BASE = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/';

/**
 * Model configurations by quality level
 * Using lighter models for faster processing
 */
export const MODEL_CONFIGS: Record<ProcessingQuality, ModelConfig> = {
    // Fastest option - quantized model (~3-5s processing)
    fast: {
        name: 'isnet_quint8',
        publicPath: MODEL_CDN_BASE,
        targetTime: 5000,
    },
    // Balanced option - slightly better quality (~5-8s processing)
    balanced: {
        name: 'isnet_quint8',
        publicPath: MODEL_CDN_BASE,
        targetTime: 8000,
    },
    // Best quality - FP16 model (~10-20s processing)
    quality: {
        name: 'isnet_fp16',
        publicPath: MODEL_CDN_BASE,
        targetTime: 20000,
    },
};

/** Default processing options */
export const DEFAULT_PROCESSING_OPTIONS = {
    normalize: true,
    canvasWidth: DEFAULT_CANVAS_WIDTH,
    canvasHeight: DEFAULT_CANVAS_HEIGHT,
    quality: 'quality' as ProcessingQuality,
    transparentBackground: true,
    timeout: MAX_PROCESSING_TIME_MS,
    priority: 0,
    skipBackgroundRemoval: false,
    compressionQuality: 0.85,
};

/** Compression quality settings by target quality */
export const COMPRESSION_SETTINGS: Record<ProcessingQuality, { quality: number; maxDimension: number }> = {
    fast: { quality: 0.75, maxDimension: 1024 },
    balanced: { quality: 0.85, maxDimension: 1400 },
    quality: { quality: 0.92, maxDimension: 1600 },
};

/** Processing stage messages for UI */
export const STAGE_MESSAGES: Record<string, string> = {
    idle: 'Preparando...',
    compressing: 'Optimizando imagen...',
    'loading-model': 'Cargando modelo IA...',
    'removing-background': 'Eliminando fondo...',
    normalizing: 'Normalizando...',
    complete: '¡Listo!',
    error: 'Error en procesamiento',
};
