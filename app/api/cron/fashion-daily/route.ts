/**
 * 📅 Daily Fashion Scraping Cron Job
 * Runs every day at 6:00 AM UTC
 * Scrapes RSS feeds from major fashion publications
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCronRequest, DEFAULT_SCHEDULER_CONFIG, createScrapingJob, updateJobStatus } from '@/lib/fashion/scheduler';
import { fetchAllFeeds, getRecentArticles } from '@/lib/fashion/scraper';
import { parseArticles, mergeTrends, mergeItems } from '@/lib/fashion/parser';
import { FashionDataStore, FashionTrend, ShoppableItem } from '@/lib/fashion/types';
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

export async function GET(request: NextRequest) {
    // Validate cron request
    if (!validateCronRequest(request)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const startTime = Date.now();
    const job = createScrapingJob('daily', DEFAULT_SCHEDULER_CONFIG.dailySources);

    console.log('🚀 Starting daily fashion scrape...');

    try {
        // 1. Fetch RSS feeds
        console.log('📥 Fetching RSS feeds...');
        const articles = await getRecentArticles(1); // Last 24 hours
        console.log(`  Found ${articles.length} articles from RSS feeds`);

        // 2. Parse articles
        console.log('🔍 Parsing articles...');
        const parsedArticles = parseArticles(articles);

        // 3. Extract trends and items
        const newTrends = mergeTrends(parsedArticles);
        const newItems = mergeItems(parsedArticles);

        console.log(`  Extracted ${newTrends.length} trends and ${newItems.length} items`);

        // 4. Load existing data
        const existingData = await loadExistingData();

        // 5. Merge with existing data
        const mergedTrends = existingData
            ? [...existingData.trends]
            : [];

        // Add new trends, update popularity of existing
        for (const newTrend of newTrends) {
            const existingIndex = mergedTrends.findIndex(
                t => t.name.toLowerCase() === newTrend.name.toLowerCase()
            );

            if (existingIndex >= 0) {
                mergedTrends[existingIndex].popularity = Math.min(
                    10,
                    mergedTrends[existingIndex].popularity + 1
                );
                mergedTrends[existingIndex].updatedAt = new Date().toISOString();
            } else {
                mergedTrends.push(newTrend);
            }
        }

        const mergedItems = existingData
            ? [...existingData.items]
            : [];

        // Add new items (dedupe)
        for (const newItem of newItems) {
            const exists = mergedItems.some(
                i => i.brand === newItem.brand && i.name === newItem.name
            );
            if (!exists) {
                mergedItems.push(newItem);
            }
        }

        // 6. Save updated data
        const updatedData: FashionDataStore = {
            trends: mergedTrends.slice(0, 50),
            items: mergedItems.slice(0, 100),
            brands: existingData?.brands || [],
            lastUpdated: new Date().toISOString(),
        };

        await saveData(updatedData);

        const duration = Date.now() - startTime;
        const stats = {
            sourcesProcessed: DEFAULT_SCHEDULER_CONFIG.dailySources.length,
            articlesFound: articles.length,
            trendsExtracted: newTrends.length,
            itemsExtracted: newItems.length,
            errors: [],
            duration,
        };

        const completedJob = updateJobStatus(job, 'completed', stats);

        console.log('✅ Daily scrape completed!');
        console.log(`  Duration: ${duration}ms`);
        console.log(`  Trends: ${updatedData.trends.length}, Items: ${updatedData.items.length}`);

        return NextResponse.json({
            success: true,
            job: completedJob,
            message: 'Daily fashion scrape completed',
        });

    } catch (error) {
        console.error('❌ Daily scrape failed:', error);

        const duration = Date.now() - startTime;
        const stats = {
            sourcesProcessed: 0,
            articlesFound: 0,
            trendsExtracted: 0,
            itemsExtracted: 0,
            errors: [error instanceof Error ? error.message : 'Unknown error'],
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
