import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL || 'https://klozet.es';

const config: CapacitorConfig = {
  appId: 'es.klozet.app',
  appName: 'Klozet',
  webDir: 'capacitor-www',
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith('http://'),
    errorPath: 'offline.html',
    allowNavigation: [
      'klozet.es',
      '*.klozet.es',
      '*.supabase.co',
      'accounts.google.com',
      'appleid.apple.com',
    ],
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#FFFFFF',
    allowsLinkPreview: false,
    preferredContentMode: 'mobile',
    scheme: 'Klozet',
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT',
      backgroundColor: '#FFFFFF',
    },
  },
};

export default config;
