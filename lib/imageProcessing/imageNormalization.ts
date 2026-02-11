/**
 * Image Normalization Module
 * Handles cropping, centering, and scaling of processed images
 * Optimized for performance with minimal canvas operations
 */

import type { BoundingBox } from './types';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from './config';

/**
 * Detects the bounding box of non-transparent pixels
 * Uses optimized sampling for large images
 */
export function getContentBoundingBox(imageData: ImageData): BoundingBox | null {
    const { data, width, height } = imageData;
    
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let hasContent = false;

    // Sample every pixel for accuracy (needed for precise cropping)
    const alphaThreshold = 20;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const alpha = data[idx + 3];

            if (alpha > alphaThreshold) {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
                hasContent = true;
            }
        }
    }

    if (!hasContent) return null;

    // Add small margin to prevent edge clipping
    const margin = 2;
    minX = Math.max(0, minX - margin);
    minY = Math.max(0, minY - margin);
    maxX = Math.min(width - 1, maxX + margin);
    maxY = Math.min(height - 1, maxY + margin);

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

/**
 * Normalizes an image: crops to content, centers, and scales
 * Returns both blob and data URL for flexibility
 */
export async function normalizeImage(
    imageBlob: Blob,
    canvasWidth = DEFAULT_CANVAS_WIDTH,
    canvasHeight = DEFAULT_CANVAS_HEIGHT
): Promise<{ blob: Blob; url: string }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(imageBlob);

        img.onload = () => {
            try {
                URL.revokeObjectURL(url);
                
                // Create temporary canvas to analyze image
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                
                const tempCtx = tempCanvas.getContext('2d', { 
                    willReadFrequently: true,
                    alpha: true,
                });

                if (!tempCtx) {
                    reject(new Error('Failed to create canvas context'));
                    return;
                }

                tempCtx.drawImage(img, 0, 0);
                const imageData = tempCtx.getImageData(0, 0, img.width, img.height);

                // Get content bounding box
                const bbox = getContentBoundingBox(imageData);
                if (!bbox) {
                    reject(new Error('No content detected in image'));
                    return;
                }

                // Create final canvas
                const canvas = document.createElement('canvas');
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                
                const ctx = canvas.getContext('2d', { alpha: true });
                if (!ctx) {
                    reject(new Error('Failed to create canvas context'));
                    return;
                }

                // Calculate scale to fit content within canvas with minimal padding
                // Use smaller padding to maximize clothing size
                const padding = 20; // Reduced from 40 for larger items
                const maxWidth = canvasWidth - padding * 2;
                const maxHeight = canvasHeight - padding * 2;

                // Calculate the scale needed to fill the canvas
                // Remove the 1.5 limit to allow proper scaling of small items
                const scaleToFitWidth = maxWidth / bbox.width;
                const scaleToFitHeight = maxHeight / bbox.height;
                
                // Use the smaller scale to ensure it fits, but allow larger scaling
                // This ensures items fill the canvas appropriately
                const scale = Math.min(scaleToFitWidth, scaleToFitHeight);

                const scaledWidth = bbox.width * scale;
                const scaledHeight = bbox.height * scale;

                // Center the content
                const offsetX = (canvasWidth - scaledWidth) / 2;
                const offsetY = (canvasHeight - scaledHeight) / 2;

                // Enable high-quality scaling
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw cropped and scaled content
                ctx.drawImage(
                    tempCanvas,
                    bbox.minX, bbox.minY, bbox.width, bbox.height,
                    offsetX, offsetY, scaledWidth, scaledHeight
                );

                // Convert to PNG data URL
                const dataUrl = canvas.toDataURL('image/png', 0.95);

                // Also create blob for storage
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve({ blob, url: dataUrl });
                        } else {
                            // Fallback: use data URL to create blob
                            fetch(dataUrl)
                                .then(res => res.blob())
                                .then(b => resolve({ blob: b, url: dataUrl }))
                                .catch(reject);
                        }
                    },
                    'image/png',
                    0.95
                );

            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image for normalization'));
        };

        img.src = url;
    });
}

/**
 * Quick resize without normalization (for thumbnails)
 */
export async function resizeImage(
    imageBlob: Blob,
    maxWidth: number,
    maxHeight: number
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(imageBlob);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to create context'));
                return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Failed to create blob'));
                },
                'image/png'
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}
