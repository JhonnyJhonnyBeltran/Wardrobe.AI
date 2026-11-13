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

/**
 * Synchronizes theme state directly with HTML, BODY, meta tags, and native StatusBar.
 * Ensures iPhone status bar, notch background, and overscroll update synchronously without delay.
 */
export function syncThemeToDom(isDark: boolean) {
    if (typeof document === 'undefined') return;
    const targetColor = isDark ? '#111113' : '#ffffff';

    const root = document.documentElement;
    const body = document.body;

    // 1. Root and Body CSS classes and background
    if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
    } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
    }

    root.style.backgroundColor = targetColor;
    if (body) {
        body.style.backgroundColor = targetColor;
        body.style.colorScheme = isDark ? 'dark' : 'light';
    }

    // 2. iOS Safari & Android Theme-Color meta replacement:
    // WebKit only recalculates status bar / notch color when meta elements are inserted or removed.
    // Query and remove ALL existing theme-color tags (including SSR media query variants).
    const existingThemeMetas = document.querySelectorAll('meta[name="theme-color"]');
    existingThemeMetas.forEach(el => el.remove());

    const newThemeMeta = document.createElement('meta');
    newThemeMeta.name = 'theme-color';
    newThemeMeta.content = targetColor;
    document.head.appendChild(newThemeMeta);

    // 3. Apple Mobile Web App Status Bar Style (iOS PWA / standalone)
    const existingAppleMetas = document.querySelectorAll('meta[name="apple-mobile-web-app-status-bar-style"]');
    existingAppleMetas.forEach(el => el.remove());

    const newAppleMeta = document.createElement('meta');
    newAppleMeta.name = 'apple-mobile-web-app-status-bar-style';
    newAppleMeta.content = isDark ? 'black-translucent' : 'default';
    document.head.appendChild(newAppleMeta);

    // 4. Capacitor native iOS & Android StatusBar bridge (instant sync)
    try {
        if (typeof window !== 'undefined') {
            const anyWindow = window as any;
            if (anyWindow.Capacitor?.isNativePlatform?.()) {
                import('@capacitor/status-bar')
                    .then(({ StatusBar, Style }) => {
                        StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
                        StatusBar.setBackgroundColor({ color: targetColor }).catch(() => {});
                        StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
                    })
                    .catch(() => {});
            }
        }
    } catch {
        // Safe fallback in web environments
    }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themePreference, setThemePreference] = useState<ThemePreference>('auto');
    const [systemTheme, setSystemTheme] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const storedPref = localStorage.getItem(THEME_PREF_KEY) as ThemePreference | null;
        const initialPref: ThemePreference =
            storedPref === 'light' || storedPref === 'dark' || storedPref === 'auto'
                ? storedPref
                : 'auto';
        setThemePreference(initialPref);

        const autoTheme = resolveAutoTheme();
        setSystemTheme(autoTheme);
        setMounted(true);

        const initialEffective: Theme = initialPref === 'auto' ? autoTheme : initialPref;
        const initialIsDark = !isForceLightRoute(pathname) && initialEffective === 'dark';
        syncThemeToDom(initialIsDark);

        if (!isIPhoneDevice() || !window.matchMedia) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const newAuto = e.matches ? 'dark' : 'light';
            setSystemTheme(newAuto);
            const currentPref = localStorage.getItem(THEME_PREF_KEY);
            if (!currentPref || currentPref === 'auto') {
                if (!isForceLightRoute(pathname)) {
                    syncThemeToDom(newAuto === 'dark');
                }
            }
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [pathname]);

    const effectiveTheme: Theme = themePreference === 'auto' ? systemTheme : themePreference;
    const forceLight = isForceLightRoute(pathname);
    const isDark = forceLight ? false : effectiveTheme === 'dark';

    useEffect(() => {
        if (!mounted) return;
        syncThemeToDom(isDark);
    }, [isDark, mounted]);

    const setTheme = (next: Theme | ThemePreference) => {
        setThemePreference(next);
        if (typeof window !== 'undefined') {
            let nextIsDark = false;
            if (next === 'auto') {
                localStorage.setItem(THEME_PREF_KEY, 'auto');
                localStorage.removeItem('klozet_theme');
                const autoTheme = resolveAutoTheme();
                setSystemTheme(autoTheme);
                nextIsDark = autoTheme === 'dark';
            } else {
                localStorage.setItem(THEME_PREF_KEY, next);
                localStorage.setItem('klozet_theme', next);
                nextIsDark = next === 'dark';
            }
            if (!isForceLightRoute(pathname)) {
                syncThemeToDom(nextIsDark);
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
