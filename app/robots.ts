import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://klozet.es';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/auth',
          '/login',
          '/feed',
          '/search',
          '/terms',
          '/privacy',
          '/cookies',
          '/post/*',
          '/profile/*',
          '/outfit/*'
        ],
        disallow: [
          '/api/*',
          '/profile/settings/*',
          '/messages/*',
          '/notifications/*'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
