/**
 * Fashion Data Types for Klozet
 * Structures for trends, items, and brands from fashion sources
 */

// ==================== TRENDS ====================

export type TrendCategory = 'color' | 'garment' | 'style' | 'accessory' | 'pattern';

export interface FashionTrend {
    id: string;
    name: string;
    category: TrendCategory;
    description: string;
    season: string;
    source: string;
    sourceUrl: string;
    imageUrl?: string;
    popularity: number; // 1-10
    relatedItems: string[];
    createdAt: string;
    updatedAt: string;
}

// ==================== ITEMS ====================

export type ItemType = 'top' | 'bottom' | 'shoes' | 'accessory' | 'outerwear' | 'dress' | 'bag';
export type PriceRange = 'budget' | 'mid' | 'premium' | 'luxury';

export interface ShoppableItem {
    id: string;
    name: string;
    brand: string;
    type: ItemType;
    description: string;
    color?: string;
    colorHex?: string;
    buyLink?: string;
    price?: string;
    priceRange?: PriceRange;
    imageUrl?: string;
    trending: boolean;
    trendIds: string[];
    source: string;
    sourceUrl?: string;
    createdAt: string;
}

// ==================== BRANDS ====================

export type BrandTier = 'fast-fashion' | 'contemporary' | 'designer' | 'luxury';

export interface Brand {
    id: string;
    name: string;
    tier: BrandTier;
    trendingScore: number; // 1-100
    logoUrl?: string;
    website?: string;
}

// ==================== RSS FEED ====================

export interface RSSFeedItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    imageUrl?: string;
    source: string;
}

export interface ParsedArticle {
    title: string;
    url: string;
    description: string;
    publishedAt: string;
    imageUrl?: string;
    source: string;
    extractedTrends: Partial<FashionTrend>[];
    extractedItems: Partial<ShoppableItem>[];
}

// ==================== AI EXTRACTION ====================

export interface AIExtractionResult {
    trends: Array<{
        name: string;
        category: TrendCategory;
        description: string;
    }>;
    items: Array<{
        name: string;
        brand: string;
        type: ItemType;
        description: string;
        color?: string;
        priceRange?: PriceRange;
    }>;
    season?: string;
}

// ==================== FASHION DATA STORE ====================

export interface FashionDataStore {
    trends: FashionTrend[];
    items: ShoppableItem[];
    brands: Brand[];
    lastUpdated: string;
}

// ==================== CONFIG ====================

export interface FashionSourceConfig {
    name: string;
    url: string;
    type: 'rss' | 'web';
    enabled: boolean;
}

export const FASHION_SOURCES: FashionSourceConfig[] = [
    {
        name: 'ELLE',
        url: 'https://www.elle.com/rss/fashion.xml',
        type: 'rss',
        enabled: true,
    },
    {
        name: 'WhoWhatWear',
        url: 'https://www.whowhatwear.com/rss',
        type: 'rss',
        enabled: true,
    },
    {
        name: 'HarpersBazaar',
        url: 'https://www.harpersbazaar.com/rss/fashion.xml',
        type: 'rss',
        enabled: true,
    },
];

// Brand database for identification
export const KNOWN_BRANDS: Record<string, { tier: BrandTier; aliases: string[] }> = {
    'Zara': { tier: 'fast-fashion', aliases: [] },
    'H&M': { tier: 'fast-fashion', aliases: ['HM', 'H and M'] },
    'Mango': { tier: 'fast-fashion', aliases: [] },
    'COS': { tier: 'contemporary', aliases: [] },
    'Arket': { tier: 'contemporary', aliases: [] },
    'Reformation': { tier: 'contemporary', aliases: [] },
    'Sandro': { tier: 'contemporary', aliases: [] },
    'Massimo Dutti': { tier: 'contemporary', aliases: [] },
    'Levi\'s': { tier: 'contemporary', aliases: ['Levis'] },
    'Nike': { tier: 'contemporary', aliases: [] },
    'Adidas': { tier: 'contemporary', aliases: [] },
    'The Row': { tier: 'luxury', aliases: [] },
    'Loewe': { tier: 'luxury', aliases: [] },
    'Miu Miu': { tier: 'luxury', aliases: [] },
    'Prada': { tier: 'luxury', aliases: [] },
    'Gucci': { tier: 'luxury', aliases: [] },
    'Saint Laurent': { tier: 'luxury', aliases: ['YSL', 'Yves Saint Laurent'] },
    'Celine': { tier: 'luxury', aliases: ['Céline'] },
    'Chanel': { tier: 'luxury', aliases: [] },
    'Dior': { tier: 'luxury', aliases: ['Christian Dior'] },
    'Hermès': { tier: 'luxury', aliases: ['Hermes'] },
    'Bottega Veneta': { tier: 'luxury', aliases: ['Bottega'] },
    'Valentino': { tier: 'luxury', aliases: [] },
    'Balenciaga': { tier: 'luxury', aliases: [] },
    'Jacquemus': { tier: 'designer', aliases: [] },
    'Totême': { tier: 'designer', aliases: ['Toteme'] },
    'Khaite': { tier: 'designer', aliases: [] },
    'Alaïa': { tier: 'luxury', aliases: ['Alaia'] },
    'Loro Piana': { tier: 'luxury', aliases: [] },
    'Brunello Cucinelli': { tier: 'luxury', aliases: [] },
};

// Garment type keywords for classification
export const GARMENT_KEYWORDS: Record<ItemType, string[]> = {
    top: ['shirt', 'blouse', 'top', 'tee', 't-shirt', 'sweater', 'jumper', 'cardigan', 'hoodie', 'tank', 'camisole', 'pullover', 'knit'],
    bottom: ['jeans', 'pants', 'trousers', 'skirt', 'shorts', 'leggings', 'culottes', 'denim'],
    dress: ['dress', 'gown', 'frock', 'maxi', 'midi', 'mini dress'],
    outerwear: ['jacket', 'coat', 'blazer', 'parka', 'trench', 'bomber', 'puffer', 'vest', 'cardigan'],
    shoes: ['shoes', 'boots', 'sneakers', 'heels', 'flats', 'loafers', 'sandals', 'mules', 'trainers', 'pumps', 'stilettos'],
    accessory: ['bag', 'belt', 'scarf', 'hat', 'sunglasses', 'jewelry', 'earrings', 'necklace', 'bracelet', 'watch', 'brooch'],
    bag: ['bag', 'tote', 'clutch', 'purse', 'handbag', 'crossbody', 'shoulder bag', 'backpack'],
};
