import { unstable_noStore } from 'next/cache'

import { getAllArticles } from '@/actions/ai-content'
import { createDb } from '@/lib/db'
import { getAllDocs } from '@/lib/db/docs'
import { getAllModels } from '@/lib/db/models'
import { locales } from '@/i18n/routing'

import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  unstable_noStore()

  const routes = ['', '/blogs', '/ai-tools', '/api-monitor', '/backlinks', '/chatgpt-mirrors', '/keyword-tool', '/vpn', '/pricing', '/config-guide', '/log', '/models', '/free-claude-code', '/free-llm-api']

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

  // 获取所有模型页面
  const allModels = await getAllModels(db)

  // 去重 - 只获取唯一的 slug（因为每个 slug 可能有多个 locale）
  const uniqueModelSlugs = [...new Set(allModels.map(model => model.slug))]

  const modelPages: MetadataRoute.Sitemap = uniqueModelSlugs.map((slug) => {
    return {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/model/${slug}`,
      alternates: {
        languages: Object.fromEntries(
          locales
            .filter((locale) => locale.code !== 'en')
            .map((locale) => [locale.code, `${process.env.NEXT_PUBLIC_BASE_URL}/${locale.code}/model/${slug}`])
        )
      }
    }
  })

  return [...entries, ...publishedArticles, ...docsPages, ...modelPages]
}
