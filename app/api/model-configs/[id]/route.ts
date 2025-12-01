import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import {
  getAiModelConfigById,
  updateAiModelConfig,
  deleteAiModelConfig
} from '@/lib/db/model-configs'

import type { UpdateAiModelConfigInput } from '@/lib/db/model-configs'
import type { NextRequest } from 'next/server'

// GET /api/model-configs/[id] - 获取单个 AI 模型配置
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = createDb()
    const config = await getAiModelConfigById(db, id)

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: 'Model config not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('Error fetching model config:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch model config'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/model-configs/[id] - 更新 AI 模型配置
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json()) as UpdateAiModelConfigInput

    // 如果提供了 API URL，验证格式
    if (body.apiUrl) {
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
    }

    // 如果提供了 models，验证格式
    if (body.models !== undefined) {
      if (!Array.isArray(body.models) || body.models.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Models must be a non-empty array'
          },
          { status: 400 }
        )
      }
    }

    const db = createDb()
    const config = await updateAiModelConfig(db, id, body)

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: 'Model config not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('Error updating model config:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update model config'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/model-configs/[id] - 删除 AI 模型配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = createDb()
    const success = await deleteAiModelConfig(db, id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Model config not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Model config deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting model config:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete model config'
      },
      { status: 500 }
    )
  }
}
