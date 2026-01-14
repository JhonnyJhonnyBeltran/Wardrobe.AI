'use client';

/**
 * ColorPicker Component
 * Color selection with predefined options and custom hex picker
 */

import React from 'react';
import { Check } from 'lucide-react';
import { COLOR_OPTIONS } from '../constants';
import type { ColorPickerProps } from '../types';

export function ColorPicker({
    selectedColor,
    selectedHex,
    onColorSelect,
    onHexChange,
}: ColorPickerProps) {
    return (
        <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--foreground)]">
                Color
            </label>

            {/* Predefined color swatches */}
            <div className="grid grid-cols-8 gap-2">
                {COLOR_OPTIONS.map((colorOption) => (
                    <button
                        key={colorOption.hex}
                        type="button"
                        onClick={() => onColorSelect(colorOption)}
                        className={`aspect-square rounded-xl border-2 transition-all relative ${selectedColor === colorOption.name
                                ? 'border-[var(--brand-pink)] ring-2 ring-[var(--brand-pink)]/30 scale-110'
                                : 'border-[var(--border-color)] hover:border-[var(--brand-pink)]/50'
                            }`}
                        style={{ backgroundColor: colorOption.hex }}
                        title={colorOption.name}
                    >
                        {selectedColor === colorOption.name && (
                            <Check
                                className={`w-4 h-4 absolute inset-0 m-auto ${colorOption.hex === '#FFFFFF' || colorOption.hex === '#FFEB3B'
                                        ? 'text-gray-800'
                                        : 'text-white'
                                    }`}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Custom color picker */}
            <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={selectedHex}
                        onChange={(e) => onHexChange(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-[var(--border-color)] cursor-pointer"
                    />
                    <span className="text-xs text-[var(--foreground-tertiary)]">
                        Color personalizado
                    </span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                    <span
                        className="w-6 h-6 rounded-full border border-[var(--border-color)]"
                        style={{ backgroundColor: selectedHex }}
                    />
                    <span className="text-sm text-[var(--foreground)]">
                        {selectedColor || 'Selecciona un color'}
                    </span>
                </div>
            </div>
        </div>
    );
}
