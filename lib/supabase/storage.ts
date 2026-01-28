/**
 * Storage Utilities
 * 
 * Módulo para gestionar imágenes en Supabase Storage.
 * Proporciona funciones de alta abstracción para subir, eliminar y manipular imágenes.
 * 
 * Características:
 * - Compresión automática a WebP
 * - Redimensionado manteniendo aspect ratio
 * - Soporte para File, Blob y Data URLs (base64)
 * - Limpieza automática de recursos (memory leaks prevention)
 * 
 * @module lib/supabase/storage
 */

import { supabase } from './client';

// ============================================
// CONSTANTS
// ============================================

export const BUCKETS = {
  CLOTHING: 'clothing-images',
  AVATARS: 'avatars',
  OUTFITS: 'outfits',
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

/**
 * Configuración por defecto para imágenes
 * Centralizado para fácil modificación
 */
export const IMAGE_CONFIG = {
  /** Calidad de compresión por defecto (0-1) */
  DEFAULT_QUALITY: 0.85,
  /** Ancho máximo por defecto */
  DEFAULT_MAX_WIDTH: 1200,
  /** Alto máximo por defecto */
  DEFAULT_MAX_HEIGHT: 1200,
  /** Formato de salida */
  OUTPUT_FORMAT: 'image/webp' as const,
  /** Extensión de archivo */
  OUTPUT_EXTENSION: 'webp',
} as const;

// ============================================
// TYPES
// ============================================

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface UploadOptions {
  /** Carpeta dentro del bucket (ej: userId) */
  folder?: string;
  /** Nombre personalizado del archivo (sin extensión) */
  fileName?: string;
  /** Calidad de compresión (0-1) para imágenes */
  quality?: number;
  /** Ancho máximo para redimensionar */
  maxWidth?: number;
  /** Alto máximo para redimensionar */
  maxHeight?: number;
  /** Tipo MIME forzado */
  contentType?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convierte un Data URL (base64) a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Genera un nombre único para el archivo
 */
export function generateFileName(prefix: string = 'img'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Obtiene la extensión del tipo MIME
 */
export function getExtensionFromMime(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return extensions[mimeType] || 'png';
}

/**
 * Comprime una imagen antes de subir
 */
export async function compressImage(
  blob: Blob,
  options: { quality?: number; maxWidth?: number; maxHeight?: number } = {}
): Promise<Blob> {
  const { quality = 0.85, maxWidth = 1200, maxHeight = 1200 } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Redimensionar si es necesario manteniendo aspect ratio
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(blob);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (newBlob) => {
          // Limpiar Object URL para evitar memory leaks
          URL.revokeObjectURL(img.src);
          resolve(newBlob || blob);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(blob);
    };
    
    const objectUrl = URL.createObjectURL(blob);
    img.src = objectUrl;
  });
}

// ============================================
// MAIN UPLOAD FUNCTION
// ============================================

/**
 * Sube una imagen a Supabase Storage
 * Acepta: File, Blob, o Data URL (base64)
 * 
 * @example
 * // Subir desde base64
 * const result = await uploadImage(dataUrl, BUCKETS.CLOTHING, { folder: userId });
 * 
 * @example
 * // Subir desde File input
 * const result = await uploadImage(file, BUCKETS.AVATARS, { maxWidth: 400 });
 */
export async function uploadImage(
  image: File | Blob | string,
  bucket: BucketName,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { 
    folder, 
    fileName, 
    quality = IMAGE_CONFIG.DEFAULT_QUALITY, 
    maxWidth = IMAGE_CONFIG.DEFAULT_MAX_WIDTH, 
    maxHeight = IMAGE_CONFIG.DEFAULT_MAX_HEIGHT 
  } = options;

  try {
    // 1. Convertir a Blob si es necesario
    let blob: Blob;
    
    if (typeof image === 'string') {
      // Es un Data URL (base64)
      if (!image.startsWith('data:')) {
        return { success: false, error: 'URL inválida. Se esperaba un Data URL.' };
      }
      blob = dataUrlToBlob(image);
    } else {
      blob = image;
    }

    // 2. Comprimir imagen
    const compressedBlob = await compressImage(blob, { quality, maxWidth, maxHeight });

    // 3. Generar nombre de archivo
    const extension = IMAGE_CONFIG.OUTPUT_EXTENSION;
    const name = fileName || generateFileName();
    const filePath = folder ? `${folder}/${name}.${extension}` : `${name}.${extension}`;

    // 4. Subir a Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedBlob, {
        contentType: IMAGE_CONFIG.OUTPUT_FORMAT,
        upsert: true, // Sobrescribir si existe
      });

    if (error) {
      console.error('[Storage] Upload error:', error);
      return { success: false, error: error.message };
    }

    // 5. Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    console.log('[Storage] Uploaded successfully:', urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('[Storage] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// ============================================
// DELETE FUNCTION
// ============================================

/**
 * Elimina una imagen de Supabase Storage
 */
export async function deleteImage(
  pathOrUrl: string,
  bucket: BucketName
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extraer el path si es una URL completa
    let path = pathOrUrl;
    
    if (pathOrUrl.includes('supabase.co')) {
      // Es una URL completa, extraer el path
      const match = pathOrUrl.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
      if (match) {
        path = match[1];
      }
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('[Storage] Delete error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Storage] Deleted successfully:', path);
    return { success: true };
  } catch (error) {
    console.error('[Storage] Delete unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Sube múltiples imágenes
 */
export async function uploadMultipleImages(
  images: Array<File | Blob | string>,
  bucket: BucketName,
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const results = await Promise.all(
    images.map((img, index) =>
      uploadImage(img, bucket, {
        ...options,
        fileName: options.fileName ? `${options.fileName}_${index}` : undefined,
      })
    )
  );
  return results;
}

/**
 * Elimina múltiples imágenes
 */
export async function deleteMultipleImages(
  paths: string[],
  bucket: BucketName
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// ============================================
// UTILITY EXPORTS
// ============================================

/**
 * Verifica si una URL es de Supabase Storage
 */
export function isStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage');
}

/**
 * Verifica si una URL es un Data URL (base64)
 */
export function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}
