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
          '/about',
          '/contact',
          '/contacto',
          '/trends',
          '/trends/*',
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
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: '/'
      },
      {
        userAgent: 'Googlebot',
        allow: '/'
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
