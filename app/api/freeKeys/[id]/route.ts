import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import {
  getFreeKeyById,
  updateFreeKey,
  deleteFreeKey
} from '@/lib/db/freeKeys'

import type { UpdateFreeKeyInput } from '@/lib/db/freeKeys'
import type { NextRequest } from 'next/server'

// GET /api/freeKeys/[id] - 获取单个免费密钥
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = createDb()

    const freeKey = await getFreeKeyById(db, id)

    if (!freeKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Free key not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: freeKey
    })
  } catch (error) {
    console.error('Error fetching free key:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch free key'
      },
      { status: 500 }
    )
  }
}

// PUT /api/freeKeys/[id] - 更新免费密钥
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json()) as UpdateFreeKeyInput

    // 验证密钥格式（如果提供了keyValues）
    if (body.keyValues) {
      if (!Array.isArray(body.keyValues) || body.keyValues.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'keyValues must be a non-empty array'
          },
          { status: 400 }
        )
      }

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
    }

    // 验证keyType（如果提供了）
    if (body.keyType && !['claude', 'llm'].includes(body.keyType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'keyType must be either "claude" or "llm"'
        },
        { status: 400 }
      )
    }

    // 验证status（如果提供了）
    if (body.status && !['active', 'inactive', 'exhausted'].includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'status must be one of: active, inactive, exhausted'
        },
        { status: 400 }
      )
    }

    const db = createDb()
    const freeKey = await updateFreeKey(db, id, body)

    if (!freeKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Free key not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: freeKey
    })
  } catch (error) {
    console.error('Error updating free key:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update free key'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/freeKeys/[id] - 删除免费密钥
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = createDb()

    const success = await deleteFreeKey(db, id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Free key not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Free key deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting free key:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete free key'
      },
      { status: 500 }
    )
  }
}