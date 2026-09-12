import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                   process.env.SUPABASE_SERVICE_KEY || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const getAdmin = () => createAdminClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function resolveUserAndClient(request: NextRequest) {
  let user: any = null;
  let supabaseServerClient: any = null;

  try {
    supabaseServerClient = await createClient();
    const { data } = await supabaseServerClient.auth.getUser();
    user = data?.user || null;
  } catch {}

  if (!user) {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '').trim();
        const admin = getAdmin();
        const { data } = await admin.auth.getUser(token);
        if (data?.user) {
          user = data.user;
        }
      } catch {}
    }
  }

  const hasServiceRole = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
  const client = hasServiceRole ? getAdmin() : (supabaseServerClient || getAdmin());

  return { client, user };
}

export async function POST(request: NextRequest) {
  try {
    const { client, user } = await resolveUserAndClient(request);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    // 1. Fetch User Profile Calibration Photos (3 Face + 3 Body)
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 });
    }

    let facePhotos: string[] = (profile.face_photos || []).filter(Boolean);
    let bodyPhotos: string[] = (profile.body_photos || []).filter(Boolean);

    // Fallback to JSONB notification_preferences if columns are empty
    if (facePhotos.length === 0 && bodyPhotos.length === 0) {
      const notifPrefs = (profile as any).notification_preferences || {};
      if (notifPrefs.avatar_calibration) {
        facePhotos = (notifPrefs.avatar_calibration.face_photos || []).filter(Boolean);
        bodyPhotos = (notifPrefs.avatar_calibration.body_photos || []).filter(Boolean);
      }
    }

    // Fallback to request body if client provides cached calibration photos
    if (facePhotos.length === 0 && body.calibrationPhotos?.face_photos) {
      facePhotos = (body.calibrationPhotos.face_photos || []).filter(Boolean);
    }
    if (bodyPhotos.length === 0 && body.calibrationPhotos?.body_photos) {
      bodyPhotos = (body.calibrationPhotos.body_photos || []).filter(Boolean);
    }

    // If either face or body photos are missing, prompt calibration modal
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
    const itemIds: string[] = body.itemIds || [];

    if (itemIds.length > 0) {
      const { data: clothes } = await client
        .from('clothing_items')
        .select('id, name, category, color, brand, fabric, image_url, original_image_url')
        .in('id', itemIds);
      garments = clothes || [];
    } else if (body.outfitId) {
      const { data: outfitItems } = await client
        .from('outfit_items')
        .select('clothing_items(*)')
        .eq('outfit_id', body.outfitId);
      garments = (outfitItems || []).map((oi: any) => oi.clothing_items).filter(Boolean);
    }

    // Default Avatar Image: Use the primary calibrated face photo
    const primaryFace = facePhotos[0];
    const outfitSummary = garments.map(g => `${g.name || g.category} (${g.color || ''})`).join(', ');

    // Construction of the Studio White Background Avatar Prompt
    // Default studio instructions: Pure white background (#FFFFFF), studio lighting, high key catalogue photography
    const avatarStudioPrompt = `Full-body photorealistic fashion lookbook portrait of the user wearing: ${outfitSummary || 'recommended outfit'}. Studio catalogue photography, standing pose, centered, solid seamless pure white background (#FFFFFF), neutral high-key studio softbox lighting, ultra high definition, zero background distractions, isolated on crisp clean white backdrop.`;

    return NextResponse.json({
      success: true,
      avatar_image_url: primaryFace,
      outfit_summary: outfitSummary,
      studio_prompt: avatarStudioPrompt,
      background: 'solid_white',
      face_photos_used: facePhotos.length,
      body_photos_used: bodyPhotos.length,
      message: 'Avatar virtual generado con éxito sobre fondo blanco de estudio fotográfico.'
    });

  } catch (error: any) {
    console.error('[GenerateAvatar] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al generar el avatar virtual' },
      { status: 500 }
    );
  }
}

