import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export type WeatherCondition = 'sunny' | 'cloudy' | 'rain' | 'snow';

export interface DailyWeatherEntry {
  temp: number;
  tempMax: number;
  tempMin: number;
  condition: WeatherCondition;
  label: string;
}

function mapWmoToCondition(code: number): { condition: WeatherCondition; label: string } {
  // Snow: 71, 73, 75, 77, 85, 86
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { condition: 'snow', label: 'Nieve' };
  }
  // Rain / Drizzle / Showers / Thunderstorm
  if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 95 && code <= 99)
  ) {
    return { condition: 'rain', label: 'Lluvia' };
  }
  // Cloudy / Partly Cloudy / Fog
  if ([2, 3, 45, 48].includes(code)) {
    return { condition: 'cloudy', label: 'Nublado' };
  }
  // Clear / Mainly clear
  return { condition: 'sunny', label: 'Soleado' };
}

function mapWttrDescToCondition(desc: string): { condition: WeatherCondition; label: string } {
  const lower = desc.toLowerCase();
  if (/(snow|sleet|blizzard|ice|nieve|aguanieve)/.test(lower)) {
    return { condition: 'snow', label: 'Nieve' };
  }
  if (/(rain|drizzle|shower|thunder|storm|lluvia|llovizna|chubasco|tormenta)/.test(lower)) {
    return { condition: 'rain', label: 'Lluvia' };
  }
  if (/(cloud|overcast|mist|fog|nub|niebla|bruma)/.test(lower)) {
    return { condition: 'cloudy', label: 'Nublado' };
  }
  return { condition: 'sunny', label: 'Soleado' };
}

async function fetchOpenMeteoForecast(latitude: number, longitude: number) {
  const forecastRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&past_days=2&forecast_days=16`,
    { next: { revalidate: 1800 } }
  );

  if (!forecastRes.ok) return null;

  const forecast = await forecastRes.json();
  const times: string[] = forecast?.daily?.time || [];
  const codes: number[] = forecast?.daily?.weather_code || [];
  const maxTemps: number[] = forecast?.daily?.temperature_2m_max || [];
  const minTemps: number[] = forecast?.daily?.temperature_2m_min || [];

  const days: Record<string, DailyWeatherEntry> = {};
  times.forEach((date, idx) => {
    const tempMax = Math.round(Number(maxTemps[idx] ?? 0));
    const tempMin = Math.round(Number(minTemps[idx] ?? tempMax));
    const code = Number(codes[idx] ?? 0);
    const { condition, label } = mapWmoToCondition(code);
    days[date] = {
      temp: tempMax,
      tempMax,
      tempMin,
      condition,
      label,
    };
  });

  return days;
}

async function fetchWttrFallback(city: string) {
  const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
    headers: { 'User-Agent': 'KlozetCalendar/1.0' },
    next: { revalidate: 1800 },
  });
  if (!res.ok) return null;

  const json = await res.json();
  const weatherList = Array.isArray(json?.weather) ? json.weather : [];
  if (weatherList.length === 0) return null;

  const days: Record<string, DailyWeatherEntry> = {};
  for (const w of weatherList) {
    const date = w?.date;
    if (!date) continue;
    const tempMax = Math.round(Number(w.maxtempC ?? w.avgtempC ?? 0));
    const tempMin = Math.round(Number(w.mintempC ?? tempMax));
    const midHourly = Array.isArray(w.hourly) ? w.hourly[Math.floor(w.hourly.length / 2)] : null;
    const desc = midHourly?.weatherDesc?.[0]?.value || '';
    const { condition, label } = mapWttrDescToCondition(desc);
    days[date] = { temp: tempMax, tempMax, tempMin, condition, label };
  }

  const area = json?.nearest_area?.[0];
  const resolvedCity = area?.areaName?.[0]?.value || city;
  const resolvedCountry = area?.country?.[0]?.value || '';

  return { city: resolvedCity, country: resolvedCountry, days };
}

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
    let rawCity = req.nextUrl.searchParams.get('city')?.trim() || '';
    if (!rawCity && isAuto) {
      const headerCity = req.headers.get('x-vercel-ip-city') || '';
      if (headerCity) {
        try {
          rawCity = decodeURIComponent(headerCity).trim();
        } catch {
          rawCity = headerCity.trim();
        }
      }
      if (!rawCity) rawCity = 'Madrid';
    }

    if (!rawCity || rawCity.length < 2 || rawCity.length > 80) {
      return NextResponse.json(
        { error: 'Introduce un nombre de ciudad válido' },
        { status: 400 }
      );
    }

    // 1. Resolve city coordinates cleanly
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(rawCity)}&count=1&language=es&format=json`,
      { next: { revalidate: 86400 } }
    );

    if (geoRes.ok) {
      const geoData = await geoRes.json();
      const place = geoData?.results?.[0];

      if (place && typeof place.latitude === 'number' && typeof place.longitude === 'number') {
        const days = await fetchOpenMeteoForecast(place.latitude, place.longitude);
        if (days && Object.keys(days).length > 0) {
          return NextResponse.json({
            city: place.name || rawCity,
            country: place.country || '',
            days,
          });
        }
      }
    }

    // 2. Fallback to wttr.in endpoint if Open-Meteo returned no match
    const fallback = await fetchWttrFallback(rawCity);
    if (fallback && Object.keys(fallback.days).length > 0) {
      return NextResponse.json(fallback);
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
