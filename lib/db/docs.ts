import { eq, sql, like, desc, asc, and } from 'drizzle-orm'

import { docs } from './schema'

import type { Db } from './index'

// 文档类型定义
export interface Doc {
  id: string
  slug: string
  locale: string
  coverImageUrl?: string | null
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateDocInput {
  slug: string
  locale: string
  coverImageUrl?: string
  title: string
  content: string
}

export interface UpdateDocInput {
  slug?: string
  locale?: string
  coverImageUrl?: string
  title?: string
  content?: string
}

export interface DocQueryOptions {
  page?: number
  pageSize?: number
  search?: string
  locale?: string
  sortBy?: 'latest' | 'title'
}

export interface PaginatedDocs {
  data: Doc[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 创建文档
export async function createDoc(db: Db, input: CreateDocInput): Promise<Doc> {
  const result = await db
    .insert(docs)
    .values({
      slug: input.slug,
      locale: input.locale,
      coverImageUrl: input.coverImageUrl,
      title: input.title,
      content: input.content,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return transformDoc(result[0])
}

// 获取所有文档
export async function getAllDocs(db: Db): Promise<Doc[]> {
  const result = await db
    .select()
    .from(docs)
    .orderBy(desc(docs.createdAt))

  return result.map(transformDoc)
}

// 获取文档（支持分页和搜索）
export async function getDocsWithPagination(db: Db, options: DocQueryOptions = {}): Promise<PaginatedDocs> {
  const {
    page = 1,
    pageSize = 30,
    search,
    locale,
    sortBy = 'latest'
  } = options

  const offset = (page - 1) * pageSize

  // 构建基础查询
  let query = db.select().from(docs)
  let countQuery = db.select({ count: sql`COUNT(*)` }).from(docs)

  // 添加搜索条件
  const conditions = []

  if (search && search.trim()) {
    conditions.push(
      sql`(${like(docs.title, `%${search}%`)} OR ${like(docs.slug, `%${search}%`)} OR ${like(docs.content, `%${search}%`)})`
    )
  }

  if (locale && locale.trim()) {
    conditions.push(eq(docs.locale, locale))
  }

  if (conditions.length > 0) {
    const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions)
    query = query.where(whereCondition)
    countQuery = countQuery.where(whereCondition)
  }

  // 添加排序
  switch (sortBy) {
    case 'title':
      query = query.orderBy(asc(docs.title))
      break
    case 'latest':
    default:
      query = query.orderBy(desc(docs.createdAt))
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
    data: result.map(transformDoc),
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

// 根据 ID 获取文档
export async function getDocById(db: Db, id: string): Promise<Doc | null> {
  const result = await db
    .select()
    .from(docs)
    .where(eq(docs.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformDoc(result[0])
}

// 根据 slug 和 locale 获取文档
export async function getDocBySlugAndLocale(db: Db, slug: string, locale: string): Promise<Doc | null> {
  const result = await db
    .select()
    .from(docs)
    .where(and(eq(docs.slug, slug), eq(docs.locale, locale)))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformDoc(result[0])
}

// 更新文档
export async function updateDoc(
  db: Db,
  id: string,
  input: UpdateDocInput
): Promise<Doc | null> {
  const now = new Date()

  const updateData: Record<string, unknown> = {
    updatedAt: now
  }

  if (input.slug !== undefined) updateData.slug = input.slug
  if (input.locale !== undefined) updateData.locale = input.locale
  if (input.coverImageUrl !== undefined) updateData.coverImageUrl = input.coverImageUrl
  if (input.title !== undefined) updateData.title = input.title
  if (input.content !== undefined) updateData.content = input.content

  const result = await db.update(docs).set(updateData).where(eq(docs.id, id)).returning()

  if (result.length === 0) {
    return null
  }

  return transformDoc(result[0])
}

// 删除文档
export async function deleteDoc(db: Db, id: string): Promise<boolean> {
  const result = await db.delete(docs).where(eq(docs.id, id)).returning()

  return result.length > 0
}

// 辅助函数：转换数据库结果为 Doc 类型
function transformDoc(data: any): Doc {
  return {
    id: data.id,
    slug: data.slug,
    locale: data.locale,
    coverImageUrl: data.coverImageUrl,
    title: data.title,
    content: data.content,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt)
  }
}
