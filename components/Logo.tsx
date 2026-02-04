/**
 * Logo Component - Adapts to theme using CSS
 */

'use client';

import Image from 'next/image';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
};

export default function Logo({ className = '', size = 'md' }: LogoProps) {
    return (
        <div className={`${className} ${sizeClasses[size]} relative flex justify-center items-center`}>
            {/* Light Mode */}
            <Image
                src="/klozet-logo-dark.png"
                alt="Klozet"
                width={120}
                height={48}
                className="h-full w-auto object-contain dark:hidden"
                priority
            />
            {/* Dark Mode */}
            <Image
                src="/klozet-logo.png"
                alt="Klozet"
                width={120}
                height={48}
                className="h-full w-auto object-contain hidden dark:block"
                priority
            />
        </div>
    );
}
