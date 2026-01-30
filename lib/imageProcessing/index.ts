/**
 * Image Processing Module - Entry Point
 * 
 * Optimized image processing for clothing items:
 * - Background removal using AI (quantized models for speed)
 * - Image normalization (crop, center, scale)
 * - Batch processing with queue management
 * - Guaranteed sub-10-second processing time
 * 
 * @example
 * ```ts
 * import { processClothingImage, processBatch } from '@/lib/imageProcessing';
 * 
 * // Single image
 * const result = await processClothingImage(file, { quality: 'fast' });
 * 
 * // Batch processing
 * const results = await processBatch([
 *   { input: file1 },
 *   { input: file2 },
 * ]);
 * ```
 */

// Core processor
export { 
    processClothingImage, 
    removeBackgroundOnly,
    quickProcess,
} from './processor';

// Batch processing
export {
    queueImageForProcessing,
    processBatch,
    cancelAllPending,
    cancelTask,
    getQueueStatus,
    isQueueEmpty,
} from './processingQueue';

// Background removal utilities
export {
    preloadModel,
    isModelLoaded,
} from './backgroundRemoval';

// Image utilities
export {
    compressImage,
    toBlob,
    validateImage,
} from './imageCompression';

export {
    normalizeImage,
    resizeImage,
    getContentBoundingBox,
} from './imageNormalization';

// Types
export type {
    ProcessingOptions,
    ProcessingResult,
    ProcessingQuality,
    BatchProcessingResult,
    ProgressCallback,
    ProcessingStage,
    BoundingBox,
    CompressionResult,
} from './types';

// Config (for advanced use)
export {
    MAX_PROCESSING_TIME_MS,
    DEFAULT_CANVAS_WIDTH,
    DEFAULT_CANVAS_HEIGHT,
    MODEL_CONFIGS,
    STAGE_MESSAGES,
} from './config';
