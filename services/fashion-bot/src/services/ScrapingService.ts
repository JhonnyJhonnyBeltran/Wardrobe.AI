/**
 * 🕷️ Scraping Service
 * 
 * Handles periodic scraping of fashion sources including:
 * - RSS feeds from major fashion publications
 * - Web scraping of fashion websites
 * - Retailer product pages
 */

import { logger } from '../utils/logger.js';
import { DataStore, FashionTrend, ShoppableItem, Brand } from './DataStore.js';

// ==================== TYPES ====================

interface RSSItem {
    title: string;
    link: string;
    description?: string;
    pubDate?: string;
    content?: string;
}

interface ScrapingResult {
    source: string;
    trends: Partial<FashionTrend>[];
    items: Partial<ShoppableItem>[];
    brands: Partial<Brand>[];
    error?: string;
}

// ==================== RSS SOURCES ====================

const RSS_SOURCES = [
    {
        name: 'WhoWhatWear',
        url: 'https://www.whowhatwear.com/rss',
        category: 'trends',
    },
    {
        name: 'ELLE',
        url: 'https://www.elle.com/rss/fashion.xml',
        category: 'trends',
    },
    {
        name: 'HarpersBazaar',
        url: 'https://www.harpersbazaar.com/rss/fashion.xml',
        category: 'premium',
    },
    {
        name: 'Vogue',
        url: 'https://www.vogue.com/feed/rss',
        category: 'luxury',
    },
];

// ==================== KEYWORD EXTRACTORS ====================

const TREND_KEYWORDS = [
    'trend', 'trending', 'must-have', 'it-girl', 'viral', 'obsessed',
    'everywhere', 'spring 2025', 'winter 2025', 'summer 2025', 'fall 2025',
    'quiet luxury', 'old money', 'mob wife', 'coastal', 'boho', 'minimalist',
];

const COLOR_TRENDS = [
    { name: 'Cherry Red', hex: '#C41E3A', keywords: ['cherry', 'red', 'scarlet', 'crimson'] },
    { name: 'Burgundy', hex: '#722F37', keywords: ['burgundy', 'wine', 'maroon'] },
    { name: 'Butter Yellow', hex: '#F9E79F', keywords: ['butter', 'yellow', 'lemon'] },
    { name: 'Sage Green', hex: '#9CAF88', keywords: ['sage', 'olive', 'moss'] },
    { name: 'Chocolate Brown', hex: '#5C4033', keywords: ['chocolate', 'brown', 'espresso'] },
    { name: 'Powder Blue', hex: '#B0E0E6', keywords: ['powder blue', 'baby blue', 'sky'] },
];

const GARMENT_TYPES: Record<string, ShoppableItem['type']> = {
    'blazer': 'outerwear',
    'jacket': 'outerwear',
    'coat': 'outerwear',
    'cardigan': 'outerwear',
    'sweater': 'top',
    'jersey': 'top',
    'blouse': 'top',
    'shirt': 'top',
    'top': 'top',
    'camiseta': 'top',
    'jeans': 'bottom',
    'pants': 'bottom',
    'pantalon': 'bottom',
    'skirt': 'bottom',
    'falda': 'bottom',
    'dress': 'dress',
    'vestido': 'dress',
    'boots': 'shoes',
    'botas': 'shoes',
    'sneakers': 'shoes',
    'heels': 'shoes',
    'loafers': 'shoes',
    'flats': 'shoes',
    'bag': 'bag',
    'bolso': 'bag',
    'purse': 'bag',
    'tote': 'bag',
};

const KNOWN_BRANDS = [
    { name: 'Zara', tier: 'fast-fashion' as const },
    { name: 'Mango', tier: 'fast-fashion' as const },
    { name: 'H&M', tier: 'fast-fashion' as const },
    { name: 'COS', tier: 'contemporary' as const },
    { name: 'Massimo Dutti', tier: 'contemporary' as const },
    { name: "Levi's", tier: 'contemporary' as const },
    { name: 'Sandro', tier: 'premium' as const },
    { name: 'Maje', tier: 'premium' as const },
    { name: 'Reformation', tier: 'premium' as const },
    { name: 'The Row', tier: 'designer' as const },
    { name: 'Totême', tier: 'designer' as const },
    { name: 'Loewe', tier: 'luxury' as const },
    { name: 'Bottega Veneta', tier: 'luxury' as const },
    { name: 'Jacquemus', tier: 'designer' as const },
    { name: 'Gucci', tier: 'luxury' as const },
    { name: 'Prada', tier: 'luxury' as const },
    { name: 'Nike', tier: 'contemporary' as const },
    { name: 'Adidas', tier: 'contemporary' as const },
    { name: 'Dr. Martens', tier: 'contemporary' as const },
    { name: 'Veja', tier: 'contemporary' as const },
];

// ==================== SCRAPING SERVICE ====================

export class ScrapingService {
    private dataStore: DataStore;
    private isRunning: boolean = false;
    private lastRun: Date | null = null;

    constructor(dataStore: DataStore) {
        this.dataStore = dataStore;
    }

    // ==================== MAIN SCRAPING METHODS ====================

    async runDailyScrape(): Promise<ScrapingResult[]> {
        if (this.isRunning) {
            logger.warn('Scraping already in progress, skipping...');
            return [];
        }

        this.isRunning = true;
        const results: ScrapingResult[] = [];

        try {
            logger.info('🚀 Starting daily scrape...');

            for (const source of RSS_SOURCES) {
                try {
                    logger.info(`📡 Scraping ${source.name}...`);
                    const result = await this.scrapeRSSFeed(source);
                    results.push(result);

                    // Merge data
                    this.dataStore.mergeData({
                        trends: result.trends as FashionTrend[],
                        items: result.items as ShoppableItem[],
                        brands: result.brands as Brand[],
                    });

                    // Rate limiting
                    await this.delay(2000);
                } catch (error) {
                    logger.error(`Error scraping ${source.name}:`, error);
                    results.push({
                        source: source.name,
                        trends: [],
                        items: [],
                        brands: [],
                        error: String(error),
                    });
                }
            }

            // Save updated data
            await this.dataStore.saveData();

            this.lastRun = new Date();
            logger.info(`✅ Daily scrape completed. Found ${results.reduce((sum, r) => sum + r.trends.length, 0)} trends`);

        } finally {
            this.isRunning = false;
        }

        return results;
    }

    async runWeeklyScrape(): Promise<ScrapingResult[]> {
        logger.info('🚀 Starting weekly deep scrape...');

        // Run daily scrape first
        const dailyResults = await this.runDailyScrape();

        // Clean old data
        const cleaned = this.dataStore.cleanOldData(90);
        if (cleaned > 0) {
            logger.info(`🧹 Cleaned ${cleaned} old items`);
        }

        // Save data
        await this.dataStore.saveData();

        return dailyResults;
    }

    // ==================== RSS SCRAPING ====================

    private async scrapeRSSFeed(source: { name: string; url: string; category: string }): Promise<ScrapingResult> {
        const result: ScrapingResult = {
            source: source.name,
            trends: [],
            items: [],
            brands: [],
        };

        try {
            const response = await fetch(source.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; FashionBot/1.0)',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const xml = await response.text();
            const items = this.parseRSSXML(xml);

            logger.info(`  Found ${items.length} articles from ${source.name}`);

            for (const item of items.slice(0, 15)) { // Process top 15 items
                const extracted = this.extractFromArticle(item, source.name);
                result.trends.push(...extracted.trends);
                result.items.push(...extracted.items);
                result.brands.push(...extracted.brands);
            }

        } catch (error) {
            logger.error(`RSS fetch error for ${source.name}:`, error);
            result.error = String(error);
        }

        return result;
    }

    // ==================== PARSING ====================

    private parseRSSXML(xml: string): RSSItem[] {
        const items: RSSItem[] = [];

        // Simple regex-based XML parser
        const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

        for (const itemXml of itemMatches) {
            const title = this.extractXMLTag(itemXml, 'title');
            const link = this.extractXMLTag(itemXml, 'link');
            const description = this.extractXMLTag(itemXml, 'description');
            const pubDate = this.extractXMLTag(itemXml, 'pubDate');
            const content = this.extractXMLTag(itemXml, 'content:encoded') ||
                this.extractXMLTag(itemXml, 'content');

            if (title && link) {
                items.push({ title, link, description, pubDate, content });
            }
        }

        return items;
    }

    private extractXMLTag(xml: string, tag: string): string | undefined {
        const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
        const match = xml.match(regex);
        return match ? match[1].trim() : undefined;
    }

    private extractFromArticle(item: RSSItem, source: string): {
        trends: Partial<FashionTrend>[];
        items: Partial<ShoppableItem>[];
        brands: Partial<Brand>[];
    } {
        const result = {
            trends: [] as Partial<FashionTrend>[],
            items: [] as Partial<ShoppableItem>[],
            brands: [] as Partial<Brand>[],
        };

        const text = `${item.title} ${item.description || ''} ${item.content || ''}`.toLowerCase();

        // Check if article is fashion-related
        const isFashionRelated = TREND_KEYWORDS.some(k => text.includes(k.toLowerCase())) ||
            Object.keys(GARMENT_TYPES).some(g => text.includes(g.toLowerCase()));

        if (!isFashionRelated) return result;

        // Extract color trends
        for (const colorTrend of COLOR_TRENDS) {
            if (colorTrend.keywords.some(k => text.includes(k))) {
                result.trends.push({
                    id: `trend-${colorTrend.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
                    name: colorTrend.name,
                    category: 'color',
                    description: item.title,
                    season: this.extractSeason(text),
                    source,
                    sourceUrl: item.link,
                    popularity: 5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }
        }

        // Extract garment mentions
        for (const [keyword, type] of Object.entries(GARMENT_TYPES)) {
            if (text.includes(keyword)) {
                // Look for brand mentions
                const brandMatch = KNOWN_BRANDS.find(b =>
                    text.includes(b.name.toLowerCase())
                );

                if (brandMatch) {
                    result.items.push({
                        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
                        name: `${brandMatch.name} ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
                        brand: brandMatch.name,
                        type,
                        description: item.title,
                        trending: true,
                        trendIds: [],
                        source,
                        createdAt: new Date().toISOString(),
                    });

                    // Add brand if not exists
                    if (!result.brands.find(b => b.name === brandMatch.name)) {
                        result.brands.push({
                            id: brandMatch.name.toLowerCase().replace(/\s+/g, '-'),
                            name: brandMatch.name,
                            tier: brandMatch.tier,
                            trendingScore: 50,
                        });
                    }
                }
            }
        }

        // Extract style trends
        const styleTrends = ['quiet luxury', 'minimalist', 'boho', 'coastal', 'mob wife', 'old money'];
        for (const style of styleTrends) {
            if (text.includes(style)) {
                result.trends.push({
                    id: `trend-${style.replace(/\s+/g, '-')}-${Date.now()}`,
                    name: style.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    category: 'style',
                    description: item.title,
                    season: this.extractSeason(text),
                    source,
                    sourceUrl: item.link,
                    popularity: 6,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }
        }

        return result;
    }

    private extractSeason(text: string): string {
        const seasons = ['spring', 'summer', 'fall', 'autumn', 'winter'];
        const years = ['2024', '2025', '2026'];

        for (const year of years) {
            for (const season of seasons) {
                if (text.includes(`${season} ${year}`) || text.includes(`${season}/${year}`)) {
                    return `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
                }
            }
        }

        // Default to current season
        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        if (month >= 2 && month <= 4) return `Spring ${year}`;
        if (month >= 5 && month <= 7) return `Summer ${year}`;
        if (month >= 8 && month <= 10) return `Fall ${year}`;
        return `Winter ${year}`;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ==================== STATUS ====================

    getStatus() {
        return {
            isRunning: this.isRunning,
            lastRun: this.lastRun?.toISOString() || null,
            sources: RSS_SOURCES.map(s => s.name),
        };
    }
}
