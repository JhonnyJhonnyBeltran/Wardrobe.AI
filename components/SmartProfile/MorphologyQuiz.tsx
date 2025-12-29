'use client';

/**
 * MorphologyQuiz Component
 * Visual quiz to determine body type and recommend cuts/silhouettes
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { Card, Button } from '@/components';

export type BodyType = 'triangle' | 'inverted-triangle' | 'rectangle' | 'hourglass' | 'oval';

interface QuizQuestion {
    id: number;
    question: string;
    description: string;
    options: {
        value: string;
        label: string;
        image?: string;
        bodyType: BodyType;
    }[];
}

const questions: QuizQuestion[] = [
    {
        id: 1,
        question: '¿Cómo describirías tus hombros en relación con tus caderas?',
        description: 'Compara el ancho de tus hombros con el de tus caderas',
        options: [
            { value: 'narrower', label: 'Hombros más estrechos que caderas', bodyType: 'triangle' },
            { value: 'wider', label: 'Hombros más anchos que caderas', bodyType: 'inverted-triangle' },
            { value: 'equal', label: 'Hombros y caderas similares', bodyType: 'rectangle' },
        ],
    },
    {
        id: 2,
        question: '¿Cómo es tu cintura?',
        description: 'Observa la definición de tu cintura',
        options: [
            { value: 'defined', label: 'Muy definida', bodyType: 'hourglass' },
            { value: 'slightly-defined', label: 'Ligeramente marcada', bodyType: 'triangle' },
            { value: 'not-defined', label: 'Poco definida', bodyType: 'rectangle' },
        ],
    },
    {
        id: 3,
        question: '¿Dónde tiendes a acumular más peso?',
        description: 'Identifica tu zona de mayor ganancia de peso',
        options: [
            { value: 'hips-thighs', label: 'Caderas y muslos', bodyType: 'triangle' },
            { value: 'bust-arms', label: 'Busto y brazos', bodyType: 'inverted-triangle' },
            { value: 'waist', label: 'Zona abdominal', bodyType: 'oval' },
            { value: 'evenly', label: 'De forma uniforme', bodyType: 'rectangle' },
        ],
    },
];

const bodyTypeRecommendations: Record<BodyType, {
    name: string;
    description: string;
    dos: string[];
    donts: string[];
}> = {
    'triangle': {
        name: 'Triángulo (Pera)',
        description: 'Caderas más anchas que hombros, cintura definida',
        dos: [
            'Tops con hombros marcados o volumen',
            'Escotes en V o palabra de honor',
            'Pantalones oscuros de corte recto',
            'Faldas A-line o evasé',
        ],
        donts: [
            'Evita bolsillos grandes en caderas',
            'Pantalones muy ajustados',
            'Estampados llamativos en la parte inferior',
        ],
    },
    'inverted-triangle': {
        name: 'Triángulo Invertido',
        description: 'Hombros más anchos que caderas',
        dos: [
            'Pantalones con detalles o estampados',
            'Faldas con volumen',
            'Escotes en V para alargar',
            'Cinturones para marcar cintura',
        ],
        donts: [
            'Evita hombreras pronunciadas',
            'Tops con mucho volumen arriba',
            'Cuellos altos muy rígidos',
        ],
    },
    'rectangle': {
        name: 'Rectángulo (Atlético)',
        description: 'Hombros y caderas alineados, cintura poco marcada',
        dos: [
            'Cinturones para crear curvas',
            'Peplum y cortes imperio',
            'Capas y texturas',
            'Estampados estratégicos',
        ],
        donts: [
            'Evita prendas muy sueltas y rectas',
            'Cortes boxy sin definición',
        ],
    },
    'hourglass': {
        name: 'Reloj de Arena',
        description: 'Hombros y caderas equilibrados, cintura muy marcada',
        dos: [
            'Prendas ajustadas que marquen silueta',
            'Escotes en V o corazón',
            'Cintura alta y wrap dresses',
            'Cortes entallados',
        ],
        donts: [
            'Evita prendas muy sueltas',
            'Cortes rectos que oculten curvas',
            'Capas excesivas',
        ],
    },
    'oval': {
        name: 'Óvalo (Manzana)',
        description: 'Peso concentrado en zona abdominal',
        dos: [
            'Escotes en V profundos',
            'Imperio y cortes que fluyan',
            'Pantalones de tiro medio-alto',
            'Tops que caigan sin ajustar',
        ],
        donts: [
            'Evita cinturones muy ajustados',
            'Tops muy cortos',
            'Estampados grandes en zona media',
        ],
    },
};

interface MorphologyQuizProps {
    onComplete: (bodyType: BodyType, recommendations: typeof bodyTypeRecommendations[BodyType]) => void;
}

export const MorphologyQuiz: React.FC<MorphologyQuizProps> = ({ onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleAnswer = (value: string) => {
        setSelectedOption(value);
        setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedOption(answers[currentQuestion + 1] || null);
        } else {
            // Calculate body type based on answers
            const bodyTypeCounts: Record<BodyType, number> = {
                'triangle': 0,
                'inverted-triangle': 0,
                'rectangle': 0,
                'hourglass': 0,
                'oval': 0,
            };

            questions.forEach((q, idx) => {
                const answer = answers[idx];
                const option = q.options.find(o => o.value === answer);
                if (option) {
                    bodyTypeCounts[option.bodyType]++;
                }
            });

            const determinedBodyType = (Object.entries(bodyTypeCounts) as [BodyType, number][])
                .reduce((a, b) => (a[1] > b[1] ? a : b))[0];

            onComplete(determinedBodyType, bodyTypeRecommendations[determinedBodyType]);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
            setSelectedOption(answers[currentQuestion - 1] || null);
        }
    };

    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const question = questions[currentQuestion];

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[var(--foreground-secondary)]">
                        Pregunta {currentQuestion + 1} de {questions.length}
                    </span>
                    <span className="text-sm font-semibold text-[var(--brand-pink)]">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-pink-dark)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </motion.div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="p-6 md:p-8 mb-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center shadow-lg flex-shrink-0">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] mb-2">
                                    {question.question}
                                </h2>
                                <p className="text-sm text-[var(--foreground-tertiary)]">
                                    {question.description}
                                </p>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            {question.options.map((option, index) => (
                                <motion.button
                                    key={option.value}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => handleAnswer(option.value)}
                                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${selectedOption === option.value
                                            ? 'border-[var(--brand-pink)] bg-gradient-to-r from-[var(--brand-pink)]/10 to-[var(--brand-pink-dark)]/10'
                                            : 'border-[var(--border-color)] hover:border-[var(--brand-pink)]/50 bg-[var(--card-bg)]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-[var(--foreground)]">
                                            {option.label}
                                        </span>
                                        {selectedOption === option.value && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-6 h-6 rounded-full bg-[var(--brand-pink)] flex items-center justify-center"
                                            >
                                                <Check className="w-4 h-4 text-white" />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3">
                <Button
                    variant="secondary"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex-1"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Anterior
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!selectedOption}
                    glow={!!selectedOption}
                    className="flex-1"
                >
                    {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};

export default MorphologyQuiz;
