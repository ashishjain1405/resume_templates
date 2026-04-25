import type { MetadataRoute } from 'next'
import { TEMPLATES } from '@/lib/templates'

const BASE_URL = 'https://www.resume-expert.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const templateUrls = TEMPLATES.map((t) => ({
    url: `${BASE_URL}/template/${t.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/templates`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...templateUrls,
  ]
}
