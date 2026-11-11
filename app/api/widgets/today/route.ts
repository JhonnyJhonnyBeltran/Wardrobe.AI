import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMadridDayKey } from '@/lib/closy/rateLimiter';
import {
  resolveWeatherByCityName,
  extractRequestCityHint,
} from '@/lib/weather/forecast';
import { resolveImageUrl } from '@/lib/imageUtils';

export const dynamic = 'force-dynamic';

/**
 * Widget Feed Endpoint for Apple WidgetKit Extension (Square & Medium) and Web Preview.
 * Returns ONLY today's temperature + location alongside today's planned outfit (or empty prompt state).
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const todayDate = req.nextUrl.searchParams.get('date') || getMadridDayKey();
    const requestedCity = req.nextUrl.searchParams.get('city')?.trim();
    const cityToFetch = requestedCity || extractRequestCityHint(req.headers);

    const weatherPromise = resolveWeatherByCityName(cityToFetch).catch(() => null);

    let todayOutfit: any = null;
    if (user) {
      const { data: rows } = await (supabase as any)
        .from('calendar_outfits')
        .select(`
          id,
          date,
          outfits (
            id,
            name,
            image_url,
            outfit_items (
              position_x,
              position_y,
              scale,
              rotation,
              layer_order,
              clothing_item:clothing_items (
                id,
                name,
                category,
                color,
                image_url
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('date', todayDate)
        .limit(1);

      const first = rows?.[0]?.outfits;
      if (first) {
        const mappedItems = (first.outfit_items || [])
          .filter((oi: any) => oi.clothing_item)
          .map((oi: any) => ({
            ...oi.clothing_item,
            clothing_item: oi.clothing_item,
            image_url: resolveImageUrl(oi.clothing_item.image_url),
            position_x: oi.position_x,
            position_y: oi.position_y,
            scale: oi.scale,
            rotation: oi.rotation,
            layer_order: oi.layer_order,
          }));

        todayOutfit = {
          id: first.id,
          name: first.name || 'Outfit de hoy',
          image_url: first.image_url ? resolveImageUrl(first.image_url) : null,
          items: mappedItems,
          outfit_items: mappedItems,
        };
      }
    }

    const weatherResult = await weatherPromise;
    const todayWeatherEntry =
      weatherResult?.days?.[todayDate] ||
      (weatherResult?.days ? Object.values(weatherResult.days)[0] : undefined);

    return NextResponse.json({
      date: todayDate,
      city: weatherResult?.city || cityToFetch,
      temp: typeof todayWeatherEntry?.temp === 'number' ? todayWeatherEntry.temp : null,
      hasOutfit: Boolean(todayOutfit),
      outfit: todayOutfit,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[WidgetTodayAPI] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Error al generar snapshot del widget' },
      { status: 500 }
    );
  }
}
