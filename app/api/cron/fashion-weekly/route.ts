/**
 * 📅 Weekly Fashion Scraping Cron Job
 * Runs every Sunday at 3:00 AM UTC
 * Scrapes web sources (Spanish/European magazines, retailers)
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCronRequest, DEFAULT_SCHEDULER_CONFIG, createScrapingJob, updateJobStatus, mergeTrendsData, mergeItemsData } from '@/lib/fashion/scheduler';
import { WEB_SOURCES, RETAILER_SOURCES, ALL_FASHION_SOURCES } from '@/lib/fashion/sources';
import { scrapeWebSources, scrapeRetailerProducts, ScrapedProduct } from '@/lib/fashion/webScraper';
import { FashionDataStore, ShoppableItem, FashionTrend, Brand } from '@/lib/fashion/types';
import { parseArticles, mergeTrends, mergeItems } from '@/lib/fashion/parser';
import * as fs from 'fs/promises';
import path from 'path';

// Path to data file
const DATA_FILE = path.join(process.cwd(), 'data', 'fashionData.json');

/**
 * Load existing fashion data
 */
async function loadExistingData(): Promise<FashionDataStore | null> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data) as FashionDataStore;
    } catch {
        return null;
    }
}

/**
 * Save fashion data
 */
async function saveData(data: FashionDataStore): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 4), 'utf-8');
}

/**
 * Convert scraped products to ShoppableItems
 */
function productsToItems(products: ScrapedProduct[]): Partial<ShoppableItem>[] {
    return products.map(product => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: product.name,
        brand: product.brand,
        type: detectItemType(product.name),
        description: `${product.brand} ${product.name}`,
        price: product.price,
        priceRange: detectPriceRange(product.price),
        imageUrl: product.imageUrl,
        buyLink: product.productUrl,
        trending: true,
        trendIds: [],
        source: product.source,
        createdAt: new Date().toISOString(),
    }));
}

/**
 * Detect item type from name
 */
function detectItemType(name: string): ShoppableItem['type'] {
    const lowerName = name.toLowerCase();

    if (/vestido|dress/i.test(lowerName)) return 'dress';
    if (/pantalón|pants|jeans|vaquero/i.test(lowerName)) return 'bottom';
    if (/falda|skirt/i.test(lowerName)) return 'bottom';
    if (/camisa|blusa|top|camiseta|jersey|sudadera/i.test(lowerName)) return 'top';
    if (/abrigo|chaqueta|cazadora|blazer|coat|jacket/i.test(lowerName)) return 'outerwear';
    if (/zapato|bota|sneaker|sandalia|tacón|shoes|boots/i.test(lowerName)) return 'shoes';
    if (/bolso|bag|mochila|cartera/i.test(lowerName)) return 'bag';
    if (/collar|pendiente|anillo|gafas|cinturón/i.test(lowerName)) return 'accessory';

    return 'top'; // Default
}

/**
 * Detect price range from price string
 */
function detectPriceRange(price?: string): ShoppableItem['priceRange'] {
    if (!price) return undefined;

    // Extract numeric value
    const numericPrice = parseFloat(price.replace(/[^0-9.,]/g, '').replace(',', '.'));

    if (isNaN(numericPrice)) return undefined;

    if (numericPrice < 50) return 'budget';
    if (numericPrice < 150) return 'mid';
    if (numericPrice < 500) return 'premium';
    return 'luxury';
}

export async function GET(request: NextRequest) {
    // Validate cron request
    if (!validateCronRequest(request)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const startTime = Date.now();
    const job = createScrapingJob('weekly', DEFAULT_SCHEDULER_CONFIG.weeklySources);

    console.log('🚀 Starting weekly fashion scrape...');
    console.log('  Sources:', DEFAULT_SCHEDULER_CONFIG.weeklySources.join(', '));

    const errors: string[] = [];
    let articlesFound = 0;
    let productsFound = 0;

    try {
        // 1. Scrape web sources (magazines)
        console.log('\n📰 Scraping magazine websites...');
        const webSourcesToScrape = WEB_SOURCES.filter(s =>
            s.enabled && DEFAULT_SCHEDULER_CONFIG.weeklySources.includes(s.id)
        );

        const webArticles = await scrapeWebSources(webSourcesToScrape);
        articlesFound = webArticles.length;
        console.log(`  Found ${webArticles.length} articles`);

        // 2. Scrape retailer products
        console.log('\n🛍️ Scraping retailer products...');
        const retailerSources = RETAILER_SOURCES.filter(s =>
            s.enabled && DEFAULT_SCHEDULER_CONFIG.weeklySources.includes(s.id)
        );

        const allProducts: ScrapedProduct[] = [];
        for (const source of retailerSources) {
            try {
                const products = await scrapeRetailerProducts(source);
                allProducts.push(...products);
            } catch (error) {
                console.error(`  Error scraping ${source.name}:`, error);
                errors.push(`${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        productsFound = allProducts.length;
        console.log(`  Found ${allProducts.length} products`);

        // 3. Parse web articles
        const parsedArticles = parseArticles(webArticles);
        const newTrends = mergeTrends(parsedArticles);
        const newItemsFromArticles = mergeItems(parsedArticles);

        // 4. Convert products to items
        const newItemsFromProducts = productsToItems(allProducts);

        // 5. Load existing data
        const existingData = await loadExistingData();

        // 6. Merge all data
        const mergedTrends = mergeTrendsData(
            existingData?.trends || [],
            newTrends
        );

        const mergedItems = mergeItemsData(
            existingData?.items || [],
            [...newItemsFromArticles, ...newItemsFromProducts]
        );

        // 7. Update brand trending scores based on item mentions
        const brandCounts: Record<string, number> = {};
        for (const item of mergedItems) {
            brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
        }

        const updatedBrands: Brand[] = (existingData?.brands || []).map(brand => ({
            ...brand,
            trendingScore: Math.min(100, (brandCounts[brand.name] || 0) * 5 + brand.trendingScore * 0.8),
        }));

        // Add new brands
        for (const [brandName, count] of Object.entries(brandCounts)) {
            if (!updatedBrands.some(b => b.name === brandName)) {
                updatedBrands.push({
                    id: brandName.toLowerCase().replace(/\s+/g, '-'),
                    name: brandName,
                    tier: 'contemporary',
                    trendingScore: count * 5,
                });
            }
        }

        // 8. Save updated data
        const updatedData: FashionDataStore = {
            trends: mergedTrends,
            items: mergedItems,
            brands: updatedBrands.sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 20),
            lastUpdated: new Date().toISOString(),
        };

        await saveData(updatedData);

        const duration = Date.now() - startTime;
        const stats = {
            sourcesProcessed: webSourcesToScrape.length + retailerSources.length,
            articlesFound,
            trendsExtracted: newTrends.length,
            itemsExtracted: newItemsFromArticles.length + newItemsFromProducts.length,
            errors,
            duration,
        };

        const completedJob = updateJobStatus(job, 'completed', stats);

        console.log('\n✅ Weekly scrape completed!');
        console.log(`  Duration: ${(duration / 1000).toFixed(1)}s`);
        console.log(`  Trends: ${updatedData.trends.length}`);
        console.log(`  Items: ${updatedData.items.length}`);
        console.log(`  Brands: ${updatedData.brands.length}`);

        return NextResponse.json({
            success: true,
            job: completedJob,
            message: 'Weekly fashion scrape completed',
            summary: {
                articlesScraped: articlesFound,
                productsScraped: productsFound,
                trendsTotal: updatedData.trends.length,
                itemsTotal: updatedData.items.length,
                brandsTotal: updatedData.brands.length,
            },
        });

    } catch (error) {
        console.error('❌ Weekly scrape failed:', error);

        const duration = Date.now() - startTime;
        const stats = {
            sourcesProcessed: 0,
            articlesFound: 0,
            trendsExtracted: 0,
            itemsExtracted: 0,
            errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
            duration,
        };

        const failedJob = updateJobStatus(job, 'failed', stats);

        return NextResponse.json({
            success: false,
            job: failedJob,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
    return GET(request);
}
