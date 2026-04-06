'use client';

/**
 * DropdownWithCustom Component
 * A dropdown with predefined options + free-text custom input.
 *
 * UX improvements:
 * - Smooth scale+fade animation originating from the trigger button
 * - Auto-detects available space: opens upward when there isn't enough room below
 * - Scroll-indicator gradients so users know more options exist
 * - Search functionality to quickly filter options
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, Plus } from 'lucide-react';
import type { DropdownWithCustomProps } from '../types';
import { normalizeBrand } from '@/lib/utils/string';

// ─── Shared animation config ─────────────────────────────────────────────────

function dropdownVariants(openUpward: boolean) {
    return {
        hidden: {
            opacity: 0,
            scaleY: 0.85,
            y: openUpward ? 6 : -6,
        },
        visible: {
            opacity: 1,
            scaleY: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 380,
                damping: 28,
                mass: 0.6,
            },
        },
        exit: {
            opacity: 0,
            scaleY: 0.85,
            y: openUpward ? 6 : -6,
            transition: {
                duration: 0.15,
                ease: 'easeIn' as const,
            },
        },
    };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DropdownWithCustom({
    label,
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    customOptionLabel = 'Otro...',
}: DropdownWithCustomProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customValue, setCustomValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(opt => {
        const normalizedOpt = normalizeBrand(opt).toLowerCase();
        const normalizedSearch = normalizeBrand(searchTerm).toLowerCase();
        return normalizedOpt.includes(normalizedSearch);
    });

    const exactMatch = options.some(opt => 
        normalizeBrand(opt).toLowerCase() === normalizeBrand(searchTerm).toLowerCase()
    );

    // ── Scroll indicators ──────────────────────────────────────────────────

    const updateScrollIndicators = useCallback(() => {
        if (!listRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        setCanScrollUp(scrollTop > 5);
        setCanScrollDown(scrollTop < scrollHeight - clientHeight - 5);
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Defer so the DOM is painted before measuring
            requestAnimationFrame(updateScrollIndicators);
        } else {
            setSearchTerm(''); // Reset search when closed
        }
    }, [isOpen, updateScrollIndicators]);

    // ── Open direction ─────────────────────────────────────────────────────

    const calculateOpenDirection = useCallback(() => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const DROPDOWN_HEIGHT = 280; // adjusted for search input
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setOpenUpward(spaceBelow < DROPDOWN_HEIGHT && spaceAbove > DROPDOWN_HEIGHT);
    }, []);

    // ── Outside click ──────────────────────────────────────────────────────

    useEffect(() => {
        const close = (e: MouseEvent | TouchEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', close);
        document.addEventListener('touchstart', close, { passive: true });
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('touchstart', close);
        };
    }, []);

    // ── Custom input auto-focus ────────────────────────────────────────────

    useEffect(() => {
        if (showCustomInput) inputRef.current?.focus();
    }, [showCustomInput]);

    // ── Initialise custom value when editing ───────────────────────────────

    const isCustomValue = value && !options.includes(value) && value !== customOptionLabel;

    useEffect(() => {
        if (isCustomValue) {
            setCustomValue(value);
            setShowCustomInput(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Handlers ───────────────────────────────────────────────────────────

    const handleToggle = () => {
        calculateOpenDirection();
        setIsOpen((prev) => !prev);
    };

    const handleSelectOption = (selected: string) => {
        if (selected === customOptionLabel) {
            setShowCustomInput(true);
            onChange('');
        } else {
            onChange(selected);
            setShowCustomInput(false);
            setCustomValue('');
        }
        setIsOpen(false);
    };

    const handleCustomChange = (val: string) => {
        setCustomValue(val);
        onChange(val);
    };

    const handleAddNew = () => {
        const normalized = normalizeBrand(searchTerm);
        if (!normalized) return;
        onChange(normalized);
        setSearchTerm('');
        setIsOpen(false);
    };

    const displayValue = showCustomInput ? customValue || placeholder : value || placeholder;
    const hasValue = showCustomInput ? !!customValue : !!value;

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="space-y-1 relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-[var(--foreground)]">
                {label}
            </label>

            {showCustomInput ? (
                // ── Free-text input ──
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={customValue}
                        onChange={(e) => handleCustomChange(e.target.value)}
                        placeholder={`Escribe ${label.toLowerCase()}...`}
                        className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] text-sm transition-shadow"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setShowCustomInput(false);
                            setCustomValue('');
                            onChange('');
                        }}
                        className="px-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] transition-colors text-sm"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                // ── Trigger button ──
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={handleToggle}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-left flex items-center justify-between text-sm hover:border-[var(--brand-pink)] transition-colors"
                >
                    <span className={hasValue ? 'text-[var(--foreground)]' : 'text-[var(--foreground-tertiary)]'}>
                        {displayValue}
                    </span>
                    <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="flex-shrink-0"
                    >
                        <ChevronDown className="w-4 h-4 text-[var(--foreground-tertiary)]" />
                    </motion.span>
                </button>
            )}

            {/* ── Dropdown panel ── */}
            <AnimatePresence>
                {isOpen && !showCustomInput && (
                    <motion.div
                        key="dropdown-panel"
                        variants={dropdownVariants(openUpward)}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{
                            originY: openUpward ? 1 : 0,
                            width: dropdownRef.current?.offsetWidth,
                        }}
                        className={`absolute z-[200] w-full rounded-2xl bg-[var(--background)] border border-[var(--border-color)] shadow-xl overflow-hidden will-change-transform flex flex-col ${
                            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
                        }`}
                    >
                        {/* Search Input Container */}
                        <div className="p-2 border-b border-[var(--border-color)] bg-[var(--background)]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/30"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        {/* Scroll-up gradient */}
                        <AnimatePresence>
                            {canScrollUp && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="absolute top-[53px] left-0 right-0 h-7 bg-gradient-to-b from-[var(--background)] to-transparent pointer-events-none z-10"
                                />
                            )}
                        </AnimatePresence>

                        {/* Options list */}
                        <div
                            ref={listRef}
                            onScroll={updateScrollIndicators}
                            className="max-h-[220px] overflow-auto hide-scrollbar py-1"
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleSelectOption(option)}
                                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                                            value === option
                                                ? 'text-[var(--brand-pink)] font-semibold bg-[var(--brand-pink)]/5'
                                                : 'text-[var(--foreground)] hover:bg-[var(--background-secondary)]'
                                        }`}
                                    >
                                        <span className="truncate">{option}</span>
                                        {value === option && <Check className="w-4 h-4 flex-shrink-0" />}
                                    </button>
                                ))
                            ) : searchTerm.trim() !== '' && !exactMatch ? (
                                <button
                                    type="button"
                                    onClick={handleAddNew}
                                    className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 text-[var(--brand-pink)] hover:bg-[var(--brand-pink)]/5 transition-colors font-medium border-b border-[var(--border-color)]/50"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs opacity-70">Añadir nueva marca</span>
                                        <span className="font-bold">"{normalizeBrand(searchTerm)}"</span>
                                    </div>
                                </button>
                            ) : (
                                <div className="px-4 py-3 text-sm text-[var(--foreground-tertiary)] text-center">
                                    No se encontraron resultados
                                </div>
                            )}

                            {/* Custom option */}
                            <button
                                type="button"
                                onClick={() => handleSelectOption(customOptionLabel)}
                                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-[var(--background-secondary)] transition-colors border-t border-[var(--border-color)] text-[var(--foreground-secondary)] italic mt-1"
                            >
                                {customOptionLabel}
                            </button>
                        </div>

                        {/* Scroll-down gradient */}
                        <AnimatePresence>
                            {canScrollDown && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none z-10"
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
