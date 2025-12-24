/**
 * 📅 Monthly Fashion Scraping Cron Job
 * Runs on the 1st of each month at 2:00 AM UTC
 * Scrapes trend data from Lyst Index, performs cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCronRequest, DEFAULT_SCHEDULER_CONFIG, createScrapingJob, updateJobStatus, cleanOldData } from '@/lib/fashion/scheduler';
import { TREND_SOURCES } from '@/lib/fashion/sources';
import { fetchHTML } from '@/lib/fashion/webScraper';
import { FashionDataStore, Brand, FashionTrend } from '@/lib/fashion/types';
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
 * Scrape Lyst Index for trending brands and products
 */
async function scrapeLystIndex(): Promise<{
    brands: Partial<Brand>[];
    trends: Partial<FashionTrend>[];
}> {
    const lystSource = TREND_SOURCES.find(s => s.id === 'lyst-index');
    if (!lystSource) {
        return { brands: [], trends: [] };
    }

    console.log('📊 Scraping Lyst Index...');

    try {
        const html = await fetchHTML(lystSource.url);
        if (!html) {
            console.error('  Failed to fetch Lyst Index');
            return { brands: [], trends: [] };
        }

        const brands: Partial<Brand>[] = [];
        const trends: Partial<FashionTrend>[] = [];

        // Extract brand names and rankings
        // Lyst Index typically lists top fashion brands quarterly
        const brandPatterns = [
            /(?:Top|#?\d+)[:\s]+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/g,
            /brand[:\s]+["']?([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)["']?/gi,
        ];

        const foundBrands = new Set<string>();
        for (const pattern of brandPatterns) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                const brandName = match[1].trim();
                if (brandName.length > 2 && brandName.length < 30) {
                    foundBrands.add(brandName);
                }
            }
        }

        // Common luxury/designer brands to look for
        const targetBrands = [
            'Miu Miu', 'Loewe', 'Prada', 'Bottega Veneta', 'Saint Laurent',
            'Gucci', 'Balenciaga', 'The Row', 'Alaïa', 'Jacquemus',
            'Valentino', 'Celine', 'Dior', 'Chanel', 'Hermès',
            'Totême', 'Khaite', 'Loro Piana', 'Max Mara', 'Isabel Marant'
        ];

        for (const brandName of targetBrands) {
            if (html.toLowerCase().includes(brandName.toLowerCase())) {
                foundBrands.add(brandName);
            }
        }

        let rank = 1;
        for (const brandName of foundBrands) {
            brands.push({
                id: brandName.toLowerCase().replace(/\s+/g, '-'),
                name: brandName,
                tier: 'luxury',
                trendingScore: Math.max(100 - (rank * 5), 50),
            });
            rank++;
        }

        console.log(`  Found ${brands.length} trending brands`);

        // Extract trending products/items mentioned
        const productPatterns = [
            /trending[:\s]+([^<\n]{10,50})/gi,
            /hot\s+product[:\s]+([^<\n]{10,50})/gi,
            /must[- ]have[:\s]+([^<\n]{10,50})/gi,
        ];

        const foundProducts = new Set<string>();
        for (const pattern of productPatterns) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                foundProducts.add(match[1].trim());
            }
        }

        for (const productName of foundProducts) {
            trends.push({
                id: `trend-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                name: productName,
                category: 'garment',
                description: `Trending item from Lyst Index`,
                source: 'Lyst Index',
                sourceUrl: lystSource.url,
                popularity: 8,
                season: getCurrentSeason(),
            });
        }

        console.log(`  Found ${trends.length} trending products`);

        return { brands, trends };
    } catch (error) {
        console.error('  Error scraping Lyst Index:', error);
        return { brands: [], trends: [] };
    }
}

/**
 * Get current season string
 */
function getCurrentSeason(): string {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();

    if (month >= 2 && month <= 4) return `Spring ${year}`;
    if (month >= 5 && month <= 7) return `Summer ${year}`;
    if (month >= 8 && month <= 10) return `Fall ${year}`;
    return `Winter ${year}`;
}

/**
 * Perform monthly analytics and generate insights
 */
function generateMonthlyInsights(data: FashionDataStore): {
    topTrends: string[];
    topBrands: string[];
    emergingTrends: string[];
    decayingItems: number;
} {
    // Get top 5 trends by popularity
    const topTrends = data.trends
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5)
        .map(t => t.name);

    // Get top 5 brands by trending score
    const topBrands = data.brands
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 5)
        .map(b => b.name);

    // Find emerging trends (new in last 30 days with high popularity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const emergingTrends = data.trends
        .filter(t => new Date(t.createdAt) > thirtyDaysAgo && t.popularity >= 7)
        .map(t => t.name);

    // Count items that would be cleaned (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const decayingItems = data.items.filter(
        i => new Date(i.createdAt) < ninetyDaysAgo
    ).length;

    return { topTrends, topBrands, emergingTrends, decayingItems };
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
    const job = createScrapingJob('monthly', DEFAULT_SCHEDULER_CONFIG.monthlySources);

    console.log('🚀 Starting monthly fashion maintenance...');

    const errors: string[] = [];

    try {
        // 1. Load existing data
        let existingData = await loadExistingData();
        if (!existingData) {
            existingData = {
                trends: [],
                items: [],
                brands: [],
                lastUpdated: new Date().toISOString(),
            };
        }

        // 2. Scrape Lyst Index for trending brands
        const lystData = await scrapeLystIndex();

        // 3. Merge Lyst brands with existing
        const brandMap = new Map<string, Brand>();
        for (const brand of existingData.brands) {
            brandMap.set(brand.name.toLowerCase(), brand);
        }
        for (const newBrand of lystData.brands) {
            if (!newBrand.name) continue;
            const key = newBrand.name.toLowerCase();
            const existing = brandMap.get(key);
            if (existing) {
                // Update trending score
                brandMap.set(key, {
                    ...existing,
                    trendingScore: Math.max(existing.trendingScore, newBrand.trendingScore || 50),
                });
            } else {
                brandMap.set(key, newBrand as Brand);
            }
        }

        // 4. Clean old data
        console.log('🧹 Cleaning old data...');
        const cleanedData = cleanOldData(existingData, 90);
        const itemsCleaned = existingData.items.length - cleanedData.items.length;
        const trendsCleaned = existingData.trends.length - cleanedData.trends.length;
        console.log(`  Cleaned ${itemsCleaned} old items, ${trendsCleaned} old trends`);

        // 5. Generate monthly insights
        const insights = generateMonthlyInsights({
            ...cleanedData,
            brands: Array.from(brandMap.values()),
        });
        console.log('\n📊 Monthly Insights:');
        console.log(`  Top Trends: ${insights.topTrends.join(', ')}`);
        console.log(`  Top Brands: ${insights.topBrands.join(', ')}`);
        console.log(`  Emerging: ${insights.emergingTrends.join(', ') || 'None'}`);

        // 6. Add Lyst trends to data
        const mergedTrends = [...cleanedData.trends];
        for (const lystTrend of lystData.trends) {
            const exists = mergedTrends.some(
                t => t.name.toLowerCase() === lystTrend.name?.toLowerCase()
            );
            if (!exists && lystTrend.name) {
                mergedTrends.push({
                    id: lystTrend.id || `trend-${Date.now()}`,
                    name: lystTrend.name,
                    category: lystTrend.category || 'garment',
                    description: lystTrend.description || '',
                    season: lystTrend.season || getCurrentSeason(),
                    source: lystTrend.source || 'Lyst Index',
                    sourceUrl: lystTrend.sourceUrl || '',
                    popularity: lystTrend.popularity || 7,
                    relatedItems: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }
        }

        // 7. Save updated data
        const updatedData: FashionDataStore = {
            trends: mergedTrends.slice(0, 50),
            items: cleanedData.items,
            brands: Array.from(brandMap.values())
                .sort((a, b) => b.trendingScore - a.trendingScore)
                .slice(0, 20),
            lastUpdated: new Date().toISOString(),
        };

        await saveData(updatedData);

        const duration = Date.now() - startTime;
        const stats = {
            sourcesProcessed: 1,
            articlesFound: 0,
            trendsExtracted: lystData.trends.length,
            itemsExtracted: 0,
            errors,
            duration,
        };

        const completedJob = updateJobStatus(job, 'completed', stats);

        console.log('\n✅ Monthly maintenance completed!');
        console.log(`  Duration: ${(duration / 1000).toFixed(1)}s`);
        console.log(`  Final counts: ${updatedData.trends.length} trends, ${updatedData.items.length} items, ${updatedData.brands.length} brands`);

        return NextResponse.json({
            success: true,
            job: completedJob,
            message: 'Monthly fashion maintenance completed',
            insights,
            cleanup: {
                itemsCleaned,
                trendsCleaned,
            },
            summary: {
                trendsTotal: updatedData.trends.length,
                itemsTotal: updatedData.items.length,
                brandsTotal: updatedData.brands.length,
            },
        });

    } catch (error) {
        console.error('❌ Monthly maintenance failed:', error);

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
