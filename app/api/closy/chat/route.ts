import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, checkIpRateLimit } from '@/lib/closy/rateLimiter';
import { buildUserStylingContext } from '@/lib/closy/contextIndexer';
import { getFastCourtesyResponse } from '@/lib/closy/fastResponses';
import { resolveImageUrl } from '@/lib/imageUtils';
import { getGeminiApiKey } from '@/lib/ai/geminiClient';

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

    // 6. Call True AI Engine (Google Gemini 3.6 Flash / 3 Flash Preview with Direct Multimodal Vision Analysis)
    const geminiApiKey = getGeminiApiKey();

    let aiResult: any = null;

    if (geminiApiKey) {
      aiResult = await callGeminiAssistant(geminiApiKey, userPrompt, context, body.history || []);
    }

    // Fallback if no API key or network glitch
    if (!aiResult) {
      aiResult = generateHeuristicStylingResponse(userPrompt, context, body.history || []);
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
Eres Kloe, la asesora de estilismo e imagen personal de élite de Wardrobe.AI.
Tu personalidad es cercana, cálida, experta en alta moda, elocuente y con criterio impecable. Hablas como una amiga experta y estilista personal dedicada, jamás como un robot ni usando plantillas rígidas o repetitivas.

REGLAS CRÍTICAS DE ESTILISMO Y CONVERSACIÓN (OBLIGATORIO):

1. CONTINUIDAD CONVERSACIONAL Y AJUSTES DINÁMICOS (MÁXIMA PRIORIDAD):
   - DEBES prestar máxima atención al HISTORIAL DE CONVERSACIÓN anterior.
   - Si el usuario te pide cambiar o modificar una pieza (ejemplos: "quiero otra parte de arriba", "cámbiame los zapatos", "ponme otros pantalones", "no me gusta esa sudadera", "dame otra opción más abrigada", "algo más oscuro"):
     * Identifica el look anterior.
     * MANTÉN las piezas que funcionan bien y SUSTITUYE LA PRENDA SOLICITADA por OTRA PRENDA DIFERENTE de su armario.
     * NUNCA repitas la misma prenda que el usuario acaba de pedir cambiar.
     * Explica con naturalidad el motivo estilístico del cambio (cómo transforma la vibra, la silueta o el contraste cromático).
   - Si te pide un estilo o vibe diferente (ej: "streetwear", "minimalista", "old money", "noche", "fiesta", "casual"), reconfigura el conjunto entero según sus gustos y piezas disponibles.

2. PERSONALIZACIÓN POR PERFIL, MORFOLOGÍA Y COLORIMETRÍA:
   - Integra de forma sutil y experta sus datos: estilos preferidos, morfología corporal y paleta de estación.
   - Justifica tus elecciones destacando armonías de colores, equilibrio de volúmenes (ej: corte holgado arriba con silueta recta abajo, o contrastes de texturas mate vs brillo).

3. COMPOSICIÓN REALISTA Y EQUILIBRADA POR CAPAS:
   - Cada conjunto en "recommended_outfit.item_ids" DEBE ser vestible y equilibrado:
     * 1x Parte Superior (Camiseta, camisa, top o polo)
     * 1x Capa de Abrigo/Exterior (Opcional según ocasión: sudadera, jersey, cazadora, blazer, abrigo)
     * 1x Parte Inferior (Vaqueros, pantalón de vestir, cargo, falda, shorts)
     * 1x Calzado (Zapatillas, botas, zapatos, mocasines)
     * 1x Accesorio (Opcional: bolso, gorra, gafas, reloj, cinturón)
   - JAMÁS repitas dos prendas de la misma categoría base (nunca 2 camisetas a la vez ni 2 pantalones).

4. LENGUAJE NATURAL, HUMANO Y FLUIDO:
   - PROHIBIDO usar fórmulas robóticas como:
     "Para responder a lo que me pides sobre..."
     "Para sacarle el máximo partido a tu..."
     "Composición del look: ..."
     "Criterio de estilismo: ..."
   - Habla con prosa fluida, elegante y entusiasta, usando negritas (**Nombre de Prenda**) para resaltar piezas y viñetas limpias para desglosar consejos o alternativas.
   - NO incluyas emojis en el texto.

5. FORMATO DE SALIDA (JSON ESTRICTO):
Devuelve SIEMPRE tu respuesta en formato JSON estrictamente válido:
{
  "message": "Tu explicación experta, enriquecida y estructurada en Markdown.",
  "recommended_outfit": {
    "name": "Nombre creativo y elegante del look (o null si es solo conversación/saludo)",
    "occasion": "casual | formal | fiesta | trabajo | cita | noche | verano | invierno",
    "item_ids": ["id_1", "id_2", "id_3", "id_4"]
  },
  "highlighted_item_ids": ["id_prenda_principal"],
  "follow_up_suggestions": ["Sugerencia personalizada 1", "Sugerencia personalizada 2", "Sugerencia personalizada 3"]
}
`;

    // Sanitize and alternate conversation history turns strictly for Gemini API (user -> model -> user -> model)
    const sanitizedHistory: Array<{ role: 'user' | 'model'; parts: any[] }> = [];
    for (const h of history.slice(-6)) {
      const role: 'user' | 'model' = h.role === 'user' ? 'user' : 'model';
      // Skip if first turn is model
      if (sanitizedHistory.length === 0 && role === 'model') continue;
      // Skip if duplicate consecutive role
      if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === role) continue;
      
      sanitizedHistory.push({
        role,
        parts: [{ text: h.content }]
      });
    }

    // If the last history turn is 'user', pop it so the incoming user message takes the final 'user' slot
    if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === 'user') {
      sanitizedHistory.pop();
    }

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

METADATOS DEL ARMARIO (Prendas disponibles para armar combinaciones):
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
      ...sanitizedHistory,
      {
        role: 'user',
        parts: userParts
      }
    ];

    // Models available for Gemini API (Prioritizing verified active Gemini models)
    const models = ['gemini-3-flash-preview', 'gemini-3.6-flash'];
    
    // First attempt: with multimodal vision images
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

    // Second attempt: Text-only payload (guaranteed instant success if multimodal had network/size issues)
    const textOnlyContents = [
      ...sanitizedHistory,
      {
        role: 'user',
        parts: [
          {
            text: `
PERFIL DEL USUARIO:
- Nombre: ${context.user.username}
- Biografía / Estilo personal: ${context.user.bio || 'Sin especificar'}
- Morfología: ${context.user.bodyShape || 'Estándar'}
- Colorimetría: ${context.user.seasonPalette || 'Neutra'}
- Estilos favoritos: ${context.user.preferredStyles.join(', ') || 'Moda actual'}

PRENDAS DISPONIBLES EN EL ARMARIO DEL USUARIO:
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

PETICIÓN DEL USUARIO:
"${userPrompt}"
`
          }
        ]
      }
    ];

    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: textOnlyContents,
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
        }
      } catch (innerErr) {
        console.warn(`[GeminiAPI Text-Only] Model ${model} failed:`, innerErr);
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
 * Intelligent Stylist Reasoning Engine (Provides rich, articulate fashion intelligence even if fallback triggers)
 */
function generateHeuristicStylingResponse(
  userPrompt: string, 
  context: any, 
  history: Array<{ role: string; content: string }> = []
) {
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

  // Scenario 3: Replacement / Variation intent ("quiero otra parte de arriba", "otros zapatos", "otro pantalon", "cambiame...")
  const wantsOtherTop = lower.includes('otra parte de arriba') || lower.includes('otro top') || lower.includes('otra camiseta') || lower.includes('otra camisa') || lower.includes('otro jersey');
  const wantsOtherBottom = lower.includes('otro pantalon') || lower.includes('otro pantalón') || lower.includes('otra parte de abajo') || lower.includes('otros vaqueros') || lower.includes('otra falda');
  const wantsOtherShoes = lower.includes('otros zapatos') || lower.includes('otro calzado') || lower.includes('otras zapatillas') || lower.includes('otras bambas') || lower.includes('otras botas');
  const wantsOtherOuterwear = lower.includes('otra sudadera') || lower.includes('otra chaqueta') || lower.includes('otro abrigo') || lower.includes('otra cazadora') || lower.includes('otra capa');

  if (wantsOtherTop || wantsOtherBottom || wantsOtherShoes || wantsOtherOuterwear) {
    // Find previous assistant message to see what garments were mentioned
    const prevAssistantMsgs = history.filter(h => h.role === 'assistant' || (h as any).role === 'model');
    const lastMsgContent = prevAssistantMsgs.length > 0 ? prevAssistantMsgs[prevAssistantMsgs.length - 1].content.toLowerCase() : '';

    let replacedCategoryName = 'prenda';
    let targetLayer: 'top' | 'bottom' | 'shoes' | 'outerwear' = 'top';

    if (wantsOtherTop) {
      replacedCategoryName = 'la parte superior';
      targetLayer = 'top';
    } else if (wantsOtherBottom) {
      replacedCategoryName = 'el pantalón';
      targetLayer = 'bottom';
    } else if (wantsOtherShoes) {
      replacedCategoryName = 'el calzado';
      targetLayer = 'shoes';
    } else if (wantsOtherOuterwear) {
      replacedCategoryName = 'la prenda de abrigo';
      targetLayer = 'outerwear';
    }

    // Filter candidate items for that layer that were NOT in the last message
    const candidateItems = items.filter((item: any) => {
      const name = (item.name || '').toLowerCase();
      const isMentioned = lastMsgContent.includes(name) && name.length > 2;
      return !isMentioned;
    });

    const chosenAlternative = candidateItems.length > 0 ? candidateItems[0] : items[0];
    const newOutfit = buildLayeredOutfit(items, chosenAlternative);

    return {
      message: `¡Entendido! He sustituido ${replacedCategoryName} por tu **${chosenAlternative.name}**, manteniendo el equilibrio con el resto de piezas de tu armario.

- **Look renovado**: ${newOutfit.map((i: any) => `**${i.name}**`).join(' + ')}.
- **Por qué funciona**: Esta alternativa aporta una silueta más armoniosa y se complementa a la perfección con los tonos y texturas de las demás prendas.

¿Qué te parece este cambio o prefieres probar con otra combinación?`,
      recommended_outfit: {
        name: `Ajuste de estilo: ${chosenAlternative.name}`,
        occasion: 'casual',
        item_ids: newOutfit.map((i: any) => i.id)
      },
      highlighted_item_ids: [chosenAlternative.id],
      follow_up_suggestions: [
        '¿Cómo lo adapto para la noche?',
        '¿Qué otro calzado combina bien?',
        'Dame una opción más abrigada'
      ]
    };
  }

  // Scenario 4: Wedding / Gala / Formal Event
  if (lower.includes('boda') || lower.includes('gala') || lower.includes('matrimonio') || lower.includes('esmoquin')) {
    const formalMatches = items.filter((i: any) => {
      const name = (i.name || '').toLowerCase();
      const cat = (i.category || '').toLowerCase();
      return name.includes('traje') || name.includes('camisa') || name.includes('blazer') || name.includes('vestido') || name.includes('chino') || cat.includes('suit');
    });

    if (formalMatches.length >= 2) {
      return {
        message: `Para una ocasión formal o boda, la clave es mantener una silueta limpia y elegante:

- **Estructura recomendada**: Un blazer estructurado o traje en tonos oscuros (marino, carbón o negro) con una camisa lisa y calzado pulcro de piel.
- **En tu armario**: He seleccionado tus piezas más acordes (${formalMatches.map((i: any) => `**${i.name}**`).join(', ')}), creando un conjunto sobrio y sofisticado.

Un cinturón discreto y un reloj clásico completarán el estilismo a la perfección.`,
        recommended_outfit: {
          name: 'Look Formal de Etiqueta',
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
        message: `Para un evento de etiqueta, lo canónico es apostar por un traje de corte sastre (azul marino, marengo o negro), camisa de vestir y calzado clásico tipo Oxford o mocasines.

**Opciones disponibles en tu armario:**
No tenemos un traje completo registrado, pero podemos componer una alternativa limpia y sobria con tus prendas de tonos neutros: ${selectedDark.map((i: any) => `**${i.name}**`).join(', ')}.

Si tienes oportunidad, te aconsejo añadir una camisa formal o una americana estructurada para redondear el estilismo.`,
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

  // Scenario 5: Leather / Cuero trend
  if (lower.includes('cuero') || lower.includes('leather') || lower.includes('biker') || lower.includes('piel')) {
    const leatherItem = items.find((i: any) => (i.name || '').toLowerCase().includes('cuero') || (i.fabric || '').toLowerCase().includes('cuero') || (i.name || '').toLowerCase().includes('piel') || (i.name || '').toLowerCase().includes('biker'));
    const complementary = items.filter((i: any) => i.id !== leatherItem?.id).slice(0, 3);

    return {
      message: `El cuero es un tejido protagonista que añade presencia inmediata a cualquier look:

- **Contraste de texturas**: Combínalo con tejidos suaves y mates (algodón de gramaje medio, denim lavado o punto) para equilibrar el brillo y la rigidez de la piel.
- **Siluetas**: Si llevas una pieza estructurada arriba, unos pantalones de tiro medio y corte recto crearán una proporción perfecta.
${leatherItem ? `\n- **En tu armario**: Tienes **${leatherItem.name}**, que combina magníficamente con ${complementary.map((i: any) => `**${i.name}**`).join(', ')}.` : '\n- Si aún no tienes una prenda de cuero en tu armario, una chaqueta biker clásica o unos botines negros son inversiones esenciales.'}`,
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

  // Scenario 6: Target item combination - with semantic slang matching (e.g. "sudaca", "scoopers", "tejanos")
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
      message: `He diseñado una combinación alrededor de tu **${targetGarment.name}** para potenciar su estilo y equilibrar las proporciones:

- **Estructura del look**: ${layeredOutfit.map((i: any) => `**${i.name}**`).join(' + ')}.
- **Detalle de estilismo**: Jugamos con capas y contraste de tonos para que la pieza principal destaque de forma natural sin sobrecargar.

¿Te gusta esta combinación o te apetece probar con otro calzado o una prenda de abrigo diferente?`,
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
    message: `He armado un outfit completo y versátil combinando diferentes capas de tu armario:

- **Propuesta del conjunto**: ${layeredOutfit.map((i: any) => `**${i.name}**`).join(' + ')}.
- **Armonía y equilibrio**: Combinamos una parte superior cómoda con un corte inferior favorecedor y calzado coordinado.

¿Quieres que lo adaptemos para alguna ocasión en particular o cambiamos alguna prenda?`,
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
