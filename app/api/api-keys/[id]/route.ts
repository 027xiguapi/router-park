import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import {
  getApiKeyById,
  updateApiKey,
  deleteApiKey
} from '@/lib/db/api-keys'

import type { UpdateApiKeyInput } from '@/lib/db/api-keys'
import type { NextRequest } from 'next/server'

// GET /api/api-keys/[id] - 获取单个 API 密钥
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = createDb()
    const apiKey = await getApiKeyById(db, id)

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: apiKey
    })
  } catch (error) {
    console.error('Error fetching API key:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch API key'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/api-keys/[id] - 更新 API 密钥
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // 验证 allowedModels 格式
    if (body.allowedModels !== undefined && body.allowedModels !== null && !Array.isArray(body.allowedModels)) {
      return NextResponse.json(
        {
          success: false,
          error: 'allowedModels must be an array or null'
        },
        { status: 400 }
      )
    }

    // 验证 ipWhitelist 格式
    if (body.ipWhitelist !== undefined && body.ipWhitelist !== null && !Array.isArray(body.ipWhitelist)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ipWhitelist must be an array or null'
        },
        { status: 400 }
      )
    }

    const input: UpdateApiKeyInput = {}

    if (body.name !== undefined) input.name = body.name
    if (body.group !== undefined) input.group = body.group
    if (body.status !== undefined) input.status = body.status
    if (body.expiresAt !== undefined) {
      input.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    }
    if (body.quota !== undefined) input.quota = body.quota
    if (body.usedQuota !== undefined) input.usedQuota = body.usedQuota
    if (body.unlimitedQuota !== undefined) input.unlimitedQuota = body.unlimitedQuota
    if (body.allowedModels !== undefined) input.allowedModels = body.allowedModels
    if (body.ipWhitelist !== undefined) input.ipWhitelist = body.ipWhitelist
    if (body.rateLimit !== undefined) input.rateLimit = body.rateLimit
    if (body.isPublic !== undefined) input.isPublic = body.isPublic
    if (body.description !== undefined) input.description = body.description
    if (body.updatedBy !== undefined) input.updatedBy = body.updatedBy

    const db = createDb()
    const apiKey = await updateApiKey(db, id, input)

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: apiKey
    })
  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update API key'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/api-keys/[id] - 删除 API 密钥
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = createDb()
    const success = await deleteApiKey(db, id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete API key'
      },
      { status: 500 }
    )
  }
}
