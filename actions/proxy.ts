'use server'

import { eq } from 'drizzle-orm'

import { createDb } from '@/lib/db'
import { proxys } from '@/lib/db/schema'

export interface ProxyDetail {
  id: string
  name: string
  url: string
  slug: string
  seoTitle: string
  seoDescription: string
  content: string | null
  models: string | null
  inviteLink: string | null
  status: 'active' | 'inactive'
  sortOrder: number
  views: number
  likes: number
  createdBy: string | null
  updatedBy: string | null
  createdAt: number
  updatedAt: number
}

// 根据 slug 获取单个 proxy 详情
export async function getProxyBySlug(slug: string): Promise<ProxyDetail | null> {
  const database = createDb()

  const rows = await database
    .select()
    .from(proxys)
    .where(eq(proxys.slug, slug))
    .limit(1)

  if (rows.length === 0) {
    return null
  }

  return rows[0] as ProxyDetail
}

// 增加浏览次数
export async function incrementProxyViews(slug: string) {
  const database = createDb()

  const proxy = await getProxyBySlug(slug)
  if (!proxy) {
    return
  }

  await database
    .update(proxys)
    .set({ views: proxy.views + 1 })
    .where(eq(proxys.slug, slug))
}
