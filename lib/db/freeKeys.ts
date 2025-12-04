import { eq, and } from 'drizzle-orm'
import {freeKeys, type FreeKeyType, type FreeKeyStatus} from './schema'
import type {Db} from "@/lib/db/index";

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
  keyCount: number // 要生成的密钥数量
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
export async function getAllFreeKeys(db: Db): Promise<FreeKey[]> {
  return await db.select({...freeKeys}).from(freeKeys)
}

// 根据类型获取免费密钥
export async function getFreeKeysByType(db: Db, keyType: FreeKeyType): Promise<FreeKey[]> {
  return await db.select().from(freeKeys).where(eq(freeKeys.keyType, keyType))
}

// 获取活跃的免费密钥
export async function getActiveFreeKeysByType(db: Db, keyType: FreeKeyType): Promise<FreeKey | null> {
  const result = await db
    .select()
    .from(freeKeys)
    .where(and(eq(freeKeys.keyType, keyType), eq(freeKeys.keyType, keyType)))
    .get()

  return result || null
}

// 根据ID获取免费密钥
export async function getFreeKeyById(db: Db, id: string): Promise<FreeKey | null> {
  const results = await db.select().from(freeKeys).where(eq(freeKeys.id, id)).limit(1)
  return results[0] || null
}

// 生成 API Key
function generateApiKey(): string {
  const prefix = 'sk-'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = prefix
  for (let i = 0; i < 48; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

// 生成多个唯一的 API Keys
function generateMultipleApiKeys(count: number): string[] {
  const keys = new Set<string>()
  
  while (keys.size < count) {
    keys.add(generateApiKey())
  }
  
  return Array.from(keys)
}

// 创建免费密钥
export async function createFreeKey(db: Db, data: CreateFreeKeyInput): Promise<FreeKey> {
  // 自动生成指定数量的密钥
  const generatedKeys = generateMultipleApiKeys(data.keyCount)
  
  const result = await db.insert(freeKeys).values({
    keyValues: JSON.stringify(generatedKeys),
    keyType: data.keyType,
    status: data.status || 'active',
    createdBy: data.createdBy || null,
    updatedBy: data.createdBy || null
  }).returning()

  return result[0]
}

// 更新免费密钥
export async function updateFreeKey(
  db: Db,
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
export async function deleteFreeKey(db: Db, id: string): Promise<boolean> {
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