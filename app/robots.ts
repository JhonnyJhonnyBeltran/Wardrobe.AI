import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://klozet.es';

  const publicAllowed = [
    '/',
    '/about',
    '/contact',
    '/contacto',
    '/trends',
    '/trends/*',
    '/terms',
    '/privacy',
    '/cookies',
    '/ads.txt',
    '/llms.txt',
    '/llms-full.txt'
  ];

  // Bloquear pantallas de login, onboarding, herramientas privadas y rutas sin contenido editorial
  // para evitar que Mediapartners-Google (AdSense) audite formularios de acceso o pantallas de app
  const privateDisallowed = [
    '/api/*',
    '/auth',
    '/auth/*',
    '/login',
    '/onboarding',
    '/onboarding/*',
    '/closet',
    '/closet/*',
    '/create',
    '/create/*',
    '/create-post',
    '/process-image',
    '/premium',
    '/chat',
    '/closy',
    '/profile',
    '/profile/*',
    '/messages',
    '/messages/*',
    '/notifications',
    '/notifications/*',
    '/admin/*'
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: publicAllowed,
        disallow: privateDisallowed
      },
      // Google Search, Google AdSense (Mediapartners-Google) & Gemini
      {
        userAgent: ['Googlebot', 'Google-Extended', 'Mediapartners-Google'],
        allow: publicAllowed,
        disallow: privateDisallowed
      },
      // OpenAI ChatGPT, SearchGPT & Browsing Agents
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot'],
        allow: publicAllowed,
        disallow: privateDisallowed
      },
      // Anthropic Claude & Claude Search
      {
        userAgent: ['ClaudeBot', 'Claude-Web', 'anthropic-ai'],
        allow: publicAllowed,
        disallow: privateDisallowed
      },
      // Perplexity AI Answer Engine
      {
        userAgent: ['PerplexityBot'],
        allow: publicAllowed,
        disallow: privateDisallowed
      },
      // Apple Intelligence & Siri Search
      {
        userAgent: ['Applebot', 'Applebot-Extended'],
        allow: publicAllowed,
        disallow: privateDisallowed
      },
      // Microsoft Bing & Copilot
      {
        userAgent: ['Bingbot', 'msnbot'],
        allow: publicAllowed,
        disallow: privateDisallowed
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
