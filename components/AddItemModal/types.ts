/**
 * AddItemModal Types
 * Type definitions for the AddItemModal component and subcomponents
 */

import type { ClothingItem } from '@/types/clothing';

// Main modal props
export interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: Partial<ClothingItem>) => void | Promise<void>;
    initialData?: ClothingItem;
    isEditing?: boolean;
}

// Form data state
export interface ItemFormData {
    name: string;
    brand: string;
    type: string;
    color: string;
    colorHex: string;
    size: string;
    reference: string;
    fabric: string;
    season: string;
    sourceUrl: string;
}

// Dropdown with custom input props
export interface DropdownWithCustomProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    customOptionLabel?: string;
}

// Custom select (value/label pairs) props
export interface SelectOption {
    value: string;
    label: string;
}

export interface CustomSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
}

// Color option type
export interface ColorOption {
    name: string;
    hex: string;
}

// Image uploader props
export interface ImageUploaderProps {
    image: string | null;
    isProcessing: boolean;
    processingMessage: string;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRotate: (degrees: number) => void;
    onScale?: (scale: number) => void;
    currentScale?: number;
}

// Image selector (for scraped images) props
export interface ImageSelectorProps {
    images: string[];
    selectedIndex: number | null;
    isProcessing: boolean;
    processingMessage: string;
    processedImage: string | null;
    onSelectImage: (imageUrl: string, index: number) => void;
    onRotate: (degrees: number) => void;
}

// Color picker props
export interface ColorPickerProps {
    selectedColor: string;
    selectedHex: string;
    onColorSelect: (color: { name: string; hex: string }) => void;
    onHexChange: (hex: string) => void;
}

// Form mode
export type FormMode = 'quick' | 'complete';
export type InputMethod = 'upload' | 'url';
