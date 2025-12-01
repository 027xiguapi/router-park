import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import {
  createApiKey,
  getAllApiKeys,
  getPublicApiKeys,
  generateApiKey
} from '@/lib/db/api-keys'

import type { CreateApiKeyInput } from '@/lib/db/api-keys'
import type { NextRequest } from 'next/server'

// GET /api/api-keys - 获取所有 API 密钥
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const publicOnly = searchParams.get('publicOnly') === 'true'

    const db = createDb()

    // 如果只获取公开密钥
    if (publicOnly) {
      const keys = await getPublicApiKeys(db)
      return NextResponse.json({
        success: true,
        data: keys
      })
    }

    // 否则获取所有密钥
    const keys = await getAllApiKeys(db, includeInactive)

    return NextResponse.json({
      success: true,
      data: keys
    })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch API keys'
      },
      { status: 500 }
    )
  }
}

// POST /api/api-keys - 创建新的 API 密钥
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 如果没有提供 key，自动生成
    const key = body.key || generateApiKey()

    // 验证必填字段
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required'
        },
        { status: 400 }
      )
    }

    // 验证 key 格式
    if (!key.startsWith('sk-')) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key must start with "sk-"'
        },
        { status: 400 }
      )
    }

    // 验证 allowedModels 格式
    if (body.allowedModels && !Array.isArray(body.allowedModels)) {
      return NextResponse.json(
        {
          success: false,
          error: 'allowedModels must be an array'
        },
        { status: 400 }
      )
    }

    // 验证 ipWhitelist 格式
    if (body.ipWhitelist && !Array.isArray(body.ipWhitelist)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ipWhitelist must be an array'
        },
        { status: 400 }
      )
    }

    const input: CreateApiKeyInput = {
      key,
      name: body.name,
      userId: body.userId,
      group: body.group,
      status: body.status,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      quota: body.quota,
      unlimitedQuota: body.unlimitedQuota,
      allowedModels: body.allowedModels,
      ipWhitelist: body.ipWhitelist,
      rateLimit: body.rateLimit,
      isPublic: body.isPublic,
      description: body.description,
      createdBy: body.createdBy
    }

    const db = createDb()
    const apiKey = await createApiKey(db, input)

    return NextResponse.json(
      {
        success: true,
        data: apiKey
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating API key:', error)

    // 处理唯一性约束错误
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key already exists'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create API key'
      },
      { status: 500 }
    )
  }
}
