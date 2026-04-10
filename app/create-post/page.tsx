'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shirt, Layers, Camera, Check, Plus, Image as ImageIcon, X, ChevronRight, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { useUser } from '@/store/userStore';
import { Button } from '@/components';

export default function CreatePostPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useUser();

    // Mode: 'compose' is the main screen. 'select-outfit' is the picker view.
    const [mode, setMode] = useState<'compose' | 'select-outfit'>('compose');

    // Data
    const [selectedOutfit, setSelectedOutfit] = useState<any>(null);
    const [userOutfits, setUserOutfits] = useState<any[]>([]);
    const [loadingOutfits, setLoadingOutfits] = useState(false);

    // Image State
    const [realImage, setRealImage] = useState<string | null>(null); // Preview URL
    const [imageFile, setImageFile] = useState<File | Blob | null>(null); // File to upload

    const [caption, setCaption] = useState('');
    const [publishing, setPublishing] = useState(false);
    
    // Edit Mode State
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [originalPost, setOriginalPost] = useState<any>(null);

    // Check for postId (Edit Mode) or outfitId (Return from Create Page)
    useEffect(() => {
        const pId = searchParams.get('postId');
        const oId = searchParams.get('outfitId');

        if (pId) {
            setEditingPostId(pId);
            fetchExistingPost(pId);
        } else if (oId) {
            fetchSingleOutfit(oId);
        }
    }, [searchParams]);

    const fetchExistingPost = async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*, outfit_id, image_url, caption')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            if (data) {
                setOriginalPost(data);
                setCaption(data.caption || '');
                if (data.image_url) {
                    setRealImage(data.image_url);
                }
                if (data.outfit_id) {
                    fetchSingleOutfit(data.outfit_id);
                }
            }
        } catch (err) {
            console.error('Error fetching existing post:', err);
        }
    };

    // Fetch user outfits
    const fetchOutfits = async () => {
        if (!user) return;
        setLoadingOutfits(true);
        try {
            const { data, error } = await supabase
                .from('outfits')
                .select('*, outfit_items(clothing_items(image_url))')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setUserOutfits(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingOutfits(false);
        }
    };

    const fetchSingleOutfit = async (id: string) => {
        const { data } = await supabase.from('outfits').select('*, outfit_items(clothing_items(image_url))').eq('id', id).single();
        if (data) setSelectedOutfit(data);
    };

    const handleOutfitSelect = (outfit: any) => {
        setSelectedOutfit(outfit);
        setMode('compose');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Skip cropping - use image directly
                setRealImage(reader.result as string);
                setImageFile(file);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        // Not used anymore
    };

    const validatePost = () => {
        // Require Image OR Outfit
        if (!selectedOutfit && !realImage) return false;
        return true;
    };

    const handlePublish = async () => {
        if (!validatePost() || !user) return;
        setPublishing(true);

        try {
            let finalImageUrl = null;

            // 1. Upload Real Image if exists
            if (imageFile) {
                const fileExt = 'png';
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('posts')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('posts')
                    .getPublicUrl(fileName);

                finalImageUrl = publicUrl;
            } else if (editingPostId && originalPost?.image_url) {
                // Keep existing image if not changed
                finalImageUrl = originalPost.image_url;
            }

            if (editingPostId) {
                // 2. Update Post in DB
                const { error: updateError } = await supabase
                    .from('posts')
                    .update({
                        outfit_id: selectedOutfit?.id || null,
                        image_url: finalImageUrl,
                        caption: caption.trim()
                    } as any)
                    .eq('id', editingPostId);

                if (updateError) throw updateError;
                router.push(`/post/${editingPostId}`);
            } else {
                // 2. Create Post in DB
                const { error: insertError } = await (supabase
                    .from('posts') as any)
                    .insert({
                        user_id: user.id,
                        outfit_id: selectedOutfit?.id,
                        image_url: finalImageUrl,
                        caption: caption.trim() || (selectedOutfit ? selectedOutfit.name : '')
                    });

                if (insertError) throw insertError;
                router.push('/profile');
            }

        } catch (err) {
            console.error('Error publishing:', err);
            alert('Error al publicar. Por favor intenta de nuevo.');
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (mode === 'select-outfit') setMode('compose');
                            else router.back();
                        }}
                        className="p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
                    </button>
                    <h1 className="text-lg font-bold text-[var(--foreground)]">
                        {mode === 'select-outfit' ? 'Seleccionar Outfit' : (editingPostId ? 'Editar Publicación' : 'Nueva Publicación')}
                    </h1>
                </div>
                {mode === 'compose' && (
                    <button
                        onClick={handlePublish}
                        disabled={publishing || !validatePost()}
                        className="md:hidden text-[var(--brand-pink)] font-bold text-sm disabled:opacity-50 px-2 py-1"
                    >
                        {publishing ? (editingPostId ? 'Guardando...' : 'Publicando...') : (editingPostId ? 'Guardar' : 'Compartir')}
                    </button>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto">

                {/* COMPOSE MODE */}
                {mode === 'compose' && (
                    <div className="p-4 flex flex-col md:grid md:grid-cols-2 md:gap-10">
                        {/* LEFT COLUMN: Media Section */}
                        <div className="space-y-6">
                            <div className="w-full aspect-[4/5] bg-[var(--card-bg)] rounded-3xl overflow-hidden border border-[var(--border-color)] relative group shadow-sm transition-all hover:shadow-md">
                                {realImage ? (
                                    <>
                                        <Image src={realImage} alt="Post preview" fill className="object-cover" />
                                        <button
                                            onClick={() => { setRealImage(null); setImageFile(null); }}
                                            className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 shadow-lg border border-white/10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--background-secondary)] transition-colors gap-3">
                                        <div className="w-16 h-16 rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-[var(--foreground-secondary)]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-[var(--foreground)]">Añadir Foto</p>
                                            <p className="text-sm text-[var(--foreground-tertiary)]">Opcional si usas Outfit</p>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Form & Logic */}
                        <div className="space-y-8 flex flex-col justify-start h-full py-2">
                            {/* Outfit Section */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold tracking-wide text-[var(--foreground)] ml-1 uppercase opacity-60">Outfit</label>
                                {selectedOutfit ? (
                                    <div className="flex items-center gap-4 p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] shadow-sm">
                                        <div className="w-14 h-14 bg-[var(--background-secondary)] rounded-xl relative overflow-hidden shrink-0">
                                            {selectedOutfit.outfit_items?.[0]?.clothing_items?.image_url ? (
                                                <Image
                                                    src={selectedOutfit.outfit_items[0].clothing_items.image_url}
                                                    alt={selectedOutfit.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Shirt className="w-6 h-6 opacity-40" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[var(--foreground)] truncate text-base">{selectedOutfit.name}</p>
                                            <div className="flex gap-4 text-xs font-semibold mt-1">
                                                <button
                                                    onClick={() => {
                                                        setMode('select-outfit');
                                                        fetchOutfits();
                                                    }}
                                                    className="text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] transition-colors"
                                                >
                                                    Cambiar
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/create?outfitId=${selectedOutfit.id}&returnTo=/create-post${editingPostId ? `%3FpostId=${editingPostId}` : ''}`)}
                                                    className="text-[var(--brand-pink)] hover:text-[var(--brand-pink)]/80 flex items-center"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                                                    Editar
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedOutfit(null)}
                                            className="p-2 text-[var(--foreground-tertiary)] hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => { setMode('select-outfit'); fetchOutfits(); }}
                                            className="w-full p-5 flex items-center justify-between bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] hover:bg-[var(--background-secondary)] transition-all group shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center text-[var(--brand-pink)]">
                                                    <Layers className="w-6 h-6" />
                                                </div>
                                                <span className="font-semibold text-lg text-[var(--foreground)]">Enlazar un Outfit</span>
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-[var(--foreground-tertiary)] group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        <p className="text-[11px] text-[var(--foreground-tertiary)] px-1">Enlaza tu outfit para que otros puedan ver las prendas que usas.</p>
                                    </>
                                )}
                            </div>

                            {/* Caption Section */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold tracking-wide text-[var(--foreground)] ml-1 uppercase opacity-60">Descripción</label>
                                <textarea
                                    className="w-full p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/50 resize-none h-40 transition-all placeholder:text-[var(--foreground-tertiary)] text-lg shadow-sm"
                                    placeholder="¿Qué estás vistiendo hoy?..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                />
                            </div>

                            {/* Desktop Publish Button */}
                            <div className="hidden md:block pt-4">
                                <Button
                                    onClick={handlePublish}
                                    disabled={publishing || !validatePost()}
                                    className="w-full h-16 rounded-3xl text-lg font-bold shadow-xl shadow-[var(--brand-pink)]/20"
                                >
                                    {publishing ? (editingPostId ? 'Guardando...' : 'Publicando...') : (editingPostId ? 'Guardar Cambios' : 'Compartir con la comunidad')}
                                </Button>
                                <p className="text-center text-xs text-[var(--foreground-tertiary)] mt-4">
                                    Al compartir, tu post será visible para tus seguidores y en el feed general.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* SELECT OUTFIT MODE */}
                {mode === 'select-outfit' && (
                    <div className="p-4 grid grid-cols-2 gap-4 pb-20">
                        {/* Create New Option */}
                        <button
                            onClick={() => router.push(`/create?returnTo=/create-post${editingPostId ? `%3FpostId=${editingPostId}` : ''}`)}
                            className="aspect-[3/4] rounded-2xl border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center gap-2 hover:bg-[var(--background-secondary)] transition-colors text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                        >
                            <div className="w-12 h-12 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                <Plus className="w-6 h-6 text-[var(--brand-pink)]" />
                            </div>
                            <span className="font-medium">Crear Nuevo</span>
                        </button>

                        {/* Existing Outfits */}
                        {loadingOutfits ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-[var(--card-bg)] rounded-2xl animate-pulse" />
                            ))
                        ) : (
                            userOutfits.map(outfit => (
                                <button
                                    key={outfit.id}
                                    onClick={() => handleOutfitSelect(outfit)}
                                    className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[var(--border-color)] group hover:border-[var(--brand-pink)] transition-all"
                                >
                                    {outfit.outfit_items?.[0]?.clothing_items?.image_url ? (
                                        <Image
                                            src={outfit.outfit_items[0].clothing_items.image_url}
                                            alt={outfit.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[var(--background-secondary)] flex items-center justify-center">
                                            <Shirt className="w-8 h-8 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent pt-8">
                                        <p className="text-white text-xs font-bold truncate">{outfit.name}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {/* Cropper Modal - Removed */}

            </main>
        </div>
    );
}
