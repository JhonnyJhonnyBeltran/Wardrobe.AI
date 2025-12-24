/**
 * Fashion Data API Route
 * GET: Returns current fashion trends and items
 * POST: Triggers a data refresh (for cron jobs)
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchFashionData, FashionDataStore } from '@/lib/fashion';

// Cache the data in memory (for serverless, use Redis/KV in production)
let cachedData: FashionDataStore | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 3600 * 1000; // 1 hour

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type'); // 'trends', 'items', 'brands', or null for all
        const limit = parseInt(searchParams.get('limit') || '10');

        // Check cache
        const now = Date.now();
        if (!cachedData || now - lastFetch > CACHE_DURATION) {
            console.log('Fetching fresh fashion data...');
            cachedData = await fetchFashionData({ useAI: false, daysBack: 7 });
            lastFetch = now;
        }

        // Return filtered data
        if (type === 'trends') {
            return NextResponse.json({
                success: true,
                data: cachedData.trends.slice(0, limit),
                lastUpdated: cachedData.lastUpdated,
            });
        }

        if (type === 'items') {
            return NextResponse.json({
                success: true,
                data: cachedData.items.slice(0, limit),
                lastUpdated: cachedData.lastUpdated,
            });
        }

        if (type === 'brands') {
            return NextResponse.json({
                success: true,
                data: cachedData.brands.slice(0, limit),
                lastUpdated: cachedData.lastUpdated,
            });
        }

        // Return all data
        return NextResponse.json({
            success: true,
            data: {
                trends: cachedData.trends.slice(0, limit),
                items: cachedData.items.slice(0, limit),
                brands: cachedData.brands.slice(0, 10),
            },
            lastUpdated: cachedData.lastUpdated,
        });
    } catch (error) {
        console.error('Fashion API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch fashion data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const useAI = body.useAI === true;

        console.log(`Refreshing fashion data (AI: ${useAI})...`);
        cachedData = await fetchFashionData({ useAI, daysBack: 7 });
        lastFetch = Date.now();

        return NextResponse.json({
            success: true,
            message: 'Fashion data refreshed',
            stats: {
                trends: cachedData.trends.length,
                items: cachedData.items.length,
                brands: cachedData.brands.length,
            },
            lastUpdated: cachedData.lastUpdated,
        });
    } catch (error) {
        console.error('Fashion refresh error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to refresh fashion data' },
            { status: 500 }
        );
    }
}
