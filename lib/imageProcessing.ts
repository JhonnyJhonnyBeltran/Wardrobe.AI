/**
 * Image Processing Module - Re-export from modular structure
 * 
 * This file maintains backwards compatibility while the actual
 * implementation has been split into a modular structure at:
 * ./imageProcessing/
 * 
 * @deprecated Import directly from '@/lib/imageProcessing' which now uses
 * the optimized modular implementation
 */

// Re-export everything from the new modular structure
export * from './imageProcessing/index';
