'use server'

import { and, count, desc, eq, sql } from 'drizzle-orm'

import { DEFAULT_LOCALE } from '@/i18n/routing'
import { createDb } from '@/lib/db'
import { models } from '@/lib/db/schema'

// 模型详情类型
export interface ModelDetail {
  id: string
  slug: string
  locale: string
  name: string
  provider: string
  coverImageUrl: string | null
  title: string
  description: string | null
  content: string
  status: string
  contextWindow: number | null
  maxOutputTokens: number | null
  officialUrl: string | null
  apiDocUrl: string | null
  pricing: string | null
  capabilities: string | null
  releaseDate: Date | null
  sortOrder: number
  views: number
  likes: number
  createdBy: string | null
  updatedBy: string | null
  createdAt: Date
  updatedAt: Date
}

// 模型列表项类型
export interface ModelListItem {
  id: string
  slug: string
  locale: string
  name: string
  provider: string
  coverImageUrl: string | null
  title: string
  description: string | null
  status: string
  views: number
  likes: number
  createdAt: Date
}

// 将数据库行映射到模型详情
function mapToModelDetail(model: typeof models.$inferSelect): ModelDetail {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    name: model.name,
    provider: model.provider,
    coverImageUrl: model.coverImageUrl,
    title: model.title,
    description: model.description,
    content: model.content,
    status: model.status,
    contextWindow: model.contextWindow,
    maxOutputTokens: model.maxOutputTokens,
    officialUrl: model.officialUrl,
    apiDocUrl: model.apiDocUrl,
    pricing: model.pricing,
    capabilities: model.capabilities,
    releaseDate: model.releaseDate ? new Date(model.releaseDate) : null,
    sortOrder: model.sortOrder,
    views: model.views,
    likes: model.likes,
    createdBy: model.createdBy,
    updatedBy: model.updatedBy,
    createdAt: new Date(model.createdAt),
    updatedAt: new Date(model.updatedAt)
  }
}

// 将数据库行映射到模型列表项
function mapToModelListItem(model: typeof models.$inferSelect): ModelListItem {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    name: model.name,
    provider: model.provider,
    coverImageUrl: model.coverImageUrl,
    title: model.title,
    description: model.description,
    status: model.status,
    views: model.views,
    likes: model.likes,
    createdAt: new Date(model.createdAt)
  }
}

// 根据 slug 和 locale 获取单个模型
export async function getModelBySlug(slug: string, locale: string = DEFAULT_LOCALE): Promise<ModelDetail | null> {
  const database = createDb()

  const rows = await database
    .select()
    .from(models)
    .where(and(eq(models.slug, slug), eq(models.locale, locale)))
    .limit(1)

  if (rows.length === 0) {
    return null
  }

  return mapToModelDetail(rows[0])
}

// 获取所有模型（按语言过滤）
export async function getAllModels(locale?: string): Promise<ModelListItem[]> {
  const database = createDb()
  const resolvedLocale = locale ?? DEFAULT_LOCALE

  const rows = await database
    .select()
    .from(models)
    .where(eq(models.locale, resolvedLocale))
    .orderBy(desc(models.sortOrder), desc(models.createdAt))

  return rows.map(mapToModelListItem)
}

// 获取分页模型（按语言过滤）
export async function getPaginatedModels(locale?: string, page: number = 1, pageSize: number = 10) {
  const database = createDb()
  const resolvedLocale = locale ?? DEFAULT_LOCALE
  const offset = (page - 1) * pageSize

  const rows = await database
    .select()
    .from(models)
    .where(eq(models.locale, resolvedLocale))
    .orderBy(desc(models.sortOrder), desc(models.createdAt))
    .limit(pageSize)
    .offset(offset)

  const countResult = await database
    .select({ count: count() })
    .from(models)
    .where(eq(models.locale, resolvedLocale))

  const totalItems = countResult[0]?.count || 0
  const totalPages = Math.ceil(totalItems / pageSize)

  return {
    models: rows.map(mapToModelListItem),
    pagination: {
      currentPage: page,
      pageSize,
      totalItems,
      totalPages
    }
  }
}

// 保存模型
export async function saveModel(
  model: {
    slug: string
    locale?: string
    name: string
    provider: string
    coverImageUrl?: string
    title: string
    description?: string
    content: string
    status?: string
    contextWindow?: number
    maxOutputTokens?: number
    officialUrl?: string
    apiDocUrl?: string
    pricing?: string
    capabilities?: string
    releaseDate?: Date
    sortOrder?: number
    createdBy?: string
  }
) {
  const database = createDb()
  const modelId = crypto.randomUUID()

  await database.insert(models).values({
    id: modelId,
    slug: model.slug,
    locale: model.locale ?? DEFAULT_LOCALE,
    name: model.name,
    provider: model.provider,
    coverImageUrl: model.coverImageUrl ?? null,
    title: model.title,
    description: model.description ?? null,
    content: model.content,
    status: model.status ?? 'active',
    contextWindow: model.contextWindow ?? null,
    maxOutputTokens: model.maxOutputTokens ?? null,
    officialUrl: model.officialUrl ?? null,
    apiDocUrl: model.apiDocUrl ?? null,
    pricing: model.pricing ?? null,
    capabilities: model.capabilities ?? null,
    releaseDate: model.releaseDate ?? null,
    sortOrder: model.sortOrder ?? 0,
    createdBy: model.createdBy ?? null
  })

  return modelId
}

// 更新模型（通过 ID）
export async function updateModelById(
  id: string,
  data: {
    slug?: string
    locale?: string
    name?: string
    provider?: string
    coverImageUrl?: string
    title?: string
    description?: string
    content?: string
    status?: string
    contextWindow?: number
    maxOutputTokens?: number
    officialUrl?: string
    apiDocUrl?: string
    pricing?: string
    capabilities?: string
    releaseDate?: Date
    sortOrder?: number
    updatedBy?: string
  }
) {
  const database = createDb()

  const modelResult = await database.select().from(models).where(eq(models.id, id)).limit(1)

  if (modelResult.length === 0) {
    throw new Error('Model not found')
  }

  const updatePayload: Record<string, any> = {}

  if (data.slug !== undefined) updatePayload.slug = data.slug
  if (data.locale !== undefined) updatePayload.locale = data.locale
  if (data.name !== undefined) updatePayload.name = data.name
  if (data.provider !== undefined) updatePayload.provider = data.provider
  if (data.coverImageUrl !== undefined) updatePayload.coverImageUrl = data.coverImageUrl
  if (data.title !== undefined) updatePayload.title = data.title
  if (data.description !== undefined) updatePayload.description = data.description
  if (data.content !== undefined) updatePayload.content = data.content
  if (data.status !== undefined) updatePayload.status = data.status
  if (data.contextWindow !== undefined) updatePayload.contextWindow = data.contextWindow
  if (data.maxOutputTokens !== undefined) updatePayload.maxOutputTokens = data.maxOutputTokens
  if (data.officialUrl !== undefined) updatePayload.officialUrl = data.officialUrl
  if (data.apiDocUrl !== undefined) updatePayload.apiDocUrl = data.apiDocUrl
  if (data.pricing !== undefined) updatePayload.pricing = data.pricing
  if (data.capabilities !== undefined) updatePayload.capabilities = data.capabilities
  if (data.releaseDate !== undefined) updatePayload.releaseDate = data.releaseDate
  if (data.sortOrder !== undefined) updatePayload.sortOrder = data.sortOrder
  if (data.updatedBy !== undefined) updatePayload.updatedBy = data.updatedBy

  if (Object.keys(updatePayload).length === 0) {
    return mapToModelDetail(modelResult[0])
  }

  const result = await database
    .update(models)
    .set(updatePayload)
    .where(eq(models.id, id))
    .returning()

  return mapToModelDetail(result[0])
}

// 更新模型（通过 slug 和 locale）
export async function updateModel(
  slug: string,
  locale: string = DEFAULT_LOCALE,
  data: {
    slug?: string
    locale?: string
    name?: string
    provider?: string
    coverImageUrl?: string
    title?: string
    description?: string
    content?: string
    status?: string
    contextWindow?: number
    maxOutputTokens?: number
    officialUrl?: string
    apiDocUrl?: string
    pricing?: string
    capabilities?: string
    releaseDate?: Date
    sortOrder?: number
    updatedBy?: string
  }
) {
  const database = createDb()

  const modelResult = await database
    .select()
    .from(models)
    .where(and(eq(models.slug, slug), eq(models.locale, locale)))
    .limit(1)

  if (modelResult.length === 0) {
    throw new Error('Model not found')
  }

  return updateModelById(modelResult[0].id, data)
}

// 删除模型（通过 slug 和 locale）
export async function deleteModel(slug: string, locale: string = DEFAULT_LOCALE) {
  const database = createDb()
  await database.delete(models).where(and(eq(models.slug, slug), eq(models.locale, locale)))
  return { success: true }
}

// 删除模型（通过 ID）
export async function deleteModelById(id: string) {
  const database = createDb()
  await database.delete(models).where(eq(models.id, id))
  return { success: true }
}

// 增加模型浏览次数
export async function incrementModelViews(slug: string, locale: string = DEFAULT_LOCALE) {
  const database = createDb()

  const modelResult = await database
    .select()
    .from(models)
    .where(and(eq(models.slug, slug), eq(models.locale, locale)))
    .limit(1)

  if (modelResult.length === 0) {
    return null
  }

  await database
    .update(models)
    .set({ views: sql`${models.views} + 1` })
    .where(eq(models.id, modelResult[0].id))

  return { success: true }
}
