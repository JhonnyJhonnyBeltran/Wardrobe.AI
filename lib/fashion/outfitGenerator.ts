/**
 * 👗 Outfit Generator Service
 * 
 * Generates trendy outfit combinations using the latest fashion data from scraping.
 * Uses AI-powered matching algorithms and trend analysis.
 */

import {
    FashionTrend,
    ShoppableItem,
    Brand,
    FashionDataStore,
    ItemType,
    TrendCategory,
} from './types';

// ==================== TYPES ====================

export type OutfitStyle =
    | 'quietluxury'
    | 'streetwear'
    | 'casual'
    | 'formal'
    | 'romantic'
    | 'business'
    | 'boho'
    | 'sporty'
    | 'party'
    | 'trending';

export type OutfitOccasion =
    | 'everyday'
    | 'work'
    | 'date'
    | 'party'
    | 'weekend'
    | 'formal'
    | 'travel';

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface OutfitItem {
    id: string;
    name: string;
    brand: string;
    type: ItemType;
    color?: string;
    colorHex?: string;
    imageUrl?: string;
    buyLink?: string;
    price?: string;
    priceRange?: string;
    source: string;
    trending: boolean;
    matchScore: number; // 0-100, how well it matches the outfit
}

export interface GeneratedOutfit {
    id: string;
    name: string;
    style: OutfitStyle;
    occasion: OutfitOccasion;
    season: Season;
    description: string;
    items: OutfitItem[];
    totalItems: number;
    trendingScore: number; // 0-100
    estimatedPrice?: string;
    priceRange?: string;
    matchedTrends: string[]; // Trend names this outfit matches
    createdAt: string;
    aiGenerated: boolean;
}

export interface OutfitGenerationOptions {
    style?: OutfitStyle;
    occasion?: OutfitOccasion;
    season?: Season;
    preferredColors?: string[];
    preferredBrands?: string[];
    priceRange?: 'budget' | 'mid' | 'premium' | 'luxury' | 'any';
    mustIncludeTrends?: boolean;
    numberOfOutfits?: number;
    userClosetItems?: string[]; // IDs of items user owns
}

// ==================== STYLE CONFIGURATION ====================

const STYLE_CONFIGS: Record<OutfitStyle, {
    description: string;
    colorPalette: string[];
    preferredBrands: string[];
    keywords: string[];
    itemRatios: Record<ItemType, number>;
}> = {
    quietluxury: {
        description: 'Minimalismo elegante con tejidos premium y colores neutros',
        colorPalette: ['#F5F5DC', '#8B7355', '#D4C4B0', '#2D2D2D', '#FFFAF0'],
        preferredBrands: ['The Row', 'COS', 'Totême', 'Massimo Dutti', 'Loro Piana'],
        keywords: ['cashmere', 'lana', 'tailored', 'minimal', 'quality'],
        itemRatios: { top: 1, bottom: 1, shoes: 1, outerwear: 0.5, bag: 0.5, accessory: 0.3, dress: 0 },
    },
    streetwear: {
        description: 'Estilo urbano con sneakers y piezas oversize',
        colorPalette: ['#1A1A1A', '#FFFFFF', '#FF0000', '#0000FF', '#808080'],
        preferredBrands: ['Nike', 'Adidas', 'Zara', 'H&M', 'Mango'],
        keywords: ['oversize', 'sneaker', 'hoodie', 'denim', 'bomber'],
        itemRatios: { top: 1, bottom: 1, shoes: 1, outerwear: 0.7, bag: 0.3, accessory: 0.5, dress: 0 },
    },
    casual: {
        description: 'Look relajado y cómodo para el día a día',
        colorPalette: ['#6B8FAD', '#FFFFFF', '#F5F5DC', '#8B7355', '#2D2D2D'],
        preferredBrands: ['Zara', 'Mango', 'COS', "Levi's", 'H&M'],
        keywords: ['jeans', 'camiseta', 'sweater', 'comfortable'],
        itemRatios: { top: 1, bottom: 1, shoes: 1, outerwear: 0.3, bag: 0.5, accessory: 0.2, dress: 0.3 },
    },
    formal: {
        description: 'Elegancia clásica para ocasiones especiales',
        colorPalette: ['#1A1A1A', '#FFFFFF', '#8B0000', '#000080', '#C4A35A'],
        preferredBrands: ['Massimo Dutti', 'Sandro', 'Hugo Boss', 'Max Mara'],
        keywords: ['blazer', 'vestido', 'tacón', 'elegante', 'formal'],
        itemRatios: { top: 0.5, bottom: 0.5, shoes: 1, outerwear: 0.5, bag: 0.8, accessory: 0.7, dress: 1 },
    },
    romantic: {
        description: 'Looks femeninos con detalles delicados',
        colorPalette: ['#FFB6C1', '#E8C4A8', '#FFFAF0', '#DDA0DD', '#F5F5DC'],
        preferredBrands: ['Reformation', 'Sandro', 'Maje', 'Self-Portrait'],
        keywords: ['floral', 'lazo', 'seda', 'encaje', 'midi'],
        itemRatios: { top: 0.7, bottom: 0.5, shoes: 1, outerwear: 0.3, bag: 0.5, accessory: 0.8, dress: 1 },
    },
    business: {
        description: 'Profesional y sofisticado para la oficina',
        colorPalette: ['#2D2D2D', '#FFFFFF', '#000080', '#8B7355', '#808080'],
        preferredBrands: ['Massimo Dutti', 'COS', 'Arket', 'Theory'],
        keywords: ['blazer', 'pantalón', 'camisa', 'pencil', 'professional'],
        itemRatios: { top: 1, bottom: 1, shoes: 1, outerwear: 0.5, bag: 0.8, accessory: 0.5, dress: 0.5 },
    },
    boho: {
        description: 'Espíritu libre con estampados y texturas naturales',
        colorPalette: ['#8B4513', '#F5DEB3', '#228B22', '#DAA520', '#FFFAF0'],
        preferredBrands: ['Free People', 'Mango', 'Zara', 'Isabel Marant'],
        keywords: ['estampado', 'flecos', 'maxi', 'folk', 'natural'],
        itemRatios: { top: 1, bottom: 0.5, shoes: 1, outerwear: 0.5, bag: 0.7, accessory: 1, dress: 0.8 },
    },
    sporty: {
        description: 'Athleisure cómodo y moderno',
        colorPalette: ['#1A1A1A', '#FFFFFF', '#00FF00', '#FF6B6B', '#4169E1'],
        preferredBrands: ['Nike', 'Adidas', 'Lululemon', 'Alo Yoga'],
        keywords: ['sneaker', 'legging', 'hoodie', 'trainers'],
        itemRatios: { top: 1, bottom: 1, shoes: 1, outerwear: 0.5, bag: 0.3, accessory: 0.2, dress: 0 },
    },
    party: {
        description: 'Glamour nocturno con brillo y actitud',
        colorPalette: ['#1A1A1A', '#FFD700', '#C0C0C0', '#8B0000', '#4B0082'],
        preferredBrands: ['Zara', 'Mango', 'ASOS', 'Self-Portrait', 'Rotate'],
        keywords: ['lentejuelas', 'brillante', 'mini', 'tacón', 'fiesta'],
        itemRatios: { top: 0.5, bottom: 0.3, shoes: 1, outerwear: 0.3, bag: 0.8, accessory: 1, dress: 1 },
    },
    trending: {
        description: 'Lo más actual según las tendencias del momento',
        colorPalette: ['#C41E3A', '#F5F5DC', '#1A1A1A', '#8B0000', '#D4C4B0'],
        preferredBrands: ['Loewe', 'Miu Miu', 'Bottega Veneta', 'Jacquemus'],
        keywords: ['trending', 'viral', 'must-have'],
        itemRatios: { top: 1, bottom: 1, shoes: 1, outerwear: 0.5, bag: 0.8, accessory: 0.5, dress: 0.5 },
    },
};

const OCCASION_CONFIGS: Record<OutfitOccasion, {
    suitableStyles: OutfitStyle[];
    requiredItems: ItemType[];
}> = {
    everyday: {
        suitableStyles: ['casual', 'streetwear', 'quietluxury'],
        requiredItems: ['top', 'bottom', 'shoes'],
    },
    work: {
        suitableStyles: ['business', 'quietluxury', 'formal'],
        requiredItems: ['top', 'bottom', 'shoes'],
    },
    date: {
        suitableStyles: ['romantic', 'quietluxury', 'formal'],
        requiredItems: ['shoes'],
    },
    party: {
        suitableStyles: ['party', 'streetwear'],
        requiredItems: ['shoes'],
    },
    weekend: {
        suitableStyles: ['casual', 'boho', 'sporty'],
        requiredItems: ['top', 'bottom', 'shoes'],
    },
    formal: {
        suitableStyles: ['formal', 'quietluxury'],
        requiredItems: ['shoes'],
    },
    travel: {
        suitableStyles: ['casual', 'sporty', 'streetwear'],
        requiredItems: ['top', 'bottom', 'shoes', 'bag'],
    },
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculate color similarity (simple RGB distance)
 */
function colorDistance(hex1: string, hex2: string): number {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return 100;

    const distance = Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );

    return Math.max(0, 100 - (distance / 4.42)); // Normalize to 0-100 score
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}

/**
 * Get current season based on date
 */
function getCurrentSeason(): Season {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
}

/**
 * Generate unique ID
 */
function generateId(): string {
    return `outfit-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
}

/**
 * Calculate item match score for a style
 */
function calculateItemMatchScore(
    item: ShoppableItem,
    style: OutfitStyle,
    trends: FashionTrend[]
): number {
    let score = 50; // Base score

    const config = STYLE_CONFIGS[style];

    // Brand match (+20)
    if (config.preferredBrands.some(b =>
        b.toLowerCase() === item.brand.toLowerCase()
    )) {
        score += 20;
    }

    // Color match (+15)
    if (item.colorHex) {
        const colorMatches = config.colorPalette.map(c => colorDistance(c, item.colorHex!));
        const bestMatch = Math.max(...colorMatches);
        score += (bestMatch / 100) * 15;
    }

    // Keyword match (+10)
    const itemText = `${item.name} ${item.description}`.toLowerCase();
    const keywordMatches = config.keywords.filter(k => itemText.includes(k)).length;
    score += Math.min(keywordMatches * 5, 10);

    // Trending bonus (+15)
    if (item.trending) {
        score += 15;
    }

    // Trend alignment bonus (+10)
    for (const trendId of item.trendIds) {
        const trend = trends.find(t => t.id === trendId);
        if (trend && trend.popularity >= 7) {
            score += 5;
        }
    }

    return Math.min(score, 100);
}

/**
 * Estimate price range from items
 */
function estimatePriceRange(items: OutfitItem[]): { range: string; estimate: string } {
    const priceRanges = items.map(i => i.priceRange || 'mid');

    const rangeValues = { budget: 1, mid: 2, premium: 3, luxury: 4 };
    const avgValue = priceRanges.reduce((sum, r) =>
        sum + (rangeValues[r as keyof typeof rangeValues] || 2), 0
    ) / priceRanges.length;

    let range: string;
    let estimate: string;

    if (avgValue <= 1.5) {
        range = 'Budget';
        estimate = '50-150€';
    } else if (avgValue <= 2.5) {
        range = 'Mid-Range';
        estimate = '150-400€';
    } else if (avgValue <= 3.5) {
        range = 'Premium';
        estimate = '400-1000€';
    } else {
        range = 'Luxury';
        estimate = '1000€+';
    }

    return { range, estimate };
}

// ==================== MAIN GENERATOR ====================

/**
 * Generate outfit(s) based on options and fashion data
 */
export function generateOutfits(
    fashionData: FashionDataStore,
    options: OutfitGenerationOptions = {}
): GeneratedOutfit[] {
    const {
        style = 'trending',
        occasion = 'everyday',
        season = getCurrentSeason(),
        preferredColors = [],
        preferredBrands = [],
        priceRange = 'any',
        mustIncludeTrends = true,
        numberOfOutfits = 1,
    } = options;

    const { items, trends, brands } = fashionData;
    const outfits: GeneratedOutfit[] = [];

    // Filter items by price range if specified
    let availableItems = [...items];
    if (priceRange !== 'any') {
        availableItems = items.filter(i =>
            !i.priceRange || i.priceRange === priceRange
        );
    }

    // Filter by preferred brands if specified
    if (preferredBrands.length > 0) {
        const brandFilteredItems = availableItems.filter(i =>
            preferredBrands.some(b => b.toLowerCase() === i.brand.toLowerCase())
        );
        if (brandFilteredItems.length >= 4) {
            availableItems = brandFilteredItems;
        }
    }

    const styleConfig = STYLE_CONFIGS[style];
    const occasionConfig = OCCASION_CONFIGS[occasion];

    for (let n = 0; n < numberOfOutfits; n++) {
        // Score all items for this style
        const scoredItems = availableItems.map(item => ({
            ...item,
            matchScore: calculateItemMatchScore(item, style, trends),
        }));

        // Group items by type
        const itemsByType: Record<ItemType, typeof scoredItems> = {
            top: scoredItems.filter(i => i.type === 'top').sort((a, b) => b.matchScore - a.matchScore),
            bottom: scoredItems.filter(i => i.type === 'bottom').sort((a, b) => b.matchScore - a.matchScore),
            shoes: scoredItems.filter(i => i.type === 'shoes').sort((a, b) => b.matchScore - a.matchScore),
            outerwear: scoredItems.filter(i => i.type === 'outerwear').sort((a, b) => b.matchScore - a.matchScore),
            bag: scoredItems.filter(i => i.type === 'bag').sort((a, b) => b.matchScore - a.matchScore),
            accessory: scoredItems.filter(i => i.type === 'accessory').sort((a, b) => b.matchScore - a.matchScore),
            dress: scoredItems.filter(i => i.type === 'dress').sort((a, b) => b.matchScore - a.matchScore),
        };

        // Build outfit - select best items for each required type
        const outfitItems: OutfitItem[] = [];
        const usedItemIds = new Set<string>();

        // For dresses, we might skip top/bottom
        const useDress = Math.random() > 0.5 && itemsByType.dress.length > 0 &&
            (style === 'formal' || style === 'romantic' || style === 'party');

        const itemTypes: ItemType[] = useDress
            ? ['dress', 'shoes', 'bag', 'accessory', 'outerwear']
            : ['top', 'bottom', 'shoes', 'bag', 'outerwear', 'accessory'];

        for (const type of itemTypes) {
            const ratio = styleConfig.itemRatios[type];
            const shouldInclude = Math.random() < ratio || occasionConfig.requiredItems.includes(type);

            if (shouldInclude && itemsByType[type].length > 0) {
                // Select item (with some randomness for variety)
                const candidatePool = itemsByType[type].slice(0, 3);
                const randomIndex = Math.floor(Math.random() * candidatePool.length);
                const selectedItem = candidatePool[randomIndex];

                if (selectedItem && !usedItemIds.has(selectedItem.id)) {
                    usedItemIds.add(selectedItem.id);

                    outfitItems.push({
                        id: selectedItem.id,
                        name: selectedItem.name,
                        brand: selectedItem.brand,
                        type: selectedItem.type,
                        color: selectedItem.color,
                        colorHex: selectedItem.colorHex,
                        imageUrl: selectedItem.imageUrl,
                        buyLink: selectedItem.buyLink,
                        price: selectedItem.price,
                        priceRange: selectedItem.priceRange,
                        source: selectedItem.source,
                        trending: selectedItem.trending,
                        matchScore: selectedItem.matchScore,
                    });
                }
            }
        }

        // Calculate outfit scores
        const avgMatchScore = outfitItems.reduce((sum, i) => sum + i.matchScore, 0) / outfitItems.length;
        const trendingCount = outfitItems.filter(i => i.trending).length;
        const trendingScore = Math.round((trendingCount / outfitItems.length) * 100);

        // Find matched trends
        const matchedTrends: string[] = [];
        for (const trend of trends.slice(0, 10)) {
            // Check if any outfit item relates to this trend
            const trendName = trend.name.toLowerCase();
            const hasMatch = outfitItems.some(item => {
                const itemText = `${item.name} ${item.color || ''}`.toLowerCase();
                return itemText.includes(trendName.split(' ')[0]);
            });
            if (hasMatch || (mustIncludeTrends && trend.popularity >= 8)) {
                matchedTrends.push(trend.name);
            }
        }

        // Price estimation
        const { range: priceRangeLabel, estimate: estimatedPrice } = estimatePriceRange(outfitItems);

        // Generate outfit name
        const outfitName = generateOutfitName(style, occasion, matchedTrends[0]);

        outfits.push({
            id: generateId(),
            name: outfitName,
            style,
            occasion,
            season,
            description: styleConfig.description,
            items: outfitItems,
            totalItems: outfitItems.length,
            trendingScore,
            estimatedPrice,
            priceRange: priceRangeLabel,
            matchedTrends: matchedTrends.slice(0, 3),
            createdAt: new Date().toISOString(),
            aiGenerated: true,
        });
    }

    return outfits;
}

/**
 * Generate creative outfit name
 */
function generateOutfitName(style: OutfitStyle, occasion: OutfitOccasion, trend?: string): string {
    const styleNames: Record<OutfitStyle, string[]> = {
        quietluxury: ['Quiet Elegance', 'Understated Chic', 'Minimal Luxe'],
        streetwear: ['Urban Edge', 'Street Vibes', 'City Cool'],
        casual: ['Easy Chic', 'Effortless Style', 'Relaxed Mood'],
        formal: ['Elegant Evening', 'Classic Glamour', 'Refined Grace'],
        romantic: ['Soft Romance', 'Feminine Dream', 'Delicate Beauty'],
        business: ['Power Professional', 'Office Elegance', 'Corporate Chic'],
        boho: ['Free Spirit', 'Bohemian Dream', 'Natural Beauty'],
        sporty: ['Active Luxe', 'Athleisure Chic', 'Sport Elegant'],
        party: ['Night Glam', 'Party Ready', 'Festive Sparkle'],
        trending: ['Trending Now', 'It-Girl Approved', 'Must-Have Look'],
    };

    const names = styleNames[style];
    let name = names[Math.floor(Math.random() * names.length)];

    if (trend) {
        name = `${name} - ${trend}`;
    }

    return name;
}

/**
 * Get outfit recommendations based on current trends
 */
export function getTrendingOutfitRecommendations(
    fashionData: FashionDataStore,
    count: number = 5
): GeneratedOutfit[] {
    const styles: OutfitStyle[] = ['trending', 'quietluxury', 'streetwear', 'casual', 'romantic'];
    const occasions: OutfitOccasion[] = ['everyday', 'work', 'date', 'weekend', 'party'];

    const recommendations: GeneratedOutfit[] = [];

    for (let i = 0; i < count; i++) {
        const style = styles[i % styles.length];
        const occasion = occasions[i % occasions.length];

        const outfit = generateOutfits(fashionData, {
            style,
            occasion,
            mustIncludeTrends: true,
            numberOfOutfits: 1,
        })[0];

        if (outfit) {
            recommendations.push(outfit);
        }
    }

    return recommendations;
}

/**
 * Match user's closet items with trending pieces
 */
export function matchUserClosetWithTrends(
    userItems: ShoppableItem[],
    fashionData: FashionDataStore
): { item: ShoppableItem; matchingTrends: FashionTrend[]; score: number }[] {
    const matches: { item: ShoppableItem; matchingTrends: FashionTrend[]; score: number }[] = [];

    for (const item of userItems) {
        const matchingTrends: FashionTrend[] = [];
        let score = 0;

        for (const trend of fashionData.trends) {
            const itemText = `${item.name} ${item.description} ${item.color || ''}`.toLowerCase();
            const trendKeywords = trend.name.toLowerCase().split(' ');

            const keywordMatches = trendKeywords.filter(k => itemText.includes(k)).length;

            if (keywordMatches > 0 || item.trendIds.includes(trend.id)) {
                matchingTrends.push(trend);
                score += trend.popularity * 10;
            }
        }

        if (matchingTrends.length > 0) {
            matches.push({ item, matchingTrends, score });
        }
    }

    return matches.sort((a, b) => b.score - a.score);
}
