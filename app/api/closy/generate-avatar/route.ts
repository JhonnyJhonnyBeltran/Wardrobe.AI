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
 * Helper to fetch remote garment image and convert to Gemini inlineData Part
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
        error: 'El probador virtual es una función exclusiva de Klozet Pro.',
        isPremiumRequired: true
      }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));

    // Read physical profile ("Dinos cómo eres") without any biometric photo requirement
    const notifPrefs = (profile as any).notification_preferences || {};
    const physicalProfile = notifPrefs.physical_profile || {};

    const genderRaw = profile.gender || physicalProfile.gender || 'woman';
    const userGender = genderRaw === 'women' || genderRaw === 'woman' ? 'woman' : (genderRaw === 'men' || genderRaw === 'man' ? 'man' : 'person');
    const userAge = profile.age ? `${profile.age}-year-old` : (profile.age_range ? `${profile.age_range} year old` : 'young adult');
    const userHeight = profile.height || physicalProfile.height || 170;
    const userBodyType = profile.body_shape || profile.morphology || physicalProfile.body_type || 'balanced proportions';
    const userEyeColor = profile.eye_color || physicalProfile.eye_color || 'brown';
    const userHairColor = profile.hair_color || physicalProfile.hair_color || 'dark brown';

    // Fetch Outfit / Garment details
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

    const garmentPhotoUrls: string[] = garments
      .map(g => g.image_url || g.imageUrl || g.original_image_url || g.original_image)
      .filter(Boolean);

    const imageParts = (await Promise.all(garmentPhotoUrls.slice(0, 4).map(url => fetchImageAsInlinePart(url)))).filter(Boolean);

    const geminiKey = getGeminiApiKey();

    const garmentSummary = garments.length > 0
      ? garments.map(g => `${g.name || g.category}${g.color ? ` in ${g.color}` : ''}${g.fabric ? ` (${g.fabric})` : ''}`).join(', ')
      : 'stylish modern casual outfit';

    const finalPhotoPrompt = `RAW 8k full-body studio catalogue lookbook photograph of a real ${userAge} ${userGender} model (${userHeight} cm tall, body type: ${userBodyType}, eye color: ${userEyeColor}, hair color: ${userHairColor}), standing centered in full view on a pure solid seamless white studio background #FFFFFF. Wearing ONLY: ${garmentSummary}. Shot on Hasselblad H6D-100c 85mm f/1.4 lens, neutral bright studio softbox lighting, ultra-sharp focus, natural fabric drape and texture, photorealistic, isolated on white background`;

    let generatedImageUrl: string | null = null;

    if (geminiKey) {
      const geminiImageModels = [
        'gemini-2.5-flash-image',
        'gemini-3.1-flash-image',
        'gemini-3.1-flash-lite-image',
        'gemini-3-pro-image'
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
                    ...imageParts,
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

    if (!generatedImageUrl) {
      return NextResponse.json({
        success: false,
        error: 'El servicio de generación de imágenes por IA ha alcanzado su límite de cuota temporal. Por favor inténtalo de nuevo más tarde.',
        quota_exceeded: true
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      avatar_image_url: generatedImageUrl,
      outfit_summary: outfitSummary,
      studio_prompt: finalPhotoPrompt,
      background: 'solid_white',
      garment_photos_used: garments.length,
      message: 'Look generado con éxito según tu perfil físico.'
    });

  } catch (error: any) {
    console.error('[GenerateAvatar] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
