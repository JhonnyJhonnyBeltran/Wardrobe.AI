'use client';

/**
 * ThemeToggle Component
 * Smooth dark/light mode switcher with Apple-style animation
 */

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/store';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-between w-16 h-8 rounded-full
                 bg-[var(--background-tertiary)] border border-[var(--border-color)]
                 transition-colors duration-300 hover:border-[var(--border-hover)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:ring-offset-2"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
            {/* Icons */}
            <div className="flex items-center justify-between w-full px-1.5 relative z-10">
                <Sun
                    className={`w-4 h-4 transition-all duration-300 ${!isDark ? 'text-[var(--brand-pink)] scale-100' : 'text-[var(--foreground-tertiary)] scale-75'
                        }`}
                />
                <Moon
                    className={`w-4 h-4 transition-all duration-300 ${isDark ? 'text-[var(--brand-pink)] scale-100' : 'text-[var(--foreground-tertiary)] scale-75'
                        }`}
                />
            </div>

            {/* Sliding indicator */}
            <motion.div
                layout
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                }}
                className="absolute top-1 w-6 h-6 rounded-full bg-[var(--card-bg)] 
                   shadow-float border border-[var(--border-color)]"
                style={{
                    left: isDark ? 'calc(100% - 1.75rem)' : '0.25rem',
                }}
            />
        </button>
    );
};

export default ThemeToggle;
