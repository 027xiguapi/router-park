import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import {
  createVPN,
  getAllVPNs,
  getAllActiveVPNs,
  getFirstActiveVPN
} from '@/lib/db/vpns'

import type { CreateVPNInput } from '@/lib/db/vpns'
import type { NextRequest } from 'next/server'

// GET /api/vpns - 获取所有 VPN
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析查询参数
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const firstOnly = searchParams.get('firstOnly') === 'true'

    const db = createDb()

    if (firstOnly) {
      // 只获取第一个激活的 VPN（用于前端显示）
      const vpn = await getFirstActiveVPN(db)

      return NextResponse.json({
        success: true,
        data: vpn
      })
    } else if (activeOnly) {
      // 只获取激活的 VPN
      const vpnList = await getAllActiveVPNs(db)

      return NextResponse.json({
        success: true,
        data: vpnList
      })
    } else {
      // 获取所有 VPN（包括未激活的）
      const vpnList = await getAllVPNs(db)

      return NextResponse.json({
        success: true,
        data: vpnList
      })
    }
  } catch (error) {
    console.error('Error fetching VPNs:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch VPNs'
      },
      { status: 500 }
    )
  }
}

// POST /api/vpns - 创建新 VPN
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateVPNInput

    // 验证必填字段
    if (!body.name || !body.url || !body.subscriptionUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, URL and Subscription URL are required'
        },
        { status: 400 }
      )
    }

    // 验证 URL 格式
    try {
      new URL(body.url)
      new URL(body.subscriptionUrl)
      if (body.inviteLink) {
        new URL(body.inviteLink)
      }
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
    const vpn = await createVPN(db, body)

    return NextResponse.json(
      {
        success: true,
        data: vpn
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating VPN:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create VPN'
      },
      { status: 500 }
    )
  }
}
