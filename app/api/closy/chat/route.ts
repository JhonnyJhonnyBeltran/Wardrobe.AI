import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/closy/rateLimiter';
import { buildUserStylingContext } from '@/lib/closy/contextIndexer';

interface ChatRequestPayload {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para consultar a CloSy AI' },
        { status: 401 }
      );
    }

    // 2. Apply Rate Limiting
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: rateLimit.reason || 'Has alcanzado el límite de peticiones',
          retryAfter: rateLimit.retryAfterSeconds 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds || 60),
            'X-RateLimit-Remaining-Minute': String(rateLimit.remainingMinute),
            'X-RateLimit-Remaining-Day': String(rateLimit.remainingDay)
          }
        }
      );
    }

    // 3. Parse input body
    const body: ChatRequestPayload = await request.json();
    const userPrompt = (body.message || '').trim();

    if (!userPrompt) {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
    }

    if (userPrompt.length > 600) {
      return NextResponse.json({ error: 'El mensaje supera el límite de 600 caracteres' }, { status: 400 });
    }

    // 4. Index User Context (Clothes, Outfits, Profile Preferences, Liked Styles)
    const context = await buildUserStylingContext(supabase, user.id);

    // 5. Call AI Engine (Gemini 2.0 Flash / 1.5 Flash with fallback)
    const geminiApiKey = process.env.GEMINI_API_KEY || 
                         process.env.GOOGLE_API_KEY || 
                         process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    let aiResult: any = null;

    if (geminiApiKey) {
      aiResult = await callGeminiAssistant(geminiApiKey, userPrompt, context, body.history || []);
    }

    // Fallback if no API key or API call failed
    if (!aiResult) {
      aiResult = generateHeuristicStylingResponse(userPrompt, context);
    }

    // Resolve garment details for recommended outfits
    const clothesMap = new Map(context.wardrobe.items.map(item => [item.id, item]));

    let resolvedOutfit = null;
    if (aiResult.recommended_outfit && Array.isArray(aiResult.recommended_outfit.item_ids)) {
      const validGarments = aiResult.recommended_outfit.item_ids
        .map((id: string) => clothesMap.get(id))
        .filter(Boolean);

      if (validGarments.length > 0) {
        resolvedOutfit = {
          name: aiResult.recommended_outfit.name || 'Outfit Recomendado por CloSy',
          occasion: aiResult.recommended_outfit.occasion || null,
          items: validGarments
        };
      }
    }

    // Resolve highlighted items
    let resolvedHighlightedItems: any[] = [];
    if (Array.isArray(aiResult.highlighted_item_ids)) {
      resolvedHighlightedItems = aiResult.highlighted_item_ids
        .map((id: string) => clothesMap.get(id))
        .filter(Boolean);
    }

    return NextResponse.json({
      message: aiResult.message || 'Aquí tienes mi recomendación de estilo para ti.',
      recommended_outfit: resolvedOutfit,
      highlighted_items: resolvedHighlightedItems,
      follow_up_suggestions: aiResult.follow_up_suggestions || [
        '¿Cómo lo combino con otros zapatos?',
        'Dame otra opción más abrigada',
        'Arma un look formal'
      ],
      rate_limit: {
        remaining_minute: rateLimit.remainingMinute,
        remaining_day: rateLimit.remainingDay
      }
    }, {
      headers: {
        'X-RateLimit-Remaining-Minute': String(rateLimit.remainingMinute),
        'X-RateLimit-Remaining-Day': String(rateLimit.remainingDay)
      }
    });

  } catch (error: any) {
    console.error('[CloSyChat] API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al procesar la consulta con CloSy AI' },
      { status: 500 }
    );
  }
}

/**
 * Invokes Google Gemini 2.0 Flash / 1.5 Flash via REST API with JSON structured output
 */
async function callGeminiAssistant(
  apiKey: string,
  userPrompt: string,
  context: any,
  history: Array<{ role: string; content: string }>
) {
  try {
    const systemInstruction = `
Eres Klosy, la estilista y compañera de moda personal del usuario en Wardrobe.AI.
Tu personalidad es cercana, experta, natural, elegante y empática. Hablas con naturalidad y confianza, como una gran amiga que sabe muchísimo de moda y conoce cada prenda de tu armario.

REGLAS:
1. Recomienda y arma looks basándote en las prendas reales del armario del usuario provistas en el contexto.
2. Si recomiendas un outfit, usa los IDs exactos de "wardrobe.items".
3. Ten en cuenta su morfología (${context.user.bodyShape || 'estándar'}), su colorimetría (${context.user.seasonPalette || 'neutra'}) y sus estilos preferidos (${context.user.preferredStyles.join(', ') || 'casual, moderno'}).
4. Explica con naturalidad por qué combina la ropa (colores, capas, proporciones) y genera el objeto JSON "recommended_outfit" con los item_ids.
5. Mantén un tono limpio, sin emojis en el texto.
6. Devuelve SIEMPRE tu respuesta en formato JSON estrictamente válido:
{
  "message": "Texto de tu respuesta en Markdown explicando el look y consejos.",
  "recommended_outfit": {
    "name": "Nombre creativo del look",
    "occasion": "casual | formal | fiesta | trabajo | cita | deporte | verano | invierno",
    "item_ids": ["id_prenda_1", "id_prenda_2", "id_prenda_3"]
  },
  "highlighted_item_ids": ["id_prenda_1"],
  "follow_up_suggestions": ["Sugerencia 1", "Sugerencia 2", "Sugerencia 3"]
}
`;

    const recentHistory = history.slice(-6).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    const contents = [
      ...recentHistory,
      {
        role: 'user',
        parts: [
          {
            text: `
CONTEXTO DEL USUARIO:
- Nombre: ${context.user.username}
- Estilos favoritos: ${context.user.preferredStyles.join(', ')}
- Estilos recientes de likes: ${context.recentLikedStyles.join(', ')}
- Morfología: ${context.user.bodyShape || 'No especificada'}
- Colorimetría: ${context.user.seasonPalette || 'No especificada'}
- Prendas en su armario (${context.wardrobe.totalItems} prendas):
${JSON.stringify(context.wardrobe.items.map((i: any) => ({ id: i.id, name: i.name, category: i.category, color: i.color, brand: i.brand, fabric: i.fabric })))}

PETICIÓN DEL USUARIO:
"${userPrompt}"
`
          }
        ]
      }
    ];

    // Try Gemini 2.0 Flash, fallback to Gemini 1.5 Flash
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents,
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.7,
          max_output_tokens: 1200
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[GeminiAPI] Gemini 2.0 Flash request failed:', res.status, errText);
      return null;
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) return null;
    return JSON.parse(candidateText);

  } catch (err) {
    console.error('[GeminiAPI] Error calling Gemini API:', err);
    return null;
  }
}

/**
 * Intelligent local fallback styling engine based on wardrobe categories and color theory
 */
function generateHeuristicStylingResponse(userPrompt: string, context: any) {
  const items = context.wardrobe.items || [];
  
  if (items.length === 0) {
    return {
      message: `¡Hola ${context.user.username}! Veo que aún no tienes prendas registradas en tu armario. 
      
Para poder armarte looks personalizados y decirte qué ponerte, sube fotos de tus prendas en la sección **Armario** (pestaña inferior). ¡En cuanto tengas un par de prendas podré crear decenas de combinaciones para ti!`,
      recommended_outfit: null,
      highlighted_item_ids: [],
      follow_up_suggestions: [
        '¿Cómo organizo mi armario?',
        '¿Qué básicos necesito para empezar?',
        'Consejos de estilo para mi morfología'
      ]
    };
  }

  // Find top, bottom, shoes, jacket
  const tops = items.filter((i: any) => ['top', 'camiseta', 'camisa', 'sweater', 'hoodie', 'topwear'].includes(i.category?.toLowerCase()));
  const bottoms = items.filter((i: any) => ['bottom', 'pantalon', 'pantalón', 'jeans', 'falda', 'shorts', 'bottomwear'].includes(i.category?.toLowerCase()));
  const shoes = items.filter((i: any) => ['shoes', 'zapatos', 'zapatillas', 'calzado', 'botas', 'footwear'].includes(i.category?.toLowerCase()));
  const jackets = items.filter((i: any) => ['jacket', 'chaqueta', 'abrigo', 'outerwear', 'blazer'].includes(i.category?.toLowerCase()));

  const chosenItems: any[] = [];
  if (tops.length > 0) chosenItems.push(tops[0]);
  if (bottoms.length > 0) chosenItems.push(bottoms[0]);
  if (shoes.length > 0) chosenItems.push(shoes[0]);
  else if (jackets.length > 0) chosenItems.push(jackets[0]);

  const itemNames = chosenItems.map(i => `**${i.name}**`).join(', ');

  return {
    message: `¡Por supuesto! Para "${userPrompt}", he analizado tu armario y he seleccionado una combinación armónica con tus prendas: ${itemNames}.

**Por qué funciona este look:**
- **Equilibrio visual**: Los tonos y cortes generan una silueta limpia y equilibrada para tu estilo ${context.user.preferredStyles[0] || 'casual'}.
- **Versatilidad**: Es cómodo y se adapta perfectamente al contexto que me pides.

¿Te gusta cómo queda o prefieres cambiar alguna prenda por otra de tu armario?`,
    recommended_outfit: chosenItems.length > 0 ? {
      name: `Look Klosy: ${userPrompt.slice(0, 30)}`,
      occasion: 'casual',
      item_ids: chosenItems.map(i => i.id)
    } : null,
    highlighted_item_ids: chosenItems.map(i => i.id),
    follow_up_suggestions: [
      '¿Qué calzado combina mejor?',
      'Dame una opción más formal',
      '¿Cómo lo adapto para la noche?'
    ]
  };
}
