import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import {
  createRouter,
  getAllRouters,
  getRoutersByLikes,
  getUserLikedRouters,
} from '@/lib/db/routers'

import type { CreateRouterInput } from '@/lib/db/routers'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy')
    const userId = searchParams.get('userId')
    const likedBy = searchParams.get('likedBy')

    const db = createDb()
    let routers

    if (likedBy === 'true' && userId) {
      // 获取用户点赞的路由器
      routers = await getUserLikedRouters(db, userId)
    } else if (sortBy === 'likes') {
      // 按点赞数排序
      routers = await getRoutersByLikes(db)
    } else {
      // 默认：按创建时间排序
      routers = await getAllRouters(db)
    }

    return NextResponse.json({
      success: true,
      data: routers
    })
  } catch (error) {
    console.error('Error fetching routers:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch routers'
      },
      { status: 500 }
    )
  }
}

// POST /api/routers - 创建新路由器
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateRouterInput

    // 验证必填字段
    if (!body.name || !body.url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and URL are required'
        },
        { status: 400 }
      )
    }

    // 验证 URL 格式
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

    const db = createDb()
    const router = await createRouter(db, body)

    return NextResponse.json(
      {
        success: true,
        data: router
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating router:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create router'
      },
      { status: 500 }
    )
  }
}
