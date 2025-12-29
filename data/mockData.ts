/**
 * Mock Data - Social Posts & Clothing Items
 * Updated with 2 images per post and social feed structure
 */

// Mock Users (Your friends)
export interface User {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isFollowing: boolean;
    isFriend: boolean;
}

export const mockUsers: User[] = [
    {
        id: '1',
        name: 'María García',
        username: '@maria_style',
        avatar: 'https://i.pravatar.cc/150?img=1',
        isFollowing: true,
        isFriend: true,
    },
    {
        id: '2',
        name: 'Ana López',
        username: '@ana.fashion',
        avatar: 'https://i.pravatar.cc/150?img=5',
        isFollowing: true,
        isFriend: true,
    },
    {
        id: '3',
        name: 'Laura Martín',
        username: '@lauram',
        avatar: 'https://i.pravatar.cc/150?img=9',
        isFollowing: true,
        isFriend: false, // Friend of friend
    },
    {
        id: '4',
        name: 'Carmen Silva',
        username: '@carmen_looks',
        avatar: 'https://i.pravatar.cc/150?img=10',
        isFollowing: true,
        isFriend: true,
    },
    {
        id: '5',
        name: 'Sofía Torres',
        username: '@sofiat',
        avatar: 'https://i.pravatar.cc/150?img=16',
        isFollowing: true,
        isFriend: false, // Friend of friend
    },
];

// Clothing Items with no-background images
export interface ClothingItemData {
    id: string;
    name: string;
    brand: string;
    type: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessories';
    color: string;
    colorHex: string;
    imageUrl: string;
    price?: string;
    size?: string;
    reference?: string;
    isFavorite: boolean;
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
    fabric?: string;
}

// Real clothing images
export const mockClothingItems: ClothingItemData[] = [
    {
        id: '1',
        name: 'Blazer Oversize',
        brand: 'Zara',
        type: 'outerwear',
        color: 'Beige',
        colorHex: '#D4B59E',
        imageUrl: 'https://static.zara.net/photos///2023/I/0/1/p/2753/263/710/2/w/563/2753263710_1_1_1.jpg',
        price: '79.95€',
        size: 'M',
        reference: '2753263710',
        isFavorite: true,
        season: 'autumn',
        fabric: 'Lana',
    },
    {
        id: '2',
        name: 'Jeans Mom Fit',
        brand: "Levi's",
        type: 'bottom',
        color: 'Azul',
        colorHex: '#4A5A7A',
        imageUrl: 'https://lsco.scene7.com/is/image/lsco/726930208-front-pdp?fmt=jpeg&qlt=70&resMode=bisharp&fit=crop,0&op_usm=0.6,0.6,8&wid=400&hei=533',
        price: '89.90€',
        size: '28',
        isFavorite: true,
        season: 'spring',
        fabric: 'Denim',
    },
    {
        id: '3',
        name: 'Camisa Lino',
        brand: 'Mango',
        type: 'top',
        color: 'Blanco',
        colorHex: '#FFFFFF',
        imageUrl: 'https://st.mngbcn.com/rcs/pics/static/T6/fotos/S20/67095753_01.jpg',
        price: '35.99€',
        size: 'S',
        isFavorite: false,
        season: 'summer',
        fabric: 'Lino',
    },
    {
        id: '4',
        name: 'Falda Midi',
        brand: 'H&M',
        type: 'bottom',
        color: 'Negro',
        colorHex: '#000000',
        imageUrl: 'https://www2.hm.com/content/dam/hm/pimages/2023/08/0863789001.jpg',
        price: '29.99€',
        isFavorite: false,
        season: 'autumn',
        fabric: 'Poliéster',
    },
    {
        id: '5',
        name: 'Trench Coat',
        brand: 'Massimo Dutti',
        type: 'outerwear',
        color: 'Camel',
        colorHex: '#C2956E',
        imageUrl: 'https://static.massimodutti.net/3/photos4/2023/I/0/2/p/6428/614/700/6428614700_1_1_8.jpg',
        price: '149.00€',
        isFavorite: true,
        season: 'winter',
        fabric: 'Algodón',
    },
    {
        id: '6',
        name: 'Vestido Floral',
        brand: 'Zara',
        type: 'dress',
        color: 'Rosa',
        colorHex: '#FFB6C1',
        imageUrl: 'https://static.zara.net/photos///2023/V/0/1/p/4786/431/620/2/w/563/4786431620_1_1_1.jpg',
        price: '45.95€',
        isFavorite: true,
        season: 'spring',
        fabric: 'Viscosa',
    },
    {
        id: '7',
        name: 'Crop Top',
        brand: 'Pull&Bear',
        type: 'top',
        color: 'Verde',
        colorHex: '#90EE90',
        imageUrl: 'https://static.pullandbear.net/2/photos/2023/V/0/2/p/4241/418/505/4241418505_1_1_8.jpg',
        price: '19.99€',
        isFavorite: false,
        season: 'summer',
        fabric: 'Algodón',
    },
    {
        id: '8',
        name: 'Pantalón Wide Leg',
        brand: 'Bershka',
        type: 'bottom',
        color: 'Gris',
        colorHex: '#808080',
        imageUrl: 'https://static.bershka.net/4/photos2/2023/V/0/2/p/1526/644/802/1526644802_1_1_8.jpg',
        price: '25.99€',
        isFavorite: false,
        season: 'autumn',
        fabric: 'Poliéster',
    },
    {
        id: '9',
        name: 'Chaqueta Cuero',
        brand: 'Zara',
        type: 'outerwear',
        color: 'Negro',
        colorHex: '#000000',
        imageUrl: 'https://static.zara.net/photos///2023/I/0/1/p/8073/364/800/2/w/563/8073364800_1_1_1.jpg',
        price: '99.95€',
        isFavorite: true,
        season: 'winter',
        fabric: 'Cuero sintético',
    },
    {
        id: '10',
        name: 'Top Satinado',
        brand: 'Mango',
        type: 'top',
        color: 'Lila',
        colorHex: '#C8A2C8',
        imageUrl: 'https://st.mngbcn.com/rcs/pics/static/T7/fotos/S20/77095139_56.jpg',
        price: '29.99€',
        isFavorite: true,
        season: 'spring',
        fabric: 'Satén',
    },
];

// Social Feed Posts (Outfits from friends) - NOW WITH 2 IMAGES
export interface SocialPost {
    id: string;
    user: User;
    outfit: {
        name: string;
        items: ClothingItemData[];
        style: string;
    };
    images: {
        outfit: string; // Person wearing the outfit
        items: string; // Clothing items flat lay (no background)
    };
    likes: number;
    comments: number;
    isLiked: boolean;
    isSaved: boolean;
    createdAt: Date;
    caption?: string;
}

export const mockSocialPosts: SocialPost[] = [
    {
        id: 'post-1',
        user: mockUsers[0],
        outfit: {
            name: 'Look Casual Primavera',
            style: 'casual',
            items: [mockClothingItems[2], mockClothingItems[1]],
        },
        images: {
            outfit: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop',
            items: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=600&fit=crop',
        },
        likes: 234,
        comments: 12,
        isLiked: true,
        isSaved: false,
        createdAt: new Date(2025, 11, 28),
        caption: '¡Lista para el finde! 💕',
    },
    {
        id: 'post-2',
        user: mockUsers[1],
        outfit: {
            name: 'Office Chic',
            style: 'business',
            items: [mockClothingItems[0], mockClothingItems[3]],
        },
        images: {
            outfit: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=600&fit=crop',
            items: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=600&fit=crop',
        },
        likes: 456,
        comments: 28,
        isLiked: false,
        isSaved: true,
        createdAt: new Date(2025, 11, 27),
        caption: 'Lunes con energía ✨',
    },
    {
        id: 'post-3',
        user: mockUsers[2],
        outfit: {
            name: 'Date Night',
            style: 'romantic',
            items: [mockClothingItems[5], mockClothingItems[4]],
        },
        images: {
            outfit: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=600&fit=crop',
            items: 'https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=400&h=600&fit=crop',
        },
        likes: 789,
        comments: 45,
        isLiked: true,
        isSaved: true,
        createdAt: new Date(2025, 11, 26),
        caption: '💖',
    },
    {
        id: 'post-4',
        user: mockUsers[3],
        outfit: {
            name: 'Street Style',
            style: 'streetwear',
            items: [mockClothingItems[8], mockClothingItems[7]],
        },
        images: {
            outfit: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=600&fit=crop',
            items: 'https://images.unsplash.com/photo-1558769132-cb1aea9c4e0d?w=400&h=600&fit=crop',
        },
        likes: 567,
        comments: 34,
        isLiked: true,
        isSaved: false,
        createdAt: new Date(2025, 11, 25),
        caption: 'Vibes urbanas 🏙️',
    },
    {
        id: 'post-5',
        user: mockUsers[4],
        outfit: {
            name: 'Summer Vibes',
            style: 'casual',
            items: [mockClothingItems[6], mockClothingItems[1]],
        },
        images: {
            outfit: 'https://images.unsplash.com/photo-1544957992-20514f595d6f?w=400&h=600&fit=crop',
            items: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=600&fit=crop',
        },
        likes: 345,
        comments: 19,
        isLiked: false,
        isSaved: false,
        createdAt: new Date(2025, 11, 24),
        caption: 'Sunny days ☀️',
    },
    {
        id: 'post-6',
        user: mockUsers[0],
        outfit: {
            name: 'Elegancia Total',
            style: 'quietluxury',
            items: [mockClothingItems[9], mockClothingItems[3]],
        },
        images: {
            outfit: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=600&fit=crop',
            items: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&h=600&fit=crop',
        },
        likes: 890,
        comments: 56,
        isLiked: true,
        isSaved: true,
        createdAt: new Date(2025, 11, 23),
        caption: 'Less is more ✨',
    },
];

// Current user (you)
export const currentUser: User = {
    id: 'me',
    name: 'Tú',
    username: '@tuusuario',
    avatar: 'https://i.pravatar.cc/150?img=47',
    isFollowing: false,
    isFriend: false,
};

// Your wardrobe
export const myWardrobe = mockClothingItems.slice(0, 6);
