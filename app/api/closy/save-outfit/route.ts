import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // 2. Arrange items with coordinates on canvas
    const outfitItemsArr = items.map((item: any, i: number) => {
      const cols = items.length > 2 ? 2 : 1;
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = (col + 1) * (100 / (cols + 1));
      const y = (row + 1) * (100 / (Math.ceil(items.length / cols) + 1));

      return {
        outfit_id: newOutfit.id,
        clothing_item_id: item.id || item,
        position_x: Math.round(x),
        position_y: Math.round(y),
        scale: 1,
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
