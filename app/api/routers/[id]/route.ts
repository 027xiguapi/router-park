import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import { deleteRouter, getRouterById, updateRouter } from '@/lib/db/routers'

import type { UpdateRouterInput } from '@/lib/db/routers'
import type { NextRequest } from 'next/server'

// GET /api/routers/[id] - 获取单个路由器
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = createDb()
    const router = await getRouterById(db, id)

    if (!router) {
      return NextResponse.json(
        {
          success: false,
          error: 'Router not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: router
    })
  } catch (error) {
    console.error('Error fetching router:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch router'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/routers/[id] - 更新路由器
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json()) as UpdateRouterInput

    // 如果提供了 URL，验证格式
    if (body.url) {
      try {
        new URL(body.url)
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid URL format'
          },
          { status: 400 }
        )
      }
    }

    const db = createDb()
    const router = await updateRouter(db, id, body)

    if (!router) {
      return NextResponse.json(
        {
          success: false,
          error: 'Router not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: router
    })
  } catch (error) {
    console.error('Error updating router:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update router'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/routers/[id] - 删除路由器
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = createDb()
    const success = await deleteRouter(db, id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Router not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Router deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting router:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete router'
      },
      { status: 500 }
    )
  }
}
