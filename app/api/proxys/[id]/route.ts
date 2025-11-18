import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import { deleteProxy, getProxyById, updateProxy } from '@/lib/db/proxys'

import type { UpdateProxyInput } from '@/lib/db/proxys'
import type { NextRequest } from 'next/server'

// GET /api/proxys/[id] - 获取单个 Proxy
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = createDb()
    const proxy = await getProxyById(db, id)

    if (!proxy) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proxy not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: proxy
    })
  } catch (error) {
    console.error('Error fetching proxy:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch proxy'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/proxys/[id] - 更新 Proxy
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json()) as UpdateProxyInput

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

    // 如果提供了 slug，验证格式
    if (body.slug && !/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid slug format. Use only lowercase letters, numbers and hyphens'
        },
        { status: 400 }
      )
    }

    const db = createDb()
    const proxy = await updateProxy(db, id, body)

    if (!proxy) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proxy not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: proxy
    })
  } catch (error) {
    console.error('Error updating proxy:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update proxy'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/proxys/[id] - 删除 Proxy
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = createDb()
    const success = await deleteProxy(db, id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proxy not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Proxy deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting proxy:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete proxy'
      },
      { status: 500 }
    )
  }
}
