import { eq, sql, like, desc, asc } from 'drizzle-orm'

import { routers, routerLikes, users } from './schema'

import type { Db } from './index'
import type { RouterStatus } from './schema'

// 路由器类型定义
export interface Router {
  id: string
  name: string
  url: string
  status: RouterStatus
  responseTime: number
  lastCheck: Date
  inviteLink?: string | null
  isVerified: boolean
  likes: number
  createdBy?: string | null
  createdByName?: string | null
  createdByImage?: string | null
  updatedBy?: string | null
  createdAt: Date
  updatedAt: Date
  isLikedByCurrentUser?: boolean
}

export interface CreateRouterInput {
  name: string
  url: string
  inviteLink?: string
  isVerified?: boolean
  createdBy?: string
}

export interface UpdateRouterInput {
  name?: string
  url?: string
  status?: RouterStatus
  responseTime?: number
  inviteLink?: string
  isVerified?: boolean
  updatedBy?: string
}

export interface RouterQueryOptions {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: 'latest' | 'likes' | 'name'
  userId?: string
  likedBy?: boolean
  currentUserId?: string // 当前登录用户的 ID，用于判断是否已点赞
}

export interface PaginatedRouters {
  data: Router[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 创建路由器
export async function createRouter(db: Db, input: CreateRouterInput): Promise<Router> {
  const result = await db
    .insert(routers)
    .values({
      name: input.name,
      url: input.url,
      inviteLink: input.inviteLink,
      isVerified: input.isVerified ?? false,
      createdBy: input.createdBy,
      updatedBy: input.createdBy,
      status: 'online',
      responseTime: 0,
      lastCheck: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return transformRouter(result[0])
}

// 获取所有路由器
export async function getAllRouters(db: Db, currentUserId?: string): Promise<Router[]> {
  const result = await db
    .select({
      id: routers.id,
      name: routers.name,
      url: routers.url,
      status: routers.status,
      responseTime: routers.responseTime,
      lastCheck: routers.lastCheck,
      inviteLink: routers.inviteLink,
      isVerified: routers.isVerified,
      likes: routers.likes,
      createdBy: routers.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: routers.updatedBy,
      createdAt: routers.createdAt,
      updatedAt: routers.updatedAt
    })
    .from(routers)
    .leftJoin(users, eq(routers.createdBy, users.id))
    .orderBy(sql`${routers.createdAt} DESC`)

  // 如果有当前用户 ID，批量查询点赞状态
  if (currentUserId && result.length > 0) {
    const routerIds = result.map(r => r.id)
    const likedRouters = await db
      .select({ routerId: routerLikes.routerId })
      .from(routerLikes)
      .where(sql`${routerLikes.userId} = ${currentUserId} AND ${routerLikes.routerId} IN (${sql.join(routerIds.map(id => sql`${id}`), sql`, `)})`)

    const likedRouterIds = new Set(likedRouters.map(r => r.routerId))

    return result.map(r => transformRouter(r, likedRouterIds.has(r.id)))
  }

  return result.map(r => transformRouter(r))
}

// 获取路由器（支持分页和搜索）
export async function getRoutersWithPagination(db: Db, options: RouterQueryOptions = {}): Promise<PaginatedRouters> {
  const {
    page = 1,
    pageSize = 10,
    search,
    sortBy = 'latest',
    userId,
    likedBy = false,
    currentUserId
  } = options

  const offset = (page - 1) * pageSize

  // 构建基础查询 - 添加用户信息
  let query = db
    .select({
      id: routers.id,
      name: routers.name,
      url: routers.url,
      status: routers.status,
      responseTime: routers.responseTime,
      lastCheck: routers.lastCheck,
      inviteLink: routers.inviteLink,
      isVerified: routers.isVerified,
      likes: routers.likes,
      createdBy: routers.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: routers.updatedBy,
      createdAt: routers.createdAt,
      updatedAt: routers.updatedAt
    })
    .from(routers)
    .leftJoin(users, eq(routers.createdBy, users.id))

  let countQuery = db.select({ count: sql`COUNT(*)` }).from(routers)

  // 如果查询用户点赞的路由器
  if (likedBy && userId) {
    query = db
      .select({
        id: routers.id,
        name: routers.name,
        url: routers.url,
        status: routers.status,
        responseTime: routers.responseTime,
        lastCheck: routers.lastCheck,
        inviteLink: routers.inviteLink,
        isVerified: routers.isVerified,
        likes: routers.likes,
        createdBy: routers.createdBy,
        createdByName: users.name,
        createdByImage: users.image,
        updatedBy: routers.updatedBy,
        createdAt: routers.createdAt,
        updatedAt: routers.updatedAt
      })
      .from(routers)
      .leftJoin(users, eq(routers.createdBy, users.id))
      .innerJoin(routerLikes, eq(routers.id, routerLikes.routerId))
      .where(eq(routerLikes.userId, userId))

    countQuery = db
      .select({ count: sql`COUNT(*)` })
      .from(routers)
      .innerJoin(routerLikes, eq(routers.id, routerLikes.routerId))
      .where(eq(routerLikes.userId, userId))
  }

  // 添加搜索条件
  if (search && search.trim()) {
    const searchCondition = sql`${like(routers.name, `%${search}%`)} OR ${like(routers.url, `%${search}%`)}`
    if (likedBy && userId) {
      query = query.where(sql`${eq(routerLikes.userId, userId)} AND (${searchCondition})`)
      countQuery = countQuery.where(sql`${eq(routerLikes.userId, userId)} AND (${searchCondition})`)
    } else {
      query = query.where(searchCondition)
      countQuery = countQuery.where(searchCondition)
    }
  }

  // 添加排序
  switch (sortBy) {
    case 'likes':
      query = query.orderBy(desc(routers.likes), desc(routers.createdAt))
      break
    case 'name':
      query = query.orderBy(asc(routers.name))
      break
    case 'latest':
    default:
      if (likedBy && userId) {
        query = query.orderBy(desc(routerLikes.createdAt))
      } else {
        query = query.orderBy(desc(routers.createdAt))
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

  // 如果有当前用户 ID，批量查询点赞状态
  let routersWithLikeStatus = result
  if (currentUserId && result.length > 0) {
    const routerIds = result.map(r => r.id)
    const likedRouters = await db
      .select({ routerId: routerLikes.routerId })
      .from(routerLikes)
      .where(sql`${routerLikes.userId} = ${currentUserId} AND ${routerLikes.routerId} IN (${sql.join(routerIds.map(id => sql`${id}`), sql`, `)})`)

    const likedRouterIds = new Set(likedRouters.map(r => r.routerId))

    routersWithLikeStatus = result.map(r => ({
      ...r,
      isLikedByCurrentUser: likedRouterIds.has(r.id)
    }))
  }

  return {
    data: routersWithLikeStatus.map(r => transformRouter(r, r.isLikedByCurrentUser)),
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

// 获取所有路由器（按点赞数排序）
export async function getRoutersByLikes(db: Db, currentUserId?: string): Promise<Router[]> {
  const result = await db
    .select({
      id: routers.id,
      name: routers.name,
      url: routers.url,
      status: routers.status,
      responseTime: routers.responseTime,
      lastCheck: routers.lastCheck,
      inviteLink: routers.inviteLink,
      isVerified: routers.isVerified,
      likes: routers.likes,
      createdBy: routers.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: routers.updatedBy,
      createdAt: routers.createdAt,
      updatedAt: routers.updatedAt
    })
    .from(routers)
    .leftJoin(users, eq(routers.createdBy, users.id))
    .orderBy(sql`${routers.likes} DESC, ${routers.createdAt} DESC`)

  // 如果有当前用户 ID，批量查询点赞状态
  if (currentUserId && result.length > 0) {
    const routerIds = result.map(r => r.id)
    const likedRouters = await db
      .select({ routerId: routerLikes.routerId })
      .from(routerLikes)
      .where(sql`${routerLikes.userId} = ${currentUserId} AND ${routerLikes.routerId} IN (${sql.join(routerIds.map(id => sql`${id}`), sql`, `)})`)

    const likedRouterIds = new Set(likedRouters.map(r => r.routerId))

    return result.map(r => transformRouter(r, likedRouterIds.has(r.id)))
  }

  return result.map(r => transformRouter(r))
}

// 获取用户点赞的路由器
export async function getUserLikedRouters(db: Db, userId: string, currentUserId?: string): Promise<Router[]> {
  const result = await db
    .select({
      id: routers.id,
      name: routers.name,
      url: routers.url,
      status: routers.status,
      responseTime: routers.responseTime,
      lastCheck: routers.lastCheck,
      inviteLink: routers.inviteLink,
      isVerified: routers.isVerified,
      likes: routers.likes,
      createdBy: routers.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: routers.updatedBy,
      createdAt: routers.createdAt,
      updatedAt: routers.updatedAt
    })
    .from(routers)
    .leftJoin(users, eq(routers.createdBy, users.id))
    .innerJoin(routerLikes, eq(routers.id, routerLikes.routerId))
    .where(eq(routerLikes.userId, userId))
    .orderBy(sql`${routerLikes.createdAt} DESC`)

  // 如果有当前用户 ID，批量查询点赞状态
  if (currentUserId && result.length > 0) {
    const routerIds = result.map(r => r.id)
    const likedRouters = await db
      .select({ routerId: routerLikes.routerId })
      .from(routerLikes)
      .where(sql`${routerLikes.userId} = ${currentUserId} AND ${routerLikes.routerId} IN (${sql.join(routerIds.map(id => sql`${id}`), sql`, `)})`)

    const likedRouterIds = new Set(likedRouters.map(r => r.routerId))

    return result.map(r => transformRouter(r, likedRouterIds.has(r.id)))
  }

  return result.map(r => transformRouter(r))
}

// 根据 ID 获取路由器
export async function getRouterById(db: Db, id: string): Promise<Router | null> {
  const result = await db
    .select({
      id: routers.id,
      name: routers.name,
      url: routers.url,
      status: routers.status,
      responseTime: routers.responseTime,
      lastCheck: routers.lastCheck,
      inviteLink: routers.inviteLink,
      isVerified: routers.isVerified,
      likes: routers.likes,
      createdBy: routers.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: routers.updatedBy,
      createdAt: routers.createdAt,
      updatedAt: routers.updatedAt
    })
    .from(routers)
    .leftJoin(users, eq(routers.createdBy, users.id))
    .where(eq(routers.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformRouter(result[0])
}

// 更新路由器
export async function updateRouter(
  db: Db,
  id: string,
  input: UpdateRouterInput
): Promise<Router | null> {
  const now = new Date()

  const updateData: Record<string, unknown> = {
    updatedAt: now
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.url !== undefined) updateData.url = input.url
  if (input.status !== undefined) updateData.status = input.status
  if (input.responseTime !== undefined) updateData.responseTime = input.responseTime
  if (input.inviteLink !== undefined) updateData.inviteLink = input.inviteLink
  if (input.isVerified !== undefined) updateData.isVerified = input.isVerified
  if (input.updatedBy !== undefined) updateData.updatedBy = input.updatedBy

  const result = await db.update(routers).set(updateData).where(eq(routers.id, id)).returning()

  if (result.length === 0) {
    return null
  }

  return transformRouter(result[0])
}

// 更新路由器状态和响应时间
export async function updateRouterStatus(
  db: Db,
  id: string,
  status: RouterStatus,
  responseTime: number
): Promise<Router | null> {
  const now = new Date()

  const result = await db
    .update(routers)
    .set({
      status,
      responseTime,
      lastCheck: now,
      updatedAt: now
    })
    .where(eq(routers.id, id))
    .returning()

  if (result.length === 0) {
    return null
  }

  return transformRouter(result[0])
}

// 删除路由器
export async function deleteRouter(db: Db, id: string): Promise<boolean> {
  const result = await db.delete(routers).where(eq(routers.id, id)).returning()

  return result.length > 0
}

// 批量更新路由器状态（用于健康检查）
export async function checkRouterHealth(db: Db, id: string): Promise<Router | null> {
  const router = await getRouterById(db, id)
  if (!router) return null

  try {
    const startTime = Date.now()
    const response = await fetch(router.url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000) // 10秒超时
    })

    const responseTime = Date.now() - startTime
    const status: RouterStatus = response.ok ? 'online' : 'offline'

    return await updateRouterStatus(db, id, status, responseTime)
  } catch (error) {
    // 如果请求失败，标记为离线
    return await updateRouterStatus(db, id, 'offline', 0)
  }
}

// 检查所有路由器健康状态
export async function checkAllRoutersHealth(db: Db): Promise<Router[]> {
  const allRouters = await getAllRouters(db)

  const results = await Promise.all(
    allRouters.map(async (router) => {
      return await checkRouterHealth(db, router.id)
    })
  )

  return results.filter((r): r is Router => r !== null)
}

// 辅助函数：转换数据库结果为 Router 类型
function transformRouter(data: any, isLikedByCurrentUser?: boolean): Router {
  return {
    id: data.id,
    name: data.name,
    url: data.url,
    status: data.status,
    responseTime: data.responseTime,
    lastCheck: new Date(data.lastCheck),
    inviteLink: data.inviteLink,
    isVerified: data.isVerified,
    likes: data.likes,
    createdBy: data.createdBy,
    createdByName: data.createdByName || null,
    createdByImage: data.createdByImage || null,
    updatedBy: data.updatedBy,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    isLikedByCurrentUser: isLikedByCurrentUser || false
  }
}

// 点赞路由器
export async function likeRouter(db: Db, routerId: string, userId: string): Promise<Router | null> {
  try {
    // 检查是否已经点赞
    const existingLike = await db
      .select()
      .from(routerLikes)
      .where(
        sql`${routerLikes.routerId} = ${routerId} AND ${routerLikes.userId} = ${userId}`
      )
      .limit(1)

    if (existingLike.length > 0) {
      // 已经点赞，返回当前路由器信息
      return await getRouterById(db, routerId)
    }

    // 插入点赞记录
    await db.insert(routerLikes).values({
      routerId,
      userId,
      createdAt: new Date()
    })

    // 增加点赞数
    const result = await db
      .update(routers)
      .set({
        likes: sql`${routers.likes} + 1`,
        updatedAt: new Date()
      })
      .where(eq(routers.id, routerId))
      .returning()

    if (result.length === 0) {
      return null
    }

    return transformRouter(result[0])
  } catch (error) {
    console.error('Error liking router:', error)
    return null
  }
}

// 取消点赞路由器
export async function unlikeRouter(db: Db, routerId: string, userId: string): Promise<Router | null> {
  try {
    // 删除点赞记录
    const deleted = await db
      .delete(routerLikes)
      .where(
        sql`${routerLikes.routerId} = ${routerId} AND ${routerLikes.userId} = ${userId}`
      )
      .returning()

    if (deleted.length === 0) {
      // 没有点赞记录
      return await getRouterById(db, routerId)
    }

    // 减少点赞数（确保不会小于0）
    const result = await db
      .update(routers)
      .set({
        likes: sql`MAX(0, ${routers.likes} - 1)`,
        updatedAt: new Date()
      })
      .where(eq(routers.id, routerId))
      .returning()

    if (result.length === 0) {
      return null
    }

    return transformRouter(result[0])
  } catch (error) {
    console.error('Error unliking router:', error)
    return null
  }
}

// 检查用户是否点赞了路由器
export async function hasUserLiked(db: Db, routerId: string, userId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(routerLikes)
    .where(
      sql`${routerLikes.routerId} = ${routerId} AND ${routerLikes.userId} = ${userId}`
    )
    .limit(1)

  return result.length > 0
}
