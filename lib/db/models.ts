import { eq, sql, like, desc, asc, and } from 'drizzle-orm'

import { models } from './schema'

import type { Db } from './index'

// 模型类型定义
export interface Model {
  id: string
  slug: string
  locale: string
  name: string
  provider: string
  coverImageUrl?: string | null
  title: string
  description?: string | null
  content: string
  status: string
  contextWindow?: number | null
  maxOutputTokens?: number | null
  officialUrl?: string | null
  apiDocUrl?: string | null
  pricing?: string | null
  capabilities?: string | null
  releaseDate?: Date | null
  sortOrder: number
  views: number
  likes: number
  createdBy?: string | null
  updatedBy?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateModelInput {
  slug: string
  locale: string
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

export interface UpdateModelInput {
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

export interface ModelQueryOptions {
  page?: number
  pageSize?: number
  search?: string
  locale?: string
  provider?: string
  status?: string
  sortBy?: 'latest' | 'name' | 'views' | 'likes'
}

export interface PaginatedModels {
  data: Model[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 创建模型
export async function createModel(db: Db, input: CreateModelInput): Promise<Model> {
  const result = await db
    .insert(models)
    .values({
      slug: input.slug,
      locale: input.locale,
      name: input.name,
      provider: input.provider,
      coverImageUrl: input.coverImageUrl,
      title: input.title,
      description: input.description,
      content: input.content,
      status: input.status || 'active',
      contextWindow: input.contextWindow,
      maxOutputTokens: input.maxOutputTokens,
      officialUrl: input.officialUrl,
      apiDocUrl: input.apiDocUrl,
      pricing: input.pricing,
      capabilities: input.capabilities,
      releaseDate: input.releaseDate,
      sortOrder: input.sortOrder || 0,
      createdBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return transformModel(result[0])
}

// 获取所有模型
export async function getAllModels(db: Db): Promise<Model[]> {
  const result = await db
    .select()
    .from(models)
    .orderBy(desc(models.sortOrder), desc(models.createdAt))

  return result.map(transformModel)
}

// 获取模型（支持分页和搜索）
export async function getModelsWithPagination(db: Db, options: ModelQueryOptions = {}): Promise<PaginatedModels> {
  const {
    page = 1,
    pageSize = 30,
    search,
    locale,
    provider,
    status,
    sortBy = 'latest'
  } = options

  const offset = (page - 1) * pageSize

  // 构建基础查询
  let query = db.select().from(models)
  let countQuery = db.select({ count: sql`COUNT(*)` }).from(models)

  // 添加搜索条件
  const conditions = []

  if (search && search.trim()) {
    conditions.push(
      sql`(${like(models.name, `%${search}%`)} OR ${like(models.slug, `%${search}%`)} OR ${like(models.title, `%${search}%`)} OR ${like(models.content, `%${search}%`)})`
    )
  }

  if (locale && locale.trim()) {
    conditions.push(eq(models.locale, locale))
  }

  if (provider && provider.trim()) {
    conditions.push(eq(models.provider, provider))
  }

  if (status && status.trim()) {
    conditions.push(eq(models.status, status))
  }

  if (conditions.length > 0) {
    const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions)
    query = query.where(whereCondition)
    countQuery = countQuery.where(whereCondition)
  }

  // 添加排序
  switch (sortBy) {
    case 'name':
      query = query.orderBy(asc(models.name))
      break
    case 'views':
      query = query.orderBy(desc(models.views), desc(models.createdAt))
      break
    case 'likes':
      query = query.orderBy(desc(models.likes), desc(models.createdAt))
      break
    case 'latest':
    default:
      query = query.orderBy(desc(models.sortOrder), desc(models.createdAt))
      break
  }

  // 添加分页
  query = query.limit(pageSize).offset(offset)

  // 执行查询
  const [result, totalResult] = await Promise.all([
    query,
    countQuery
  ])

  const total = Number(totalResult[0].count)
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: result.map(transformModel),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

// 根据 ID 获取模型
export async function getModelById(db: Db, id: string): Promise<Model | null> {
  const result = await db
    .select()
    .from(models)
    .where(eq(models.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformModel(result[0])
}

// 根据 slug 和 locale 获取模型
export async function getModelBySlugAndLocale(db: Db, slug: string, locale: string): Promise<Model | null> {
  const result = await db
    .select()
    .from(models)
    .where(and(eq(models.slug, slug), eq(models.locale, locale)))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformModel(result[0])
}

// 更新模型
export async function updateModel(
  db: Db,
  id: string,
  input: UpdateModelInput
): Promise<Model | null> {
  const now = new Date()

  const updateData: Record<string, unknown> = {
    updatedAt: now
  }

  if (input.slug !== undefined) updateData.slug = input.slug
  if (input.locale !== undefined) updateData.locale = input.locale
  if (input.name !== undefined) updateData.name = input.name
  if (input.provider !== undefined) updateData.provider = input.provider
  if (input.coverImageUrl !== undefined) updateData.coverImageUrl = input.coverImageUrl
  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description
  if (input.content !== undefined) updateData.content = input.content
  if (input.status !== undefined) updateData.status = input.status
  if (input.contextWindow !== undefined) updateData.contextWindow = input.contextWindow
  if (input.maxOutputTokens !== undefined) updateData.maxOutputTokens = input.maxOutputTokens
  if (input.officialUrl !== undefined) updateData.officialUrl = input.officialUrl
  if (input.apiDocUrl !== undefined) updateData.apiDocUrl = input.apiDocUrl
  if (input.pricing !== undefined) updateData.pricing = input.pricing
  if (input.capabilities !== undefined) updateData.capabilities = input.capabilities
  if (input.releaseDate !== undefined) updateData.releaseDate = input.releaseDate
  if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder
  if (input.updatedBy !== undefined) updateData.updatedBy = input.updatedBy

  const result = await db.update(models).set(updateData).where(eq(models.id, id)).returning()

  if (result.length === 0) {
    return null
  }

  return transformModel(result[0])
}

// 删除模型
export async function deleteModel(db: Db, id: string): Promise<boolean> {
  const result = await db.delete(models).where(eq(models.id, id)).returning()

  return result.length > 0
}

// 辅助函数：转换数据库结果为 Model 类型
function transformModel(data: any): Model {
  return {
    id: data.id,
    slug: data.slug,
    locale: data.locale,
    name: data.name,
    provider: data.provider,
    coverImageUrl: data.coverImageUrl,
    title: data.title,
    description: data.description,
    content: data.content,
    status: data.status,
    contextWindow: data.contextWindow,
    maxOutputTokens: data.maxOutputTokens,
    officialUrl: data.officialUrl,
    apiDocUrl: data.apiDocUrl,
    pricing: data.pricing,
    capabilities: data.capabilities,
    releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
    sortOrder: data.sortOrder,
    views: data.views,
    likes: data.likes,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt)
  }
}
