import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import {
  createProxy,
  getAllProxys,
  getProxysWithPagination,
  getActiveProxys,
  getUserLikedProxys
} from '@/lib/db/proxys'

import type { CreateProxyInput, ProxyQueryOptions } from '@/lib/db/proxys'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析查询参数
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '30', 10)
    const search = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sortBy') as 'latest' | 'views' | 'likes' | 'name' | undefined
    const status = searchParams.get('status') as 'active' | 'inactive' | 'all' | undefined
    const userId = searchParams.get('userId') || undefined
    const likedBy = searchParams.get('likedBy') === 'true'

    // 使用新的分页功能还是保持兼容性
    const usePagination = searchParams.has('page') || searchParams.has('pageSize') || searchParams.has('search')

    const db = createDb()

    if (usePagination) {
      // 使用新的分页API
      const options: ProxyQueryOptions = {
        page: Math.max(1, page),
        pageSize: Math.min(100, Math.max(1, pageSize)), // 限制页面大小在1-100之间
        search,
        sortBy: sortBy || 'latest',
        status: status || 'all',
        userId,
        likedBy
      }

      const result = await getProxysWithPagination(db, options)

      return NextResponse.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      })
    } else {
      // 保持向后兼容性 - 使用原来的逻辑
      let proxys

      if (likedBy && userId) {
        // 获取用户点赞的 proxy
        proxys = await getUserLikedProxys(db, userId)
      } else if (status === 'active') {
        // 只获取活跃的
        proxys = await getActiveProxys(db)
      } else {
        // 默认：获取所有
        proxys = await getAllProxys(db)
      }

      return NextResponse.json({
        success: true,
        data: proxys
      })
    }
  } catch (error) {
    console.error('Error fetching proxys:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch proxys'
      },
      { status: 500 }
    )
  }
}

// POST /api/proxys - 创建新 Proxy
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateProxyInput

    // 验证必填字段
    if (!body.name || !body.url || !body.slug || !body.seoTitle || !body.seoDescription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, URL, slug, seoTitle and seoDescription are required'
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

    // 验证 slug 格式（只允许小写字母、数字和连字符）
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid slug format. Use only lowercase letters, numbers and hyphens'
        },
        { status: 400 }
      )
    }

    const db = createDb()
    const proxy = await createProxy(db, body)

    return NextResponse.json(
      {
        success: true,
        data: proxy
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating proxy:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create proxy'
      },
      { status: 500 }
    )
  }
}
