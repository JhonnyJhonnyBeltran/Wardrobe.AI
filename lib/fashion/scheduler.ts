/**
 * 📅 Fashion Data Scheduler
 * Manages scheduled scraping jobs and data updates
 */

import { FashionSource, ScrapingFrequency, getSourcesByFrequency, getSourcesNeedingUpdate } from './sources';
import { FashionDataStore, FashionTrend, ShoppableItem, Brand } from './types';

// ==================== TYPES ====================

export interface ScrapingJob {
    id: string;
    name: string;
    frequency: ScrapingFrequency;
    sources: string[]; // Source IDs
    lastRun?: string;
    nextRun?: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    stats?: JobStats;
}

export interface JobStats {
    sourcesProcessed: number;
    articlesFound: number;
    trendsExtracted: number;
    itemsExtracted: number;
    errors: string[];
    duration: number;
}

export interface SchedulerConfig {
    dailySources: string[];
    weeklySources: string[];
    monthlySources: string[];
    timezone: string;
    maxConcurrent: number;
}

export interface ScrapingResult {
    success: boolean;
    jobId: string;
    stats: JobStats;
    data: {
        trends: Partial<FashionTrend>[];
        items: Partial<ShoppableItem>[];
        brands: Partial<Brand>[];
    };
    timestamp: string;
}

// ==================== SCHEDULE DEFINITIONS ====================

/**
 * Cron expressions for different frequencies
 * Used with Vercel Cron or similar services
 */
export const CRON_SCHEDULES = {
    // Daily at 6:00 AM UTC
    daily: '0 6 * * *',

    // Weekly on Sunday at 3:00 AM UTC  
    weekly: '0 3 * * 0',

    // Monthly on the 1st at 2:00 AM UTC
    monthly: '0 2 1 * *',
};

/**
 * Default scheduler configuration
 */
export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
    dailySources: [
        'elle-usa',
        'whowhatwear',
        'harpersbazaar',
        'vogue-usa',
    ],
    weeklySources: [
        'elle-spain',
        'vogue-spain',
        'glamour-spain',
        'woman-es',
        'telva',
        'elle-france',
        'vogue-france',
        'vogue-uk',
        'vogue-italy',
        'zara-new',
        'mango-new',
        'hm-new',
    ],
    monthlySources: [
        'lyst-index',
    ],
    timezone: 'Europe/Madrid',
    maxConcurrent: 3,
};

// ==================== JOB MANAGEMENT ====================

/**
 * Create a new scraping job
 */
export function createScrapingJob(
    frequency: ScrapingFrequency,
    sourceIds: string[]
): ScrapingJob {
    const id = `job-${frequency}-${Date.now()}`;
    const now = new Date();

    // Calculate next run based on frequency
    const nextRun = calculateNextRun(frequency, now);

    return {
        id,
        name: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Fashion Scrape`,
        frequency,
        sources: sourceIds,
        status: 'pending',
        nextRun: nextRun.toISOString(),
    };
}

/**
 * Calculate next run time based on frequency
 */
function calculateNextRun(frequency: ScrapingFrequency, from: Date = new Date()): Date {
    const next = new Date(from);

    switch (frequency) {
        case 'daily':
            // Next day at 6:00 AM
            next.setDate(next.getDate() + 1);
            next.setHours(6, 0, 0, 0);
            break;

        case 'weekly':
            // Next Sunday at 3:00 AM
            const daysUntilSunday = (7 - next.getDay()) % 7 || 7;
            next.setDate(next.getDate() + daysUntilSunday);
            next.setHours(3, 0, 0, 0);
            break;

        case 'monthly':
            // First day of next month at 2:00 AM
            next.setMonth(next.getMonth() + 1);
            next.setDate(1);
            next.setHours(2, 0, 0, 0);
            break;
    }

    return next;
}

/**
 * Update job status
 */
export function updateJobStatus(
    job: ScrapingJob,
    status: ScrapingJob['status'],
    stats?: JobStats
): ScrapingJob {
    return {
        ...job,
        status,
        stats: stats || job.stats,
        lastRun: status === 'completed' || status === 'failed'
            ? new Date().toISOString()
            : job.lastRun,
        nextRun: status === 'completed'
            ? calculateNextRun(job.frequency).toISOString()
            : job.nextRun,
    };
}

// ==================== SCHEDULER STATE ====================

export interface SchedulerState {
    isRunning: boolean;
    currentJob?: ScrapingJob;
    lastDailyRun?: string;
    lastWeeklyRun?: string;
    lastMonthlyRun?: string;
    pendingJobs: ScrapingJob[];
    completedJobs: ScrapingJob[];
    config: SchedulerConfig;
}

/**
 * Initialize scheduler state
 */
export function initSchedulerState(): SchedulerState {
    return {
        isRunning: false,
        pendingJobs: [],
        completedJobs: [],
        config: DEFAULT_SCHEDULER_CONFIG,
    };
}

// ==================== VERCEL CRON HELPERS ====================

/**
 * Vercel cron configuration
 * Add this to vercel.json:
 * {
 *   "crons": [
 *     { "path": "/api/cron/fashion-daily", "schedule": "0 6 * * *" },
 *     { "path": "/api/cron/fashion-weekly", "schedule": "0 3 * * 0" },
 *     { "path": "/api/cron/fashion-monthly", "schedule": "0 2 1 * *" }
 *   ]
 * }
 */
export const VERCEL_CRON_CONFIG = {
    crons: [
        {
            path: '/api/cron/fashion-daily',
            schedule: CRON_SCHEDULES.daily,
        },
        {
            path: '/api/cron/fashion-weekly',
            schedule: CRON_SCHEDULES.weekly,
        },
        {
            path: '/api/cron/fashion-monthly',
            schedule: CRON_SCHEDULES.monthly,
        },
    ],
};

/**
 * Validate cron request (for Vercel Cron)
 */
export function validateCronRequest(request: Request): boolean {
    // Vercel sets this header for cron requests
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If running locally, allow without auth
    if (process.env.NODE_ENV === 'development') {
        return true;
    }

    // Check for Vercel cron header or custom secret
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
        return true;
    }

    // Also allow from Vercel's internal cron
    const vercelCronHeader = request.headers.get('x-vercel-cron');
    if (vercelCronHeader) {
        return true;
    }

    return false;
}

// ==================== DATA MERGE UTILITIES ====================

/**
 * Merge new trends with existing data
 */
export function mergeTrendsData(
    existing: FashionTrend[],
    newTrends: Partial<FashionTrend>[]
): FashionTrend[] {
    const trendMap = new Map<string, FashionTrend>();

    // Add existing trends
    for (const trend of existing) {
        const key = trend.name.toLowerCase();
        trendMap.set(key, trend);
    }

    // Merge or add new trends
    for (const newTrend of newTrends) {
        if (!newTrend.name) continue;

        const key = newTrend.name.toLowerCase();
        const existing = trendMap.get(key);

        if (existing) {
            // Update existing trend (increase popularity)
            trendMap.set(key, {
                ...existing,
                popularity: Math.min(10, existing.popularity + 1),
                updatedAt: new Date().toISOString(),
            });
        } else {
            // Add new trend
            trendMap.set(key, {
                id: newTrend.id || `trend-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                name: newTrend.name,
                category: newTrend.category || 'garment',
                description: newTrend.description || '',
                season: newTrend.season || detectCurrentSeason(),
                source: newTrend.source || 'Unknown',
                sourceUrl: newTrend.sourceUrl || '',
                imageUrl: newTrend.imageUrl,
                popularity: newTrend.popularity || 5,
                relatedItems: newTrend.relatedItems || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
    }

    // Sort by popularity and return
    return Array.from(trendMap.values())
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 50); // Keep top 50 trends
}

/**
 * Merge new items with existing data
 */
export function mergeItemsData(
    existing: ShoppableItem[],
    newItems: Partial<ShoppableItem>[]
): ShoppableItem[] {
    const itemMap = new Map<string, ShoppableItem>();

    // Add existing items
    for (const item of existing) {
        const key = `${item.brand}-${item.name}`.toLowerCase();
        itemMap.set(key, item);
    }

    // Merge or add new items
    for (const newItem of newItems) {
        if (!newItem.name || !newItem.brand) continue;

        const key = `${newItem.brand}-${newItem.name}`.toLowerCase();

        if (!itemMap.has(key)) {
            itemMap.set(key, {
                id: newItem.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                name: newItem.name,
                brand: newItem.brand,
                type: newItem.type || 'top',
                description: newItem.description || '',
                color: newItem.color,
                colorHex: newItem.colorHex,
                buyLink: newItem.buyLink,
                price: newItem.price,
                priceRange: newItem.priceRange,
                imageUrl: newItem.imageUrl,
                trending: newItem.trending ?? true,
                trendIds: newItem.trendIds || [],
                source: newItem.source || 'Unknown',
                sourceUrl: newItem.sourceUrl,
                createdAt: new Date().toISOString(),
            });
        }
    }

    // Keep only items from last 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    return Array.from(itemMap.values())
        .filter(item => new Date(item.createdAt) >= cutoffDate)
        .slice(0, 100); // Keep max 100 items
}

/**
 * Detect current season
 */
function detectCurrentSeason(): string {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();

    if (month >= 2 && month <= 4) return `Spring ${year}`;
    if (month >= 5 && month <= 7) return `Summer ${year}`;
    if (month >= 8 && month <= 10) return `Fall ${year}`;
    return `Winter ${year}`;
}

// ==================== CLEANUP UTILITIES ====================

/**
 * Clean old data from store
 */
export function cleanOldData(store: FashionDataStore, maxAgeDays: number = 90): FashionDataStore {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    return {
        ...store,
        items: store.items.filter(item =>
            new Date(item.createdAt) >= cutoffDate
        ),
        trends: store.trends.filter(trend =>
            new Date(trend.updatedAt) >= cutoffDate
        ),
        lastUpdated: store.lastUpdated,
    };
}

/**
 * Get scheduler summary stats
 */
export function getSchedulerStats(state: SchedulerState): {
    totalJobs: number;
    pendingJobs: number;
    completedJobs: number;
    lastDailyRun: string | null;
    lastWeeklyRun: string | null;
    lastMonthlyRun: string | null;
    nextScheduledRun: string | null;
} {
    const pendingJobs = state.pendingJobs;
    const nextRun = pendingJobs.length > 0
        ? pendingJobs.sort((a, b) =>
            new Date(a.nextRun || '').getTime() - new Date(b.nextRun || '').getTime()
        )[0].nextRun
        : null;

    return {
        totalJobs: state.pendingJobs.length + state.completedJobs.length,
        pendingJobs: state.pendingJobs.length,
        completedJobs: state.completedJobs.length,
        lastDailyRun: state.lastDailyRun || null,
        lastWeeklyRun: state.lastWeeklyRun || null,
        lastMonthlyRun: state.lastMonthlyRun || null,
        nextScheduledRun: nextRun || null,
    };
}
