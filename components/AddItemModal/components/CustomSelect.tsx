'use client';

/**
 * CustomSelect Component
 * A styled select for value/label option pairs (categories, seasons, etc.)
 *
 * UX improvements:
 * - Smooth spring scaleY+fade animation from the trigger
 * - Auto-detects available space and opens upward when needed
 * - Scroll-indicator gradients
 * - Search functionality
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';
import type { CustomSelectProps } from '../types';

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

export function CustomSelect({ label, value, onChange, options }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
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
            requestAnimationFrame(updateScrollIndicators);
        } else {
            setSearchTerm('');
        }
    }, [isOpen, updateScrollIndicators]);

    // ── Open direction ─────────────────────────────────────────────────────

    const calculateOpenDirection = useCallback(() => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const DROPDOWN_HEIGHT = 280;
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

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleToggle = () => {
        calculateOpenDirection();
        setIsOpen((prev) => !prev);
    };

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="space-y-1 relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-[var(--foreground)]">
                {label}
            </label>

            {/* Trigger button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={handleToggle}
                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-left flex items-center justify-between text-sm hover:border-[var(--brand-pink)] transition-colors"
            >
                <span className={selectedOption ? 'text-[var(--foreground)]' : 'text-[var(--foreground-tertiary)]'}>
                    {selectedOption?.label || 'Seleccionar...'}
                </span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="flex-shrink-0"
                >
                    <ChevronDown className="w-4 h-4 text-[var(--foreground-tertiary)]" />
                </motion.span>
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="custom-select-panel"
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
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                                            value === option.value
                                                ? 'text-[var(--brand-pink)] font-semibold bg-[var(--brand-pink)]/5'
                                                : 'text-[var(--foreground)] hover:bg-[var(--background-secondary)]'
                                        }`}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {value === option.value && (
                                            <Check className="w-4 h-4 flex-shrink-0" />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-[var(--foreground-tertiary)] text-center">
                                    No se encontraron resultados
                                </div>
                            )}
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
