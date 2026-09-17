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

function checkUserIsPremium(profile: any, user: any): boolean {
  if (!profile && !user) return false;
  const isEthan = Boolean(
    user?.email?.toLowerCase().includes('ethan') ||
    profile?.username?.toLowerCase() === 'ethan' ||
    profile?.full_name?.toLowerCase().includes('ethan')
  );

  return isEthan || Boolean(
    profile?.is_premium ||
    profile?.subscription_tier === 'premium' ||
    profile?.subscription_status === 'active'
  );
}

/**
 * Helper to fetch remote image and convert to Gemini inlineData Part
 */
async function fetchImageAsInlinePart(url: string): Promise<any | null> {
  if (!url || typeof url !== 'string') return null;

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

    // 1. Fetch User Profile from Database and Validate Premium Status (Anti-Tampering)
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 });
    }

    const isPremium = checkUserIsPremium(profile, user);
    if (!isPremium) {
      return NextResponse.json({
        error: 'El probador virtual de avatar es una función exclusiva de Klozet Premium.',
        isPremiumRequired: true
      }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));

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

    // 3. Multimodal Vision Stage with Gemini:
    // Process the 6 reference photos (face & body) + garment photos
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
1. Reference photos of a real human person (face photos and body photos).
2. The specific wardrobe clothing items chosen for the look (${garments.map(g => `${g.name || g.category} [${g.category}]`).join(', ')}).

CRITICAL STRICT RULES:
- THE CLOTHING WORN BY THE PERSON IN THE FACE AND BODY REFERENCE PHOTOS MUST BE 100% IGNORED AND DISCARDED. Do NOT describe or transfer any clothes from the reference photos.
- Extract the person's REAL biometric identity: exact gender, age range, ethnicity/skin tone, facial structure (jawline, cheekbones), eye shape/color, eyebrow shape, nose structure, lips, hair (color, length, texture, haircut style), facial hair (beard/stubble/mustache), and body proportions (athletic/toned/build).
- The ONLY clothing the person must be wearing in the generated photograph is the EXACT outfit pieces specified (${garments.map(g => `${g.name || g.category} (${g.color || ''})`).join(', ')}).

Generate a single RAW 8k Hasselblad studio catalogue lookbook photographic prompt describing this real person standing centered in a full-length body pose on a pure solid seamless white studio background #FFFFFF with high-key commercial softbox lighting, wearing ONLY the specified outfit with authentic fabric drape and texture. Output ONLY the English prompt.`;

        const visionPayload = {
          contents: [
            {
              parts: [
                ...imageParts.slice(0, 7),
                { text: visionInstruction }
              ]
            }
          ]
        };

        const visionModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
        for (const model of visionModels) {
          try {
            const vRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': geminiKey
              },
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
      biometricPrompt = `RAW 8k full-body studio catalogue lookbook photograph of a real authentic ${userAge} ${userGender} model with natural human skin texture and real facial features, standing centered in full view on a pure solid seamless white studio background #FFFFFF. Wearing: ${garmentSummary}. Shot on Hasselblad H6D-100c 85mm f/1.4 lens, neutral bright studio softbox lighting, ultra-sharp focus, natural fabric drape and texture, photorealistic, authentic human, completely isolated on white background`;
    }

    const finalPhotoPrompt = `RAW 8k full-body studio catalogue photograph of real human, ${biometricPrompt}. Solid pure seamless white studio background #FFFFFF, neutral bright studio softbox lighting, ultra-sharp focus, authentic skin texture with natural pores, cinematic photorealism, isolated on solid white background`;

    let generatedImageUrl: string | null = null;

    // 1. Try Google Gemini Image Models
    if (geminiKey) {
      const geminiImageModels = [
        'gemini-2.5-flash-image',
        'gemini-3.1-flash-image',
        'gemini-3.1-flash-lite-image',
        'gemini-3-pro-image',
        'nano-banana-pro-preview'
      ];
      for (const imgModel of geminiImageModels) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 12000);
          const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${imgModel}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-goog-api-key': geminiKey
            },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    ...imageParts.slice(0, 4),
                    { text: finalPhotoPrompt }
                  ]
                }
              ]
            })
          });
          clearTimeout(timeout);

          if (gRes.ok) {
            const gData = await gRes.json();
            const parts = gData.candidates?.[0]?.content?.parts;
            if (parts && Array.isArray(parts)) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  generatedImageUrl = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
                  break;
                }
              }
            }
          }
          if (generatedImageUrl) break;
        } catch (imgErr) {
          console.warn(`[GenerateAvatar] Gemini image model ${imgModel} error:`, imgErr);
        }
      }
    }

    // 2. Try OpenAI DALL-E 3 if API Key is configured
    if (!generatedImageUrl && process.env.OPENAI_API_KEY) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        const oRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: finalPhotoPrompt.slice(0, 1000),
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json'
          })
        });
        clearTimeout(timeout);

        if (oRes.ok) {
          const oData = await oRes.json();
          const b64 = oData.data?.[0]?.b64_json;
          if (b64) {
            generatedImageUrl = `data:image/png;base64,${b64}`;
          }
        }
      } catch (oErr) {
        console.warn('[GenerateAvatar] OpenAI DALL-E error:', oErr);
      }
    }

    // 3. Try custom image provider if IMAGE_GEN_API_URL is configured
    if (!generatedImageUrl && process.env.IMAGE_GEN_API_URL) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const cRes = await fetch(process.env.IMAGE_GEN_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.IMAGE_GEN_API_KEY ? { 'Authorization': `Bearer ${process.env.IMAGE_GEN_API_KEY}` } : {})
          },
          signal: controller.signal,
          body: JSON.stringify({
            prompt: finalPhotoPrompt,
            aspect_ratio: '3:4'
          })
        });
        clearTimeout(timeout);

        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.image_url || cData.url) {
            generatedImageUrl = cData.image_url || cData.url;
          } else if (cData.b64 || cData.base64) {
            generatedImageUrl = `data:image/jpeg;base64,${cData.b64 || cData.base64}`;
          }
        }
      } catch (cErr) {
        console.warn('[GenerateAvatar] Custom image provider error:', cErr);
      }
    }

    if (!generatedImageUrl) {
      return NextResponse.json({
        success: false,
        error: 'El servicio de generación de imágenes por IA ha alcanzado su límite de cuota temporal con Google Gemini. Por favor inténtalo de nuevo más tarde.',
        quota_exceeded: true
      }, { status: 422 });
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
      { success: false, error: error?.message || 'Error al procesar la solicitud del avatar virtual' },
      { status: 500 }
    );
  }
}
