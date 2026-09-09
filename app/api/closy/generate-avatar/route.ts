import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                       process.env.SUPABASE_SERVICE_KEY || 
                       supabaseAnonKey;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    const userId = userData?.user?.id;

    if (authError || !userId) {
      return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const targetUserId = userId; // Strictly enforce caller's authenticated user ID

    // 1. Fetch User Profile Calibration Photos
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name, face_photos, body_photos')
      .eq('id', targetUserId)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 });
    }

    const facePhotos: string[] = profile.face_photos || [];
    const bodyPhotos: string[] = profile.body_photos || [];

    if (facePhotos.length === 0 || bodyPhotos.length === 0) {
      return NextResponse.json({
        needs_calibration: true,
        message: 'Debes calibrar tu avatar subiendo tus fotos de rostro y cuerpo para que Kloe pueda modelar tu look.',
        face_count: facePhotos.length,
        body_count: bodyPhotos.length
      }, { status: 400 });
    }

    // 2. Fetch Outfit / Garment details
    let garments: any[] = [];
    const itemIds = body.itemIds || [];

    if (itemIds.length > 0) {
      const { data: clothes } = await supabase
        .from('clothing_items')
        .select('id, name, category, color, brand, fabric, image_url, original_image_url')
        .in('id', itemIds)
        .eq('user_id', targetUserId);
      garments = clothes || [];
    } else if (body.outfitId) {
      const { data: outfitItems } = await supabase
        .from('outfit_items')
        .select('clothing_items(*)')
        .eq('outfit_id', body.outfitId);
      garments = (outfitItems || []).map((oi: any) => oi.clothing_items).filter(Boolean);
    }

    const primaryFace = facePhotos[0];
    const outfitSummary = garments.map(g => `${g.name} (${g.color || ''} ${g.category})`).join(', ');

    return NextResponse.json({
      success: true,
      avatar_image_url: primaryFace,
      outfit_summary: outfitSummary,
      face_photos_used: facePhotos.length,
      body_photos_used: bodyPhotos.length,
      message: '¡Avatar virtual generado con éxito con tu outfit seleccionado!'
    });

  } catch (error: any) {
    console.error('[GenerateAvatar] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al generar el avatar virtual' },
      { status: 500 }
    );
  }
}
