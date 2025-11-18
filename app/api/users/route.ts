import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import { createUser, getAllUsers, getUsersWithPagination } from '@/lib/db/users'

import type { CreateUserInput, UserQueryOptions } from '@/lib/db/users'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析查询参数
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '30', 10)
    const search = searchParams.get('search') || undefined

    // 使用分页功能
    const usePagination = searchParams.has('page') || searchParams.has('pageSize') || searchParams.has('search')

    const db = createDb()

    if (usePagination) {
      // 使用分页API
      const options: UserQueryOptions = {
        page: Math.max(1, page),
        pageSize: Math.min(100, Math.max(1, pageSize)), // 限制页面大小在1-100之间
        search
      }

      const result = await getUsersWithPagination(db, options)

      return NextResponse.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      })
    } else {
      // 获取所有用户
      const users = await getAllUsers(db)

      return NextResponse.json({
        success: true,
        data: users
      })
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users'
      },
      { status: 500 }
    )
  }
}

// POST /api/users - 创建新用户
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateUserInput

    // 验证必填字段
    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required'
        },
        { status: 400 }
      )
    }

    // 验证 Email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format'
        },
        { status: 400 }
      )
    }

    const db = createDb()
    const user = await createUser(db, body)

    return NextResponse.json(
      {
        success: true,
        data: user
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)

    // 检查是否是唯一性约束错误
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user'
      },
      { status: 500 }
    )
  }
}
