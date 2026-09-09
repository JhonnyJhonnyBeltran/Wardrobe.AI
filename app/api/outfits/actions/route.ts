/**
 * 👗 Outfit Actions API
 * 
 * POST: Perform actions on outfits (favorite, view, share, delete) with user authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    toggleFavorite,
    recordOutfitView,
    recordOutfitShare,
    deleteOutfit,
    getOutfitById,
} from '@/lib/fashion/outfitDatabase';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const body = await request.json().catch(() => ({}));
        const { action, outfitId } = body;
        const userId = user?.id || body.userId;

        if (!outfitId) {
            return NextResponse.json(
                { success: false, error: 'outfitId is required' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'favorite':
            case 'toggle-favorite': {
                if (!userId) {
                    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
                }
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
                if (!user) {
                    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
                }
                
                // Fetch outfit to verify ownership
                const outfit = await getOutfitById(outfitId);
                if (!outfit) {
                    return NextResponse.json({ success: false, error: 'Outfit not found' }, { status: 404 });
                }

                if (outfit.userId && outfit.userId !== user.id) {
                    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
                }

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
