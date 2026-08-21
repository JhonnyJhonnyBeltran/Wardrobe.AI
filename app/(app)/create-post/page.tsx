'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shirt, Layers, Camera, Check, Plus, Image as ImageIcon, X, ChevronRight, Edit2, Search, Heart, Sparkles, Tag } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { useUser } from '@/store/userStore';
import { Button } from '@/components';
import OutfitCard from '@/components/OutfitCard';
import { haptics } from '@/lib/haptic';

interface StyleOption {
    id: string;
    slug: string;
    name: string;
}

const DEFAULT_STYLE_LIST: StyleOption[] = [
    { id: 'casual-moderno', slug: 'casual-moderno', name: 'Casual Moderno' },
    { id: 'streetwear', slug: 'streetwear', name: 'Streetwear' },
    { id: 'elegante-clasico', slug: 'elegante-clasico', name: 'Elegante / Clásico' },
    { id: 'old-money', slug: 'old-money', name: 'Old Money / Quiet Luxury' },
    { id: 'minimalista', slug: 'minimalista', name: 'Minimalista' },
    { id: 'deportivo-athleisure', slug: 'deportivo-athleisure', name: 'Deportivo / Athleisure' },
    { id: 'boho-chic', slug: 'boho-chic', name: 'Boho Chic' },
    { id: 'y2k', slug: 'y2k', name: 'Y2K' },
    { id: 'techwear', slug: 'techwear', name: 'Techwear' },
    { id: 'business-casual', slug: 'business-casual', name: 'Business Casual' },
    { id: 'grunge-rockero', slug: 'grunge-rockero', name: 'Grunge / Rockero' },
    { id: 'vintage-retro', slug: 'vintage-retro', name: 'Vintage / Retro' },
    { id: 'preppy', slug: 'preppy', name: 'Preppy' },
    { id: 'goth-dark', slug: 'goth-dark', name: 'Goth / Dark' },
    { id: 'cottagecore', slug: 'cottagecore', name: 'Cottagecore' },
    { id: 'skater', slug: 'skater', name: 'Skater' },
    { id: 'indie-alternative', slug: 'indie-alternative', name: 'Indie / Alternative' },
    { id: 'acubi', slug: 'acubi', name: 'Acubi Style' },
    { id: 'coquette', slug: 'coquette', name: 'Coquette' },
    { id: 'cyberpunk', slug: 'cyberpunk', name: 'Cyberpunk / Futurista' },
    { id: 'urbano-latino', slug: 'urbano-latino', name: 'Urbano' },
    { id: 'bloquecore', slug: 'bloquecore', name: 'Blokecore' }
];

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
    const [outfitSearchQuery, setOutfitSearchQuery] = useState('');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Style Tags State
    const [availableStyles, setAvailableStyles] = useState<StyleOption[]>(DEFAULT_STYLE_LIST);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [styleSearch, setStyleSearch] = useState('');

    const filteredOutfits = useMemo(() => {
        let filtered = userOutfits;
        if (showFavoritesOnly) {
            filtered = filtered.filter(o => o.favorite);
        }
        if (outfitSearchQuery.trim()) {
            const q = outfitSearchQuery.toLowerCase();
            filtered = filtered.filter(o => o.name?.toLowerCase().includes(q));
        }
        return filtered;
    }, [userOutfits, outfitSearchQuery, showFavoritesOnly]);

    // Fetch style options from DB
    useEffect(() => {
        const fetchStyles = async () => {
            try {
                const { data } = await supabase
                    .from('style_options')
                    .select('id, slug, name')
                    .eq('is_active', true);

                if (data && data.length > 0) {
                    setAvailableStyles(data);
                }
            } catch (err) {
                console.warn('Using default styles list:', err);
            }
        };
        fetchStyles();
    }, []);

    // Initialize user's preferred styles if new post
    useEffect(() => {
        if (user?.preferredStyles && selectedStyles.length === 0 && !searchParams.get('postId')) {
            setSelectedStyles(user.preferredStyles);
        }
    }, [user?.preferredStyles]);

    const toggleStyleTag = (styleSlugOrId: string) => {
        haptics.selection();
        setSelectedStyles(prev => 
            prev.includes(styleSlugOrId)
                ? prev.filter(s => s !== styleSlugOrId)
                : [...prev, styleSlugOrId]
        );
    };

    const toggleOutfitFavorite = async (outfit: any, currentFav: boolean) => {
        const newFav = !currentFav;
        setUserOutfits(prev => prev.map(o => o.id === outfit.id ? { ...o, favorite: newFav } : o));
        
        try {
            const { error } = await (supabase as any)
                .from('outfits')
                .update({ favorite: newFav })
                .eq('id', outfit.id);
                
            if (error) throw error;
        } catch (err) {
            console.error('Error toggling favorite:', err);
            setUserOutfits(prev => prev.map(o => o.id === outfit.id ? { ...o, favorite: currentFav } : o));
        }
    };

    // Image State
    const [realImage, setRealImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | Blob | null>(null);

    const [caption, setCaption] = useState('');
    const [publishing, setPublishing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
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
                .select('*, outfit_id, image_url, caption, style_ids')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            if (data) {
                const post = data as any;
                setOriginalPost(post);
                setCaption(post.caption || '');
                if (post.image_url) {
                    setRealImage(post.image_url);
                }
                if (Array.isArray(post.style_ids) && post.style_ids.length > 0) {
                    setSelectedStyles(post.style_ids);
                }
                if (post.outfit_id) {
                    fetchSingleOutfit(post.outfit_id);
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
                .select('*, outfit_items(clothing_item:clothing_items(id, image_url), position_x, position_y, scale, rotation, layer_order)')
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
        const { data } = await supabase.from('outfits').select('*, outfit_items(clothing_item:clothing_items(id, image_url), position_x, position_y, scale, rotation, layer_order)').eq('id', id).single();
        if (data) {
            setSelectedOutfit(data);
            // If post has no styles, check if outfit has a style or occasion
            if (selectedStyles.length === 0 && (data as any).style) {
                setSelectedStyles([(data as any).style]);
            }
        }
    };

    const handleOutfitSelect = (outfit: any) => {
        setSelectedOutfit(outfit);
        if (selectedStyles.length === 0 && (outfit.style || outfit.occasion)) {
            const candidate = outfit.style || outfit.occasion;
            setSelectedStyles([candidate]);
        }
        setMode('compose');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRealImage(reader.result as string);
                setImageFile(file);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const validatePost = () => {
        if (!selectedOutfit && !realImage) return false;
        return true;
    };

    const handlePublish = async () => {
        if (!validatePost() || !user) return;
        setPublishing(true);
        setErrorMessage(null);

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
                finalImageUrl = originalPost.image_url;
            }

            if (selectedOutfit) {
                const { error: outfitError } = await supabase
                    .from('outfits')
                    .update({ is_public: true })
                    .eq('id', selectedOutfit.id);
                
                if (outfitError) console.error('Error making outfit public:', outfitError);
            }

            // Final styles array to persist
            const finalStyles = selectedStyles.length > 0 
                ? selectedStyles 
                : (user.preferredStyles || []);

            if (editingPostId) {
                // 2. Update Post in DB
                const { error: updateError } = await (supabase
                    .from('posts') as any)
                    .update({
                        outfit_id: selectedOutfit?.id || null,
                        image_url: finalImageUrl,
                        caption: caption.trim(),
                        style_ids: finalStyles
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
                        caption: caption.trim() || (selectedOutfit ? selectedOutfit.name : ''),
                        style_ids: finalStyles
                    });

                if (insertError) throw insertError;
                router.push('/profile');
            }

        } catch (err: any) {
            console.error('Error publishing:', err);
            setErrorMessage(err?.message || 'Error al publicar. Por favor intenta de nuevo.');
        } finally {
            setPublishing(false);
        }
    };

    const filteredStyles = useMemo(() => {
        if (!styleSearch.trim()) return availableStyles;
        const q = styleSearch.toLowerCase();
        return availableStyles.filter(s => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q));
    }, [availableStyles, styleSearch]);

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
                {mode === 'compose' ? (
                    <button
                        onClick={handlePublish}
                        disabled={publishing || !validatePost()}
                        className="md:hidden text-[var(--brand-pink)] font-bold text-sm disabled:opacity-50 px-2 py-1"
                    >
                        {publishing ? (editingPostId ? 'Guardando...' : 'Publicando...') : (editingPostId ? 'Guardar' : 'Compartir')}
                    </button>
                ) : (
                    <button
                        onClick={() => router.push(`/create?returnTo=/create-post${editingPostId ? `%3FpostId=${editingPostId}` : ''}`)}
                        className="text-[var(--brand-pink)] font-bold text-sm px-2 py-1 flex items-center gap-1 hover:opacity-80"
                    >
                        <Plus className="w-4 h-4" />
                        Crear Nuevo
                    </button>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto pb-12">

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
                        <div className="space-y-6 flex flex-col justify-start h-full py-2">
                            {/* Outfit Section */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-wider text-[var(--foreground-tertiary)] uppercase ml-1">Outfit vinculado</label>
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
                                            className="w-full p-4 flex items-center justify-between bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] hover:bg-[var(--background-secondary)] transition-all group shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center text-[var(--brand-pink)]">
                                                    <Layers className="w-5 h-5" />
                                                </div>
                                                <span className="font-semibold text-sm text-[var(--foreground)]">Enlazar un Outfit</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-[var(--foreground-tertiary)] group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Style Tags Section */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-xs font-bold tracking-wider text-[var(--foreground-tertiary)] uppercase flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                                        Estilos del Look ({selectedStyles.length})
                                    </label>
                                    {selectedStyles.length > 0 && (
                                        <button
                                            onClick={() => setSelectedStyles([])}
                                            className="text-[11px] text-[var(--foreground-tertiary)] hover:text-[var(--brand-pink)] transition-colors"
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                                
                                <p className="text-xs text-[var(--foreground-tertiary)] ml-1">
                                    Elige los estilos que definen este look para que aparezca en el buscador a personas afines.
                                </p>

                                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 custom-scrollbar">
                                    {availableStyles.map(s => {
                                        const isSelected = selectedStyles.includes(s.slug) || selectedStyles.includes(s.id);
                                        return (
                                            <button
                                                key={s.id || s.slug}
                                                type="button"
                                                onClick={() => toggleStyleTag(s.slug || s.id)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
                                                    isSelected
                                                        ? 'bg-[var(--brand-pink)] text-white border-[var(--brand-pink)] shadow-sm scale-105'
                                                        : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] border-[var(--border-color)] hover:border-[var(--brand-pink)]/50'
                                                }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3" />}
                                                {s.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Caption Section */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-wider text-[var(--foreground-tertiary)] uppercase ml-1">Descripción</label>
                                <textarea
                                    className="w-full p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/40 resize-none h-28 transition-all placeholder:text-[var(--foreground-tertiary)] text-sm shadow-sm"
                                    placeholder="¿Qué estás vistiendo hoy?..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                />
                            </div>

                            {errorMessage && (
                                <p className="text-xs text-red-500 font-medium px-1">{errorMessage}</p>
                            )}

                            {/* Desktop Publish Button */}
                            <div className="hidden md:block pt-2">
                                <Button
                                    onClick={handlePublish}
                                    disabled={publishing || !validatePost()}
                                    className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-[var(--brand-pink)]/20 !bg-[var(--brand-pink)] hover:!bg-[var(--brand-pink)]/90 text-white"
                                >
                                    {publishing ? (editingPostId ? 'Guardando...' : 'Publicando...') : (editingPostId ? 'Guardar Cambios' : 'Compartir con la comunidad')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SELECT OUTFIT MODE */}
                {mode === 'select-outfit' && (
                    <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full pb-20">
                        <div className="mb-6 flex items-center gap-3 relative">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                                <input
                                    type="text"
                                    placeholder="Buscar outfit..."
                                    value={outfitSearchQuery}
                                    onChange={(e) => setOutfitSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[var(--background-secondary)] rounded-2xl text-[var(--foreground)] outline-none border border-transparent focus:border-[var(--brand-pink)]/30 transition-all placeholder-[var(--foreground-tertiary)] font-medium"
                                />
                            </div>
                            <button 
                                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                className={`p-3 rounded-2xl flex-shrink-0 transition-colors border ${showFavoritesOnly ? 'bg-[var(--brand-pink)]/10 border-[var(--brand-pink)]/30' : 'bg-[var(--background-secondary)] border-transparent'}`}
                            >
                                <Heart className={`w-5 h-5 transition-colors ${showFavoritesOnly ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'text-[var(--foreground-secondary)]'}`} />
                            </button>
                        </div>

                        {loadingOutfits ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-pink)]"></div>
                            </div>
                        ) : filteredOutfits.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <p className="text-[var(--foreground-secondary)] text-lg mb-4">No se encontraron outfits.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredOutfits.map(outfit => (
                                    <div key={outfit.id} onClick={() => handleOutfitSelect(outfit)} className="cursor-pointer">
                                        <OutfitCard
                                            outfit={outfit}
                                            index={0}
                                            onClick={() => handleOutfitSelect(outfit)}
                                            onEdit={() => {}}
                                            onShare={() => {}}
                                            onDelete={() => {}}
                                            onToggleFavorite={toggleOutfitFavorite}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
}
