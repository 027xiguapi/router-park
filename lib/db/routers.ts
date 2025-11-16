import { eq, sql } from 'drizzle-orm'

import { routers, routerLikes } from './schema'

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
  updatedBy?: string | null
  createdAt: Date
  updatedAt: Date
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
      status: 'offline',
      responseTime: 0,
      lastCheck: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return transformRouter(result[0])
}

// 获取所有路由器
export async function getAllRouters(db: Db): Promise<Router[]> {
  const result = await db
    .select()
    .from(routers)
    .orderBy(sql`${routers.createdAt} DESC`)

  return result.map(transformRouter)
}

// 获取所有路由器（按点赞数排序）
export async function getRoutersByLikes(db: Db): Promise<Router[]> {
  const result = await db
    .select()
    .from(routers)
    .orderBy(sql`${routers.likes} DESC, ${routers.createdAt} DESC`)

  return result.map(transformRouter)
}

// 获取用户点赞的路由器
export async function getUserLikedRouters(db: Db, userId: string): Promise<Router[]> {
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
      updatedBy: routers.updatedBy,
      createdAt: routers.createdAt,
      updatedAt: routers.updatedAt
    })
    .from(routers)
    .innerJoin(routerLikes, eq(routers.id, routerLikes.routerId))
    .where(eq(routerLikes.userId, userId))
    .orderBy(sql`${routerLikes.createdAt} DESC`)

  return result.map(transformRouter)
}

// 根据 ID 获取路由器
export async function getRouterById(db: Db, id: string): Promise<Router | null> {
  const result = await db.select().from(routers).where(eq(routers.id, id)).limit(1)

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
function transformRouter(data: typeof routers.$inferSelect): Router {
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
    updatedBy: data.updatedBy,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt)
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
