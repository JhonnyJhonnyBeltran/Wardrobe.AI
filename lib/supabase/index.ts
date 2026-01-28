/**
 * Supabase Module Exports
 * 
 * Centraliza todas las exportaciones relacionadas con Supabase
 */

// Cliente principal
export { supabase } from './client';

// Storage utilities
export { 
  uploadImage, 
  deleteImage, 
  uploadMultipleImages,
  deleteMultipleImages,
  compressImage,
  isDataUrl,
  isStorageUrl,
  BUCKETS,
  IMAGE_CONFIG,
  type UploadResult,
  type UploadOptions,
  type BucketName,
} from './storage';

// Database types
export type { Database } from './database.types';
