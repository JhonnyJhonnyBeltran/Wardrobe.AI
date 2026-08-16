'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Upload, X, Camera, Sparkles } from 'lucide-react';
import { Button, LogoMark, Card } from '@/components';
import { useUser } from '@/store/userStore';

export default function CreatePostPage() {
    const router = useRouter();
    const { user } = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<'upload' | 'details'>('upload');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setStep('details');
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePublish = async () => {
        if (!selectedImage) return;

        setIsUploading(true);

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // TODO: Upload to Supabase Storage and insert into 'posts' table

        setIsUploading(false);
        router.push('/feed');
    };

    const toggleTag = (tag: string) => {
        if (tags.includes(tag)) {
            setTags(tags.filter(t => t !== tag));
        } else {
            if (tags.length < 5) setTags([...tags, tag]);
        }
    };

    const suggestedTags = ['Casual', 'Streetwear', 'OOTD', 'Summer', 'Vintage', 'Minimal', 'Workwear'];

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col">
            {/* Header */}
            <header className="px-4 py-4 flex items-center justify-between border-b border-[var(--border-color)]">
                <button
                    onClick={() => step === 'details' ? setStep('upload') : router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-[var(--background-secondary)]"
                >
                    <ChevronLeft className="w-6 h-6 text-[var(--foreground)]" />
                </button>
                <span className="font-bold text-[var(--foreground)]">Nuevo Post</span>
                <div className="w-8" /> {/* Spacer */}
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    {step === 'upload' ? (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6"
                        >
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full max-w-sm aspect-[3/4] rounded-3xl border-2 border-dashed border-[var(--border-color)] hover:border-[var(--brand-pink)] bg-[var(--background-secondary)]/50 hover:bg-[var(--brand-pink)]/5 flex flex-col items-center justify-center cursor-pointer transition-all group"
                            >
                                <div className="w-20 h-20 rounded-full bg-[var(--background)] shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-[var(--brand-pink)]" />
                                </div>
                                <p className="text-[var(--foreground)] font-medium">Subir foto</p>
                                <p className="text-sm text-[var(--foreground-tertiary)]">o arrastra aquí</p>
                            </div>

                            <div className="flex items-center gap-4 w-full max-w-sm">
                                <div className="h-[1px] flex-1 bg-[var(--border-color)]" />
                                <span className="text-xs text-[var(--foreground-tertiary)] uppercase">O</span>
                                <div className="h-[1px] flex-1 bg-[var(--border-color)]" />
                            </div>

                            <Button
                                variant="secondary"
                                className="w-full max-w-sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="w-5 h-5 mr-2" />
                                Tomar foto
                            </Button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-md mx-auto"
                        >
                            <div className="flex gap-4 mb-6">
                                <div className="relative w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-lg bg-[var(--background-secondary)]">
                                    {selectedImage && (
                                        <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="Escribe un pie de foto..."
                                        className="w-full h-full p-3 rounded-xl bg-[var(--background-secondary)] border-none resize-none focus:ring-1 focus:ring-[var(--brand-pink)] placeholder:text-[var(--foreground-tertiary)]"
                                    />
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-[var(--foreground-secondary)] mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[var(--brand-pink)]" />
                                    Añadir etiquetas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                                ${tags.includes(tag)
                                                    ? 'bg-[var(--item-gradient-start)] text-white shadow-md'
                                                    : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'}
                                            `}
                                        >
                                            #{tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handlePublish}
                                disabled={isUploading || !caption}
                                glow
                                className="w-full h-12 text-lg"
                            >
                                {isUploading ? 'Publicando...' : 'Publicar'}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
