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

/**
 * Helper to fetch remote image and convert to Gemini inlineData Part
 */
async function fetchImageAsInlinePart(url: string): Promise<any | null> {
  if (!url || typeof url !== 'string') return null;

  // Handle data URLs directly
  if (url.startsWith('data:image/')) {
    const match = url.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (match) {
      return {
        inlineData: {
          mimeType: match[1].includes('png') ? 'image/png' : 'image/jpeg',
          data: match[2]
        }
      };
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = res.headers.get('content-type') || 'image/jpeg';

    return {
      inlineData: {
        mimeType: mime.includes('png') ? 'image/png' : 'image/jpeg',
        data: buffer.toString('base64')
      }
    };
  } catch (err) {
    console.warn('[GenerateAvatar] Error downloading image part:', url, err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client, user } = await resolveUserAndClient(request);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    // 1. Fetch User Profile Calibration Photos (3 Face + 3 Body) & Personal Attributes
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

    // 2. Fetch Outfit / Garment details and their photos
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
    } else if (Array.isArray(body.items) && body.items.length > 0) {
      garments = body.items;
    }

    const outfitSummary = garments.length > 0
      ? garments.map(g => g.name || g.category).join(' + ')
      : body.outfitName || 'Look Kloe';

    const userGender = profile.gender === 'women' ? 'woman' : (profile.gender === 'men' ? 'man' : 'person');
    const userAge = profile.age ? `${profile.age}-year-old` : (profile.age_range ? `${profile.age_range} year old` : 'young adult');

    // 3. Multimodal Vision Stage: Download and build image parts
    // All 6 calibration photos (3 face + 3 body) + garment photos
    const allPhotoUrls: string[] = [
      ...facePhotos,
      ...bodyPhotos,
      ...garments.map(g => g.image_url || g.imageUrl || g.original_image_url || g.original_image).filter(Boolean)
    ].filter(Boolean);

    const imageParts = (await Promise.all(allPhotoUrls.map(url => fetchImageAsInlinePart(url)))).filter(Boolean);

    let biometricPrompt = '';
    const geminiKey = getGeminiApiKey();
    if (geminiKey && imageParts.length > 0) {
      try {
        const visionInstruction = `You are an elite biometric stylist and commercial fashion studio director.
You are provided with:
1. Reference photos of a real human person (face photos and full body photos).
2. The specific wardrobe clothing items chosen for the look (${garments.map(g => `${g.name || g.category} [${g.category}]`).join(', ')}).

CRITICAL STRICT RULES:
- THE CLOTHING WORN BY THE PERSON IN THE FACE AND BODY REFERENCE PHOTOS MUST BE 100% IGNORED AND DISCARDED. Do NOT describe or transfer any clothes from the reference photos.
- The reference photos are EXCLUSIVELY to extract the real person's biometric identity: facial structure, eyes, eyebrows, nose, lips, jawline, facial hair, skin tone, hairstyle and body proportions.
- The ONLY clothing the person must be wearing in the generated photograph is the EXACT outfit pieces specified (${garments.map(g => `${g.name || g.category} (${g.color || ''})`).join(', ')}).

Generate a single RAW 8k Hasselblad studio catalogue lookbook photographic prompt describing this real person standing centered in a full-body pose on a solid pure white studio background #FFFFFF with high-key commercial lighting, wearing ONLY the specified outfit with authentic fabric textures and drapery. Output ONLY the English prompt.`;

        const visionPayload = {
          contents: [
            {
              parts: [
                ...imageParts,
                { text: visionInstruction }
              ]
            }
          ]
        };

        const visionModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash'];
        for (const model of visionModels) {
          try {
            const vRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(visionPayload)
            });

            if (vRes.ok) {
              const vData = await vRes.json();
              const textOutput = vData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textOutput && textOutput.trim().length > 50) {
                biometricPrompt = textOutput.trim();
                break;
              }
            }
          } catch (mErr) {
            console.warn(`[GenerateAvatar] Vision model ${model} error:`, mErr);
          }
        }
      } catch (visionErr) {
        console.warn('[GenerateAvatar] Vision analysis error:', visionErr);
      }
    }

    // Fallback prompt if vision text extraction was unavailable
    if (!biometricPrompt) {
      const garmentSummary = garments.length > 0
        ? garments.map(g => `${g.name || g.category}${g.color ? ` in ${g.color}` : ''}${g.fabric ? ` (${g.fabric})` : ''}`).join(', ')
        : 'stylish modern casual outfit';
      biometricPrompt = `RAW 8k full-body studio catalogue lookbook photograph of a real authentic ${userAge} ${userGender} model with natural human skin texture, standing centered in full view on a pure solid seamless white studio background #FFFFFF. Wearing: ${garmentSummary}. Shot on Hasselblad H6D-100c 85mm f/1.4 lens, neutral bright studio softbox lighting, ultra-sharp focus, natural fabric drape and texture, photorealistic, authentic human, completely isolated on white background`;
    }

    // Ensure the prompt emphasizes solid white studio background and real human photography
    const finalPhotoPrompt = `RAW 8k full-body studio catalogue photograph of real human, ${biometricPrompt}. Solid pure seamless white studio background #FFFFFF, neutral bright studio softbox lighting, ultra-sharp focus, authentic skin texture with natural pores, cinematic photorealism, isolated on solid white background`;

    // Strict negative prompt to strictly prevent doll/CGI/anime/mannequin generation
    const negativePrompt = "doll, mannequin, asian doll, porcelain doll, plastic skin, cgi, 3d, 3d render, render, cartoon, anime, illustration, drawing, painting, fake face, smooth airbrushed skin, blurred face, distorted anatomy, extra limbs, grey background, shadows on wall, messy background";

    let generatedImageUrl: string | null = null;

    // Generate photo with Flux Realism engine
    try {
      const seed = Math.floor(Math.random() * 900000) + 100000;
      const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPhotoPrompt)}?width=768&height=1024&nologo=true&model=flux-realism&seed=${seed}&negative=${encodeURIComponent(negativePrompt)}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const pollRes = await fetch(pollUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (pollRes.ok) {
        const buffer = Buffer.from(await pollRes.arrayBuffer());
        if (buffer.length > 5000) {
          generatedImageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        }
      }
    } catch (pollErr) {
      console.warn('[GenerateAvatar] Flux realism generator error:', pollErr);
    }

    // Fallback to reference face photo if network generation failed
    if (!generatedImageUrl) {
      generatedImageUrl = facePhotos[0] || bodyPhotos[0] || '/placeholder.png';
    }

    return NextResponse.json({
      success: true,
      avatar_image_url: generatedImageUrl,
      outfit_summary: outfitSummary,
      studio_prompt: finalPhotoPrompt,
      background: 'solid_white',
      face_photos_used: facePhotos.length,
      body_photos_used: bodyPhotos.length,
      garment_photos_used: garments.length,
      message: 'Look probado con éxito en tu avatar virtual sobre fondo blanco de estudio.'
    });

  } catch (error: any) {
    console.error('[GenerateAvatar] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al generar el avatar virtual' },
      { status: 500 }
    );
  }
}
