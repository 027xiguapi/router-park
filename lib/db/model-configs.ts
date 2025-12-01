import { eq, desc } from 'drizzle-orm'

import { modelConfigs } from './schema'

import type { Db } from './index'

// AI 模型配置类型定义
export interface AiModelConfig {
  id: string
  name: string
  provider: string
  apiUrl: string
  apiKey: string
  models: string[] // 解析后的数组
  defaultModel?: string | null
  isActive: boolean
  priority: number
  description?: string | null
  metadata?: Record<string, unknown> | null
  createdBy?: string | null
  updatedBy?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateAiModelConfigInput {
  name: string
  provider: string
  apiUrl: string
  apiKey: string
  models: string[]
  defaultModel?: string
  isActive?: boolean
  priority?: number
  description?: string
  metadata?: Record<string, unknown>
  createdBy?: string
}

export interface UpdateAiModelConfigInput {
  provider?: string
  apiUrl?: string
  apiKey?: string
  models?: string[]
  defaultModel?: string
  isActive?: boolean
  priority?: number
  description?: string
  metadata?: Record<string, unknown>
  updatedBy?: string
}

// 辅助函数：转换数据库结果为 AiModelConfig 类型
function transformAiModelConfig(data: any): AiModelConfig {
  return {
    id: data.id,
    name: data.name,
    provider: data.provider,
    apiUrl: data.apiUrl,
    apiKey: data.apiKey,
    models: data.models ? JSON.parse(data.models) : [],
    defaultModel: data.defaultModel,
    isActive: data.isActive,
    priority: data.priority,
    description: data.description,
    metadata: data.metadata ? JSON.parse(data.metadata) : null,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt)
  }
}

// 创建 AI 模型配置
export async function createAiModelConfig(
  db: Db,
  input: CreateAiModelConfigInput
): Promise<AiModelConfig> {
  const result = await db
    .insert(modelConfigs)
    .values({
      name: input.name,
      provider: input.provider,
      apiUrl: input.apiUrl,
      apiKey: input.apiKey,
      models: JSON.stringify(input.models),
      defaultModel: input.defaultModel,
      isActive: input.isActive ?? true,
      priority: input.priority ?? 0,
      description: input.description,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      createdBy: input.createdBy,
      updatedBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return transformAiModelConfig(result[0])
}

// 获取所有 AI 模型配置（只返回激活的）
export async function getAllAiModelConfigs(
  db: Db,
  includeInactive = false
): Promise<AiModelConfig[]> {
  let query = db
    .select()
    .from(modelConfigs)
    .orderBy(desc(modelConfigs.priority), desc(modelConfigs.createdAt))

  if (!includeInactive) {
    query = query.where(eq(modelConfigs.isActive, true)) as any
  }

  const result = await query

  return result.map(transformAiModelConfig)
}

// 根据 ID 获取 AI 模型配置
export async function getAiModelConfigById(
  db: Db,
  id: string
): Promise<AiModelConfig | null> {
  const result = await db
    .select()
    .from(modelConfigs)
    .where(eq(modelConfigs.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformAiModelConfig(result[0])
}

// 根据名称获取 AI 模型配置
export async function getAiModelConfigByName(
  db: Db,
  name: string
): Promise<AiModelConfig | null> {
  const result = await db
    .select()
    .from(modelConfigs)
    .where(eq(modelConfigs.name, name))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return transformAiModelConfig(result[0])
}

// 根据模型名称查找对应的配置
export async function findConfigByModelName(
  db: Db,
  modelName: string
): Promise<AiModelConfig | null> {
  const configs = await getAllAiModelConfigs(db)

  // 按优先级查找支持该模型的配置
  for (const config of configs) {
    if (config.models.includes(modelName)) {
      return config
    }
  }

  return null
}

// 更新 AI 模型配置
export async function updateAiModelConfig(
  db: Db,
  id: string,
  input: UpdateAiModelConfigInput
): Promise<AiModelConfig | null> {
  const now = new Date()

  const updateData: Record<string, unknown> = {
    updatedAt: now
  }

  if (input.provider !== undefined) updateData.provider = input.provider
  if (input.apiUrl !== undefined) updateData.apiUrl = input.apiUrl
  if (input.apiKey !== undefined) updateData.apiKey = input.apiKey
  if (input.models !== undefined) updateData.models = JSON.stringify(input.models)
  if (input.defaultModel !== undefined) updateData.defaultModel = input.defaultModel
  if (input.isActive !== undefined) updateData.isActive = input.isActive
  if (input.priority !== undefined) updateData.priority = input.priority
  if (input.description !== undefined) updateData.description = input.description
  if (input.metadata !== undefined)
    updateData.metadata = JSON.stringify(input.metadata)
  if (input.updatedBy !== undefined) updateData.updatedBy = input.updatedBy

  const result = await db
    .update(modelConfigs)
    .set(updateData)
    .where(eq(modelConfigs.id, id))
    .returning()

  if (result.length === 0) {
    return null
  }

  return transformAiModelConfig(result[0])
}

// 删除 AI 模型配置
export async function deleteAiModelConfig(db: Db, id: string): Promise<boolean> {
  const result = await db
    .delete(modelConfigs)
    .where(eq(modelConfigs.id, id))
    .returning()

  return result.length > 0
}

// 切换配置的激活状态
export async function toggleAiModelConfigStatus(
  db: Db,
  id: string
): Promise<AiModelConfig | null> {
  const config = await getAiModelConfigById(db, id)
  if (!config) {
    return null
  }

  return updateAiModelConfig(db, id, { isActive: !config.isActive })
}

// 获取所有支持的模型列表（从所有激活的配置中提取）
export async function getAllSupportedModelsFromDb(db: Db): Promise<string[]> {
  const configs = await getAllAiModelConfigs(db)
  const allModels = new Set<string>()

  for (const config of configs) {
    for (const model of config.models) {
      allModels.add(model)
    }
  }

  return Array.from(allModels)
}

// 批量导入配置（用于初始化）
export async function bulkCreateAiModelConfigs(
  db: Db,
  configs: CreateAiModelConfigInput[]
): Promise<AiModelConfig[]> {
  const results: AiModelConfig[] = []

  for (const config of configs) {
    try {
      // 检查是否已存在
      const existing = await getAiModelConfigByName(db, config.name)
      if (existing) {
        console.log(`Config "${config.name}" already exists, skipping...`)
        results.push(existing)
        continue
      }

      const created = await createAiModelConfig(db, config)
      results.push(created)
    } catch (error) {
      console.error(`Failed to create config "${config.name}":`, error)
    }
  }

  return results
}
