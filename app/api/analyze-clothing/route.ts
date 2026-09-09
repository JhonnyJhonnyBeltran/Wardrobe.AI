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

    // Call Gemini Flash Vision model
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Eres el sistema de visión e inteligencia artificial de Klozet.
Tu tarea es:
1. MODERACIÓN Y SEGURIDAD ESTRICTA:
   Evalúa si la imagen contiene contenido inapropiado:
   - Desnudez, pornografía, partes íntimas o contenido sexual explícito/sugerente.
   - Violencia explícita, sangre, armas, autolesiones o gore.
   - Símbolos de odio, drogas ilícitas, gestos ofensivos o contenido denigrante.
   Si detectas CUALQUIERA de estos elementos, debes marcar "isInappropriate": true y describir la razón en "inappropriateReason".

2. CLASIFICACIÓN DEL ARTÍCULO:
   Si la imagen es segura ("isInappropriate": false), clasifica el objeto con máxima precisión:
   - "other": LIBROS (novelas, ensayos, cómics, libros de texto), cuadernos, agendas, figuras, tecnología, coleccionables, tazas o cualquier objeto cotidiano NO textil.
     * Si es un LIBRO: detecta el título o temática visible en la portada y pon el nombre como "Libro: [Título]" o "Libro [Temática]".
   - "top": Camiseta, top, tirantes, crop top, polo.
   - "shirt": Camisa formal o casual, blusa con botones.
   - "sweater": Jersey, suéter de punto, cárdigan.
   - "hoodie": Sudadera con capucha o sudadera deportiva sin capucha.
   - "jacket": Chaqueta, cazadora vaquera, blazer, bomber, biker de cuero.
   - "outerwear": Abrigo largo, gabardina, parka, plumífero, abrigo de lana.
   - "bottom": Pantalón largo, jeans, vaqueros, joggers, chinos, leggings.
   - "shorts": Pantalón corto, bermudas, shorts.
   - "skirt": Falda (corta, midi o larga).
   - "dress": Vestido, mono, enterizo.
   - "shoes": Zapatos, zapatillas sneakers, botas, botines, sandalias, tacones.
   - "bag": Bolso, mochila, riñonera, cartera, maletín.
   - "accessory": Gorra, sombrero, bufanda, cinturón, gafas de sol, reloj, joyería, corbata.

Devuelve EXCLUSIVAMENTE un JSON válido sin bloques markdown ni texto extra con esta estructura:
{
  "isInappropriate": false,
  "inappropriateReason": null,
  "category": "top" | "shirt" | "sweater" | "hoodie" | "jacket" | "outerwear" | "bottom" | "shorts" | "skirt" | "dress" | "shoes" | "bag" | "accessory" | "other",
  "name": "Nombre descriptivo y natural en español (ej: Libro: El Principito, Sudadera Oversize Negra, Cazadora Denim, etc.)",
  "color": "Nombre en español del color principal (ej: Negro, Blanco, Azul, Beige, Rojo, etc.)",
  "colorHex": "#hex aproximado del color principal",
  "fabric": "Papel / Tapa dura | Tapa blanda | Algodón | Poliéster | Cuero | Denim | Lana | Seda | Lino | Punto | Sintético | Otro",
  "season": "all-season" | "spring" | "summer" | "autumn" | "winter"
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(geminiUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: cleanBase64
                }
              },
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      })
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn('[AnalyzeClothing] Gemini API error status:', response.status);
      return NextResponse.json({
        category: 'other',
        name: 'Artículo',
        color: 'Negro',
        colorHex: '#000000',
        fabric: 'Algodón',
        season: 'all-season',
        isInappropriate: false
      });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (rawText) {
      try {
        const parsed: AnalyzeResponse = JSON.parse(rawText.trim());
        return NextResponse.json(parsed);
      } catch (err) {
        console.error('[AnalyzeClothing] Failed to parse JSON from Gemini:', rawText);
      }
    }

    return NextResponse.json({
      category: 'top',
      name: 'Prenda',
      color: 'Negro',
      colorHex: '#000000',
      fabric: 'Algodón',
      season: 'all-season',
      isInappropriate: false
    });

  } catch (error: any) {
    console.error('[AnalyzeClothing] Error processing request:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al analizar la imagen' },
      { status: 500 }
    );
  }
}
