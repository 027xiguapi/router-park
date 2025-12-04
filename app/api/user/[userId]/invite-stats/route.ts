import { NextRequest, NextResponse } from 'next/server'
import {auth} from '@/lib/auth'
import { getUserInviteStats } from '@/lib/db/invitations'

// GET - 获取用户的邀请统计
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    const { userId } = await params
    
    if (!session?.user?.id || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const stats = await getUserInviteStats(userId)
    
    if (!stats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching invite stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
