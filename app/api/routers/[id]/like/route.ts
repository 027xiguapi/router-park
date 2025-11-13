import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import { likeRouter, unlikeRouter, hasUserLiked } from '@/lib/db/routers'

import type { NextRequest } from 'next/server'

// POST /api/routers/[id]/like - 点赞路由器
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required'
        },
        { status: 400 }
      )
    }

    const db = createDb()
    const router = await likeRouter(db, id, userId)

    if (!router) {
      return NextResponse.json(
        {
          success: false,
          error: 'Router not found or like failed'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: router
    })
  } catch (error) {
    console.error('Error liking router:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to like router'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/routers/[id]/like - 取消点赞路由器
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required'
        },
        { status: 400 }
      )
    }

    const db = createDb()
    const router = await unlikeRouter(db, id, userId)

    if (!router) {
      return NextResponse.json(
        {
          success: false,
          error: 'Router not found or unlike failed'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: router
    })
  } catch (error) {
    console.error('Error unliking router:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unlike router'
      },
      { status: 500 }
    )
  }
}

// GET /api/routers/[id]/like - 检查用户是否点赞
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required'
        },
        { status: 400 }
      )
    }

    const db = createDb()
    const liked = await hasUserLiked(db, id, userId)

    return NextResponse.json({
      success: true,
      data: { liked }
    })
  } catch (error) {
    console.error('Error checking like status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check like status'
      },
      { status: 500 }
    )
  }
}
