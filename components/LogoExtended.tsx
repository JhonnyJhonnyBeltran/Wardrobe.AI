'use client';

/**
 * LogoExtended - Logo completo de Klozet (KLOZET escrito)
 * Se adapta automáticamente al tema (light/dark) usando CSS puro para evitar flicker
 */

import Image from 'next/image';

interface LogoExtendedProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
    sm: { width: 80, height: 32, className: 'h-6' },
    md: { width: 120, height: 48, className: 'h-8' },
    lg: { width: 180, height: 72, className: 'h-12' },
    xl: { width: 280, height: 112, className: 'h-20' },
};

export default function LogoExtended({ className = '', size = 'md' }: LogoExtendedProps) {
    const dims = sizeMap[size];

    return (
        <div className={`${dims.className} ${className} relative flex justify-center items-center`}>
            {/* Light Mode Logo (Dark Text) */}
            <Image
                src="/klozet-logo-dark-extended.png"
                alt="Klozet"
                width={dims.width}
                height={dims.height}
                className="h-full w-auto object-contain dark:hidden"
                priority
            />
            {/* Dark Mode Logo (White Text) */}
            <Image
                src="/klozet-logo-extended.png"
                alt="Klozet"
                width={dims.width}
                height={dims.height}
                className="h-full w-auto object-contain hidden dark:block"
                priority
            />
        </div>
    );
}
