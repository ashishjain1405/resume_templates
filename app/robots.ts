import type { MetadataRoute } from 'next'

const BASE_URL = 'https://www.resume-expert.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/templates', '/template/', '/ats-check', '/pricing'],
      disallow: ['/dashboard', '/builder', '/auth', '/api', '/payment', '/sessions'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
