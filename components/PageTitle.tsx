'use client';

/**
 * PageTitle - Títulos estilizados al estilo del logo Klozet
 * Primera palabra en negro, resto en rosa, tipografía bubble en mayúsculas
 */

interface PageTitleProps {
    /** Primera palabra (será negra/blanca según tema) */
    primary: string;
    /** Palabras secundarias (serán en rosa) */
    secondary?: string;
    /** Clase adicional */
    className?: string;
    /** Subtítulo opcional */
    subtitle?: string;
    /** Centrar el texto */
    centered?: boolean;
}

export default function PageTitle({ primary, secondary, className = '', subtitle, centered = false }: PageTitleProps) {
    return (
        <div className={`${className} ${centered ? 'text-center' : ''}`}>
            <h1 className="page-title">
                <span className="page-title-primary">{primary.toUpperCase()}</span>
                {secondary && (
                    <>
                        {' '}
                        <span className="page-title-secondary">{secondary.toUpperCase()}</span>
                    </>
                )}
            </h1>
            {subtitle && (
                <p className="text-xs text-[var(--foreground-tertiary)] mt-1">{subtitle}</p>
            )}
        </div>
    );
}
