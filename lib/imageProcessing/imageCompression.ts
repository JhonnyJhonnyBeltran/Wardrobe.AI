/**
 * Image Compression Module
 * Pre-processes images to reduce size before AI processing
 * Critical for achieving sub-10-second processing times
 */

import type { CompressionResult, ProcessingQuality } from './types';
import { COMPRESSION_SETTINGS, MAX_INPUT_SIZE_BYTES } from './config';

/**
 * Compresses an image blob to reduce processing time
 * Uses canvas-based compression with configurable quality
 */
export async function compressImage(
    input: Blob,
    quality: ProcessingQuality = 'fast'
): Promise<CompressionResult> {
    const settings = COMPRESSION_SETTINGS[quality];
    const originalSize = input.size;
    
    // Skip compression for small images
    if (originalSize < 100 * 1024 && input.type === 'image/jpeg') {
        return {
            blob: input,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 1,
        };
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(input);

        img.onload = () => {
            try {
                URL.revokeObjectURL(url);
                
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;
                const maxDim = settings.maxDimension;
                
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d', {
                    alpha: true,
                    desynchronized: true, // Performance optimization
                });
                
                if (!ctx) {
                    reject(new Error('Failed to create canvas context'));
                    return;
                }

                // Use better image smoothing for quality
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob with quality setting
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'));
                            return;
                        }

                        resolve({
                            blob,
                            originalSize,
                            compressedSize: blob.size,
                            compressionRatio: originalSize / blob.size,
                        });
                    },
                    'image/jpeg',
                    settings.quality
                );
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image for compression'));
        };

        img.src = url;
    });
}

/**
 * Converts a File or string to a Blob for processing
 */
export async function toBlob(input: File | Blob | string): Promise<Blob> {
    if (input instanceof Blob) {
        return input;
    }

    if (typeof input === 'string') {
        // Handle external URLs via proxy
        if (input.startsWith('http://') || input.startsWith('https://')) {
            const proxyResponse = await fetch('/api/proxy-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: input }),
            });

            if (!proxyResponse.ok) {
                const errorData = await proxyResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Proxy failed: ${proxyResponse.status}`);
            }

            const proxyData = await proxyResponse.json();
            if (!proxyData.success || !proxyData.dataUrl) {
                throw new Error(proxyData.error || 'No image data from proxy');
            }

            const response = await fetch(proxyData.dataUrl);
            return response.blob();
        }

        // Handle data URLs
        const response = await fetch(input);
        return response.blob();
    }

    throw new Error('Invalid input type');
}

/**
 * Determines if compression is needed based on file size
 */
export function needsCompression(blob: Blob): boolean {
    return blob.size > MAX_INPUT_SIZE_BYTES;
}

/**
 * Quick validation of image before processing
 */
export function validateImage(blob: Blob): { valid: boolean; error?: string } {
    // Check file type
    if (!blob.type.startsWith('image/')) {
        return { valid: false, error: 'Invalid file type - must be an image' };
    }

    // Check file size (max 15MB)
    if (blob.size > 15 * 1024 * 1024) {
        return { valid: false, error: 'Image too large - max 15MB' };
    }

    return { valid: true };
}
