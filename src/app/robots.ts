import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/settings',
          '/bookmarks',
          '/notifications',
          '/upload',
          '/search',
        ],
      },
    ],
    sitemap: 'https://postpencil.com/sitemap.xml',
  }
}
