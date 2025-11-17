import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import { getVPNById, updateVPN, deleteVPN } from '@/lib/db/vpns'

import type { UpdateVPNInput } from '@/lib/db/vpns'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = createDb()
    const vpn = await getVPNById(db, params.id)

    if (!vpn) {
      return NextResponse.json(
        {
          success: false,
          error: 'VPN not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: vpn
    })
  } catch (error) {
    console.error('Error fetching VPN:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch VPN'
      },
      { status: 500 }
    )
  }
}

// PUT /api/vpns/[id] - 更新 VPN
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as UpdateVPNInput

    // 验证 URL 格式（如果提供）
    if (body.url || body.subscriptionUrl || body.inviteLink) {
      try {
        if (body.url) new URL(body.url)
        if (body.subscriptionUrl) new URL(body.subscriptionUrl)
        if (body.inviteLink) new URL(body.inviteLink)
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

    const db = createDb()
    const vpn = await updateVPN(db, params.id, body)

    if (!vpn) {
      return NextResponse.json(
        {
          success: false,
          error: 'VPN not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: vpn
    })
  } catch (error) {
    console.error('Error updating VPN:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update VPN'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/vpns/[id] - 删除 VPN
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = createDb()
    const success = await deleteVPN(db, params.id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VPN not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'VPN deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting VPN:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete VPN'
      },
      { status: 500 }
    )
  }
}
