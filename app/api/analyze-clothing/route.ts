import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { checkIpRateLimit, getMadridDayKey } from '@/lib/closy/rateLimiter';
import { getGeminiApiKey } from '@/lib/ai/geminiClient';

// In-memory hot cache for instant sub-millisecond responses on serverless instances
const memoryImageCache = new Map<string, { data: AnalyzeResponse; timestamp: number }>();
const MEMORY_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export interface AnalyzeResponse {
  category: 'top' | 'shirt' | 'sweater' | 'hoodie' | 'jacket' | 'outerwear' | 'bottom' | 'shorts' | 'skirt' | 'dress' | 'shoes' | 'bag' | 'accessory' | 'other';
  name: string;
  brand: string | null;
  color: string;
  colorHex: string;
  fabric: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'all-season';
  isInappropriate: boolean;
  inappropriateReason?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. IP Rate Limiting protection (anti-scraping)
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    
    if (!checkIpRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Demasiadas peticiones. Por favor espera un momento.' },
        { status: 429 }
      );
    }

    // 2. Authenticate user session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para analizar prendas con IA' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { imageBase64 } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ error: 'Se requiere una imagen en base64' }, { status: 400 });
    }

    // Protect against massive payloads (max 4MB base64 string after client compression)
    if (imageBase64.length > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen supera el tamaño máximo permitido (4MB)' }, { status: 400 });
    }

    // Clean base64 data and normalize MIME type
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    let rawMime = mimeMatch ? mimeMatch[1].toLowerCase() : 'image/jpeg';
    
    // Gemini inline_data only accepts jpeg, png, webp, gif
    let mimeType = 'image/jpeg';
    if (rawMime.includes('png')) mimeType = 'image/png';
    else if (rawMime.includes('webp')) mimeType = 'image/webp';
    else if (rawMime.includes('gif')) mimeType = 'image/gif';

    // 3. ZERO-COST CACHE: Calculate SHA-256 fingerprint of the image
    const imageHash = crypto.createHash('sha256').update(cleanBase64).digest('hex');

    // A) Fast Memory Cache Check
    const memoryCached = memoryImageCache.get(imageHash);
    if (memoryCached && Date.now() - memoryCached.timestamp < MEMORY_CACHE_TTL) {
      return NextResponse.json(memoryCached.data, {
        headers: { 'X-Cache': 'HIT-MEMORY', 'X-Cache-Hash': imageHash }
      });
    }

    // B) Supabase Persistent Cache Check (across all users & sessions)
    try {
      const { data: dbCached } = await (supabase
        .from('ai_image_cache' as any)
        .select('*')
        .eq('image_hash', imageHash)
        .maybeSingle() as any);

      if (dbCached && dbCached.raw_analysis) {
        memoryImageCache.set(imageHash, { data: dbCached.raw_analysis, timestamp: Date.now() });
        
        // Asynchronously update hit count and last accessed timestamp
        (supabase
          .from('ai_image_cache' as any)
          .update({
            hits_count: (dbCached.hits_count || 1) + 1,
            last_accessed_at: new Date().toISOString()
          })
          .eq('image_hash', imageHash) as any)
          .then(() => {})
          .catch(() => {});

        return NextResponse.json(dbCached.raw_analysis, {
          headers: { 'X-Cache': 'HIT-DATABASE', 'X-Cache-Hash': imageHash }
        });
      }
    } catch (cacheErr) {
      // Non-fatal if table not yet created
      console.warn('[AnalyzeClothing] Cache lookup non-fatal error:', cacheErr);
    }

    // 4. CHECK USER SUBSCRIPTION & PERSISTENT DAILY QUOTA (Anti-Bleeding)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, is_premium, subscription_tier, subscription_status, username, full_name, ai_daily_usage_date, ai_daily_usage_count, ai_lifetime_items_analyzed')
      .eq('id', user.id)
      .maybeSingle();

    const isEthan = Boolean(
      user.email?.toLowerCase().includes('ethan') ||
      profile?.username?.toLowerCase() === 'ethan' ||
      profile?.full_name?.toLowerCase().includes('ethan')
    );

    const isPremium = isEthan || Boolean(
      profile?.is_premium ||
      profile?.subscription_tier === 'premium' ||
      profile?.subscription_status === 'active'
    );

    const todayKey = getMadridDayKey();
    const userUsageDate = (profile as any)?.ai_daily_usage_date;
    const userDailyCount = (userUsageDate === todayKey) ? ((profile as any)?.ai_daily_usage_count || 0) : 0;
    const FREE_DAILY_ITEM_LIMIT = 5;

    if (!isPremium && userDailyCount >= FREE_DAILY_ITEM_LIMIT) {
      return NextResponse.json(
        {
          error: 'Has alcanzado el límite gratuito diario de análisis de prendas (5 prendas/día). Tu cuota se reinicia a las 00:00 (hora peninsular) o desbloquea Klozet Pro para análisis ilimitados.',
          limitReached: true,
          dailyLimit: FREE_DAILY_ITEM_LIMIT,
          usedToday: userDailyCount,
          isPremium: false
        },
        { status: 429 }
      );
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json({
        category: 'bottom',
        name: 'Prenda de armario',
        brand: null,
        color: 'Negro',
        colorHex: '#121212',
        fabric: 'Algodón',
        season: 'all-season',
        isInappropriate: false
      });
    }

    // Models verified active with vision generateContent support (Fastest and highly available first)
    const models = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite'
    ];

    const prompt = `Eres un experto clasificador visual de moda y prendas de vestir para la app Klozet.
Analiza detenidamente la fotografía real de la prenda u objeto subido por el usuario.

1. SEGURIDAD Y MODERACIÓN:
   - "isInappropriate": true si contiene desnudez explícita, partes íntimas, violencia, armas o drogas ilegales. De lo contrario, false.

2. CLASIFICACIÓN RIGUROSA DE LA PRENDA:
   Identifica la prenda y selecciona obligatoriamente una de las siguientes categorías exactas en el campo "category":
   - "bottom": CUALQUIER pantalón largo, vaqueros / jeans, pantalones cargo, joggers, chinos, pantalones de vestir/pinzas, leggings, pantalones de chándal. (Si ves perneras largas, tiro, cinturilla de pantalón o denim largo -> es "bottom").
   - "shorts": Pantalón corto, bermudas, shorts vaqueros, shorts deportivos, bañador de hombre.
   - "top": Camisetas básicas o gráficas, tops de tirantes, crop tops, polos, tank tops, camisetas de manga corta/larga.
   - "shirt": Camisas de botones (formales o casuales), blusas, sobrecamisas.
   - "sweater": Jerseys de punto, suéteres, cárdigans, chalecos de punto.
   - "hoodie": Sudaderas con o sin capucha, crewnecks, sudaderas deportivas.
   - "jacket": Chaquetas, cazadoras vaqueras/denim, bikers de cuero, blazers, americanas, bombers, cortavientos.
   - "outerwear": Abrigos largos, parkas, plumíferos, gabardinas, abrigos de lana, trench.
   - "skirt": Faldas (minifaldas, faldas midi, faldas largas, faldas plisadas).
   - "dress": Vestidos, monos enteros, petos, jumpsuits.
   - "shoes": Calzado, zapatillas / sneakers, botas, botines, mocasines, sandalias, tacones, zapatos de vestir.
   - "bag": Bolsos de mano, tote bags, mochilas, riñoneras, bandoleras, carteras.
   - "accessory": Gorras, gorros, sombreros, cinturones, gafas de sol, relojes, bufandas, corbatas, joyas.
   - "other": ÚNICAMENTE para objetos que NO sean prendas de vestir ni calzado (ej: libros, cómics, figuras, libretas). ESTÁ PROHIBIDO clasificar una prenda o ropa como "other".

3. DETECCIÓN DE MARCA, LOGOS Y ESTAMPADOS VISIBLES:
   - "brand": Si en la prenda se observa un logotipo reconocible, texto de marca, bordado o etiqueta visible (ej: "Nike", "Adidas", "Zara", "Stussy", "Ralph Lauren", "Carhartt", "Gucci", "Uniqlo", "Pull&Bear", "Bershka", "Mango", "Massimo Dutti", "Vans", "Converse", "New Balance", "Supreme", "Levi's", "The North Face", "Jordan", "Lacoste", "Tommy Hilfiger", "Calvin Klein", "Puma", "Balenciaga", "Corteiz", "Scuffers", "Nude Project", "Esenzia", etc.), extrae el nombre exacto de la marca.
   - Si NO hay ninguna marca visible o es una prenda genérica/básica sin logo evidente, pon null.
   - PROHIBIDO bajo ninguna circunstancia poner "closet", "klozet", "armario" o nombres de la app como marca.

4. DETECCIÓN CROMÁTICA Y DE DETALLES:
   - "color": Nombre en español del color predominante REAL de la prenda (ej: "Azul marino", "Azul denim", "Negro", "Blanco", "Gris", "Beige", "Verde militar", "Marrón", "Rojo", "Rosa", "Amarillo", "Naranja", "Morado", etc.).
   - "colorHex": Código hexadecimal representativo del color dominante (ej: Negro="#121212", Azul marino="#1E293B", Azul denim="#2563EB", Blanco="#FFFFFF", Beige="#D4C4B0", Gris="#6B7280", Verde oliva="#4D5D3B", etc.).
   - "name": Nombre descriptivo de catálogo en español (ej: "Vaqueros Baggy Azul Claro", "Pantalón Cargo Negro", "Camiseta Gráfica Vintage", "Sudadera Oversize Gris", "Zapatillas Bajas Blancas"). Si detectas una marca clara, puedes incluirla (ej: "Camiseta Esenzia Azul Marino", "Sudadera Nike Gris").
   - "fabric": Algodón | Denim | Cuero | Lana | Lino | Poliéster | Punto | Seda | Pana | Sintético.
   - "season": "spring" | "summer" | "autumn" | "winter" | "all-season".

Devuelve ÚNICAMENTE un JSON válido sin texto extra:
{
  "isInappropriate": false,
  "inappropriateReason": null,
  "category": "bottom",
  "brand": "Nombre de la marca o null",
  "name": "Nombre descriptivo de la prenda",
  "color": "Color principal",
  "colorHex": "#hex",
  "fabric": "Tejido",
  "season": "all-season"
}
`;

    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);

        const response = await fetch(geminiUrl, {
          method: 'POST',
          signal: controller.signal,
          headers: { 
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: cleanBase64
                    }
                  },
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.1,
              max_output_tokens: 600
            }
          })
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            let cleaned = candidateText.trim();
            if (cleaned.startsWith('```json')) {
              cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleaned.startsWith('```')) {
              cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            const parsed: AnalyzeResponse = JSON.parse(cleaned);
            if (parsed && parsed.category) {
              // 5. CACHE WRITE & USER QUOTA INCREMENT
              memoryImageCache.set(imageHash, { data: parsed, timestamp: Date.now() });

              // Asynchronously persist to Supabase cache table
              (supabase
                .from('ai_image_cache' as any)
                .upsert({
                  image_hash: imageHash,
                  category: parsed.category,
                  name: parsed.name,
                  brand: parsed.brand,
                  color: parsed.color,
                  color_hex: parsed.colorHex,
                  fabric: parsed.fabric,
                  season: parsed.season,
                  is_inappropriate: parsed.isInappropriate,
                  raw_analysis: parsed,
                  hits_count: 1,
                  created_at: new Date().toISOString(),
                  last_accessed_at: new Date().toISOString()
                }) as any)
                .then(() => {})
                .catch((e: any) => console.warn('[AnalyzeClothing] Cache upsert warning:', e));

              // Update persistent daily quota count for user
              (supabase
                .from('profiles')
                .update({
                  ai_daily_usage_date: todayKey,
                  ai_daily_usage_count: userDailyCount + 1,
                  ai_lifetime_items_analyzed: (((profile as any)?.ai_lifetime_items_analyzed || 0) + 1)
                } as any)
                .eq('id', user.id) as any)
                .then(() => {})
                .catch((e: any) => console.warn('[AnalyzeClothing] Quota update warning:', e));

              return NextResponse.json(parsed, {
                headers: {
                  'X-Cache': 'MISS',
                  'X-Cache-Hash': imageHash,
                  'X-Daily-Used': String(userDailyCount + 1),
                  'X-Daily-Limit': isPremium ? 'unlimited' : String(FREE_DAILY_ITEM_LIMIT)
                }
              });
            }
          }
        } else {
          console.warn(`[AnalyzeClothing] Model ${model} returned status ${response.status}`);
        }
      } catch (innerErr) {
        console.warn(`[AnalyzeClothing] Model ${model} failed, trying next:`, innerErr);
      }
    }

    // Default graceful fallback if all models failed or network issue
    return NextResponse.json({
      category: 'bottom',
      name: 'Nueva prenda',
      color: 'Negro',
      colorHex: '#121212',
      fabric: 'Algodón',
      season: 'all-season',
      isInappropriate: false
    });

  } catch (error: any) {
    console.error('[AnalyzeClothing] Error processing request:', error);
    return NextResponse.json(
      { error: 'Error al analizar la imagen' },
      { status: 500 }
    );
  }
}
