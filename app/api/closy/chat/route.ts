import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, checkIpRateLimit } from '@/lib/closy/rateLimiter';
import { buildUserStylingContext } from '@/lib/closy/contextIndexer';

interface ChatRequestPayload {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/**
 * Quick helper to fetch image bytes and return base64 inline_data for Gemini
 */
async function fetchImageAsBase64(url: string): Promise<{ mimeType: string; data: string } | null> {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length > 2 * 1024 * 1024) return null; // Skip if > 2MB
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.includes('png') ? 'image/png' : (contentType.includes('webp') ? 'image/webp' : 'image/jpeg');
    return {
      mimeType,
      data: buffer.toString('base64')
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. IP Abuse Protection
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    
    if (!checkIpRateLimit(clientIp)) {
      return NextResponse.json(
        { 
          error: 'Demasiadas peticiones desde tu dirección IP. Por favor espera un momento.',
          message: 'Demasiadas peticiones desde tu dirección IP. Por favor espera un momento.',
          limitReached: true
        },
        { status: 429 }
      );
    }

    // 2. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para consultar a Klosy' },
        { status: 401 }
      );
    }

    // 3. Parse input body with size restriction
    let body: ChatRequestPayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Formato de petición inválido' }, { status: 400 });
    }

    const userPrompt = (body.message || '').trim();

    if (!userPrompt) {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
    }

    if (userPrompt.length > 500) {
      return NextResponse.json({ error: 'El mensaje supera el límite de 500 caracteres' }, { status: 400 });
    }

    // 4. Apply Per-User Rate Limiting & Token Budgeting
    const estimatedTokens = Math.ceil(userPrompt.length / 4) + 600;
    const rateLimit = checkRateLimit(user.id, estimatedTokens);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: rateLimit.reason || 'Has alcanzado el límite de peticiones',
          message: rateLimit.reason || 'Has alcanzado el límite de peticiones con Klosy por hoy.',
          limitReached: true,
          isDailyLimit: rateLimit.isDailyLimit,
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

    // 5. Index User Context (Clothes, Outfits, Profile Preferences, Liked Styles)
    const context = await buildUserStylingContext(supabase, user.id);

    // 6. Call AI Engine (Gemini with Multimodal Image Recognition)
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
 * Invokes Google Gemini 3.6 Flash / Flash Latest with Multimodal Image Recognition
 */
async function callGeminiAssistant(
  apiKey: string,
  userPrompt: string,
  context: any,
  history: Array<{ role: string; content: string }>
) {
  try {
    const systemInstruction = `
Eres Klosy, una prestigiosa estilista de moda, consultora de imagen personal y experta en tendencias contemporáneas en Wardrobe.AI.
Tu personalidad es cercana, experta, culta en moda, elocuente y empática. Hablas con la naturalidad y seguridad de una asesora de imagen de élite que aconseja a su cliente con criterio impecable.

PRINCIPIOS DE ESTILISMO Y RESPUESTA INTELIGENTE:
1. ASESORAMIENTO DE ALTO NIVEL:
   - Responde siempre con criterio real de moda: explica las reglas de etiqueta para cada ocasión (bodas de día o noche, galas, entrevistas, cóctel), códigos de vestimenta, combinación de texturas (ej: contrastar cuero brillante con punto mate o denim), teoría del color, proporciones de silueta y calzado adecuado.
2. ANÁLISIS MULTIMODAL DE FOTOS DE PRENDAS:
   - Se te adjuntan las fotografías reales de las prendas del armario del usuario.
   - Si una prenda tiene un nombre genérico o incorrecto en los metadatos de la base de datos (por ejemplo: "Nueva prenda", "asdf", "Camiseta" cuando en la foto se ve claramente que es una sudadera con capucha, o "Zapatillas" cuando en la foto son unas Nike Shox):
     * OBSERVA LA FOTO DIRECTAMENTE: Analiza el color real, estampado, tejido visual, logotipo, tipo de prenda y corte.
     * NÓMBRALA EN TU RESPUESTA POR LO QUE VES EN LA FOTO (ej: "tu sudadera oversize con capucha", "tus zapatillas Nike Shox R4 plateadas", "tu cazadora vaquera azul").
     * Utiliza lo que ves en las fotos para evaluar con precisión la armonía visual del look.
3. ANÁLISIS DE LAS PRENDAS DEL USUARIO:
   - Revisa el armario del usuario provisto en el contexto y las fotos.
   - Si el usuario te pide qué ponerse para una ocasión (ej: boda, evento formal, cita, viaje):
     * Primero dale el consejo canónico y experto de lo que esa ocasión exige (ej: "Para una boda de tarde lo ideal es un traje en azul marino o gris marengo, camisa de vestir blanca o celeste, corbata de seda y zapatos oxford o mocasines de piel").
     * Luego evalúa qué tiene en su armario:
       - Si tiene prendas adecuadas, indícale cómo combinarlas y colócalas en "recommended_outfit".
       - Si su armario no tiene prendas de esa etiqueta (ej: solo tiene zapatillas y sudaderas urbanas), sé sincera y elegante: explícale que su armario no cuenta con las piezas clave para esa etiqueta, recomiéndale qué prendas buscar y preséntale la opción más formal o limpia que tenga actualmente como alternativa de emergencia.
4. FORMATO:
   - Redacta en Markdown limpio, con excelente ortografía, párrafos fluidos y viñetas para desglosar consejos.
   - NO incluyas emojis en el texto.
   - Devuelve SIEMPRE tu respuesta en formato JSON estrictamente válido:
{
  "message": "Tu explicación experta, enriquecida y estructurada en Markdown.",
  "recommended_outfit": {
    "name": "Nombre elegante del look",
    "occasion": "casual | formal | fiesta | trabajo | cita | deporte | verano | invierno",
    "item_ids": ["id_prenda_1", "id_prenda_2"]
  },
  "highlighted_item_ids": ["id_prenda_1"],
  "follow_up_suggestions": ["Sugerencia 1", "Sugerencia 2", "Sugerencia 3"]
}
`;

    const recentHistory = history.slice(-6).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    // Fetch visual images for up to 10 garments in parallel
    const itemsToFetch = (context.wardrobe.items || []).slice(0, 10);
    const imageFetches = await Promise.allSettled(
      itemsToFetch.map(async (item: any) => {
        if (!item.imageUrl) return null;
        const imgData = await fetchImageAsBase64(item.imageUrl);
        if (!imgData) return null;
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          imgData
        };
      })
    );

    const userParts: any[] = [
      {
        text: `
PERFIL DEL USUARIO:
- Nombre: ${context.user.username}
- Biografía / Estilo personal: ${context.user.bio || 'Sin especificar'}
- Morfología: ${context.user.bodyShape || 'Estándar'}
- Colorimetría: ${context.user.seasonPalette || 'Neutra'}
- Estilos favoritos: ${context.user.preferredStyles.join(', ') || 'Moda actual'}
- Total de prendas registradas: ${context.wardrobe.totalItems}

METADATOS DEL ARMARIO (Puede contener nombres genéricos o incompletos):
${JSON.stringify(context.wardrobe.items.map((i: any) => ({
  id: i.id,
  name: i.name,
  category: i.category,
  color: i.color,
  brand: i.brand,
  fabric: i.fabric,
  season: i.season,
  tags: i.tags
})))}
`
      }
    ];

    // Append visual images of garments so Gemini can directly inspect them
    imageFetches.forEach(res => {
      if (res.status === 'fulfilled' && res.value) {
        userParts.push({
          text: `FOTO REAL DE LA PRENDA (ID: "${res.value.id}", Nombre en BD: "${res.value.name}", Categoría en BD: "${res.value.category}"):`
        });
        userParts.push({
          inline_data: {
            mime_type: res.value.imgData.mimeType,
            data: res.value.imgData.data
          }
        });
      }
    });

    userParts.push({
      text: `
PETICIÓN DEL USUARIO:
"${userPrompt}"
`
    });

    const contents = [
      ...recentHistory,
      {
        role: 'user',
        parts: userParts
      }
    ];

    // Models available for Gemini API
    const models = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.5-flash'];
    
    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.7,
              max_output_tokens: 1400
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            let cleaned = candidateText.trim();
            if (cleaned.startsWith('```json')) {
              cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleaned.startsWith('```')) {
              cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            return JSON.parse(cleaned);
          }
        }
      } catch (innerErr) {
        console.warn(`[GeminiAPI] Model ${model} failed, trying next:`, innerErr);
      }
    }

    return null;
  } catch (err) {
    console.error('[GeminiAPI] Error calling Gemini API:', err);
    return null;
  }
}

/**
 * Intelligent Stylist Reasoning Engine (Provides rich, articulate fashion intelligence even before API key is defined)
 */
function generateHeuristicStylingResponse(userPrompt: string, context: any) {
  const items = context.wardrobe.items || [];
  const lower = userPrompt.toLowerCase();

  // Scenario 1: Empty wardrobe
  if (items.length === 0) {
    return {
      message: `¡Hola ${context.user.username}! Para poder armarte combinaciones con tus prendas reales y darte asesoría personalizada, añade algunas fotos de tu ropa a tu armario.

Mientras tanto, puedes preguntarme sobre cualquier tendencia, combinaciones de colores o qué tipo de prendas elegir para cada ocasión.`,
      recommended_outfit: null,
      highlighted_item_ids: [],
      follow_up_suggestions: [
        '¿Cómo combinar prendas de cuero?',
        '¿Qué ponerse para una boda de tarde?',
        'Básicos imprescindibles de armario'
      ]
    };
  }

  // Scenario 2: Wedding / Gala / Formal Event
  if (lower.includes('boda') || lower.includes('gala') || lower.includes('matrimonio') || lower.includes('esmoquin')) {
    const formalMatches = items.filter((i: any) => {
      const name = (i.name || '').toLowerCase();
      const cat = (i.category || '').toLowerCase();
      return name.includes('traje') || name.includes('camisa') || name.includes('blazer') || name.includes('vestido') || name.includes('chino') || cat.includes('suit');
    });

    if (formalMatches.length >= 2) {
      return {
        message: `Para una boda o evento formal, la clave es mantener una elegancia sobria y un ajuste impecable:

- **Estructura recomendada**: Un traje sastre o blazer estructurado en tonos azul marino, gris marengo o negro, combinado con una camisa de cuello italiano y zapatos clásicos de piel.
- **En tu armario**: He seleccionado tus prendas más elegantes (${formalMatches.map((i: any) => `**${i.name}**`).join(', ')}) que forman una combinación armoniosa y distinguida.

Te recomiendo rematar el conjunto con un cinturón a juego con el calzado y un reloj discreto.`,
        recommended_outfit: {
          name: 'Look Formal para Boda',
          occasion: 'formal',
          item_ids: formalMatches.map((i: any) => i.id)
        },
        highlighted_item_ids: formalMatches.map((i: any) => i.id),
        follow_up_suggestions: [
          '¿Qué color de zapatos combina mejor?',
          '¿Qué accesorios puedo añadir?',
          'Opciones más relajadas de cóctel'
        ]
      };
    } else {
      // Honest gap analysis
      const darkestItems = items.filter((i: any) => {
        const col = (i.color || '').toLowerCase();
        return ['negro', 'black', 'azul', 'gris', 'marino', 'blanco'].some(c => col.includes(c));
      });
      const selectedDark = (darkestItems.length >= 2 ? darkestItems : items).slice(0, 3);

      return {
        message: `Para una boda o evento de etiqueta, lo canónico y más acertado es vestir:
- **Prendas ideales**: Un traje de corte sastre (azul marino, marengo o negro), camisa de vestir lisa y zapatos clásicos tipo Oxford, Derby o mocasines de piel.

**Revisión de tu armario actual:**
Actualmente no tienes un traje formal ni calzado de vestir registrado. Lo más sobrio y pulcro que tienes en tu armario ahora mismo es esto: ${selectedDark.map((i: any) => `**${i.name}**`).join(', ')}.

Si no tienes tiempo de conseguir un traje, te aconsejo apostar por estas prendas de colores oscuros y líneas limpias, pero lo ideal para la ocasión sería complementar el look con una camisa de vestir o una americana formal.`,
        recommended_outfit: {
          name: 'Alternativa sobria disponible',
          occasion: 'formal',
          item_ids: selectedDark.map((i: any) => i.id)
        },
        highlighted_item_ids: selectedDark.map((i: any) => i.id),
        follow_up_suggestions: [
          '¿Qué prendas básicas formales debería comprar?',
          'Consejos para un look de cóctel',
          '¿Cómo vestir elegante sin traje?'
        ]
      };
    }
  }

  // Scenario 3: Leather / Cuero trend
  if (lower.includes('cuero') || lower.includes('leather') || lower.includes('biker') || lower.includes('piel')) {
    const leatherItem = items.find((i: any) => (i.name || '').toLowerCase().includes('cuero') || (i.fabric || '').toLowerCase().includes('cuero') || (i.name || '').toLowerCase().includes('piel') || (i.name || '').toLowerCase().includes('biker'));
    const complementary = items.filter((i: any) => i.id !== leatherItem?.id).slice(0, 3);

    return {
      message: `El cuero es una de las texturas más potentes de la temporada y eleva cualquier look si sabes equilibrar los contrastes:

- **Regla de oro**: Como el cuero tiene brillo y cuerpo propio, combínalo con tejidos mates y suaves (algodón grueso, punto, denim lavado o lana) para que no quede sobrecargado.
- **Siluetas**: Si llevas una cazadora de cuero estructurada, combínala con pantalones de corte recto o relajado y calzado con personalidad (botas Chelsea o sneakers minimalistas).
${leatherItem ? `\n- **En tu armario**: Tienes **${leatherItem.name}**, que puedes combinar a la perfección con ${complementary.map((i: any) => `**${i.name}**`).join(', ')} para un estilo moderno con carácter.` : '\n- Si aún no tienes una prenda de cuero en tu armario, una chaqueta biker clásica o unos botines negros son la mejor inversión atemporal.'}`,
      recommended_outfit: leatherItem ? {
        name: `Look de Tendencia: ${leatherItem.name}`,
        occasion: 'casual',
        item_ids: [leatherItem.id, ...complementary.map((i: any) => i.id)]
      } : null,
      highlighted_item_ids: leatherItem ? [leatherItem.id] : [],
      follow_up_suggestions: [
        '¿Cómo combinar cuero en días de entretiempo?',
        '¿Qué calzado queda mejor con chaquetas de cuero?',
        'Look casual con zapatillas'
      ]
    };
  }

  // Scenario 4: Specific target item combination (e.g. Porsche accessory, shoes, specific hoodie)
  let targetGarment = items.find((i: any) => {
    const name = (i.name || '').toLowerCase();
    const brand = (i.brand || '').toLowerCase();
    return (name !== 'nueva prenda' && lower.includes(name)) || (brand && lower.includes(brand));
  });

  if (!targetGarment) {
    targetGarment = items.find((i: any) => {
      const words = (i.name || '').toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
      return words.some((w: string) => lower.includes(w));
    });
  }

  if (targetGarment) {
    const others = items.filter((i: any) => i.id !== targetGarment.id);
    const selectedOthers = others.slice(0, 3);
    const outfitItems = [targetGarment, ...selectedOthers];

    return {
      message: `Para sacarle el máximo partido a tu **${targetGarment.name}** (${targetGarment.category}), la mejor estrategia de estilismo es usarla como pieza de contraste:

- **Armonía visual**: Te propongo combinarla con ${selectedOthers.map((i: any) => `**${i.name}**`).join(', ')} para equilibrar los tonos y texturas.
- **Equilibrio de volúmenes**: Mantenemos una silueta proporcionada donde la prenda destaque sin competir con el resto del conjunto.

¿Quieres que hagamos alguna variación o prefieres montarlo en el lienzo para ajustar cómo colocarlo?`,
      recommended_outfit: {
        name: `Look con ${targetGarment.name}`,
        occasion: 'casual',
        item_ids: outfitItems.map((i: any) => i.id)
      },
      highlighted_item_ids: [targetGarment.id],
      follow_up_suggestions: [
        '¿Qué otro calzado puedo usar?',
        'Opciones para darle un toque más formal',
        '¿Cómo añadir una capa extra?'
      ]
    };
  }

  // Default Expert Stylist Response for any prompt
  const balancedSelection = items.slice(0, Math.min(4, items.length));
  return {
    message: `Para responder a lo que me pides sobre "${userPrompt}", como estilista te recomiendo una fórmula que equilibra versatilidad, proporciones y estilo:

- **Estructura del look**: Combina piezas de cortes complementarios para generar una silueta armónica que se adapte a tu estilo personal.
- **Selección de tu armario**: He elegido ${balancedSelection.map((i: any) => `**${i.name}**`).join(', ')} para componer una propuesta equilibrada.

¿Te gusta esta combinación o te gustaría enfocarla hacia algo más formal o relajado?`,
    recommended_outfit: {
      name: `Propuesta de Estilo Klosy`,
      occasion: 'casual',
      item_ids: balancedSelection.map((i: any) => i.id)
    },
    highlighted_item_ids: balancedSelection.map((i: any) => i.id),
    follow_up_suggestions: [
      '¿Cómo adaptarlo para la noche?',
      '¿Qué calzado combina mejor?',
      'Consejos de colores según mi colorimetría'
    ]
  };
}
