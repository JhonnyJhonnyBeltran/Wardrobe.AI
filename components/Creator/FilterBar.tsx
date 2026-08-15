'use client';

import { Search, Heart, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedColor: string | null;
    onColorChange: (color: string | null) => void;
    selectedType: string | null;
    onTypeChange: (type: string | null) => void;
    showFavoritesOnly: boolean;
    onFavoritesToggle: () => void;
}

const COLORS = [
    { name: 'Rojo', value: 'red', hex: '#EF4444' },
    { name: 'Azul', value: 'blue', hex: '#3B82F6' },
    { name: 'Verde', value: 'green', hex: '#10B981' },
    { name: 'Amarillo', value: 'yellow', hex: '#F59E0B' },
    { name: 'Negro', value: 'black', hex: '#000000' },
    { name: 'Blanco', value: 'white', hex: '#FFFFFF' },
    { name: 'Rosa', value: 'pink', hex: '#EC4899' },
    { name: 'Morado', value: 'purple', hex: '#A855F7' },
    { name: 'Naranja', value: 'orange', hex: '#F97316' },
    { name: 'Gris', value: 'gray', hex: '#6B7280' },
    { name: 'Marrón', value: 'brown', hex: '#8B4513' },
    { name: 'Beige', value: 'beige', hex: '#F5F5DC' },
    { name: 'Granate', value: 'maroon', hex: '#800000' },
    { name: 'Celeste', value: 'lightblue', hex: '#87CEEB' },
    { name: 'Cian', value: 'cyan', hex: '#06B6D4' },
    { name: 'Caqui', value: 'khaki', hex: '#C3B091' },
];

const TYPES = [
    'Todos',
    'Camiseta',
    'Pantalón',
    'Vestido',
    'Chaqueta',
    'Jersey',
    'Sudadera',
    'Abrigo',
    'Falda',
    'Shorts',
    'Zapatos',
    'Accesorios',
];

export function FilterBar({
    searchQuery,
    onSearchChange,
    selectedColors,
    onColorsChange,
    selectedTypes,
    onTypesChange,
    showFavoritesOnly,
    onFavoritesToggle
}: {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedColors: string[];
    onColorsChange: (colors: string[]) => void;
    selectedTypes: string[];
    onTypesChange: (types: string[]) => void;
    showFavoritesOnly: boolean;
    onFavoritesToggle: () => void;
}) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowColorPicker(false);
                setShowTypePicker(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="space-y-3 p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                <input
                    type="text"
                    placeholder="Buscar prendas..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[var(--background-secondary)] rounded-xl text-sm outline-none text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)]"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)]"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2 pb-1">
                {/* Favorites Toggle */}
                <button
                    onClick={onFavoritesToggle}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${showFavoritesOnly
                        ? 'bg-[var(--brand-pink)] text-white'
                        : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                        }`}
                >
                    <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                    Favoritos
                </button>

                {/* Color Filter */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowColorPicker(!showColorPicker);
                            if (!showColorPicker) setShowTypePicker(false);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]`}
                    >
                        Color +
                    </button>

                    {showColorPicker && (
                        <div className="absolute top-full mt-2 left-0 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-lg p-3 z-50 min-w-[200px] max-h-[250px] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-4 gap-2">
                                {COLORS.map((color) => {
                                    const isSelected = selectedColors.includes(color.value);
                                    return (
                                        <button
                                            key={color.value}
                                            onClick={() => {
                                                if (isSelected) {
                                                    onColorsChange(selectedColors.filter(c => c !== color.value));
                                                } else {
                                                    onColorsChange([...selectedColors, color.value]);
                                                }
                                            }}
                                            className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${isSelected ? 'border-[#FF69B4] scale-110' : 'border-[var(--border-color)]'
                                                }`}
                                            style={{ backgroundColor: color.hex }}
                                            title={color.name}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Color Pills */}
                {selectedColors.map(colorValue => {
                    const c = COLORS.find(c => c.value === colorValue);
                    if (!c) return null;
                    return (
                        <button
                            key={c.value}
                            onClick={() => onColorsChange(selectedColors.filter(v => v !== c.value))}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-[var(--brand-pink)] text-white hover:bg-[#ff3377] transition-colors"
                        >
                            <div className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: c.hex }} />
                            {c.name}
                            <X className="w-3 h-3 ml-0.5" />
                        </button>
                    );
                })}

                {/* Type Filter */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowTypePicker(!showTypePicker);
                            if (!showTypePicker) setShowColorPicker(false);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]`}
                    >
                        Tipo +
                    </button>

                    {showTypePicker && (
                        <div className="absolute top-full mt-2 left-0 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-lg p-2 z-50 min-w-[140px] max-h-[250px] overflow-y-auto custom-scrollbar">
                            {TYPES.map((type) => {
                                const isSelected = selectedTypes.includes(type);
                                const isTodos = type === 'Todos';
                                return (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            if (isTodos) {
                                                onTypesChange([]);
                                                setShowTypePicker(false);
                                                return;
                                            }
                                            if (isSelected) {
                                                onTypesChange(selectedTypes.filter(t => t !== type));
                                            } else {
                                                onTypesChange([...selectedTypes, type]);
                                            }
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${(isTodos && selectedTypes.length === 0) || isSelected
                                            ? 'bg-[var(--brand-pink)] text-white'
                                            : 'text-[var(--foreground)] hover:bg-[var(--background-secondary)]'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Active Type Pills */}
                {selectedTypes.map(typeValue => (
                    <button
                        key={typeValue}
                        onClick={() => onTypesChange(selectedTypes.filter(v => v !== typeValue))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-[var(--brand-pink)] text-white hover:bg-[#ff3377] transition-colors"
                    >
                        {typeValue}
                        <X className="w-3 h-3 ml-0.5" />
                    </button>
                ))}

                {/* Clear Filters */}
                {(searchQuery || selectedColors.length > 0 || selectedTypes.length > 0 || showFavoritesOnly) && (
                    <button
                        onClick={() => {
                            onSearchChange('');
                            onColorsChange([]);
                            onTypesChange([]);
                            if (showFavoritesOnly) onFavoritesToggle();
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors whitespace-nowrap"
                    >
                        Limpiar
                    </button>
                )}
            </div>
        </div>
    );
}
