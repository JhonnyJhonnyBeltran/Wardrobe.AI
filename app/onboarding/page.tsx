'use client';

/**
 * Onboarding Page - Style Questionnaire Demo
 * Shows how to integrate the StyleQuizModal
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { StyleQuizModal, type StyleQuizResponses } from '@/components/StyleQuizModal';
import { useUser } from '@/store/userStore';
import { Sparkles } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, setUser } = useUser();
    const step = searchParams?.get('step');
    const [showQuiz, setShowQuiz] = useState(step === 'quiz');

    const handleQuizComplete = (responses: StyleQuizResponses) => {
        // Save user preferences
        if (user) {
            setUser({
                ...user,
                ageRange: responses.ageRange as any,
                gender: responses.gender as any,
                height: responses.height,
                heightRange: responses.heightRange as any,
                preferredStyles: responses.preferredStyles,
                usesAccessories: responses.usesAccessories,
                visualStylePreferences: responses.visualStylePreferences,
                styleCompleted: true,
            });
        }

        // Navigate to closet after completing quiz
        router.push('/closet');
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            {/* Welcome Screen */}
            {!showQuiz && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center shadow-[var(--shadow-float-strong)]">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold gradient-text mb-4">
                        ¡Bienvenido a Klozet!
                    </h1>
                    <p className="text-lg text-[var(--foreground-tertiary)] mb-8">
                        Vamos a conocer tu estilo para personalizar tu experiencia
                    </p>
                    <button
                        onClick={() => setShowQuiz(true)}
                        className="btn-primary"
                    >
                        Empezar Cuestionario
                    </button>
                </motion.div>
            )}

            {/* Style Quiz Modal */}
            <StyleQuizModal
                isOpen={showQuiz}
                onClose={() => router.push('/closet')}
                onComplete={handleQuizComplete}
            />
        </div>
    );
}
