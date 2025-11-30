import { unstable_noStore } from 'next/cache'

import { getAllArticles } from '@/actions/ai-content'
import { createDb } from '@/lib/db'
import { getAllDocs } from '@/lib/db/docs'
import { locales } from '@/i18n/routing'

import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  unstable_noStore()

  const routes = ['', '/blogs', '/ai-tools', '/api-monitor', '/backlinks', '/chatgpt-mirrors', '/keyword-tool', '/vpn', '/pricing', '/config-guide', '/log', '/free-claude-code', '/free-llm-api']

  const entries: MetadataRoute.Sitemap = []

  for (const route of routes) {
    entries.push({
      url: `${process.env.NEXT_PUBLIC_BASE_URL}${route}`,
      alternates: {
        languages: Object.fromEntries(
          locales
            .filter((locale) => locale.code !== 'en')
            .map((locale) => [locale.code, `${process.env.NEXT_PUBLIC_BASE_URL}/${locale.code}${route}`])
        )
      }
    })
  }

  const allArticles = await getAllArticles()

  const publishedArticles: MetadataRoute.Sitemap = allArticles.map((article) => {
    return {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${article.slug}`,
      alternates: {
        languages: Object.fromEntries(
          locales
            .filter((locale) => locale.code !== 'en')
            .map((locale) => [locale.code, `${process.env.NEXT_PUBLIC_BASE_URL}/${locale.code}/blog/${article.slug}`])
        )
      }
    }
  })

  // 获取所有文档页面
  const db = createDb()
  const allDocs = await getAllDocs(db)

  const docsPages: MetadataRoute.Sitemap = allDocs.map((doc) => {
    return {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/docs/${doc.slug}`,
      alternates: {
        languages: Object.fromEntries(
          locales
            .filter((locale) => locale.code !== 'en')
            .map((locale) => [locale.code, `${process.env.NEXT_PUBLIC_BASE_URL}/${locale.code}/docs/${doc.slug}`])
        )
      }
    }
  })

  return [...entries, ...publishedArticles, ...docsPages]
}
