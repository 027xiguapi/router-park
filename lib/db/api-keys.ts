import { eq, desc, and, or, gte, isNull } from 'drizzle-orm'

import { apiKeys } from './schema'

import type { ApiKeyStatus } from './schema'
import type { Db } from './index'

// API 密钥类型定义
export interface ApiKey {
  id: string
  key: string
  name: string
  userId?: string | null
  group?: string | null
  status: ApiKeyStatus
  expiresAt?: Date | null
  quota: number
  usedQuota: number
  unlimitedQuota: boolean
  requestCount: number
  allowedModels?: string[] | null
  ipWhitelist?: string[] | null
  rateLimit?: number | null
  isPublic: boolean
  description?: string | null
  lastUsedAt?: Date | null
  createdBy?: string | null
  updatedBy?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateApiKeyInput {
  key: string
  name: string
  userId?: string
  group?: string
  status?: ApiKeyStatus
  expiresAt?: Date
  quota?: number
  unlimitedQuota?: boolean
  allowedModels?: string[]
  ipWhitelist?: string[]
  rateLimit?: number
  isPublic?: boolean
  description?: string
  createdBy?: string
}

export interface UpdateApiKeyInput {
  name?: string
  group?: string
  status?: ApiKeyStatus
  expiresAt?: Date | null
  quota?: number
  usedQuota?: number
  unlimitedQuota?: boolean
  allowedModels?: string[] | null
  ipWhitelist?: string[] | null
  rateLimit?: number | null
  isPublic?: boolean
  description?: string | null
  updatedBy?: string
}

// 辅助函数：转换数据库结果
function transformApiKey(data: any): ApiKey {
  return {
    id: data.id,
    key: data.key,
    name: data.name,
    userId: data.userId,
    group: data.group,
    status: data.status,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    quota: data.quota,
    usedQuota: data.usedQuota,
    unlimitedQuota: data.unlimitedQuota,
    requestCount: data.requestCount,
    allowedModels: data.allowedModels ? JSON.parse(data.allowedModels) : null,
    ipWhitelist: data.ipWhitelist ? JSON.parse(data.ipWhitelist) : null,
    rateLimit: data.rateLimit,
    isPublic: data.isPublic,
    description: data.description,
    lastUsedAt: data.lastUsedAt ? new Date(data.lastUsedAt) : null,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt)
  }
}

// 生成 API Key（sk-... 格式）
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'sk-'
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 创建 API 密钥
export async function createApiKey(
  db: Db,
  input: CreateApiKeyInput
): Promise<ApiKey> {
  const now = new Date()

  const result = await db
    .insert(apiKeys)
    .values({
      key: input.key,
      name: input.name,
      userId: input.userId,
      group: input.group,
      status: input.status || 'active',
      expiresAt: input.expiresAt,
      quota: input.quota || 0,
      usedQuota: 0,
      unlimitedQuota: input.unlimitedQuota || false,
      requestCount: 0,
      allowedModels: input.allowedModels ? JSON.stringify(input.allowedModels) : null,
      ipWhitelist: input.ipWhitelist ? JSON.stringify(input.ipWhitelist) : null,
      rateLimit: input.rateLimit,
      isPublic: input.isPublic || false,
      description: input.description,
      createdBy: input.createdBy,
      updatedBy: input.createdBy,
      createdAt: now,
      updatedAt: now
    })
    .returning()

  return transformApiKey(result[0])
}

// 获取所有 API 密钥
export async function getAllApiKeys(
  db: Db,
  includeInactive = false
): Promise<ApiKey[]> {
  let query = db
    .select()
    .from(apiKeys)
    .orderBy(desc(apiKeys.createdAt))

  if (!includeInactive) {
    query = query.where(eq(apiKeys.status, 'active')) as any
  }

  const result = await query
  return result.map(transformApiKey)
}

// 根据 ID 获取 API 密钥
export async function getApiKeyById(
  db: Db,
  id: string
): Promise<ApiKey | null> {
  const result = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformApiKey(result[0])
}

// 根据 Key 获取 API 密钥
export async function getApiKeyByKey(
  db: Db,
  key: string
): Promise<ApiKey | null> {
  const result = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.key, key))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformApiKey(result[0])
}

// 验证 API 密钥是否有效
export async function validateApiKey(
  db: Db,
  key: string,
  model?: string,
  ip?: string
): Promise<{ valid: boolean; error?: string; apiKey?: ApiKey }> {
  const apiKey = await getApiKeyByKey(db, key)

  if (!apiKey) {
    return { valid: false, error: 'Invalid API key' }
  }

  // 检查状态
  if (apiKey.status !== 'active') {
    return { valid: false, error: `API key is ${apiKey.status}` }
  }

  // 检查过期时间
  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
    return { valid: false, error: 'API key has expired' }
  }

  // 检查额度
  if (!apiKey.unlimitedQuota && apiKey.usedQuota >= apiKey.quota) {
    return { valid: false, error: 'API key quota exhausted' }
  }

  // 检查模型限制
  if (model && apiKey.allowedModels && apiKey.allowedModels.length > 0) {
    if (!apiKey.allowedModels.includes(model)) {
      return { valid: false, error: `Model "${model}" is not allowed for this API key` }
    }
  }

  // 检查 IP 白名单
  if (ip && apiKey.ipWhitelist && apiKey.ipWhitelist.length > 0) {
    if (!apiKey.ipWhitelist.includes(ip)) {
      return { valid: false, error: 'IP address not in whitelist' }
    }
  }

  return { valid: true, apiKey }
}

// 更新 API 密钥
export async function updateApiKey(
  db: Db,
  id: string,
  input: UpdateApiKeyInput
): Promise<ApiKey | null> {
  const now = new Date()

  const updateData: Record<string, unknown> = {
    updatedAt: now
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.group !== undefined) updateData.group = input.group
  if (input.status !== undefined) updateData.status = input.status
  if (input.expiresAt !== undefined) updateData.expiresAt = input.expiresAt
  if (input.quota !== undefined) updateData.quota = input.quota
  if (input.usedQuota !== undefined) updateData.usedQuota = input.usedQuota
  if (input.unlimitedQuota !== undefined) updateData.unlimitedQuota = input.unlimitedQuota
  if (input.allowedModels !== undefined) {
    updateData.allowedModels = input.allowedModels ? JSON.stringify(input.allowedModels) : null
  }
  if (input.ipWhitelist !== undefined) {
    updateData.ipWhitelist = input.ipWhitelist ? JSON.stringify(input.ipWhitelist) : null
  }
  if (input.rateLimit !== undefined) updateData.rateLimit = input.rateLimit
  if (input.isPublic !== undefined) updateData.isPublic = input.isPublic
  if (input.description !== undefined) updateData.description = input.description
  if (input.updatedBy !== undefined) updateData.updatedBy = input.updatedBy

  const result = await db
    .update(apiKeys)
    .set(updateData)
    .where(eq(apiKeys.id, id))
    .returning()

  if (result.length === 0) {
    return null
  }

  return transformApiKey(result[0])
}

// 删除 API 密钥
export async function deleteApiKey(db: Db, id: string): Promise<boolean> {
  const result = await db
    .delete(apiKeys)
    .where(eq(apiKeys.id, id))
    .returning()

  return result.length > 0
}

// 增加使用量（用于 API 调用后更新）
export async function incrementApiKeyUsage(
  db: Db,
  id: string,
  usedTokens: number = 0
): Promise<ApiKey | null> {
  const apiKey = await getApiKeyById(db, id)
  if (!apiKey) {
    return null
  }

  const now = new Date()

  const result = await db
    .update(apiKeys)
    .set({
      // usedQuota: apiKey.usedQuota + usedTokens,
      usedQuota: apiKey.usedQuota + 1, // 暂时按照次数计算
      requestCount: apiKey.requestCount + 1,
      lastUsedAt: now,
      updatedAt: now
    })
    .where(eq(apiKeys.id, id))
    .returning()

  if (result.length === 0) {
    return null
  }

  return transformApiKey(result[0])
}

// 根据用户 ID 获取其所有 API 密钥
export async function getApiKeysByUserId(
  db: Db,
  userId: string
): Promise<ApiKey[]> {
  const result = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(desc(apiKeys.createdAt))

  return result.map(transformApiKey)
}

// 根据分组获取 API 密钥
export async function getApiKeysByGroup(
  db: Db,
  group: string
): Promise<ApiKey[]> {
  const result = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.group, group))
    .orderBy(desc(apiKeys.createdAt))

  return result.map(transformApiKey)
}

// 获取有效的 API 密钥（未过期且有额度）
export async function getValidApiKeys(db: Db): Promise<ApiKey[]> {
  const now = new Date()

  const result = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.status, 'active'),
        or(
          isNull(apiKeys.expiresAt),
          gte(apiKeys.expiresAt, now)
        )
      )
    )
    .orderBy(desc(apiKeys.createdAt))

  // 过滤掉额度用尽的（非无限额度）
  return result
    .map(transformApiKey)
    .filter(k => k.unlimitedQuota || k.usedQuota < k.quota)
}

// 获取公开的 API 密钥（用于首页展示）
export async function getPublicApiKeys(db: Db): Promise<ApiKey[]> {
  const now = new Date()

  const result = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.status, 'active'),
        eq(apiKeys.isPublic, true),
        or(
          isNull(apiKeys.expiresAt),
          gte(apiKeys.expiresAt, now)
        )
      )
    )
    .orderBy(desc(apiKeys.createdAt))

  return result.map(transformApiKey)
}
