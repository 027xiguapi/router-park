import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getInviterByCode, handleInviteReward } from '@/lib/db/invitations'

// POST - 验证并应用邀请码
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { inviteCode } = await request.json()
    
    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
    }
    
    const db = createDb()
    const userId = session.user.id
    
    // 检查用户是否已经使用过邀请码
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (user.invitedBy) {
      return NextResponse.json({ error: 'You have already used an invite code' }, { status: 400 })
    }
    
    // 获取邀请人
    const inviterId = await getInviterByCode(inviteCode)
    
    if (!inviterId) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 })
    }
    
    // 不能使用自己的邀请码
    if (inviterId === userId) {
      return NextResponse.json({ error: 'You cannot use your own invite code' }, { status: 400 })
    }
    
    // 更新被邀请人的 invitedBy 字段
    await db.update(users).set({ invitedBy: inviterId }).where(eq(users.id, userId))
    
    // 发放邀请奖励给邀请人
    await handleInviteReward(inviterId, userId)
    
    return NextResponse.json({ 
      success: true,
      message: 'Invite code applied successfully'
    })
  } catch (error) {
    console.error('Error verifying invite code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
