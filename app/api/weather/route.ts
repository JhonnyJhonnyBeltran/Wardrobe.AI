import { NextRequest, NextResponse } from 'next/server';
import {
  fetchOpenMeteoForecast,
  resolveWeatherByCityName,
  extractRequestCityHint,
} from '@/lib/weather/forecast';

export const dynamic = 'force-dynamic';
export type { DailyWeatherEntry, WeatherCondition } from '@/lib/weather/forecast';

export async function GET(req: NextRequest) {
  const latParam = req.nextUrl.searchParams.get('lat');
  const lonParam = req.nextUrl.searchParams.get('lon');
  const isAuto = req.nextUrl.searchParams.get('auto') === '1';

  try {
    // Mode A: Direct coordinates (browser geolocation)
    if (latParam && lonParam) {
      const lat = Number(latParam);
      const lon = Number(lonParam);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return NextResponse.json({ error: 'Coordenadas inválidas' }, { status: 400 });
      }

      const days = await fetchOpenMeteoForecast(lat, lon);
      if (!days || Object.keys(days).length === 0) {
        return NextResponse.json({ error: 'No se pudo obtener la previsión' }, { status: 502 });
      }

      let resolvedCity = 'Tu ubicación';
      try {
        const rev = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=es`,
          { headers: { 'User-Agent': 'KlozetCalendar/1.0' }, next: { revalidate: 86400 } }
        );
        if (rev.ok) {
          const revJson = await rev.json();
          const addr = revJson?.address;
          resolvedCity = addr?.city || addr?.town || addr?.village || addr?.municipality || resolvedCity;
        }
      } catch {}

      return NextResponse.json({ city: resolvedCity, country: '', days });
    }

    // Mode B: City name (explicit or auto-detected from Vercel IP header / Madrid fallback)
    const rawCity =
      req.nextUrl.searchParams.get('city')?.trim() ||
      (isAuto ? extractRequestCityHint(req.headers) : '');

    if (!rawCity || rawCity.length < 2 || rawCity.length > 80) {
      return NextResponse.json(
        { error: 'Introduce un nombre de ciudad válido' },
        { status: 400 }
      );
    }

    const result = await resolveWeatherByCityName(rawCity);
    if (result) {
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'No encontramos esa ciudad. Prueba con otra cercana.' },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { error: 'No se pudo obtener la previsión del tiempo' },
      { status: 500 }
    );
  }
}
