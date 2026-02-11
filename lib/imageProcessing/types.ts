/**
 * Image Processing Types
 * Centralized type definitions for the image processing module
 */

export interface ProcessingOptions {
    /** Normalize image (center, scale, crop) */
    normalize?: boolean;
    /** Output canvas width in pixels */
    canvasWidth?: number;
    /** Output canvas height in pixels */
    canvasHeight?: number;
    /** Processing quality - affects model selection */
    quality?: ProcessingQuality;
    /** Use transparent background */
    transparentBackground?: boolean;
    /** Max processing time in ms before timeout */
    timeout?: number;
    /** Priority in processing queue (higher = processed first) */
    priority?: number;
    /** Skip background removal (for already processed images) */
    skipBackgroundRemoval?: boolean;
    /** Compression level before processing (0-1, lower = more compression) */
    compressionQuality?: number;
}

export type ProcessingQuality = 'fast' | 'balanced' | 'quality';

export interface ProcessingResult {
    success: boolean;
    imageUrl?: string;
    blob?: Blob;
    error?: string;
    /** Processing time in milliseconds */
    processingTime?: number;
    /** Whether the result came from cache */
    fromCache?: boolean;
}

export interface BatchProcessingResult {
    results: ProcessingResult[];
    totalTime: number;
    successCount: number;
    failureCount: number;
}

export interface QueuedTask {
    id: string;
    input: File | Blob | string;
    options: ProcessingOptions;
    priority: number;
    createdAt: number;
    resolve: (result: ProcessingResult) => void;
    reject: (error: Error) => void;
    abortController?: AbortController;
}

export interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}

export interface CompressionResult {
    blob: Blob;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
}

export interface ModelConfig {
    name: string;
    publicPath: string;
    targetTime: number; // Target processing time in ms
}

export type ProcessingStage = 
    | 'idle'
    | 'compressing'
    | 'loading-model'
    | 'removing-background'
    | 'normalizing'
    | 'complete'
    | 'error';

export interface ProgressCallback {
    (stage: ProcessingStage, progress: number, message?: string): void;
}
