/**
 * 👗 Outfit Actions API
 * 
 * POST: Perform actions on outfits (favorite, view, share, delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    toggleFavorite,
    recordOutfitView,
    recordOutfitShare,
    deleteOutfit,
    getOutfitById,
} from '@/lib/fashion/outfitDatabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, outfitId, userId } = body;

        if (!outfitId) {
            return NextResponse.json(
                { success: false, error: 'outfitId is required' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'favorite':
            case 'toggle-favorite': {
                const isFavorite = await toggleFavorite(outfitId, userId);
                return NextResponse.json({
                    success: true,
                    action: 'favorite',
                    outfitId,
                    isFavorite,
                });
            }

            case 'view': {
                await recordOutfitView(outfitId, userId);
                return NextResponse.json({
                    success: true,
                    action: 'view',
                    outfitId,
                });
            }

            case 'share': {
                await recordOutfitShare(outfitId, userId);
                return NextResponse.json({
                    success: true,
                    action: 'share',
                    outfitId,
                });
            }

            case 'delete': {
                const deleted = await deleteOutfit(outfitId);
                return NextResponse.json({
                    success: deleted,
                    action: 'delete',
                    outfitId,
                });
            }

            case 'get': {
                const outfit = await getOutfitById(outfitId);
                if (!outfit) {
                    return NextResponse.json(
                        { success: false, error: 'Outfit not found' },
                        { status: 404 }
                    );
                }
                return NextResponse.json({
                    success: true,
                    action: 'get',
                    data: outfit,
                });
            }

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action. Use: favorite, view, share, delete, get' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Outfit action error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process action' },
            { status: 500 }
        );
    }
}
