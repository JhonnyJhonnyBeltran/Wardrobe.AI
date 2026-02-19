'use client';

/**
 * LogoMark - Logo compacto de Klozet para usar en botones e íconos
 * Se adapta automáticamente al tema (light/dark)
 */

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LogoMarkProps {
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Forzar uso del logo oscuro (para fondos de color como rosa) */
    inverted?: boolean;
    /** Forzar uso del logo rosa (para estado activo) */
    active?: boolean;
}

const sizeMap = {
    xs: { width: 20, height: 20, className: 'w-5 h-5' },
    sm: { width: 24, height: 24, className: 'w-6 h-6' },
    md: { width: 32, height: 32, className: 'w-8 h-8' },
    lg: { width: 48, height: 48, className: 'w-12 h-12' },
    xl: { width: 64, height: 64, className: 'w-16 h-16' },
};

export default function LogoMark({ className = '', size = 'md', inverted = false, active = false }: LogoMarkProps) {
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

    // Lógica de selección del logo:
    // - Si active: usar logo rosa (para estado activo)
    // - Si inverted: usar logo dark (para fondos de color)
    // - Si dark mode: usar logo dark (blanco)
    // - Si light mode: usar logo normal (negro)
    const logoSrc = active
        ? '/klozet-logo-pink.png'
        : inverted
        ? '/klozet-logo-dark.png'
        : (isDark ? '/klozet-logo-dark.png' : '/klozet-logo.png');

    return (
        <div className={`${dims.className} ${className} relative flex-shrink-0`}>
            <Image
                src={logoSrc}
                alt="Klozet"
                width={dims.width}
                height={dims.height}
                className="w-full h-full object-contain"
            />
        </div>
    );
}
