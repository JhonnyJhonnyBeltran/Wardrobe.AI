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
        { error: 'Debes iniciar sesión para consultar a Klosy' },
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
          name: aiResult.recommended_outfit.name || 'Look recomendado por Klosy',
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
    console.error('[KlosyChat] API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al procesar la consulta con Klosy' },
      { status: 500 }
    );
  }
}

/**
 * Invokes Google Gemini 2.0 Flash / 1.5 Flash via REST API with JSON structured output and multimodal support
 */
async function callGeminiAssistant(
  apiKey: string,
  userPrompt: string,
  context: any,
  history: Array<{ role: string; content: string }>
) {
  try {
    const systemInstruction = `
Eres Klosy, la estilista y asesora de imagen personal del usuario en Wardrobe.AI.
Tu personalidad es cercana, honesta, experta, natural y elegante. Hablas como una gran asesora de moda que conoce al milímetro cada prenda del armario del usuario.

INSTRUCCIONES CLAVE DE RAZONAMIENTO Y ESTILO:
1. ANÁLISIS CRÍTICO DE LA OCASIÓN:
   - Evalúa con rigor si las prendas que el usuario tiene en su armario son apropiadas para la ocasión o contexto que te pide (ej: boda, evento de gala, entrevista de trabajo formal, fiesta, deporte, playa, día lluvioso).
   - SI EL USUARIO NO TIENE PRENDAS ADECUADAS para esa ocasión específica (por ejemplo, te pide look para una boda pero solo tiene camisetas, sudaderas y zapatillas urbanas):
     * Sé totalmente sincera y transparente: dile amablemente que no cuenta con prendas adecuadas para ese código de vestimenta.
     * Explícale qué tipo de prendas serían las ideales para esa ocasión (ej: traje sastre, esmoquin, vestido formal, zapatos de vestir).
     * Dile claramente: "Lo más formal/adecuado que tienes en tu armario ahora mismo es esto:" y propón la mejor combinación posible con lo que posee, explicando qué le faltaría.
2. RAZONAMIENTO DE CADA ELECCIÓN:
   - Cuando propongas prendas, razona la combinación: armonía de colores, proporciones de silueta para su morfología (${context.user.bodyShape || 'estándar'}), su colorimetría (${context.user.seasonPalette || 'neutra'}) y estilos preferidos (${context.user.preferredStyles.join(', ') || 'casual'}).
3. FORMATO DE TEXTO IMPECABLE:
   - Redacta con excelente ortografía en Markdown.
   - Evita artefactos de puntuación extraños como comas sueltas o formatos rotos.
   - NO uses emojis en tus respuestas ni en los títulos.
4. ESTRUCTURA JSON ESTRICTA:
Devuelve SIEMPRE tu respuesta en formato JSON estrictamente válido:
{
  "message": "Tu explicación experta, honesta y estructurada en Markdown.",
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

    // Build parts for user prompt + items
    const userParts: any[] = [
      {
        text: `
CONTEXTO COMPLETO DEL USUARIO:
- Nombre: ${context.user.username}
- Biografía / Descripción: ${context.user.bio || 'No especificada'}
- Género / Edad: ${context.user.gender || 'No especificado'} / ${context.user.age || 'No especificada'}
- Estilos preferidos: ${context.user.preferredStyles.join(', ') || 'No especificados'}
- Estilos recientes afines: ${context.recentLikedStyles.join(', ') || 'Ninguno'}
- Morfología corporal: ${context.user.bodyShape || 'Estándar'}
- Paleta / Colorimetría: ${context.user.seasonPalette || 'Neutra'}
- Total de prendas en su armario: ${context.wardrobe.totalItems}

PRENDAS EN SU ARMARIO:
${JSON.stringify(context.wardrobe.items.map((i: any) => ({
  id: i.id,
  name: i.name,
  category: i.category,
  color: i.color,
  brand: i.brand,
  fabric: i.fabric,
  season: i.season,
  tags: i.tags,
  imageUrl: i.imageUrl
})))}

PETICIÓN DEL USUARIO:
"${userPrompt}"
`
      }
    ];

    const contents = [
      ...recentHistory,
      {
        role: 'user',
        parts: userParts
      }
    ];

    // Try Gemini 2.0 Flash
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
      console.warn('[GeminiAPI] Request failed:', res.status, errText);
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
 * Advanced heuristic styling & reasoning engine with situational gap analysis
 */
function generateHeuristicStylingResponse(userPrompt: string, context: any) {
  const items = context.wardrobe.items || [];
  const lowerPrompt = userPrompt.toLowerCase();
  
  if (items.length === 0) {
    return {
      message: `¡Hola ${context.user.username}! Veo que aún no tienes prendas registradas en tu armario.

Para poder armarte looks personalizados y decirte qué ponerte, añade algunas fotos de tu ropa en la sección Armario. En cuanto tengas prendas podré crear decenas de combinaciones para ti.`,
      recommended_outfit: null,
      highlighted_item_ids: [],
      follow_up_suggestions: [
        'Consejos para organizar mi ropa',
        '¿Qué básicos necesito para empezar?',
        'Recomendaciones según mi colorimetría'
      ]
    };
  }

  // 1. Detect if user is asking about a specific item in their wardrobe
  let targetedItem: any = null;
  for (const item of items) {
    const itemName = (item.name || '').toLowerCase();
    const itemBrand = (item.brand || '').toLowerCase();
    const itemRef = (item.reference || '').toLowerCase();
    
    if (
      (itemName && itemName !== 'nueva prenda' && lowerPrompt.includes(itemName)) ||
      (itemBrand && lowerPrompt.includes(itemBrand)) ||
      (itemRef && lowerPrompt.includes(itemRef))
    ) {
      targetedItem = item;
      break;
    }
  }

  // If no direct name match, check category keywords in prompt e.g. "gorra", "zapatillas", "porsche"
  if (!targetedItem) {
    for (const item of items) {
      const cat = (item.category || '').toLowerCase();
      const nameWords = (item.name || '').toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
      if (nameWords.some((w: string) => lowerPrompt.includes(w))) {
        targetedItem = item;
        break;
      }
    }
  }

  // 2. Classify occasion & detect wardrobe gaps
  const isWeddingOrGala = lowerPrompt.includes('boda') || lowerPrompt.includes('gala') || lowerPrompt.includes('esmoquin') || lowerPrompt.includes('matrimonio');
  const isWorkOrBusiness = lowerPrompt.includes('trabajo') || lowerPrompt.includes('oficina') || lowerPrompt.includes('reunión') || lowerPrompt.includes('entrevista') || lowerPrompt.includes('formal');
  const isPartyOrNight = lowerPrompt.includes('fiesta') || lowerPrompt.includes('cena') || lowerPrompt.includes('noche') || lowerPrompt.includes('salir') || lowerPrompt.includes('cita') || lowerPrompt.includes('club');
  const isSport = lowerPrompt.includes('deporte') || lowerPrompt.includes('gym') || lowerPrompt.includes('entrenar') || lowerPrompt.includes('correr') || lowerPrompt.includes('running');

  // Check if wardrobe has formalwear
  const formalClothes = items.filter((i: any) => {
    const name = (i.name || '').toLowerCase();
    const cat = (i.category || '').toLowerCase();
    return name.includes('traje') || name.includes('camisa') || name.includes('blazer') || name.includes('vestido') || name.includes('zapato') || name.includes('elegante') || cat.includes('suit');
  });

  // Handle wedding / formal gap scenario
  if (isWeddingOrGala && formalClothes.length === 0) {
    // Pick the most neutral/clean garments available as best compromise
    const darkOrNeutral = items.filter((i: any) => {
      const color = (i.color || '').toLowerCase();
      return ['negro', 'black', 'azul', 'marino', 'blanco', 'gris', 'beige'].some(c => color.includes(c));
    });
    const pool = darkOrNeutral.length > 0 ? darkOrNeutral : items;
    const fallbackTop = pool.find((i: any) => ['top', 'camiseta', 'camisa', 'sweater'].some(c => (i.category || '').toLowerCase().includes(c))) || items[0];
    const fallbackBottom = pool.find((i: any) => ['bottom', 'pantalon', 'pantalón', 'jeans'].some(c => (i.category || '').toLowerCase().includes(c))) || items[1] || items[0];
    const fallbackShoes = pool.find((i: any) => ['shoes', 'zapatos', 'zapatillas'].some(c => (i.category || '').toLowerCase().includes(c))) || items[2] || items[0];

    const fallbackLook = Array.from(new Set([fallbackTop, fallbackBottom, fallbackShoes].filter(Boolean)));

    return {
      message: `No tienes prendas adecuadas para una boda en tu armario. 

Para este tipo de evento te recomendaría llevar un traje sastre, un esmoquin o un vestido formal acompañado de zapatos de vestir de cuero o tacón elegante.

Lo más formal que tienes actualmente en tu armario es esto: ${fallbackLook.map(i => `**${i.name}**`).join(', ')}. 

Si necesitas asistir a la celebración con tu ropa actual, te recomiendo elegir estas prendas de tonos oscuros y líneas limpias, y complementar el look con una camisa o chaqueta formal prestada.`,
      recommended_outfit: {
        name: 'Opción más formal disponible',
        occasion: 'formal',
        item_ids: fallbackLook.map(i => i.id)
      },
      highlighted_item_ids: fallbackLook.map(i => i.id),
      follow_up_suggestions: [
        '¿Qué camisa me recomiendas comprar?',
        'Dame un look para una cena informal',
        '¿Cómo combinar zapatillas de forma más elegante?'
      ]
    };
  }

  // 3. Build a dynamic outfit matching the targeted item or occasion
  const tops = items.filter((i: any) => ['top', 'camiseta', 'camisa', 'sweater', 'hoodie', 'topwear'].some(c => (i.category || '').toLowerCase().includes(c)));
  const bottoms = items.filter((i: any) => ['bottom', 'pantalon', 'pantalón', 'jeans', 'falda', 'shorts', 'bottomwear'].some(c => (i.category || '').toLowerCase().includes(c)));
  const shoes = items.filter((i: any) => ['shoes', 'zapatos', 'zapatillas', 'calzado', 'botas', 'footwear'].some(c => (i.category || '').toLowerCase().includes(c)));
  const layers = items.filter((i: any) => ['jacket', 'outerwear', 'chaqueta', 'abrigo', 'blazer', 'layer'].some(c => (i.category || '').toLowerCase().includes(c)));
  const accessories = items.filter((i: any) => ['accessory', 'accessories', 'headwear', 'gorra', 'gafas'].some(c => (i.category || '').toLowerCase().includes(c)));

  const chosen: any[] = [];

  if (targetedItem) {
    chosen.push(targetedItem);
    const targetCat = (targetedItem.category || '').toLowerCase();
    
    // Add top if target is not top
    if (!['top', 'shirt', 'sweater', 'hoodie'].some(c => targetCat.includes(c)) && tops.length > 0) {
      chosen.push(tops[Math.floor(Math.random() * tops.length)]);
    }
    // Add bottom if target is not bottom
    if (!['bottom', 'pantalon', 'pantalón', 'jeans', 'falda', 'shorts'].some(c => targetCat.includes(c)) && bottoms.length > 0) {
      chosen.push(bottoms[Math.floor(Math.random() * bottoms.length)]);
    }
    // Add shoes if target is not shoes
    if (!['shoes', 'zapatos', 'zapatillas', 'calzado'].some(c => targetCat.includes(c)) && shoes.length > 0) {
      chosen.push(shoes[Math.floor(Math.random() * shoes.length)]);
    }
    // Add jacket or accessory if slots remain
    if (chosen.length < 3 && layers.length > 0) {
      chosen.push(layers[0]);
    }
  } else {
    // Select dynamic mix
    if (tops.length > 0) chosen.push(tops[Math.floor(Math.random() * tops.length)]);
    if (bottoms.length > 0) chosen.push(bottoms[Math.floor(Math.random() * bottoms.length)]);
    if (shoes.length > 0) chosen.push(shoes[Math.floor(Math.random() * shoes.length)]);
    if (layers.length > 0 && Math.random() > 0.5) chosen.push(layers[0]);
    if (accessories.length > 0 && Math.random() > 0.6) chosen.push(accessories[0]);
  }

  // Deduplicate
  const finalItems = Array.from(new Set(chosen.filter(Boolean)));
  const namesText = finalItems.map(i => `**${i.name}**`).join(', ');

  let occasionLabel = 'casual';
  if (isPartyOrNight) occasionLabel = 'fiesta';
  else if (isWorkOrBusiness) occasionLabel = 'trabajo';
  else if (isSport) occasionLabel = 'deporte';

  let reasoningText = `Para esta combinación he equilibrado las proporciones y contrastes de color para crear una estética limpia y armónica.`;
  if (targetedItem) {
    reasoningText = `El elemento central es **${targetedItem.name}**, complementado con prendas de corte equilibrado para que resalte de manera natural sin sobrecargar el conjunto.`;
  }

  return {
    message: `He creado esta propuesta para ti combinando ${namesText}.

- **Estructura del look**: ${reasoningText}
- **Estilo**: Diseñado para encajar con tu línea habitual de forma cómoda y versátil.

¿Quieres que hagamos alguna variación o prefieres montarlo en el lienzo?`,
    recommended_outfit: finalItems.length > 0 ? {
      name: targetedItem ? `Look con ${targetedItem.name}` : `Look Klosy: ${userPrompt.slice(0, 24)}`,
      occasion: occasionLabel,
      item_ids: finalItems.map(i => i.id)
    } : null,
    highlighted_item_ids: finalItems.map(i => i.id),
    follow_up_suggestions: [
      '¿Con qué otros zapatos puedo llevarlo?',
      'Dame otra opción más abrigada',
      '¿Cómo lo adapto para la noche?'
    ]
  };
}
