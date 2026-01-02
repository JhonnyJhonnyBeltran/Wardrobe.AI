/**
 * Social features and saved content types
 */

export interface Post {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    images: string[];
    caption?: string;
    outfitItems?: string[]; // IDs of clothing items used
    tags?: string[];
    likes: number;
    saves: number;
    createdAt: Date;
    isLiked?: boolean;
    isSaved?: boolean;
}

export interface Folder {
    id: string;
    userId: string;
    name: string;
    description?: string;
    coverImage?: string;
    savedPosts: string[]; // Post IDs
    savedOutfits: string[]; // Outfit IDs
    createdAt: Date;
    updatedAt: Date;
    isPrivate: boolean;
}

export interface SavedCollection {
    folders: Folder[];
    allSavedPosts: string[];
    allSavedOutfits: string[];
}
