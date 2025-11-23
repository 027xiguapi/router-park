import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import {
  createFreeKey,
  getAllFreeKeys,
  getFreeKeysByType,
  getActiveFreeKeysByType
} from '@/lib/db/freeKeys'

import type { CreateFreeKeyInput } from '@/lib/db/freeKeys'
import type { NextRequest } from 'next/server'

// GET /api/freeKeys - 获取免费密钥
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析查询参数
    const keyType = searchParams.get('type') as 'claude' | 'llm' | null
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const db = createDb()

    if (keyType && activeOnly) {
      // 获取指定类型的活跃密钥
      const freeKey = await getActiveFreeKeysByType(db, keyType)
      return NextResponse.json({
        success: true,
        data: freeKey
      })
    } else if (keyType) {
      // 获取指定类型的所有密钥
      const freeKeysList = await getFreeKeysByType(db, keyType)
      return NextResponse.json({
        success: true,
        data: freeKeysList
      })
    } else {
      // 获取所有密钥
      const freeKeysList = await getAllFreeKeys(db)
      return NextResponse.json({
        success: true,
        data: freeKeysList
      })
    }
  } catch (error) {
    console.error('Error fetching free keys:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch free keys'
      },
      { status: 500 }
    )
  }
}

// POST /api/freeKeys - 创建免费密钥
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateFreeKeyInput

    // 验证必填字段
    if (!body.keyValues || !Array.isArray(body.keyValues) || body.keyValues.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'keyValues array is required and cannot be empty'
        },
        { status: 400 }
      )
    }

    if (!body.keyType || !['claude', 'llm'].includes(body.keyType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'keyType must be either "claude" or "llm"'
        },
        { status: 400 }
      )
    }

    // 验证所有密钥格式（应该以sk-开头）
    const invalidKeys = body.keyValues.filter(key => !key.startsWith('sk-'))
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid key format: ${invalidKeys.join(', ')}`
        },
        { status: 400 }
      )
    }

    const db = createDb()
    const freeKey = await createFreeKey(db, body)

    return NextResponse.json(
      {
        success: true,
        data: freeKey
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating free key:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create free key'
      },
      { status: 500 }
    )
  }
}