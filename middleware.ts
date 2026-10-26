import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'wardrobe-auth',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'lax'
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Optimization for high scale (1k-15k+ concurrent users):
  // Public pages and webhook/cron endpoints do not require active session refresh.
  // Skipping supabase.auth.getUser() on public traffic prevents connection/rate-limit saturation.
  const pathname = request.nextUrl.pathname;
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/contacto') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/cookies') ||
    pathname.startsWith('/trends') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/api/webhooks');

  // Only refresh session if we are navigating protected routes AND there is a potential session cookie
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('wardrobe-auth') || c.name.includes('sb-'));

  if (!isPublicRoute && hasAuthCookie) {
    try {
      await Promise.race([
        supabase.auth.getUser(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 3000))
      ]);
    } catch (e) {
      console.warn('[Middleware] Auth check timed out or failed, proceeding anyway.');
    }
  }

  // Internationalization: Detect Accept-Language header if no cookie set yet
  if (!request.cookies.has('klozet_language')) {
    const acceptLang = request.headers.get('accept-language');
    if (acceptLang) {
      const preferred = acceptLang.split(',')[0].split(';')[0].trim().toLowerCase().split(/[-_]/)[0];
      const valid = ['es', 'en', 'fr', 'de', 'it', 'pt'];
      const initialLang = valid.includes(preferred) ? preferred : 'es';
      response.cookies.set('klozet_language', initialLang, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|ads\\.txt|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt|xml)$).*)',
  ],
}
