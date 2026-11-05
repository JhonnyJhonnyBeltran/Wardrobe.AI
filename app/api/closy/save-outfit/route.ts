import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getSaveCategoryVerticalRank(category?: string | null, name?: string | null): number {
  const raw = `${category || ''} ${name || ''}`.toLowerCase();
  if (/(hat|cap|gorra|gorro|sombrero|beanie|head|gafa|sunglass)/.test(raw)) return 1;
  if (/(outerwear|jacket|coat|blazer|cazadora|abrigo)/.test(raw)) return 2;
  if (/(top|shirt|camiseta|camisa|hoodie|sudadera|sweater|jersey|blusa|polo|knit|tank|crop)/.test(raw)) return 2.5;
  if (/(dress|vestido|mono|jumpsuit)/.test(raw)) return 3;
  if (/(pant|jean|trouser|pantalon|pantalón|vaquero|short|bermuda|skirt|falda|bottom|cargo|legging)/.test(raw)) return 4;
  if (/(shoe|sneaker|zapatilla|bota|boot|sandal|loafer|mocasin|mocasín|heel|tacón|calzado|footwear|shox)/.test(raw)) return 5;
  return 3.5;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, occasion, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided for the outfit' }, { status: 400 });
    }

    const outfitName = (name || 'Look CloSy AI').trim();

    // 1. Create Outfit record
    const { data: newOutfit, error: outfitErr } = await (supabase
      .from('outfits') as any)
      .insert({
        user_id: user.id,
        name: outfitName,
        occasion: occasion || null,
        description: 'Outfit recomendado por CloSy AI',
        season: 'all-season',
        is_public: true,
        ai_generated: true,
        image_url: null
      })
      .select()
      .single();

    if (outfitErr) throw outfitErr;

    // 2. Sort items head-to-toe and arrange coordinates vertically on canvas
    const sortedItems = [...items].sort((a: any, b: any) => {
      const rankA = getSaveCategoryVerticalRank(a?.category, a?.name);
      const rankB = getSaveCategoryVerticalRank(b?.category, b?.name);
      return rankA - rankB;
    });

    const total = sortedItems.length;
    const outfitItemsArr = sortedItems.map((item: any, i: number) => {
      let x = 50;
      let y = 50;
      let scale = 1;

      if (total === 1) {
        y = 50;
      } else {
        const startY = total >= 4 ? 14 : 20;
        const endY = total >= 4 ? 86 : 80;
        y = startY + (i * (endY - startY)) / (total - 1);
      }

      const rank = getSaveCategoryVerticalRank(item?.category, item?.name);
      if (rank === 1) scale = 0.55; // Hats / caps scaled smaller
      if (rank === 2) {
        x = 52;
        scale = 1.05;
      }

      return {
        outfit_id: newOutfit.id,
        clothing_item_id: item.id || item,
        position_x: Math.round(x),
        position_y: Math.round(y),
        scale: Number(scale.toFixed(2)),
        rotation: 0,
        layer_order: i + 1
      };
    });

    const { error: itemsErr } = await (supabase
      .from('outfit_items') as any)
      .insert(outfitItemsArr);

    if (itemsErr) {
      console.warn('[SaveOutfit] Error inserting outfit items:', itemsErr);
    }

    return NextResponse.json({
      success: true,
      outfit_id: newOutfit.id,
      outfit: newOutfit
    });

  } catch (error: any) {
    console.error('[SaveOutfit] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al guardar outfit' },
      { status: 500 }
    );
  }
}
