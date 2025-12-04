import { eq, sql, like, desc, or } from 'drizzle-orm'

import { users } from './schema'

import type { Db } from './index'

// User 类型定义
export interface User {
  id: string
  name: string | null
  email: string | null
  emailVerified: Date | null
  image: string | null
  balance: number
  inviteCode: string | null
  invitedBy: string | null
  totalEarned: number
  inviteCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  invitedBy?: string // 邀请人 ID
}

export interface UpdateUserInput {
  name?: string
  email?: string
  emailVerified?: Date
  image?: string
  balance?: number
  inviteCode?: string
  invitedBy?: string
  totalEarned?: number
  inviteCount?: number
}

export interface UserQueryOptions {
  page?: number
  pageSize?: number
  search?: string
}

export interface PaginatedUsers {
  data: User[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 生成邀请码（8位随机字符）
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 创建用户
export async function createUser(db: Db, input: CreateUserInput): Promise<User> {
  const inviteCode = generateInviteCode()

  const result = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      emailVerified: input.emailVerified,
      image: input.image,
      inviteCode,
      invitedBy: input.invitedBy
    })
    .returning()

  return transformUser(result[0])
}

// 获取所有用户
export async function getAllUsers(db: Db): Promise<User[]> {
  const result = await db
    .select()
    .from(users)
    .orderBy(desc(users.id))

  return result.map(transformUser)
}

// 获取用户（支持分页和搜索）
export async function getUsersWithPagination(
  db: Db,
  options: UserQueryOptions = {}
): Promise<PaginatedUsers> {
  const { page = 1, pageSize = 30, search } = options

  const offset = (page - 1) * pageSize

  // 构建查询
  let query = db.select().from(users)
  let countQuery = db.select({ count: sql`COUNT(*)` }).from(users)

  // 添加搜索条件
  if (search && search.trim()) {
    const searchCondition = or(
      like(users.name, `%${search}%`),
      like(users.email, `%${search}%`)
    )
    query = query.where(searchCondition)
    countQuery = countQuery.where(searchCondition)
  }

  // 添加排序和分页
  query = query.orderBy(desc(users.id)).limit(pageSize).offset(offset)

  // 执行查询
  const [result, totalResult] = await Promise.all([query, countQuery])

  const total = Number(totalResult[0].count)
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: result.map(transformUser),
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

// 根据 ID 获取用户
export async function getUserById(db: Db, id: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1)

  if (result.length === 0) {
    return null
  }

  return transformUser(result[0])
}

// 根据 Email 获取用户
export async function getUserByEmail(db: Db, email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (result.length === 0) {
    return null
  }

  return transformUser(result[0])
}

// 根据邀请码获取用户
export async function getUserByInviteCode(db: Db, inviteCode: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.inviteCode, inviteCode)).limit(1)

  if (result.length === 0) {
    return null
  }

  return transformUser(result[0])
}

// 更新用户
export async function updateUser(db: Db, id: string, input: UpdateUserInput): Promise<User | null> {
  const updateData: Record<string, unknown> = {
    updatedAt: new Date()
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.email !== undefined) updateData.email = input.email
  if (input.emailVerified !== undefined) updateData.emailVerified = input.emailVerified
  if (input.image !== undefined) updateData.image = input.image
  if (input.balance !== undefined) updateData.balance = input.balance
  if (input.inviteCode !== undefined) updateData.inviteCode = input.inviteCode
  if (input.invitedBy !== undefined) updateData.invitedBy = input.invitedBy
  if (input.totalEarned !== undefined) updateData.totalEarned = input.totalEarned
  if (input.inviteCount !== undefined) updateData.inviteCount = input.inviteCount

  const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning()

  if (result.length === 0) {
    return null
  }

  return transformUser(result[0])
}

// 删除用户
export async function deleteUser(db: Db, id: string): Promise<boolean> {
  const result = await db.delete(users).where(eq(users.id, id)).returning()

  return result.length > 0
}

// 辅助函数：转换数据库结果为 User 类型
function transformUser(data: any): User {
  return {
    id: data.id,
    name: data.name || null,
    email: data.email || null,
    emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
    image: data.image || null,
    balance: data.balance ?? 10000,
    inviteCode: data.inviteCode || null,
    invitedBy: data.invitedBy || null,
    totalEarned: data.totalEarned ?? 0,
    inviteCount: data.inviteCount ?? 0,
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
  }
}
