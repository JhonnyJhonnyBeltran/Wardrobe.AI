import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://klozet.ai';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/feed',
          '/search',
          '/terms',
          '/privacy',
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
