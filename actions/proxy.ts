'use server'

import {eq, like} from 'drizzle-orm'

import { createDb } from '@/lib/db'
import { proxys, routers } from '@/lib/db/schema'

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

function generateSlug(url: string): string {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace(/^www\./, '')
    return domain
        .replace(/\//g, '-')
        .replace(/[^a-z0-9-]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
  } catch {
    return url
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\//g, '-')
        .replace(/[^a-z0-9-]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
  }
}

// 生成路由器的 Markdown 内容
function generateRouterContent(router: any): string {
  return `
# ${router.name}

## 基本信息

- **名称**: ${router.name}
- **URL**: ${router.url}
- **状态**: ${router.status === 'online' ? '在线' : router.status === 'offline' ? '离线' : '未知'}
- **响应时间**: ${router.responseTime}ms
${router.inviteLink ? `- **邀请链接**: ${router.inviteLink}` : ''}
${router.isVerified ? '- **认证状态**: 已认证' : ''}

## 说明

这是一个自动生成的 AI 代理中转站页面。

---

*最后检查时间: ${new Date(router.lastCheck).toLocaleString('zh-CN')}*
  `.trim()
}

// 增加proxy
export async function addProxy(url: string) {
  const database = createDb()

  // 如果没找到，尝试从 routers 表查找（使用 inviteLink 匹配）
  let routerRows = await database
      .select()
      .from(routers)
      .where(like(routers.inviteLink, url))
      .limit(1)

  if (routerRows.length === 0) {
    return null
  }

  const router = routerRows[0]
  const slug = generateSlug(url)

  // 检查是否已存在相同 slug 的 proxy
  const existingProxy = await database
    .select()
    .from(proxys)
    .where(eq(proxys.slug, slug))
    .limit(1)

  if (existingProxy.length > 0) {
    // 如果已存在，返回现有记录
    return existingProxy[0] as ProxyDetail
  }

  // 插入到 proxys 表
  const newProxy = await database
    .insert(proxys)
    .values({
      name: router.name,
      url: router.url,
      slug: slug,
      seoTitle: `${router.name} - AI Router`,
      seoDescription: `访问 ${router.name}，URL: ${router.url}`,
      content: generateRouterContent(router),
      models: null,
      inviteLink: router.inviteLink,
      status: 'active',
      sortOrder: 0,
      createdBy: router.createdBy,
      updatedBy: router.updatedBy
    })
    .returning()

  return newProxy[0] as ProxyDetail
}