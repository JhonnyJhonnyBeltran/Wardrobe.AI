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

    // Protect against massive payloads (max 10MB base64 string)
    if (imageBase64.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen supera el tamaño máximo permitido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // Clean base64 data
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const mimeMatch = imageBase64.match(/^data:(image\/[a-z]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    if (!apiKey) {
      // Fallback heuristic if no API key
      return NextResponse.json({
        category: 'other',
        name: 'Nuevo artículo',
        color: 'Negro',
        colorHex: '#000000',
        fabric: 'Algodón',
        season: 'all-season',
        isInappropriate: false
      });
    }

    // Models to try in order of latency, multimodal capability and active availability
    const models = ['gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    const prompt = `Eres el sistema de visión artificial y estilismo de Klozet.
Tu objetivo es analizar con máxima precisión la fotografía real de una prenda u objeto que el usuario ha subido.

1. MODERACIÓN Y SEGURIDAD ESTRICTA:
   Evalúa si la imagen contiene contenido inapropiado:
   - Desnudez, pornografía, partes íntimas o contenido sexual explícito/sugerente.
   - Violencia explícita, sangre, armas, autolesiones o gore.
   - Símbolos de odio, drogas ilícitas, gestos ofensivos o contenido denigrante.
   Si detectas CUALQUIERA de estos elementos, marca "isInappropriate": true y describe la razón en "inappropriateReason".

2. CLASIFICACIÓN Y DETECCIÓN EXACTA DEL TIPO DE PRENDA:
   Si la imagen es segura ("isInappropriate": false), clasifica la prenda en una de las siguientes categorías exactas:
   - "top": Camiseta básica o gráfica, top de tirantes, crop top, polo, tank top.
   - "shirt": Camisa (de vestir o casual), blusa, sobrecamisa.
   - "sweater": Jersey, suéter de punto, cárdigan, chaleco de punto.
   - "hoodie": Sudadera (con o sin capucha), crewneck, sudadera deportiva.
   - "jacket": Chaqueta, cazadora denim/vaquera, biker de cuero, blazer, americana, bomber, cortavientos.
   - "outerwear": Abrigo largo, abrigo de lana, gabardina, parka, plumífero, trench.
   - "bottom": Pantalón largo, vaqueros / jeans, pantalones cargo, joggers, chinos, pantalones de traje, leggings.
   - "shorts": Pantalón corto, bermudas, shorts de deporte o denim.
   - "skirt": Falda (corta, midi o larga).
   - "dress": Vestido, mono, enterizo, peto.
   - "shoes": Calzado, zapatillas sneakers, botas, botines, mocasines, sandalias, tacones, zapatos de vestir.
   - "bag": Bolso, tote bag, mochila, riñonera, bandolera, cartera.
   - "accessory": Gorra, gorro, sombrero, bufanda, cinturón, gafas de sol, reloj, collar, pulsera.
   - "other": ÚNICAMENTE si es un LIBRO (novela, cómic, libro de texto), libreta, figura, producto o cualquier objeto cotidiano NO textil ni de moda.
     * Si es un LIBRO: pon el nombre como "Libro: [Título visible]".

3. DETALLES VISUALES:
   - "name": Nombre descriptivo y comercial de la prenda en español (ej: "Camiseta Gráfica Vintage", "Vaqueros Baggy Azules", "Sudadera Oversize Gris", "Zapatillas Deportivas Blancas", "Cazadora Cuero Biker").
   - "color": Nombre en español del color principal predominante (ej: Negro, Blanco, Azul marino, Gris, Beige, Verde oliva, Marrón, Rojo, etc.).
   - "colorHex": Código #HEX aproximado del color dominante.
   - "fabric": Algodón | Denim | Cuero | Lana | Lino | Poliéster | Punto | Seda | Pana | Sintético | Papel / Tapa dura.
   - "season": "spring" | "summer" | "autumn" | "winter" | "all-season".

Devuelve EXCLUSIVAMENTE un JSON válido sin texto adicional ni bloques markdown:
{
  "isInappropriate": false,
  "inappropriateReason": null,
  "category": "top" | "shirt" | "sweater" | "hoodie" | "jacket" | "outerwear" | "bottom" | "shorts" | "skirt" | "dress" | "shoes" | "bag" | "accessory" | "other",
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
        const timeout = setTimeout(() => controller.abort(), 7000);

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
              max_output_tokens: 800
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
            return NextResponse.json(parsed);
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
      category: 'top',
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
