import { eq, sql, like, desc, asc } from 'drizzle-orm'

import { proxys, users } from './schema'

import type { Db } from './index'

// Proxy 类型定义
export interface Proxy {
  id: string
  name: string
  url: string
  slug: string
  seoTitle: string
  seoDescription: string
  content?: string | null // Markdown 格式的页面内容
  models?: string | null // JSON 数组字符串
  hasReward: boolean
  inviteLink?: string | null
  status: 'active' | 'inactive'
  sortOrder: number
  views: number
  likes: number
  createdBy?: string | null
  createdByName?: string | null
  createdByImage?: string | null
  updatedBy?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateProxyInput {
  name: string
  url: string
  slug: string
  seoTitle: string
  seoDescription: string
  content?: string // Markdown 格式的页面内容
  models?: string // JSON 数组字符串，例: JSON.stringify(["GPT-4", "Claude"])
  hasReward?: boolean
  inviteLink?: string
  status?: 'active' | 'inactive'
  sortOrder?: number
  createdBy?: string
}

export interface UpdateProxyInput {
  name?: string
  url?: string
  slug?: string
  seoTitle?: string
  seoDescription?: string
  content?: string // Markdown 格式的页面内容
  models?: string
  hasReward?: boolean
  inviteLink?: string
  status?: 'active' | 'inactive'
  sortOrder?: number
  updatedBy?: string
}

export interface ProxyQueryOptions {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: 'latest' | 'likes' | 'views' | 'name'
  status?: 'active' | 'inactive'
  userId?: string
  likedBy?: boolean
}

export interface PaginatedProxys {
  data: Proxy[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 创建 Proxy
export async function createProxy(db: Db, input: CreateProxyInput): Promise<Proxy> {
  const result = await db
    .insert(proxys)
    .values({
      name: input.name,
      url: input.url,
      slug: input.slug,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      content: input.content,
      models: input.models,
      hasReward: input.hasReward ?? false,
      inviteLink: input.inviteLink,
      status: input.status ?? 'active',
      sortOrder: input.sortOrder ?? 0,
      createdBy: input.createdBy,
      updatedBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return transformProxy(result[0])
}

// 获取所有 Proxy
export async function getAllProxys(db: Db): Promise<Proxy[]> {
  const result = await db
    .select({
      id: proxys.id,
      name: proxys.name,
      url: proxys.url,
      slug: proxys.slug,
      seoTitle: proxys.seoTitle,
      seoDescription: proxys.seoDescription,
      content: proxys.content,
      models: proxys.models,
      inviteLink: proxys.inviteLink,
      status: proxys.status,
      sortOrder: proxys.sortOrder,
      views: proxys.views,
      likes: proxys.likes,
      createdBy: proxys.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: proxys.updatedBy,
      createdAt: proxys.createdAt,
      updatedAt: proxys.updatedAt
    })
    .from(proxys)
    .leftJoin(users, eq(proxys.createdBy, users.id))
    .orderBy(desc(proxys.sortOrder), desc(proxys.createdAt))

  return result.map(transformProxy)
}

// 获取所有活跃的 Proxy
export async function getActiveProxys(db: Db): Promise<Proxy[]> {
  const result = await db
    .select({
      id: proxys.id,
      name: proxys.name,
      url: proxys.url,
      slug: proxys.slug,
      seoTitle: proxys.seoTitle,
      seoDescription: proxys.seoDescription,
      content: proxys.content,
      models: proxys.models,
      inviteLink: proxys.inviteLink,
      status: proxys.status,
      sortOrder: proxys.sortOrder,
      views: proxys.views,
      likes: proxys.likes,
      createdBy: proxys.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: proxys.updatedBy,
      createdAt: proxys.createdAt,
      updatedAt: proxys.updatedAt
    })
    .from(proxys)
    .leftJoin(users, eq(proxys.createdBy, users.id))
    .where(eq(proxys.status, 'active'))
    .orderBy(desc(proxys.sortOrder), desc(proxys.createdAt))

  return result.map(transformProxy)
}

// 获取 Proxy（支持分页和搜索）
export async function getProxysWithPagination(db: Db, options: ProxyQueryOptions = {}): Promise<PaginatedProxys> {
  const {
    page = 1,
    pageSize = 12,
    search,
    sortBy = 'latest',
    status,
    userId,
    likedBy = false
  } = options

  const offset = (page - 1) * pageSize

  // 构建基础查询
  let query = db
    .select({
      id: proxys.id,
      name: proxys.name,
      url: proxys.url,
      slug: proxys.slug,
      seoTitle: proxys.seoTitle,
      seoDescription: proxys.seoDescription,
      content: proxys.content,
      models: proxys.models,
      inviteLink: proxys.inviteLink,
      status: proxys.status,
      sortOrder: proxys.sortOrder,
      views: proxys.views,
      likes: proxys.likes,
      createdBy: proxys.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: proxys.updatedBy,
      createdAt: proxys.createdAt,
      updatedAt: proxys.updatedAt
    })
    .from(proxys)
    .leftJoin(users, eq(proxys.createdBy, users.id))

  let countQuery = db.select({ count: sql`COUNT(*)` }).from(proxys)

  // 如果查询用户点赞的 proxy
  if (likedBy && userId) {
    query = db
      .select({
        id: proxys.id,
        name: proxys.name,
        url: proxys.url,
        slug: proxys.slug,
        seoTitle: proxys.seoTitle,
        seoDescription: proxys.seoDescription,
        content: proxys.content,
        models: proxys.models,
        inviteLink: proxys.inviteLink,
        status: proxys.status,
        sortOrder: proxys.sortOrder,
        views: proxys.views,
        likes: proxys.likes,
        createdBy: proxys.createdBy,
        createdByName: users.name,
        createdByImage: users.image,
        updatedBy: proxys.updatedBy,
        createdAt: proxys.createdAt,
        updatedAt: proxys.updatedAt
      })
      .from(proxys)
      .leftJoin(users, eq(proxys.createdBy, users.id))

    countQuery = db
      .select({ count: sql`COUNT(*)` })
      .from(proxys)
  }

  // 添加搜索条件
  if (search && search.trim()) {
    const searchCondition = sql`${like(proxys.name, `%${search}%`)} OR ${like(proxys.seoDescription, `%${search}%`)} OR ${like(proxys.models, `%${search}%`)}`
    if (likedBy && userId) {
      query = query.where(`${searchCondition}`)
      countQuery = countQuery.where(sql` AND (${searchCondition})`)
    } else {
      query = query.where(searchCondition)
      countQuery = countQuery.where(searchCondition)
    }
  }

  // 添加状态过滤
  // if (status) {
  //   if (likedBy && userId) {
  //     query = query.where(sql` AND ${eq(proxys.status, status)}`)
  //     countQuery = countQuery.where(sql` AND ${eq(proxys.status, status)}`)
  //   } else {
  //     query = query.where(eq(proxys.status, status))
  //     countQuery = countQuery.where(eq(proxys.status, status))
  //   }
  // }

  // 添加排序
  switch (sortBy) {
    case 'likes':
      query = query.orderBy(desc(proxys.likes), desc(proxys.createdAt))
      break
    case 'views':
      query = query.orderBy(desc(proxys.views), desc(proxys.createdAt))
      break
    case 'name':
      query = query.orderBy(asc(proxys.name))
      break
    case 'latest':
    default:
      if (likedBy && userId) {
      } else {
        query = query.orderBy(desc(proxys.sortOrder), desc(proxys.createdAt))
      }
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
    data: result.map(transformProxy),
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

// 根据 ID 获取 Proxy
export async function getProxyById(db: Db, id: string): Promise<Proxy | null> {
  const result = await db
    .select({
      id: proxys.id,
      name: proxys.name,
      url: proxys.url,
      slug: proxys.slug,
      seoTitle: proxys.seoTitle,
      seoDescription: proxys.seoDescription,
      content: proxys.content,
      models: proxys.models,
      inviteLink: proxys.inviteLink,
      status: proxys.status,
      sortOrder: proxys.sortOrder,
      views: proxys.views,
      likes: proxys.likes,
      createdBy: proxys.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: proxys.updatedBy,
      createdAt: proxys.createdAt,
      updatedAt: proxys.updatedAt
    })
    .from(proxys)
    .leftJoin(users, eq(proxys.createdBy, users.id))
    .where(eq(proxys.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformProxy(result[0])
}

// 根据 slug 获取 Proxy
export async function getProxyBySlug(db: Db, slug: string): Promise<Proxy | null> {
  const result = await db
    .select({
      id: proxys.id,
      name: proxys.name,
      url: proxys.url,
      slug: proxys.slug,
      seoTitle: proxys.seoTitle,
      seoDescription: proxys.seoDescription,
      content: proxys.content,
      models: proxys.models,
      inviteLink: proxys.inviteLink,
      status: proxys.status,
      sortOrder: proxys.sortOrder,
      views: proxys.views,
      likes: proxys.likes,
      createdBy: proxys.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: proxys.updatedBy,
      createdAt: proxys.createdAt,
      updatedAt: proxys.updatedAt
    })
    .from(proxys)
    .leftJoin(users, eq(proxys.createdBy, users.id))
    .where(eq(proxys.slug, slug))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformProxy(result[0])
}

// 更新 Proxy
export async function updateProxy(
  db: Db,
  id: string,
  input: UpdateProxyInput
): Promise<Proxy | null> {
  const now = new Date()

  const updateData: Record<string, unknown> = {
    updatedAt: now
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.url !== undefined) updateData.url = input.url
  if (input.slug !== undefined) updateData.slug = input.slug
  if (input.seoTitle !== undefined) updateData.seoTitle = input.seoTitle
  if (input.seoDescription !== undefined) updateData.seoDescription = input.seoDescription
  if (input.content !== undefined) updateData.content = input.content
  if (input.models !== undefined) updateData.models = input.models
  if (input.hasReward !== undefined) updateData.hasReward = input.hasReward
  if (input.inviteLink !== undefined) updateData.inviteLink = input.inviteLink
  if (input.status !== undefined) updateData.status = input.status
  if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder
  if (input.updatedBy !== undefined) updateData.updatedBy = input.updatedBy

  const result = await db.update(proxys).set(updateData).where(eq(proxys.id, id)).returning()

  if (result.length === 0) {
    return null
  }

  return transformProxy(result[0])
}

// 删除 Proxy
export async function deleteProxy(db: Db, id: string): Promise<boolean> {
  const result = await db.delete(proxys).where(eq(proxys.id, id)).returning()

  return result.length > 0
}

// 增加浏览次数
export async function incrementProxyViews(db: Db, id: string): Promise<Proxy | null> {
  const result = await db
    .update(proxys)
    .set({
      views: sql`${proxys.views} + 1`,
      updatedAt: new Date()
    })
    .where(eq(proxys.id, id))
    .returning()

  if (result.length === 0) {
    return null
  }

  return transformProxy(result[0])
}

// 点赞 Proxy
export async function likeProxy(db: Db, proxyId: string, userId: string): Promise<Proxy | null> {
  try {
    // 检查是否已经点赞
    const existingLike = await db
      .select()
      .limit(1)

    if (existingLike.length > 0) {
      // 已经点赞，返回当前 proxy 信息
      return await getProxyById(db, proxyId)
    }


    // 增加点赞数
    const result = await db
      .update(proxys)
      .set({
        likes: sql`${proxys.likes} + 1`,
        updatedAt: new Date()
      })
      .where(eq(proxys.id, proxyId))
      .returning()

    if (result.length === 0) {
      return null
    }

    return transformProxy(result[0])
  } catch (error) {
    console.error('Error liking proxy:', error)
    return null
  }
}

// 取消点赞 Proxy
export async function unlikeProxy(db: Db, proxyId: string, userId: string): Promise<Proxy | null> {
  try {
    // 删除点赞记录
    const deleted = await db
      .returning()

    if (deleted.length === 0) {
      // 没有点赞记录
      return await getProxyById(db, proxyId)
    }

    // 减少点赞数（确保不会小于0）
    const result = await db
      .update(proxys)
      .set({
        likes: sql`MAX(0, ${proxys.likes} - 1)`,
        updatedAt: new Date()
      })
      .where(eq(proxys.id, proxyId))
      .returning()

    if (result.length === 0) {
      return null
    }

    return transformProxy(result[0])
  } catch (error) {
    console.error('Error unliking proxy:', error)
    return null
  }
}

// 检查用户是否点赞了 Proxy
export async function hasUserLikedProxy(db: Db, proxyId: string, userId: string): Promise<boolean> {
  const result = await db
    .select()
    .limit(1)

  return result.length > 0
}

// 获取用户点赞的 Proxy
export async function getUserLikedProxys(db: Db, userId: string): Promise<Proxy[]> {
  const result = await db
    .select({
      id: proxys.id,
      name: proxys.name,
      url: proxys.url,
      slug: proxys.slug,
      seoTitle: proxys.seoTitle,
      seoDescription: proxys.seoDescription,
      content: proxys.content,
      models: proxys.models,
      inviteLink: proxys.inviteLink,
      status: proxys.status,
      sortOrder: proxys.sortOrder,
      views: proxys.views,
      likes: proxys.likes,
      createdBy: proxys.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: proxys.updatedBy,
      createdAt: proxys.createdAt,
      updatedAt: proxys.updatedAt
    })
    .from(proxys)
    .leftJoin(users, eq(proxys.createdBy, users.id))

  return result.map(transformProxy)
}

// 辅助函数：转换数据库结果为 Proxy 类型
function transformProxy(data: any): Proxy {
  return {
    id: data.id,
    name: data.name,
    url: data.url,
    slug: data.slug,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    content: data.content || null,
    models: data.models || null,
    hasReward: data.hasReward || false,
    inviteLink: data.inviteLink || null,
    status: data.status,
    sortOrder: data.sortOrder,
    views: data.views,
    likes: data.likes,
    createdBy: data.createdBy || null,
    createdByName: data.createdByName || null,
    createdByImage: data.createdByImage || null,
    updatedBy: data.updatedBy || null,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt)
  }
}
