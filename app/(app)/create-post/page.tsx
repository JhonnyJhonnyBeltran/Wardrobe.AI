'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shirt, Layers, Camera, Check, Plus, Image as ImageIcon, X, ChevronRight, Edit2, Search, Heart, Tag } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { useUser } from '@/store/userStore';
import { useTourStore } from '@/store/tourStore';
import { Button } from '@/components';
import OutfitCard from '@/components/OutfitCard';
import { haptics } from '@/lib/haptic';
import { showDatabaseError } from '@/lib/errorModal';

interface StyleOption {
    id: string;
    slug: string;
    name: string;
}

const DEFAULT_STYLE_LIST: StyleOption[] = [
    // Tendencias & Virales
    { id: 'streetwear', slug: 'streetwear', name: 'Streetwear' },
    { id: 'old-money', slug: 'old-money', name: 'Old Money' },
    { id: 'y2k', slug: 'y2k', name: 'Y2K' },
    { id: 'clean-look', slug: 'clean-look', name: 'Clean Look' },
    { id: 'coquette', slug: 'coquette', name: 'Coquette' },
    { id: 'baddie-glam', slug: 'baddie-glam', name: 'Baddie / Glam' },
    { id: 'k-fashion', slug: 'k-fashion', name: 'K-Fashion' },

    // Casual & Diario
    { id: 'casual-moderno', slug: 'casual-moderno', name: 'Casual Moderno' },
    { id: 'minimalista', slug: 'minimalista', name: 'Minimalista' },
    { id: 'normcore', slug: 'normcore', name: 'Normcore' },
    { id: 'deportivo-athleisure', slug: 'deportivo-athleisure', name: 'Deportivo / Athleisure' },
    { id: 'smart-casual', slug: 'smart-casual', name: 'Smart Casual' },

    // Elegante & Formal
    { id: 'elegante-clasico', slug: 'elegante-clasico', name: 'Elegante / Clásico' },
    { id: 'business-casual', slug: 'business-casual', name: 'Business Casual' },
    { id: 'preppy', slug: 'preppy', name: 'Preppy' },
    { id: 'chic-parisino', slug: 'chic-parisino', name: 'Chic Parisino' },

    // Urbano, Tech & Outdoor
    { id: 'skater-surf', slug: 'skater-surf', name: 'Skater / Surf' },
    { id: 'workwear-americana', slug: 'workwear-americana', name: 'Workwear / Americana' },
    { id: 'techwear', slug: 'techwear', name: 'Techwear' },
    { id: 'gorpcore', slug: 'gorpcore', name: 'Gorpcore / Outdoor' },
    { id: 'cyberpunk', slug: 'cyberpunk', name: 'Cyberpunk' },

    // Aesthetic & Subculturas
    { id: 'dark-academia', slug: 'dark-academia', name: 'Dark Academia' },
    { id: 'light-academia', slug: 'light-academia', name: 'Light Academia' },
    { id: 'cottagecore', slug: 'cottagecore', name: 'Cottagecore' },
    { id: 'soft-girl-boy', slug: 'soft-girl-boy', name: 'Soft Aesthetic' },
    { id: 'gotico-alt', slug: 'gotico-alt', name: 'Gótico / Alt' },
    { id: 'harajuku', slug: 'harajuku', name: 'Harajuku / J-Fashion' },

    // Vintage & Ocasiones
    { id: 'vintage-retro', slug: 'vintage-retro', name: 'Vintage / Retro' },
    { id: 'rock-grunge', slug: 'rock-grunge', name: 'Rock / Grunge' },
    { id: 'boho-chic', slug: 'boho-chic', name: 'Boho Chic' },
    { id: 'western-cowboy', slug: 'western-cowboy', name: 'Western / Cowboy' },
    { id: 'party-noche', slug: 'party-noche', name: 'Noche / Fiesta' },
    { id: 'coastal-resort', slug: 'coastal-resort', name: 'Coastal / Resort' },
    { id: 'maximalista', slug: 'maximalista', name: 'Maximalista' },
];

function normalizeOutfit(o: any) {
    if (!o) return null;
    const rawItems = o.items || o.outfit_items || [];
    const items = rawItems.map((oi: any) => {
        const clothing = oi.clothing_item || oi.clothing_items || (oi.id && oi.image_url ? oi : null);
        if (!clothing) return null;
        return {
            ...clothing,
            position_x: typeof oi.position_x === 'number' ? oi.position_x : clothing.position_x,
            position_y: typeof oi.position_y === 'number' ? oi.position_y : clothing.position_y,
            scale: typeof oi.scale === 'number' ? oi.scale : clothing.scale,
            rotation: typeof oi.rotation === 'number' ? oi.rotation : clothing.rotation,
            layer_order: typeof oi.layer_order === 'number' ? oi.layer_order : clothing.layer_order,
        };
    }).filter(Boolean);

    return {
        ...o,
        items,
        imageUrl: o.imageUrl || o.image_url || o.preview_image,
        image_url: o.image_url || o.imageUrl || o.preview_image,
    };
}

function getStyleName(idOrSlug: string, stylesList: StyleOption[]) {
    const clean = (idOrSlug || '').trim();
    const found = stylesList.find(s => s.id === clean || s.slug === clean);
    if (found) return found.name;
    return clean
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

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
    const [isStylesExpanded, setIsStylesExpanded] = useState(false);

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
                .select('*, outfit_items(position_x, position_y, scale, rotation, layer_order, clothing_item:clothing_items(*))')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                const formatted = data.map(normalizeOutfit);
                setUserOutfits(formatted);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingOutfits(false);
        }
    };

    const fetchSingleOutfit = async (id: string) => {
        const { data } = await supabase
            .from('outfits')
            .select('*, outfit_items(position_x, position_y, scale, rotation, layer_order, clothing_item:clothing_items(*))')
            .eq('id', id)
            .single();

        if (data) {
            const normalized = normalizeOutfit(data);
            setSelectedOutfit(normalized);
            // If post has no styles, check if outfit has a style or occasion
            if (selectedStyles.length === 0 && (normalized as any).style) {
                setSelectedStyles([(normalized as any).style]);
            }
        }
    };

    const handleOutfitSelect = (outfit: any) => {
        const normalized = normalizeOutfit(outfit);
        setSelectedOutfit(normalized);
        if (selectedStyles.length === 0 && (normalized?.style || normalized?.occasion)) {
            const candidate = normalized.style || normalized.occasion;
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
        if (publishing || !validatePost() || !user) return;
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

                // Guided tour real-time trigger
                try {
                    useTourStore.getState().markStepComplete('create_post', '¡Has compartido tu look con la comunidad!', true);
                } catch (tourErr) {
                    console.warn('[CreatePost] Error updating tour step:', tourErr);
                }

                router.push('/profile');
            }

        } catch (err: any) {
            console.error('Error publishing:', err);
            setErrorMessage(err?.message || 'Error al publicar. Por favor intenta de nuevo.');
            showDatabaseError(err, 'No se pudo publicar. Por favor intenta de nuevo.');
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
                                            type="button"
                                            onClick={() => { setRealImage(null); setImageFile(null); }}
                                            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-black/70 shadow-lg border border-white/10 z-20 cursor-pointer transition-colors"
                                            title="Eliminar foto"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : selectedOutfit ? (
                                    <div className="w-full h-full relative bg-white flex items-center justify-center overflow-hidden">
                                        {/* Canvas with items */}
                                        {selectedOutfit.items && selectedOutfit.items.length > 0 ? (
                                            <div className="relative w-full h-full overflow-hidden p-4">
                                                {selectedOutfit.items.map((item: any, i: number) => {
                                                    const imgSrc = item.imageUrl || item.image_url;
                                                    const total = selectedOutfit.items.length;
                                                    const hasCoords = selectedOutfit.items.some((it: any) => typeof it.position_x === 'number');

                                                    let posX = typeof item.position_x === 'number' ? item.position_x : 50;
                                                    let posY = typeof item.position_y === 'number' ? item.position_y : 50;
                                                    let itemScale = typeof item.scale === 'number' ? item.scale : 1;

                                                    if (!hasCoords) {
                                                        posX = 50;
                                                        const startY = total >= 4 ? 16 : 22;
                                                        const endY = total >= 4 ? 84 : 78;
                                                        posY = total === 1 ? 50 : startY + (i * (endY - startY)) / (total - 1);
                                                    }

                                                    const itemZ = item.layer_order || (i + 1);

                                                    return (
                                                        <div
                                                            key={item.id || i}
                                                            style={{
                                                                position: 'absolute',
                                                                left: `${posX}%`,
                                                                top: `${posY}%`,
                                                                transform: `translate(-50%, -50%) scale(${itemScale * 0.95})`,
                                                                zIndex: itemZ,
                                                                width: '42%',
                                                                maxWidth: '160px',
                                                            }}
                                                            className="flex items-center justify-center pointer-events-none select-none"
                                                        >
                                                            {imgSrc ? (
                                                                <img
                                                                    src={imgSrc}
                                                                    alt={item.name || 'Prenda'}
                                                                    className="w-full h-auto object-contain drop-shadow-md"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="w-12 h-12 rounded-xl shadow-xs"
                                                                    style={{ backgroundColor: item.color_hex || '#ccc' }}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (selectedOutfit.imageUrl || selectedOutfit.image_url) ? (
                                            <Image
                                                src={selectedOutfit.imageUrl || selectedOutfit.image_url}
                                                alt={selectedOutfit.name || 'Outfit'}
                                                fill
                                                className="object-contain p-4"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                                                <Layers className="w-12 h-12 stroke-[1.5] text-[var(--brand-pink)]" />
                                                <span className="text-sm font-semibold text-zinc-700">{selectedOutfit.name}</span>
                                            </div>
                                        )}

                                        {/* Top Badge: Outfit name */}
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 shadow-md">
                                                <Layers className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                                                {selectedOutfit.name || 'Outfit vinculado'}
                                            </span>
                                        </div>

                                        {/* Top Right: Unlink button */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedOutfit(null)}
                                            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-black/70 shadow-lg border border-white/10 z-20 cursor-pointer transition-colors"
                                            title="Desvincular outfit"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        {/* Bottom Action: Upload real photo optionally */}
                                        <label className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 text-xs font-bold border border-white/10 cursor-pointer flex items-center gap-1.5 shadow-md transition-all active:scale-95">
                                            <Camera className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                                            <span>Subir foto real (opcional)</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    </div>
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
                                        <div className="w-14 h-14 bg-[var(--background-secondary)] rounded-xl relative overflow-hidden shrink-0 border border-[var(--border-color)]/60 flex items-center justify-center">
                                            {(() => {
                                                const thumb = selectedOutfit.items?.[0]?.imageUrl || selectedOutfit.items?.[0]?.image_url || selectedOutfit.imageUrl || selectedOutfit.image_url;
                                                return thumb ? (
                                                    <Image
                                                        src={thumb}
                                                        alt={selectedOutfit.name || 'Outfit'}
                                                        fill
                                                        className="object-contain p-1"
                                                    />
                                                ) : (
                                                    <Layers className="w-6 h-6 text-[var(--brand-pink)] opacity-80" />
                                                );
                                            })()}
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
                                            className="p-2 text-[var(--foreground-tertiary)] hover:text-red-500 transition-colors cursor-pointer"
                                            title="Desvincular outfit"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => { setMode('select-outfit'); fetchOutfits(); }}
                                            className="w-full p-4 flex items-center justify-between bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] hover:bg-[var(--background-secondary)] transition-all group shadow-sm cursor-pointer"
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
                                            type="button"
                                            onClick={() => setSelectedStyles([])}
                                            className="text-[11px] text-[var(--foreground-tertiary)] hover:text-[var(--brand-pink)] transition-colors cursor-pointer"
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                                
                                <p className="text-xs text-[var(--foreground-tertiary)] ml-1">
                                    Elige los estilos que definen este look para que aparezca en el buscador a personas afines.
                                </p>

                                {/* Main Collapsed View: Only chosen styles + Pink '+' button */}
                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                    {selectedStyles.map((styleKey) => {
                                        const styleName = getStyleName(styleKey, availableStyles);
                                        return (
                                            <span
                                                key={styleKey}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--brand-pink)] text-white text-xs font-bold shadow-xs select-none"
                                            >
                                                <Check className="w-3 h-3 stroke-[3]" />
                                                <span>{styleName}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleStyleTag(styleKey);
                                                    }}
                                                    className="p-0.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer ml-0.5"
                                                    aria-label={`Eliminar ${styleName}`}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        );
                                    })}

                                    {/* Botón de + rosita para añadir o desplegar estilos */}
                                    <button
                                        type="button"
                                        onClick={() => setIsStylesExpanded(prev => !prev)}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--brand-pink)] hover:bg-[#ff3377] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                                        aria-label={isStylesExpanded ? "Cerrar selector de estilos" : "Añadir más estilos"}
                                    >
                                        <Plus className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 ${isStylesExpanded ? 'rotate-45' : ''}`} />
                                        <span>{isStylesExpanded ? 'Cerrar' : 'Añadir'}</span>
                                    </button>
                                </div>

                                {/* Expandable Catalogue View */}
                                <AnimatePresence>
                                    {isStylesExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden space-y-2.5 pt-2"
                                        >
                                            {/* Search input + Done button */}
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--foreground-tertiary)]" />
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar estilos..."
                                                        value={styleSearch}
                                                        onChange={(e) => setStyleSearch(e.target.value)}
                                                        className="w-full pl-9 pr-8 py-2 bg-[var(--background-secondary)] text-[var(--foreground)] rounded-full text-xs outline-none border border-[var(--border-color)] focus:border-[var(--brand-pink)] transition-all font-medium"
                                                        autoFocus
                                                    />
                                                    {styleSearch && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setStyleSearch('')}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] p-0.5 cursor-pointer"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsStylesExpanded(false);
                                                        setStyleSearch('');
                                                    }}
                                                    className="px-3.5 py-2 rounded-full bg-[var(--brand-pink)] text-white text-xs font-bold hover:bg-[#ff3377] transition-all cursor-pointer shrink-0 shadow-xs"
                                                >
                                                    Listo
                                                </button>
                                            </div>

                                            {/* Styles Catalogue to Pick from */}
                                            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-2.5 custom-scrollbar bg-[var(--background-secondary)]/60 rounded-2xl border border-[var(--border-color)]">
                                                {filteredStyles.map((s) => {
                                                    const key = s.slug || s.id;
                                                    const isSelected = selectedStyles.includes(s.slug) || selectedStyles.includes(s.id);
                                                    return (
                                                        <button
                                                            key={s.id || s.slug}
                                                            type="button"
                                                            onClick={() => toggleStyleTag(key)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
                                                                isSelected
                                                                    ? 'bg-[var(--brand-pink)] text-white border-[var(--brand-pink)] shadow-xs font-bold scale-102'
                                                                    : 'bg-[var(--card-bg)] text-[var(--foreground-secondary)] border-[var(--border-color)] hover:border-[var(--brand-pink)]/50 hover:text-[var(--foreground)]'
                            }`}
                                                        >
                                                            {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                                                            <span>{s.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Caption Section */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-wider text-[var(--foreground-tertiary)] uppercase ml-1">Descripción</label>
                                <textarea
                                    className="w-full p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] outline-none focus:border-[var(--foreground-tertiary)] resize-none h-28 transition-all placeholder:text-[var(--foreground-tertiary)] text-sm shadow-sm"
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
                                    className="w-full pl-12 pr-4 py-3 bg-[var(--background-secondary)] rounded-2xl text-[var(--foreground)] outline-none border border-transparent focus:border-[var(--border-color)] transition-all placeholder-[var(--foreground-tertiary)] font-medium"
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
