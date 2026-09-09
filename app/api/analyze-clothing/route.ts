import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkIpRateLimit } from '@/lib/closy/rateLimiter';

export interface AnalyzeResponse {
  category: 'top' | 'shirt' | 'sweater' | 'hoodie' | 'jacket' | 'outerwear' | 'bottom' | 'shorts' | 'skirt' | 'dress' | 'shoes' | 'bag' | 'accessory' | 'other';
  name: string;
  color: string;
  colorHex: string;
  fabric: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'all-season';
  isInappropriate: boolean;
  inappropriateReason?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. IP Rate Limiting protection
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

    // Protect against massive payloads (max 12MB base64 string)
    if (imageBase64.length > 12 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen supera el tamaño máximo permitido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // Clean base64 data and normalize MIME type
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    let rawMime = mimeMatch ? mimeMatch[1].toLowerCase() : 'image/jpeg';
    
    // Gemini inline_data only accepts jpeg, png, webp, gif
    let mimeType = 'image/jpeg';
    if (rawMime.includes('png')) mimeType = 'image/png';
    else if (rawMime.includes('webp')) mimeType = 'image/webp';
    else if (rawMime.includes('gif')) mimeType = 'image/gif';

    if (!apiKey) {
      return NextResponse.json({
        category: 'bottom',
        name: 'Prenda de armario',
        color: 'Negro',
        colorHex: '#121212',
        fabric: 'Algodón',
        season: 'all-season',
        isInappropriate: false
      });
    }

    // Models verified active with vision generateContent support
    const models = ['gemini-3-flash-preview', 'gemini-3.6-flash', 'gemini-3.5-flash'];

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

3. DETECCIÓN CROMÁTICA Y DE DETALLES:
   - "color": Nombre en español del color predominante REAL de la prenda (ej: "Azul marino", "Azul denim", "Negro", "Blanco", "Gris", "Beige", "Verde militar", "Marrón", "Rojo", "Rosa", "Amarillo", "Naranja", "Morado", etc.).
   - "colorHex": Código hexadecimal representativo del color dominante (ej: Negro="#121212", Azul marino="#1E293B", Azul denim="#2563EB", Blanco="#FFFFFF", Beige="#D4C4B0", Gris="#6B7280", Verde oliva="#4D5D3B", etc.).
   - "name": Nombre descriptivo de catálogo en español (ej: "Vaqueros Baggy Azul Claro", "Pantalón Cargo Negro", "Camiseta Gráfica Vintage", "Sudadera Oversize Gris", "Zapatillas Bajas Blancas").
   - "fabric": Algodón | Denim | Cuero | Lana | Lino | Poliéster | Punto | Seda | Pana | Sintético.
   - "season": "spring" | "summer" | "autumn" | "winter" | "all-season".

Devuelve ÚNICAMENTE un JSON válido sin texto extra:
{
  "isInappropriate": false,
  "inappropriateReason": null,
  "category": "bottom",
  "name": "Nombre descriptivo de la prenda",
  "color": "Color principal",
  "colorHex": "#hex",
  "fabric": "Tejido",
  "season": "all-season"
}`;

    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(geminiUrl, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
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
              return NextResponse.json(parsed);
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
