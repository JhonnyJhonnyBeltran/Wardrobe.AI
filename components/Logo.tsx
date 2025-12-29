/**
 * Logo Component - Adapts to theme
 */

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check if dark mode is active
        const checkDarkMode = () => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            setIsDark(isDarkMode);
        };

        checkDarkMode();

        // Listen for theme changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    const sizeClasses = {
        sm: 'h-6',
        md: 'h-8',
        lg: 'h-12',
    };

    return (
        <div className={`${className} ${sizeClasses[size]} relative`}>
            <Image
                src={isDark ? '/klozet-logo-dark.png' : '/klozet-logo.png'}
                alt="Klozet"
                width={120}
                height={48}
                className="h-full w-auto object-contain"
                priority
            />
        </div>
    );
}
