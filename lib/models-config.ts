import { createDb } from '@/lib/db'
import {
  getAllAiModelConfigs,
  findConfigByModelName,
  getAiModelConfigByName
} from '@/lib/db/model-configs'

import type { AiModelConfig } from '@/lib/db/model-configs'

// AI 模型配置类型（兼容旧接口）
export interface ModelConfig {
  name: string // 模型名称
  provider: string // 提供商名称
  apiUrl: string // API 转发地址
  apiKey: string // API Key
  models: string[] // 支持的模型列表
  defaultModel?: string // 默认模型
}

// 将数据库配置转换为 ModelConfig 类型
function toModelConfig(config: AiModelConfig): ModelConfig {
  return {
    name: config.name,
    provider: config.provider,
    apiUrl: config.apiUrl,
    apiKey: config.apiKey,
    models: config.models,
    defaultModel: config.defaultModel || undefined
  }
}

// 获取所有模型配置（从数据库）
export async function getModelConfigs(): Promise<ModelConfig[]> {
  const db = createDb()
  const configs = await getAllAiModelConfigs(db, false) // 只获取激活的配置
  return configs.map(toModelConfig)
}

// 根据模型名称查找配置
export async function findModelConfig(modelName: string): Promise<ModelConfig | null> {
  const db = createDb()
  const config = await findConfigByModelName(db, modelName)
  return config ? toModelConfig(config) : null
}

// 根据提供商名称获取配置
export async function getConfigByProvider(providerName: string): Promise<ModelConfig | null> {
  const db = createDb()
  const config = await getAiModelConfigByName(db, providerName)
  if (!config || !config.isActive) {
    return null
  }
  return toModelConfig(config)
}

// 获取默认配置（优先级最高的配置）
export async function getDefaultConfig(): Promise<ModelConfig | null> {
  const db = createDb()
  const configs = await getAllAiModelConfigs(db, false)
  if (configs.length === 0) {
    return null
  }
  // 配置已按优先级排序，第一个就是优先级最高的
  return toModelConfig(configs[0])
}

// 获取所有支持的模型列表
export async function getAllSupportedModels(): Promise<string[]> {
  const db = createDb()
  const configs = await getAllAiModelConfigs(db, false)
  const models = new Set<string>()
  for (const config of configs) {
    for (const model of config.models) {
      models.add(model)
    }
  }
  return Array.from(models)
}

// 验证模型是否支持
export async function isModelSupported(modelName: string): Promise<boolean> {
  const config = await findModelConfig(modelName)
  return config !== null
}

// 获取模型信息（用于调试）
export async function getModelInfo(modelName: string) {
  const config = await findModelConfig(modelName)
  if (!config) {
    return null
  }
  return {
    model: modelName,
    provider: config.provider,
    providerName: config.name,
    apiUrl: config.apiUrl,
    hasApiKey: !!config.apiKey
  }
}
