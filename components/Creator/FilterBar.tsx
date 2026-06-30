'use client';

import { Search, Heart, X } from 'lucide-react';
import { useState } from 'react';

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
];

const TYPES = [
    'Todos',
    'Camiseta',
    'Pantalón',
    'Vestido',
    'Chaqueta',
    'Zapatos',
    'Accesorios',
];

export function FilterBar({
    searchQuery,
    onSearchChange,
    selectedColor,
    onColorChange,
    selectedType,
    onTypeChange,
    showFavoritesOnly,
    onFavoritesToggle
}: FilterBarProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);

    return (
        <div className="space-y-3 p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]">
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
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedColor
                            ? 'bg-[var(--brand-pink)] text-white'
                            : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                            }`}
                    >
                        {selectedColor ? (
                            <>
                                <div
                                    className="w-3 h-3 rounded-full border border-white/30"
                                    style={{ backgroundColor: COLORS.find(c => c.value === selectedColor)?.hex }}
                                />
                                {COLORS.find(c => c.value === selectedColor)?.name}
                            </>
                        ) : (
                            'Color'
                        )}
                    </button>

                    {showColorPicker && (
                        <div className="absolute top-full mt-2 left-0 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-lg p-3 z-10 min-w-[200px]">
                            <div className="grid grid-cols-4 gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => {
                                            onColorChange(selectedColor === color.value ? null : color.value);
                                            setShowColorPicker(false);
                                        }}
                                        className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color.value ? 'border-[#FF69B4] scale-110' : 'border-[var(--border-color)]'
                                            }`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Type Filter */}
                <div className="relative">
                    <button
                        onClick={() => setShowTypePicker(!showTypePicker)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedType
                            ? 'bg-[var(--brand-pink)] text-white'
                            : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                            }`}
                    >
                        {selectedType || 'Tipo'}
                    </button>

                    {showTypePicker && (
                        <div className="absolute top-full mt-2 left-0 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-lg p-2 z-10 min-w-[140px]">
                            {TYPES.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        onTypeChange(type === 'Todos' ? null : type);
                                        setShowTypePicker(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${(type === 'Todos' && !selectedType) || selectedType === type
                                        ? 'bg-[var(--brand-pink)] text-white'
                                        : 'text-[var(--foreground)] hover:bg-[var(--background-secondary)]'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Clear Filters */}
                {(searchQuery || selectedColor || selectedType || showFavoritesOnly) && (
                    <button
                        onClick={() => {
                            onSearchChange('');
                            onColorChange(null);
                            onTypeChange(null);
                            if (showFavoritesOnly) onFavoritesToggle();
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors whitespace-nowrap"
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>
        </div>
    );
}
