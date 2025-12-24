/**
 * Fashion Content Parser for Klozet
 * Extracts trends and items from article content
 */

import {
    RSSFeedItem,
    ParsedArticle,
    FashionTrend,
    ShoppableItem,
    TrendCategory,
    ItemType,
    KNOWN_BRANDS,
    GARMENT_KEYWORDS,
} from './types';

/**
 * Generate unique ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Detect item type from text
 */
function detectItemType(text: string): ItemType | null {
    const lowerText = text.toLowerCase();

    for (const [type, keywords] of Object.entries(GARMENT_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                return type as ItemType;
            }
        }
    }

    return null;
}

/**
 * Detect trend category from text
 */
function detectTrendCategory(text: string): TrendCategory {
    const lowerText = text.toLowerCase();

    // Color patterns
    const colorKeywords = ['red', 'blue', 'green', 'pink', 'black', 'white', 'beige', 'cream', 'navy', 'burgundy', 'cherry', 'cobalt', 'emerald', 'teal', 'violet', 'yellow', 'orange', 'brown', 'grey', 'gray'];
    if (colorKeywords.some(c => lowerText.includes(c + ' ') || lowerText.startsWith(c))) {
        return 'color';
    }

    // Pattern keywords
    const patternKeywords = ['print', 'stripe', 'plaid', 'check', 'floral', 'leopard', 'animal', 'polka', 'geometric'];
    if (patternKeywords.some(p => lowerText.includes(p))) {
        return 'pattern';
    }

    // Accessory keywords
    const accessoryKeywords = ['bag', 'shoe', 'boot', 'jewelry', 'sunglasses', 'hat', 'scarf', 'belt'];
    if (accessoryKeywords.some(a => lowerText.includes(a))) {
        return 'accessory';
    }

    // Style keywords
    const styleKeywords = ['minimal', 'boho', 'chic', 'casual', 'formal', 'streetwear', 'athleisure', 'quiet luxury', 'old money'];
    if (styleKeywords.some(s => lowerText.includes(s))) {
        return 'style';
    }

    return 'garment';
}

/**
 * Extract brand mentions from text
 */
function extractBrands(text: string): string[] {
    const brands: string[] = [];
    const lowerText = text.toLowerCase();

    for (const [brandName, info] of Object.entries(KNOWN_BRANDS)) {
        const allNames = [brandName, ...info.aliases];
        for (const name of allNames) {
            if (lowerText.includes(name.toLowerCase())) {
                brands.push(brandName);
                break;
            }
        }
    }

    return [...new Set(brands)];
}

/**
 * Detect current season from date or text
 */
function detectSeason(date: string, text: string): string {
    const lowerText = text.toLowerCase();

    // Check for explicit season mentions
    if (lowerText.includes('spring') || lowerText.includes('ss ') || lowerText.includes('s/s')) {
        const year = new Date(date).getFullYear();
        return `Spring ${year}`;
    }
    if (lowerText.includes('summer')) {
        const year = new Date(date).getFullYear();
        return `Summer ${year}`;
    }
    if (lowerText.includes('fall') || lowerText.includes('autumn') || lowerText.includes('a/w')) {
        const year = new Date(date).getFullYear();
        return `Fall ${year}`;
    }
    if (lowerText.includes('winter') || lowerText.includes('fw ') || lowerText.includes('f/w')) {
        const year = new Date(date).getFullYear();
        return `Winter ${year}`;
    }

    // Default to current season based on date
    const month = new Date(date).getMonth();
    const year = new Date(date).getFullYear();

    if (month >= 2 && month <= 4) return `Spring ${year}`;
    if (month >= 5 && month <= 7) return `Summer ${year}`;
    if (month >= 8 && month <= 10) return `Fall ${year}`;
    return `Winter ${year}`;
}

/**
 * Extract trend names from title and description
 */
function extractTrendNames(title: string, description: string): string[] {
    const trends: string[] = [];
    const text = `${title} ${description}`;

    // Common trend phrase patterns
    const trendPatterns = [
        /the (\w+(?:\s\w+)?(?:\s\w+)?) trend/gi,
        /trending:\s*(\w+(?:\s\w+)?)/gi,
        /(\w+(?:\s\w+)?) is (trending|hot|in|everywhere)/gi,
        /best (\w+(?:\s\w+)?(?:\s\w+)?) for \d{4}/gi,
        /(\w+(?:\s\w+)?) style/gi,
    ];

    for (const pattern of trendPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const trend = match[1].trim();
            if (trend.length > 2 && trend.length < 40) {
                trends.push(trend);
            }
        }
    }

    return [...new Set(trends)];
}

/**
 * Parse RSS feed item into structured data
 */
export function parseArticle(item: RSSFeedItem): ParsedArticle {
    const extractedTrends: Partial<FashionTrend>[] = [];
    const extractedItems: Partial<ShoppableItem>[] = [];

    const season = detectSeason(item.pubDate, `${item.title} ${item.description}`);
    const brands = extractBrands(`${item.title} ${item.description}`);
    const trendNames = extractTrendNames(item.title, item.description);

    // Create trends from detected names
    for (const name of trendNames) {
        extractedTrends.push({
            id: generateId(),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            category: detectTrendCategory(name),
            description: item.description.slice(0, 150),
            season,
            source: item.source,
            sourceUrl: item.link,
            imageUrl: item.imageUrl,
            popularity: 5, // Default, can be adjusted based on engagement
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }

    // Create items from brand mentions
    for (const brand of brands) {
        const itemType = detectItemType(`${item.title} ${item.description}`);
        if (itemType) {
            extractedItems.push({
                id: generateId(),
                name: `${brand} ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`,
                brand,
                type: itemType,
                description: item.description.slice(0, 100),
                trending: true,
                trendIds: extractedTrends.map(t => t.id!),
                source: item.source,
                sourceUrl: item.link,
                createdAt: new Date().toISOString(),
            });
        }
    }

    return {
        title: item.title,
        url: item.link,
        description: item.description,
        publishedAt: item.pubDate,
        imageUrl: item.imageUrl,
        source: item.source,
        extractedTrends,
        extractedItems,
    };
}

/**
 * Parse multiple RSS items
 */
export function parseArticles(items: RSSFeedItem[]): ParsedArticle[] {
    return items.map(parseArticle);
}

/**
 * Merge and deduplicate trends
 */
export function mergeTrends(articles: ParsedArticle[]): FashionTrend[] {
    const trendMap = new Map<string, FashionTrend>();

    for (const article of articles) {
        for (const trend of article.extractedTrends) {
            const key = trend.name?.toLowerCase();
            if (!key) continue;

            if (trendMap.has(key)) {
                // Increase popularity for duplicate trends
                const existing = trendMap.get(key)!;
                existing.popularity = Math.min(10, existing.popularity + 1);
                existing.updatedAt = new Date().toISOString();
            } else {
                trendMap.set(key, trend as FashionTrend);
            }
        }
    }

    return Array.from(trendMap.values())
        .sort((a, b) => b.popularity - a.popularity);
}

/**
 * Merge and deduplicate items
 */
export function mergeItems(articles: ParsedArticle[]): ShoppableItem[] {
    const itemMap = new Map<string, ShoppableItem>();

    for (const article of articles) {
        for (const item of article.extractedItems) {
            const key = `${item.brand}-${item.type}`.toLowerCase();

            if (!itemMap.has(key)) {
                itemMap.set(key, item as ShoppableItem);
            }
        }
    }

    return Array.from(itemMap.values());
}
