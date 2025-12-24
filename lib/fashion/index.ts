/**
 * Fashion Data Service for Klozet
 * Main entry point for fashion data operations
 * 
 * 🎯 Complete Fashion Data Pipeline:
 * - RSS Scraping (daily): ELLE, Vogue, WWW, Harper's Bazaar
 * - Web Scraping (weekly): Spanish/European magazines, retailers
 * - Trend Analysis (monthly): Lyst Index, cleanup
 */

import { fetchAllFeeds, getRecentArticles } from './scraper';
import { parseArticles, mergeTrends, mergeItems } from './parser';
import { extractWithAI, batchExtract } from './aiExtractor';
import {
    FashionTrend,
    ShoppableItem,
    Brand,
    FashionDataStore,
    KNOWN_BRANDS,
} from './types';

// Re-export all modules
export * from './types';
export * from './sources';
export * from './webScraper';
export * from './scheduler';
export * from './outfitGenerator';
export * from './outfitDatabase';
export { fetchAllFeeds, getRecentArticles } from './scraper';
export { parseArticles, mergeTrends, mergeItems } from './parser';
export { extractWithAI, batchExtract } from './aiExtractor';

/**
 * Fetch and process fashion data from all sources
 */
export async function fetchFashionData(options?: {
    useAI?: boolean;
    daysBack?: number;
}): Promise<FashionDataStore> {
    const { useAI = false, daysBack = 7 } = options || {};

    // 1. Fetch RSS feeds
    const articles = await getRecentArticles(daysBack);
    console.log(`Fetched ${articles.length} articles from RSS feeds`);

    // 2. Parse articles
    const parsedArticles = parseArticles(articles);

    // 3. Extract trends and items
    let trends = mergeTrends(parsedArticles);
    let items = mergeItems(parsedArticles);

    // 4. Optional: Enhance with AI
    if (useAI && process.env.OPENAI_API_KEY) {
        console.log('Enhancing data with AI extraction...');
        const aiResults = await batchExtract(
            articles.slice(0, 10).map(a => ({ title: a.title, content: a.description }))
        );

        // Merge AI-extracted data
        for (const result of aiResults) {
            for (const trend of result.trends) {
                const existing = trends.find(t => t.name.toLowerCase() === trend.name.toLowerCase());
                if (!existing) {
                    trends.push({
                        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: trend.name,
                        category: trend.category,
                        description: trend.description,
                        season: result.season || 'Winter 2025',
                        source: 'AI Enhanced',
                        sourceUrl: '',
                        popularity: 6,
                        relatedItems: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });
                }
            }

            for (const item of result.items) {
                const existing = items.find(i =>
                    i.brand.toLowerCase() === item.brand.toLowerCase() &&
                    i.type === item.type
                );
                if (!existing) {
                    items.push({
                        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: item.name,
                        brand: item.brand,
                        type: item.type,
                        description: item.description,
                        color: item.color,
                        priceRange: item.priceRange,
                        trending: true,
                        trendIds: [],
                        source: 'AI Enhanced',
                        createdAt: new Date().toISOString(),
                    });
                }
            }
        }
    }

    // 5. Build brands list
    const brands = buildBrandsList(items);

    return {
        trends,
        items,
        brands,
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Build brands list from items
 */
function buildBrandsList(items: ShoppableItem[]): Brand[] {
    const brandCounts = new Map<string, number>();

    for (const item of items) {
        const count = brandCounts.get(item.brand) || 0;
        brandCounts.set(item.brand, count + 1);
    }

    const brands: Brand[] = [];

    for (const [name, count] of brandCounts) {
        const knownBrand = KNOWN_BRANDS[name];
        brands.push({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            tier: knownBrand?.tier || 'contemporary',
            trendingScore: Math.min(100, count * 10),
        });
    }

    return brands.sort((a, b) => b.trendingScore - a.trendingScore);
}

/**
 * Get current trends formatted for display
 */
export function formatTrendsForDisplay(trends: FashionTrend[], limit: number = 5): string {
    return trends
        .slice(0, limit)
        .map((t, i) => `${i + 1}. **${t.name}** - ${t.description}`)
        .join('\n');
}

/**
 * Get trending items formatted for display
 */
export function formatItemsForDisplay(items: ShoppableItem[], limit: number = 5): string {
    return items
        .filter(i => i.trending)
        .slice(0, limit)
        .map((i, idx) => `${idx + 1}. ${i.brand} ${i.name} (${i.type})`)
        .join('\n');
}

/**
 * Generate chat context from fashion data
 */
export function generateChatContext(data: FashionDataStore): string {
    const trendsText = formatTrendsForDisplay(data.trends, 8);
    const itemsText = formatItemsForDisplay(data.items, 10);
    const topBrands = data.brands.slice(0, 5).map(b => b.name).join(', ');

    return `TENDENCIAS ACTUALES (${data.lastUpdated}):
${trendsText}

PRENDAS TRENDING:
${itemsText}

MARCAS MÁS POPULARES: ${topBrands}`;
}
