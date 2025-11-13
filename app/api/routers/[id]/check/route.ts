import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import { checkRouterHealth } from '@/lib/db/routers'

import type { NextRequest } from 'next/server'

// POST /api/routers/[id]/check - 检查单个路由器健康状态
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = createDb()
    const router = await checkRouterHealth(db, id)

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
    console.error('Error checking router health:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check router health'
      },
      { status: 500 }
    )
  }
}
