import { eq, desc, asc } from 'drizzle-orm'

import { vpns, users } from './schema'

import type { Db } from './index'

// VPN 类型定义
export interface VPN {
  id: string
  name: string
  url: string
  subscriptionUrl: string
  inviteLink?: string | null
  description?: string | null
  isActive: boolean
  sortOrder: number
  createdBy?: string | null
  createdByName?: string | null
  createdByImage?: string | null
  updatedBy?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateVPNInput {
  name: string
  url: string
  subscriptionUrl: string
  inviteLink?: string
  description?: string
  isActive?: boolean
  sortOrder?: number
  createdBy?: string
}

export interface UpdateVPNInput {
  name?: string
  url?: string
  subscriptionUrl?: string
  inviteLink?: string
  description?: string
  isActive?: boolean
  sortOrder?: number
  updatedBy?: string
}

// 创建 VPN
export async function createVPN(db: Db, input: CreateVPNInput): Promise<VPN> {
  const result = await db
    .insert(vpns)
    .values({
      name: input.name,
      url: input.url,
      subscriptionUrl: input.subscriptionUrl,
      inviteLink: input.inviteLink,
      description: input.description,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
      createdBy: input.createdBy,
      updatedBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return transformVPN(result[0])
}

// 获取所有 VPN（仅激活的）
export async function getAllActiveVPNs(db: Db): Promise<VPN[]> {
  const result = await db
    .select({
      id: vpns.id,
      name: vpns.name,
      url: vpns.url,
      subscriptionUrl: vpns.subscriptionUrl,
      inviteLink: vpns.inviteLink,
      description: vpns.description,
      isActive: vpns.isActive,
      sortOrder: vpns.sortOrder,
      createdBy: vpns.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: vpns.updatedBy,
      createdAt: vpns.createdAt,
      updatedAt: vpns.updatedAt
    })
    .from(vpns)
    .leftJoin(users, eq(vpns.createdBy, users.id))
    .where(eq(vpns.isActive, true))
    .orderBy(asc(vpns.sortOrder), desc(vpns.createdAt))

  return result.map(transformVPN)
}

// 获取所有 VPN（包括未激活的）
export async function getAllVPNs(db: Db): Promise<VPN[]> {
  const result = await db
    .select({
      id: vpns.id,
      name: vpns.name,
      url: vpns.url,
      subscriptionUrl: vpns.subscriptionUrl,
      inviteLink: vpns.inviteLink,
      description: vpns.description,
      isActive: vpns.isActive,
      sortOrder: vpns.sortOrder,
      createdBy: vpns.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: vpns.updatedBy,
      createdAt: vpns.createdAt,
      updatedAt: vpns.updatedAt
    })
    .from(vpns)
    .leftJoin(users, eq(vpns.createdBy, users.id))
    .orderBy(asc(vpns.sortOrder), desc(vpns.createdAt))

  return result.map(transformVPN)
}

// 根据 ID 获取 VPN
export async function getVPNById(db: Db, id: string): Promise<VPN | null> {
  const result = await db
    .select({
      id: vpns.id,
      name: vpns.name,
      url: vpns.url,
      subscriptionUrl: vpns.subscriptionUrl,
      inviteLink: vpns.inviteLink,
      description: vpns.description,
      isActive: vpns.isActive,
      sortOrder: vpns.sortOrder,
      createdBy: vpns.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: vpns.updatedBy,
      createdAt: vpns.createdAt,
      updatedAt: vpns.updatedAt
    })
    .from(vpns)
    .leftJoin(users, eq(vpns.createdBy, users.id))
    .where(eq(vpns.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformVPN(result[0])
}

// 更新 VPN
export async function updateVPN(
  db: Db,
  id: string,
  input: UpdateVPNInput
): Promise<VPN | null> {
  const now = new Date()

  const updateData: Record<string, unknown> = {
    updatedAt: now
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.url !== undefined) updateData.url = input.url
  if (input.subscriptionUrl !== undefined) updateData.subscriptionUrl = input.subscriptionUrl
  if (input.inviteLink !== undefined) updateData.inviteLink = input.inviteLink
  if (input.description !== undefined) updateData.description = input.description
  if (input.isActive !== undefined) updateData.isActive = input.isActive
  if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder
  if (input.updatedBy !== undefined) updateData.updatedBy = input.updatedBy

  const result = await db.update(vpns).set(updateData).where(eq(vpns.id, id)).returning()

  if (result.length === 0) {
    return null
  }

  return transformVPN(result[0])
}

// 删除 VPN
export async function deleteVPN(db: Db, id: string): Promise<boolean> {
  const result = await db.delete(vpns).where(eq(vpns.id, id)).returning()

  return result.length > 0
}

// 获取第一个激活的 VPN（用于前端显示）
export async function getFirstActiveVPN(db: Db): Promise<VPN | null> {
  const result = await db
    .select({
      id: vpns.id,
      name: vpns.name,
      url: vpns.url,
      subscriptionUrl: vpns.subscriptionUrl,
      inviteLink: vpns.inviteLink,
      description: vpns.description,
      isActive: vpns.isActive,
      sortOrder: vpns.sortOrder,
      createdBy: vpns.createdBy,
      createdByName: users.name,
      createdByImage: users.image,
      updatedBy: vpns.updatedBy,
      createdAt: vpns.createdAt,
      updatedAt: vpns.updatedAt
    })
    .from(vpns)
    .leftJoin(users, eq(vpns.createdBy, users.id))
    .where(eq(vpns.isActive, true))
    .orderBy(asc(vpns.sortOrder), desc(vpns.createdAt))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformVPN(result[0])
}

// 辅助函数：转换数据库结果为 VPN 类型
function transformVPN(data: any): VPN {
  return {
    id: data.id,
    name: data.name,
    url: data.url,
    subscriptionUrl: data.subscriptionUrl,
    inviteLink: data.inviteLink,
    description: data.description,
    isActive: data.isActive,
    sortOrder: data.sortOrder,
    createdBy: data.createdBy,
    createdByName: data.createdByName || null,
    createdByImage: data.createdByImage || null,
    updatedBy: data.updatedBy,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt)
  }
}
