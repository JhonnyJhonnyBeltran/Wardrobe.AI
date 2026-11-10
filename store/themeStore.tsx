'use client';

/**
 * Theme Store - Smart iOS-aware theme management
 * - Default is always LIGHT everywhere (Desktop, Mac, Windows, Android, iPad)
 * - Exception: On iPhone, automatic mode follows iOS dark/light appearance
 * - Landing ('/'), Auth ('/auth', '/login'), and Onboarding ('/onboarding/*') are strictly locked to LIGHT mode
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export type Theme = 'light' | 'dark';
export type ThemePreference = 'auto' | 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    themePreference: ThemePreference;
    setTheme: (theme: Theme | ThemePreference) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

const THEME_PREF_KEY = 'klozet_theme_pref';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Detects iPhone / iPod (including Safari "Request Desktop Website" fallback) */
export function isIPhoneDevice(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    if (/iPhone|iPod/i.test(ua)) return true;

    const isTouchMac = /Macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1;
    const minDim = Math.min(window.screen?.width || 999, window.screen?.height || 999);
    return isTouchMac && minDim <= 500;
}

/** Routes that must ALWAYS render in bright light mode */
export function isForceLightRoute(pathname: string | null): boolean {
    if (!pathname) return false;
    if (pathname === '/') return true;
    if (pathname === '/auth' || pathname.startsWith('/auth/')) return true;
    if (pathname === '/login' || pathname.startsWith('/login/')) return true;
    if (pathname === '/onboarding' || pathname.startsWith('/onboarding/')) return true;
    return false;
}

function resolveAutoTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    if (isIPhoneDevice()) {
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
}

function updateThemeColorMeta(isDark: boolean) {
    if (typeof document === 'undefined') return;
    const targetColor = isDark ? '#111113' : '#ffffff';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', targetColor);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themePreference, setThemePreference] = useState<ThemePreference>('auto');
    const [systemTheme, setSystemTheme] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const storedPref = localStorage.getItem(THEME_PREF_KEY) as ThemePreference | null;
        if (storedPref === 'light' || storedPref === 'dark' || storedPref === 'auto') {
            setThemePreference(storedPref);
        } else {
            setThemePreference('auto');
        }

        setSystemTheme(resolveAutoTheme());
        setMounted(true);

        if (!isIPhoneDevice() || !window.matchMedia) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, []);

    const effectiveTheme: Theme = themePreference === 'auto' ? systemTheme : themePreference;
    const forceLight = isForceLightRoute(pathname);
    const isDark = forceLight ? false : effectiveTheme === 'dark';

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
        }

        updateThemeColorMeta(isDark);
    }, [isDark, mounted]);

    const setTheme = (next: Theme | ThemePreference) => {
        setThemePreference(next);
        if (typeof window !== 'undefined') {
            if (next === 'auto') {
                localStorage.setItem(THEME_PREF_KEY, 'auto');
                localStorage.removeItem('klozet_theme');
                setSystemTheme(resolveAutoTheme());
            } else {
                localStorage.setItem(THEME_PREF_KEY, next);
                localStorage.setItem('klozet_theme', next);
            }
        }
    };

    const toggleTheme = () => {
        const next: Theme = effectiveTheme === 'light' ? 'dark' : 'light';
        setTheme(next);
    };

    // Prevent flash of wrong theme
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider
            value={{
                theme: effectiveTheme,
                themePreference,
                setTheme,
                toggleTheme,
                isDark,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
