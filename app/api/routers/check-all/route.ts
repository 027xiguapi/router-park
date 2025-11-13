import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import { checkAllRoutersHealth } from '@/lib/db/routers'

// POST /api/routers/check-all - 检查所有路由器健康状态
export async function POST() {
  try {
    const db = createDb()
    const routers = await checkAllRoutersHealth(db)

    return NextResponse.json({
      success: true,
      data: routers,
      count: routers.length
    })
  } catch (error) {
    console.error('Error checking all routers health:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check routers health'
      },
      { status: 500 }
    )
  }
}
