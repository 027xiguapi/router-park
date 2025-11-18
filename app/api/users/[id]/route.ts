import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import { deleteUser, getUserById, updateUser } from '@/lib/db/users'

import type { UpdateUserInput } from '@/lib/db/users'
import type { NextRequest } from 'next/server'

// GET /api/users/[id] - 获取单个用户
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = createDb()
    const user = await getUserById(db, id)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/users/[id] - 更新用户
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = (await request.json()) as UpdateUserInput

    // 如果提供了 Email，验证格式
    if (body.email) {
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
    }

    const db = createDb()
    const user = await updateUser(db, id, body)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error updating user:', error)

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
        error: 'Failed to update user'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - 删除用户
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = createDb()
    const success = await deleteUser(db, id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user'
      },
      { status: 500 }
    )
  }
}
