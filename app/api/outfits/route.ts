/**
 * 👗 Outfit Generation API
 * 
 * POST: Generate new outfits based on options
 * GET: Get saved/trending outfits
 */

import { NextRequest, NextResponse } from 'next/server';
import { FashionDataStore } from '@/lib/fashion/types';
import {
    generateOutfits,
    getTrendingOutfitRecommendations,
    OutfitGenerationOptions,
    OutfitStyle,
    OutfitOccasion,
} from '@/lib/fashion/outfitGenerator';
import {
    saveOutfit,
    getOutfits,
    getTrendingOutfits,
    getRecentOutfits,
    getDatabaseStats,
} from '@/lib/fashion/outfitDatabase';
import * as fs from 'fs/promises';
import path from 'path';

// Path to fashion data
const FASHION_DATA_FILE = path.join(process.cwd(), 'data', 'fashionData.json');

/**
 * Load fashion data
 */
async function loadFashionData(): Promise<FashionDataStore | null> {
    try {
        const data = await fs.readFile(FASHION_DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return null;
    }
}

/**
 * GET /api/outfits
 * 
 * Query params:
 * - type: 'trending' | 'recent' | 'saved' | 'favorites'
 * - style: OutfitStyle
 * - occasion: OutfitOccasion
 * - limit: number
 * - userId: string
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') || 'recent';
        const style = searchParams.get('style') as OutfitStyle | undefined;
        const occasion = searchParams.get('occasion') as OutfitOccasion | undefined;
        const limit = parseInt(searchParams.get('limit') || '10');
        const userId = searchParams.get('userId') || undefined;
        const favorite = searchParams.get('favorite') === 'true';

        let data;

        switch (type) {
            case 'trending':
                data = await getTrendingOutfits(limit);
                break;

            case 'recent':
                data = await getRecentOutfits(limit);
                break;

            case 'saved':
            case 'favorites':
                const result = await getOutfits({
                    userId,
                    style,
                    occasion,
                    favorite: type === 'favorites' ? true : favorite,
                    limit,
                });
                data = result.outfits;
                break;

            case 'stats':
                const stats = await getDatabaseStats();
                return NextResponse.json({ success: true, stats });

            default:
                const defaultResult = await getOutfits({ limit, style, occasion });
                data = defaultResult.outfits;
        }

        return NextResponse.json({
            success: true,
            type,
            count: data.length,
            data,
        });
    } catch (error) {
        console.error('Outfits GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch outfits' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/outfits
 * 
 * Body:
 * - action: 'generate' | 'save'
 * - options: OutfitGenerationOptions (for generate)
 * - outfit: GeneratedOutfit (for save)
 * - userId: string (optional)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action = 'generate', options = {}, outfit, userId } = body;

        if (action === 'generate') {
            // Generate new outfits
            const fashionData = await loadFashionData();

            if (!fashionData) {
                return NextResponse.json(
                    { success: false, error: 'Fashion data not available. Run scraping first.' },
                    { status: 503 }
                );
            }

            const generationOptions: OutfitGenerationOptions = {
                style: options.style || 'trending',
                occasion: options.occasion || 'everyday',
                season: options.season,
                preferredColors: options.preferredColors || [],
                preferredBrands: options.preferredBrands || [],
                priceRange: options.priceRange || 'any',
                mustIncludeTrends: options.mustIncludeTrends ?? true,
                numberOfOutfits: Math.min(options.numberOfOutfits || 1, 10), // Max 10 at once
            };

            console.log('🎨 Generating outfits with options:', generationOptions);

            const generatedOutfits = generateOutfits(fashionData, generationOptions);

            // Auto-save generated outfits
            const savedOutfits = await Promise.all(
                generatedOutfits.map(o => saveOutfit(o, userId))
            );

            return NextResponse.json({
                success: true,
                action: 'generate',
                count: savedOutfits.length,
                data: savedOutfits,
                fashionDataAge: fashionData.lastUpdated,
            });
        }

        if (action === 'save' && outfit) {
            // Save an existing outfit
            const savedOutfit = await saveOutfit(outfit, userId);

            return NextResponse.json({
                success: true,
                action: 'save',
                data: savedOutfit,
            });
        }

        if (action === 'recommendations') {
            // Get trend-based recommendations
            const fashionData = await loadFashionData();

            if (!fashionData) {
                return NextResponse.json(
                    { success: false, error: 'Fashion data not available' },
                    { status: 503 }
                );
            }

            const count = options.count || 5;
            const recommendations = getTrendingOutfitRecommendations(fashionData, count);

            // Save recommendations
            const savedRecommendations = await Promise.all(
                recommendations.map(o => saveOutfit(o, userId))
            );

            return NextResponse.json({
                success: true,
                action: 'recommendations',
                count: savedRecommendations.length,
                data: savedRecommendations,
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action. Use "generate", "save", or "recommendations"' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Outfits POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
