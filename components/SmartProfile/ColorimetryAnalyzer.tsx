'use client';

/**
 * ColorimetryAnalyzer Component
 * Determines seasonal color palette based on skin tone, eyes, and hair
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Sparkles } from 'lucide-react';
import { Card, Button } from '@/components';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type SkinTone = 'very-light' | 'light' | 'medium' | 'tan' | 'deep';
export type Undertone = 'warm' | 'cool' | 'neutral';
export type HairColor = 'blonde' | 'light-brown' | 'brown' | 'dark-brown' | 'black' | 'red';
export type EyeColor = 'blue' | 'green' | 'hazel' | 'brown' | 'dark-brown';

interface ColorPalette {
    season: Season;
    name: string;
    description: string;
    characteristics: string[];
    colors: {
        name: string;
        hex: string;
    }[];
    recommendations: {
        best: string[];
        avoid: string[];
    };
}

const seasonalPalettes: Record<Season, ColorPalette> = {
    spring: {
        season: 'spring',
        name: 'Primavera',
        description: 'Tonos cálidos, luminosos y claros',
        characteristics: [
            'Piel con subtono cálido y dorado',
            'Cabello rubio, castaño claro o cobrizo',
            'Ojos claros o avellana',
        ],
        colors: [
            { name: 'Coral', hex: '#FF6F61' },
            { name: 'Melocotón', hex: '#FFDAB9' },
            { name: 'Verde Manzana', hex: '#8DB600' },
            { name: 'Turquesa', hex: '#40E0D0' },
            { name: 'Amarillo Cálido', hex: '#FFD700' },
            { name: 'Rosa Salmón', hex: '#FA8072' },
        ],
        recommendations: {
            best: ['Tonos cálidos y brillantes', 'Estampados florales', 'Colores pasteles con luz'],
            avoid: ['Negro puro', 'Colores muy oscuros o apagados', 'Grises fríos'],
        },
    },
    summer: {
        season: 'summer',
        name: 'Verano',
        description: 'Tonos fríos, suaves y apagados',
        characteristics: [
            'Piel con subtono frío o rosado',
            'Cabello rubio ceniza, castaño o gris',
            'Ojos azules, verdes o grises',
        ],
        colors: [
            { name: 'Lavanda', hex: '#E6E6FA' },
            { name: 'Rosa Polvo', hex: '#FFB3BA' },
            { name: 'Azul Cielo', hex: '#87CEEB' },
            { name: 'Malva', hex: '#E0B0FF' },
            { name: 'Gris Perla', hex: '#DCDCDC' },
            { name: 'Menta', hex: '#98FF98' },
        ],
        recommendations: {
            best: ['Colores suaves y fríos', 'Tonos pastel apagados', 'Grises y azules suaves'],
            avoid: ['Colores muy brillantes o neón', 'Naranjas cálidos', 'Negro intenso'],
        },
    },
    autumn: {
        season: 'autumn',
        name: 'Otoño',
        description: 'Tonos cálidos, ricos y profundos',
        characteristics: [
            'Piel con subtono dorado o oliváceo',
            'Cabello castaño, cobrizo o rojizo',
            'Ojos marrones, avellana o verdes',
        ],
        colors: [
            { name: 'Terracota', hex: '#E2725B' },
            { name: 'Mostaza', hex: '#FFDB58' },
            { name: 'Verde Oliva', hex: '#808000' },
            { name: 'Marrón Chocolate', hex: '#7B3F00' },
            { name: 'Naranja Quemado', hex: '#CC5500' },
            { name: 'Burdeos', hex: '#800020' },
        ],
        recommendations: {
            best: ['Tonos tierra cálidos', 'Marrones y naranjas', 'Verdes oscuros'],
            avoid: ['Colores neón o muy brillantes', 'Rosas fríos', 'Azules helados'],
        },
    },
    winter: {
        season: 'winter',
        name: 'Invierno',
        description: 'Tonos fríos, intensos y contrastantes',
        characteristics: [
            'Piel con subtono frío (rosado o azulado)',
            'Cabello negro, castaño oscuro o rubio platino',
            'Ojos oscuros o muy claros con contraste',
        ],
        colors: [
            { name: 'Negro Puro', hex: '#000000' },
            { name: 'Blanco Nieve', hex: '#FFFAFA' },
            { name: 'Azul Royal', hex: '#4169E1' },
            { name: 'Fucsia', hex: '#FF00FF' },
            { name: 'Verde Esmeralda', hex: '#50C878' },
            { name: 'Rojo Intenso', hex: '#DC143C' },
        ],
        recommendations: {
            best: ['Colores puros e intensos', 'Alto contraste', 'Tonos fríos y vibrantes'],
            avoid: ['Tonos apagados o terrosos', 'Colores cálidos', 'Naranjas y marrones'],
        },
    },
};

interface ColorimetryAnalyzerProps {
    onComplete: (season: Season, palette: ColorPalette) => void;
}

export const ColorimetryAnalyzer: React.FC<ColorimetryAnalyzerProps> = ({ onComplete }) => {
    const [skinTone, setSkinTone] = useState<SkinTone | null>(null);
    const [undertone, setUndertone] = useState<Undertone | null>(null);
    const [hairColor, setHairColor] = useState<HairColor | null>(null);
    const [eyeColor, setEyeColor] = useState<EyeColor | null>(null);
    const [step, setStep] = useState(1);

    const determineSeason = (): Season => {
        // Simplified algorithm - in production, this would be more sophisticated
        let warmScore = 0;
        let coolScore = 0;

        // Undertone influence
        if (undertone === 'warm') warmScore += 2;
        if (undertone === 'cool') coolScore += 2;
        if (undertone === 'neutral') {
            warmScore += 1;
            coolScore += 1;
        }

        // Hair color influence
        if (hairColor === 'blonde' || hairColor === 'red' || hairColor === 'light-brown') warmScore += 1;
        if (hairColor === 'black' || hairColor === 'dark-brown') coolScore += 1;

        // Eye color influence
        if (eyeColor === 'blue' || eyeColor === 'green') coolScore += 1;
        if (eyeColor === 'brown' || eyeColor === 'hazel') warmScore += 0.5;
        if (eyeColor === 'dark-brown') coolScore += 0.5;

        // Skin tone influence
        if (skinTone === 'very-light' || skinTone === 'light') {
            if (coolScore > warmScore) return 'summer';
            return 'spring';
        } else {
            if (coolScore > warmScore) return 'winter';
            return 'autumn';
        }
    };

    const handleComplete = () => {
        const season = determineSeason();
        onComplete(season, seasonalPalettes[season]);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">
                            ¿Cuál es tu tono de piel?
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(['very-light', 'light', 'medium', 'tan', 'deep'] as SkinTone[]).map((tone) => {
                                const labels: Record<SkinTone, string> = {
                                    'very-light': 'Muy Clara',
                                    'light': 'Clara',
                                    'medium': 'Media',
                                    'tan': 'Bronceada',
                                    'deep': 'Oscura',
                                };
                                const colors: Record<SkinTone, string> = {
                                    'very-light': '#FFE4C4',
                                    'light': '#F5DEB3',
                                    'medium': '#DEB887',
                                    'tan': '#D2691E',
                                    'deep': '#8B4513',
                                };
                                return (
                                    <button
                                        key={tone}
                                        onClick={() => setSkinTone(tone)}
                                        className={`p-4 rounded-2xl border-2 transition-all ${skinTone === tone
                                                ? 'border-[var(--brand-pink)] bg-gradient-to-r from-[var(--brand-pink)]/10 to-[var(--brand-pink-dark)]/10'
                                                : 'border-[var(--border-color)] hover:border-[var(--brand-pink)]/50 bg-[var(--card-bg)]'
                                            }`}
                                    >
                                        <div
                                            className="w-full aspect-square rounded-xl mb-2 border border-[var(--border-color)]"
                                            style={{ backgroundColor: colors[tone] }}
                                        />
                                        <span className="text-sm font-semibold text-[var(--foreground)]">
                                            {labels[tone]}
                                        </span>
                                        {skinTone === tone && (
                                            <Check className="w-4 h-4 text-[var(--brand-pink)] mx-auto mt-1" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div>
                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                            ¿Cuál es tu subtono de piel?
                        </h3>
                        <p className="text-sm text-[var(--foreground-tertiary)] mb-4">
                            Mira las venas de tu muñeca: si son azules/moradas → frío, si son verdes → cálido
                        </p>
                        <div className="space-y-3">
                            {(['warm', 'cool', 'neutral'] as Undertone[]).map((tone) => {
                                const labels: Record<Undertone, string> = {
                                    warm: 'Cálido (Dorado/Amarillento)',
                                    cool: 'Frío (Rosado/Azulado)',
                                    neutral: 'Neutro (Mezcla de ambos)',
                                };
                                return (
                                    <button
                                        key={tone}
                                        onClick={() => setUndertone(tone)}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${undertone === tone
                                                ? 'border-[var(--brand-pink)] bg-gradient-to-r from-[var(--brand-pink)]/10 to-[var(--brand-pink-dark)]/10'
                                                : 'border-[var(--border-color)] hover:border-[var(--brand-pink)]/50 bg-[var(--card-bg)]'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-[var(--foreground)]">
                                                {labels[tone]}
                                            </span>
                                            {undertone === tone && (
                                                <div className="w-6 h-6 rounded-full bg-[var(--brand-pink)] flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div>
                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">
                            ¿Cuál es tu color de cabello natural?
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(['blonde', 'light-brown', 'brown', 'dark-brown', 'black', 'red'] as HairColor[]).map((color) => {
                                const labels: Record<HairColor, string> = {
                                    blonde: 'Rubio',
                                    'light-brown': 'Castaño Claro',
                                    brown: 'Castaño',
                                    'dark-brown': 'Castaño Oscuro',
                                    black: 'Negro',
                                    red: 'Pelirrojo',
                                };
                                const colors: Record<HairColor, string> = {
                                    blonde: '#FAF0BE',
                                    'light-brown': '#B5651D',
                                    brown: '#704214',
                                    'dark-brown': '#3D1F00',
                                    black: '#0C0B0A',
                                    red: '#8B0000',
                                };
                                return (
                                    <button
                                        key={color}
                                        onClick={() => setHairColor(color)}
                                        className={`p-4 rounded-2xl border-2 transition-all ${hairColor === color
                                                ? 'border-[var(--brand-pink)] bg-gradient-to-r from-[var(--brand-pink)]/10 to-[var(--brand-pink-dark)]/10'
                                                : 'border-[var(--border-color)] hover:border-[var(--brand-pink)]/50 bg-[var(--card-bg)]'
                                            }`}
                                    >
                                        <div
                                            className="w-full aspect-square rounded-xl mb-2 border border-[var(--border-color)]"
                                            style={{ backgroundColor: colors[color] }}
                                        />
                                        <span className="text-sm font-semibold text-[var(--foreground)]">
                                            {labels[color]}
                                        </span>
                                        {hairColor === color && (
                                            <Check className="w-4 h-4 text-[var(--brand-pink)] mx-auto mt-1" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div>
                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">
                            ¿Cuál es tu color de ojos?
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(['blue', 'green', 'hazel', 'brown', 'dark-brown'] as EyeColor[]).map((color) => {
                                const labels: Record<EyeColor, string> = {
                                    blue: 'Azul',
                                    green: 'Verde',
                                    hazel: 'Avellana',
                                    brown: 'Marrón',
                                    'dark-brown': 'Marrón Oscuro',
                                };
                                const colors: Record<EyeColor, string> = {
                                    blue: '#4682B4',
                                    green: '#228B22',
                                    hazel: '#8E7618',
                                    brown: '#8B4513',
                                    'dark-brown': '#3E2723',
                                };
                                return (
                                    <button
                                        key={color}
                                        onClick={() => setEyeColor(color)}
                                        className={`p-4 rounded-2xl border-2 transition-all ${eyeColor === color
                                                ? 'border-[var(--brand-pink)] bg-gradient-to-r from-[var(--brand-pink)]/10 to-[var(--brand-pink-dark)]/10'
                                                : 'border-[var(--border-color)] hover:border-[var(--brand-pink)]/50 bg-[var(--card-bg)]'
                                            }`}
                                    >
                                        <div
                                            className="w-full aspect-square rounded-xl mb-2 border border-[var(--border-color)]"
                                            style={{ backgroundColor: colors[color] }}
                                        />
                                        <span className="text-sm font-semibold text-[var(--foreground)]">
                                            {labels[color]}
                                        </span>
                                        {eyeColor === color && (
                                            <Check className="w-4 h-4 text-[var(--brand-pink)] mx-auto mt-1" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const isStepComplete = () => {
        switch (step) {
            case 1:
                return skinTone !== null;
            case 2:
                return undertone !== null;
            case 3:
                return hairColor !== null;
            case 4:
                return eyeColor !== null;
            default:
                return false;
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[var(--foreground-secondary)]">
                        Paso {step} de 4
                    </span>
                    <span className="text-sm font-semibold text-[var(--brand-pink)]">
                        {Math.round((step / 4) * 100)}%
                    </span>
                </div>
                <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-pink-dark)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </motion.div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="p-6 md:p-8 mb-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center shadow-lg flex-shrink-0">
                                <Palette className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] mb-1">
                                    Análisis de Colorimetría
                                </h2>
                                <p className="text-sm text-[var(--foreground-tertiary)]">
                                    Descubre tu paleta de colores perfecta
                                </p>
                            </div>
                        </div>

                        {renderStep()}
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3">
                <Button
                    variant="secondary"
                    onClick={() => setStep(s => Math.max(1, s - 1))}
                    disabled={step === 1}
                    className="flex-1"
                >
                    Anterior
                </Button>
                <Button
                    onClick={() => {
                        if (step < 4) {
                            setStep(s => s + 1);
                        } else {
                            handleComplete();
                        }
                    }}
                    disabled={!isStepComplete()}
                    glow={isStepComplete()}
                    className="flex-1"
                >
                    {step === 4 ? (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Ver Mi Paleta
                        </>
                    ) : (
                        'Siguiente'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default ColorimetryAnalyzer;
