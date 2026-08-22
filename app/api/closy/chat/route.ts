import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, checkIpRateLimit } from '@/lib/closy/rateLimiter';
import { buildUserStylingContext } from '@/lib/closy/contextIndexer';
import { getFastCourtesyResponse } from '@/lib/closy/fastResponses';
import { resolveImageUrl } from '@/lib/imageUtils';

interface ChatRequestPayload {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/**
 * Quick helper to fetch image bytes and return base64 inline_data for Gemini
 */
async function fetchImageAsBase64(rawUrl: string): Promise<{ mimeType: string; data: string } | null> {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = resolveImageUrl(rawUrl);
  if (!url || !url.startsWith('http')) return null;

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

    // 4. Apply Per-User Daily Rate Limiting (Strict 30 messages/day for cost & quality control)
    const estimatedTokens = Math.ceil(userPrompt.length / 4) + 600;
    const rateLimit = checkRateLimit(user.id, estimatedTokens);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: rateLimit.reason || 'Has alcanzado el límite de 30 consultas diarias',
          message: rateLimit.reason || 'Has agotado tus 30 mensajes diarios con Kloe. Tu límite se restablecerá mañana a las 00:00 para que puedas seguir creando looks increíbles.',
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

    // 5. Index User Context (Clothes with Photos, Outfits, Profile Preferences, Liked Styles)
    const context = await buildUserStylingContext(supabase, user.id);

    // 6. Call True AI Engine (Google Gemini 3.6 Flash with Direct Multimodal Vision Analysis)
    const geminiApiKey = process.env.GEMINI_API_KEY || 
                         process.env.GOOGLE_API_KEY || 
                         process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    let aiResult: any = null;

    if (geminiApiKey) {
      aiResult = await callGeminiAssistant(geminiApiKey, userPrompt, context, body.history || []);
    }

    // Fallback if no API key or network glitch
    if (!aiResult) {
      aiResult = generateHeuristicStylingResponse(userPrompt, context);
    }

    // Resolve garment details for recommended outfits
    const clothesMap = new Map(context.wardrobe.items.map(item => [item.id, item]));

    let resolvedOutfit = null;
    if (aiResult.recommended_outfit && Array.isArray(aiResult.recommended_outfit.item_ids)) {
      const validGarments = aiResult.recommended_outfit.item_ids
        .map((id: string) => {
          const raw = clothesMap.get(id);
          if (!raw) return null;
          const resolvedImg = resolveImageUrl(raw.imageUrl || (raw as any).image_url || (raw as any).original_image_url || (raw as any).original_image);
          return {
            ...raw,
            image_url: resolvedImg,
            imageUrl: resolvedImg
          };
        })
        .filter(Boolean);

      if (validGarments.length > 0) {
        resolvedOutfit = {
          name: aiResult.recommended_outfit.name || 'Look recomendado por Kloe',
          occasion: aiResult.recommended_outfit.occasion || null,
          items: validGarments
        };
      }
    }

    // Resolve highlighted items
    let resolvedHighlightedItems: any[] = [];
    if (Array.isArray(aiResult.highlighted_item_ids)) {
      resolvedHighlightedItems = aiResult.highlighted_item_ids
        .map((id: string) => {
          const raw = clothesMap.get(id);
          if (!raw) return null;
          const resolvedImg = resolveImageUrl(raw.imageUrl || (raw as any).image_url || (raw as any).original_image_url || (raw as any).original_image);
          return {
            ...raw,
            image_url: resolvedImg,
            imageUrl: resolvedImg
          };
        })
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
Eres Kloe, una prestigiosa estilista de moda, consultora de imagen personal y experta en tendencias contemporáneas en Wardrobe.AI.
Tu personalidad es cercana, experta, culta en moda, elocuente y empática. Hablas con la naturalidad y seguridad de una asesora de imagen de élite que aconseja a su cliente con criterio impecable.

REGLAS CRÍTICAS DE DISCERNIMIENTO Y RECONOCIMIENTO DE PRENDAS (OBLIGATORIO):
1. DISCERNIMIENTO SEMÁNTICO Y FUNCIONAL DE PRENDAS:
   - El usuario puede haberle asignado a sus prendas nombres coloquiales, abreviaturas, jerga de calle o nombres de marcas (por ejemplo: "Sudaca Scoopers", "Chupa de cuero", "Pitillos Zara", "Bambas Nike", "Suda gris", "Tejanos rotos", "Jordan 4", "Rebe beige", "Cargo militar").
   - NUNCA te limites a leer el término superficialmente; DEBES DISCERNIR Y COMPRENDER LA VERDADERA NATURALEZA Y FUNCIÓN ANATÓMICA DE CADA PRENDA:
     * Si contiene "sudaca", "suda", "hoodie", "crewneck", "buzo", "scoopers" o en la foto se aprecia $\rightarrow$ Es una SUDADERA / CAPA EXTERIOR (Outerwear / Layering).
     * Si contiene "chupa", "biker", "cazo", "americana", "blazer", "parka", "cazadora", "jacket", "bomber", "abrigo" $\rightarrow$ Es una CHAQUETA O ABRIGO (Outerwear).
     * Si contiene "tejanos", "pitillos", "baggy", "pantalones", "jogger", "cargo", "chándal", "pants", "shorts", "falda" $\rightarrow$ Es una PRENDA INFERIOR (Bottom).
     * Si contiene "bambas", "sneakers", "jordans", "dunks", "botines", "zapas", "mocasines", "botas", "sandalias" $\rightarrow$ Es CALZADO (Shoes).
     * Si contiene "rebe", "sueter", "sweater", "knit", "cardigan", "jersey" $\rightarrow$ Es PRENDA DE PUNTO / JERSEY (Knitwear / Outerwear).
     * Si contiene "cami", "tee", "t-shirt", "polo", "camisa", "blusa" $\rightarrow$ Es una CAMISETA O CAMISA (Top).
   - Utiliza tanto los metadatos como la semántica del nombre y la inspección visual de la fotografía para categorizar internamente con 100% de precisión cada prenda en: Top, Outerwear, Bottom, Shoes o Accessory.

2. COMPOSICIÓN MULTI-COMPONENTE POR CAPAS (OBLIGATORIO):
   - Un outfit realista y vestible NUNCA puede consistir en múltiples prendas de la misma categoría base (por ejemplo: JAMÁS pongas 2 o 3 camisetas juntas ni 2 pantalones).
   - Todo outfit recomendado en "recommended_outfit.item_ids" DEBE componerse seleccionando 1 prenda de distintas categorías anatómicas:
     * 1x Capa Superior / Top (Camiseta, Camisa, Top o Polo)
     * 1x Capa Exterior / Abrigo (Opcional según ocasión o clima: Sudadera con capucha, Jersey, Cazadora, Chaqueta vaquera, Americana o Abrigo)
     * 1x Capa Inferior / Pantalón (Pantalón de vestir, Vaqueros/Jeans, Chándal, Shorts o Falda)
     * 1x Calzado (Zapatillas, Sneakers, Zapatos de vestir o Botas)
     * 1x Accesorio (Opcional: Bolso, Mochila, Gorra, Gafas de sol, Joyas o Cinturón)

3. ANÁLISIS MULTIMODAL DE FOTOS DE PRENDAS:
   - Se te adjuntan las fotografías reales de las prendas del armario del usuario.
   - Si una prenda tiene un nombre genérico o incorrecto en los metadatos de la base de datos (por ejemplo: "Nueva prenda", "asdf", "Camiseta" cuando en la foto se ve claramente que es una sudadera con capucha, o "Zapatillas" cuando en la foto son unas botas):
     * OBSERVA LA FOTO DIRECTAMENTE: Analiza el color real, estampado, tejido visual, logotipo, tipo de prenda y corte.
     * NÓMBRALA EN TU RESPUESTA POR LO QUE VES EN LA FOTO (ej: "tu sudadera oversize gris con capucha", "tus zapatillas retro", "tu pantalón cargo negro").
     * Utiliza lo que ves en las fotos para evaluar con precisión la armonía cromática y texturas del look.

4. TRATAMIENTO DE SALUDOS, CORTESÍAS Y CONVERSACIÓN NATURAL ("HOLA", "QUÉ TAL", "¿QUÉ ME RECOMIENDAS?", ETC.):
   - NUNCA respondas con frases genéricas, secas o robóticas.
   - Responde de forma cálida, elocuente y con tu criterio de asesora de imagen de élite, DEMOSTRANDO QUE CONOCES SU ARMARIO:
     * Saluda cordialmente por su nombre.
     * Menciona de forma natural y contextual 1 o 2 prendas reales que ves en su armario (ej: "Estaba viendo tu armario y tienes piezas estupendas como tu [Prenda 1] o tu [Prenda 2]...").
     * Pregúntale para qué ocasión o momento del día necesita un look hoy (ej: día a día casual, cena, trabajo/reunión, fiesta, o combinar una prenda en específico).
     * En "follow_up_suggestions", aporta 3 ideas variadas y atractivas acordes a sus prendas.

5. FORMATO DE SALIDA:
   - Redacta en Markdown limpio, con excelente ortografía y viñetas para desglosar consejos.
   - NO incluyas emojis en el texto.
   - Devuelve SIEMPRE tu respuesta en formato JSON estrictamente válido:
{
  "message": "Tu explicación experta, enriquecida y estructurada en Markdown.",
  "recommended_outfit": {
    "name": "Nombre elegante del look (o null si solo es un saludo/conversación)",
    "occasion": "casual | formal | fiesta | trabajo | cita | deporte | verano | invierno",
    "item_ids": ["id_top", "id_outerwear_opcional", "id_bottom", "id_shoes", "id_accessory_opcional"]
  },
  "highlighted_item_ids": ["id_prenda_principal"],
  "follow_up_suggestions": ["Sugerencia 1", "Sugerencia 2", "Sugerencia 3"]
}
`;

    const recentHistory = history.slice(-6).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    // Fetch visual images for up to 18 garments and up to 4 saved inspirations in parallel
    const itemsToFetch = (context.wardrobe.items || []).slice(0, 18);
    const savedToFetch = (context.savedInspirations || []).slice(0, 4);

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

    const savedFetches = await Promise.allSettled(
      savedToFetch.map(async (saved: any) => {
        if (!saved.imageUrl) return null;
        const imgData = await fetchImageAsBase64(saved.imageUrl);
        if (!imgData) return null;
        return {
          id: saved.id,
          title: saved.title,
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

LOOKS Y PUBLICACIONES GUARDADAS POR EL USUARIO (INSPIRACIÓN):
${JSON.stringify(context.savedInspirations || [])}
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

    // Append visual images of saved inspirations
    savedFetches.forEach(res => {
      if (res.status === 'fulfilled' && res.value) {
        userParts.push({
          text: `FOTO DE LOOK GUARDADO POR EL USUARIO (Inspiración ID: "${res.value.id}", Título: "${res.value.title}"):`
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

    // Models available for Gemini API (Prioritizing Gemini 3.6 Flash)
    const models = ['gemini-3.6-flash', 'gemini-3.1-pro-preview'];
    
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
              max_output_tokens: 1600
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
        } else {
          const errData = await res.json().catch(() => null);
          console.warn(`[GeminiAPI] Model ${model} returned status ${res.status}:`, errData?.error?.message || res.statusText);
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

function buildLayeredOutfit(items: any[], targetItem?: any): any[] {
  if (!items || items.length === 0) return [];

  const categorize = (item: any) => {
    const name = (item.name || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    const brand = (item.brand || '').toLowerCase();
    const fabric = (item.fabric || '').toLowerCase();
    const tags = Array.isArray(item.tags) ? item.tags.map((t: string) => t.toLowerCase()) : [];
    const text = `${name} ${cat} ${brand} ${fabric} ${tags.join(' ')}`;

    // 1. Footwear
    if (
      cat.includes('shoe') || cat.includes('sneaker') || cat.includes('boot') || cat.includes('footwear') ||
      text.includes('zapatilla') || text.includes('zapato') || text.includes('bota') || text.includes('botin') || text.includes('botín') ||
      text.includes('bamba') || text.includes('sneaker') || text.includes('jordan') || text.includes('dunk') || text.includes('mocas') ||
      text.includes('loafer') || text.includes('sandalia') || text.includes('tacón') || text.includes('tacon') || text.includes('chancla') ||
      text.includes('slide') || text.includes('crocs') || text.includes('yeezy') || text.includes('vans') || text.includes('converse')
    ) {
      return 'shoes';
    }

    // 2. Outerwear / Layering / Hoodies / Jackets / Sweaters / Coats
    if (
      cat.includes('hoodie') || cat.includes('jacket') || cat.includes('outerwear') || cat.includes('sweater') || cat.includes('coat') ||
      text.includes('sudaca') || text.includes('sudadera') || text.includes('suda') || text.includes('hoodie') || text.includes('crewneck') ||
      text.includes('chaqueta') || text.includes('cazadora') || text.includes('cazo') || text.includes('chupa') || text.includes('biker') ||
      text.includes('bomber') || text.includes('abrigo') || text.includes('jersey') || text.includes('sueter') || text.includes('suéter') ||
      text.includes('blazer') || text.includes('cardigan') || text.includes('cárdigan') || text.includes('rebeca') || text.includes('rebe') ||
      text.includes('anorak') || text.includes('parka') || text.includes('polar') || text.includes('fleece') || text.includes('chaleco') ||
      text.includes('gabardina') || text.includes('trench') || text.includes('windbreaker') || text.includes('cortavientos') || text.includes('scoopers')
    ) {
      return 'outerwear';
    }

    // 3. Bottoms
    if (
      cat.includes('bottom') || cat.includes('pant') || cat.includes('jean') || cat.includes('short') || cat.includes('skirt') ||
      text.includes('pantalon') || text.includes('pantalón') || text.includes('vaquero') || text.includes('tejanos') || text.includes('jean') ||
      text.includes('pitillo') || text.includes('baggy') || text.includes('cargo') || text.includes('jogger') || text.includes('chandal') ||
      text.includes('chándal') || text.includes('short') || text.includes('falda') || text.includes('bermuda') || text.includes('legging') ||
      text.includes('chino') || text.includes('culotte')
    ) {
      return 'bottom';
    }

    // 4. Accessories
    if (
      cat.includes('bag') || cat.includes('accessor') || cat.includes('other') ||
      text.includes('bolso') || text.includes('mochila') || text.includes('gorra') || text.includes('gorro') || text.includes('beanie') ||
      text.includes('gafas') || text.includes('reloj') || text.includes('cinturon') || text.includes('cinturón') || text.includes('bufanda') ||
      text.includes('collar') || text.includes('anillo') || text.includes('tote') || text.includes('cartera')
    ) {
      return 'accessory';
    }

    // 5. Default Tops (Camisetas, camisas, polos, tops)
    return 'top';
  };

  const pool = {
    top: [] as any[],
    outerwear: [] as any[],
    bottom: [] as any[],
    shoes: [] as any[],
    accessory: [] as any[]
  };

  items.forEach(item => {
    const layer = categorize(item);
    pool[layer as keyof typeof pool].push(item);
  });

  const selected: any[] = [];
  const selectedIds = new Set<string>();

  if (targetItem) {
    selected.push(targetItem);
    selectedIds.add(targetItem.id);
  }

  const targetLayer = targetItem ? categorize(targetItem) : null;

  // Add 1 bottom if not already selected
  if (targetLayer !== 'bottom' && pool.bottom.length > 0) {
    const b = pool.bottom.find(i => !selectedIds.has(i.id));
    if (b) { selected.push(b); selectedIds.add(b.id); }
  }

  // Add 1 top if not already selected
  if (targetLayer !== 'top' && pool.top.length > 0) {
    const t = pool.top.find(i => !selectedIds.has(i.id));
    if (t) { selected.push(t); selectedIds.add(t.id); }
  }

  // Add 1 footwear if not already selected
  if (targetLayer !== 'shoes' && pool.shoes.length > 0) {
    const s = pool.shoes.find(i => !selectedIds.has(i.id));
    if (s) { selected.push(s); selectedIds.add(s.id); }
  }

  // Add 1 outerwear if available and not selected
  if (targetLayer !== 'outerwear' && pool.outerwear.length > 0) {
    const o = pool.outerwear.find(i => !selectedIds.has(i.id));
    if (o) { selected.push(o); selectedIds.add(o.id); }
  }

  // Add 1 accessory if available and not selected
  if (targetLayer !== 'accessory' && pool.accessory.length > 0) {
    const a = pool.accessory.find(i => !selectedIds.has(i.id));
    if (a) { selected.push(a); selectedIds.add(a.id); }
  }

  // If still fewer than 2 items, add any remaining distinct item
  if (selected.length < 2) {
    for (const item of items) {
      if (!selectedIds.has(item.id)) {
        selected.push(item);
        selectedIds.add(item.id);
        if (selected.length >= 3) break;
      }
    }
  }

  return selected;
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
      message: `¡Hola ${context.user.username || ''}! Para poder armarte combinaciones con tus prendas reales y darte asesoría personalizada, añade algunas fotos de tu ropa a tu armario.

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

  // Scenario 2: Greetings & Natural check-ins with wardrobe context
  const isGreeting = ['hola', 'buenas', 'hey', 'ey', 'holi', 'que tal', 'como estas', 'buenos dias', 'buenas tardes', 'buenas noches'].some(g => lower === g || lower.startsWith(g + ' ') || lower.endsWith(' ' + g));
  if (isGreeting && items.length > 0) {
    const sampleItems = items.slice(0, 2).map((i: any) => `**${i.name}**`).join(' y ');
    return {
      message: `¡Hola ${context.user.username || ''}! Qué gusto saludarte.

Estaba revisando las prendas de tu armario y veo que tenemos piezas estupendas con las que podemos jugar hoy, como tu ${sampleItems}.

¿Para qué momento u ocasión quieres que preparemos un look? Dime si buscas algo casual para el día a día, un conjunto formal para el trabajo o cena, o si te apetece combinar una prenda en específico.`,
      recommended_outfit: null,
      highlighted_item_ids: items.slice(0, 2).map((i: any) => i.id),
      follow_up_suggestions: [
        'Arma un look casual con mis prendas',
        'Recomiéndame un outfit para una cena',
        'Outfit formal para el trabajo'
      ]
    };
  }

  // Scenario 3: Wedding / Gala / Formal Event
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

  // Scenario 4: Target item combination - with semantic slang matching (e.g. "sudaca", "scoopers", "tejanos")
  let targetGarment = items.find((i: any) => {
    const name = (i.name || '').toLowerCase();
    const brand = (i.brand || '').toLowerCase();
    return (name !== 'nueva prenda' && (lower.includes(name) || (brand && lower.includes(brand))));
  });

  if (!targetGarment) {
    targetGarment = items.find((i: any) => {
      const words = (i.name || '').toLowerCase().split(/[\s_-]+/).filter((w: string) => w.length > 2);
      return words.some((w: string) => lower.includes(w));
    });
  }

  // Slang alias matching (e.g. user asks for "sudaca", find a hoodie/sudadera in wardrobe)
  if (!targetGarment) {
    if (lower.includes('sudaca') || lower.includes('sudadera') || lower.includes('hoodie')) {
      targetGarment = items.find((i: any) => {
        const cat = (i.category || '').toLowerCase();
        const n = (i.name || '').toLowerCase();
        return cat.includes('hoodie') || cat.includes('outerwear') || n.includes('sudaca') || n.includes('sudadera') || n.includes('hoodie');
      });
    } else if (lower.includes('chupa') || lower.includes('cazadora') || lower.includes('chaqueta')) {
      targetGarment = items.find((i: any) => {
        const cat = (i.category || '').toLowerCase();
        const n = (i.name || '').toLowerCase();
        return cat.includes('jacket') || n.includes('chaqueta') || n.includes('cazadora') || n.includes('chupa');
      });
    } else if (lower.includes('tejanos') || lower.includes('vaqueros') || lower.includes('jeans')) {
      targetGarment = items.find((i: any) => {
        const cat = (i.category || '').toLowerCase();
        const n = (i.name || '').toLowerCase();
        return cat.includes('bottom') || cat.includes('jean') || n.includes('vaquero') || n.includes('tejano') || n.includes('jean');
      });
    } else if (lower.includes('bambas') || lower.includes('zapas') || lower.includes('sneakers')) {
      targetGarment = items.find((i: any) => {
        const cat = (i.category || '').toLowerCase();
        const n = (i.name || '').toLowerCase();
        return cat.includes('shoe') || n.includes('zapatilla') || n.includes('sneaker') || n.includes('bamba');
      });
    }
  }

  const layeredOutfit = buildLayeredOutfit(items, targetGarment);

  if (targetGarment) {
    return {
      message: `Para sacarle el máximo partido a tu **${targetGarment.name}** (${targetGarment.category}), he armado un outfit equilibrado de pies a cabeza combinando distintas capas:

- **Estructura del look**: ${layeredOutfit.map((i: any) => `**${i.name}** (${i.category})`).join(' + ')}.
- **Equilibrio visual**: Contrastamos texturas y volúmenes para que cada pieza cumpla su función anatómica en el conjunto sin sobrecargar.

¿Quieres que lo ajustemos con otros zapatos o prendas de abrigo?`,
      recommended_outfit: {
        name: `Look con ${targetGarment.name}`,
        occasion: 'casual',
        item_ids: layeredOutfit.map((i: any) => i.id)
      },
      highlighted_item_ids: [targetGarment.id],
      follow_up_suggestions: [
        '¿Qué otro calzado puedo usar?',
        'Opciones para darle un toque más formal',
        '¿Cómo añadir una capa extra de abrigo?'
      ]
    };
  }

  // Default Balanced Multi-layer Stylist Outfit
  return {
    message: `Para responder a lo que me pides sobre "${userPrompt}", he compuesto un look completo combinando diferentes capas y categorías de tu armario:

- **Composición del look**: ${layeredOutfit.map((i: any) => `**${i.name}** (${i.category})`).join(' + ')}.
- **Criterio de estilismo**: Equilibramos prendas superiores, inferiores y calzado para lograr una silueta armónica y funcional.

¿Te gusta esta combinación o quieres explorar una opción más formal o deportiva?`,
    recommended_outfit: {
      name: `Propuesta de Estilo Kloe`,
      occasion: 'casual',
      item_ids: layeredOutfit.map((i: any) => i.id)
    },
    highlighted_item_ids: layeredOutfit.map((i: any) => i.id),
    follow_up_suggestions: [
      '¿Cómo adaptarlo para la noche?',
      '¿Qué calzado combina mejor?',
      'Consejos de colores según mi colorimetría'
    ]
  };
}
