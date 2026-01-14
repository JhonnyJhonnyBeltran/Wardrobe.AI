'use client';

/**
 * DropdownWithCustom Component
 * A dropdown that includes predefined options plus a custom input option
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import type { DropdownWithCustomProps } from '../types';

export function DropdownWithCustom({
    label,
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    customOptionLabel = 'Otro...'
}: DropdownWithCustomProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customValue, setCustomValue] = useState('');
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

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

    // Check if current value is custom (not in predefined options)
    const isCustomValue = value && !options.includes(value) && value !== customOptionLabel;

    // Initialize custom value if editing with a custom value
    useEffect(() => {
        if (isCustomValue) {
            setCustomValue(value);
            setShowCustomInput(true);
        }
    }, []);

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

    // Focus input when showing custom input
    useEffect(() => {
        if (showCustomInput && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showCustomInput]);

    const handleSelectOption = (selectedValue: string) => {
        if (selectedValue === customOptionLabel) {
            setShowCustomInput(true);
            setIsOpen(false);
            onChange('');
        } else {
            onChange(selectedValue);
            setShowCustomInput(false);
            setCustomValue('');
            setIsOpen(false);
        }
    };

    const handleCustomChange = (customVal: string) => {
        setCustomValue(customVal);
        onChange(customVal);
    };

    const displayValue = showCustomInput
        ? (customValue || placeholder)
        : (value || placeholder);

    return (
        <div className="space-y-1 relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-[var(--foreground)]">
                {label}
            </label>

            {showCustomInput ? (
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={customValue}
                        onChange={(e) => handleCustomChange(e.target.value)}
                        placeholder={`Escribe ${label.toLowerCase()}...`}
                        className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] text-sm"
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
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => {
                        calculateOpenDirection();
                        setIsOpen(!isOpen);
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-left flex items-center justify-between text-sm hover:border-[var(--brand-pink)] transition-colors"
                >
                    <span className={value ? 'text-[var(--foreground)]' : 'text-[var(--foreground-tertiary)]'}>
                        {displayValue}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[var(--foreground-tertiary)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            )}

            <AnimatePresence>
                {isOpen && !showCustomInput && (
                    <motion.div
                        initial={{ opacity: 0, y: openUpward ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: openUpward ? 10 : -10 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute z-50 w-full rounded-2xl bg-[var(--background)] border border-[var(--border-color)] shadow-lg overflow-hidden ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
                            }`}
                        style={{ width: dropdownRef.current?.offsetWidth }}
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
                            {options.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleSelectOption(option)}
                                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-[var(--background-secondary)] transition-colors
                                        ${value === option ? 'text-[var(--brand-pink)] font-semibold' : 'text-[var(--foreground)]'}
                                        ${option === options[0] ? 'rounded-t-2xl' : ''}
                                    `}
                                >
                                    {option}
                                    {value === option && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                            {/* Custom option */}
                            <button
                                type="button"
                                onClick={() => handleSelectOption(customOptionLabel)}
                                className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-[var(--background-secondary)] transition-colors rounded-b-2xl border-t border-[var(--border-color)] text-[var(--foreground-secondary)] italic"
                            >
                                {customOptionLabel}
                            </button>
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
