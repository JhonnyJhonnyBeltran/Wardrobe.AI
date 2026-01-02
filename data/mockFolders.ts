/**
 * Mock data for folders and saved posts
 */

import type { Folder, Post } from '@/types/social';

export const mockSavedPosts: Post[] = [
    {
        id: 'post-1',
        userId: 'user-2',
        userName: 'Maria García',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        images: [
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400'
        ],
        caption: 'Look perfecto para la oficina ✨',
        outfitItems: ['blazer-1', 'pants-1', 'heels-1'],
        tags: ['work', 'elegant', 'minimal'],
        likes: 234,
        saves: 89,
        createdAt: new Date('2025-12-15'),
        isLiked: true,
        isSaved: true,
    },
    {
        id: 'post-2',
        userId: 'user-3',
        userName: 'Laura Martínez',
        userAvatar: 'https://i.pravatar.cc/150?img=5',
        images: [
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
            'https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=400'
        ],
        caption: 'Casual weekend vibes 🌸',
        outfitItems: ['sweater-1', 'jeans-1', 'sneakers-1'],
        tags: ['casual', 'weekend', 'comfort'],
        likes: 189,
        saves: 67,
        createdAt: new Date('2025-12-20'),
        isLiked: false,
        isSaved: true,
    },
    {
        id: 'post-3',
        userId: 'user-4',
        userName: 'Sofia López',
        userAvatar: 'https://i.pravatar.cc/150?img=9',
        images: [
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400',
            'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400'
        ],
        caption: 'Summer dress collection 🌞',
        outfitItems: ['dress-1', 'sandals-1', 'bag-1'],
        tags: ['summer', 'dress', 'feminine'],
        likes: 312,
        saves: 145,
        createdAt: new Date('2025-12-18'),
        isLiked: true,
        isSaved: true,
    },
    {
        id: 'post-4',
        userId: 'user-5',
        userName: 'Carmen Ruiz',
        userAvatar: 'https://i.pravatar.cc/150?img=16',
        images: [
            'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400',
            'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400'
        ],
        caption: 'Night out ready 💃',
        outfitItems: ['dress-2', 'heels-2', 'clutch-1'],
        tags: ['party', 'elegant', 'night'],
        likes: 278,
        saves: 98,
        createdAt: new Date('2025-12-22'),
        isLiked: false,
        isSaved: true,
    },
];

export const mockFolders: Folder[] = [
    {
        id: 'folder-1',
        userId: 'user-1',
        name: 'Work Inspiration',
        description: 'Professional looks for the office',
        coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
        savedPosts: ['post-1'],
        savedOutfits: ['outfit-1', 'outfit-2'],
        createdAt: new Date('2025-11-01'),
        updatedAt: new Date('2025-12-15'),
        isPrivate: false,
    },
    {
        id: 'folder-2',
        userId: 'user-1',
        name: 'Casual Weekends',
        description: 'Comfy and stylish for weekends',
        coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
        savedPosts: ['post-2'],
        savedOutfits: ['outfit-3'],
        createdAt: new Date('2025-11-05'),
        updatedAt: new Date('2025-12-20'),
        isPrivate: true,
    },
    {
        id: 'folder-3',
        userId: 'user-1',
        name: 'Summer Inspo',
        description: 'Light and airy summer outfits',
        coverImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400',
        savedPosts: ['post-3'],
        savedOutfits: [],
        createdAt: new Date('2025-11-10'),
        updatedAt: new Date('2025-12-18'),
        isPrivate: false,
    },
    {
        id: 'folder-4',
        userId: 'user-1',
        name: 'Night Out',
        description: 'Party and event looks',
        coverImage: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400',
        savedPosts: ['post-4'],
        savedOutfits: ['outfit-4', 'outfit-5'],
        createdAt: new Date('2025-11-15'),
        updatedAt: new Date('2025-12-22'),
        isPrivate: true,
    },
];

// Helper functions
export const getFolderById = (folderId: string): Folder | undefined => {
    return mockFolders.find(folder => folder.id === folderId);
};

export const getPostById = (postId: string): Post | undefined => {
    return mockSavedPosts.find(post => post.id === postId);
};

export const getUserFolders = (userId: string): Folder[] => {
    return mockFolders.filter(folder => folder.userId === userId);
};

export const getPublicFolders = (): Folder[] => {
    return mockFolders.filter(folder => !folder.isPrivate);
};

export const getFolderPosts = (folderId: string): Post[] => {
    const folder = getFolderById(folderId);
    if (!folder) return [];

    return mockSavedPosts.filter(post =>
        folder.savedPosts.includes(post.id)
    );
};
