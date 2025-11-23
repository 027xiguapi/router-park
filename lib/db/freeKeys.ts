import { eq } from 'drizzle-orm'
import type { Database } from '.'
import {freeKeys, type FreeKeyType, type FreeKeyStatus, proxys} from './schema'

// 免费密钥类型定义
export interface FreeKey {
  id: string
  keyValues: string // JSON 数组字符串
  keyType: FreeKeyType
  status: FreeKeyStatus
  createdBy: string | null
  updatedBy: string | null
  createdAt: number
  updatedAt: number
}

export interface CreateFreeKeyInput {
  keyValues: string[] // 密钥数组
  keyType: FreeKeyType
  status?: FreeKeyStatus
  createdBy?: string
}

export interface UpdateFreeKeyInput {
  keyValues?: string[]
  keyType?: FreeKeyType
  status?: FreeKeyStatus
  updatedBy?: string
}

// 获取所有免费密钥
export async function getAllFreeKeys(db: Database): Promise<FreeKey[]> {
  console.log(await db.select({ createdAt: freeKeys.createdAt,
    updatedAt: freeKeys.updatedAt}).from(freeKeys))
  return await db.select({...freeKeys}).from(freeKeys)
}

// 根据类型获取免费密钥
export async function getFreeKeysByType(db: Database, keyType: FreeKeyType): Promise<FreeKey[]> {
  return await db.select().from(freeKeys).where(eq(freeKeys.keyType, keyType))
}

// 获取活跃的免费密钥
export async function getActiveFreeKeysByType(db: Database, keyType: FreeKeyType): Promise<FreeKey | null> {
  const results = await db
    .select()
    .from(freeKeys)
    .where(eq(freeKeys.keyType, keyType))
    .where(eq(freeKeys.status, 'active'))
    .limit(1)

  return results[0] || null
}

// 根据ID获取免费密钥
export async function getFreeKeyById(db: Database, id: string): Promise<FreeKey | null> {
  const results = await db.select().from(freeKeys).where(eq(freeKeys.id, id)).limit(1)
  return results[0] || null
}

// 创建免费密钥
export async function createFreeKey(db: Database, data: CreateFreeKeyInput): Promise<FreeKey> {
  const result = await db.insert(freeKeys).values({
    keyValues: JSON.stringify(data.keyValues),
    keyType: data.keyType,
    status: data.status || 'active',
    createdBy: data.createdBy || null,
    updatedBy: data.createdBy || null
  }).returning()

  return result[0]
}

// 更新免费密钥
export async function updateFreeKey(
  db: Database,
  id: string,
  data: UpdateFreeKeyInput
): Promise<FreeKey | null> {
  const updateData: any = {
    updatedBy: data.updatedBy || null,
    updatedAt: Date.now()
  }

  if (data.keyValues !== undefined) {
    updateData.keyValues = JSON.stringify(data.keyValues)
  }
  if (data.keyType !== undefined) {
    updateData.keyType = data.keyType
  }
  if (data.status !== undefined) {
    updateData.status = data.status
  }

  const result = await db
    .update(freeKeys)
    .set(updateData)
    .where(eq(freeKeys.id, id))
    .returning()

  return result[0] || null
}

// 删除免费密钥
export async function deleteFreeKey(db: Database, id: string): Promise<boolean> {
  const result = await db.delete(freeKeys).where(eq(freeKeys.id, id))
  return result.rowsAffected > 0
}

// 解析密钥值数组
export function parseKeyValues(keyValuesJson: string): string[] {
  try {
    return JSON.parse(keyValuesJson) as string[]
  } catch {
    return []
  }
}