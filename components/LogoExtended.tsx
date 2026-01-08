'use client';

/**
 * LogoExtended - Logo completo de Klozet (KLOZET escrito)
 * Se adapta automáticamente al tema (light/dark)
 */

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LogoExtendedProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
    sm: { width: 80, height: 32, className: 'h-6' },
    md: { width: 120, height: 48, className: 'h-8' },
    lg: { width: 180, height: 72, className: 'h-12' },
};

export default function LogoExtended({ className = '', size = 'md' }: LogoExtendedProps) {
    const [isDark, setIsDark] = useState(false);
    const dims = sizeMap[size];

    useEffect(() => {
        const checkDarkMode = () => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            setIsDark(isDarkMode);
        };

        checkDarkMode();

        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className={`${dims.className} ${className} relative`}>
            <Image
                src={isDark ? '/klozet-logo-dark-extended.png' : '/klozet-logo-extended.png'}
                alt="Klozet"
                width={dims.width}
                height={dims.height}
                className="h-full w-auto object-contain"
                priority
            />
        </div>
    );
}
