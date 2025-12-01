import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import {
  createRouter,
  getAllRouters,
  getRoutersByLikes,
  getUserLikedRouters,
  getRoutersWithPagination,
} from '@/lib/db/routers'
import { auth } from '@/lib/auth'

import type { CreateRouterInput, RouterQueryOptions } from '@/lib/db/routers'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 获取当前登录用户
    const session = await auth()
    const currentUserId = session?.user?.id

    // 解析查询参数
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10)
    const search = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sortBy') as 'latest' | 'likes' | 'name' | undefined
    const userId = searchParams.get('userId') || undefined
    const likedBy = searchParams.get('likedBy') === 'true'
    const createdBy = searchParams.get('createdBy') === 'true'
    const verified = searchParams.get('verified') === 'true'

    // 使用新的分页功能还是保持兼容性
    const usePagination = searchParams.has('page') || searchParams.has('pageSize') || searchParams.has('search')

    const db = createDb()

    if (usePagination) {
      const options: RouterQueryOptions = {
        page: Math.max(1, page),
        pageSize: Math.min(100, Math.max(1, pageSize)), // 限制页面大小在1-100之间
        search,
        sortBy: sortBy || (likedBy ? 'latest' : (searchParams.get('sortBy') === 'likes' ? 'likes' : 'latest')),
        userId,
        likedBy,
        createdBy,
        verified,
        currentUserId
      }

      const result = await getRoutersWithPagination(db, options)

      return NextResponse.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      })
    } else {
      // 保持向后兼容性 - 使用原来的逻辑
      let routers

      if (likedBy && userId) {
        // 获取用户点赞的路由器
        routers = await getUserLikedRouters(db, userId, currentUserId)
      } else if (sortBy === 'likes') {
        // 按点赞数排序
        routers = await getRoutersByLikes(db, currentUserId)
      } else {
        // 默认：按创建时间排序
        routers = await getAllRouters(db, currentUserId)
      }

      return NextResponse.json({
        success: true,
        data: routers
      })
    }
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
