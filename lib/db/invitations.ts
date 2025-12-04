import { createDb } from '@/lib/db'
import { users, invitations, balanceTransactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// 生成唯一的邀请码
export function generateInviteCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 为新用户生成邀请码
export async function createInviteCodeForUser(userId: string): Promise<string> {
  const db = createDb()
  let inviteCode = generateInviteCode()
  
  // 确保邀请码唯一
  let attempts = 0
  while (attempts < 10) {
    const existing = await db.select().from(users).where(eq(users.inviteCode, inviteCode)).limit(1)
    if (existing.length === 0) {
      break
    }
    inviteCode = generateInviteCode()
    attempts++
  }
  
  // 更新用户的邀请码
  await db.update(users).set({ inviteCode }).where(eq(users.id, userId))
  
  return inviteCode
}

// 处理新用户注册奖励
export async function handleSignupBonus(userId: string): Promise<void> {
  const db = createDb()
  const signupBonus = 10000 // $100 = 10000 分
  
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) return
  
  const balanceBefore = user.balance
  const balanceAfter = balanceBefore + signupBonus
  
  // 更新用户余额
  await db.update(users).set({ balance: balanceAfter }).where(eq(users.id, userId))
  
  // 记录余额变动
  await db.insert(balanceTransactions).values({
    userId,
    amount: signupBonus,
    type: 'signup_bonus',
    description: '注册奖励',
    balanceBefore,
    balanceAfter
  })
}

// 处理邀请奖励
export async function handleInviteReward(inviterId: string, inviteeId: string): Promise<void> {
  const db = createDb()
  const inviteReward = 2000 // $20 = 2000 分
  
  // 获取邀请人信息
  const [inviter] = await db.select().from(users).where(eq(users.id, inviterId)).limit(1)
  if (!inviter) return
  
  const balanceBefore = inviter.balance
  const balanceAfter = balanceBefore + inviteReward
  
  // 更新邀请人余额和统计
  await db.update(users).set({
    balance: balanceAfter,
    totalEarned: inviter.totalEarned + inviteReward,
    inviteCount: inviter.inviteCount + 1
  }).where(eq(users.id, inviterId))
  
  // 创建邀请记录
  const [invitation] = await db.insert(invitations).values({
    inviterId,
    inviteeId,
    reward: inviteReward,
    status: 'completed'
  }).returning()
  
  // 记录余额变动
  await db.insert(balanceTransactions).values({
    userId: inviterId,
    amount: inviteReward,
    type: 'invite_reward',
    description: `邀请新用户奖励`,
    relatedId: invitation.id,
    balanceBefore,
    balanceAfter
  })
}

// 根据邀请码获取邀请人 ID
export async function getInviterByCode(inviteCode: string): Promise<string | null> {
  const db = createDb()
  const [user] = await db.select().from(users).where(eq(users.inviteCode, inviteCode)).limit(1)
  return user?.id || null
}

// 获取用户的邀请统计
export async function getUserInviteStats(userId: string) {
  const db = createDb()
  
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) return null
  
  const invitees = await db.select().from(invitations).where(eq(invitations.inviterId, userId))
  
  return {
    inviteCode: user.inviteCode,
    inviteCount: user.inviteCount,
    totalEarned: user.totalEarned,
    balance: user.balance,
    invitees
  }
}
