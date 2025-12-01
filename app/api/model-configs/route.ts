import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import {
  createAiModelConfig,
  getAllAiModelConfigs
} from '@/lib/db/model-configs'

import type { CreateAiModelConfigInput } from '@/lib/db/model-configs'
import type { NextRequest } from 'next/server'

// GET /api/model-configs - 获取所有 AI 模型配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const db = createDb()
    const configs = await getAllAiModelConfigs(db, includeInactive)

    return NextResponse.json({
      success: true,
      data: configs
    })
  } catch (error) {
    console.error('Error fetching model configs:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch model configs'
      },
      { status: 500 }
    )
  }
}

// POST /api/model-configs - 创建新的 AI 模型配置
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateAiModelConfigInput

    // 验证必填字段
    if (!body.name || !body.provider || !body.apiUrl || !body.apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, provider, apiUrl and apiKey are required'
        },
        { status: 400 }
      )
    }

    // 验证 models 字段
    if (!body.models || !Array.isArray(body.models) || body.models.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Models must be a non-empty array'
        },
        { status: 400 }
      )
    }

    // 验证 API URL 格式
    try {
      new URL(body.apiUrl)
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid API URL format'
        },
        { status: 400 }
      )
    }

    // 验证 name 格式（只允许小写字母、数字和连字符）
    if (!/^[a-z0-9-]+$/.test(body.name)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid name format. Use only lowercase letters, numbers and hyphens'
        },
        { status: 400 }
      )
    }

    const db = createDb()
    const config = await createAiModelConfig(db, body)

    return NextResponse.json(
      {
        success: true,
        data: config
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating model config:', error)

    // 处理唯一性约束错误
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return NextResponse.json(
        {
          success: false,
          error: 'A configuration with this name already exists'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create model config'
      },
      { status: 500 }
    )
  }
}
