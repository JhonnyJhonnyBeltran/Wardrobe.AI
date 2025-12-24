/**
 * 📊 Fashion Scraping Status API
 * Returns the current status of the fashion data pipeline
 */

import { NextRequest, NextResponse } from 'next/server';
import { FashionDataStore } from '@/lib/fashion/types';
import { ALL_FASHION_SOURCES, getSourcesByFrequency, getSourcesNeedingUpdate } from '@/lib/fashion/sources';
import { CRON_SCHEDULES, getSchedulerStats, initSchedulerState } from '@/lib/fashion/scheduler';
import * as fs from 'fs/promises';
import path from 'path';

// Path to data file
const DATA_FILE = path.join(process.cwd(), 'data', 'fashionData.json');

/**
 * Get file modification time
 */
async function getFileModTime(filePath: string): Promise<Date | null> {
    try {
        const stats = await fs.stat(filePath);
        return stats.mtime;
    } catch {
        return null;
    }
}

/**
 * Load fashion data for stats
 */
async function loadFashionData(): Promise<FashionDataStore | null> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        // Load current data
        const fashionData = await loadFashionData();
        const dataFileModTime = await getFileModTime(DATA_FILE);

        // Get source stats
        const enabledSources = ALL_FASHION_SOURCES.filter(s => s.enabled);
        const dailySources = getSourcesByFrequency('daily');
        const weeklySources = getSourcesByFrequency('weekly');
        const monthlySources = getSourcesByFrequency('monthly');

        // Calculate next scheduled runs
        const now = new Date();

        // Next daily (6:00 AM UTC)
        const nextDaily = new Date(now);
        nextDaily.setUTCHours(6, 0, 0, 0);
        if (nextDaily <= now) {
            nextDaily.setDate(nextDaily.getDate() + 1);
        }

        // Next weekly (Sunday 3:00 AM UTC)
        const nextWeekly = new Date(now);
        const daysUntilSunday = (7 - nextWeekly.getDay()) % 7 || 7;
        nextWeekly.setDate(nextWeekly.getDate() + daysUntilSunday);
        nextWeekly.setUTCHours(3, 0, 0, 0);

        // Next monthly (1st at 2:00 AM UTC)
        const nextMonthly = new Date(now);
        nextMonthly.setMonth(nextMonthly.getMonth() + 1);
        nextMonthly.setDate(1);
        nextMonthly.setUTCHours(2, 0, 0, 0);

        // Data stats
        const dataStats = fashionData ? {
            trends: fashionData.trends.length,
            items: fashionData.items.length,
            brands: fashionData.brands.length,
            lastUpdated: fashionData.lastUpdated,
        } : null;

        // Category breakdown
        const categoryCounts = fashionData ? {
            trends: fashionData.trends.reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            items: fashionData.items.reduce((acc, i) => {
                acc[i.type] = (acc[i.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            brands: fashionData.brands.reduce((acc, b) => {
                acc[b.tier] = (acc[b.tier] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
        } : null;

        // Top items
        const topTrends = fashionData?.trends
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 5)
            .map(t => ({ name: t.name, popularity: t.popularity, category: t.category }));

        const topBrands = fashionData?.brands
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, 5)
            .map(b => ({ name: b.name, score: b.trendingScore, tier: b.tier }));

        return NextResponse.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),

            // Data stats
            data: {
                stats: dataStats,
                fileModified: dataFileModTime?.toISOString(),
                categories: categoryCounts,
                topTrends,
                topBrands,
            },

            // Source configuration
            sources: {
                total: ALL_FASHION_SOURCES.length,
                enabled: enabledSources.length,
                byFrequency: {
                    daily: dailySources.length,
                    weekly: weeklySources.length,
                    monthly: monthlySources.length,
                },
                byType: {
                    rss: enabledSources.filter(s => s.type === 'rss').length,
                    web: enabledSources.filter(s => s.type === 'web').length,
                    api: enabledSources.filter(s => s.type === 'api').length,
                },
                list: enabledSources.map(s => ({
                    id: s.id,
                    name: s.name,
                    type: s.type,
                    frequency: s.frequency,
                    region: s.region,
                    priority: s.priority,
                })),
            },

            // Schedule info
            schedule: {
                crons: CRON_SCHEDULES,
                nextRuns: {
                    daily: nextDaily.toISOString(),
                    weekly: nextWeekly.toISOString(),
                    monthly: nextMonthly.toISOString(),
                },
            },

            // Manual trigger URLs
            endpoints: {
                triggerDaily: '/api/cron/fashion-daily',
                triggerWeekly: '/api/cron/fashion-weekly',
                triggerMonthly: '/api/cron/fashion-monthly',
                getFashionData: '/api/fashion',
            },
        });
    } catch (error) {
        console.error('Status API error:', error);
        return NextResponse.json({
            success: false,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
