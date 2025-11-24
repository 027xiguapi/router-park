'use server'

import { and, count, desc, eq, sql } from 'drizzle-orm'

import { DEFAULT_LOCALE } from '@/i18n/routing'
import { createDb } from '@/lib/db'
import { docs } from '@/lib/db/schema'

// 文档详情类型
export interface DocDetail {
  id: string
  slug: string
  locale: string
  coverImageUrl: string | null
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

// 文档列表项类型
export interface DocListItem {
  id: string
  slug: string
  locale: string
  coverImageUrl: string | null
  title: string
  createdAt: Date
}

// 将数据库行映射到文档详情
function mapToDocDetail(doc: typeof docs.$inferSelect): DocDetail {
  return {
    id: doc.id,
    slug: doc.slug,
    locale: doc.locale,
    coverImageUrl: doc.coverImageUrl,
    title: doc.title,
    content: doc.content,
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt)
  }
}

// 将数据库行映射到文档列表项
function mapToDocListItem(doc: typeof docs.$inferSelect): DocListItem {
  return {
    id: doc.id,
    slug: doc.slug,
    locale: doc.locale,
    coverImageUrl: doc.coverImageUrl,
    title: doc.title,
    createdAt: new Date(doc.createdAt)
  }
}

// 根据 slug 和 locale 获取单个文档
export async function getDocBySlug(slug: string, locale: string = DEFAULT_LOCALE): Promise<DocDetail | null> {
  const database = createDb()

  const rows = await database
    .select()
    .from(docs)
    .where(and(eq(docs.slug, slug), eq(docs.locale, locale)))
    .limit(1)

  if (rows.length === 0) {
    return null
  }

  return mapToDocDetail(rows[0])
}

// 获取所有文档（按语言过滤）
export async function getAllDocs(locale?: string): Promise<DocListItem[]> {
  const database = createDb()
  const resolvedLocale = locale ?? DEFAULT_LOCALE

  const rows = await database
    .select()
    .from(docs)
    .where(eq(docs.locale, resolvedLocale))
    .orderBy(desc(docs.createdAt))

  return rows.map(mapToDocListItem)
}

// 获取分页文档（按语言过滤）
export async function getPaginatedDocs(locale?: string, page: number = 1, pageSize: number = 10) {
  const database = createDb()
  const resolvedLocale = locale ?? DEFAULT_LOCALE
  const offset = (page - 1) * pageSize

  const rows = await database
    .select()
    .from(docs)
    .where(eq(docs.locale, resolvedLocale))
    .orderBy(desc(docs.createdAt))
    .limit(pageSize)
    .offset(offset)

  const countResult = await database
    .select({ count: count() })
    .from(docs)
    .where(eq(docs.locale, resolvedLocale))

  const totalItems = countResult[0]?.count || 0
  const totalPages = Math.ceil(totalItems / pageSize)

  return {
    docs: rows.map(mapToDocListItem),
    pagination: {
      currentPage: page,
      pageSize,
      totalItems,
      totalPages
    }
  }
}

// 保存文档
export async function saveDoc(
  doc: {
    slug: string
    locale?: string
    coverImageUrl?: string
    title: string
    content: string
  }
) {
  const database = createDb()
  const docId = crypto.randomUUID()

  await database.insert(docs).values({
    id: docId,
    slug: doc.slug,
    locale: doc.locale ?? DEFAULT_LOCALE,
    coverImageUrl: doc.coverImageUrl ?? null,
    title: doc.title,
    content: doc.content
  })

  return docId
}

// 更新文档（通过 ID）
export async function updateDocById(
  id: string,
  data: {
    slug?: string
    locale?: string
    coverImageUrl?: string
    title?: string
    content?: string
  }
) {
  const database = createDb()

  const docResult = await database.select().from(docs).where(eq(docs.id, id)).limit(1)

  if (docResult.length === 0) {
    throw new Error('Document not found')
  }

  const updatePayload: Record<string, any> = {}

  if (data.slug !== undefined) updatePayload.slug = data.slug
  if (data.locale !== undefined) updatePayload.locale = data.locale
  if (data.coverImageUrl !== undefined) updatePayload.coverImageUrl = data.coverImageUrl
  if (data.title !== undefined) updatePayload.title = data.title
  if (data.content !== undefined) updatePayload.content = data.content

  if (Object.keys(updatePayload).length === 0) {
    return mapToDocDetail(docResult[0])
  }

  const result = await database
    .update(docs)
    .set(updatePayload)
    .where(eq(docs.id, id))
    .returning()

  return mapToDocDetail(result[0])
}

// 更新文档（通过 slug 和 locale）
export async function updateDoc(
  slug: string,
  locale: string = DEFAULT_LOCALE,
  data: {
    slug?: string
    locale?: string
    coverImageUrl?: string
    title?: string
    content?: string
  }
) {
  const database = createDb()

  const docResult = await database
    .select()
    .from(docs)
    .where(and(eq(docs.slug, slug), eq(docs.locale, locale)))
    .limit(1)

  if (docResult.length === 0) {
    throw new Error('Document not found')
  }

  return updateDocById(docResult[0].id, data)
}

// 删除文档（通过 slug 和 locale）
export async function deleteDoc(slug: string, locale: string = DEFAULT_LOCALE) {
  const database = createDb()
  await database.delete(docs).where(and(eq(docs.slug, slug), eq(docs.locale, locale)))
  return { success: true }
}

// 删除文档（通过 ID）
export async function deleteDocById(id: string) {
  const database = createDb()
  await database.delete(docs).where(eq(docs.id, id))
  return { success: true }
}
