import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') ?? '/closet';

  let hasError = false;
  let errorMessage = '';

  let response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
              response.cookies.set({ name, value, ...options });
            });
          } catch (error) {
            // ignore
          }
        },
      },
    }
  );

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) {
      hasError = true;
      errorMessage = error.message;
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      hasError = true;
      errorMessage = error.message;
    }
  }

  if (hasError) {
    return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin));
  }

  // Check if profile is complete
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('style_completed, username')
      .eq('id', user.id)
      .maybeSingle();

    let isCompleted = profile?.style_completed;

    // Check legacy users table if not found in profiles
    if (!profile) {
      const { data: legacyProfile } = await supabase
        .from('users')
        .select('style_completed')
        .eq('id', user.id)
        .maybeSingle();
        
      if (legacyProfile) {
        isCompleted = legacyProfile.style_completed;
      }
    }

    if (!isCompleted) {
      const newResponse = NextResponse.redirect(new URL('/onboarding/preferences', requestUrl.origin));
      // Copy cookies from the base response to ensure they aren't lost
      response.cookies.getAll().forEach((cookie) => {
        newResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return newResponse;
    }
  }

  return response;
}
