/**
 * 🤖 Fashion Bot API Proxy
 * 
 * Proxies requests to the fashion-bot microservice for outfit generation.
 * Falls back to local generation if the microservice is unavailable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { FashionBotClient } from '@/lib/fashionBotClient';

const botClient = new FashionBotClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, options } = body;

        // Check if bot is available
        const botHealthy = await botClient.isHealthy();

        if (!botHealthy) {
            // Fallback to local generation
            return NextResponse.json({
                success: false,
                error: 'Fashion Bot not available',
                fallback: true,
                message: 'Using local outfit generation instead',
            }, { status: 503 });
        }

        switch (action) {
            case 'generate': {
                const outfit = await botClient.generateOutfit({
                    style: options?.style,
                    occasion: options?.occasion,
                    season: options?.season,
                    preferredColors: options?.preferredColors,
                    preferredBrands: options?.preferredBrands,
                    priceRange: options?.priceRange,
                    mood: options?.mood,
                    description: options?.description,
                });

                return NextResponse.json({
                    success: true,
                    data: [outfit],
                    source: 'fashion-bot',
                    aiGenerated: outfit.aiGenerated,
                });
            }

            case 'generate-multiple': {
                const count = options?.count || 3;
                const outfits = await botClient.generateMultipleOutfits(options, count);

                return NextResponse.json({
                    success: true,
                    data: outfits,
                    source: 'fashion-bot',
                });
            }

            case 'generate-from-description': {
                if (!options?.description) {
                    return NextResponse.json({
                        success: false,
                        error: 'Description is required',
                    }, { status: 400 });
                }

                const outfit = await botClient.generateFromDescription(options.description);

                return NextResponse.json({
                    success: true,
                    data: [outfit],
                    source: 'fashion-bot',
                    aiGenerated: outfit.aiGenerated,
                });
            }

            case 'sync-data': {
                const data = await botClient.syncData();

                return NextResponse.json({
                    success: true,
                    data,
                    source: 'fashion-bot',
                });
            }

            default:
                return NextResponse.json({
                    success: false,
                    error: `Unknown action: ${action}`,
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Fashion Bot API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            details: String(error),
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        // Check bot health
        const botHealthy = await botClient.isHealthy();

        if (!botHealthy) {
            return NextResponse.json({
                success: false,
                error: 'Fashion Bot not available',
                healthy: false,
            }, { status: 503 });
        }

        switch (type) {
            case 'health': {
                const health = await botClient.getHealth();
                return NextResponse.json({
                    success: true,
                    healthy: true,
                    ...health,
                });
            }

            case 'stats': {
                const stats = await botClient.getStats();
                return NextResponse.json({
                    success: true,
                    stats,
                });
            }

            case 'trends': {
                const limit = parseInt(searchParams.get('limit') || '20');
                const trends = await botClient.getTrends(limit);
                return NextResponse.json({
                    success: true,
                    trends,
                });
            }

            case 'outfits': {
                const limit = parseInt(searchParams.get('limit') || '10');
                const outfits = await botClient.getOutfits(limit);
                return NextResponse.json({
                    success: true,
                    outfits,
                });
            }

            case 'scraping-status': {
                const status = await botClient.getScrapingStatus();
                return NextResponse.json({
                    success: true,
                    status,
                });
            }

            default: {
                // Return general status
                const stats = await botClient.getStats();
                return NextResponse.json({
                    success: true,
                    connected: true,
                    stats,
                });
            }
        }
    } catch (error) {
        console.error('Fashion Bot GET error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to connect to Fashion Bot',
        }, { status: 500 });
    }
}
