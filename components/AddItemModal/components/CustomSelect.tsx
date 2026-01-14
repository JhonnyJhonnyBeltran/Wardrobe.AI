'use client';

/**
 * CustomSelect Component
 * A styled select for value/label option pairs (like categories, seasons)
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import type { CustomSelectProps } from '../types';

export function CustomSelect({ label, value, onChange, options }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Check scroll position to show/hide gradient indicators
    const handleScroll = () => {
        if (listRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;
            setCanScrollUp(scrollTop > 5);
            setCanScrollDown(scrollTop < scrollHeight - clientHeight - 5);
        }
    };

    // Initialize scroll state when dropdown opens
    useEffect(() => {
        if (isOpen && listRef.current) {
            handleScroll();
        }
    }, [isOpen]);

    // Calculate if dropdown should open upward
    const calculateOpenDirection = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownHeight = 240; // max-h-60 = 15rem = 240px
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Open upward if not enough space below but enough above
            setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);
        }
    };

    // Close dropdown on outside click/touch
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="space-y-1 relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-[var(--foreground)]">
                {label}
            </label>

            <button
                ref={buttonRef}
                type="button"
                onClick={() => {
                    calculateOpenDirection();
                    setIsOpen(!isOpen);
                }}
                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-left flex items-center justify-between text-sm hover:border-[var(--brand-pink)] transition-colors"
            >
                <span className={selectedOption ? 'text-[var(--foreground)]' : 'text-[var(--foreground-tertiary)]'}>
                    {selectedOption?.label || 'Seleccionar...'}
                </span>
                <ChevronDown className={`w-4 h-4 text-[var(--foreground-tertiary)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: openUpward ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: openUpward ? 10 : -10 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute z-50 w-full rounded-2xl bg-[var(--background)] border border-[var(--border-color)] shadow-lg overflow-hidden ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
                            }`}
                    >
                        {/* Scroll up indicator */}
                        <AnimatePresence>
                            {canScrollUp && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[var(--brand-pink)]/20 to-transparent pointer-events-none z-10 rounded-t-2xl"
                                />
                            )}
                        </AnimatePresence>

                        {/* Scrollable options list */}
                        <div
                            ref={listRef}
                            onScroll={handleScroll}
                            className="max-h-60 overflow-auto hide-scrollbar"
                        >
                            {options.map((option, index) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-[var(--background-secondary)] transition-colors
                                        ${value === option.value ? 'text-[var(--brand-pink)] font-semibold' : 'text-[var(--foreground)]'}
                                        ${index === 0 ? 'rounded-t-2xl' : ''}
                                        ${index === options.length - 1 ? 'rounded-b-2xl' : ''}
                                    `}
                                >
                                    {option.label}
                                    {value === option.value && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>

                        {/* Scroll down indicator */}
                        <AnimatePresence>
                            {canScrollDown && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[var(--brand-pink)]/20 to-transparent pointer-events-none z-10 rounded-b-2xl"
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
