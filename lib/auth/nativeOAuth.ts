import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase/client';

let appListenerRegistered = false;

/**
 * Initializes the native deep link listener for OAuth return from system browser
 */
export async function initNativeOAuthListener(
  onSuccess?: () => void,
  onError?: (err: string) => void
): Promise<void> {
  if (typeof window === 'undefined' || !Capacitor.isNativePlatform() || appListenerRegistered) {
    return;
  }

  try {
    const { App } = await import('@capacitor/app');
    const { Browser } = await import('@capacitor/browser');

    await App.addListener('appUrlOpen', async (event) => {
      const urlString = event.url;
      if (!urlString) return;

      // Check if it's the OAuth callback deep link
      if (urlString.startsWith('es.klozet.app://auth/callback') || urlString.includes('auth/callback')) {
        try {
          await Browser.close();
        } catch {
          // Browser may already be closed
        }

        try {
          // Normalize custom scheme into standard URL for parameter parsing
          const normalized = urlString.startsWith('es.klozet.app://')
            ? urlString.replace('es.klozet.app://', 'https://klozet.es/')
            : urlString;
          const parsed = new URL(normalized);
          const code = parsed.searchParams.get('code');
          const errorMsg = parsed.searchParams.get('error') || parsed.searchParams.get('error_description');

          if (errorMsg) {
            onError?.(errorMsg);
            return;
          }

          if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.error('[NativeOAuth] Exchange error:', error);
              onError?.(error.message);
              return;
            }
            if (data?.session) {
              onSuccess?.();
            }
          }
        } catch (e: any) {
          console.error('[NativeOAuth] URL parsing error:', e);
          onError?.(e?.message || 'Error al procesar autenticación');
        }
      }
    });

    appListenerRegistered = true;
  } catch (err) {
    console.warn('[NativeOAuth] Failed to register appUrlOpen listener:', err);
  }
}

/**
 * Initiates Google OAuth sign in:
 * - On iOS/Android Native: opens system browser (Safari View Controller) to prevent '403 disallowed_useragent'
 * - On Web: uses standard redirect flow
 */
export async function signInWithGoogleNativeOrWeb(): Promise<{ success: boolean; error?: string }> {
  try {
    const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();

    if (isNative) {
      const { Browser } = await import('@capacitor/browser');

      // Use production callback with isNative=1 flag so route.ts deep links back to es.klozet.app
      const redirectTo = 'https://klozet.es/auth/callback?isNative=1';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        await Browser.open({
          url: data.url,
          presentationStyle: 'popover',
        });
        return { success: true };
      } else {
        throw new Error('No se pudo obtener la URL de autenticación');
      }
    } else {
      // Standard web browser flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });

      if (error) throw error;
      return { success: true };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al iniciar sesión con Google' };
  }
}
