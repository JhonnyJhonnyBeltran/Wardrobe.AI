import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getGeminiApiKey } from '@/lib/ai/geminiClient';

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

    // If both face and body photos are missing, prompt calibration modal
    if (facePhotos.length === 0 && bodyPhotos.length === 0) {
      return NextResponse.json({
        needs_calibration: true,
        message: 'Debes configurar tu avatar subiendo tus fotos de rostro y cuerpo para que Kloe pueda modelar tu look.',
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

    // Build specific outfit pieces description
    const outfitSummary = garments.length > 0
      ? garments.map(g => `${g.name || g.category}${g.color ? ` in ${g.color}` : ''}${g.fabric ? ` (${g.fabric})` : ''}`).join(', ')
      : 'stylish modern casual outfit';

    const userGender = profile.gender === 'women' ? 'woman' : (profile.gender === 'men' ? 'man' : 'person');
    const userAge = profile.age ? `${profile.age}-year-old` : 'young adult';

    // Detailed prompt for studio fashion photoshoot on pure white background
    const studioPrompt = `Full body high-end fashion catalogue lookbook photoshoot of a ${userAge} ${userGender} model with natural look, standing centered in full view, wearing: ${outfitSummary}. Solid pure white studio background (#FFFFFF), neutral high-key studio softbox lighting, 8k resolution, photorealistic, sharp focus, natural skin texture, professional fashion catalog pose, zero background clutter, isolated on pure white background`;

    let generatedImageUrl: string | null = null;

    // Strategy 1: Google Imagen 3 via Gemini API Key
    const geminiKey = getGeminiApiKey();
    if (geminiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 9000);
        const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`;
        const res = await fetch(imagenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            instances: [{ prompt: studioPrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "3:4"
            }
          })
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const base64Bytes = data?.predictions?.[0]?.bytesBase64Encoded;
          if (base64Bytes) {
            generatedImageUrl = `data:image/jpeg;base64,${base64Bytes}`;
          }
        }
      } catch (imagenErr) {
        console.warn('[GenerateAvatar] Imagen 3 attempt error:', imagenErr);
      }
    }

    // Strategy 2: Fast & High Quality Pollinations Flux Model
    if (!generatedImageUrl) {
      try {
        const seed = Math.floor(Math.random() * 900000) + 100000;
        const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(studioPrompt)}?width=768&height=1024&nologo=true&model=flux&seed=${seed}`;
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const pollRes = await fetch(pollUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (pollRes.ok) {
          const buffer = Buffer.from(await pollRes.arrayBuffer());
          if (buffer.length > 5000) {
            generatedImageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
          }
        }
      } catch (pollErr) {
        console.warn('[GenerateAvatar] Pollinations fallback error:', pollErr);
      }
    }

    // Final Fallback: Calibrated reference photo
    if (!generatedImageUrl) {
      generatedImageUrl = facePhotos[0] || bodyPhotos[0] || '/placeholder.png';
    }

    return NextResponse.json({
      success: true,
      avatar_image_url: generatedImageUrl,
      outfit_summary: outfitSummary,
      studio_prompt: studioPrompt,
      background: 'solid_white',
      face_photos_used: facePhotos.length,
      body_photos_used: bodyPhotos.length,
      message: 'Look probado con éxito en tu avatar virtual sobre fondo blanco.'
    });

  } catch (error: any) {
    console.error('[GenerateAvatar] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al generar el avatar virtual' },
      { status: 500 }
    );
  }
}


